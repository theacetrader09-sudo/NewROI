"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Transaction {
    id: string;
    type: string;
    amount: number;
    displayAmount?: number;
    netAmount?: number;
    status: string;
    description: string;
    createdAt: string;
}

interface PaginationData {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasMore: boolean;
    hasPrevious: boolean;
}

type DateRange = 'ALL' | 'TODAY' | 'YESTERDAY' | 'WEEK' | 'CUSTOM';

export default function TransactionsPage() {
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");
    const [dateRange, setDateRange] = useState<DateRange>('ALL');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [pagination, setPagination] = useState<PaginationData>({
        page: 1,
        limit: 20,
        totalCount: 0,
        totalPages: 1,
        hasMore: false,
        hasPrevious: false
    });

    useEffect(() => {
        fetchTransactions(1); // Reset to page 1 when filter changes
    }, [filter]);

    useEffect(() => {
        filterByDate();
    }, [transactions, dateRange, customStartDate, customEndDate]);

    const fetchTransactions = async (page = 1) => {
        setLoading(true);
        try {
            let url = `/api/user/transactions?page=${page}&limit=20`;
            if (filter !== "ALL") {
                url += `&type=${filter}`;
            }
            const res = await fetch(url);
            const data = await res.json();
            if (res.ok) {
                setTransactions(data.transactions || []);
                setPagination(data.pagination || {
                    page: 1,
                    limit: 20,
                    totalCount: 0,
                    totalPages: 1,
                    hasMore: false,
                    hasPrevious: false
                });
            }
        } catch (err) {
            console.error("Failed to fetch transactions:", err);
        } finally {
            setLoading(false);
        }
    };

    const filterByDate = () => {
        if (dateRange === 'ALL') {
            setFilteredTransactions(transactions);
            return;
        }

        const now = new Date();
        let startDate: Date;
        let endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);

        switch (dateRange) {
            case 'TODAY':
                startDate = new Date(now);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'YESTERDAY':
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 1);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(now);
                endDate.setDate(endDate.getDate() - 1);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'WEEK':
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 7);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'CUSTOM':
                if (!customStartDate || !customEndDate) {
                    setFilteredTransactions(transactions);
                    return;
                }
                startDate = new Date(customStartDate);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(customEndDate);
                endDate.setHours(23, 59, 59, 999);
                break;
            default:
                setFilteredTransactions(transactions);
                return;
        }

        const filtered = transactions.filter(tx => {
            const txDate = new Date(tx.createdAt);
            return txDate >= startDate && txDate <= endDate;
        });
        setFilteredTransactions(filtered);
    };

    const getTypeIcon = (type: string) => {
        switch (type?.toUpperCase()) {
            case "ROI":
            case "DAILY_ROI":
                return "trending_up";
            case "COMMISSION":
            case "LEVEL_1_COMMISSION":
            case "LEVEL_2_COMMISSION":
            case "LEVEL_3_COMMISSION":
            case "REFERRAL_COMMISSION":
                return "group_add";
            case "DEPOSIT":
                return "account_balance_wallet";
            case "WITHDRAWAL":
            case "WITHDRAW":
                return "arrow_upward";
            default:
                return "swap_horiz";
        }
    };

    const getIconColor = (type: string) => {
        switch (type?.toUpperCase()) {
            case "ROI":
            case "DAILY_ROI":
                return { color: '#4ade80', shadow: '0 0 10px rgba(74, 222, 128, 0.5), 0 0 20px rgba(74, 222, 128, 0.3)' };
            case "COMMISSION":
            case "LEVEL_1_COMMISSION":
            case "LEVEL_2_COMMISSION":
            case "LEVEL_3_COMMISSION":
            case "REFERRAL_COMMISSION":
                return { color: '#facc15', shadow: '0 0 10px rgba(250, 204, 21, 0.5), 0 0 20px rgba(250, 204, 21, 0.3)' };
            case "DEPOSIT":
                return { color: '#8b5cf6', shadow: '0 0 10px rgba(139, 92, 246, 0.5), 0 0 20px rgba(139, 92, 246, 0.3)' };
            case "WITHDRAWAL":
            case "WITHDRAW":
                return { color: '#f87171', shadow: '0 0 10px rgba(248, 113, 113, 0.5), 0 0 20px rgba(248, 113, 113, 0.3)' };
            default:
                return { color: '#9ca3af', shadow: 'none' };
        }
    };

    const isIncome = (type: string) => {
        return !["WITHDRAWAL", "WITHDRAW", "INVESTMENT"].includes(type?.toUpperCase());
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const typeFilters = ["ALL", "DEPOSIT", "ROI", "WITHDRAWAL"];
    const dateRanges: { value: DateRange; label: string }[] = [
        { value: 'ALL', label: 'All Time' },
        { value: 'TODAY', label: 'Today' },
        { value: 'YESTERDAY', label: 'Yesterday' },
        { value: 'WEEK', label: '1 Week' },
        { value: 'CUSTOM', label: 'Custom' }
    ];

    return (
        <div
            className="w-full min-h-screen relative overflow-hidden flex flex-col"
            style={{
                background: 'radial-gradient(ellipse at top, #2e1065, #0B0A14 50%, #000000)'
            }}
        >
            {/* Header */}
            <header className="px-6 pt-12 pb-4 flex items-center justify-between z-10">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-full transition-colors"
                    style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                >
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-xl font-bold tracking-tight text-white">Transaction History</h1>
                <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg"
                    style={{ background: 'linear-gradient(to bottom right, #6366f1, #9333ea)' }}
                >
                    N
                </div>
            </header>

            {/* Type Filter Pills */}
            <div className="px-6 py-2 overflow-x-auto flex space-x-3 z-10" style={{ scrollbarWidth: 'none' }}>
                {typeFilters.map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === f
                            ? 'text-white'
                            : 'text-gray-300'
                            }`}
                        style={{
                            background: filter === f
                                ? '#8b5cf6'
                                : 'rgba(46, 30, 75, 0.4)',
                            border: filter === f
                                ? 'none'
                                : '1px solid rgba(139, 92, 246, 0.15)',
                            boxShadow: filter === f
                                ? '0 4px 15px rgba(139, 92, 246, 0.4)'
                                : 'none',
                            backdropFilter: 'blur(12px)'
                        }}
                    >
                        {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {/* Date Range Filter */}
            <div className="px-6 py-3 z-10">
                <div className="flex items-center gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                    <svg className="w-4 h-4 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {dateRanges.map(d => (
                        <button
                            key={d.value}
                            onClick={() => {
                                setDateRange(d.value);
                                if (d.value === 'CUSTOM') {
                                    setShowDatePicker(true);
                                } else {
                                    setShowDatePicker(false);
                                }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${dateRange === d.value
                                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
                                : 'bg-white/5 text-gray-400 border border-white/10'
                                }`}
                        >
                            {d.label}
                        </button>
                    ))}
                </div>

                {/* Custom Date Picker */}
                {showDatePicker && dateRange === 'CUSTOM' && (
                    <div
                        className="mt-3 p-4 rounded-xl"
                        style={{ background: 'rgba(46, 30, 75, 0.6)', border: '1px solid rgba(139, 92, 246, 0.2)' }}
                    >
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="text-xs text-gray-400 mb-1 block">Start Date</label>
                                <input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg text-white text-sm"
                                    style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-400 mb-1 block">End Date</label>
                                <input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg text-white text-sm"
                                    style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Count */}
                <p className="text-xs text-gray-500 mt-2">
                    Showing {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                    {dateRange !== 'ALL' && ` (${dateRanges.find(d => d.value === dateRange)?.label})`}
                </p>
            </div>

            {/* Transactions List */}
            <main className="flex-1 overflow-y-auto px-5 pb-32 space-y-4 z-0" style={{ scrollbarWidth: 'none' }}>
                {loading ? (
                    // Skeleton loaders
                    [...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="rounded-2xl p-4 animate-pulse"
                            style={{
                                background: 'rgba(46, 30, 75, 0.4)',
                                border: '1px solid rgba(139, 92, 246, 0.15)'
                            }}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-xl bg-white/5" />
                                    <div>
                                        <div className="w-24 h-4 bg-white/10 rounded mb-2" />
                                        <div className="w-16 h-3 bg-white/5 rounded" />
                                    </div>
                                </div>
                                <div className="w-16 h-6 bg-white/10 rounded" />
                            </div>
                        </div>
                    ))
                ) : filteredTransactions.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-5xl mb-4 opacity-50">📊</div>
                        <p className="text-white font-medium text-lg">No transactions found</p>
                        <p className="text-gray-400 text-sm mt-1">
                            {dateRange !== 'ALL' ? 'Try a different date range' : 'Your activity will appear here'}
                        </p>
                    </div>
                ) : (
                    filteredTransactions.map((tx) => {
                        const iconStyle = getIconColor(tx.type);
                        const income = isIncome(tx.type);

                        return (
                            <div
                                key={tx.id}
                                className="rounded-2xl p-4 transition-transform active:scale-[0.98]"
                                style={{
                                    background: 'rgba(46, 30, 75, 0.4)',
                                    backdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(139, 92, 246, 0.15)',
                                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-4">
                                        {/* Icon with neon glow */}
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                boxShadow: iconStyle.shadow
                                            }}
                                        >
                                            <span
                                                className="material-icons-round text-2xl"
                                                style={{ color: iconStyle.color }}
                                            >
                                                {getTypeIcon(tx.type)}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">
                                                {tx.type?.replace(/_/g, ' ')}
                                            </h3>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {formatDate(tx.createdAt)} • {formatTime(tx.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold text-lg ${income ? 'text-green-400' : 'text-red-400'}`}>
                                            {income ? '+' : '-'}${Math.abs(Number(tx.displayAmount || tx.amount)).toFixed(2)}
                                        </p>
                                        <span
                                            className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                                            style={{
                                                background: tx.status === 'COMPLETED'
                                                    ? 'rgba(74, 222, 128, 0.1)'
                                                    : 'rgba(250, 204, 21, 0.1)',
                                                color: tx.status === 'COMPLETED' ? '#4ade80' : '#facc15',
                                                border: tx.status === 'COMPLETED'
                                                    ? '1px solid rgba(74, 222, 128, 0.3)'
                                                    : '1px solid rgba(250, 204, 21, 0.3)'
                                            }}
                                        >
                                            {tx.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Description */}
                                {tx.description && (
                                    <div className="pt-3 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                                        <p className="text-xs text-gray-400 truncate">{tx.description}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </main>

            {/* Pagination Controls */}
            {!loading && filteredTransactions.length > 0 && (
                <div
                    className="px-6 py-4 flex items-center justify-between backdrop-blur-md"
                    style={{
                        background: 'rgba(46, 30, 75, 0.6)',
                        borderTop: '1px solid rgba(139, 92, 246, 0.2)'
                    }}
                >
                    <button
                        onClick={() => fetchTransactions(pagination.page - 1)}
                        disabled={!pagination.hasPrevious || loading}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{
                            background: pagination.hasPrevious ? '#8b5cf6' : 'rgba(139, 92, 246, 0.2)',
                            color: pagination.hasPrevious ? 'white' : '#9ca3af',
                            border: '1px solid rgba(139, 92, 246, 0.3)'
                        }}
                    >
                        ← Previous
                    </button>

                    <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-medium text-white">
                            Page {pagination.page} of {pagination.totalPages}
                        </span>
                        <span className="text-xs text-gray-400">
                            {pagination.totalCount} total transactions
                        </span>
                    </div>

                    <button
                        onClick={() => fetchTransactions(pagination.page + 1)}
                        disabled={!pagination.hasMore || loading}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{
                            background: pagination.hasMore ? '#8b5cf6' : 'rgba(139, 92, 246, 0.2)',
                            color: pagination.hasMore ? 'white' : '#9ca3af',
                            border: '1px solid rgba(139, 92, 246, 0.3)'
                        }}
                    >
                        Next →
                    </button>
                </div>
            )}

            {/* Material Icons Font */}
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
        </div>
    );
}
