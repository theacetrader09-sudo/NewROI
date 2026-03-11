"use client";

import { useState, useEffect } from "react";

export default function LifestyleIncomeButton() {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<{ qualifiedCount: number; paidThisMonth: number; pendingCount: number; totalPayout: number } | null>(null);
    const [result, setResult] = useState<{ message: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/admin/lifestyle-income/distribute");
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (_) { }
    };

    const handleDistribute = async () => {
        if (!confirm(`Pay $2,800 lifestyle income to ${stats?.pendingCount ?? "all"} qualified user(s) this month?`)) return;
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch("/api/admin/lifestyle-income/distribute", { method: "POST" });
            const data = await res.json();
            setResult({ message: data.message || data.error, type: res.ok ? "success" : "error" });
            fetchStats();
        } catch (err) {
            setResult({ message: "Network error", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginTop: "16px", padding: "16px", borderRadius: "12px", background: "rgba(234, 179, 8, 0.07)", border: "1px solid rgba(234, 179, 8, 0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontWeight: "700", fontSize: "0.95rem" }}>⭐ Lifestyle Income</span>
                {stats && (
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                        {stats.qualifiedCount} qualified · {stats.pendingCount} pending
                    </span>
                )}
            </div>
            {stats && stats.pendingCount > 0 && (
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "10px" }}>
                    Total payout: <strong style={{ color: "#eab308" }}>${stats.totalPayout.toLocaleString()}</strong>
                </p>
            )}
            <button
                onClick={handleDistribute}
                disabled={loading || (stats?.pendingCount === 0)}
                style={{
                    width: "100%", padding: "10px", borderRadius: "8px", fontWeight: "700",
                    fontSize: "0.85rem", cursor: loading || stats?.pendingCount === 0 ? "not-allowed" : "pointer",
                    opacity: stats?.pendingCount === 0 ? 0.5 : 1,
                    background: "linear-gradient(135deg, #eab308, #ca8a04)",
                    color: "#000", border: "none",
                }}
            >
                {loading ? "Distributing..." : stats?.pendingCount === 0 ? "✅ All Paid This Month" : `Pay $2,800 × ${stats?.pendingCount} Users`}
            </button>
            {result && (
                <p style={{ marginTop: "8px", fontSize: "0.8rem", color: result.type === "success" ? "#4ade80" : "#f87171" }}>
                    {result.message}
                </p>
            )}
        </div>
    );
}
