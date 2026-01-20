"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface UserProfile {
    name: string;
    email: string;
    referralCode: string;
    balance: number;
    createdAt: string;
}

export default function SettingsPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/user/profile");
            const data = await res.json();
            if (res.ok) {
                setProfile({
                    name: data.name || data.email?.split('@')[0] || 'User',
                    email: data.email,
                    referralCode: data.referralCode,
                    balance: Number(data.balance || 0),
                    createdAt: data.createdAt
                });
            }
        } catch (err) {
            console.error("Failed to fetch profile:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoggingOut(true);
        await signOut({ callbackUrl: '/login' });
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const menuItems = [
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            label: "Account Information",
            href: "/dashboard/settings/account"
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            label: "Security Settings",
            href: "/dashboard/settings/security"
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            label: "Support / Help",
            href: "/dashboard/settings/help"
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#191022' }}>
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div
            className="relative flex min-h-screen w-full flex-col overflow-x-hidden"
            style={{ backgroundColor: '#191022' }}
        >
            {/* Animated Gradient Background */}
            <div
                className="absolute inset-0 z-0 opacity-40"
                style={{
                    background: 'linear-gradient(-45deg, #4A00E0, #8E2DE2, #191022, #4A00E0)',
                    backgroundSize: '400% 400%',
                    animation: 'gradientShift 15s ease infinite'
                }}
            />

            {/* Content */}
            <div className="relative z-10 flex w-full flex-1 flex-col p-6 pb-36">
                {/* Profile Header */}
                <div className="flex flex-col items-center justify-center pt-8 pb-8">
                    {/* Avatar with gradient border */}
                    <div
                        className="relative mb-4 h-28 w-28 rounded-full p-1 shadow-xl"
                        style={{
                            background: 'linear-gradient(to top right, #8E2DE2, #4A00E0)',
                            boxShadow: '0 10px 40px rgba(142, 45, 226, 0.3)'
                        }}
                    >
                        <div
                            className="h-full w-full rounded-full p-1 flex items-center justify-center"
                            style={{ backgroundColor: '#191022' }}
                        >
                            <div
                                className="h-full w-full rounded-full flex items-center justify-center text-2xl font-bold text-white"
                                style={{ background: 'linear-gradient(135deg, #8E2DE2, #4A00E0)' }}
                            >
                                {profile ? getInitials(profile.name) : 'U'}
                            </div>
                        </div>
                    </div>

                    {/* Name */}
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        {profile?.name || 'User'}
                    </h1>

                    {/* Referral Code Badge */}
                    <p
                        className="mt-2 text-sm font-medium text-white/50 px-3 py-1 rounded-full border border-white/5"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                    >
                        ID: <span className="tracking-wide text-white/80">{profile?.referralCode || 'N/A'}</span>
                    </p>
                </div>

                {/* Menu Items */}
                <div className="flex flex-col space-y-3">
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => router.push(item.href)}
                            className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-md transition-all hover:bg-white/10 active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className="flex h-10 w-10 items-center justify-center rounded-xl text-purple-400 transition-colors border border-purple-500/20 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600"
                                    style={{ backgroundColor: 'rgba(142, 45, 226, 0.1)' }}
                                >
                                    {item.icon}
                                </div>
                                <span className="font-semibold text-white/90">{item.label}</span>
                            </div>
                            <svg className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    ))}
                </div>

                {/* Logout Button */}
                <div className="mt-8 px-2">
                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 py-3.5 text-red-400 transition-colors hover:bg-red-500/10 active:scale-[0.98] disabled:opacity-50"
                    >
                        {loggingOut ? (
                            <>
                                <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                                <span className="font-bold text-sm">Logging Out...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className="font-bold text-sm">Log Out</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* CSS Animation */}
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
