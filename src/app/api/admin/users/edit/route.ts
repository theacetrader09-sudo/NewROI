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

                    const newBalance = user.balance + adjustAmount;
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
                            previousBalance: user.balance,
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

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

    } catch (error: any) {
        console.error("ADMIN_EDIT_ERROR:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
