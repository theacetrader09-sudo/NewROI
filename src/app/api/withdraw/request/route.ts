import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createOTP } from "@/lib/otp";
import { sendWithdrawalOTP } from "@/lib/email";

const MIN_WITHDRAWAL = 20;
const PLATFORM_FEE_PERCENT = 5; // 5% platform fee

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { amount, walletAddress } = await req.json();
        const withdrawAmount = parseFloat(amount);

        if (isNaN(withdrawAmount) || withdrawAmount < MIN_WITHDRAWAL) {
            return NextResponse.json({ error: `Minimum withdrawal is $${MIN_WITHDRAWAL}` }, { status: 400 });
        }

        if (!walletAddress) {
            return NextResponse.json({ error: "Receiving wallet address is required" }, { status: 400 });
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { id: (session.user as any).id }
        });

        if (!user || Number(user.balance) < withdrawAmount) {
            return NextResponse.json({ error: "Insufficient balance for this withdrawal" }, { status: 400 });
        }

        // Generate OTP and send email
        const otp = await createOTP(user.id, 'WITHDRAWAL');
        await sendWithdrawalOTP(
            user.email,
            user.name || user.email.split('@')[0],
            otp,
            withdrawAmount
        );

        return NextResponse.json({
            message: "OTP sent to your email. Please check your inbox.",
            requiresOTP: true,
            expiresIn: 300 // 5 minutes in seconds
        }, { status: 200 });

    } catch (error: any) {
        console.error("WITHDRAWAL_REQUEST_ERROR:", error);
        return NextResponse.json({
            error: error.message || "Failed to send OTP"
        }, { status: 500 });
    }
}
