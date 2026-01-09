"use client";

import { useState } from "react";
import { User, ChevronRight, ChevronDown, Award } from "lucide-react";

interface Member {
    id: string;
    name: string;
    email: string;
    level: number;
    invested: number;
    children: Member[];
}

function TreeNode({ node }: { node: Member }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div style={{ marginLeft: node.level > 1 ? '24px' : '0' }}>
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="glass"
                style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px',
                    cursor: hasChildren ? 'pointer' : 'default',
                    borderLeft: node.invested > 0 ? '4px solid var(--accent-green)' : '4px solid var(--glass-border)',
                    transition: 'transform 0.2s ease',
                    background: isExpanded ? 'rgba(59, 130, 246, 0.05)' : 'var(--glass-bg)'
                }}
            >
                {hasChildren ? (
                    isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                ) : (
                    <div style={{ width: '16px' }} />
                )}

                <div style={{
                    background: node.invested > 0 ? 'var(--accent-green)' : 'var(--accent-blue)',
                    padding: '6px',
                    borderRadius: '8px',
                    color: 'white'
                }}>
                    <User size={16} />
                </div>

                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{node.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Level {node.level} • {node.invested > 0 ? "Active" : "Inactive"}</div>
                </div>

                {node.invested > 0 && (
                    <div style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Award size={14} />
                        <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>${node.invested}</span>
                    </div>
                )}
            </div>

            {isExpanded && hasChildren && (
                <div style={{ position: 'relative' }}>
                    {/* Vertical line connecting children */}
                    <div style={{
                        position: 'absolute',
                        left: '8px',
                        top: '0',
                        bottom: '12px',
                        width: '1px',
                        background: 'var(--glass-border)'
                    }} />
                    {node.children.map(child => (
                        <TreeNode key={child.id} node={child} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function GenealogyTree({ data }: { data: Member[] }) {
    if (!data || data.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                No network members found yet. Share your referral code to start building!
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {data.map(member => (
                <TreeNode key={member.id} node={member} />
            ))}
        </div>
    );
}
