import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "SUPERADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: userId } = await params;

        // Recursive function to count all downline members (all levels)
        async function countTeamSize(parentId: string, currentLevel: number = 1): Promise<number> {
            if (currentLevel > 10) return 0; // Max 10 levels as per MLM structure

            const directReferrals = await prisma.user.findMany({
                where: { uplineId: parentId },
                select: { id: true }
            });

            // Count direct referrals + their downlines recursively
            let totalCount = directReferrals.length;

            for (const referral of directReferrals) {
                const downlineCount = await countTeamSize(referral.id, currentLevel + 1);
                totalCount += downlineCount;
            }

            return totalCount;
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                _count: {
                    select: {
                        referrals: true, // Direct referrals only (Level 1)
                    },
                },
                upline: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        referralCode: true,
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Calculate total team size across all levels
        const totalTeamSize = await countTeamSize(userId);

        // Add totalTeamSize to the response
        return NextResponse.json({
            ...user,
            totalTeamSize
        });

    } catch (error) {
        console.error("USER_FETCH_ERROR:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
