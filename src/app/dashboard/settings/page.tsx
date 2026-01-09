"use client";

import { useState, useEffect } from "react";
import { User, Key, Save } from "lucide-react";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState("profile");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Profile form
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    // Password form
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/user/profile");
            const data = await res.json();
            if (res.ok) {
                setName(data.name || "");
                setEmail(data.email || "");
            }
        } catch (err) {
            console.error("Failed to fetch profile:", err);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const res = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Update failed");

            setMessage({ type: "success", text: "Profile updated successfully!" });
        } catch (err: any) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        if (newPassword !== confirmPassword) {
            setMessage({ type: "error", text: "Passwords do not match" });
            setLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: "error", text: "Password must be at least 6 characters" });
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/user/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Password change failed");

            setMessage({ type: "success", text: "Password changed successfully!" });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="responsive-padding" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Account Settings</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Manage your profile and security</p>
            </header>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)' }}>
                {[
                    { id: "profile", label: "Profile", icon: <User size={16} /> },
                    { id: "password", label: "Password", icon: <Key size={16} /> },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id);
                            setMessage({ type: "", text: "" });
                        }}
                        style={{
                            padding: '12px 20px',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === tab.id ? '2px solid var(--accent-blue)' : '2px solid transparent',
                            color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.9rem',
                            fontWeight: activeTab === tab.id ? '600' : '400'
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Message Display */}
            {message.text && (
                <div style={{
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    fontSize: '0.85rem',
                    background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: message.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)',
                    border: `1px solid ${message.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)'}`
                }}>
                    {message.text}
                </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
                <form onSubmit={handleProfileUpdate} className="glass" style={{ padding: '32px' }}>
                    <h3 style={{ marginBottom: '24px', fontSize: '1.2rem', fontWeight: '700' }}>Profile Information</h3>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Email Address</label>
                        <input
                            type="email"
                            disabled
                            style={{
                                width: '100%',
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--glass-border)',
                                color: 'var(--text-muted)',
                                padding: '12px',
                                borderRadius: '8px',
                                outline: 'none'
                            }}
                            value={email}
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                            Email cannot be changed
                        </p>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Full Name</label>
                        <input
                            type="text"
                            required
                            style={{
                                width: '100%',
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--glass-border)',
                                color: 'white',
                                padding: '12px',
                                borderRadius: '8px',
                                outline: 'none'
                            }}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Save size={18} />
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
                <form onSubmit={handlePasswordChange} className="glass" style={{ padding: '32px' }}>
                    <h3 style={{ marginBottom: '24px', fontSize: '1.2rem', fontWeight: '700' }}>Change Password</h3>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Current Password</label>
                        <input
                            type="password"
                            required
                            style={{
                                width: '100%',
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--glass-border)',
                                color: 'white',
                                padding: '12px',
                                borderRadius: '8px',
                                outline: 'none'
                            }}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>New Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            style={{
                                width: '100%',
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--glass-border)',
                                color: 'white',
                                padding: '12px',
                                borderRadius: '8px',
                                outline: 'none'
                            }}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Confirm New Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            style={{
                                width: '100%',
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--glass-border)',
                                color: 'white',
                                padding: '12px',
                                borderRadius: '8px',
                                outline: 'none'
                            }}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Key size={18} />
                        {loading ? "Changing..." : "Change Password"}
                    </button>
                </form>
            )}
        </div>
    );
}
