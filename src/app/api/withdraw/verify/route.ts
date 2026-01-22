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

        // Get user
        const user = await prisma.user.findUnique({
            where: { id: (session.user as any).id }
        });

        if (!user || Number(user.balance) < withdrawAmount) {
            return NextResponse.json({ error: "Insufficient balance for this withdrawal" }, { status: 400 });
        }

        // Check for existing pending
        const existingPending = await prisma.transaction.findFirst({
            where: {
                userId: user.id,
                type: "WITHDRAWAL",
                status: "PENDING"
            }
        });

        if (existingPending) {
            return NextResponse.json({
                error: "You already have a pending withdrawal. Please wait for admin approval."
            }, { status: 400 });
        }

        // Calculate fees
        const platformFee = (withdrawAmount * PLATFORM_FEE_PERCENT) / 100;
        const networkFee = 0.29;
        const netPayoutAmount = withdrawAmount - platformFee - networkFee;

        // ✅ CREATE PENDING REQUEST - DO NOT DEDUCT BALANCE YET
        const withdrawalTx = await prisma.transaction.create({
            data: {
                userId: user.id,
                type: "WITHDRAWAL",
                amount: netPayoutAmount, // NET amount admin should pay
                previousBalance: Number(user.balance),
                newBalance: Number(user.balance), // Balance unchanged until admin approval
                description: `Withdrawal request to ${walletAddress} (Original: $${withdrawAmount.toFixed(2)}, Fee: $${platformFee.toFixed(2)}, Network: $${networkFee.toFixed(2)})`,
                status: "PENDING",
                referenceId: walletAddress,
            }
        });

        return NextResponse.json({
            message: `OTP verified! Withdrawal request submitted. You will receive $${netPayoutAmount.toFixed(2)} after admin approval and fees.`,
            transactionId: withdrawalTx.id,
            netPayout: netPayoutAmount,
            platformFee: platformFee,
            note: "Your balance will be deducted only after admin approves this withdrawal."
        }, { status: 201 });

    } catch (error: any) {
        console.error("WITHDRAWAL_VERIFY_ERROR:", error);
        return NextResponse.json({
            error: error.message || "Internal server error"
        }, { status: 500 });
    }
}
