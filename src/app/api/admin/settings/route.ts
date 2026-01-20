import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "SUPERADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

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

        return NextResponse.json(settings);

    } catch (error) {
        console.error("SETTINGS_GET_ERROR:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "SUPERADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        // Get or create settings
        let settings = await prisma.systemSettings.findFirst();

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

        // Update settings
        const updated = await prisma.systemSettings.update({
            where: { id: settings.id },
            data: {
                dailyRoiPercent: body.dailyRoiPercent !== undefined ? body.dailyRoiPercent : settings.dailyRoiPercent,
                levelConfig: body.levelConfig !== undefined ? JSON.stringify(body.levelConfig) : settings.levelConfig,
                adminWallet: body.adminWallet !== undefined ? body.adminWallet : settings.adminWallet,
                maintenanceMode: body.maintenanceMode !== undefined ? body.maintenanceMode : settings.maintenanceMode,
                roiHoliday: body.roiHoliday !== undefined ? body.roiHoliday : settings.roiHoliday
            }
        });

        return NextResponse.json({ message: "Settings updated successfully", settings: updated });

    } catch (error) {
        console.error("SETTINGS_UPDATE_ERROR:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
