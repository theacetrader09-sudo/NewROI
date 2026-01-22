import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const MIN_WITHDRAWAL = 20;
const PLATFORM_FEE_PERCENT = 5; // 5% platform fee

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

        const user = await prisma.user.findUnique({
            where: { id: (session.user as any).id }
        });

        if (!user || Number(user.balance) < withdrawAmount) {
            return NextResponse.json({ error: "Insufficient balance for this withdrawal" }, { status: 400 });
        }

        // ❌ PREVENT MULTIPLE PENDING WITHDRAWALS
        const existingPending = await prisma.transaction.findFirst({
            where: {
                userId: user.id,
                type: "WITHDRAWAL",
                status: "PENDING"
            }
        });

        if (existingPending) {
            return NextResponse.json({
                error: "You already have a pending withdrawal. Please wait for admin approval before requesting another withdrawal."
            }, { status: 400 });
        }

        // Calculate fees
        const platformFee = (withdrawAmount * PLATFORM_FEE_PERCENT) / 100;
        const networkFee = 0.29;
        const netPayoutAmount = withdrawAmount - platformFee - networkFee;

        // ✅ CREATE PENDING REQUEST WITHOUT DEDUCTING BALANCE
        const withdrawalTx = await prisma.transaction.create({
            data: {
                userId: user.id,
                type: "WITHDRAWAL",
                amount: netPayoutAmount, // NET amount admin should pay
                previousBalance: Number(user.balance),
                newBalance: Number(user.balance), // Balance NOT changed yet
                description: `Withdraw requested - ${user.email}`,
                status: "PENDING",
                referenceId: walletAddress, // Store destination wallet
            }
        });

        // ✅ STORE ORIGINAL AMOUNT IN DESCRIPTION FOR LATER DEDUCTION
        // When admin approves, they'll deduct the FULL withdrawAmount (not net amount)

        return NextResponse.json({
            message: `Withdrawal request submitted. Balance will be deducted after admin approval. You will receive $${netPayoutAmount.toFixed(2)} after fees.`,
            transactionId: withdrawalTx.id,
            netPayout: netPayoutAmount,
            platformFee: platformFee,
            note: "Your balance will remain unchanged until admin approves this withdrawal."
        }, { status: 201 });

    } catch (error: any) {
        console.error("WITHDRAWAL_ERROR:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
