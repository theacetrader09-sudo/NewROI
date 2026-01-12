import prisma from "@/lib/prisma";

// Fallback Level Commission Config (used only if database settings not found)
const FALLBACK_LEVEL_COMMISSIONS = [0.06, 0.05, 0.02, 0.02, 0.01, 0.01, 0.005, 0.005, 0.0025, 0.001];

/**
 * Distributes 1% Daily ROI to all users with ACTIVE investments.
 * Also distributes level commissions to uplines based on ROI earnings.
 * This function is idempotent based on the date string (YYYY-MM-DD).
 * @param isManual - If true, marks the ROI as manually triggered by admin
 * @param forceRerun - If true, bypasses idempotency check (for manual admin triggers)
 */
export async function distributeDailyROI(isManual: boolean = false, forceRerun: boolean = false) {
    // Use IST timezone (UTC+5:30) for date calculation
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    const istDate = new Date(now.getTime() + istOffset);
    const today = istDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD in IST

    console.log(`[ROI] Starting ${isManual ? 'MANUAL' : 'AUTO'} distribution for ${today}...`);

    // 0. Fetch commission rates from SystemSettings
    const settings = await prisma.systemSettings.findFirst();
    let levelCommissions = FALLBACK_LEVEL_COMMISSIONS;

    if (settings && settings.levelConfig) {
        try {
            const configArray = JSON.parse(settings.levelConfig);
            // Convert percentages to decimals (e.g., 10 -> 0.10)
            levelCommissions = configArray.map((percent: number) => percent / 100);
            console.log('[ROI] Using commission rates from database:', configArray);
        } catch (e) {
            console.warn('[ROI] Failed to parse levelConfig, using fallback rates');
        }
    } else {
        console.warn('[ROI] No system settings found, using fallback commission rates');
    }

    // 1. Get all active investments
    const activeInvestments = await prisma.investment.findMany({
        where: { status: "ACTIVE" },
        include: { user: true }
    });

    let processedCount = 0;
    let skippedCount = 0;

    const triggerType = isManual ? "MANUAL" : "AUTO";

    for (const investment of activeInvestments) {
        try {
            // 2. Check if ROI already credited for this user + investment + date + triggerType (Idempotency)
            // Manual and Auto triggers are tracked separately
            // Skip this check if forceRerun is enabled (force override)
            if (!forceRerun) {
                const existingLog = await prisma.roiLog.findUnique({
                    where: {
                        userId_investmentId_date_triggerType: {
                            userId: investment.userId,
                            investmentId: investment.id,
                            date: today,
                            triggerType: triggerType
                        }
                    }
                });

                if (existingLog) {
                    skippedCount++;
                    continue;
                }
            }

            // 3. Calculate ROI (Fixed 1%)
            const roiAmount = Number(investment.amount) * 0.01;

            // 4. Atomic Transaction for ROI Credit, Logging & Commission Distribution
            await prisma.$transaction(async (tx) => {
                // 4a. Update user balance with ROI
                const prevBalance = Number(investment.user.balance);
                const newBalance = prevBalance + roiAmount;

                await tx.user.update({
                    where: { id: investment.userId },
                    data: { balance: newBalance }
                });

                // 4b. Log the ROI distribution in the primary Ledger
                const descriptionSuffix = isManual ? " (Manual Admin Trigger)" : " (Automated)";
                await tx.transaction.create({
                    data: {
                        userId: investment.userId,
                        type: "ROI",
                        amount: roiAmount,
                        previousBalance: prevBalance,
                        newBalance: newBalance,
                        description: `1% Daily ROI for package $${investment.amount}${descriptionSuffix}`,
                        status: "COMPLETED",
                        referenceId: investment.id
                    }
                });

                // 4c. Log in the ROI Idempotency Table with triggerType
                // Use upsert when force re-run to allow re-crediting for same date+type
                if (forceRerun) {
                    await tx.roiLog.upsert({
                        where: {
                            userId_investmentId_date_triggerType: {
                                userId: investment.userId,
                                investmentId: investment.id,
                                date: today,
                                triggerType: triggerType
                            }
                        },
                        update: {
                            amount: { increment: roiAmount } // Add to existing amount
                        },
                        create: {
                            userId: investment.userId,
                            investmentId: investment.id,
                            amount: roiAmount,
                            date: today,
                            triggerType: triggerType
                        }
                    });
                } else {
                    await tx.roiLog.create({
                        data: {
                            userId: investment.userId,
                            investmentId: investment.id,
                            amount: roiAmount,
                            date: today,
                            triggerType: triggerType
                        }
                    });
                }

                // 4d. Distribute Level Commissions based on ROI
                let currentUplineId = investment.user.uplineId;

                for (let level = 1; level <= 10; level++) {
                    if (!currentUplineId) break;

                    const upline = await tx.user.findUnique({
                        where: { id: currentUplineId }
                    });

                    if (!upline) break;

                    const commissionRate = levelCommissions[level - 1];
                    const commissionAmount = roiAmount * commissionRate;

                    // Credit upline with commission
                    const uplinePrevBal = Number(upline.balance);
                    const uplineNewBal = uplinePrevBal + commissionAmount;

                    await tx.user.update({
                        where: { id: upline.id },
                        data: { balance: uplineNewBal }
                    });

                    // Log commission transaction
                    await tx.transaction.create({
                        data: {
                            userId: upline.id,
                            type: "COMMISSION",
                            amount: commissionAmount,
                            previousBalance: uplinePrevBal,
                            newBalance: uplineNewBal,
                            description: `Level ${level} commission from ${investment.user.email}'s ROI ($${roiAmount.toFixed(2)})`,
                            status: "COMPLETED",
                            referenceId: investment.id
                        }
                    });

                    // Move to next level
                    currentUplineId = upline.uplineId;
                }
            });

            processedCount++;
        } catch (err) {
            console.error(`[ROI_ERROR] Failed for user ${investment.userId}:`, err);
        }
    }

    console.log(`[ROI] Finished for ${today}. Processed: ${processedCount}, Skipped: ${skippedCount}`);
    return { processedCount, skippedCount, date: today };
}
