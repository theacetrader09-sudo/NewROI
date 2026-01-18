import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

/**
 * Admin API to trace exactly where a balance discrepancy started
 * GET /api/admin/balance-trace?email=user@example.com
 */
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userRole = (session?.user as any)?.role;

        if (!session || (userRole !== "ADMIN" && userRole !== "SUPERADMIN")) {
            return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ error: "Email parameter required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, balance: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get ALL transactions in chronological order
        const allTransactions = await prisma.transaction.findMany({
            where: { userId: user.id, status: 'COMPLETED' },
            orderBy: { createdAt: 'asc' },
            select: {
                id: true,
                type: true,
                amount: true,
                previousBalance: true,
                newBalance: true,
                description: true,
                createdAt: true
            }
        });

        // Trace the balance chain and find where discrepancy started
        let runningBalance = 0;
        let firstDiscrepancy: any = null;
        const trace: any[] = [];

        for (let i = 0; i < allTransactions.length; i++) {
            const tx = allTransactions[i];
            const amount = Number(tx.amount);
            const prevBal = Number(tx.previousBalance);
            const newBal = Number(tx.newBalance);

            // Check if this transaction's previousBalance matches our running balance
            const gap = prevBal - runningBalance;
            const hasGap = Math.abs(gap) > 0.001;

            const entry = {
                index: i + 1,
                date: tx.createdAt,
                type: tx.type,
                amount: amount.toFixed(4),
                expectedPrevBal: runningBalance.toFixed(4),
                actualPrevBal: prevBal.toFixed(4),
                gap: hasGap ? gap.toFixed(4) : "0",
                newBalance: newBal.toFixed(4),
                description: tx.description?.substring(0, 50)
            };

            trace.push(entry);

            // Record the FIRST transaction where a gap appears
            if (hasGap && !firstDiscrepancy) {
                firstDiscrepancy = {
                    ...entry,
                    previousTransaction: i > 0 ? {
                        type: allTransactions[i - 1].type,
                        newBalance: Number(allTransactions[i - 1].newBalance).toFixed(4),
                        date: allTransactions[i - 1].createdAt
                    } : null,
                    explanation: `Balance jumped from expected $${runningBalance.toFixed(2)} to recorded $${prevBal.toFixed(2)} (${gap > 0 ? '+' : ''}$${gap.toFixed(2)}) without a transaction`
                };
            }

            // Use the transaction's newBalance as our running balance going forward
            runningBalance = newBal;
        }

        return NextResponse.json({
            user: { email: user.email, currentBalance: Number(user.balance).toFixed(4) },
            totalTransactions: allTransactions.length,
            firstDiscrepancy: firstDiscrepancy || "No discrepancy found",
            // Show last 10 transactions for context
            recentTrace: trace.slice(-20),
            // Show the first 10 where gap started  
            earlyTrace: firstDiscrepancy ? trace.slice(Math.max(0, firstDiscrepancy.index - 3), firstDiscrepancy.index + 3) : null
        });

    } catch (error) {
        console.error('[BALANCE_TRACE_ERROR]', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
