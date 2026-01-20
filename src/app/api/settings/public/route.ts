import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Public endpoint to fetch publicly accessible settings
 * No authentication required - used by deposit page to get current admin wallet
 */
export async function GET() {
    try {
        let settings = await prisma.systemSettings.findFirst();

        // Create default settings if none exist
        if (!settings) {
            settings = await prisma.systemSettings.create({
                data: {
                    dailyRoiPercent: 1.0,
                    levelConfig: JSON.stringify([6, 5, 2, 2, 1, 1, 0.5, 0.5, 0.25, 0.10]),
                    adminWallet: "0x15C1eC04D1Db26ff82d66b0654790335292BdB66",
                    maintenanceMode: false,
                    roiHoliday: false
                }
            });
        }

        // Only return public settings (wallet address)
        return NextResponse.json({
            adminWallet: settings.adminWallet
        });

    } catch (error) {
        console.error("PUBLIC_SETTINGS_GET_ERROR:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
