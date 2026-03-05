import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ApproveWithdrawalButton from "@/components/admin/ApproveWithdrawalButton";

// Fee constants (must match withdrawal routes)
const PLATFORM_FEE_PERCENT = 5;       // 5% platform fee
const NETWORK_FEE_PERCENT = 0.20;     // 0.20% network fee

function calcNet(requestedAmount: number) {
    const platformFee = (requestedAmount * PLATFORM_FEE_PERCENT) / 100;
    const networkFee = (requestedAmount * NETWORK_FEE_PERCENT) / 100;
    return { platformFee, networkFee, netPayout: requestedAmount - platformFee - networkFee };
}

export default async function AdminWithdrawalsPage() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "SUPERADMIN") {
        redirect("/dashboard");
    }

    const [pendingWithdrawals, processedWithdrawals] = await Promise.all([
        prisma.transaction.findMany({
            where: { type: "WITHDRAWAL", status: "PENDING" },
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.transaction.findMany({
            where: { type: "WITHDRAWAL", status: { in: ["COMPLETED", "REJECTED"] } },
            include: { user: true },
            orderBy: { createdAt: 'desc' },
            take: 100 // last 100 processed
        })
    ]);

    const tableHeadStyle = { padding: '14px 20px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.05em' };
    const tdStyle = { padding: '14px 20px', fontSize: '0.9rem', verticalAlign: 'middle' as const };

    return (
        <div className="responsive-padding">
            <header style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', fontWeight: '800' }}>Withdrawal Management</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>
                    Review pending requests and view full payout history.
                </p>
            </header>

            {/* ======== PENDING WITHDRAWALS ======== */}
            <section style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#facc15', boxShadow: '0 0 8px #facc15' }} />
                    Pending Requests
                    {pendingWithdrawals.length > 0 && (
                        <span style={{ background: '#facc15', color: '#000', borderRadius: '999px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: '700' }}>
                            {pendingWithdrawals.length}
                        </span>
                    )}
                </h2>

                <div className="glass" style={{ width: '100%', overflow: 'auto', borderRadius: '12px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '750px' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={tableHeadStyle}>MEMBER</th>
                                <th style={tableHeadStyle}>REQUESTED</th>
                                <th style={{ ...tableHeadStyle, color: '#22c55e' }}>✅ SEND TO USER</th>
                                <th style={tableHeadStyle}>DESTINATION WALLET</th>
                                <th style={tableHeadStyle}>DATE</th>
                                <th style={tableHeadStyle}>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingWithdrawals.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        ✅ No pending withdrawal requests.
                                    </td>
                                </tr>
                            ) : (
                                pendingWithdrawals.map((tx) => {
                                    const requestedAmount = Number(tx.amount);
                                    const { platformFee, networkFee, netPayout } = calcNet(requestedAmount);
                                    return (
                                        <tr key={tx.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                            <td style={tdStyle}>
                                                <div style={{ fontWeight: '600' }}>{tx.user.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{tx.user.email}</div>
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ fontWeight: '700', color: 'var(--accent-red)' }}>${requestedAmount.toFixed(2)}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                    Platform: -${platformFee.toFixed(2)} | Network: -${networkFee.toFixed(2)}
                                                </div>
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#22c55e' }}>${netPayout.toFixed(2)} USDT</div>
                                                <div style={{ fontSize: '0.7rem', color: '#86efac', marginTop: '2px' }}>After 5% + 0.20% fees</div>
                                            </td>
                                            <td style={tdStyle}>
                                                <code style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', background: 'rgba(59,130,246,0.05)', padding: '4px 8px', borderRadius: '4px', wordBreak: 'break-all' }}>
                                                    {tx.referenceId}
                                                </code>
                                            </td>
                                            <td style={{ ...tdStyle, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                                {new Date(tx.createdAt).toLocaleDateString()}<br />
                                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                                    {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </td>
                                            <td style={tdStyle}>
                                                <ApproveWithdrawalButton id={tx.id} />
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ======== PROCESSED HISTORY ======== */}
            <section>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#8b5cf6' }} />
                    Processed History
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '400' }}>
                        (last {processedWithdrawals.length} records)
                    </span>
                </h2>

                <div className="glass" style={{ width: '100%', overflow: 'auto', borderRadius: '12px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={tableHeadStyle}>MEMBER</th>
                                <th style={tableHeadStyle}>REQUESTED</th>
                                <th style={tableHeadStyle}>NET PAID OUT</th>
                                <th style={tableHeadStyle}>DESTINATION WALLET</th>
                                <th style={tableHeadStyle}>DATE</th>
                                <th style={tableHeadStyle}>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {processedWithdrawals.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No processed withdrawals yet.
                                    </td>
                                </tr>
                            ) : (
                                processedWithdrawals.map((tx) => {
                                    const requestedAmount = Number(tx.amount);
                                    const { netPayout } = calcNet(requestedAmount);
                                    const isCompleted = tx.status === 'COMPLETED';
                                    return (
                                        <tr key={tx.id} style={{ borderBottom: '1px solid var(--glass-border)', opacity: 0.85 }}>
                                            <td style={tdStyle}>
                                                <div style={{ fontWeight: '600' }}>{tx.user.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{tx.user.email}</div>
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ fontWeight: '700' }}>${requestedAmount.toFixed(2)}</div>
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ fontWeight: '700', color: isCompleted ? '#22c55e' : '#f87171' }}>
                                                    {isCompleted ? `$${netPayout.toFixed(2)} USDT` : '—'}
                                                </div>
                                            </td>
                                            <td style={tdStyle}>
                                                <code style={{ fontSize: '0.72rem', color: 'var(--accent-blue)', background: 'rgba(59,130,246,0.05)', padding: '3px 7px', borderRadius: '4px', wordBreak: 'break-all' }}>
                                                    {tx.referenceId || '—'}
                                                </code>
                                            </td>
                                            <td style={{ ...tdStyle, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                                {new Date(tx.createdAt).toLocaleDateString()}<br />
                                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                                    {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </td>
                                            <td style={tdStyle}>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '999px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '700',
                                                    background: isCompleted ? 'rgba(34,197,94,0.15)' : 'rgba(248,113,113,0.15)',
                                                    color: isCompleted ? '#22c55e' : '#f87171',
                                                    border: `1px solid ${isCompleted ? 'rgba(34,197,94,0.3)' : 'rgba(248,113,113,0.3)'}`
                                                }}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
