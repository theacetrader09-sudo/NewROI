import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
    // UNCONDITIONAL HARDCODE to guarantee correct connection
    // This is to debug why Vercel persists in using the wrong URL
    console.log("!!! FORCING SUPABASE POOLER URL !!!");
    const url = "postgresql://postgres.fyatcvetnrpgclpbydmr:vishurathore%4072@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres";

    // Log the URL we are using (redacted)
    const redacted = url.replace(/:([^:@]+)@/, ":****@");
    console.log(`[PRISMA] Initializing client with FORCED URL: ${redacted} `);

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
