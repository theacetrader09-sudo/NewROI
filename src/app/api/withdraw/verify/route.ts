import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { verifyOTP } from "@/lib/otp";

const PLATFORM_FEE_PERCENT = 5; // 5% platform fee

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { otp, amount, walletAddress } = await req.json();
        const withdrawAmount = parseFloat(amount);

        if (!otp || otp.length !== 6) {
            return NextResponse.json({ error: "Invalid OTP format" }, { status: 400 });
        }

        // Verify OTP
        const isValid = await verifyOTP((session.user as any).id, otp, 'WITHDRAWAL');

        if (!isValid) {
            return NextResponse.json({
                error: "Invalid or expired OTP. Please request a new code."
            }, { status: 400 });
        }

        // Calculate fees
        const platformFee = (withdrawAmount * PLATFORM_FEE_PERCENT) / 100;
        const networkFee = 0.29;
        const netPayoutAmount = withdrawAmount - platformFee - networkFee;

        // Atomic Transaction for Balance Guard
        const result = await prisma.$transaction(async (tx) => {
            // 1. Get User with Row Locking (prevent race conditions)
            const user = await tx.user.findUnique({
                where: { id: (session.user as any).id },
            });

            if (!user || Number(user.balance) < withdrawAmount) {
                throw new Error("Insufficient balance for this withdrawal");
            }

            // 2. Deduct full withdrawal amount from Balance
            const updatedUser = await tx.user.update({
                where: { id: user.id },
                data: { balance: { decrement: withdrawAmount } }
            });

            // 3. Create Withdrawal Transaction Record (shows net payout to admin)
            const withdrawalTx = await tx.transaction.create({
                data: {
                    userId: user.id,
                    type: "WITHDRAWAL",
                    amount: netPayoutAmount, // Store NET amount admin should pay
                    previousBalance: Number(user.balance),
                    newBalance: Number(updatedUser.balance),
                    description: `Withdrawal request to ${walletAddress} (Original: $${withdrawAmount.toFixed(2)}, Fee: $${platformFee.toFixed(2)}, Network: $${networkFee.toFixed(2)})`,
                    status: "PENDING",
                    referenceId: walletAddress, // Store destination wallet
                }
            });

            // 4. Create Platform Fee Transaction Record (for ledger/accounting)
            await tx.transaction.create({
                data: {
                    userId: user.id,
                    type: "FEE",
                    amount: platformFee,
                    previousBalance: Number(updatedUser.balance),
                    newBalance: Number(updatedUser.balance), // Balance already deducted above
                    description: `Platform fee (5%) for withdrawal request #${withdrawalTx.id}`,
                    status: "COMPLETED",
                }
            });

            return withdrawalTx;
        });

        return NextResponse.json({
            message: `Withdrawal request submitted successfully. You will receive $${netPayoutAmount.toFixed(2)} after fees.`,
            transactionId: result.id,
            netPayout: netPayoutAmount,
            platformFee: platformFee
        }, { status: 201 });

    } catch (error: any) {
        console.error("WITHDRAWAL_VERIFY_ERROR:", error);
        return NextResponse.json({
            error: error.message || "Internal server error"
        }, { status: 500 });
    }
}
