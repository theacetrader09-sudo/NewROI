import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
    Users,
    Hourglass,
    BarChart3,
    Settings,
    ArrowRight,
    Megaphone
} from "lucide-react";
import ManualRoiButton from "@/components/admin/ManualRoiButton";

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "SUPERADMIN") {
        redirect("/dashboard"); // Non-admins sent back to user dashboard
    }

    const [userCount, pendingDeposits, totalVolume] = await Promise.all([
        prisma.user.count(),
        prisma.investment.count({ where: { status: "PENDING" } }),
        prisma.investment.aggregate({
            where: { status: "ACTIVE" },
            _sum: { amount: true }
        })
    ]);

    const stats = [
        { label: "Total Members", value: userCount, icon: <Users />, color: "var(--accent-blue)" },
        { label: "Pending Deposits", value: pendingDeposits, icon: <Hourglass />, color: "var(--accent-gold)" },
        { label: "Total Investments", value: `$${totalVolume._sum.amount?.toFixed(2) || "0.00"}`, icon: <BarChart3 />, color: "var(--accent-green)" },
    ];

    return (
        <div className="responsive-padding">
            <header style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: '800' }}>Platform Overview</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>Welcome to the Control Center, Super Admin.</p>
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px',
                marginBottom: '40px'
            }}>
                {stats.map((stat, i) => (
                    <div key={i} className="card" style={{ padding: 'clamp(16px, 4vw, 32px)' }}>
                        <div style={{ display: 'flex', gap: 'clamp(12px, 3vw, 20px)', alignItems: 'center' }}>
                            <div style={{
                                background: 'var(--glass-bg)',
                                padding: 'clamp(12px, 3vw, 16px)',
                                borderRadius: '12px',
                                color: stat.color,
                                flexShrink: 0
                            }}>
                                {stat.icon}
                            </div>
                            <div>
                                <p style={{ fontSize: 'clamp(0.75rem, 2vw, 0.9rem)', color: 'var(--text-secondary)', marginBottom: '4px' }}>{stat.label}</p>
                                <h3 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', fontWeight: '800' }}>{stat.value}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(16px, 3vw, 32px)' }}>
                <div className="glass" style={{ padding: 'clamp(16px, 4vw, 32px)' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: '700' }}>
                        Quick Actions
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <Link href="/admin/deposits" className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'clamp(12px, 3vw, 20px)', gap: '12px' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h4 style={{ fontWeight: '700', fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}>Verify Deposits</h4>
                                <p style={{ fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', color: 'var(--text-secondary)' }}>Check TXIDs and activate user packages.</p>
                            </div>
                            <ArrowRight size={18} style={{ flexShrink: 0 }} />
                        </Link>
                        <Link href="/admin/users" className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'clamp(12px, 3vw, 20px)', gap: '12px' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h4 style={{ fontWeight: '700', fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}>Manage Users</h4>
                                <p style={{ fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', color: 'var(--text-secondary)' }}>View, edit, and control member accounts.</p>
                            </div>
                            <ArrowRight size={18} style={{ flexShrink: 0 }} />
                        </Link>
                        <Link href="/admin/withdrawals" className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'clamp(12px, 3vw, 20px)', gap: '12px' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h4 style={{ fontWeight: '700', fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}>Manage Withdrawals</h4>
                                <p style={{ fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', color: 'var(--text-secondary)' }}>Approve or reject pending payout requests.</p>
                            </div>
                            <ArrowRight size={18} style={{ flexShrink: 0 }} />
                        </Link>
                        <Link href="/admin/settings" className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'clamp(12px, 3vw, 20px)', gap: '12px' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h4 style={{ fontWeight: '700', fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}>System Settings</h4>
                                <p style={{ fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', color: 'var(--text-secondary)' }}>Configure ROI, commissions, and platform modes.</p>
                            </div>
                            <Settings size={18} style={{ flexShrink: 0 }} />
                        </Link>
                        <Link href="/admin/announcements" className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'clamp(12px, 3vw, 20px)', gap: '12px' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h4 style={{ fontWeight: '700', fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}>Announcements</h4>
                                <p style={{ fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', color: 'var(--text-secondary)' }}>Create popup banners for all users.</p>
                            </div>
                            <Megaphone size={18} style={{ flexShrink: 0 }} />
                        </Link>
                    </div>
                </div>

                <div className="card" style={{ padding: 'clamp(16px, 4vw, 32px)' }}>
                    <h3 style={{ marginBottom: '16px', fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: '700' }}>System Info</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: 'clamp(0.8rem, 2vw, 0.9rem)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Next ROI Cron:</span>
                            <span style={{ textAlign: 'right' }}>Today, 00:00</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Active ROI %:</span>
                            <span style={{ color: 'var(--accent-green)', textAlign: 'right' }}>1%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Maintenance:</span>
                            <span style={{ color: 'var(--accent-red)', textAlign: 'right' }}>OFF</span>
                        </div>
                        <div style={{ marginTop: '20px' }}>
                            <ManualRoiButton />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
