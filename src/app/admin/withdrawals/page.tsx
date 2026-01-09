import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ApproveWithdrawalButton from "@/components/admin/ApproveWithdrawalButton";

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
        <div style={{ padding: '40px' }}>
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Withdrawal Requests</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Review and approve manual payout requests.</p>
            </header>

            <div className="glass" style={{ width: '100%', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>MEMBER</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>AMOUNT</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>DESTINATION WALLET</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>DATE</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingWithdrawals.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No withdrawal requests at the moment.
                                </td>
                            </tr>
                        ) : (
                            pendingWithdrawals.map((tx) => (
                                <tr key={tx.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontWeight: '600' }}>{tx.user.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{tx.user.email}</div>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontWeight: '700', color: 'var(--accent-red)' }}>
                                        -${Number(tx.amount).toFixed(2)}
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
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
