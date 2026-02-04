import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Fallback requirements if database config not found
const FALLBACK_REQUIREMENTS = [1, 2, 6, 8, 12, 14, 16, 22, 28, 30];

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get current user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Count ONLY direct referrals with ACTIVE packages
        const directReferralsCount = await prisma.user.count({
            where: {
                uplineId: user.id,
                investments: {
                    some: {
                        status: "ACTIVE"
                    }
                }
            }
        });

        // Load level unlock requirements from system settings
        const settings = await prisma.systemSettings.findFirst();
        let levelRequirements = FALLBACK_REQUIREMENTS;

        if (settings?.levelUnlockConfig) {
            try {
                levelRequirements = JSON.parse(settings.levelUnlockConfig);
            } catch (e) {
                console.warn('Failed to parse levelUnlockConfig');
            }
        }

        // Calculate unlocked level
        let unlockedLevel = 0;
        for (let i = 0; i < levelRequirements.length; i++) {
            if (directReferralsCount >= levelRequirements[i]) {
                unlockedLevel = i + 1;
            } else {
                break;
            }
        }

        // Find next unlock milestone
        let nextUnlock = null;
        if (unlockedLevel < 10) {
            const nextLevel = unlockedLevel + 1;
            const neededDirects = levelRequirements[nextLevel - 1];
            nextUnlock = {
                level: nextLevel,
                needsDirects: neededDirects,
                remaining: neededDirects - directReferralsCount
            };
        }

        return NextResponse.json({
            directReferralsCount,
            unlockedLevel,
            levelRequirements,
            nextUnlock
        });

    } catch (error) {
        console.error("LEVEL_PROGRESS_ERROR:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
