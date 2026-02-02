"use client";

import { useEffect, useState } from "react";

interface ActivationSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    totalMissed: number;
    isFirstPackage?: boolean; // New prop to determine if this is first package
}

export default function ActivationSuccessModal({ isOpen, onClose, totalMissed, isFirstPackage = false }: ActivationSuccessModalProps) {
    if (!isOpen) return null;

    // For brand new users (first package), show simple success message
    const showMissedROI = !isFirstPackage && totalMissed > 0;

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

                {/* Missed Amount Display - Only for existing users with missed ROI */}
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
                                Welcome aboard! Your <span className="font-bold text-purple-400">1% daily ROI</span> starts tomorrow.
                                Build your network to maximize earnings!
                            </>
                        ) : (
                            <>
                                From <span className="font-bold text-purple-400">tomorrow onwards</span>,
                                you'll start earning from your team's success!
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
                            <>Your 1% daily ROI will be credited automatically. Invite friends to earn even more through our referral program!</>
                        ) : (
                            <>Your commissions will start from the next ROI distribution. Keep building your network to maximize your earnings!</>
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
                    0% {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-scale-in {
                    animation: scale-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
