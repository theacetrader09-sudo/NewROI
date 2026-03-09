"use client";

import { useEffect, useState } from "react";

interface ActivationSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    totalMissed: number;
    isFirstPackage?: boolean;
    investmentAmount?: number; // NEW — used to show correct ROI tier
}

// ── Tiered ROI helper (matches the same logic in approve/route.ts) ──────────
function getTier(amount: number): { rate: number; label: string; color: string } {
    if (amount >= 30000) return { rate: 5, label: "⚡ Tier 4", color: "#F59E0B" };
    if (amount >= 6000) return { rate: 2, label: "💜 Tier 3", color: "#818CF8" };
    if (amount >= 1000) return { rate: 1.5, label: "🔵 Tier 2", color: "#60A5FA" };
    return { rate: 1, label: "🟢 Tier 1", color: "#4ADE80" };
}

export default function ActivationSuccessModal({
    isOpen,
    onClose,
    totalMissed,
    isFirstPackage = false,
    investmentAmount = 0,
}: ActivationSuccessModalProps) {
    if (!isOpen) return null;

    const showMissedROI = !isFirstPackage && totalMissed > 0;
    const tier = getTier(investmentAmount);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-purple-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold text-white text-center mb-4">
                    🎉 Package Activated!
                </h2>

                {/* ROI Tier Badge */}
                <div className="flex justify-center mb-4">
                    <span
                        className="px-4 py-1.5 rounded-full text-sm font-bold"
                        style={{
                            background: `${tier.color}20`,
                            border: `1px solid ${tier.color}50`,
                            color: tier.color,
                        }}
                    >
                        {tier.label} — {tier.rate}% Daily ROI
                    </span>
                </div>

                {/* Missed Amount Display — only for existing users */}
                {showMissedROI && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 mb-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-300 mb-2">
                                You previously missed
                            </p>
                            <div className="text-4xl font-bold text-yellow-400 mb-2">
                                ${totalMissed.toFixed(2)}
                            </div>
                            <p className="text-xs text-gray-400">
                                in commission opportunities
                            </p>
                        </div>
                    </div>
                )}

                {/* Success Message */}
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6 mb-6">
                    <p className="text-center text-gray-200 text-lg leading-relaxed">
                        {isFirstPackage ? (
                            <>
                                Welcome aboard! Your{" "}
                                <span className="font-bold" style={{ color: tier.color }}>
                                    {tier.rate}% daily ROI
                                </span>{" "}
                                starts tomorrow.
                                {investmentAmount >= 6000 && (
                                    <span className="block text-sm text-white/60 mt-1">
                                        {investmentAmount >= 30000
                                            ? "🏆 Tier 4 — Maximum 5% daily earnings!"
                                            : "⭐ Tier 3 — 2% daily earnings unlocked!"}
                                    </span>
                                )}
                                {" "}Build your network to maximize earnings!
                            </>
                        ) : (
                            <>
                                From{" "}
                                <span className="font-bold text-purple-400">tomorrow onwards</span>,
                                you'll earn{" "}
                                <span className="font-bold" style={{ color: tier.color }}>
                                    {tier.rate}%/day
                                </span>{" "}
                                and commission from your team's success!
                            </>
                        )}
                    </p>
                </div>

                {/* Info */}
                <div className="flex items-start gap-3 mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-gray-300">
                        {isFirstPackage ? (
                            <>Your {tier.rate}% daily ROI will be credited automatically each day. Invite friends to earn even more through our referral program!</>
                        ) : (
                            <>Your commissions and {tier.rate}% ROI will start from the next distribution. Keep building your network to maximize your earnings!</>
                        )}
                    </p>
                </div>

                {/* CTA Button */}
                <button
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                >
                    {isFirstPackage ? "Let's Get Started! 🚀" : "Got it! Let's Start Earning"}
                </button>
            </div>

            <style jsx>{`
                @keyframes scale-in {
                    0% { opacity: 0; transform: scale(0.9); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .animate-scale-in { animation: scale-in 0.3s ease-out; }
            `}</style>
        </div>
    );
}
