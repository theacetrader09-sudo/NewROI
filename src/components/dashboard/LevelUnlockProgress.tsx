"use client";

import { useState, useEffect } from "react";
import { Lock, Unlock, Users, TrendingUp } from "lucide-react";

interface LevelProgressData {
    directReferralsCount: number;
    unlockedLevel: number;
    levelRequirements: number[];
    nextUnlock: {
        level: number;
        needsDirects: number;
        remaining: number;
    } | null;
}

export default function LevelUnlockProgress() {
    const [data, setData] = useState<LevelProgressData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProgress();
    }, []);

    const fetchProgress = async () => {
        try {
            const res = await fetch("/api/user/level-progress");
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (err) {
            console.error("Failed to fetch level progress:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="glass" style={{ padding: '20px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Loading level progress...</p>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="glass" style={{ padding: 'clamp(16px, 4vw, 24px)' }}>
            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={24} style={{ color: 'var(--accent-purple)' }} />
                    Level Unlock Progress
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Build your network to unlock higher commission levels
                </p>
            </div>

            {/* Direct Referrals Count */}
            <div className="card" style={{ padding: '16px', marginBottom: '20px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={24} style={{ color: 'var(--accent-purple)' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Direct Referrals</p>
                        <p style={{ fontSize: '1.8rem', fontWeight: '700', color: 'white' }}>{data.directReferralsCount}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Unlocked Levels</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-green)' }}>{data.unlockedLevel} / 10</p>
                    </div>
                </div>
            </div>

            {/* Next Unlock Milestone */}
            {data.nextUnlock && (
                <div className="card" style={{ padding: '14px', marginBottom: '20px', background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', marginBottom: '6px', fontWeight: '600' }}>
                        🎯 Next Milestone: Level {data.nextUnlock.level}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Need <strong style={{ color: 'white' }}>{data.nextUnlock.remaining} more</strong> direct{data.nextUnlock.remaining === 1 ? '' : 's'} to unlock Level {data.nextUnlock.level}
                    </p>
                </div>
            )}

            {/* Level Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px' }}>
                {Array.from({ length: 10 }, (_, i) => {
                    const level = i + 1;
                    const isUnlocked = level <= data.unlockedLevel;
                    const requiredDirects = data.levelRequirements[i];

                    return (
                        <div
                            key={level}
                            className="card"
                            style={{
                                padding: '12px 8px',
                                textAlign: 'center',
                                background: isUnlocked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                                border: `1px solid ${isUnlocked ? 'rgba(16, 185, 129, 0.3)' : 'rgba(107, 114, 128, 0.2)'}`,
                                opacity: isUnlocked ? 1 : 0.6
                            }}
                        >
                            <div style={{ marginBottom: '6px' }}>
                                {isUnlocked ? (
                                    <Unlock size={20} style={{ color: 'var(--accent-green)' }} />
                                ) : (
                                    <Lock size={20} style={{ color: 'var(--text-muted)' }} />
                                )}
                            </div>
                            <p style={{ fontSize: '0.75rem', fontWeight: '600', color: isUnlocked ? 'var(--accent-green)' : 'var(--text-muted)', marginBottom: '4px' }}>
                                Level {level}
                            </p>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                                {requiredDirects} direct{requiredDirects === 1 ? '' : 's'}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Fully Unlocked Message */}
            {data.unlockedLevel === 10 && (
                <div style={{ marginTop: '20px', padding: '14px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))', border: '1px solid var(--accent-green)', borderRadius: '12px' }}>
                    <p style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--accent-green)', marginBottom: '4px' }}>
                        🎉 All Levels Unlocked!
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        You're earning commissions on all 10 levels. Keep building your network!
                    </p>
                </div>
            )}
        </div>
    );
}
