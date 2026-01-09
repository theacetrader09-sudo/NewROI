"use client";

import { useState, useEffect } from "react";
import { Settings as SettingsIcon, DollarSign, Percent, Wallet, Power, X } from "lucide-react";

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [activeTab, setActiveTab] = useState("roi");
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingUpdates, setPendingUpdates] = useState<any>(null);

    // Form states
    const [roiPercent, setRoiPercent] = useState(1.0);
    const [levelRates, setLevelRates] = useState<number[]>([6, 5, 2, 2, 1, 1, 0.5, 0.5, 0.25, 0.10]);
    const [adminWallet, setAdminWallet] = useState("");
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [roiHoliday, setRoiHoliday] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/admin/settings");
            const data = await res.json();
            if (res.ok) {
                setSettings(data);
                setRoiPercent(data.dailyRoiPercent);
                setLevelRates(JSON.parse(data.levelConfig));
                setAdminWallet(data.adminWallet);
                setMaintenanceMode(data.maintenanceMode);
                setRoiHoliday(data.roiHoliday);
            }
        } catch (err) {
            console.error("Failed to fetch settings:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (updates: any) => {
        setPendingUpdates(updates);
        setShowConfirm(true);
    };

    const confirmSave = async () => {
        if (!pendingUpdates) return;

        setShowConfirm(false);
        setSaving(true);
        setMessage({ type: "", text: "" });

        try {
            const res = await fetch("/api/admin/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(pendingUpdates),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Update failed");

            setMessage({ type: "success", text: data.message });
            fetchSettings();
        } catch (err: any) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setSaving(false);
            setPendingUpdates(null);
        }
    };

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Loading settings...</div>;
    }

    return (
        <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <SettingsIcon size={28} />
                    System Configuration
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Manage platform-wide settings and parameters.</p>
            </header>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)' }}>
                {[
                    { id: "roi", label: "ROI Settings", icon: <Percent size={16} /> },
                    { id: "levels", label: "Commission Levels", icon: <DollarSign size={16} /> },
                    { id: "wallet", label: "Admin Wallet", icon: <Wallet size={16} /> },
                    { id: "system", label: "System Modes", icon: <Power size={16} /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
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

            {/* Tab Content */}
            <div className="glass" style={{ padding: '32px' }}>
                {activeTab === "roi" && (
                    <div>
                        <h3 style={{ marginBottom: '20px' }}>Daily ROI Percentage</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                            Current: <strong>{roiPercent}%</strong> (Applied to all active investments daily at 00:00 UTC)
                        </p>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>New ROI % (e.g., 1.0 for 1%)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="10"
                                placeholder="1.0"
                                style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'white', padding: '12px', borderRadius: '8px', outline: 'none' }}
                                value={roiPercent}
                                onChange={(e) => setRoiPercent(parseFloat(e.target.value))}
                            />
                        </div>
                        <button
                            onClick={() => handleSave({ dailyRoiPercent: roiPercent })}
                            disabled={saving}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '14px' }}
                        >
                            {saving ? "Saving..." : "Update ROI Percentage"}
                        </button>
                    </div>
                )}

                {activeTab === "levels" && (
                    <div>
                        <h3 style={{ marginBottom: '20px' }}>10-Level Commission Rates (%)</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
                            {levelRates.map((rate, i) => (
                                <div key={i}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        Level {i + 1}
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'white', padding: '10px', borderRadius: '8px', outline: 'none' }}
                                        value={rate}
                                        onChange={(e) => {
                                            const updated = [...levelRates];
                                            updated[i] = parseFloat(e.target.value);
                                            setLevelRates(updated);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => handleSave({ levelConfig: levelRates })}
                            disabled={saving}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '14px' }}
                        >
                            {saving ? "Saving..." : "Update Commission Rates"}
                        </button>
                    </div>
                )}

                {activeTab === "wallet" && (
                    <div>
                        <h3 style={{ marginBottom: '20px' }}>Admin Crypto Wallet</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                            This address is displayed to users for deposits.
                        </p>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Wallet Address (USDT BEP20)</label>
                            <input
                                type="text"
                                placeholder="0x..."
                                style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'white', padding: '12px', borderRadius: '8px', outline: 'none' }}
                                value={adminWallet}
                                onChange={(e) => setAdminWallet(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => handleSave({ adminWallet })}
                            disabled={saving}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '14px' }}
                        >
                            {saving ? "Saving..." : "Update Wallet Address"}
                        </button>
                    </div>
                )}

                {activeTab === "system" && (
                    <div>
                        <h3 style={{ marginBottom: '20px' }}>System Control Switches</h3>

                        <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ marginBottom: '4px' }}>Maintenance Mode</h4>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Block all user access to the platform</p>
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={maintenanceMode}
                                        onChange={(e) => {
                                            setMaintenanceMode(e.target.checked);
                                            handleSave({ maintenanceMode: e.target.checked });
                                        }}
                                        style={{ width: '40px', height: '20px' }}
                                    />
                                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: maintenanceMode ? 'var(--accent-red)' : 'var(--text-muted)' }}>
                                        {maintenanceMode ? "ON" : "OFF"}
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="card" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ marginBottom: '4px' }}>ROI Holiday</h4>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Pause daily ROI distribution (cron will skip)</p>
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={roiHoliday}
                                        onChange={(e) => {
                                            setRoiHoliday(e.target.checked);
                                            handleSave({ roiHoliday: e.target.checked });
                                        }}
                                        style={{ width: '40px', height: '20px' }}
                                    />
                                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: roiHoliday ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
                                        {roiHoliday ? "ON" : "OFF"}
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div className="glass" style={{
                        padding: '32px',
                        maxWidth: '500px',
                        width: '90%',
                        position: 'relative'
                    }}>
                        <button
                            onClick={() => { setShowConfirm(false); setPendingUpdates(null); }}
                            style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={20} />
                        </button>

                        <h3 style={{ marginBottom: '16px', fontSize: '1.3rem' }}>Confirm Settings Update</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                            Are you sure you want to update these settings? This will affect the entire platform.
                        </p>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => { setShowConfirm(false); setPendingUpdates(null); }}
                                className="btn btn-outline"
                                style={{ flex: 1, padding: '12px' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmSave}
                                className="btn btn-primary"
                                style={{ flex: 1, padding: '12px' }}
                            >
                                Yes, Update Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
