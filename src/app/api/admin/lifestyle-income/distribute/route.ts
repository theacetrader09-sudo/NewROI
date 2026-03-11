import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { LIFESTYLE_PAYOUT } from "@/lib/bv";

export async function POST() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "SUPERADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get all lifetime-qualified users
        const qualifiedUsers = await prisma.user.findMany({
            where: { lifestyleQualified: true },
            select: { id: true, name: true, email: true, balance: true },
        });

        if (qualifiedUsers.length === 0) {
            return NextResponse.json({
                message: "No qualified users found. No payouts made.",
                count: 0,
            });
        }

        // Check how many already received lifestyle income THIS calendar month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const alreadyPaid = await prisma.transaction.findMany({
            where: {
                type: "LIFESTYLE_INCOME",
                status: "COMPLETED",
                createdAt: { gte: startOfMonth, lte: endOfMonth },
            },
            select: { userId: true },
        });

        const alreadyPaidIds = new Set(alreadyPaid.map((t) => t.userId));
        const unpaidUsers = qualifiedUsers.filter((u) => !alreadyPaidIds.has(u.id));

        if (unpaidUsers.length === 0) {
            return NextResponse.json({
                message: "All qualified users have already received their lifestyle income this month.",
                count: 0,
            });
        }

        // Distribute $2,800 to each unpaid qualified user
        let successCount = 0;
        const errors: string[] = [];

        for (const user of unpaidUsers) {
            try {
                await prisma.$transaction(async (tx) => {
                    const prevBalance = Number(user.balance);
                    const newBalance = prevBalance + LIFESTYLE_PAYOUT;

                    await tx.user.update({
                        where: { id: user.id },
                        data: { balance: newBalance },
                    });

                    await tx.transaction.create({
                        data: {
                            userId: user.id,
                            type: "LIFESTYLE_INCOME",
                            amount: LIFESTYLE_PAYOUT,
                            previousBalance: prevBalance,
                            newBalance: newBalance,
                            description: `Monthly Lifestyle Income — $${LIFESTYLE_PAYOUT} (Lifetime Qualified)`,
                            status: "COMPLETED",
                        },
                    });
                });
                successCount++;
            } catch (err: any) {
                errors.push(`${user.email}: ${err.message}`);
            }
        }

        return NextResponse.json({
            message: `✅ Lifestyle Income distributed to ${successCount} user(s). $${(successCount * LIFESTYLE_PAYOUT).toLocaleString()} total paid out.`,
            count: successCount,
            errors: errors.length > 0 ? errors : undefined,
        });

    } catch (error: any) {
        console.error("LIFESTYLE_DISTRIBUTE_ERROR:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}

// GET — returns stats for admin preview
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "SUPERADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const qualifiedCount = await prisma.user.count({
            where: { lifestyleQualified: true },
        });

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const paidThisMonth = await prisma.transaction.count({
            where: {
                type: "LIFESTYLE_INCOME",
                status: "COMPLETED",
                createdAt: { gte: startOfMonth },
            },
        });

        return NextResponse.json({
            qualifiedCount,
            paidThisMonth,
            pendingCount: qualifiedCount - paidThisMonth,
            totalPayout: (qualifiedCount - paidThisMonth) * LIFESTYLE_PAYOUT,
        });

    } catch (error: any) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
