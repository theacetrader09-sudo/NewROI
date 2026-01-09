"use client";

import { useState, useEffect } from "react";
import { Users, UserCheck, Network, Copy, Check, Share2 } from "lucide-react";
import GenealogyTree from "@/components/dashboard/GenealogyTree";

export default function NetworkPage() {
    const [networkData, setNetworkData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, active: 0 });
    const [referralCode, setReferralCode] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchUserProfile();
        fetchNetwork();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const res = await fetch("/api/user/profile");
            const data = await res.json();
            if (res.ok) {
                setReferralCode(data.referralCode);
            }
        } catch (err) {
            console.error("Failed to fetch profile:", err);
        }
    };

    const fetchNetwork = async () => {
        try {
            const res = await fetch("/api/user/network");
            const data = await res.json();
            if (res.ok) {
                setNetworkData(data);
                calculateStats(data);
            }
        } catch (err) {
            console.error("Failed to fetch network:", err);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data: any[]) => {
        let total = 0;
        let active = 0;

        const traverse = (nodes: any[]) => {
            nodes.forEach(node => {
                total++;
                if (node.invested > 0) active++;
                if (node.children) traverse(node.children);
            });
        };

        traverse(data);
        setStats({ total, active });
    };

    const handleCopy = async () => {
        const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
        try {
            await navigator.clipboard.writeText(referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleShare = (platform: string) => {
        const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
        const message = `Join me on MLM ROI System and start earning! Use my referral code: ${referralCode}`;

        const shareUrls: { [key: string]: string } = {
            whatsapp: `https://wa.me/?text=${encodeURIComponent(message + " " + referralLink)}`,
            telegram: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(message)}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(referralLink)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
        };

        if (shareUrls[platform]) {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Network & Genealogy</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Track your 10-level team growth and performance.</p>
            </header>

            {/* Referral Link Section */}
            <div className="glass" style={{ padding: '24px', marginBottom: '32px', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Share2 size={18} color="var(--accent-blue)" />
                    Your Referral Link
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{
                        flex: 1,
                        minWidth: '250px',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                    }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {referralCode ? `${window.location.origin}/register?ref=${referralCode}` : "Loading..."}
                        </span>
                        <button
                            onClick={handleCopy}
                            style={{
                                background: copied ? 'var(--accent-green)' : 'var(--accent-blue)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '8px 16px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                transition: 'all 0.2s',
                                flexShrink: 0
                            }}
                        >
                            {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy</>}
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => handleShare('whatsapp')}
                            style={{
                                background: '#25D366',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '8px 14px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: '600'
                            }}
                        >
                            WhatsApp
                        </button>
                        <button
                            onClick={() => handleShare('telegram')}
                            style={{
                                background: '#0088cc',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '8px 14px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: '600'
                            }}
                        >
                            Telegram
                        </button>
                        <button
                            onClick={() => handleShare('twitter')}
                            style={{
                                background: '#1DA1F2',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '8px 14px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: '600'
                            }}
                        >
                            Twitter
                        </button>
                        <button
                            onClick={() => handleShare('facebook')}
                            style={{
                                background: '#4267B2',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '8px 14px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: '600'
                            }}
                        >
                            Facebook
                        </button>
                    </div>
                </div>
            </div>

            {/* Network Stats Card */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '40px'
            }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--accent-blue)' }}>
                        <Users size={24} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Team</p>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{stats.total}</h3>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--accent-green)' }}>
                        <UserCheck size={24} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Active Members</p>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{stats.active}</h3>
                    </div>
                </div>
            </div>

            {/* Genealogy Tree Section */}
            <div className="glass" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                    <Network size={20} color="var(--accent-blue)" />
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Interactive Genealogy Tree</h2>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        Building your tree...
                    </div>
                ) : (
                    <GenealogyTree data={networkData} />
                )}
            </div>
        </div>
    );
}
