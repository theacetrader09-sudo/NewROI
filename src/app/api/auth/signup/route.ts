import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { name, email, password, referralCode } = await req.json();

        if (!email || !password || !referralCode) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Normalize email to lowercase for consistency
        const normalizedEmail = email.toLowerCase().trim();

        // 1. Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existingUser) {
            return NextResponse.json({ error: "Email already registered" }, { status: 400 });
        }

        // 2. Validate Referral Code (Mandatory)
        const upline = await prisma.user.findUnique({
            where: { referralCode: referralCode }
        });

        if (!upline) {
            return NextResponse.json({ error: "Invalid referral code" }, { status: 400 });
        }

        // 3. Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Generate New Referral Code (Unique with check)
        let newReferralCode = "";
        let isUnique = false;
        while (!isUnique) {
            newReferralCode = "MLM" + Math.random().toString(36).substring(2, 9).toUpperCase();
            const existing = await prisma.user.findUnique({ where: { referralCode: newReferralCode } });
            if (!existing) isUnique = true;
        }

        // 5. Create User
        const user = await prisma.user.create({
            data: {
                name,
                email: normalizedEmail, // Store email in lowercase
                password: hashedPassword,
                referralCode: newReferralCode,
                uplineId: upline.id,
                role: "USER"
            }
        });

        console.log(`[TREE] Created User: ${user.email} (ID: ${user.id}) referred by ${upline.email} (ID: ${upline.id})`);

        return NextResponse.json({ message: "User registered successfully", userId: user.id }, { status: 201 });

    } catch (error: any) {
        console.error("SIGNUP_ERROR:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
