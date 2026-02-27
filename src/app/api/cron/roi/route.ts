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

        // forceRerun requires a SEPARATE force secret to prevent accidental double-credits
        // Only set FORCE_SECRET in env when you explicitly need to re-run for a missed day
        const forceSecret = searchParams.get("force_secret");
        const forceRerun = forceSecret !== undefined &&
            forceSecret === process.env.FORCE_SECRET &&
            process.env.FORCE_SECRET !== undefined;

        const result = await distributeDailyROI(isManual, forceRerun);

        return NextResponse.json({
            success: true,
            message: `ROI Distributed for ${result.date}`,
            details: result,
            forceRerun: forceRerun
        });

    } catch (error: any) {
        console.error("CRON_API_ERROR:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
