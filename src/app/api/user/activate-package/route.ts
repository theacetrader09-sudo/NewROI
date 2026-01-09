import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Level Commission Config
const LEVEL_COMMISSIONS = [0.06, 0.05, 0.02, 0.02, 0.01, 0.01, 0.005, 0.005, 0.0025, 0.001];
const MIN_ACTIVATION_AMOUNT = 100;

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { amount } = await req.json();

        // Validate amount
        if (!amount || amount < MIN_ACTIVATION_AMOUNT) {
            return NextResponse.json({
                error: `Minimum activation amount is $${MIN_ACTIVATION_AMOUNT}`
            }, { status: 400 });
        }

        // Execute activation in transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Get user with current balance
            const user = await tx.user.findUnique({
                where: { email: session.user!.email! },
                select: {
                    id: true,
                    email: true,
                    balance: true,
                    uplineId: true,
                },
            });

            if (!user) {
                throw new Error("User not found");
            }

            const userBalance = Number(user.balance);
            const activationAmount = Number(amount);

            // 2. Check sufficient balance
            if (userBalance < activationAmount) {
                throw new Error("Insufficient balance");
            }

            // 3. Create Active Investment
            const investment = await tx.investment.create({
                data: {
                    userId: user.id,
                    amount: activationAmount,
                    roiRate: 1.0, // 1% daily
                    status: "ACTIVE",
                },
            });

            // 4. Deduct from user balance
            const prevBalance = userBalance;
            const newBalance = userBalance - activationAmount;

            await tx.user.update({
                where: { id: user.id },
                data: { balance: newBalance },
            });

            // 5. Log transaction
            await tx.transaction.create({
                data: {
                    userId: user.id,
                    type: "DEPOSIT", // Using DEPOSIT type for investment activation
                    amount: activationAmount,
                    previousBalance: prevBalance,
                    newBalance: newBalance,
                    description: `Package activated: $${activationAmount} investment`,
                    status: "COMPLETED",
                    referenceId: investment.id,
                },
            });

            // NOTE: Commissions are now distributed on daily ROI, not on activation
            // This creates recurring income for uplines instead of one-time payment

            return {
                investment,
                newBalance,
            };
        });

        return NextResponse.json({
            message: "Package activated successfully!",
            investment: result.investment,
            newBalance: result.newBalance,
        });

    } catch (error: any) {
        console.error("ACTIVATION_ERROR:", error);
        return NextResponse.json({
            error: error.message || "Failed to activate package"
        }, { status: 500 });
    }
}
