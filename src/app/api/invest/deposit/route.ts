import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { isValidTxHash } from "@/lib/bscscan";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { amount, txid, depositMode, paymentMethod } = await req.json();

        // depositMode: "wallet" = add to balance only, "package" = create investment for ROI
        // paymentMethod: "usdt" = external USDT transfer, "wallet_balance" = use existing wallet balance

        if (!amount) {
            return NextResponse.json({ error: "Missing amount" }, { status: 400 });
        }

        // Parse amount to float
        const depositAmount = parseFloat(amount);
        if (isNaN(depositAmount) || depositAmount <= 0) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        // Minimum deposit validation
        if (depositAmount < 2) {
            return NextResponse.json({ error: "Minimum amount is $2" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: (session.user as any).id }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // ========== WALLET BALANCE PAYMENT METHOD ==========
        if (paymentMethod === 'wallet_balance') {
            // Validate user has enough balance
            if (Number(user.balance) < depositAmount) {
                return NextResponse.json({
                    error: `Insufficient balance. You have $${Number(user.balance).toFixed(2)}, need $${depositAmount.toFixed(2)}`
                }, { status: 400 });
            }

            // This should only be used for package activation
            if (depositMode !== 'package') {
                return NextResponse.json({
                    error: "Wallet balance can only be used for package activation"
                }, { status: 400 });
            }

            // Create ACTIVE investment from wallet balance
            const investment = await prisma.investment.create({
                data: {
                    userId: user.id,
                    amount: depositAmount,
                    txid: `WALLET-${Date.now()}-${user.id.substring(0, 8)}`, // Internal reference
                    status: "ACTIVE",
                    roiRate: 1.0, // 1% daily ROI
                    approvalMethod: "WALLET",
                }
            });

            // Deduct from wallet balance (money moves from wallet to active investment)
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    balance: { decrement: depositAmount }
                }
            });

            // Create transaction record
            await prisma.transaction.create({
                data: {
                    userId: user.id,
                    type: "INVESTMENT",
                    amount: depositAmount,
                    description: `Package activated from wallet balance - 1% Daily ROI started`,
                    status: "COMPLETED",
                    previousBalance: Number(user.balance),
                    newBalance: Number(user.balance) - depositAmount
                }
            });

            return NextResponse.json({
                message: "✅ Package activated from wallet! 1% daily ROI has started.",
                investmentId: investment.id,
                verified: true,
                amount: depositAmount,
                mode: "package",
                paymentMethod: "wallet_balance"
            }, { status: 201 });
        }

        // ========== USDT EXTERNAL PAYMENT METHOD ==========
        // Validate TXID for external payments
        if (!txid) {
            return NextResponse.json({ error: "Missing TXID for external payment" }, { status: 400 });
        }

        if (!isValidTxHash(txid)) {
            return NextResponse.json({
                error: "Invalid transaction hash format. Must be a valid BSC transaction hash (0x...)"
            }, { status: 400 });
        }

        // Check if TXID already exists (fraud prevention)
        const existingTx = await prisma.investment.findFirst({
            where: { txid: txid }
        });

        if (existingTx) {
            return NextResponse.json({ error: "This TXID has already been submitted" }, { status: 400 });
        }

        // Also check in transactions table
        const existingTransaction = await prisma.transaction.findFirst({
            where: {
                description: { contains: txid.substring(0, 20) }
            }
        });

        if (existingTransaction) {
            return NextResponse.json({ error: "This TXID has already been used" }, { status: 400 });
        }

        // All deposits now go through manual approval
        // No automatic verification - admin will approve after notification

        if (depositMode === "wallet") {
            // === WALLET MODE: Just add to balance after manual approval ===

            // Create pending transaction record
            await prisma.transaction.create({
                data: {
                    userId: user.id,
                    type: "DEPOSIT",
                    amount: depositAmount,
                    description: `Wallet deposit - Pending approval (TXID: ${txid.substring(0, 15)}...)`,
                    status: "PENDING",
                    previousBalance: Number(user.balance),
                    newBalance: Number(user.balance)
                }
            });

            return NextResponse.json({
                message: "⏳ Deposit submitted for manual review. Will be added to wallet after approval.",
                verified: false,
                amount: depositAmount,
                mode: "wallet"
            }, { status: 201 });

        } else {
            // === PACKAGE MODE: Create investment pending approval ===

            const investment = await prisma.investment.create({
                data: {
                    userId: user.id,
                    amount: depositAmount,
                    txid: txid,
                    status: "PENDING", // Always pending - requires manual approval
                    roiRate: 1.0,
                }
            });

            return NextResponse.json({
                message: "⏳ Package submitted. ROI will start after admin approval.",
                investmentId: investment.id,
                verified: false,
                mode: "package"
            }, { status: 201 });
        }

    } catch (error: any) {
        console.error("DEPOSIT_ERROR:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
