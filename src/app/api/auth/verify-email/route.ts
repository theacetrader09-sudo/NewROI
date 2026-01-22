import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyOTP } from "@/lib/otp";

export async function POST(req: Request) {
    try {
        const { userId, otp } = await req.json();

        if (!userId || !otp) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (otp.length !== 6) {
            return NextResponse.json({ error: "Invalid OTP format" }, { status: 400 });
        }

        // Verify OTP
        const isValid = await verifyOTP(userId, otp, 'SIGNUP');

        if (!isValid) {
            return NextResponse.json({
                error: "Invalid or expired OTP. Please request a new code."
            }, { status: 400 });
        }

        // Activate account
        const user = await prisma.user.update({
            where: { id: userId },
            data: { verified: true }
        });

        console.log(`[VERIFICATION] Email verified for user: ${user.email}`);

        return NextResponse.json({
            message: "Email verified successfully! You can now login.",
            verified: true
        }, { status: 200 });

    } catch (error: any) {
        console.error("EMAIL_VERIFICATION_ERROR:", error);
        return NextResponse.json({
            error: "Internal server error"
        }, { status: 500 });
    }
}
