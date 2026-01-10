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

        const user = await prisma.user.findUnique({
            where: { id: (session.user as any).id },
            select: {
                id: true,
                name: true,
                email: true,
                balance: true,
                referralCode: true,
                role: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Calculate total invested from active investments
        const investments = await prisma.investment.findMany({
            where: {
                userId: user.id,
                status: 'ACTIVE'
            },
            select: {
                amount: true
            }
        });

        const totalInvested = investments.reduce(
            (sum, inv) => sum + Number(inv.amount),
            0
        );

        return NextResponse.json({
            ...user,
            totalInvested
        });

    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
