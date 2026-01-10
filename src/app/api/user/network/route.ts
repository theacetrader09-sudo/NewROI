import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;

        // OPTIMIZED: Fetch ALL users with their investments in a SINGLE query
        const allUsers = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                uplineId: true,
                createdAt: true,
                investments: {
                    where: { status: "ACTIVE" },
                    select: { amount: true }
                }
            }
        });

        // Build lookup map for O(1) access
        const userMap = new Map(allUsers.map(u => [u.id, u]));

        // Build tree in memory (much faster than recursive DB calls)
        function buildTree(parentId: string, currentLevel: number): any[] {
            if (currentLevel > 10) return [];

            const children = allUsers.filter(u => u.uplineId === parentId);

            return children.map(user => {
                const totalInvested = user.investments.reduce(
                    (sum, inv) => sum + Number(inv.amount), 0
                );

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    level: currentLevel,
                    invested: totalInvested,
                    children: buildTree(user.id, currentLevel + 1)
                };
            });
        }

        const networkData = buildTree(userId, 1);

        return NextResponse.json(networkData);

    } catch (error: any) {
        console.error("NETWORK_API_ERROR:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
