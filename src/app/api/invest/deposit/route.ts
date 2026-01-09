import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { amount, txid } = await req.json();

        if (!amount || !txid) {
            return NextResponse.json({ error: "Missing amount or TXID" }, { status: 400 });
        }

        // Parse amount to float (ensuring precision for calculation)
        const depositAmount = parseFloat(amount);
        if (isNaN(depositAmount) || depositAmount <= 0) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        // Check if TXID already exists (Basic fraud prevention)
        const existingTx = await prisma.investment.findFirst({
            where: { txid: txid }
        });

        if (existingTx) {
            return NextResponse.json({ error: "This TXID has already been submitted" }, { status: 400 });
        }

        // Create a pending investment
        const investment = await prisma.investment.create({
            data: {
                userId: (session.user as any).id,
                amount: depositAmount,
                txid: txid,
                status: "PENDING",
                roiRate: 1.0, // Fixed 1% as requested initially
            }
        });

        return NextResponse.json({
            message: "Deposit submitted successfully. Waiting for admin approval.",
            investmentId: investment.id
        }, { status: 201 });

    } catch (error: any) {
        console.error("DEPOSIT_ERROR:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
