import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

/**
 * Admin API to get detailed breakdown of user finances
 * GET /api/admin/balance-breakdown?email=user@example.com
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

        // Find the user
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                balance: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get ALL transactions for this user (not just completed)
        const allTransactions = await prisma.transaction.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                type: true,
                amount: true,
                previousBalance: true,
                newBalance: true,
                description: true,
                status: true,
                createdAt: true
            }
        });

        // Group by type and status
        const breakdown: Record<string, { count: number; total: number; statuses: Record<string, number> }> = {};

        for (const tx of allTransactions) {
            const key = tx.type;
            if (!breakdown[key]) {
                breakdown[key] = { count: 0, total: 0, statuses: {} };
            }
            breakdown[key].count++;
            breakdown[key].total += Math.abs(Number(tx.amount));

            const status = tx.status || 'UNKNOWN';
            breakdown[key].statuses[status] = (breakdown[key].statuses[status] || 0) + 1;
        }

        // Calculate what the balance SHOULD be based on transaction chain
        // Start from 0 and apply each transaction in order
        const txsChronological = [...allTransactions].reverse();
        let calculatedBalance = 0;
        const balanceIssues: any[] = [];

        for (const tx of txsChronological) {
            if (tx.status !== 'COMPLETED') continue;

            const amount = Number(tx.amount);
            const prevBal = Number(tx.previousBalance);
            const newBal = Number(tx.newBalance);

            // Check if previousBalance matches our calculated balance
            if (Math.abs(calculatedBalance - prevBal) > 0.01) {
                balanceIssues.push({
                    txId: tx.id,
                    type: tx.type,
                    description: tx.description,
                    date: tx.createdAt,
                    expectedPrevBalance: calculatedBalance.toFixed(4),
                    actualPrevBalance: prevBal.toFixed(4),
                    gap: (prevBal - calculatedBalance).toFixed(4)
                });
            }

            // Update our calculated balance to match what transaction says
            calculatedBalance = newBal;
        }

        // Sum earnings (ROI + COMMISSION) - what shows as Total Income
        const earnings = allTransactions
            .filter(tx => tx.status === 'COMPLETED' && (tx.type === 'ROI' || tx.type === 'COMMISSION'))
            .reduce((sum, tx) => sum + Number(tx.amount), 0);

        // Sum withdrawals - what reduced the balance
        const withdrawals = allTransactions
            .filter(tx => tx.status === 'COMPLETED' && tx.type === 'WITHDRAWAL')
            .reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0);

        return NextResponse.json({
            user: {
                email: user.email,
                name: user.name,
                currentBalance: Number(user.balance).toFixed(4)
            },
            summary: {
                totalEarnings: earnings.toFixed(4),
                totalWithdrawals: withdrawals.toFixed(4),
                expectedBalanceFromEarnings: (earnings - withdrawals).toFixed(4),
                actualBalance: Number(user.balance).toFixed(4),
                discrepancyExplanation: `Total Income ($${earnings.toFixed(2)}) - Withdrawals ($${withdrawals.toFixed(2)}) = $${(earnings - withdrawals).toFixed(2)} expected, but actual is $${Number(user.balance).toFixed(2)}`
            },
            transactionBreakdown: breakdown,
            balanceChainIssues: balanceIssues.length > 0 ? balanceIssues : "No issues found in transaction chain",
            totalTransactions: allTransactions.length
        });

    } catch (error) {
        console.error('[BALANCE_BREAKDOWN_ERROR]', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
