import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ApproveWithdrawalButton from "@/components/admin/ApproveWithdrawalButton";

// Fee constants (must match withdrawal routes)
const PLATFORM_FEE_PERCENT = 5;       // 5% platform fee
const NETWORK_FEE_PERCENT = 0.20;     // 0.20% network fee

export default async function AdminWithdrawalsPage() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "SUPERADMIN") {
        redirect("/dashboard");
    }

    const pendingWithdrawals = await prisma.transaction.findMany({
        where: {
            type: "WITHDRAWAL",
            status: "PENDING"
        },
        include: { user: true },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="responsive-padding">
            <header style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', fontWeight: '800' }}>Withdrawal Requests</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>Review and approve manual payout requests.</p>
            </header>

            <div className="glass" style={{ width: '100%', overflow: 'auto', borderRadius: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '750px' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>MEMBER</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>REQUESTED</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: '#22c55e' }}>✅ SEND TO USER</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>DESTINATION WALLET</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>DATE</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingWithdrawals.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No withdrawal requests at the moment.
                                </td>
                            </tr>
                        ) : (
                            pendingWithdrawals.map((tx) => {
                                // tx.amount = ORIGINAL requested amount (stored since latest fix)
                                const requestedAmount = Number(tx.amount);
                                const platformFee = (requestedAmount * PLATFORM_FEE_PERCENT) / 100;
                                const networkFee = (requestedAmount * NETWORK_FEE_PERCENT) / 100;
                                const netPayout = requestedAmount - platformFee - networkFee;

                                return (
                                    <tr key={tx.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ fontWeight: '600' }}>{tx.user.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{tx.user.email}</div>
                                        </td>
                                        {/* User requested this gross amount */}
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ fontWeight: '700', color: 'var(--accent-red)' }}>
                                                ${requestedAmount.toFixed(2)}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                Platform: -${platformFee.toFixed(2)} | Network: -${networkFee.toFixed(2)}
                                            </div>
                                        </td>
                                        {/* Net amount admin must send */}
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#22c55e' }}>
                                                ${netPayout.toFixed(2)} USDT
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: '#86efac', marginTop: '2px' }}>
                                                After 5% platform + 0.20% network fee
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <code style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', background: 'rgba(59, 130, 246, 0.05)', padding: '4px 8px', borderRadius: '4px' }}>
                                                {tx.referenceId}
                                            </code>
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            {new Date(tx.createdAt).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <ApproveWithdrawalButton id={tx.id} />
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
