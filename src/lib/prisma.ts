import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
    let url = process.env.SUPABASE_POOLER_URL || process.env.DATABASE_URL;

    // HARDCODE FALLBACK FOR PRODUCTION TO FIX CONNECTION ISSUE
    if (process.env.NODE_ENV === 'production' && !url?.includes("pooler.supabase.com")) {
        console.log("[PRISMA] Applying hardcoded Production Pooler URL override");
        url = "postgresql://postgres.fyatcvetnrpgclpbydmr:vishurathore%4072@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
    }

    if (url) {
        // Redact password for logging
        const redacted = url.replace(/:([^:@]+)@/, ":****@");
        console.log(`[PRISMA] Initializing client with URL: ${redacted}`);
    } else {
        console.error("[PRISMA] No database URL defined!");
    }

    return new PrismaClient({
        datasources: {
            db: {
                url: url,
            },
        },
    });
};

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
