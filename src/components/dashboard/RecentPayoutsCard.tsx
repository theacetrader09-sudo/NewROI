"use client";

import { useEffect, useState } from "react";

interface PayoutItem {
    id: string;
    name: string;
    amount: number;
    country: string;
    countryFlag: string;
}

// Demo data with diverse countries
const DEMO_NAMES = [
    { name: "Michael R.", country: "United States", flag: "🇺🇸" },
    { name: "Emma S.", country: "United Kingdom", flag: "🇬🇧" },
    { name: "Raj K.", country: "India", flag: "🇮🇳" },
    { name: "Anna M.", country: "Germany", flag: "🇩🇪" },
    { name: "Yuki T.", country: "Japan", flag: "🇯🇵" },
    { name: "Carlos G.", country: "Brazil", flag: "🇧🇷" },
    { name: "Sophie L.", country: "France", flag: "🇫🇷" },
    { name: "Mohammed A.", country: "UAE", flag: "🇦🇪" },
    { name: "Olivia W.", country: "Australia", flag: "🇦🇺" },
    { name: "Diego M.", country: "Mexico", flag: "🇲🇽" },
    { name: "Li Wei", country: "China", flag: "🇨🇳" },
    { name: "Isabella R.", country: "Italy", flag: "🇮🇹" },
    { name: "Priya S.", country: "India", flag: "🇮🇳" },
    { name: "Hans K.", country: "Netherlands", flag: "🇳🇱" },
    { name: "Maria C.", country: "Spain", flag: "🇪🇸" },
];

// Generate random payout data
const generateRandomPayouts = (count: number): PayoutItem[] => {
    const payouts: PayoutItem[] = [];
    for (let i = 0; i < count; i++) {
        const randomPerson = DEMO_NAMES[Math.floor(Math.random() * DEMO_NAMES.length)];
        const randomAmount = Math.floor(Math.random() * 400) + 50; // $50-$450

        payouts.push({
            id: `payout-${i}-${Date.now()}-${Math.random()}`,
            name: randomPerson.name,
            amount: randomAmount,
            country: randomPerson.country,
            countryFlag: randomPerson.flag,
        });
    }
    return payouts;
};

export default function RecentPayoutsCard() {
    const [payouts, setPayouts] = useState<PayoutItem[]>([]);

    useEffect(() => {
        // Generate initial payouts - need enough for seamless loop
        const initialPayouts = generateRandomPayouts(12);
        setPayouts(initialPayouts);
    }, []);

    // Duplicate payouts for infinite scroll effect
    const duplicatedPayouts = [...payouts, ...payouts];

    return (
        <div
            className="relative overflow-hidden rounded-[2rem] p-6 border"
            style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(192, 132, 252, 0.08))',
                backdropFilter: 'blur(20px)',
                borderColor: 'rgba(139, 92, 246, 0.3)',
                boxShadow: '0 0 40px rgba(139, 92, 246, 0.2), inset 0 0 20px rgba(139, 92, 246, 0.1)',
            }}
        >
            {/* Animated glow effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div
                    className="absolute -top-10 -left-10 w-32 h-32 rounded-full blur-3xl animate-pulse-slow"
                    style={{ background: 'rgba(139, 92, 246, 0.4)' }}
                />
                <div
                    className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl animate-pulse-slow"
                    style={{ background: 'rgba(192, 132, 252, 0.3)', animationDelay: '1s' }}
                />
            </div>

            {/* Header */}
            <div className="relative z-10 mb-4">
                <div className="flex items-center gap-3">
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1))',
                            border: '1px solid rgba(16, 185, 129, 0.3)'
                        }}
                    >
                        <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base font-bold text-white">Recent Payouts</h3>
                        <p className="text-xs text-white/50">Live withdrawal activity</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span
                            className="h-2 w-2 rounded-full bg-green-500 animate-pulse"
                            style={{ boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)' }}
                        />
                        <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Live</span>
                    </div>
                </div>
            </div>

            {/* Continuous scrolling payouts container */}
            <div
                className="relative z-10 overflow-hidden"
                style={{ height: '200px' }}
            >
                {/* Scrolling wrapper with duplicated content for infinite loop */}
                <div className="scroll-container">
                    {duplicatedPayouts.map((payout, index) => (
                        <div
                            key={`${payout.id}-${index}`}
                            className="mb-2"
                        >
                            <div
                                className="flex items-center justify-between p-3 rounded-xl border border-white/5 transition-all duration-300 hover:bg-white/5 hover:border-purple-500/30"
                                style={{
                                    background: index % 2 === 0
                                        ? 'rgba(255, 255, 255, 0.02)'
                                        : 'rgba(139, 92, 246, 0.05)',
                                }}
                            >
                                {/* Flag and Name */}
                                <div className="flex items-center gap-3 flex-1">
                                    <span
                                        className="text-2xl"
                                        style={{
                                            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
                                        }}
                                    >
                                        {payout.countryFlag}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-white">
                                            {payout.name}
                                        </span>
                                        <span className="text-[10px] text-white/40">
                                            {payout.country}
                                        </span>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div
                                    className="text-sm font-bold"
                                    style={{
                                        color: '#10B981',
                                        textShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
                                    }}
                                >
                                    +${payout.amount.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Gradient fade overlay at top and bottom */}
                <div
                    className="absolute top-0 left-0 right-0 h-12 pointer-events-none z-10"
                    style={{
                        background: 'linear-gradient(to bottom, rgba(30, 20, 43, 1), rgba(30, 20, 43, 0.8), transparent)'
                    }}
                />
                <div
                    className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none z-10"
                    style={{
                        background: 'linear-gradient(to top, rgba(30, 20, 43, 1), rgba(30, 20, 43, 0.8), transparent)'
                    }}
                />
            </div>

            {/* Custom animations */}
            <style jsx>{`
                @keyframes continuousScroll {
                    0% {
                        transform: translateY(0);
                    }
                    100% {
                        transform: translateY(-50%);
                    }
                }

                @keyframes pulseSlow {
                    0%, 100% {
                        opacity: 0.3;
                    }
                    50% {
                        opacity: 0.6;
                    }
                }

                .scroll-container {
                    animation: continuousScroll 20s linear infinite;
                    will-change: transform;
                }

                .scroll-container:hover {
                    animation-play-state: paused;
                }

                .animate-pulse-slow {
                    animation: pulseSlow 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
