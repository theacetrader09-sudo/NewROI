import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get("code");

        if (!code) {
            return NextResponse.json({ valid: false, error: "No code provided" });
        }

        const user = await prisma.user.findUnique({
            where: { referralCode: code.toUpperCase() },
            select: { id: true, name: true, email: true }
        });

        if (!user) {
            return NextResponse.json({ valid: false, error: "Invalid referral code" });
        }

        // Return sponsor name (or email if name not set)
        const sponsorName = user.name || user.email.split('@')[0];

        return NextResponse.json({
            valid: true,
            sponsorName: sponsorName
        });

    } catch (error) {
        console.error("CHECK_REFERRAL_ERROR:", error);
        return NextResponse.json({ valid: false, error: "Server error" }, { status: 500 });
    }
}
