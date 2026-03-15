import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// Checks if a given email belongs to someone in the upline's downline tree
async function isInDownline(uplineId: string, targetUserId: string): Promise<boolean> {
    const visited = new Set<string>();
    const queue = [uplineId];

    while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (visited.has(currentId)) continue;
        visited.add(currentId);

        const directReferrals = await prisma.user.findMany({
            where: { uplineId: currentId },
            select: { id: true }
        });

        for (const ref of directReferrals) {
            if (ref.id === targetUserId) return true;
            queue.push(ref.id);
        }
    }
    return false;
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const uplineId = (session.user as any).id;
        const { email } = await req.json();

        if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

        // Find the target user by email
        const target = await prisma.user.findUnique({
            where: { email: email.trim().toLowerCase() },
            select: { id: true, name: true, email: true, investments: { where: { status: "ACTIVE" } } }
        });

        if (!target) return NextResponse.json({ error: "No user found with this email" }, { status: 404 });
        if (target.id === uplineId) return NextResponse.json({ error: "You cannot deposit on behalf of yourself" }, { status: 400 });

        // Check if target is in upline's downline
        const inDownline = await isInDownline(uplineId, target.id);
        if (!inDownline) return NextResponse.json({ error: "This user is not in your downline" }, { status: 403 });

        const hasActivePackage = target.investments.length > 0;

        return NextResponse.json({
            id: target.id,
            name: target.name || target.email.split('@')[0],
            email: target.email,
            hasActivePackage,
        });

    } catch (err: any) {
        console.error("VERIFY_DOWNLINE_ERROR:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
