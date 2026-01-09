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

    const pendingDeposits = await prisma.investment.findMany({
        where: { status: "PENDING" },
        include: { user: true },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div style={{ padding: '40px' }}>
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Deposit Verification</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Review TXIDs and manually activate packages.</p>
            </header>

            <div className="glass" style={{ width: '100%', overflow: 'hidden' }}>
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
        </div>
    );
}
