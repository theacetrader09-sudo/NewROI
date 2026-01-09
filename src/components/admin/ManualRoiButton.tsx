"use client";

import { useState } from "react";
import { Play, X } from "lucide-react";

export default function ManualRoiButton() {
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [resultMessage, setResultMessage] = useState({ show: false, type: "", text: "" });

    const handleTrigger = async () => {
        setShowConfirm(false);
        setLoading(true);

        try {
            // We use the admin-protected secret for the trigger with manual flag
            // Always force re-run for manual triggers (bypass idempotency check)
            const res = await fetch("/api/cron/roi?secret=roi-distribution-secret-2026&manual=true&force=true");
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to trigger");

            setResultMessage({
                show: true,
                type: "success",
                text: `Success! ROI Distributed.\nProcessed: ${data.details.processedCount}\nSkipped: ${data.details.skippedCount}`
            });
        } catch (err: any) {
            setResultMessage({
                show: true,
                type: "error",
                text: "Error: " + err.message
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                disabled={loading}
                className="btn btn-outline"
                style={{
                    padding: '12px 20px',
                    fontSize: '0.9rem',
                    gap: '8px',
                    color: 'var(--accent-blue)',
                    borderColor: 'var(--accent-blue)',
                    opacity: loading ? 0.5 : 1
                }}
            >
                <Play size={16} fill="currentColor" />
                {loading ? "Distributing..." : "Run Daily ROI Now"}
            </button>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div className="glass" style={{
                        padding: '32px',
                        maxWidth: '500px',
                        width: '90%',
                        position: 'relative'
                    }}>
                        <button
                            onClick={() => setShowConfirm(false)}
                            style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={20} />
                        </button>

                        <h3 style={{ marginBottom: '16px', fontSize: '1.3rem' }}>Confirm ROI Distribution</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                            Are you sure you want to trigger ROI distribution for TODAY? This will pay 1% to all active investors.
                        </p>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="btn btn-outline"
                                style={{ flex: 1, padding: '12px' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleTrigger}
                                className="btn btn-primary"
                                style={{ flex: 1, padding: '12px' }}
                            >
                                Yes, Distribute ROI
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Result Message Modal */}
            {resultMessage.show && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div className="glass" style={{
                        padding: '32px',
                        maxWidth: '500px',
                        width: '90%',
                        position: 'relative'
                    }}>
                        <button
                            onClick={() => setResultMessage({ show: false, type: "", text: "" })}
                            style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={20} />
                        </button>

                        <h3 style={{
                            marginBottom: '16px',
                            fontSize: '1.3rem',
                            color: resultMessage.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)'
                        }}>
                            {resultMessage.type === 'success' ? 'Success!' : 'Error'}
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', whiteSpace: 'pre-line' }}>
                            {resultMessage.text}
                        </p>

                        <button
                            onClick={() => setResultMessage({ show: false, type: "", text: "" })}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '12px' }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
