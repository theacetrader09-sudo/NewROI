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

    // Fetch pending deposits (both package investments and wallet deposits)
    const pendingInvestments = await prisma.investment.findMany({
        where: { status: "PENDING" },
        include: { user: true },
        orderBy: { createdAt: 'desc' }
    });

    // Also fetch pending wallet deposits (DEPOSIT transactions with PENDING status)
    const pendingWalletDeposits = await prisma.transaction.findMany({
        where: {
            type: "DEPOSIT",
            status: "PENDING"
        },
        include: { user: true },
        orderBy: { createdAt: 'desc' }
    });

    // Combine both lists
    const pendingDeposits = [...pendingInvestments, ...pendingWalletDeposits];

    // Fetch approved deposits (last 50)
    const approvedDeposits = await prisma.investment.findMany({
        where: { status: "ACTIVE" },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        take: 50
    });

    return (
        <div className="responsive-padding" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Pending Deposits Section */}
            <header style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Deposit Verification</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Review TXIDs and manually activate packages.</p>
            </header>

            {/* Mobile-friendly card layout for pending deposits */}
            <div style={{ marginBottom: '60px' }}>
                {pendingDeposits.length === 0 ? (
                    <div className="glass" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No pending deposits to verify.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {pendingDeposits.map((dep) => (
                            <div key={dep.id} className="glass" style={{
                                padding: '20px',
                                borderRadius: '16px',
                                border: '1px solid rgba(251, 191, 36, 0.3)',
                                background: 'rgba(251, 191, 36, 0.05)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '1rem' }}>{dep.user.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{dep.user.email}</div>
                                    </div>
                                    <div style={{
                                        fontSize: '1.2rem',
                                        fontWeight: '800',
                                        color: 'var(--accent-green)',
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        padding: '6px 14px',
                                        borderRadius: '10px'
                                    }}>
                                        ${Number(dep.amount).toFixed(2)}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                        {'txid' in dep ? 'TXID' : 'DESCRIPTION'}
                                    </div>
                                    <code style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--accent-blue)',
                                        background: 'rgba(59, 130, 246, 0.1)',
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        display: 'block',
                                        wordBreak: 'break-all'
                                    }}>
                                        {'txid' in dep ? (dep as any).txid : (dep as any).description}
                                    </code>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        {new Date(dep.createdAt).toLocaleDateString()} {new Date(dep.createdAt).toLocaleTimeString()}
                                        <span style={{
                                            marginLeft: '8px',
                                            padding: '2px 8px',
                                            borderRadius: '6px',
                                            fontSize: '0.7rem',
                                            fontWeight: '600',
                                            background: 'txid' in dep ? 'rgba(168, 85, 247, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                                            color: 'txid' in dep ? '#a855f7' : '#3b82f6'
                                        }}>
                                            {'txid' in dep ? 'Package' : 'Wallet'}
                                        </span>
                                    </div>
                                    <ApproveButton id={dep.id} isTransaction={'description' in dep} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Approved Deposits Ledger */}
            <header style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Approved Deposits Ledger</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    View auto-approved vs manually-approved deposits
                </p>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {approvedDeposits.length === 0 ? (
                    <div className="glass" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No approved deposits yet.
                    </div>
                ) : (
                    approvedDeposits.map((dep) => (
                        <div key={dep.id} className="glass" style={{
                            padding: '16px 20px',
                            borderRadius: '12px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '12px'
                        }}>
                            <div style={{ flex: '1', minWidth: '150px' }}>
                                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{dep.user.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{dep.user.email}</div>
                            </div>

                            <div style={{ fontWeight: '700', color: 'var(--accent-green)', minWidth: '80px' }}>
                                ${Number(dep.amount).toFixed(2)}
                            </div>

                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '100px' }}>
                                {new Date(dep.createdAt).toLocaleDateString()}
                            </div>

                            {dep.approvalMethod === 'AUTO' ? (
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    background: 'rgba(16, 185, 129, 0.15)',
                                    color: '#10b981',
                                    minWidth: '80px',
                                    justifyContent: 'center'
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
                                    background: 'rgba(102, 126, 234, 0.15)',
                                    color: '#667eea',
                                    minWidth: '80px',
                                    justifyContent: 'center'
                                }}>
                                    👤 MANUAL
                                </span>
                            ) : (
                                <span style={{
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    background: 'rgba(107, 114, 128, 0.15)',
                                    color: '#6b7280',
                                    minWidth: '80px',
                                    textAlign: 'center'
                                }}>
                                    LEGACY
                                </span>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
