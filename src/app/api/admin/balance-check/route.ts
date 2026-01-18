import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

/**
 * Admin API to analyze balance discrepancy for a user
 * GET /api/admin/balance-check?email=user@example.com
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
                balance: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Sum all credits (ROI + COMMISSION + DEPOSIT)
        const credits = await prisma.transaction.aggregate({
            where: {
                userId: user.id,
                type: { in: ['ROI', 'COMMISSION', 'DEPOSIT'] },
                status: 'COMPLETED'
            },
            _sum: { amount: true }
        });

        // Sum all debits (WITHDRAWAL)  
        const debits = await prisma.transaction.aggregate({
            where: {
                userId: user.id,
                type: 'WITHDRAWAL',
                status: 'COMPLETED'
            },
            _sum: { amount: true }
        });

        // Get earnings only (ROI + COMMISSION)
        const earnings = await prisma.transaction.aggregate({
            where: {
                userId: user.id,
                type: { in: ['ROI', 'COMMISSION'] },
                status: 'COMPLETED'
            },
            _sum: { amount: true }
        });

        // Get transaction counts by type
        const txCounts = await prisma.transaction.groupBy({
            by: ['type'],
            where: { userId: user.id, status: 'COMPLETED' },
            _count: true,
            _sum: { amount: true }
        });

        const totalCredits = Number(credits._sum?.amount || 0);
        const totalDebits = Math.abs(Number(debits._sum?.amount || 0));
        const totalEarnings = Number(earnings._sum?.amount || 0);
        const expectedBalance = totalCredits - totalDebits;
        const actualBalance = Number(user.balance);
        const discrepancy = actualBalance - expectedBalance;

        // Get recent transactions for debugging
        const recentTransactions = await prisma.transaction.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 30,
            select: {
                type: true,
                amount: true,
                previousBalance: true,
                newBalance: true,
                description: true,
                status: true,
                createdAt: true
            }
        });

        // Check for balance mismatches in transaction chain
        const balanceMismatches = recentTransactions.filter(tx => {
            const expectedChange = Number(tx.type === 'WITHDRAWAL' ? -Math.abs(Number(tx.amount)) : Number(tx.amount));
            const actualChange = Number(tx.newBalance) - Number(tx.previousBalance);
            return Math.abs(expectedChange - actualChange) > 0.001;
        });

        return NextResponse.json({
            user: {
                email: user.email,
                currentBalance: actualBalance.toFixed(4)
            },
            analysis: {
                totalCredits: totalCredits.toFixed(4),
                totalDebits: totalDebits.toFixed(4),
                totalEarnings: totalEarnings.toFixed(4),
                expectedBalance: expectedBalance.toFixed(4),
                actualBalance: actualBalance.toFixed(4),
                discrepancy: discrepancy.toFixed(4),
                hasDiscrepancy: Math.abs(discrepancy) > 0.01
            },
            transactionCounts: txCounts,
            recentTransactions: recentTransactions.map(tx => ({
                ...tx,
                amount: Number(tx.amount).toFixed(4),
                previousBalance: Number(tx.previousBalance).toFixed(4),
                newBalance: Number(tx.newBalance).toFixed(4)
            })),
            balanceMismatches: balanceMismatches.length > 0 ? balanceMismatches : "None found"
        });

    } catch (error) {
        console.error('[BALANCE_CHECK_ERROR]', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
