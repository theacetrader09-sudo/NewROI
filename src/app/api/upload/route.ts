import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

export const dynamic = 'force-dynamic';

/**
 * Upload image to Cloudinary
 * POST /api/upload
 */
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userRole = (session?.user as any)?.role;

        // Only admins can upload
        if (!session || (userRole !== "ADMIN" && userRole !== "SUPERADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString("base64");
        const dataUri = `data:${file.type};base64,${base64}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataUri, {
            folder: "mlm-announcements",
            resource_type: "auto",
        });

        return NextResponse.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
        });

    } catch (error) {
        console.error("[UPLOAD_ERROR]", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
