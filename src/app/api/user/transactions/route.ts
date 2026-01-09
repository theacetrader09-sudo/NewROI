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
        const limit = parseInt(searchParams.get("limit") || "50");

        const transactions = await prisma.transaction.findMany({
            where: {
                userId: (session.user as any).id,
                ...(type && { type: type as any })
            },
            orderBy: { createdAt: "desc" },
            take: limit,
        });

        return NextResponse.json({ transactions });

    } catch (error) {
        console.error("TRANSACTIONS_API_ERROR:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
