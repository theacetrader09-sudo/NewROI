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

            // Parse original withdrawal amount from description
            const descMatch = transaction.description.match(/Original: \$(\d+\.?\d*)/);
            if (!descMatch) {
                throw new Error("Could not parse withdrawal amount");
            }

            const originalAmount = parseFloat(descMatch[1]);
            const platformFeeMatch = transaction.description.match(/Fee: \$(\d+\.?\d*)/);
            const platformFee = platformFeeMatch ? parseFloat(platformFeeMatch[1]) : 0;

            // Check user still has sufficient balance
            const user = await tx.user.findUnique({
                where: { id: transaction.userId }
            });

            if (!user || Number(user.balance) < originalAmount) {
                throw new Error("User no longer has sufficient balance");
            }

            // NOW DEDUCT BALANCE (balance was NOT deducted when requested)
            const updatedUser = await tx.user.update({
                where: { id: transaction.userId },
                data: { balance: { decrement: originalAmount } }
            });

            // Update withdrawal transaction to COMPLETED
            const updated = await tx.transaction.update({
                where: { id },
                data: {
                    status: "COMPLETED",
                    newBalance: Number(updatedUser.balance),
                    description: transaction.description + " (Approved by Admin)"
                }
            });

            // Create FEE transaction record for platform fee
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

            return updated;
        });

        return NextResponse.json({ message: "Withdrawal approved and balance deducted successfully" });

    } catch (error: any) {
        console.error("ADMIN_WITHDRAW_APPROVE_ERROR:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
