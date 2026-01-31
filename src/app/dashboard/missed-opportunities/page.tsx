"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface MissedTransaction {
    id: string;
    amount: number;
    description: string;
    createdAt: string;
}

export default function MissedOpportunitiesPage() {
    const router = useRouter();
    const [missedTransactions, setMissedTransactions] = useState<MissedTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalMissed, setTotalMissed] = useState(0);

    useEffect(() => {
        fetchMissedTransactions();
    }, []);

    const fetchMissedTransactions = async () => {
        try {
            const res = await fetch("/api/user/missed-opportunities");
            const data = await res.json();

            if (res.ok) {
                setMissedTransactions(data.transactions || []);
                setTotalMissed(data.totalMissed || 0);
            }
        } catch (err) {
            console.error("Failed to fetch missed transactions:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleActivatePackage = () => {
        router.push("/dashboard/deposit");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 px-4 py-8 flex items-center justify-center">
                <div className="text-white text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 px-4 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-6 mb-6">
                    <div className="flex items-start gap-4">
                        <div className="text-4xl">⚠️</div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-white mb-2">
                                You're Missing Out on Earnings!
                            </h1>
                            <p className="text-gray-300 mb-4">
                                Your network is earning, but you're not! Activate a package to start earning commissions from your team's success.
                            </p>
                            <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                                <div className="text-sm text-gray-400 mb-1">Total Missed ROI</div>
                                <div className="text-3xl font-bold text-yellow-400">
                                    ${totalMissed.toFixed(2)}
                                </div>
                            </div>
                            <button
                                onClick={handleActivatePackage}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-105"
                            >
                                Activate Package Now
                            </button>
                        </div>
                    </div>
                </div>

                {/* Missed Transactions List */}
                <div className="space-y-4">
                    {missedTransactions.length === 0 ? (
                        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 text-center">
                            <div className="text-6xl mb-4">🎉</div>
                            <h2 className="text-2xl font-bold text-white mb-2">No Missed Opportunities!</h2>
                            <p className="text-gray-400">
                                You haven't missed any earnings. Keep building your network!
                            </p>
                        </div>
                    ) : (
                        missedTransactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 hover:border-purple-500/50 transition-all"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center text-2xl">
                                            🔒
                                        </div>
                                        <div>
                                            <div className="text-lg font-semibold text-yellow-400">
                                                MISSED ROI
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-yellow-400">
                                        +${transaction.amount.toFixed(2)}
                                    </div>
                                </div>

                                <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
                                    <p className="text-gray-300 text-sm">
                                        {transaction.description}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <span>💡</span>
                                    <span>Activate your package to start earning from your team</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Bottom CTA */}
                {missedTransactions.length > 0 && (
                    <div className="mt-8 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-white mb-2">
                            Don't miss another opportunity!
                        </h3>
                        <p className="text-gray-300 mb-4">
                            Your network is growing. Activate a package today and start earning from your team's success.
                        </p>
                        <button
                            onClick={handleActivatePackage}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 px-8 rounded-xl transition-all transform hover:scale-105"
                        >
                            Activate Package Now →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
