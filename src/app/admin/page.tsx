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
    ArrowRight
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
        <div style={{ padding: '40px' }}>
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Platform Overview</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Welcome to the Control Center, Super Admin.</p>
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
                marginBottom: '60px'
            }}>
                {stats.map((stat, i) => (
                    <div key={i} className="card" style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <div style={{
                                background: 'var(--glass-bg)',
                                padding: '16px',
                                borderRadius: '16px',
                                color: stat.color
                            }}>
                                {stat.icon}
                            </div>
                            <div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{stat.label}</p>
                                <h3 style={{ fontSize: '1.8rem', fontWeight: '800' }}>{stat.value}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                <div className="glass" style={{ padding: '32px' }}>
                    <h3 style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Quick Actions
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <Link href="/admin/deposits" className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
                            <div>
                                <h4 style={{ fontWeight: '700' }}>Verify Deposits</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Check TXIDs and activate user packages.</p>
                            </div>
                            <ArrowRight size={18} />
                        </Link>
                        <Link href="/admin/users" className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
                            <div>
                                <h4 style={{ fontWeight: '700' }}>Manage Users</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>View, edit, and control member accounts.</p>
                            </div>
                            <ArrowRight size={18} />
                        </Link>
                        <Link href="/admin/withdrawals" className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
                            <div>
                                <h4 style={{ fontWeight: '700' }}>Manage Withdrawals</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Approve or reject pending payout requests.</p>
                            </div>
                            <ArrowRight size={18} />
                        </Link>
                        <Link href="/admin/settings" className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
                            <div>
                                <h4 style={{ fontWeight: '700' }}>System Settings</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Configure ROI, commissions, and platform modes.</p>
                            </div>
                            <Settings size={18} />
                        </Link>
                    </div>
                </div>

                <div className="card" style={{ padding: '32px' }}>
                    <h3 style={{ marginBottom: '16px' }}>System Info</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Next ROI Cron:</span>
                            <span>Today, 00:00</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Active ROI %:</span>
                            <span style={{ color: 'var(--accent-green)' }}>1%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Maintenance:</span>
                            <span style={{ color: 'var(--accent-red)' }}>OFF</span>
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
