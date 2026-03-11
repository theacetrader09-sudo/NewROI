/**
 * Business Volume (BV) Calculation Engine
 *
 * Lifestyle Income qualification rules:
 *   - Power Leg = single direct referral's subtree with HIGHEST total active investment BV
 *   - Short Leg = SUM of all other direct referrals' subtrees combined
 *   - Qualification: Power Leg >= $19,200 AND Short Leg >= $28,800 AND Total >= $48,000
 *   - Once qualified: LIFETIME $2,800/month lifestyle income
 */

import prisma from "@/lib/prisma";

export const LIFESTYLE_THRESHOLD   = 48000;   // total BV needed
export const POWER_LEG_MIN         = 19200;   // 40% of 48,000
export const SHORT_LEG_MIN         = 28800;   // 60% of 48,000
export const LIFESTYLE_PAYOUT      = 2800;    // monthly payout (USD)

/**
 * Recursively calculate total active investment BV for a subtree rooted at `userId`.
 * Uses iterative BFS to avoid stack overflow on large networks.
 */
export async function calcSubtreeBV(userId: string): Promise<number> {
    let totalBV = 0;
    const queue: string[] = [userId];
    const visited = new Set<string>();

    while (queue.length > 0) {
        const batch = queue.splice(0, 50); // process 50 at a time

        // Get all investments for this batch
        const investments = await prisma.investment.findMany({
            where: {
                userId: { in: batch },
                status: "ACTIVE",
            },
            select: { amount: true },
        });

        for (const inv of investments) {
            totalBV += Number(inv.amount);
        }

        // Get their direct children
        const children = await prisma.user.findMany({
            where: { uplineId: { in: batch } },
            select: { id: true },
        });

        for (const child of children) {
            if (!visited.has(child.id)) {
                visited.add(child.id);
                queue.push(child.id);
            }
        }

        batch.forEach(id => visited.add(id));
    }

    return totalBV;
}

/**
 * Calculate a user's Power Leg and Short Leg BV.
 *
 * Returns:
 *   - powerLegBV:    BV of the single strongest direct's subtree
 *   - shortLegBV:    BV of all other directs' subtrees combined
 *   - totalBV:       powerLegBV + shortLegBV
 *   - qualified:     true if all three thresholds are met
 *   - powerLegUserId: direct referral ID who is the power leg root
 */
export async function calcLifestyleProgress(userId: string): Promise<{
    powerLegBV: number;
    shortLegBV: number;
    totalBV: number;
    qualified: boolean;
    powerLegUserId: string | null;
    powerLegNeeded: number;
    shortLegNeeded: number;
    totalNeeded: number;
}> {
    // Get all direct referrals
    const directs = await prisma.user.findMany({
        where: { uplineId: userId },
        select: { id: true },
    });

    if (directs.length === 0) {
        return {
            powerLegBV: 0,
            shortLegBV: 0,
            totalBV: 0,
            qualified: false,
            powerLegUserId: null,
            powerLegNeeded: POWER_LEG_MIN,
            shortLegNeeded: SHORT_LEG_MIN,
            totalNeeded: LIFESTYLE_THRESHOLD,
        };
    }

    // Calculate BV for each direct's subtree in parallel
    const subtreeBVs = await Promise.all(
        directs.map(async (d) => ({
            userId: d.id,
            bv: await calcSubtreeBV(d.id),
        }))
    );

    // Sort descending — highest BV is power leg
    subtreeBVs.sort((a, b) => b.bv - a.bv);

    const powerLeg = subtreeBVs[0];
    const powerLegBV = powerLeg.bv;
    const shortLegBV = subtreeBVs.slice(1).reduce((sum, s) => sum + s.bv, 0);
    const totalBV = powerLegBV + shortLegBV;

    const qualified =
        powerLegBV >= POWER_LEG_MIN &&
        shortLegBV >= SHORT_LEG_MIN &&
        totalBV >= LIFESTYLE_THRESHOLD;

    return {
        powerLegBV,
        shortLegBV,
        totalBV,
        qualified,
        powerLegUserId: powerLeg.userId,
        powerLegNeeded: Math.max(0, POWER_LEG_MIN - powerLegBV),
        shortLegNeeded: Math.max(0, SHORT_LEG_MIN - shortLegBV),
        totalNeeded: Math.max(0, LIFESTYLE_THRESHOLD - totalBV),
    };
}
