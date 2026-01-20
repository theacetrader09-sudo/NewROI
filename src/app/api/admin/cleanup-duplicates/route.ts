import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * TEMPORARY ENDPOINT: Clean up duplicate investments
 * 
 * This endpoint should be DELETED after running once on production
 */

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "SUPERADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log('🧹 Starting duplicate investment cleanup...');

        const users = await prisma.user.findMany({
            include: {
                investments: {
                    where: { status: 'ACTIVE' },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        let totalCancelled = 0;
        const results = [];

        for (const user of users) {
            if (user.investments.length > 1) {
                // Check if there are exact amount duplicates
                const investmentsByAmount: { [key: number]: any[] } = {};

                user.investments.forEach(inv => {
                    const amount = Number(inv.amount);
                    if (!investmentsByAmount[amount]) {
                        investmentsByAmount[amount] = [];
                    }
                    investmentsByAmount[amount].push(inv);
                });

                // For each amount, if there are duplicates, keep only the first one
                for (const [amount, investments] of Object.entries(investmentsByAmount)) {
                    if (investments.length > 1) {
                        const keep = investments[0];
                        const cancel = investments.slice(1);

                        for (const inv of cancel) {
                            await prisma.investment.update({
                                where: { id: inv.id },
                                data: { status: 'CANCELLED' }
                            });

                            totalCancelled++;

                            results.push({
                                user: user.email,
                                amount: `$${amount}`,
                                kept: keep.id,
                                cancelled: inv.id,
                                keptMethod: keep.approvalMethod || 'LEGACY',
                                cancelledMethod: inv.approvalMethod || 'LEGACY'
                            });
                        }
                    }
                }
            }
        }

        console.log(`✅ Cleanup complete! Cancelled ${totalCancelled} duplicates.`);

        return NextResponse.json({
            success: true,
            message: `Cleaned up ${totalCancelled} duplicate investments`,
            totalUsersChecked: users.length,
            duplicatesCancelled: totalCancelled,
            details: results
        });

    } catch (error: any) {
        console.error("CLEANUP_ERROR:", error);
        return NextResponse.json({
            error: error.message || "Internal server error",
            success: false
        }, { status: 500 });
    }
}
