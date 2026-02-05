"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import ActiveInvestmentCard from "@/components/dashboard/ActiveInvestmentCard";
import InactiveUserAlert from "@/components/dashboard/InactiveUserAlert";
import RecentPayoutsCard from "@/components/dashboard/RecentPayoutsCard";

export default function ModernDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
    const [roiTimeLeft, setRoiTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [levelProgress, setLevelProgress] = useState<any>(null);

    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }
        if (status === "authenticated") {
            fetchDashboardData();
        }
    }, [status, session]);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const nextROI = new Date();
            nextROI.setHours(4, 0, 0, 0);
            if (now >= nextROI) {
                nextROI.setDate(nextROI.getDate() + 1);
            }
            const diff = nextROI.getTime() - now.getTime();

            if (diff <= 0) {
                setRoiTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            } else {
                setRoiTimeLeft({
                    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((diff / 1000 / 60) % 60),
                    seconds: Math.floor((diff / 1000) % 60),
                });
            }
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch user profile and level progress in parallel for faster loading
            const [profileRes, levelRes] = await Promise.all([
                fetch("/api/user/profile"),
                fetch("/api/user/level-progress")
            ]);

            const profileData = await profileRes.json();

            if (profileRes.ok) {
                setUser(profileData);
                fetchTransactions();
            }

            // Set level progress immediately from parallel fetch
            if (levelRes.ok) {
                const levelData = await levelRes.json();
                setLevelProgress(levelData);
            }
        } catch (err) {
            console.error("Failed to fetch dashboard:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async () => {
        try {
            const res = await fetch("/api/user/transactions?limit=5");
            const data = await res.json();
            if (res.ok && data.transactions) {
                setRecentTransactions(data.transactions);
            }
        } catch (err) {
            console.error("Failed to fetch transactions:", err);
        }
    };



    if (loading || !user) {
        return <DashboardSkeleton />;
    }

    const formatTime = (num: number) => num.toString().padStart(2, '0');
    const roiCountdown = `${formatTime(roiTimeLeft.hours)}:${formatTime(roiTimeLeft.minutes)}:${formatTime(roiTimeLeft.seconds)}`;

    return (
        <div className="relative flex min-h-screen flex-col overflow-x-hidden pb-28" style={{ backgroundColor: '#0F0916' }}>
            {/* Background Glow Effects */}
            <div className="fixed top-[-10%] left-[-20%] h-64 w-64 rounded-full blur-[100px]" style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }} />
            <div className="fixed bottom-[10%] right-[-20%] h-64 w-64 rounded-full blur-[100px]" style={{ backgroundColor: 'rgba(192, 132, 252, 0.1)' }} />

            {/* Header */}
            <header className="flex items-center justify-between px-6 pt-8 pb-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div
                            className="h-11 w-11 rounded-full flex items-center justify-center text-white font-bold text-lg"
                            style={{
                                background: 'linear-gradient(135deg, #8B5CF6, #C084FC)',
                                border: '2px solid rgba(139, 92, 246, 0.4)'
                            }}
                        >
                            {user.name?.charAt(0) || "U"}
                        </div>
                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 bg-green-500" style={{ borderColor: '#0F0916' }} />
                    </div>
                    <div>
                        <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-white/40">Portfolio</p>
                        <h2 className="text-base font-bold text-white">{user.name || "User"}'s Hub</h2>
                    </div>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white transition-all active:scale-95 hover:bg-red-500/20"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </button>
            </header>

            {/* Total Assets Card */}
            <section className="px-6 py-4">
                <div
                    className="relative overflow-hidden rounded-[2.5rem] p-8"
                    style={{
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(139, 92, 246, 0.1))',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                >
                    {/* Wave Background */}
                    <div className="absolute inset-0 z-0 opacity-40">
                        <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 400 200">
                            <path d="M0,150 C100,100 200,180 300,80 L400,120 L400,200 L0,200 Z" fill="url(#waveGradient)" />
                            <defs>
                                <linearGradient id="waveGradient" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#8B5CF6" />
                                    <stop offset="100%" stopColor="transparent" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-white/60">Available Balance</span>
                            <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-1 text-[10px] font-bold text-green-400">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                +{((Number(user.totalEarnings || 0) / Math.max(Number(user.totalInvested || 1), 1)) * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="mt-2">
                            <h1 className="text-[2.6rem] font-extrabold tracking-tight text-white">
                                ${Number(user.balance || 0).toFixed(2)}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="flex h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
                                <p className="text-sm font-medium text-white/60">
                                    Next ROI credit in: <span className="text-purple-400">{roiCountdown}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <section className="grid grid-cols-4 gap-2 px-6 py-6">
                <Link href="/dashboard/deposit" className="flex flex-col items-center gap-2">
                    <button className="group flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white transition-all hover:bg-purple-500 hover:border-purple-500 active:scale-95">
                        <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </button>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">Add</p>
                </Link>
                <Link href="/dashboard/network" className="flex flex-col items-center gap-2">
                    <button className="group flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white transition-all hover:bg-purple-500 hover:border-purple-500 active:scale-95">
                        <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </button>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">Network</p>
                </Link>
                <Link href="/dashboard/transactions" className="flex flex-col items-center gap-2">
                    <button className="group flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white transition-all hover:bg-purple-500 hover:border-purple-500 active:scale-95">
                        <svg className="w-6 h-6 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">History</p>
                </Link>
                <Link href="/dashboard/withdraw" className="flex flex-col items-center gap-2">
                    <button className="group flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white transition-all hover:bg-purple-500 hover:border-purple-500 active:scale-95">
                        <svg className="w-6 h-6 transition-transform group-hover:translate-y-[-2px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </button>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">Withdraw</p>
                </Link>
            </section>

            {/* Recent Payouts Card */}
            <section className="px-6 pb-6">
                <RecentPayoutsCard />
            </section>

            {/* Inactive User Alert - Shows if user has no active package */}
            <section className="px-6">
                <InactiveUserAlert />
            </section>

            {/* Active Investment Card */}
            <section className="px-6 pb-6">
                <ActiveInvestmentCard user={user} />
            </section>

            {/* Stats Cards */}
            <section className="grid grid-cols-2 gap-4 px-6">
                <div className="rounded-3xl p-5 border border-white/5" style={{ backgroundColor: '#1E142B' }}>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl mb-3" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                        <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <p className="text-xs font-medium text-white/40">Daily ROI</p>
                    <div className="mt-1 flex items-baseline gap-1">
                        <h3 className="text-xl font-bold text-white">1.00%</h3>
                        <span className="text-[10px] text-green-400">Fixed</span>
                    </div>
                </div>
                <div className="rounded-3xl p-5 border border-white/5" style={{ backgroundColor: '#1E142B' }}>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl mb-3" style={{ backgroundColor: 'rgba(192, 132, 252, 0.1)' }}>
                        <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-xs font-medium text-white/40">Total Income</p>
                    <div className="mt-1">
                        <h3 className="text-xl font-bold text-white">${Number(user.totalEarnings || 0).toFixed(2)}</h3>
                    </div>
                </div>
            </section>

            {/* New Missed ROI and Level Progress Cards */}
            <section className="grid grid-cols-2 gap-4 px-6 mt-4">
                {/* Missed ROI Card */}
                <div className="rounded-3xl p-5 border border-red-500/20 relative overflow-hidden" style={{ backgroundColor: '#1E142B' }}>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full blur-2xl" />
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl mb-3 relative z-10" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                        <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="text-xs font-medium text-white/40 relative z-10">Missed ROI</p>
                    <div className="mt-1 relative z-10">
                        <h3
                            className="text-xl font-bold"
                            style={{
                                color: '#FF6B35',
                                textShadow: '0 0 8px rgba(255, 107, 53, 0.5), 0 0 12px rgba(255, 107, 53, 0.2)'
                            }}
                        >
                            ${Number(user.totalMissedRoi || 0).toFixed(2)}
                        </h3>
                        <p className="text-[9px] text-white/30 mt-1">Locked levels</p>
                    </div>
                </div>

                {/* Current Level Progress Card */}
                {!levelProgress ? (
                    // Loading skeleton
                    <div className="rounded-3xl p-5 border border-white/5 relative overflow-hidden" style={{ backgroundColor: '#1E142B' }}>
                        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-600/10 rounded-full blur-2xl animate-pulse" />
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl mb-3 relative z-10 bg-white/10 animate-pulse">
                            <div className="h-3 w-3 bg-white/20 rounded" />
                        </div>
                        <p className="text-xs font-medium text-white/40 relative z-10">Current Level</p>
                        <div className="mt-1 relative z-10">
                            <div className="h-6 w-24 bg-white/10 rounded animate-pulse" />
                            <div className="h-2 w-16 bg-white/5 rounded animate-pulse mt-2" />
                        </div>
                    </div>
                ) : (
                    <div className="rounded-3xl p-5 border border-white/5 relative overflow-hidden" style={{ backgroundColor: '#1E142B' }}>
                        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-600/10 rounded-full blur-2xl animate-pulse" />
                        <div
                            className="flex h-8 w-8 items-center justify-center rounded-xl mb-3 relative z-10 font-extrabold text-xs animate-pulse-slow"
                            style={{
                                background: 'linear-gradient(135deg, #A855F7, #7C3AED)',
                                boxShadow: '0 0 24px rgba(139, 92, 246, 0.8), 0 0 12px rgba(168, 85, 247, 0.6)',
                                color: '#FFFFFF',
                                textShadow: '0 0 8px rgba(255, 255, 255, 0.9), 0 0 4px rgba(255, 255, 255, 0.6)'
                            }}
                        >
                            {levelProgress.unlockedLevel}
                        </div>
                        <p className="text-xs font-medium text-white/40 relative z-10">Current Level</p>
                        <div className="mt-1 relative z-10">
                            <h3
                                className="text-xl font-bold"
                                style={{
                                    color: '#FFFFFF',
                                    textShadow: '0 0 8px rgba(139, 92, 246, 0.6), 0 0 12px rgba(139, 92, 246, 0.3)'
                                }}
                            >
                                Level {levelProgress.unlockedLevel}/10
                            </h3>
                            {levelProgress.nextUnlock && (
                                <p className="text-[9px] text-purple-400 mt-1">
                                    {levelProgress.nextUnlock.remaining} more for L{levelProgress.nextUnlock.level}
                                </p>
                            )}
                            {!levelProgress.nextUnlock && (
                                <p className="text-[9px] text-purple-400 mt-1">All unlocked! 🎉</p>
                            )}
                        </div>
                    </div>
                )}
            </section>

            {/* Income Overview Chart */}
            <section className="mt-6 px-6">
                <div className="rounded-[2rem] p-6 border border-white/5 overflow-hidden" style={{ backgroundColor: '#1E142B' }}>
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-bold text-white">Income Overview</h4>
                            <p className="text-[10px] text-white/40">Monthly performance tracking</p>
                        </div>
                        <div className="flex gap-2 items-center">
                            <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" style={{ filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.6))' }} />
                            <span className="text-[10px] text-purple-400 font-semibold">LIVE</span>
                        </div>
                    </div>
                    <div className="relative h-40 w-full overflow-visible">
                        {/* Floating particles */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-4 left-8 w-2 h-2 rounded-full bg-purple-500/30 animate-float-slow" />
                            <div className="absolute top-12 right-12 w-1.5 h-1.5 rounded-full bg-purple-400/40 animate-float-medium" />
                            <div className="absolute bottom-8 left-1/4 w-1 h-1 rounded-full bg-purple-300/50 animate-float-fast" />
                            <div className="absolute top-1/3 right-1/4 w-2.5 h-2.5 rounded-full bg-purple-500/20 animate-float-slow" style={{ animationDelay: '1s' }} />
                            <div className="absolute bottom-1/4 right-1/3 w-1.5 h-1.5 rounded-full bg-purple-400/30 animate-float-medium" style={{ animationDelay: '0.5s' }} />
                        </div>

                        <svg className="h-full w-full overflow-visible animate-chart-float" viewBox="0 0 400 160">
                            <defs>
                                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                                </linearGradient>
                                <filter id="glow">
                                    <feGaussianBlur result="coloredBlur" stdDeviation="3" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            <path d="M0,140 Q50,130 80,60 T160,80 T240,30 T320,70 T400,20 L400,160 L0,160 Z" fill="url(#chartGradient)" className="animate-pulse-slow" />
                            <path d="M0,140 Q50,130 80,60 T160,80 T240,30 T320,70 T400,20" fill="none" filter="url(#glow)" stroke="#8B5CF6" strokeLinecap="round" strokeWidth="3" />
                            {/* Animated dot on peak */}
                            <circle cx="240" cy="30" fill="#8B5CF6" r="5" className="animate-ping-slow" style={{ transformOrigin: '240px 30px' }} />
                            <circle cx="240" cy="30" fill="#8B5CF6" r="4" style={{ filter: 'drop-shadow(0 0 12px rgba(139, 92, 246, 0.8))' }} />
                            <circle cx="240" cy="30" fill="#8B5CF6" fillOpacity="0.2" r="12" className="animate-pulse" />
                            {/* Additional animated points */}
                            <circle cx="80" cy="60" fill="#C084FC" r="3" className="animate-float-dot" style={{ filter: 'drop-shadow(0 0 6px rgba(192, 132, 252, 0.6))' }} />
                            <circle cx="320" cy="70" fill="#A855F7" r="3" className="animate-float-dot" style={{ animationDelay: '1s', filter: 'drop-shadow(0 0 6px rgba(168, 85, 247, 0.6))' }} />
                        </svg>
                    </div>
                    <div className="mt-4 flex justify-between px-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
                        <span>W1</span>
                        <span>W2</span>
                        <span>W3</span>
                        <span>W4</span>
                    </div>
                </div>
            </section>

            {/* Bottom navigation is handled by layout.tsx */}

            {/* Custom Styles */}
            <style jsx>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-5px); }
                    100% { transform: translateY(0px); }
                }
                .animate-float-slow {
                    animation: floatSlow 4s ease-in-out infinite;
                }
                .animate-float-medium {
                    animation: floatMedium 3s ease-in-out infinite;
                }
                .animate-float-fast {
                    animation: floatFast 2s ease-in-out infinite;
                }
                .animate-float-dot {
                    animation: floatDot 2.5s ease-in-out infinite;
                }
                .animate-chart-float {
                    animation: chartFloat 6s ease-in-out infinite;
                }
                .animate-ping-slow {
                    animation: pingSlow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
                }
                .animate-pulse-slow {
                    animation: pulseSlow 4s ease-in-out infinite;
                }
                @keyframes floatSlow {
                    0%, 100% { transform: translateY(0px) scale(1); opacity: 0.3; }
                    50% { transform: translateY(-12px) scale(1.2); opacity: 0.6; }
                }
                @keyframes floatMedium {
                    0%, 100% { transform: translateY(0px) scale(1); opacity: 0.4; }
                    50% { transform: translateY(-8px) scale(1.1); opacity: 0.7; }
                }
                @keyframes floatFast {
                    0%, 100% { transform: translateY(0px); opacity: 0.5; }
                    50% { transform: translateY(-6px); opacity: 0.8; }
                }
                @keyframes floatDot {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-4px); }
                }
                @keyframes chartFloat {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-3px); }
                }
                @keyframes pingSlow {
                    0% { transform: scale(1); opacity: 1; }
                    75%, 100% { transform: scale(2); opacity: 0; }
                }
                @keyframes pulseSlow {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.6; }
                }
            `}</style>
        </div>
    );
}
