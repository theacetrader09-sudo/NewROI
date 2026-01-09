"use client";

import { useState, useEffect } from "react";
import { Search, Edit, Users as UsersIcon } from "lucide-react";
import Link from "next/link";

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
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

    return (
        <div style={{ padding: '40px' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>User Management</h1>
                <p style={{ color: 'var(--text-secondary)' }}>View and manage all registered members.</p>
            </header>

            {/* Search Bar */}
            <form onSubmit={handleSearch} style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '12px', maxWidth: '500px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search by name, email, or referral code..."
                            style={{
                                width: '100%',
                                padding: '12px 12px 12px 40px',
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'white',
                                outline: 'none'
                            }}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>
                        Search
                    </button>
                </div>
            </form>

            {/* Users Table */}
            <div className="glass" style={{ overflow: 'auto' }}>
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
                            <tr>
                                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    Loading users...
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No users found.
                                </td>
                            </tr>
                        ) : (
                            users.map((user: any) => (
                                <tr key={user.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontWeight: '600' }}>{user.name || "N/A"}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                                        {user.role === "SUPERADMIN" && (
                                            <span style={{
                                                fontSize: '0.7rem',
                                                background: 'rgba(251, 191, 36, 0.1)',
                                                color: 'var(--accent-gold)',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                marginTop: '4px',
                                                display: 'inline-block'
                                            }}>
                                                ADMIN
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ padding: '16px 24px', fontWeight: '700', color: 'var(--accent-green)' }}>
                                        ${Number(user.balance).toFixed(2)}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <code style={{ fontSize: '0.8rem', background: 'rgba(59, 130, 246, 0.05)', padding: '4px 8px', borderRadius: '4px' }}>
                                            {user.referralCode}
                                        </code>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.85rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <UsersIcon size={14} color="var(--text-muted)" />
                                            {user._count.referrals}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        {user.upline?.name || "None"}
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                        <Link
                                            href={`/admin/users/${user.id}`}
                                            className="btn btn-outline"
                                            style={{ padding: '6px 12px', fontSize: '0.75rem', gap: '6px', display: 'inline-flex', alignItems: 'center' }}
                                        >
                                            <Edit size={14} />
                                            Edit
                                        </Link>
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
