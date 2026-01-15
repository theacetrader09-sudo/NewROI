"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        referralCode: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [sponsorName, setSponsorName] = useState("");
    const [checkingSponsor, setCheckingSponsor] = useState(false);

    // Auto-fill referral code from URL
    useEffect(() => {
        const refCode = searchParams.get('ref');
        if (refCode) {
            setFormData(prev => ({ ...prev, referralCode: refCode.toUpperCase() }));
        }
    }, [searchParams]);

    // Auto-detect sponsor when referral code changes
    useEffect(() => {
        const checkSponsor = async () => {
            if (formData.referralCode.length >= 4) {
                setCheckingSponsor(true);
                try {
                    const res = await fetch(`/api/user/check-referral?code=${formData.referralCode}`);
                    const data = await res.json();
                    if (res.ok && data.valid) {
                        setSponsorName(data.sponsorName || "Valid Sponsor");
                    } else {
                        setSponsorName("");
                    }
                } catch {
                    setSponsorName("");
                } finally {
                    setCheckingSponsor(false);
                }
            } else {
                setSponsorName("");
            }
        };

        const debounce = setTimeout(checkSponsor, 500);
        return () => clearTimeout(debounce);
    }, [formData.referralCode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            router.push("/login?registered=true");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background-dark overflow-x-hidden p-6">
            {/* Animated Gradient Background */}
            <div
                className="absolute inset-0 z-0 opacity-40"
                style={{
                    background: 'linear-gradient(-45deg, #4A00E0, #8E2DE2, #191022, #4A00E0)',
                    backgroundSize: '400% 400%',
                    animation: 'gradientShift 15s ease infinite'
                }}
            />

            <div className="relative z-10 flex w-full max-w-md flex-col items-center">
                {/* Logo */}
                <div className="mb-8 flex justify-center">
                    <svg fill="none" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg">
                        <path d="M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM24 34.4L13.6 24L24 13.6L34.4 24L24 34.4Z" fill="url(#paint0_linear_signup)" />
                        <defs>
                            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_signup" x1="4" x2="44" y1="4" y2="44">
                                <stop stopColor="#4A00E0" />
                                <stop offset="1" stopColor="#8E2DE2" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                <h1 className="text-white tracking-tight text-3xl font-bold leading-tight text-center pb-2">
                    Create Account
                </h1>
                <p className="text-white/70 text-base font-normal leading-normal pb-8 text-center">
                    Join our community today.
                </p>

                {/* Error Message */}
                {error && (
                    <div className="w-full mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="w-full space-y-4">
                    {/* Full Name */}
                    <div className="flex w-full flex-wrap items-end">
                        <label className="flex w-full flex-col">
                            <p className="text-white/90 text-sm font-medium leading-normal pb-2">Full Name</p>
                            <div className="relative flex w-full items-center">
                                <svg className="absolute left-4 w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white/90 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-white/20 bg-white/5 focus:border-primary h-14 placeholder:text-white/40 pl-12 pr-4 text-base font-normal leading-normal transition-colors"
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </label>
                    </div>

                    {/* Email */}
                    <div className="flex w-full flex-wrap items-end">
                        <label className="flex w-full flex-col">
                            <p className="text-white/90 text-sm font-medium leading-normal pb-2">Email Address</p>
                            <div className="relative flex w-full items-center">
                                <svg className="absolute left-4 w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white/90 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-white/20 bg-white/5 focus:border-primary h-14 placeholder:text-white/40 pl-12 pr-4 text-base font-normal leading-normal transition-colors"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </label>
                    </div>

                    {/* Password */}
                    <div className="flex w-full flex-wrap items-end">
                        <label className="flex w-full flex-col">
                            <p className="text-white/90 text-sm font-medium leading-normal pb-2">Password</p>
                            <div className="relative flex w-full items-center">
                                <svg className="absolute left-4 w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white/90 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-white/20 bg-white/5 focus:border-primary h-14 placeholder:text-white/40 pl-12 pr-12 text-base font-normal leading-normal transition-colors"
                                    placeholder="Create a password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-0 flex h-full w-12 items-center justify-center text-white/50 hover:text-white/80 transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </label>
                    </div>

                    {/* Referral Code */}
                    <div className="flex w-full flex-wrap items-end">
                        <label className="flex w-full flex-col">
                            <p className="text-white/90 text-sm font-medium leading-normal pb-2">Referral Code</p>
                            <div className="relative flex w-full items-center">
                                <svg className="absolute left-4 w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                </svg>
                                <input
                                    type="text"
                                    required
                                    value={formData.referralCode}
                                    onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
                                    className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white/90 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-white/20 bg-white/5 focus:border-primary h-14 placeholder:text-white/40 pl-12 pr-4 text-base font-normal leading-normal transition-colors"
                                    placeholder="Enter referral code"
                                />
                            </div>
                            {/* Auto-detected Sponsor */}
                            {checkingSponsor && (
                                <div className="flex items-center gap-1.5 mt-2 pl-1">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-primary rounded-full animate-spin" />
                                    <p className="text-white/50 text-sm">Checking sponsor...</p>
                                </div>
                            )}
                            {sponsorName && !checkingSponsor && (
                                <div className="flex items-center gap-1.5 mt-2 pl-1">
                                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                    </svg>
                                    <p className="text-green-400 text-sm font-medium leading-normal">Auto-detected Sponsor: {sponsorName}</p>
                                </div>
                            )}
                        </label>
                    </div>

                    {/* Submit Button */}
                    <div className="w-full pt-8 pb-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center rounded-xl bg-primary hover:bg-primary-dark h-14 text-base font-bold text-white shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                    Processing...
                                </>
                            ) : (
                                "Sign Up"
                            )}
                        </button>
                    </div>
                </form>

                {/* Login Link */}
                <div className="flex justify-center mt-2">
                    <p className="text-white/60 text-base font-normal leading-normal">
                        Already have an account?{" "}
                        <Link href="/login" className="font-bold text-primary hover:text-primary-light transition-colors ml-1">
                            Log In
                        </Link>
                    </p>
                </div>
            </div>

            {/* Keyframe animation for gradient */}
            <style jsx>{`
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-background-dark">
                <div className="w-8 h-8 border-2 border-white/30 border-t-primary rounded-full animate-spin" />
            </div>
        }>
            <RegisterForm />
        </Suspense>
    );
}
