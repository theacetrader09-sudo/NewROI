import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
    // Prefer specific pooler URL, fallback to standard DATABASE_URL
    const url = process.env.SUPABASE_POOLER_URL || process.env.DATABASE_URL;

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
