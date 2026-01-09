"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DollarSign, Key, UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function UserEditPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("balance");

    // Form states
    const [balanceAmount, setBalanceAmount] = useState("");
    const [balanceReason, setBalanceReason] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newUpline, setNewUpline] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        fetchUser();
    }, [userId]);

    const fetchUser = async () => {
        try {
            const res = await fetch(`/api/admin/users/${userId}`);
            const data = await res.json();
            if (res.ok) {
                setUser(data);
            }
        } catch (err) {
            console.error("Failed to fetch user:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (action: string, data: any) => {
        setSubmitting(true);
        setMessage({ type: "", text: "" });

        try {
            const res = await fetch("/api/admin/users/edit", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, action, data }),
            });

            const result = await res.json();

            if (!res.ok) throw new Error(result.error || "Operation failed");

            setMessage({ type: "success", text: result.message });
            fetchUser();

            // Reset forms
            setBalanceAmount("");
            setBalanceReason("");
            setNewPassword("");
            setNewUpline("");
        } catch (err: any) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Loading user...</div>;
    }

    if (!user) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>User not found.</div>;
    }

    return (
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
            <Link href="/admin/users" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)', marginBottom: '24px' }}>
                <ArrowLeft size={16} />
                Back to Users
            </Link>

            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>{user.name || "N/A"}</h1>
                <p style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
            </header>

            {/* User Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div className="card" style={{ padding: '20px' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Balance</p>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-green)' }}>${Number(user.balance).toFixed(2)}</h3>
                </div>
                <div className="card" style={{ padding: '20px' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Referral Code</p>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{user.referralCode}</h3>
                </div>
                <div className="card" style={{ padding: '20px' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Team Size</p>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{user.totalTeamSize || 0}</h3>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)' }}>
                {[
                    { id: "balance", label: "Balance", icon: <DollarSign size={16} /> },
                    { id: "password", label: "Password", icon: <Key size={16} /> },
                    { id: "upline", label: "Upline", icon: <UserPlus size={16} /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '12px 20px',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === tab.id ? '2px solid var(--accent-blue)' : '2px solid transparent',
                            color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.9rem',
                            fontWeight: activeTab === tab.id ? '600' : '400'
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
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

            {/* Tab Content */}
            <div className="glass" style={{ padding: '32px' }}>
                {activeTab === "balance" && (
                    <div>
                        <h3 style={{ marginBottom: '20px' }}>Adjust Balance</h3>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Amount (positive to add, negative to subtract)</label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="e.g. +50 or -25"
                                style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'white', padding: '12px', borderRadius: '8px', outline: 'none' }}
                                value={balanceAmount}
                                onChange={(e) => setBalanceAmount(e.target.value)}
                            />
                        </div>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Reason</label>
                            <textarea
                                placeholder="Why are you adjusting this balance?"
                                style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'white', padding: '12px', borderRadius: '8px', outline: 'none', minHeight: '80px' }}
                                value={balanceReason}
                                onChange={(e) => setBalanceReason(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => handleEdit("ADJUST_BALANCE", { amount: balanceAmount, reason: balanceReason })}
                            disabled={submitting || !balanceAmount}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '14px' }}
                        >
                            {submitting ? "Processing..." : "Apply Balance Adjustment"}
                        </button>
                    </div>
                )}

                {activeTab === "password" && (
                    <div>
                        <h3 style={{ marginBottom: '20px' }}>Reset Password</h3>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>New Password (min 6 characters)</label>
                            <input
                                type="text"
                                placeholder="Enter new password"
                                style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'white', padding: '12px', borderRadius: '8px', outline: 'none' }}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => handleEdit("RESET_PASSWORD", { newPassword })}
                            disabled={submitting || newPassword.length < 6}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '14px' }}
                        >
                            {submitting ? "Processing..." : "Reset Password"}
                        </button>
                    </div>
                )}

                {activeTab === "upline" && (
                    <div>
                        <h3 style={{ marginBottom: '20px' }}>Change Upline</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                            Current Upline: <strong>{user.upline?.name || "None"}</strong>
                        </p>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>New Upline Referral Code</label>
                            <input
                                type="text"
                                placeholder="Enter referral code of new upline"
                                style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'white', padding: '12px', borderRadius: '8px', outline: 'none' }}
                                value={newUpline}
                                onChange={(e) => setNewUpline(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => handleEdit("CHANGE_UPLINE", { newUplineCode: newUpline })}
                            disabled={submitting || !newUpline}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '14px' }}
                        >
                            {submitting ? "Processing..." : "Update Upline"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
