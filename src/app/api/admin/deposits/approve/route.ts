import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "SUPERADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, isTransaction } = await req.json();

        if (isTransaction) {
            // ========== APPROVE WALLET DEPOSIT (Transaction) ==========
            const result = await prisma.$transaction(async (tx) => {
                // 1. Find Transaction
                const transaction = await tx.transaction.findUnique({
                    where: { id },
                    include: { user: true }
                });

                if (!transaction || transaction.status !== "PENDING" || transaction.type !== "DEPOSIT") {
                    throw new Error("Invalid transaction or already processed");
                }

                // 2. Credit user's wallet balance
                const prevBalance = Number(transaction.user.balance);
                const amount = Number(transaction.amount);
                const newBalance = prevBalance + amount;

                await tx.user.update({
                    where: { id: transaction.userId },
                    data: { balance: newBalance }
                });

                // 3. Update transaction status to COMPLETED
                await tx.transaction.update({
                    where: { id },
                    data: {
                        status: "COMPLETED",
                        previousBalance: prevBalance,
                        newBalance: newBalance,
                        description: transaction.description.replace("Pending review", "Manually approved by admin")
                    }
                });

                return { amount, user: transaction.user.email };
            });

            return NextResponse.json({
                message: `✅ Wallet deposit of $${result.amount.toFixed(2)} approved and credited to ${result.user}`
            });

        } else {
            // ========== APPROVE PACKAGE INVESTMENT ==========
            const result = await prisma.$transaction(async (tx) => {
                // 1. Find Investment & User
                const investment = await tx.investment.findUnique({
                    where: { id },
                    include: { user: true }
                });

                if (!investment || investment.status !== "PENDING") {
                    throw new Error("Invalid investment or already processed");
                }

                const depositAmount = Number(investment.amount);

                // 2. ── TIERED ROI RATE ──────────────────────────────────────────
                // Tier 1:  $35–$999        → 1%/day
                // Tier 2:  $1,000–$5,999   → 1.5%/day
                // Package 1: $35–$4,999 → 0.5%/day
                // Package 2: $5,000–$200,000 → 1%/day
                let roiRate: number;
                let tierLabel: string;

                if (depositAmount >= 5000) {
                    roiRate = 1.00;
                    tierLabel = "Package 2 (1%/day)";
                } else {
                    roiRate = 0.50;
                    tierLabel = "Package 1 (0.5%/day)";
                }

                // 3. Update Investment: ACTIVE + correct roiRate stamped
                await tx.investment.update({
                    where: { id },
                    data: {
                        status: "ACTIVE",
                        approvalMethod: "MANUAL",
                        roiRate: roiRate   // ← this is what roi.ts reads each day
                    }
                });

                // 4. Log Transaction for tracking (balance unchanged — ROI drips daily)
                await tx.transaction.create({
                    data: {
                        userId: investment.userId,
                        type: "DEPOSIT",
                        amount: depositAmount,
                        previousBalance: Number(investment.user.balance),
                        newBalance: Number(investment.user.balance),
                        description: `Package of $${depositAmount} approved — ${tierLabel} Daily ROI started`,
                        status: "COMPLETED",
                        referenceId: investment.id
                    }
                });

                return { amount: depositAmount, user: investment.user.email, tier: tierLabel, roiRate };
            });

            return NextResponse.json({
                message: `✅ Package of $${result.amount.toFixed(2)} activated for ${result.user}. ROI Rate: ${result.roiRate}%/day (${result.tier}). Earnings start tomorrow.`
            });
        }

    } catch (error: any) {
        console.error("ADMIN_APPROVE_ERROR:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
