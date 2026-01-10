"use client";

export default function DashboardSkeleton() {
    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            {/* Header skeleton */}
            <div style={{ marginBottom: '32px' }}>
                <div className="skeleton" style={{ height: '28px', width: '150px', marginBottom: '8px' }} />
                <div className="skeleton" style={{ height: '16px', width: '220px' }} />
            </div>

            {/* Cards skeleton */}
            <div style={{ display: 'grid', gap: '16px', marginBottom: '32px' }}>
                {[1, 2].map(i => (
                    <div key={i} className="card" style={{ padding: '24px' }}>
                        <div className="skeleton" style={{ height: '14px', width: '100px', marginBottom: '12px' }} />
                        <div className="skeleton" style={{ height: '32px', width: '120px' }} />
                    </div>
                ))}
            </div>

            {/* Transaction list skeleton */}
            <div className="glass" style={{ padding: '24px' }}>
                <div className="skeleton" style={{ height: '20px', width: '180px', marginBottom: '20px' }} />
                {[1, 2, 3].map(i => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0', borderBottom: '1px solid var(--glass-border)' }}>
                        <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '12px' }} />
                        <div style={{ flex: 1 }}>
                            <div className="skeleton" style={{ height: '14px', width: '140px', marginBottom: '8px' }} />
                            <div className="skeleton" style={{ height: '12px', width: '100px' }} />
                        </div>
                        <div className="skeleton" style={{ height: '20px', width: '60px' }} />
                    </div>
                ))}
            </div>

            <style jsx>{`
                .skeleton {
                    background: linear-gradient(90deg, var(--glass-bg) 25%, rgba(255,255,255,0.1) 50%, var(--glass-bg) 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                    border-radius: 6px;
                }
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
}
