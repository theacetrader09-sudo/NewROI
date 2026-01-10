import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { verifyTransaction, isValidTxHash } from "@/lib/bscscan";

// Deposit Address - must match frontend
const DEPOSIT_ADDRESS = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { amount, txid } = await req.json();

        if (!amount || !txid) {
            return NextResponse.json({ error: "Missing amount or TXID" }, { status: 400 });
        }

        // Parse amount to float (ensuring precision for calculation)
        const depositAmount = parseFloat(amount);
        if (isNaN(depositAmount) || depositAmount <= 0) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        // Validate TXID format
        if (!isValidTxHash(txid)) {
            return NextResponse.json({
                error: "Invalid transaction hash format. Must be a valid BSC transaction hash (0x...)"
            }, { status: 400 });
        }

        // Check if TXID already exists (Basic fraud prevention)
        const existingTx = await prisma.investment.findFirst({
            where: { txid: txid }
        });

        if (existingTx) {
            return NextResponse.json({ error: "This TXID has already been submitted" }, { status: 400 });
        }

        // AUTO-VERIFICATION: Verify transaction on blockchain
        const verification = await verifyTransaction(txid, DEPOSIT_ADDRESS, depositAmount);

        if (verification.valid) {
            // Transaction verified! Auto-approve deposit
            const user = await prisma.user.findUnique({
                where: { id: (session.user as any).id }
            });

            if (!user) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }

            // Create ACTIVE investment (auto-approved)
            const investment = await prisma.investment.create({
                data: {
                    userId: user.id,
                    amount: verification.amount || depositAmount,
                    txid: txid,
                    status: "ACTIVE",
                    roiRate: 1.0,
                    approvalMethod: "AUTO",
                }
            });

            // Update user balance
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    balance: { increment: verification.amount || depositAmount }
                }
            });

            // Create transaction record
            await prisma.transaction.create({
                data: {
                    userId: user.id,
                    type: "DEPOSIT",
                    amount: verification.amount || depositAmount,
                    description: `Auto-verified deposit (TXID: ${txid.substring(0, 10)}...)`,
                    status: "COMPLETED",
                    previousBalance: Number(user.balance),
                    newBalance: Number(user.balance) + (verification.amount || depositAmount)
                }
            });

            return NextResponse.json({
                message: "✅ Deposit verified and approved automatically!",
                investmentId: investment.id,
                verified: true,
                amount: verification.amount
            }, { status: 201 });

        } else {
            // Verification failed or not configured - create PENDING for manual review
            const investment = await prisma.investment.create({
                data: {
                    userId: (session.user as any).id,
                    amount: depositAmount,
                    txid: txid,
                    status: "PENDING",
                    roiRate: 1.0,
                }
            });

            // Return with verification issue (but still submitted for manual review)
            return NextResponse.json({
                message: verification.error
                    ? `⏳ Deposit submitted for manual review. Auto-verification issue: ${verification.error}`
                    : "⏳ Deposit submitted. Waiting for admin approval.",
                investmentId: investment.id,
                verified: false,
                reason: verification.error
            }, { status: 201 });
        }

    } catch (error: any) {
        console.error("DEPOSIT_ERROR:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
