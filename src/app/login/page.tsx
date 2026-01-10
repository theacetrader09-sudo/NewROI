"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (searchParams.get("registered")) {
            setShowSuccess(true);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email: formData.email,
                password: formData.password,
                rememberMe: rememberMe.toString(),
            });

            if (result?.error) {
                setError("Invalid email or password");
            } else {
                router.push("/dashboard");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: 'var(--bg-primary)'
        }}>
            <div className="glass" style={{
                width: '100%',
                maxWidth: '400px',
                padding: '32px'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Welcome Back</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Login to access your wallet</p>
                </div>

                {showSuccess && (
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: 'var(--accent-green)',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        fontSize: '0.9rem',
                        border: '1px solid var(--accent-green)'
                    }}>
                        Registration successful! Please login.
                    </div>
                )}

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--accent-red)',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        fontSize: '0.9rem',
                        border: '1px solid var(--accent-red)'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Email Address</label>
                        <input
                            type="email"
                            required
                            className="card"
                            style={{ width: '100%', outline: 'none', padding: '12px', color: 'white' }}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Password</label>
                        <input
                            type="password"
                            required
                            className="card"
                            style={{ width: '100%', outline: 'none', padding: '12px', color: 'white' }}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    {/* Remember Me Checkbox */}
                    <div style={{
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            style={{
                                width: '18px',
                                height: '18px',
                                accentColor: 'var(--accent-blue)',
                                cursor: 'pointer'
                            }}
                        />
                        <label
                            htmlFor="rememberMe"
                            style={{
                                fontSize: '0.85rem',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer'
                            }}
                        >
                            Remember me for 30 days
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '14px' }}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Don't have an account? <Link href="/register" style={{ color: 'var(--accent-blue)' }}>Sign up here</Link>
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-primary)'
            }}>
                <div>Loading...</div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
