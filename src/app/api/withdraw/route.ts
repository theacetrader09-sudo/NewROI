import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const MIN_WITHDRAWAL = 20;

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { amount, walletAddress } = await req.json();
        const withdrawAmount = parseFloat(amount);

        if (isNaN(withdrawAmount) || withdrawAmount < MIN_WITHDRAWAL) {
            return NextResponse.json({ error: `Minimum withdrawal is $${MIN_WITHDRAWAL}` }, { status: 400 });
        }

        if (!walletAddress) {
            return NextResponse.json({ error: "Receiving wallet address is required" }, { status: 400 });
        }

        // Atomic Transaction for Balance Guard
        const result = await prisma.$transaction(async (tx) => {
            // 1. Get User with Row Locking (prevent race conditions)
            const user = await tx.user.findUnique({
                where: { id: (session.user as any).id },
            });

            if (!user || Number(user.balance) < withdrawAmount) {
                throw new Error("Insufficient balance for this withdrawal");
            }

            // 2. Deduct from Balance (Pending state)
            const updatedUser = await tx.user.update({
                where: { id: user.id },
                data: { balance: { decrement: withdrawAmount } }
            });

            // 3. Create Transaction Record
            return await tx.transaction.create({
                data: {
                    userId: user.id,
                    type: "WITHDRAWAL",
                    amount: withdrawAmount,
                    previousBalance: Number(user.balance),
                    newBalance: Number(updatedUser.balance),
                    description: `Withdrawal request to ${walletAddress}`,
                    status: "PENDING",
                    referenceId: walletAddress, // Store destination temporarily
                }
            });
        });

        return NextResponse.json({
            message: "Withdrawal request submitted for approval.",
            transactionId: result.id
        }, { status: 201 });

    } catch (error: any) {
        console.error("WITHDRAWAL_ERROR:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
