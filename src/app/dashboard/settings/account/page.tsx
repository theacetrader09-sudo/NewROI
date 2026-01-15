"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UserProfile {
    name: string;
    email: string;
    createdAt: string;
}

export default function AccountInfoPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

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
                    createdAt: data.createdAt
                });
            }
        } catch (err) {
            console.error("Failed to fetch profile:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

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
            {/* Header */}
            <div className="flex items-center p-4 sticky top-0 z-10" style={{ backgroundColor: '#191022' }}>
                <button
                    onClick={() => router.back()}
                    className="flex w-10 h-10 shrink-0 items-center justify-center rounded-full text-white"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h2 className="text-lg font-bold leading-tight flex-1 text-center text-white">Account Information</h2>
                <div className="w-10 h-10 shrink-0" />
            </div>

            {/* Content */}
            <div className="flex flex-col p-4 space-y-4 pb-32">
                {/* Name */}
                <div
                    className="rounded-2xl p-4 border border-white/5"
                    style={{ backgroundColor: '#211c27' }}
                >
                    <div className="flex items-center gap-4">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }}
                        >
                            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-[#ab9db9]">Full Name</p>
                            <p className="text-white font-medium text-lg">{profile?.name || 'Not set'}</p>
                        </div>
                    </div>
                </div>

                {/* Email */}
                <div
                    className="rounded-2xl p-4 border border-white/5"
                    style={{ backgroundColor: '#211c27' }}
                >
                    <div className="flex items-center gap-4">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}
                        >
                            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-[#ab9db9]">Email Address</p>
                            <p className="text-white font-medium text-lg">{profile?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Account Created */}
                <div
                    className="rounded-2xl p-4 border border-white/5"
                    style={{ backgroundColor: '#211c27' }}
                >
                    <div className="flex items-center gap-4">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
                        >
                            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-[#ab9db9]">Account Created</p>
                            <p className="text-white font-medium text-lg">
                                {profile?.createdAt ? formatDate(profile.createdAt) : 'Unknown'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Info Note */}
                <div
                    className="rounded-xl p-4 mt-4"
                    style={{
                        background: 'rgba(139, 92, 246, 0.1)',
                        borderLeft: '4px solid #8b5cf6'
                    }}
                >
                    <p className="text-sm text-white/70">
                        Your account details are managed securely. Contact support if you need to update your email address.
                    </p>
                </div>
            </div>
        </div>
    );
}
