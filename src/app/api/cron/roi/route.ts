import { NextResponse } from "next/server";
import { distributeDailyROI } from "@/lib/financials/roi";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const secret = searchParams.get("secret");

        // Protect the cron endpoint with a secret key
        if (secret !== process.env.CRON_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if this is a manual trigger (from admin panel)
        const isManual = searchParams.get("manual") === "true";
        // TESTING: Force re-run to allow double credit for same day (remove after testing)
        const forceRerun = searchParams.get("force") === "true";

        const result = await distributeDailyROI(isManual, forceRerun);

        return NextResponse.json({
            success: true,
            message: `ROI Distributed for ${result.date}`,
            details: result
        });

    } catch (error: any) {
        console.error("CRON_API_ERROR:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
