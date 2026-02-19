"use client";

import { useEffect, useRef, useState } from "react";
import { ALL_NAMES, type NameEntry } from "./payoutNames";

interface PayoutItem {
    id: string;
    name: string;
    amount: number;
    country: string;
    countryFlag: string;
}

// ─── Seeded random helpers ────────────────────────────────────────────────────
const seededRandom = (seed: number): number => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

const shuffleWithSeed = (array: NameEntry[], seed: number): NameEntry[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom(seed + i) * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

// ─── Daily rotation logic ─────────────────────────────────────────────────────
// Seed changes every day – same shuffle all day, different every day.
// A name that appeared in day N can only come back on day N+3 (3-day cooldown).
const getTodayDaySeed = (): number => {
    // Use UTC date so the rotation boundary is midnight UTC worldwide
    const now = new Date();
    return Math.floor(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) /
        (1000 * 60 * 60 * 24)
    );
};

const getDailyPool = (): NameEntry[] => {
    const today = getTodayDaySeed();

    // Build the set of names used in the last 2 days
    const usedRecently = new Set<string>();
    for (let offset = 1; offset <= 2; offset++) {
        const pastShuffle = shuffleWithSeed(ALL_NAMES, today - offset);
        // Each past day displayed its first 80 names
        pastShuffle.slice(0, 80).forEach((n) => usedRecently.add(n.name));
    }

    // Today's shuffle — filter out recently used, cap at 80 unique names
    const todayShuffle = shuffleWithSeed(ALL_NAMES, today);
    const todayPool = todayShuffle.filter((n) => !usedRecently.has(n.name)).slice(0, 80);

    // Fallback: if somehow pool is still small, pad from today's full shuffle
    if (todayPool.length < 20) {
        return todayShuffle.slice(0, 60);
    }
    return todayPool;
};

// ─── Build payout items from pool (NO duplicates in the visible list) ─────────
const buildPayoutItems = (pool: NameEntry[], count: number): PayoutItem[] => {
    // Take `count` unique entries from the daily pool (pool already has no repeats)
    const slice = pool.slice(0, Math.min(count, pool.length));
    return slice.map((person, i) => ({
        id: `payout-${i}-${person.name}`,
        name: person.name,
        amount: Math.floor(Math.random() * 400) + 50,
        country: person.country,
        countryFlag: person.flag,
    }));
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function RecentPayoutsCard() {
    const [payouts, setPayouts] = useState<PayoutItem[]>([]);
    const poolRef = useRef<NameEntry[]>([]);

    useEffect(() => {
        const pool = getDailyPool();
        poolRef.current = pool;

        // Show 20 unique names in the scroll (enough for a long seamless loop)
        setPayouts(buildPayoutItems(pool, 20));
    }, []);

    // Duplicate once for seamless infinite CSS scroll – names are already unique
    const scrollItems = [...payouts, ...payouts];

    return (
        <div
            className="relative overflow-hidden rounded-[2rem] p-6 border"
            style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(192,132,252,0.08))",
                backdropFilter: "blur(20px)",
                borderColor: "rgba(139,92,246,0.3)",
                boxShadow: "0 0 40px rgba(139,92,246,0.2), inset 0 0 20px rgba(139,92,246,0.1)",
            }}
        >
            {/* Glow orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute -top-10 -left-10 w-32 h-32 rounded-full blur-3xl animate-pulse-slow"
                    style={{ background: "rgba(139,92,246,0.4)" }}
                />
                <div
                    className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl animate-pulse-slow"
                    style={{ background: "rgba(192,132,252,0.3)", animationDelay: "1s" }}
                />
            </div>

            {/* Header */}
            <div className="relative z-10 mb-4 flex items-center gap-3">
                <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                        background: "linear-gradient(135deg,rgba(16,185,129,0.2),rgba(5,150,105,0.1))",
                        border: "1px solid rgba(16,185,129,0.3)",
                    }}
                >
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div className="flex-1">
                    <h3 className="text-base font-bold text-white">Recent Payouts</h3>
                    <p className="text-xs text-white/50">Live withdrawal activity</p>
                </div>
                <div className="flex items-center gap-1.5">
                    <span
                        className="h-2 w-2 rounded-full bg-green-500 animate-pulse"
                        style={{ boxShadow: "0 0 10px rgba(16,185,129,0.8)" }}
                    />
                    <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Live</span>
                </div>
            </div>

            {/* Scroll window */}
            <div className="relative z-10 overflow-hidden" style={{ height: "200px" }}>
                <div className="scroll-container">
                    {scrollItems.map((payout, index) => (
                        <div key={`${payout.id}-${index}`} className="mb-2">
                            <div
                                className="flex items-center justify-between p-3 rounded-xl border border-white/5 transition-all duration-300 hover:bg-white/5 hover:border-purple-500/30"
                                style={{
                                    background: index % 2 === 0
                                        ? "rgba(255,255,255,0.02)"
                                        : "rgba(139,92,246,0.05)",
                                }}
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    <span className="text-2xl" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>
                                        {payout.countryFlag}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-white">{payout.name}</span>
                                        <span className="text-[10px] text-white/40">{payout.country}</span>
                                    </div>
                                </div>
                                <div
                                    className="text-sm font-bold"
                                    style={{ color: "#10B981", textShadow: "0 0 10px rgba(16,185,129,0.5)" }}
                                >
                                    +${payout.amount.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Fade overlays */}
                <div className="absolute top-0 inset-x-0 h-12 pointer-events-none z-10"
                    style={{ background: "linear-gradient(to bottom,rgba(30,20,43,1),rgba(30,20,43,0.8),transparent)" }} />
                <div className="absolute bottom-0 inset-x-0 h-12 pointer-events-none z-10"
                    style={{ background: "linear-gradient(to top,rgba(30,20,43,1),rgba(30,20,43,0.8),transparent)" }} />
            </div>

            <style jsx>{`
                @keyframes continuousScroll {
                    from { transform: translateY(0); }
                    to   { transform: translateY(-50%); }
                }
                @keyframes pulseSlow {
                    0%, 100% { opacity: 0.3; }
                    50%      { opacity: 0.6; }
                }
                .scroll-container {
                    animation: continuousScroll 30s linear infinite;
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
