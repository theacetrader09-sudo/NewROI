import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Fetch all MISSED_ROI transactions for this user
        const missedTransactions = await prisma.transaction.findMany({
            where: {
                userId: user.id,
                type: "MISSED_ROI"
            },
            orderBy: { createdAt: "desc" }
        });

        // Calculate total missed amount
        const totalMissed = missedTransactions.reduce((sum, tx) => {
            return sum + Number(tx.amount);
        }, 0);

        return NextResponse.json({
            transactions: missedTransactions.map(tx => ({
                id: tx.id,
                amount: Number(tx.amount),
                description: tx.description,
                createdAt: tx.createdAt
            })),
            totalMissed,
            count: missedTransactions.length
        });

    } catch (error) {
        console.error("[MISSED_OPPORTUNITIES_ERROR]", error);
        return NextResponse.json(
            { error: "Failed to fetch missed opportunities" },
            { status: 500 }
        );
    }
}
