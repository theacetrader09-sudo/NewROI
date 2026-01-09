"use client";

import { useState, useEffect } from "react";
import { Filter, ArrowUpCircle, ArrowDownCircle, Clock } from "lucide-react";

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");

    useEffect(() => {
        fetchTransactions(filter);
    }, [filter]);

    const fetchTransactions = async (type: string) => {
        setLoading(true);
        try {
            const url = type === "ALL" ? "/api/user/transactions" : `/api/user/transactions?type=${type}`;
            const res = await fetch(url);
            const data = await res.json();
            if (res.ok) setTransactions(data.transactions || []);
        } catch (err) {
            console.error("Failed to fetch transactions:", err);
        } finally {
            setLoading(false);
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "DEPOSIT": return "var(--accent-blue)";
            case "ROI": return "var(--accent-green)";
            case "COMMISSION": return "var(--accent-gold)";
            case "WITHDRAWAL": return "var(--accent-red)";
            default: return "var(--text-secondary)";
        }
    };

    const getTypeIcon = (type: string) => {
        return type === "WITHDRAWAL" ? <ArrowDownCircle size={16} /> : <ArrowUpCircle size={16} />;
    };

    const filters = ["ALL", "DEPOSIT", "ROI", "COMMISSION", "WITHDRAWAL"];

    return (
        <div>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Transaction History</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Complete ledger of your financial activities.</p>
            </header>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {filters.map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            background: filter === f ? 'var(--accent-blue)' : 'var(--glass-bg)',
                            color: filter === f ? 'white' : 'var(--text-secondary)',
                            border: filter === f ? 'none' : '1px solid var(--glass-border)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Transactions Table - Desktop */}\n            <div className="glass desktop-only" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>TYPE</th>
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>DATE</th>
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>DESCRIPTION</th>
                            <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)' }}>AMOUNT</th>
                            <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)' }}>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    Loading transactions...
                                </td>
                            </tr>
                        ) : transactions.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No transactions found.
                                </td>
                            </tr>
                        ) : (
                            transactions.map((tx: any) => (
                                <tr key={tx.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: getTypeColor(tx.type) }}>
                                            {getTypeIcon(tx.type)}
                                            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{tx.type}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        {new Date(tx.createdAt).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.85rem' }}>
                                        {tx.description}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '700', color: tx.type === 'WITHDRAWAL' ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                                        {tx.type === 'WITHDRAWAL' ? '-' : '+'}${Number(tx.amount).toFixed(2)}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            background: tx.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                                            color: tx.status === 'COMPLETED' ? 'var(--accent-green)' : 'var(--accent-gold)'
                                        }}>
                                            {tx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Transactions Cards - Mobile */}
            <div className="mobile-only">
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        Loading transactions...
                    </div>
                ) : transactions.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No transactions found.
                    </div>
                ) : (
                    transactions.map((tx: any) => (
                        <div key={tx.id} className="mobile-card">
                            <div className="mobile-card-row">
                                <span className="mobile-card-label">Type</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: getTypeColor(tx.type) }}>
                                    {getTypeIcon(tx.type)}
                                    <span className="mobile-card-value">{tx.type}</span>
                                </div>
                            </div>
                            <div className="mobile-card-row">
                                <span className="mobile-card-label">Amount</span>
                                <span className="mobile-card-value" style={{ color: tx.type === 'WITHDRAWAL' ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                                    {tx.type === 'WITHDRAWAL' ? '-' : '+'}${Number(tx.amount).toFixed(2)}
                                </span>
                            </div>
                            <div className="mobile-card-row">
                                <span className="mobile-card-label">Status</span>
                                <span style={{
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    background: tx.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                                    color: tx.status === 'COMPLETED' ? 'var(--accent-green)' : 'var(--accent-gold)'
                                }}>
                                    {tx.status}
                                </span>
                            </div>
                            <div className="mobile-card-row">
                                <span className="mobile-card-label">Date</span>
                                <span className="mobile-card-value" style={{ fontSize: '0.75rem' }}>
                                    {new Date(tx.createdAt).toLocaleString()}
                                </span>
                            </div>
                            <div className="mobile-card-row">
                                <span className="mobile-card-label">Description</span>
                                <span className="mobile-card-value" style={{ fontSize: '0.8rem', textAlign: 'right', maxWidth: '60%', wordBreak: 'break-word' }}>
                                    {tx.description}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
