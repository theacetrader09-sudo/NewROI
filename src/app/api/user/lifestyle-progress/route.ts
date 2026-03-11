import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { calcLifestyleProgress, LIFESTYLE_THRESHOLD, POWER_LEG_MIN, SHORT_LEG_MIN, LIFESTYLE_PAYOUT } from "@/lib/bv";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;

        // Get user's current qualification status from DB
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { lifestyleQualified: true, lifestyleQualifiedAt: true },
        });

        // Calculate live BV progress
        const progress = await calcLifestyleProgress(userId);

        // If newly qualified and not yet marked in DB, mark them now
        if (progress.qualified && user && !user.lifestyleQualified) {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    lifestyleQualified: true,
                    lifestyleQualifiedAt: new Date(),
                },
            });
        }

        return NextResponse.json({
            ...progress,
            lifestyleQualified: progress.qualified || (user?.lifestyleQualified ?? false),
            lifestyleQualifiedAt: user?.lifestyleQualifiedAt ?? null,
            monthlyPayout: LIFESTYLE_PAYOUT,
            threshold: LIFESTYLE_THRESHOLD,
            powerLegMin: POWER_LEG_MIN,
            shortLegMin: SHORT_LEG_MIN,
        });

    } catch (error: any) {
        console.error("LIFESTYLE_PROGRESS_ERROR:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
