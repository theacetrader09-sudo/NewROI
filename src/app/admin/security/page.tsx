import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function AdminSecurityPage() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "SUPERADMIN") {
        redirect("/dashboard");
    }

    const logs = await prisma.loginLog.findMany({
        include: { user: { select: { name: true, email: true, role: true } } },
        orderBy: { createdAt: "desc" },
        take: 200
    });

    // Summary stats
    const uniqueIPs = new Set(logs.map((l: any) => l.ip)).size;
    const uniqueUsers = new Set(logs.map((l: any) => l.userId)).size;
    const countries = logs.reduce((acc: Record<string, number>, l: any) => {
        if (l.country) acc[l.country] = (acc[l.country] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const topCountry = Object.entries(countries).sort((a, b) => b[1] - a[1])[0] as [string, number] | undefined;

    const thStyle = { padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.05em', whiteSpace: 'nowrap' as const };
    const tdStyle = { padding: '12px 16px', fontSize: '0.85rem', verticalAlign: 'middle' as const, borderBottom: '1px solid var(--glass-border)' };

    return (
        <div className="responsive-padding">
            <header style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', fontWeight: '800' }}>🔐 Security — Login Logs</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
                    IP addresses and geo-locations captured on every user login.
                </p>
            </header>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                {[
                    { label: 'Total Logins', value: logs.length, color: '#8b5cf6' },
                    { label: 'Unique Users', value: uniqueUsers, color: '#3b82f6' },
                    { label: 'Unique IPs', value: uniqueIPs, color: '#22c55e' },
                    { label: 'Top Country', value: topCountry ? `${topCountry[0]} (${topCountry[1]})` : '—', color: '#f59e0b' },
                ].map(card => (
                    <div key={card.label} className="glass" style={{ padding: '20px', borderRadius: '12px', borderLeft: `3px solid ${card.color}` }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: card.color }}>{card.value}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{card.label}</div>
                    </div>
                ))}
            </div>

            {/* Logs Table */}
            <div className="glass" style={{ width: '100%', overflow: 'auto', borderRadius: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--glass-border)' }}>
                            <th style={thStyle}>USER</th>
                            <th style={thStyle}>IP ADDRESS</th>
                            <th style={thStyle}>🌍 COUNTRY</th>
                            <th style={thStyle}>📍 CITY / REGION</th>
                            <th style={thStyle}>🕐 TIMEZONE</th>
                            <th style={thStyle}>ISP</th>
                            <th style={thStyle}>DATE & TIME</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No login logs yet. Logs will appear after users log in.
                                </td>
                            </tr>
                        ) : (
                            logs.map((log: any) => (
                                <tr key={log.id} style={{ transition: 'background 0.15s' }}>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: '600', fontSize: '0.88rem' }}>{log.user.name || '—'}</div>
                                        <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>{log.user.email}</div>
                                        {log.user.role === 'SUPERADMIN' && (
                                            <span style={{ fontSize: '0.65rem', background: 'rgba(139,92,246,0.2)', color: '#a78bfa', padding: '1px 6px', borderRadius: '4px' }}>ADMIN</span>
                                        )}
                                    </td>
                                    <td style={tdStyle}>
                                        <code style={{ fontSize: '0.8rem', color: '#60a5fa', background: 'rgba(59,130,246,0.08)', padding: '3px 8px', borderRadius: '4px' }}>
                                            {log.ip || '—'}
                                        </code>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {log.countryCode && (
                                                <img
                                                    src={`https://flagcdn.com/20x15/${log.countryCode.toLowerCase()}.png`}
                                                    alt={log.country || ''}
                                                    style={{ width: '20px', height: '15px', borderRadius: '2px' }}
                                                />
                                            )}
                                            <span>{log.country || '—'}</span>
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: '500' }}>{log.city || '—'}</div>
                                        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{log.region || ''}</div>
                                    </td>
                                    <td style={{ ...tdStyle, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                        {log.timezone || '—'}
                                    </td>
                                    <td style={{ ...tdStyle, fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {log.isp || '—'}
                                    </td>
                                    <td style={{ ...tdStyle, fontSize: '0.82rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                                        <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                                        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {logs.length >= 200 && (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '12px' }}>
                    Showing latest 200 records.
                </p>
            )}
        </div>
    );
}
