import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function getClientIp(req: Request): string {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0].trim();
    return req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const ip = getClientIp(req);
        const userAgent = req.headers.get("user-agent") || undefined;

        // Fetch geo-location asynchronously (non-blocking)
        let geoData: any = {};
        try {
            if (ip && ip !== "unknown" && ip !== "127.0.0.1" && ip !== "::1") {
                const geoRes = await fetch(`https://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,timezone,isp,lat,lon`, {
                    signal: AbortSignal.timeout(3000) // 3s timeout - never blocks login
                });
                if (geoRes.ok) {
                    const geo = await geoRes.json();
                    if (geo.status === "success") {
                        geoData = {
                            country: geo.country,
                            countryCode: geo.countryCode,
                            region: geo.regionName,
                            city: geo.city,
                            timezone: geo.timezone,
                            isp: geo.isp,
                            latitude: geo.lat,
                            longitude: geo.lon,
                        };
                    }
                }
            } else {
                // Local/dev environment
                geoData = { country: "Local", city: "Development", region: "Localhost" };
            }
        } catch {
            // Geo lookup failed silently - still log the IP
        }

        await prisma.loginLog.create({
            data: {
                userId,
                ip,
                userAgent,
                ...geoData,
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("LOGIN_LOG_ERROR:", error);
        // Return success anyway - login log failure should never affect user experience
        return NextResponse.json({ success: false });
    }
}
