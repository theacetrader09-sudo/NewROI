import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/announcements - Get all announcements for admin
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const userRole = (session?.user as any)?.role;

        if (!session || (userRole !== "ADMIN" && userRole !== "SUPERADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const announcements = await prisma.announcement.findMany({
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ announcements });
    } catch (error) {
        console.error("[ADMIN_ANNOUNCEMENTS_ERROR]", error);
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}
