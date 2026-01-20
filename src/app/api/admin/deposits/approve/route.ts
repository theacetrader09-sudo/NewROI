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

                // 2. Update Investment Status to ACTIVE and mark as manually approved
                await tx.investment.update({
                    where: { id },
                    data: {
                        status: "ACTIVE",
                        approvalMethod: "MANUAL"
                    }
                });

                // ❌ REMOVED: Do NOT credit balance for package investments
                // Packages earn ROI over time - deposits themselves are not withdrawable
                // const prevBalance = investment.user.balance;
                // const newBalance = Number(prevBalance) + Number(investment.amount);
                // await tx.user.update({
                //     where: { id: investment.userId },
                //     data: { balance: newBalance }
                // });

                // 3. Log Transaction for tracking only (balance unchanged)
                await tx.transaction.create({
                    data: {
                        userId: investment.userId,
                        type: "DEPOSIT",
                        amount: Number(investment.amount),
                        previousBalance: Number(investment.user.balance),
                        newBalance: Number(investment.user.balance), // Balance unchanged
                        description: `Package of $${Number(investment.amount)} manually approved - 1% Daily ROI started`,
                        status: "COMPLETED",
                        referenceId: investment.id
                    }
                });

                return { amount: Number(investment.amount), user: investment.user.email };
            });

            return NextResponse.json({
                message: `✅ Package of $${result.amount.toFixed(2)} activated for ${result.user}. ROI will start crediting daily.`
            });
        }

    } catch (error: any) {
        console.error("ADMIN_APPROVE_ERROR:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
