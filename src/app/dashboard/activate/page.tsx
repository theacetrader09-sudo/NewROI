"use client";

import { useState, useEffect } from "react";
import { Package, DollarSign, TrendingUp, Users, ArrowRight } from "lucide-react";

export default function ActivatePackagePage() {
    const [balance, setBalance] = useState(0);
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        fetchBalance();
    }, []);

    const fetchBalance = async () => {
        try {
            const res = await fetch("/api/user/profile");
            const data = await res.json();
            if (res.ok) {
                setBalance(Number(data.balance));
            }
        } catch (err) {
            console.error("Failed to fetch balance:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleActivate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ type: "", text: "" });

        try {
            const res = await fetch("/api/user/activate-package", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: parseFloat(amount) }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Activation failed");

            setMessage({ type: "success", text: data.message });
            setAmount("");
            fetchBalance(); // Refresh balance
        } catch (err: any) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
    }

    return (
        <div className="responsive-padding" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <header style={{ marginBottom: '32px', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', marginBottom: '16px' }}>
                    <Package size={32} color="white" />
                </div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Activate Investment Package</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Start earning 1% daily ROI</p>
            </header>

            {/* Current Balance */}
            <div className="glass" style={{ padding: '24px', marginBottom: '24px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Available Balance</p>
                <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-green)' }}>
                    ${balance.toFixed(2)}
                </h2>
            </div>

            {/* Message Display */}
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

            {/* Activation Form */}
            <form onSubmit={handleActivate} className="glass" style={{ padding: '32px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>
                        Package Amount (USD)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="100"
                        placeholder="Enter amount (min $100)"
                        required
                        style={{
                            width: '100%',
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--glass-border)',
                            color: 'white',
                            padding: '12px',
                            borderRadius: '8px',
                            outline: 'none',
                            fontSize: '1.1rem'
                        }}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                        Minimum: $100
                    </p>
                </div>

                {/* Benefits */}
                <div style={{ marginBottom: '24px', padding: '20px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', border: '1px solid var(--accent-blue)' }}>
                    <h4 style={{ marginBottom: '16px', fontSize: '0.9rem', fontWeight: '600' }}>✨ Benefits</h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <TrendingUp size={18} color="var(--accent-green)" />
                            <span style={{ fontSize: '0.85rem' }}>1% Daily ROI on your investment</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <DollarSign size={18} color="var(--accent-gold)" />
                            <span style={{ fontSize: '0.85rem' }}>Start earning immediately</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Users size={18} color="var(--accent-blue)" />
                            <span style={{ fontSize: '0.85rem' }}>10-level upline commissions distributed</span>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={submitting || !amount || parseFloat(amount) < 100 || parseFloat(amount) > balance}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '16px', fontSize: '1rem', gap: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    {submitting ? "Activating..." : (
                        <>
                            <Package size={20} />
                            Activate Package
                            <ArrowRight size={20} />
                        </>
                    )}
                </button>

                {parseFloat(amount) > balance && (
                    <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.85rem', color: 'var(--accent-red)' }}>
                        Insufficient balance. Please deposit more funds.
                    </p>
                )}
            </form>

            {/* Info Note */}
            <div style={{ marginTop: '24px', padding: '16px', borderRadius: '8px', background: 'rgba(251, 191, 36, 0.05)', border: '1px solid var(--accent-gold)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--accent-gold)' }}>Note:</strong> Once activated, your package will start earning 1% daily ROI. The amount will be deducted from your wallet balance and commissions will be distributed to your upline network.
                </p>
            </div>
        </div>
    );
}
