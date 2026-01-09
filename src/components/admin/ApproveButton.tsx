"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export default function ApproveButton({ id }: { id: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleApprove = async () => {
        if (!confirm("Are you sure you want to approve this deposit? This will activate the package and start ROI.")) return;

        setLoading(true);
        try {
            const res = await fetch("/api/admin/deposits/approve", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            if (!res.ok) throw new Error("Failed to approve");

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
            {loading ? "Activating..." : "Approve"}
        </button>
    );
}
