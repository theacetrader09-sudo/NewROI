import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;

        // Helper function to fetch kids recursively up to 10 levels
        async function getTree(parentId: string, currentLevel: number): Promise<any> {
            if (currentLevel > 10) return [];

            const referrals = await prisma.user.findMany({
                where: { uplineId: parentId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                    investments: {
                        where: { status: "ACTIVE" },
                        select: { amount: true }
                    }
                }
            });

            const tree = await Promise.all(referrals.map(async (user) => {
                const children = await getTree(user.id, currentLevel + 1);
                const totalInvested = user.investments.reduce((sum, inv) => sum + Number(inv.amount), 0);

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    level: currentLevel,
                    invested: totalInvested,
                    children: children
                };
            }));

            return tree;
        }

        const networkData = await getTree(userId, 1);

        return NextResponse.json(networkData);

    } catch (error: any) {
        console.error("NETWORK_API_ERROR:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
