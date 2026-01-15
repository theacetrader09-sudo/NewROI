"use client";

import { useState, useEffect } from "react";
import {
    ChevronDown,
    TrendingUp,
    ArrowDownCircle,
    ArrowUpCircle,
    Package,
    Users,
    Wallet,
    Clock,
    FileText,
    Hash,
    Calendar,
    X
} from "lucide-react";

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");
    const [dateFilter, setDateFilter] = useState("all");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [customStartDate, setCustomStartDate] = useState("");
    const [customEndDate, setCustomEndDate] = useState("");

    useEffect(() => {
        fetchTransactions();
    }, [filter, dateFilter]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            let url = "/api/user/transactions?";
            const params = new URLSearchParams();

            if (filter !== "ALL") params.append("type", filter);
            if (dateFilter !== "all" && dateFilter !== "custom") params.append("dateFilter", dateFilter);
            if (dateFilter === "custom" && customStartDate) params.append("startDate", customStartDate);
            if (dateFilter === "custom" && customEndDate) params.append("endDate", customEndDate);

            url += params.toString();
            const res = await fetch(url);
            const data = await res.json();
            if (res.ok) setTransactions(data.transactions || []);
        } catch (err) {
            console.error("Failed to fetch transactions:", err);
        } finally {
            setLoading(false);
        }
    };

    const applyCustomRange = () => {
        if (customStartDate && customEndDate) {
            setDateFilter("custom");
            setShowCustomModal(false);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type?.toUpperCase()) {
            case "DEPOSIT": return <Wallet size={20} />;
            case "ROI":
            case "DAILY_ROI": return <TrendingUp size={20} />;
            case "WITHDRAWAL":
            case "WITHDRAW": return <ArrowDownCircle size={20} />;
            case "PACKAGE_ACTIVATION": return <Package size={20} />;
            case "COMMISSION":
            case "LEVEL_1_COMMISSION":
            case "LEVEL_2_COMMISSION":
            case "LEVEL_3_COMMISSION":
            case "LEVEL_4_COMMISSION":
            case "LEVEL_5_COMMISSION":
            case "REFERRAL_COMMISSION": return <Users size={20} />;
            default: return <ArrowUpCircle size={20} />;
        }
    };

    const getTypeGradient = (type: string) => {
        switch (type?.toUpperCase()) {
            case "DEPOSIT": return "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
            case "ROI":
            case "DAILY_ROI": return "linear-gradient(135deg, #10b981 0%, #059669 100%)";
            case "WITHDRAWAL":
            case "WITHDRAW": return "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
            case "COMMISSION":
            case "LEVEL_1_COMMISSION":
            case "LEVEL_2_COMMISSION":
            case "REFERRAL_COMMISSION": return "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";
            default: return "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)";
        }
    };

    const isIncome = (type: string) => {
        return !["WITHDRAWAL", "WITHDRAW", "PACKAGE_ACTIVATION"].includes(type?.toUpperCase());
    };

    const typeFilters = ["ALL", "DEPOSIT", "ROI", "COMMISSION", "WITHDRAWAL"];
    const dateFilters = [
        { key: "all", label: "All Time" },
        { key: "today", label: "Today" },
        { key: "yesterday", label: "Yesterday" },
        { key: "7days", label: "7 Days" },
        { key: "month", label: "This Month" },
    ];

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const getDateLabel = () => {
        if (dateFilter === "custom" && customStartDate && customEndDate) {
            const start = new Date(customStartDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            const end = new Date(customEndDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            return `${start} - ${end}`;
        }
        return null;
    };

    return (
        <div className="responsive-padding" style={{ maxWidth: '600px', margin: '0 auto' }}>
            {/* Header */}
            <header style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '4px' }}>Transactions</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Recent Activity & Payments</p>
            </header>

            {/* Date Filter Row */}
            <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date Range</span>
                </div>
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    overflowX: 'auto',
                    paddingBottom: '8px',
                    scrollbarWidth: 'none'
                }}>
                    {dateFilters.map(df => (
                        <button
                            key={df.key}
                            onClick={() => setDateFilter(df.key)}
                            style={{
                                padding: '8px 14px',
                                borderRadius: '12px',
                                background: dateFilter === df.key
                                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                    : 'rgba(255, 255, 255, 0.05)',
                                color: dateFilter === df.key ? 'white' : 'rgba(255, 255, 255, 0.6)',
                                border: dateFilter === df.key ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                transition: 'all 0.3s ease',
                                whiteSpace: 'nowrap',
                                flexShrink: 0
                            }}
                        >
                            {df.label}
                        </button>
                    ))}
                    <button
                        onClick={() => setShowCustomModal(true)}
                        style={{
                            padding: '8px 14px',
                            borderRadius: '12px',
                            background: dateFilter === 'custom'
                                ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                                : 'rgba(255, 255, 255, 0.05)',
                            color: dateFilter === 'custom' ? 'white' : 'rgba(255, 255, 255, 0.6)',
                            border: dateFilter === 'custom' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <Calendar size={12} />
                        {getDateLabel() || "Custom"}
                    </button>
                </div>
            </div>

            {/* Type Filter Pills */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <FileText size={14} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</span>
                </div>
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    overflowX: 'auto',
                    paddingBottom: '8px',
                    scrollbarWidth: 'none'
                }}>
                    {typeFilters.map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '8px 14px',
                                borderRadius: '12px',
                                background: filter === f
                                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                    : 'rgba(255, 255, 255, 0.05)',
                                color: filter === f ? 'white' : 'rgba(255, 255, 255, 0.6)',
                                border: filter === f ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                transition: 'all 0.3s ease',
                                whiteSpace: 'nowrap',
                                flexShrink: 0
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom Date Modal */}
            {showCustomModal && (
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
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'linear-gradient(180deg, #1a1a2e 0%, #16162a 100%)',
                        borderRadius: '20px',
                        padding: '24px',
                        width: '100%',
                        maxWidth: '340px',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontWeight: '700', fontSize: '1.1rem' }}>Select Date Range</h3>
                            <button
                                onClick={() => setShowCustomModal(false)}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '8px',
                                    cursor: 'pointer',
                                    color: 'white'
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>From</label>
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    borderRadius: '12px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: 'white',
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>To</label>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    borderRadius: '12px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: 'white',
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>

                        <button
                            onClick={applyCustomRange}
                            disabled={!customStartDate || !customEndDate}
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '12px',
                                background: customStartDate && customEndDate
                                    ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                                    : 'rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                border: 'none',
                                cursor: customStartDate && customEndDate ? 'pointer' : 'not-allowed',
                                fontWeight: '600',
                                fontSize: '0.95rem'
                            }}
                        >
                            Apply Range
                        </button>
                    </div>
                </div>
            )}

            {/* Transaction Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {loading ? (
                    // Skeleton loaders
                    [...Array(4)].map((_, i) => (
                        <div key={i} style={{
                            padding: '20px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: '16px',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            animation: 'pulse 1.5s infinite'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)' }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ width: '120px', height: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '8px' }} />
                                    <div style={{ width: '80px', height: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }} />
                                </div>
                                <div style={{ width: '70px', height: '28px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} />
                            </div>
                        </div>
                    ))
                ) : transactions.length === 0 ? (
                    <div style={{
                        padding: '60px 20px',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '12px', opacity: 0.3 }}>📊</div>
                        <p style={{ fontWeight: '600' }}>No transactions found</p>
                        <p style={{ fontSize: '0.85rem', marginTop: '4px', opacity: 0.6 }}>Your activity will appear here</p>
                    </div>
                ) : (
                    transactions.map((tx: any) => {
                        const isExpanded = expandedId === tx.id;
                        const income = isIncome(tx.type);

                        return (
                            <div
                                key={tx.id}
                                onClick={() => toggleExpand(tx.id)}
                                style={{
                                    background: isExpanded
                                        ? 'rgba(102, 126, 234, 0.08)'
                                        : 'rgba(255, 255, 255, 0.03)',
                                    borderRadius: '16px',
                                    border: isExpanded
                                        ? '1px solid rgba(102, 126, 234, 0.3)'
                                        : '1px solid rgba(255, 255, 255, 0.06)',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'pointer'
                                }}
                            >
                                {/* Main Row */}
                                <div style={{
                                    padding: '16px 18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '14px'
                                }}>
                                    {/* Icon */}
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '14px',
                                        background: getTypeGradient(tx.type),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        flexShrink: 0,
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                                    }}>
                                        {getTypeIcon(tx.type)}
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{
                                            fontWeight: '700',
                                            fontSize: '0.95rem',
                                            marginBottom: '3px',
                                            color: 'var(--text-primary)'
                                        }}>
                                            {tx.type?.replace(/_/g, ' ')}
                                        </p>
                                        <p style={{
                                            fontSize: '0.75rem',
                                            color: 'var(--text-muted)',
                                            fontFamily: 'monospace',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {(() => {
                                                const type = tx.type?.toUpperCase();
                                                let prefix = 'TXN';
                                                if (type === 'DEPOSIT') prefix = 'DP';
                                                else if (type === 'WITHDRAWAL' || type === 'WITHDRAW') prefix = 'WD';
                                                else if (type === 'ROI' || type === 'DAILY_ROI') prefix = 'ROI';
                                                else if (type?.includes('COMMISSION')) prefix = 'CM';
                                                else if (type === 'PACKAGE_ACTIVATION') prefix = 'PKG';
                                                return `${prefix}-${tx.id.slice(-5).toUpperCase().replace(/[^A-Z0-9]/g, '')}`;
                                            })()}
                                        </p>
                                    </div>

                                    {/* Amount Badge */}
                                    <div style={{
                                        padding: '8px 14px',
                                        borderRadius: '10px',
                                        background: income
                                            ? 'rgba(16, 185, 129, 0.15)'
                                            : 'rgba(239, 68, 68, 0.15)',
                                        color: income ? '#10b981' : '#ef4444',
                                        fontWeight: '700',
                                        fontSize: '0.9rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        {income ? '+' : '-'}${Math.abs(Number(tx.amount)).toFixed(2)}
                                    </div>

                                    {/* Chevron */}
                                    <ChevronDown
                                        size={20}
                                        style={{
                                            color: 'var(--text-muted)',
                                            transition: 'transform 0.3s ease',
                                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                            flexShrink: 0
                                        }}
                                    />
                                </div>

                                {/* Expanded Details */}
                                <div style={{
                                    maxHeight: isExpanded ? '200px' : '0px',
                                    overflow: 'hidden',
                                    transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    background: 'rgba(0, 0, 0, 0.2)'
                                }}>
                                    <div style={{ padding: '0 18px 16px 18px' }}>
                                        {/* Status */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '12px 0',
                                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                                        }}>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status</span>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '8px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                background: tx.status === 'COMPLETED'
                                                    ? 'rgba(16, 185, 129, 0.15)'
                                                    : 'rgba(251, 191, 36, 0.15)',
                                                color: tx.status === 'COMPLETED' ? '#10b981' : '#fbbf24'
                                            }}>
                                                {tx.status}
                                            </span>
                                        </div>

                                        {/* Date & Time */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '12px 0',
                                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                                        }}>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Clock size={14} /> Date & Time
                                            </span>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                {new Date(tx.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}, {new Date(tx.createdAt).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>

                                        {/* Description */}
                                        {tx.description && (
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                padding: '12px 0',
                                                gap: '20px'
                                            }}>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                                    <FileText size={14} /> Notes
                                                </span>
                                                <span style={{
                                                    fontSize: '0.85rem',
                                                    color: 'var(--text-secondary)',
                                                    textAlign: 'right',
                                                    wordBreak: 'break-word'
                                                }}>
                                                    {tx.description}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
}
