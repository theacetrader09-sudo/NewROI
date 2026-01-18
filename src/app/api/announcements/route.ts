import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

/**
 * GET /api/announcements - Get active announcement for users
 * POST /api/announcements - Create new announcement (admin only)
 */
export async function GET() {
    try {
        const now = new Date();

        // Get active announcement that's within date range
        const announcement = await prisma.announcement.findFirst({
            where: {
                isActive: true,
                OR: [
                    { startDate: null, endDate: null },
                    { startDate: { lte: now }, endDate: null },
                    { startDate: null, endDate: { gte: now } },
                    { startDate: { lte: now }, endDate: { gte: now } },
                ],
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ announcement });
    } catch (error) {
        console.error("[ANNOUNCEMENTS_GET_ERROR]", error);
        return NextResponse.json({ error: "Failed to fetch announcement" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userRole = (session?.user as any)?.role;

        if (!session || (userRole !== "ADMIN" && userRole !== "SUPERADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, imageUrl, isActive, startDate, endDate } = body;

        if (!title || !imageUrl) {
            return NextResponse.json({ error: "Title and image are required" }, { status: 400 });
        }

        const announcement = await prisma.announcement.create({
            data: {
                title,
                description: description || null,
                imageUrl,
                isActive: isActive ?? true,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
            },
        });

        return NextResponse.json({ success: true, announcement });
    } catch (error) {
        console.error("[ANNOUNCEMENTS_POST_ERROR]", error);
        return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
    }
}
