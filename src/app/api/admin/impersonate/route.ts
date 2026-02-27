import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { SignJWT } from "jose";

// Token valid for 5 minutes only — single use is enforced client-side
const TOKEN_TTL_SECONDS = 5 * 60;

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "SUPERADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: "userId required" }, { status: 400 });
        }

        // Verify target user exists and is not an admin
        const targetUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, role: true }
        });

        if (!targetUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (targetUser.role === "SUPERADMIN") {
            return NextResponse.json({ error: "Cannot impersonate another admin" }, { status: 403 });
        }

        // Sign a short-lived JWT with the target user's data
        // Uses the same NEXTAUTH_SECRET so the impersonate page can verify it
        const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

        const token = await new SignJWT({
            sub: targetUser.id,
            email: targetUser.email,
            name: targetUser.name,
            role: targetUser.role,
            impersonatedBy: (session.user as any).id,
            adminEmail: session.user?.email,
        })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime(`${TOKEN_TTL_SECONDS}s`)
            .sign(secret);

        return NextResponse.json({ token });

    } catch (error: any) {
        console.error("IMPERSONATE_ERROR:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
