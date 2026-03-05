import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "SUPERADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, reason } = await req.json();

        const result = await prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.findUnique({
                where: { id },
                include: { user: true }
            });

            if (!transaction || transaction.status !== "PENDING" || transaction.type !== "WITHDRAWAL") {
                throw new Error("Invalid transaction or already processed");
            }

            // Mark as REJECTED - balance was never deducted (pending requests don't deduct)
            // So user keeps their balance and can request again
            const updated = await tx.transaction.update({
                where: { id },
                data: {
                    status: "REJECTED",
                    description: transaction.description + ` (Rejected by Admin${reason ? ': ' + reason : ''})`
                }
            });

            // Balance is unchanged - user can request withdrawal again immediately
            return { updated, userEmail: transaction.user.email, amount: Number(transaction.amount) };
        });

        return NextResponse.json({
            message: `Withdrawal of $${(result as any).amount.toFixed(2)} rejected for ${(result as any).userEmail}. User balance is unchanged and they can request again.`
        });

    } catch (error: any) {
        console.error("ADMIN_WITHDRAW_REJECT_ERROR:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
