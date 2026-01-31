import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type"); // Optional filter: DEPOSIT, ROI, COMMISSION, WITHDRAWAL
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const offset = (page - 1) * limit;

        // Date filtering parameters
        const dateFilter = searchParams.get("dateFilter"); // today, yesterday, 7days, month
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        // Build date filter conditions
        let dateCondition: any = {};
        const now = new Date();

        if (dateFilter === "today") {
            const start = new Date(now);
            start.setHours(0, 0, 0, 0);
            const end = new Date(now);
            end.setHours(23, 59, 59, 999);
            dateCondition = { createdAt: { gte: start, lte: end } };
        } else if (dateFilter === "yesterday") {
            const start = new Date(now);
            start.setDate(start.getDate() - 1);
            start.setHours(0, 0, 0, 0);
            const end = new Date(now);
            end.setDate(end.getDate() - 1);
            end.setHours(23, 59, 59, 999);
            dateCondition = { createdAt: { gte: start, lte: end } };
        } else if (dateFilter === "7days") {
            const start = new Date(now);
            start.setDate(start.getDate() - 7);
            start.setHours(0, 0, 0, 0);
            dateCondition = { createdAt: { gte: start } };
        } else if (dateFilter === "month") {
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            start.setHours(0, 0, 0, 0);
            dateCondition = { createdAt: { gte: start } };
        } else if (startDate && endDate) {
            // Custom date range
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateCondition = { createdAt: { gte: start, lte: end } };
        } else if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            dateCondition = { createdAt: { gte: start } };
        } else if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateCondition = { createdAt: { lte: end } };
        }

        // Build where clause
        const whereClause = {
            userId: (session.user as any).id,
            ...(type && { type: type as any }),
            type: { not: "FEE" }, // Hide FEE transactions from user view
            ...dateCondition
        };

        // Get total count for pagination
        const totalCount = await prisma.transaction.count({
            where: whereClause
        });

        const transactions = await prisma.transaction.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: offset,
        });

        // Map transactions to include displayAmount for proper withdrawal display
        // For withdrawals, we show the amount user requested, not the fee-deducted amount
        const mappedTransactions = transactions.map(tx => {
            if (tx.type === 'WITHDRAWAL') {
                // Reverse engineer the original requested amount
                // Formula: net = requested - (requested * 0.05) - 0.29
                // Simplify: net = requested * 0.95 - 0.29
                // Solve: requested = (net + 0.29) / 0.95
                const netAmount = Number(tx.amount);
                const originalAmount = (netAmount + 0.29) / 0.95;
                
                return {
                    ...tx,
                    amount: tx.amount,
                    displayAmount: originalAmount, // What user requested
                    netAmount: netAmount // What they'll receive (for reference)
                };
            }
            
            // For all other transaction types, displayAmount = amount
            return {
                ...tx,
                amount: tx.amount,
                displayAmount: Number(tx.amount),
                netAmount: Number(tx.amount)
            };
        });

        const totalPages = Math.ceil(totalCount / limit);
        const hasMore = page * limit < totalCount;

        return NextResponse.json({
            transactions: mappedTransactions,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasMore,
                hasPrevious: page > 1
            }
        });

    } catch (error) {
        console.error("TRANSACTIONS_API_ERROR:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
