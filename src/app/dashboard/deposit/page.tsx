"use client";

import { useState } from "react";
import { Copy, CheckCircle, Info } from "lucide-react";

export default function DepositPage() {
    const [amount, setAmount] = useState("");
    const [txid, setTxid] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [copied, setCopied] = useState(false);

    // Placeholder - you can edit this via SystemSettings model later
    const ADMIN_WALLET = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

    const handleCopy = () => {
        navigator.clipboard.writeText(ADMIN_WALLET);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const res = await fetch("/api/invest/deposit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount, txid }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Submission failed");

            setMessage({ type: "success", text: data.message });
            setAmount("");
            setTxid("");
        } catch (err: any) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="responsive-padding" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Active New Investment</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Send crypto to the address below and submit your Transaction ID.</p>
            </header>

            <div className="responsive-grid-2">

                {/* Step 1: Wallet Info */}
                <div className="card" style={{ padding: '32px' }}>
                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>1</div>
                        Payment Details
                    </h3>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>DEPOSIT ADDRESS (USDT BEP20)</label>
                        <div className="glass" style={{
                            padding: '16px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px'
                        }}>
                            <code style={{
                                fontSize: '0.85rem',
                                wordBreak: 'break-all',
                                flex: 1,
                                lineHeight: '1.5'
                            }}>{ADMIN_WALLET}</code>
                            <button
                                onClick={handleCopy}
                                style={{
                                    background: copied ? 'rgba(16, 185, 129, 0.1)' : 'rgba(102, 126, 234, 0.1)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: copied ? 'var(--accent-green)' : 'var(--accent-blue)',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    flexShrink: 0,
                                    transition: 'all 0.2s'
                                }}
                            >
                                {copied ? <><CheckCircle size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                            </button>
                        </div>
                    </div>

                    <div className="glass" style={{ padding: '16px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'flex', gap: '10px' }}>
                            <Info size={16} color="var(--accent-blue)" style={{ flexShrink: 0 }} />
                            Important: Only send USDT (BEP20) to this address. Any other currency may result in permanent loss.
                        </p>
                    </div>
                </div>

                {/* Step 2: Form */}
                <div className="card" style={{ padding: '32px' }}>
                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>2</div>
                        Submit Transaction Proof
                    </h3>

                    {message.text && (
                        <div style={{
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            fontSize: '0.85rem',
                            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: message.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)',
                            border: `1px solid ${message.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)'}`
                        }}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Investment Amount ($)</label>
                            <input
                                type="number"
                                required
                                min="10"
                                placeholder="e.g. 100"
                                style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'white', padding: '12px', borderRadius: '8px', outline: 'none' }}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Transaction ID (TXID)</label>
                            <input
                                type="text"
                                required
                                placeholder="Paste your hash here"
                                style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'white', padding: '12px', borderRadius: '8px', outline: 'none' }}
                                value={txid}
                                onChange={(e) => setTxid(e.target.value)}
                            />
                        </div>
                        <button
                            disabled={loading}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '14px' }}
                        >
                            {loading ? "Processing..." : "Submit Deposit"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
