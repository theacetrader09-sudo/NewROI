"use client";

import { useEffect, useState } from "react";

interface ActiveInvestmentCardProps {
    user: any;
}

export default function ActiveInvestmentCard({ user }: ActiveInvestmentCardProps) {
    const [animatedProgress, setAnimatedProgress] = useState(0);

    // Calculate metrics
    const stakedAmount = Number(user.totalInvested || 0);
    const totalProfit = Number(user.totalEarnings || 0);
    const growthProgress = stakedAmount > 0 ? (totalProfit / stakedAmount) * 100 : 0;
    const hasActiveInvestment = stakedAmount > 0;

    // Animate progress bar on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedProgress(growthProgress);
        }, 300);
        return () => clearTimeout(timer);
    }, [growthProgress]);

    if (!hasActiveInvestment) {
        return null; // Don't show card if no investment
    }

    return (
        <div
            className="group relative overflow-hidden rounded-[2rem] p-6 border border-white/5 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
            style={{
                backgroundColor: '#1E142B',
                boxShadow: '0 0 40px rgba(139, 92, 246, 0.1)'
            }}
        >
            {/* Glowing background effect */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.15), transparent 70%)'
                }}
            />

            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        {/* Lightning Icon */}
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl"
                            style={{
                                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(192, 132, 252, 0.2))',
                                border: '1px solid rgba(139, 92, 246, 0.3)'
                            }}
                        >
                            <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
                            </svg>
                        </div>

                        <h3 className="text-base font-bold text-white">Active Investment</h3>
                    </div>

                    {/* Status Badge */}
                    <div
                        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 border"
                        style={{
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            borderColor: 'rgba(16, 185, 129, 0.3)'
                        }}
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"
                            style={{ boxShadow: '0 0 8px rgba(16, 185, 129, 0.8)' }}
                        />
                        <span className="text-[10px] font-extrabold text-green-400 tracking-wider">ONGOING</span>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-6 mb-5">
                    {/* Staked Amount */}
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">
                            Staked Amount
                        </p>
                        <h2 className="text-2xl font-extrabold text-white">
                            ${stakedAmount.toFixed(2)}
                        </h2>
                    </div>

                    {/* Total Profit */}
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">
                            Total Profit
                        </p>
                        <h2 className="text-2xl font-extrabold text-green-400 flex items-center gap-1">
                            <span className="text-sm">+</span>
                            ${totalProfit.toFixed(2)}
                        </h2>
                    </div>
                </div>

                {/* Progress Section */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
                            Growth Progress
                        </span>
                        <span className="text-sm font-extrabold text-white">
                            {growthProgress.toFixed(0)}%
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div
                        className="relative h-2 rounded-full overflow-hidden"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                    >
                        {/* Animated Fill */}
                        <div
                            className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                                width: `${Math.min(animatedProgress, 100)}%`,
                                background: 'linear-gradient(90deg, #8B5CF6, #C084FC)',
                                boxShadow: '0 0 12px rgba(139, 92, 246, 0.6)'
                            }}
                        />

                        {/* Shine Effect */}
                        <div
                            className="absolute top-0 h-full w-1/3 animate-shine"
                            style={{
                                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                                left: '-33%'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Custom Animation Styles */}
            <style jsx>{`
                @keyframes shine {
                    0% { left: -33%; }
                    100% { left: 133%; }
                }
                .animate-shine {
                    animation: shine 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
