"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export default function ApproveWithdrawalButton({ id }: { id: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleApprove = async () => {
        if (!confirm("Confirm this withdrawal approval? Ensure you have sent the crypto to the user's wallet first.")) return;

        setLoading(true);
        try {
            const res = await fetch("/api/admin/withdrawals/approve", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            if (!res.ok) throw new Error("Failed to approve withdrawal");

            router.refresh();
        } catch (err) {
            alert("Error: " + err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleApprove}
            disabled={loading}
            className="btn btn-primary"
            style={{
                padding: '8px 16px',
                fontSize: '0.8rem',
                gap: '8px',
                background: 'var(--accent-green)',
                opacity: loading ? 0.5 : 1
            }}
        >
            <CheckCircle2 size={16} />
            {loading ? "Processing..." : "Approve Payout"}
        </button>
    );
}
