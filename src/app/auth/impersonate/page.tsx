"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

function ImpersonateContent() {
    const params = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "error">("loading");
    const [message, setMessage] = useState("Authenticating...");

    useEffect(() => {
        const token = params.get("token");
        if (!token) {
            setStatus("error");
            setMessage("Invalid or missing token.");
            return;
        }

        (async () => {
            try {
                const res = await signIn("credentials", {
                    redirect: false,
                    impersonationToken: token,
                    password: "__impersonate__",
                    email: "__impersonate__",
                });

                if (res?.ok) {
                    router.replace("/dashboard");
                } else {
                    setStatus("error");
                    setMessage("Token expired or invalid. Please generate a new one from the admin panel.");
                }
            } catch {
                setStatus("error");
                setMessage("An error occurred. Please try again.");
            }
        })();
    }, [params, router]);

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0a0a10",
            color: "white",
            fontFamily: "system-ui, sans-serif"
        }}>
            <div style={{ textAlign: "center", padding: "40px" }}>
                {status === "loading" ? (
                    <>
                        <div style={{ fontSize: "2rem", marginBottom: "16px" }}>🔐</div>
                        <p style={{ color: "#9ca3af" }}>{message}</p>
                    </>
                ) : (
                    <>
                        <div style={{ fontSize: "2rem", marginBottom: "16px" }}>⚠️</div>
                        <p style={{ color: "#f87171", maxWidth: "360px" }}>{message}</p>
                        <a href="/admin/users" style={{ display: "inline-block", marginTop: "16px", color: "#818cf8", fontSize: "0.875rem" }}>
                            ← Back to Admin
                        </a>
                    </>
                )}
            </div>
        </div>
    );
}

export default function ImpersonatePage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0a0a10", color: "#9ca3af" }}>
                <p>Loading...</p>
            </div>
        }>
            <ImpersonateContent />
        </Suspense>
    );
}
