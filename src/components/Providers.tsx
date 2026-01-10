"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider
            // Refetch session every 5 minutes to keep it alive
            refetchInterval={5 * 60}
            // Refetch when window gets focus (user returns to tab)
            refetchOnWindowFocus={true}
        >
            {children}
        </SessionProvider>
    );
}
