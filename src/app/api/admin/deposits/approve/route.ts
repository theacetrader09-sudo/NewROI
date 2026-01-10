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

        // Start Transaction to ensure ledger integrity
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
            const updatedInvestment = await tx.investment.update({
                where: { id },
                data: {
                    status: "ACTIVE",
                    approvalMethod: "MANUAL"
                }
            });

            // 3. Credit User's Wallet Balance
            const prevBalance = investment.user.balance;
            const newBalance = Number(prevBalance) + Number(investment.amount);

            await tx.user.update({
                where: { id: investment.userId },
                data: { balance: newBalance }
            });

            // 4. Log Deposit Transaction
            await tx.transaction.create({
                data: {
                    userId: investment.userId,
                    type: "DEPOSIT",
                    amount: Number(investment.amount),
                    previousBalance: Number(prevBalance),
                    newBalance: newBalance,
                    description: `Deposit of $${Number(investment.amount)} approved. Credited to wallet.`,
                    status: "COMPLETED",
                    referenceId: investment.id
                }
            });

            return updatedInvestment;
        });

        return NextResponse.json({ message: "Deposit approved and wallet credited" });

    } catch (error: any) {
        console.error("ADMIN_APPROVE_ERROR:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
