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

        const { id } = await req.json();

        const result = await prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.findUnique({
                where: { id },
                include: { user: true }
            });

            if (!transaction || transaction.status !== "PENDING" || transaction.type !== "WITHDRAWAL") {
                throw new Error("Invalid transaction or already processed");
            }

            // ─── Fee constants (must match withdraw routes) ───
            const PLATFORM_FEE_PERCENT = 5;    // 5%
            const NETWORK_FEE_PERCENT = 0.20;  // 0.20%

            // tx.amount = ORIGINAL requested amount (stored since latest fix)
            const originalAmount = Number(transaction.amount);
            const platformFee = (originalAmount * PLATFORM_FEE_PERCENT) / 100;
            const networkFee = (originalAmount * NETWORK_FEE_PERCENT) / 100;
            const netPayout = originalAmount - platformFee - networkFee;

            // Check user still has sufficient balance
            const user = await tx.user.findUnique({
                where: { id: transaction.userId }
            });

            if (!user || Number(user.balance) < originalAmount) {
                throw new Error("User no longer has sufficient balance");
            }

            // Deduct the ORIGINAL (gross) amount from user balance
            const updatedUser = await tx.user.update({
                where: { id: transaction.userId },
                data: { balance: { decrement: originalAmount } }
            });

            // Mark withdrawal as COMPLETED
            const updated = await tx.transaction.update({
                where: { id },
                data: {
                    status: "COMPLETED",
                    newBalance: Number(updatedUser.balance),
                    description: transaction.description + " (Approved by Admin)"
                }
            });

            // Record platform fee
            if (platformFee > 0) {
                await tx.transaction.create({
                    data: {
                        userId: transaction.userId,
                        type: "FEE",
                        amount: platformFee,
                        previousBalance: Number(updatedUser.balance),
                        newBalance: Number(updatedUser.balance),
                        description: `Platform fee (5%) for withdrawal #${id}`,
                        status: "COMPLETED"
                    }
                });
            }

            // Record network fee
            if (networkFee > 0) {
                await tx.transaction.create({
                    data: {
                        userId: transaction.userId,
                        type: "FEE",
                        amount: networkFee,
                        previousBalance: Number(updatedUser.balance),
                        newBalance: Number(updatedUser.balance),
                        description: `Network fee (0.20%) for withdrawal #${id}`,
                        status: "COMPLETED"
                    }
                });
            }

            return { updated, originalAmount, platformFee, networkFee, netPayout };
        });

        return NextResponse.json({
            message: `Withdrawal approved. User balance deducted $${(result as any).originalAmount.toFixed(2)}. Admin should send $${(result as any).netPayout.toFixed(2)} to user.`
        });

    } catch (error: any) {
        console.error("ADMIN_WITHDRAW_APPROVE_ERROR:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
