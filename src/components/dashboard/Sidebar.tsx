"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Wallet,
    Users,
    History,
    Settings,
    LogOut,
    ArrowUpRight,
    TrendingUp,
    HelpCircle
} from "lucide-react";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
    { label: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/dashboard" },
    { label: "Deposit", icon: <Wallet size={20} />, href: "/dashboard/deposit" },
    { label: "Withdraw", icon: <ArrowUpRight size={20} />, href: "/dashboard/withdraw" },
    { label: "Network", icon: <Users size={20} />, href: "/dashboard/network" },
    { label: "Transactions", icon: <History size={20} />, href: "/dashboard/transactions" },
    { label: "Profile", icon: <Settings size={20} />, href: "/dashboard/settings" },
];

export default function Sidebar() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === href;
        }
        return pathname === href || pathname.startsWith(href + '/');
    };

    return (
        <aside
            style={{
                width: '280px',
                height: 'calc(100vh - 40px)',
                margin: '20px',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                left: 0,
                top: 0,
                background: 'rgba(25, 16, 34, 0.8)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(139, 92, 246, 0.15)',
                borderRadius: '24px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}
        >
            {/* Logo Section */}
            <div style={{ padding: '28px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                        style={{
                            width: '40px',
                            height: '40px',
                            background: 'linear-gradient(135deg, #8B5CF6, #A855F7)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
                        }}
                    >
                        <TrendingUp size={22} color="#fff" />
                    </div>
                    <div>
                        <h2 style={{
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            color: '#fff',
                            letterSpacing: '-0.5px'
                        }}>
                            NovaQuant
                        </h2>
                        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                            Investment Platform
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
                <p style={{
                    fontSize: '0.7rem',
                    color: 'rgba(255,255,255,0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    padding: '0 12px',
                    marginBottom: '12px'
                }}>
                    Menu
                </p>
                {NAV_ITEMS.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                                padding: '14px 16px',
                                borderRadius: '14px',
                                marginBottom: '6px',
                                color: active ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                                background: active
                                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(168, 85, 247, 0.2))'
                                    : 'transparent',
                                transition: 'all 0.2s ease',
                                border: active
                                    ? '1px solid rgba(139, 92, 246, 0.3)'
                                    : '1px solid transparent',
                                boxShadow: active
                                    ? '0 4px 15px rgba(139, 92, 246, 0.15)'
                                    : 'none'
                            }}
                        >
                            <div style={{
                                opacity: active ? 1 : 0.7,
                                color: active ? '#A855F7' : 'inherit'
                            }}>
                                {item.icon}
                            </div>
                            <span style={{
                                fontSize: '0.9rem',
                                fontWeight: active ? '600' : '400'
                            }}>
                                {item.label}
                            </span>
                            {active && (
                                <div style={{
                                    marginLeft: 'auto',
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: '#A855F7',
                                    boxShadow: '0 0 8px #A855F7'
                                }} />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Help & Logout */}
            <div style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <Link
                    href="/dashboard/settings/help"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        color: 'rgba(255, 255, 255, 0.5)',
                        transition: 'all 0.2s ease',
                        marginBottom: '8px'
                    }}
                >
                    <HelpCircle size={18} />
                    <span style={{ fontSize: '0.85rem' }}>Help & Support</span>
                </Link>
                <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        width: '100%',
                        padding: '12px 16px',
                        color: '#f87171',
                        background: 'rgba(248, 113, 113, 0.1)',
                        border: '1px solid rgba(248, 113, 113, 0.2)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <LogOut size={18} />
                    Log Out
                </button>
            </div>
        </aside>
    );
}
