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
    Package
} from "lucide-react";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
    { label: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/dashboard" },
    { label: "Deposit", icon: <Wallet size={20} />, href: "/dashboard/deposit" },
    { label: "Activate Package", icon: <Package size={20} />, href: "/dashboard/activate" },
    { label: "Withdraw", icon: <ArrowUpRight size={20} />, href: "/dashboard/withdraw" },
    { label: "Network", icon: <Users size={20} />, href: "/dashboard/network" },
    { label: "Transactions", icon: <History size={20} />, href: "/dashboard/transactions" },
    { label: "Settings", icon: <Settings size={20} />, href: "/dashboard/settings" },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="glass" style={{
            width: '260px',
            height: 'calc(100vh - 40px)',
            margin: '20px',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            left: 0,
            top: 0
        }}>
            <div style={{ padding: '32px 24px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', background: 'var(--accent-blue)', borderRadius: '50%' }}></div>
                    MLM PROTECT
                </h2>
            </div>

            <nav style={{ flex: 1, padding: '0 12px' }}>
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                marginBottom: '4px',
                                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                background: isActive ? 'var(--glass-bg)' : 'transparent',
                                transition: 'all 0.2s ease',
                                border: isActive ? '1px solid var(--glass-border)' : '1px solid transparent'
                            }}
                        >
                            {item.icon}
                            <span style={{ fontSize: '0.95rem', fontWeight: isActive ? '600' : '400' }}>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div style={{ padding: '24px', borderTop: '1px solid var(--glass-border)' }}>
                <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        width: '100%',
                        padding: '12px',
                        color: 'var(--accent-red)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.95rem'
                    }}
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </aside>
    );
}
