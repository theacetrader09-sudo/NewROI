
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log("DEBUG: Attempting DB connection...");
        const start = Date.now();

        // Try a simple query
        const userCount = await prisma.user.count();

        const duration = Date.now() - start;

        // Get the current connection URL (redacted)
        // We can't access internal datasource URL easily on generic client, 
        // but we can verify it works.

        return NextResponse.json({
            status: "SUCCESS",
            message: "Connected to database successfully!",
            userCount,
            duration: `${duration}ms`,
            env: {
                hasDatabaseUrl: !!process.env.DATABASE_URL,
                hasPoolerUrl: !!process.env.SUPABASE_POOLER_URL,
                nodeEnv: process.env.NODE_ENV
            }
        });

    } catch (error: any) {
        console.error("DEBUG_DB_ERROR:", error);

        return NextResponse.json({
            status: "ERROR",
            message: "Database connection failed",
            errorName: error.name,
            errorMessage: error.message,
            errorCode: error.code,
            meta: error.meta,
            stack: error.stack
        }, { status: 500 });
    }
}
