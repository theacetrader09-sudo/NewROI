import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
    const url = process.env.DATABASE_URL;
    if (url) {
        // Redact password for logging
        const redacted = url.replace(/:([^:@]+)@/, ":****@");
        console.log(`[PRISMA] Initializing client with URL: ${redacted}`);
    } else {
        console.error("[PRISMA] DATABASE_URL is not defined!");
    }

    return new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
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
