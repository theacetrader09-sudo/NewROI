"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, X, AlertTriangle } from "lucide-react";

export default function ApproveButton({ id }: { id: string }) {
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter();

    const handleApprove = async () => {
        setLoading(true);
        setShowConfirm(false);

        try {
            const res = await fetch("/api/admin/deposits/approve", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to approve");
            }

            router.refresh();
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (showConfirm) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(251, 191, 36, 0.1)',
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid rgba(251, 191, 36, 0.3)'
            }}>
                <AlertTriangle size={16} color="#fbbf24" />
                <span style={{ fontSize: '0.8rem', color: '#fbbf24' }}>Confirm?</span>
                <button
                    onClick={handleApprove}
                    disabled={loading}
                    style={{
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: 'var(--accent-green)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                >
                    <CheckCircle2 size={14} />
                    {loading ? "..." : "Yes"}
                </button>
                <button
                    onClick={() => setShowConfirm(false)}
                    style={{
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: 'rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                >
                    <X size={14} />
                    No
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            disabled={loading}
            style={{
                padding: '10px 20px',
                fontSize: '0.85rem',
                fontWeight: '600',
                background: 'var(--accent-green)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: loading ? 0.5 : 1,
                transition: 'all 0.2s'
            }}
        >
            <CheckCircle2 size={18} />
            {loading ? "Activating..." : "Approve"}
        </button>
    );
}
