"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    TrendingUp,
    Users,
    Package,
    ArrowUpRight,
    ArrowDownLeft,
    Bell,
    Copy,
    Clock,
    Home,
    Settings,
    BarChart3
} from "lucide-react";
import Link from "next/link";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";

export default function ModernDashboard() {
    const { data: session } = useSession();
    const router = useRouter();

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
    const [roiTimeLeft, setRoiTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        if (!session) {
            router.push("/login");
            return;
        }
        fetchDashboardData();
    }, [session]);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const nextROI = new Date();
            nextROI.setHours(24, 0, 0, 0);
            const diff = nextROI.getTime() - now.getTime();

            if (diff <= 0) {
                setRoiTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            } else {
                setRoiTimeLeft({
                    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((diff / 1000 / 60) % 60),
                    seconds: Math.floor((diff / 1000) % 60),
                });
            }
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await fetch("/api/user/profile");
            const data = await res.json();
            if (res.ok) {
                setUser(data);
                // Fetch recent transactions
                fetchTransactions();
            }
        } catch (err) {
            console.error("Failed to fetch dashboard:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async () => {
        try {
            const res = await fetch("/api/user/transactions?limit=5");
            const data = await res.json();
            if (res.ok && data.transactions) {
                setRecentTransactions(data.transactions);
            }
        } catch (err) {
            console.error("Failed to fetch transactions:", err);
        }
    };

    if (loading || !user) {
        return <DashboardSkeleton />;
    }

    const formatTime = (num: number) => num.toString().padStart(2, '0');

    const balanceCards = [
        {
            title: "Next ROI In",
            amount: null,
            countdown: `${formatTime(roiTimeLeft.hours)}:${formatTime(roiTimeLeft.minutes)}:${formatTime(roiTimeLeft.seconds)}`,
            subtitle: "Next distribution",
            gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            icon: "⏰"
        },
        {
            title: "Active Investment",
            amount: user.totalInvested || 0,
            cardNumber: "•• INVESTED",
            gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            icon: "📈"
        },
        {
            title: "Total Earnings",
            amount: user.totalEarnings || 0,
            cardNumber: "•• MLM",
            gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            icon: "💎"
        }
    ];

    const financeActions = [
        { icon: <Package size={20} />, label: "Activate", color: "#667eea", link: "/dashboard/activate" },
        { icon: <TrendingUp size={20} />, label: "ROI Stats", color: "#10b981", link: "/dashboard/transactions" },
        { icon: <Users size={20} />, label: "Network", color: "#f59e0b", link: "/dashboard/network" },
        { icon: <ArrowUpRight size={20} />, label: "Withdraw", color: "#ef4444", link: "/dashboard/withdraw" }
    ];

    return (
        <div className="min-h-screen bg-primary">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
                {/* Header */}
                <div className="flex justify-between items-center py-4 md:py-6 fade-in">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold text-lg" style={{ boxShadow: '0 0 15px rgba(102, 126, 234, 0.3)' }}>
                            {user.name?.charAt(0) || "U"}
                        </div>
                        <div>
                            <div className="text-base md:text-lg font-bold" style={{ color: 'var(--text-primary)', textShadow: '0 0 10px rgba(102, 126, 234, 0.3)' }}>
                                Hello, {user.name || "User"}
                            </div>
                            <div className="text-xs md:text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                Welcome back!
                            </div>
                        </div>
                    </div>
                    <button className="w-10 h-10 md:w-11 md:h-11 rounded-xl border border-glass-border bg-secondary flex items-center justify-center hover:bg-primary-light transition-colors" style={{ color: 'var(--text-primary)' }}>
                        <Bell size={20} />
                    </button>
                </div>

                {/* Total Balance */}
                <div className="py-5 md:py-6">
                    <div className="text-xs md:text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.6)', letterSpacing: '0.1em' }}>
                        TOTAL BALANCE
                    </div>
                    <div className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight gradient-text">
                        ${Number(user.balance).toFixed(2)}
                    </div>
                </div>

                {/* Cards Section */}
                <div className="mb-6 md:mb-8">
                    <div className="flex justify-between items-center mb-3 md:mb-4">
                        <span className="section-title-glow text-xs font-semibold uppercase tracking-wide">CARDS</span>
                        <Link href="/dashboard/activate" className="text-xs font-semibold text-accent-blue hover:text-blue-400 transition-colors">
                            Add +
                        </Link>
                    </div>
                    {/* Mobile: Horizontal scroll, Tablet+: Grid */}
                    <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none scrollbar-hide pb-1">
                        {balanceCards.map((card, idx) => (
                            <div
                                key={idx}
                                className="min-w-[180px] sm:min-w-[200px] md:min-w-0 h-40 sm:h-44 md:h-48 rounded-2xl p-4 md:p-5 text-white snap-start flex-shrink-0 md:flex-shrink flex flex-col justify-between card-glow"
                                style={{ background: card.gradient, border: '1px solid rgba(255, 255, 255, 0.1)' }}
                            >
                                <div className="flex gap-2 items-center text-sm opacity-90">
                                    <span className="text-lg md:text-xl">{card.icon}</span>
                                    <span className="text-xs md:text-sm">{card.title}</span>
                                </div>
                                {card.countdown ? (
                                    <div>
                                        <div className="text-2xl sm:text-3xl md:text-4xl font-bold font-mono tracking-wider">
                                            {card.countdown}
                                        </div>
                                        <div className="text-xs opacity-70 mt-1">{card.subtitle}</div>
                                    </div>
                                ) : (
                                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold">
                                        ${Number(card.amount).toFixed(2)}
                                    </div>
                                )}
                                {card.cardNumber && (
                                    <div className="flex justify-between text-xs opacity-80">
                                        <span>{card.cardNumber}</span>
                                        <span>MLM</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Finance Actions - FIXED ALIGNMENT */}
                <div className="mb-6 md:mb-8">
                    <div className="section-title-glow text-xs font-semibold uppercase tracking-wide mb-4">FINANCE</div>
                    <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-3 md:gap-4">
                        {financeActions.map((action, idx) => (
                            <Link
                                key={idx}
                                href={action.link}
                                className="flex flex-col items-center gap-2 p-2 md:p-3 rounded-lg hover:bg-secondary/50 transition-colors active:scale-95"
                            >
                                <div
                                    className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-xl flex items-center justify-center transition-transform hover:scale-105"
                                    style={{ backgroundColor: `${action.color}20`, color: action.color }}
                                >
                                    <div className="md:scale-110 lg:scale-125">
                                        {action.icon}
                                    </div>
                                </div>
                                <span className="text-xs md:text-sm font-medium text-center leading-tight" style={{ color: 'var(--text-primary)' }}>
                                    {action.label}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Transaction History - NEW */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <span className="section-title-glow text-xs font-semibold uppercase tracking-wide">LAST TRANSACTIONS</span>
                        {recentTransactions.length > 0 && (
                            <Link
                                href="/dashboard/transactions"
                                className="text-xs font-semibold text-accent-blue hover:text-blue-400 transition-colors"
                            >
                                See all →
                            </Link>
                        )}
                    </div>

                    {recentTransactions.length === 0 ? (
                        <div className="text-center py-8 px-4 bg-secondary rounded-xl border border-glass-border">
                            <div className="text-4xl mb-3 opacity-50">📊</div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                No transactions yet
                            </p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                Your transaction history will appear here
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recentTransactions.map((tx: any) => {
                                // Determine icon based on transaction type
                                let icon;
                                let isIncome = false;

                                switch (tx.type?.toUpperCase()) {
                                    case 'ROI':
                                    case 'DAILY_ROI':
                                        icon = <TrendingUp size={18} />;
                                        isIncome = tx.amount > 0;
                                        break;
                                    case 'LEVEL_1_COMMISSION':
                                    case 'LEVEL_2_COMMISSION':
                                    case 'LEVEL_3_COMMISSION':
                                    case 'LEVEL_4_COMMISSION':
                                    case 'LEVEL_5_COMMISSION':
                                    case 'REFERRAL_COMMISSION':
                                        icon = <Users size={18} />;
                                        isIncome = true;
                                        break;
                                    case 'PACKAGE_ACTIVATION':
                                    case 'DEPOSIT':
                                        icon = <Package size={18} />;
                                        isIncome = true;
                                        break;
                                    case 'WITHDRAWAL':
                                    case 'WITHDRAW':
                                        icon = <ArrowDownLeft size={18} />;
                                        isIncome = false;
                                        break;
                                    default:
                                        icon = <ArrowUpRight size={18} />;
                                        isIncome = tx.amount > 0;
                                }

                                return (
                                    <div
                                        key={tx.id}
                                        className="flex items-center gap-3 p-3 bg-secondary rounded-xl border border-glass-border hover:border-glass-border/50 transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 text-muted">
                                            {icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                                {tx.description || tx.type}
                                            </p>
                                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                                {new Date(tx.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <span className={`text-sm font-semibold tabular-nums ${isIncome ? 'text-accent-green' : 'text-accent-red'}`}>
                                            {isIncome ? '+' : '-'}${Math.abs(Number(tx.amount)).toFixed(2)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Referral Link */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <span className="section-title-glow text-xs font-semibold uppercase tracking-wide">REFERRAL LINK</span>
                        <button
                            className="text-xs font-semibold text-accent-blue flex items-center gap-1 hover:text-blue-400 transition-colors"
                            onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/register?ref=${user.referralCode}`);
                            }}
                        >
                            <Copy size={14} /> Copy
                        </button>
                    </div>
                    <div className="neon-border-animated bg-secondary rounded-xl p-4 relative">
                        <p className="text-sm font-mono break-all relative z-10" style={{ color: '#00d4ff', textShadow: '0 0 8px rgba(0, 212, 255, 0.3)' }}>
                            {window.location.origin}/register?ref={user.referralCode}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
