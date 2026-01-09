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

        const { id } = await req.json();

        const result = await prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.findUnique({
                where: { id },
            });

            if (!transaction || transaction.status !== "PENDING" || transaction.type !== "WITHDRAWAL") {
                throw new Error("Invalid transaction or already processed");
            }

            // Update Transaction status (Balance was already deducted when requested)
            return await tx.transaction.update({
                where: { id },
                data: {
                    status: "COMPLETED",
                    description: transaction.description + " (Approved by Admin)"
                }
            });
        });

        return NextResponse.json({ message: "Withdrawal approved successfully" });

    } catch (error: any) {
        console.error("ADMIN_WITHDRAW_APPROVE_ERROR:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
