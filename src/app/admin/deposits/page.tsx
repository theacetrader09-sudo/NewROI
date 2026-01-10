import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ApproveButton from "@/components/admin/ApproveButton";

export default async function AdminDepositsPage() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "SUPERADMIN") {
        redirect("/dashboard");
    }

    // Fetch pending deposits
    const pendingDeposits = await prisma.investment.findMany({
        where: { status: "PENDING" },
        include: { user: true },
        orderBy: { createdAt: 'desc' }
    });

    // Fetch approved deposits (last 50)
    const approvedDeposits = await prisma.investment.findMany({
        where: { status: "ACTIVE" },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        take: 50
    });

    return (
        <div style={{ padding: '40px' }}>
            {/* Pending Deposits Section */}
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Deposit Verification</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Review TXIDs and manually activate packages.</p>
            </header>

            <div className="glass" style={{ width: '100%', overflow: 'hidden', marginBottom: '60px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>MEMBER</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>AMOUNT</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>TXID (HASH)</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>DATE</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingDeposits.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No pending deposits to verify.
                                </td>
                            </tr>
                        ) : (
                            pendingDeposits.map((dep) => (
                                <tr key={dep.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontWeight: '600' }}>{dep.user.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{dep.user.email}</div>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontWeight: '700', color: 'var(--accent-green)' }}>
                                        ${Number(dep.amount).toFixed(2)}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <code style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', background: 'rgba(59, 130, 246, 0.05)', padding: '4px 8px', borderRadius: '4px' }}>
                                            {dep.txid}
                                        </code>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        {new Date(dep.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <ApproveButton id={dep.id} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Approved Deposits Ledger */}
            <header style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Approved Deposits Ledger</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    View auto-approved vs manually-approved deposits
                </p>
            </header>

            <div className="glass" style={{ width: '100%', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>MEMBER</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>AMOUNT</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>TXID</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>DATE</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>APPROVAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {approvedDeposits.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No approved deposits yet.
                                </td>
                            </tr>
                        ) : (
                            approvedDeposits.map((dep) => (
                                <tr key={dep.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontWeight: '600' }}>{dep.user.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{dep.user.email}</div>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontWeight: '700', color: 'var(--accent-green)' }}>
                                        ${Number(dep.amount).toFixed(2)}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <code style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            {dep.txid?.substring(0, 16)}...
                                        </code>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        {new Date(dep.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        {dep.approvalMethod === 'AUTO' ? (
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '6px 12px',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                background: 'rgba(16, 185, 129, 0.1)',
                                                color: '#10b981'
                                            }}>
                                                🤖 AUTO
                                            </span>
                                        ) : dep.approvalMethod === 'MANUAL' ? (
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '6px 12px',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                background: 'rgba(102, 126, 234, 0.1)',
                                                color: '#667eea'
                                            }}>
                                                👤 MANUAL
                                            </span>
                                        ) : (
                                            <span style={{
                                                padding: '6px 12px',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                background: 'rgba(107, 114, 128, 0.1)',
                                                color: '#6b7280'
                                            }}>
                                                N/A
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
