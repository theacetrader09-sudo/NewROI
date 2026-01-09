"use client";

import { useState, useEffect } from "react";
import { Wallet, Info, ArrowUpRight } from "lucide-react";
import { useSession } from "next-auth/react";

export default function WithdrawPage() {
    const { data: session } = useSession();
    const [amount, setAmount] = useState("");
    const [wallet, setWallet] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [balance, setBalance] = useState(0);

    // Fetch latest balance
    useEffect(() => {
        const fetchProfile = async () => {
            const res = await fetch("/api/user/profile"); // I'll need to create this simple helper
            const data = await res.json();
            if (res.ok) setBalance(Number(data.balance));
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const res = await fetch("/api/withdraw", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount, walletAddress: wallet }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Request failed");

            setMessage({ type: "success", text: data.message });
            setBalance(prev => prev - parseFloat(amount));
            setAmount("");
            setWallet("");
        } catch (err: any) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Request Payout</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Minimum withdrawal amount is $20.00</p>
            </header>

            <div className="card" style={{ padding: '32px', marginBottom: '24px', background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(59, 130, 246, 0.05) 100%)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '4px' }}>Available Balance</p>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>${balance.toFixed(2)}</h2>
                    </div>
                    <div style={{ background: 'var(--accent-blue)', padding: '12px', borderRadius: '12px', color: 'white' }}>
                        <Wallet size={24} />
                    </div>
                </div>
            </div>

            <div className="glass" style={{ padding: '32px' }}>
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
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Withdrawal Amount ($)</label>
                        <input
                            type="number"
                            required
                            min="20"
                            step="0.01"
                            placeholder="Min $20.00"
                            style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'white', padding: '14px', borderRadius: '8px', outline: 'none', fontSize: '1rem' }}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Receiving Wallet Address (USDT BEP20)</label>
                        <input
                            type="text"
                            required
                            placeholder="Paste your BEP20 address here"
                            style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'white', padding: '14px', borderRadius: '8px', outline: 'none', fontSize: '1rem' }}
                            value={wallet}
                            onChange={(e) => setWallet(e.target.value)}
                        />
                    </div>

                    <div className="glass" style={{ padding: '16px', borderRadius: '12px', marginBottom: '24px', background: 'rgba(251, 191, 36, 0.05)', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '10px' }}>
                            <Info size={16} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
                            Withdrawals are processed manually by admins. Usually takes 2-24 hours.
                        </p>
                    </div>

                    <button
                        disabled={loading || balance < 20}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '16px', fontSize: '1rem' }}
                    >
                        {loading ? "Requesting..." : "Confirm Withdrawal"}
                    </button>
                </form>
            </div>
        </div>
    );
}
