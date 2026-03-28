"use client";

import { useState, useEffect } from "react";
import { Search, Edit, Users as UsersIcon, LogIn, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const PAGE_SIZE = 25;

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [impersonating, setImpersonating] = useState<string | null>(null);
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setPage(1);
        try {
            const url = search ? `/api/admin/users?search=${search}` : "/api/admin/users";
            const res = await fetch(url);
            const data = await res.json();
            if (res.ok) setUsers(data);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchUsers();
    };

    const handleImpersonate = async (userId: string) => {
        setImpersonating(userId);
        try {
            const res = await fetch("/api/admin/impersonate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });
            const data = await res.json();
            if (!res.ok) { alert(data.error || "Failed"); return; }
            window.open(`/auth/impersonate?token=${data.token}`, "_blank");
        } catch {
            alert("Error generating access token.");
        } finally {
            setImpersonating(null);
        }
    };

    const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
    const paginatedUsers = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const startIndex = users.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const endIndex = Math.min(page * PAGE_SIZE, users.length);

    return (
        <div className="responsive-padding">
            <header style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', fontWeight: '800' }}>User Management</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>View and manage all registered members.</p>
            </header>

            <form onSubmit={handleSearch} style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                        <input
                            type="text"
                            placeholder="Search by name, email, or referral code..."
                            style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none', fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px', width: '100%' }}>Search</button>
                </div>
            </form>

            {/* Users Table */}
            <div className="glass" style={{ overflow: 'auto', borderRadius: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>MEMBER</th>
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>BALANCE</th>
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>REFERRAL CODE</th>
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>TEAM SIZE</th>
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>UPLINE</th>
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>JOINED</th>
                            <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading users...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No users found.</td></tr>
                        ) : (
                            paginatedUsers.map((user: any) => (
                                <tr key={user.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontWeight: '600' }}>{user.name || "N/A"}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                                        {user.role === "SUPERADMIN" && (
                                            <span style={{ fontSize: '0.7rem', background: 'rgba(251, 191, 36, 0.1)', color: 'var(--accent-gold)', padding: '2px 8px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>ADMIN</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '16px 24px', fontWeight: '700', color: 'var(--accent-green)' }}>${Number(user.balance).toFixed(2)}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <code style={{ fontSize: '0.8rem', background: 'rgba(59, 130, 246, 0.05)', padding: '4px 8px', borderRadius: '4px' }}>{user.referralCode}</code>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.85rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <UsersIcon size={14} color="var(--text-muted)" />
                                            {user._count.referrals}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.upline?.name || "None"}</td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <Link href={`/admin/users/${user.id}`} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem', gap: '6px', display: 'inline-flex', alignItems: 'center' }}>
                                                <Edit size={14} />Edit
                                            </Link>
                                            {user.role !== "SUPERADMIN" && (
                                                <button
                                                    onClick={() => handleImpersonate(user.id)}
                                                    disabled={impersonating === user.id}
                                                    style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(129,142,255,0.1)', border: '1px solid rgba(129,142,255,0.3)', color: '#818eff', borderRadius: '8px', cursor: impersonating === user.id ? 'wait' : 'pointer', opacity: impersonating === user.id ? 0.6 : 1, transition: 'all 0.2s' }}
                                                >
                                                    <LogIn size={14} />
                                                    {impersonating === user.id ? 'Opening...' : 'Access'}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {!loading && users.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', flexWrap: 'wrap', gap: '12px' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Showing <strong style={{ color: 'white' }}>{startIndex}–{endIndex}</strong> of <strong style={{ color: 'white' }}>{users.length}</strong> members
                    </p>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', background: page === 1 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', color: page === 1 ? 'var(--text-muted)' : 'white', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
                        >
                            <ChevronLeft size={16} /> Prev
                        </button>
                        <span style={{ padding: '8px 20px', borderRadius: '8px', background: 'var(--accent-blue)', color: 'white', fontSize: '0.85rem', fontWeight: '700', textAlign: 'center' }}>
                            {page} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', background: page === totalPages ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', color: page === totalPages ? 'var(--text-muted)' : 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
