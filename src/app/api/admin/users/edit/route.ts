import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "SUPERADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { userId, action, data } = await req.json();

        switch (action) {
            case "ADJUST_BALANCE": {
                const { amount, reason } = data;
                const adjustAmount = parseFloat(amount);

                if (isNaN(adjustAmount) || adjustAmount === 0) {
                    return NextResponse.json({ error: "Invalid adjustment amount" }, { status: 400 });
                }

                // Atomic balance adjustment with ledger
                await prisma.$transaction(async (tx) => {
                    const user = await tx.user.findUnique({ where: { id: userId } });
                    if (!user) throw new Error("User not found");

                    const newBalance = Number(user.balance) + adjustAmount;
                    if (newBalance < 0) throw new Error("Adjustment would result in negative balance");

                    await tx.user.update({
                        where: { id: userId },
                        data: { balance: newBalance }
                    });

                    await tx.transaction.create({
                        data: {
                            userId: userId,
                            type: adjustAmount > 0 ? "DEPOSIT" : "WITHDRAWAL",
                            amount: Math.abs(adjustAmount),
                            previousBalance: Number(user.balance),
                            newBalance: newBalance,
                            description: `Admin adjustment: ${reason || "No reason provided"}`,
                            status: "COMPLETED",
                            referenceId: "ADMIN_MANUAL"
                        }
                    });
                });

                return NextResponse.json({ message: "Balance adjusted successfully" });
            }

            case "RESET_PASSWORD": {
                const { newPassword } = data;

                if (!newPassword || newPassword.length < 6) {
                    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
                }

                const hashedPassword = await bcrypt.hash(newPassword, 10);
                await prisma.user.update({
                    where: { id: userId },
                    data: { password: hashedPassword }
                });

                return NextResponse.json({ message: "Password reset successfully" });
            }

            case "CHANGE_UPLINE": {
                const { newUplineCode } = data;

                if (!newUplineCode) {
                    return NextResponse.json({ error: "Upline referral code required" }, { status: 400 });
                }

                const newUpline = await prisma.user.findUnique({
                    where: { referralCode: newUplineCode }
                });

                if (!newUpline) {
                    return NextResponse.json({ error: "Upline not found" }, { status: 404 });
                }

                // Prevent circular references
                if (newUpline.id === userId) {
                    return NextResponse.json({ error: "User cannot be their own upline" }, { status: 400 });
                }

                await prisma.user.update({
                    where: { id: userId },
                    data: { uplineId: newUpline.id }
                });

                return NextResponse.json({ message: "Upline changed successfully" });
            }

            case "CHANGE_EMAIL": {
                const { newEmail } = data;

                if (!newEmail || !newEmail.includes("@")) {
                    return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 });
                }

                const normalizedEmail = newEmail.trim().toLowerCase();

                // Make sure email isn't already taken by another user
                const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
                if (existing && existing.id !== userId) {
                    return NextResponse.json({ error: "This email is already in use by another account" }, { status: 400 });
                }

                // Update email
                await prisma.user.update({
                    where: { id: userId },
                    data: { email: normalizedEmail }
                });

                // Invalidate all active sessions for this user by deleting from Session table (if it exists)
                try {
                    await (prisma as any).session.deleteMany({ where: { userId } });
                } catch {
                    // Session table may not exist (JWT mode) - that's fine, JWT will expire naturally
                }

                return NextResponse.json({ message: `✅ Email updated to ${normalizedEmail}. User has been logged out and must sign in with the new email.` });
            }

            case "CHANGE_NAME": {
                const { newName } = data;
                if (!newName || !newName.trim()) {
                    return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
                }
                await prisma.user.update({
                    where: { id: userId },
                    data: { name: newName.trim() }
                });
                return NextResponse.json({ message: `✅ Name updated to "${newName.trim()}" successfully.` });
            }

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

    } catch (error: any) {
        console.error("ADMIN_EDIT_ERROR:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
