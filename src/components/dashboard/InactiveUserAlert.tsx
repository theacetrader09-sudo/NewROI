"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function InactiveUserAlert() {
    const router = useRouter();
    const [hasActivePackage, setHasActivePackage] = useState(true);
    const [totalMissed, setTotalMissed] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkActivePackage();
        fetchMissedTotal();
    }, []);

    const checkActivePackage = async () => {
        try {
            const res = await fetch("/api/user/profile");
            const data = await res.json();

            if (res.ok) {
                // Check if user has any active investments
                const activeInvestmentsRes = await fetch("/api/user/investments");
                const investmentsData = await activeInvestmentsRes.json();

                if (activeInvestmentsRes.ok) {
                    const activeCount = investmentsData.investments?.filter(
                        (inv: any) => inv.status === "ACTIVE"
                    ).length || 0;

                    setHasActivePackage(activeCount > 0);
                }
            }
        } catch (err) {
            console.error("Failed to check active package:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMissedTotal = async () => {
        try {
            const res = await fetch("/api/user/missed-opportunities");
            const data = await res.json();

            if (res.ok) {
                setTotalMissed(data.totalMissed || 0);
            }
        } catch (err) {
            console.error("Failed to fetch missed total:", err);
        }
    };

    if (loading || hasActivePackage || totalMissed === 0) {
        return null; // Don't show alert if user has active package or no missed ROI
    }

    return (
        <div className="mb-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-6 animate-pulse-slow">
            <div className="flex items-start gap-4">
                <div className="text-4xl">⚠️</div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">
                        You're Missing Out on Earnings!
                    </h3>
                    <p className="text-gray-300 mb-3">
                        Your network is earning, but you're not! Activate a package to start earning commissions.
                    </p>

                    <div className="bg-gray-800/50 rounded-lg p-3 mb-4 inline-block">
                        <div className="text-xs text-gray-400 mb-1">Total Missed (Last 30 Days)</div>
                        <div className="text-2xl font-bold text-yellow-400">
                            ${totalMissed.toFixed(2)}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/dashboard/missed-opportunities"
                            className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-all"
                        >
                            View Missed Opportunities
                        </Link>
                        <Link
                            href="/dashboard/deposit"
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-2 px-6 rounded-lg transition-all transform hover:scale-105"
                        >
                            Activate Package Now
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
