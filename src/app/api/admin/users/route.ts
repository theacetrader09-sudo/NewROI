import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "SUPERADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";
        const limit = parseInt(searchParams.get("limit") || "100");

        const users = await prisma.user.findMany({
            where: search ? {
                OR: [
                    { email: { contains: search } },
                    { name: { contains: search } },
                    { referralCode: { contains: search } }
                ]
            } : {},
            select: {
                id: true,
                name: true,
                email: true,
                balance: true,
                referralCode: true,
                role: true,
                createdAt: true,
                upline: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                _count: {
                    select: { referrals: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        });

        return NextResponse.json(users);

    } catch (error) {
        console.error("ADMIN_USERS_API_ERROR:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
