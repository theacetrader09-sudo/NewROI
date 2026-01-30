import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createOTP } from "@/lib/otp";
import { sendSignupOTP } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const { userId, email } = await req.json();

        if (!userId && !email) {
            return NextResponse.json({ error: "User ID or email required" }, { status: 400 });
        }

        // Get user by either userId or email
        const user = await prisma.user.findUnique({
            where: userId ? { id: userId } : { email: email.toLowerCase().trim() }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (user.verified) {
            return NextResponse.json({ error: "Email already verified" }, { status: 400 });
        }

        // Generate and send new OTP
        const otp = await createOTP(user.id, 'SIGNUP');
        await sendSignupOTP(user.email, user.name || user.email.split('@')[0], otp);

        return NextResponse.json({
            message: "New verification code sent to your email",
            userId: user.id // Return userId for redirect
        }, { status: 200 });

    } catch (error: any) {
        console.error("RESEND_OTP_ERROR:", error);
        return NextResponse.json({
            error: "Failed to resend OTP"
        }, { status: 500 });
    }
}
