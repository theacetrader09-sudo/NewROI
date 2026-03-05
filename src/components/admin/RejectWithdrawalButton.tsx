"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";

export default function RejectWithdrawalButton({ id }: { id: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleReject = async () => {
        const reason = prompt("Optional: Enter a reason for rejection (visible to admin records):");
        if (reason === null) return; // User cancelled prompt

        if (!confirm("Are you sure you want to reject this withdrawal? The user's balance will remain unchanged and they can request again.")) return;

        setLoading(true);
        try {
            const res = await fetch("/api/admin/withdrawals/reject", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, reason }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to reject withdrawal");

            alert("✅ Withdrawal rejected. User balance is unchanged and they can request again.");
            router.refresh();
        } catch (err) {
            alert("Error: " + err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleReject}
            disabled={loading}
            className="btn"
            style={{
                padding: '8px 16px',
                fontSize: '0.8rem',
                background: 'rgba(248, 113, 113, 0.15)',
                color: '#f87171',
                border: '1px solid rgba(248, 113, 113, 0.3)',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
            }}
            onMouseEnter={e => !loading && ((e.target as HTMLButtonElement).style.background = 'rgba(248,113,113,0.3)')}
            onMouseLeave={e => !loading && ((e.target as HTMLButtonElement).style.background = 'rgba(248,113,113,0.15)')}
        >
            <XCircle size={16} />
            {loading ? "Rejecting..." : "Reject"}
        </button>
    );
}
