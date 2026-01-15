"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface TreeMember {
    id: string;
    name: string;
    email: string;
    invested: number;
    level: number;
    children: TreeMember[];
}

interface TreeNodeProps {
    node: TreeMember;
    x: number;
    y: number;
    parentX?: number;
    parentY?: number;
    scale: number;
}

function TreeNode({ node, x, y, parentX, parentY, scale }: TreeNodeProps) {
    const isActive = node.invested > 0;
    const nodeRadius = 35;

    return (
        <g>
            {/* Connection line to parent */}
            {parentX !== undefined && parentY !== undefined && (
                <path
                    d={`M ${parentX} ${parentY + nodeRadius} 
                        C ${parentX} ${parentY + 60}, 
                          ${x} ${y - 60}, 
                          ${x} ${y - nodeRadius}`}
                    fill="none"
                    stroke={isActive ? "rgba(139, 92, 246, 0.6)" : "rgba(255, 255, 255, 0.15)"}
                    strokeWidth="2"
                    strokeDasharray={isActive ? "none" : "5,5"}
                />
            )}

            {/* Glow effect for active nodes */}
            {isActive && (
                <circle
                    cx={x}
                    cy={y}
                    r={nodeRadius + 10}
                    fill="none"
                    stroke="rgba(139, 92, 246, 0.3)"
                    strokeWidth="4"
                    style={{ filter: 'blur(8px)' }}
                />
            )}

            {/* Node circle */}
            <circle
                cx={x}
                cy={y}
                r={nodeRadius}
                fill={isActive ? "url(#activeGradient)" : "#2d2438"}
                stroke={isActive ? "#8b5cf6" : "rgba(255, 255, 255, 0.1)"}
                strokeWidth="2"
            />

            {/* Avatar initials */}
            <text
                x={x}
                y={y + 5}
                textAnchor="middle"
                fill="white"
                fontSize="14"
                fontWeight="bold"
            >
                {node.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </text>

            {/* Name label */}
            <text
                x={x}
                y={y + nodeRadius + 18}
                textAnchor="middle"
                fill="white"
                fontSize="11"
                fontWeight="500"
            >
                {node.name.length > 10 ? node.name.slice(0, 10) + '...' : node.name}
            </text>

            {/* Level badge */}
            <rect
                x={x - 18}
                y={y + nodeRadius + 24}
                width="36"
                height="16"
                rx="8"
                fill={isActive ? "rgba(139, 92, 246, 0.3)" : "rgba(255, 255, 255, 0.1)"}
            />
            <text
                x={x}
                y={y + nodeRadius + 35}
                textAnchor="middle"
                fill={isActive ? "#a78bfa" : "#9ca3af"}
                fontSize="9"
                fontWeight="600"
            >
                L{node.level}
            </text>

            {/* Investment amount for active */}
            {isActive && (
                <>
                    <rect
                        x={x - 22}
                        y={y - nodeRadius - 22}
                        width="44"
                        height="18"
                        rx="9"
                        fill="#10b981"
                    />
                    <text
                        x={x}
                        y={y - nodeRadius - 10}
                        textAnchor="middle"
                        fill="white"
                        fontSize="9"
                        fontWeight="bold"
                    >
                        ${node.invested}
                    </text>
                </>
            )}
        </g>
    );
}

export default function NetworkTreePage() {
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const [treeData, setTreeData] = useState<TreeMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [userProfile, setUserProfile] = useState<{ name: string; email: string; referralCode: string } | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [profileRes, networkRes] = await Promise.all([
                fetch("/api/user/profile"),
                fetch("/api/user/network")
            ]);

            const profileData = await profileRes.json();
            const networkData = await networkRes.json();

            if (profileRes.ok) {
                setUserProfile({
                    name: profileData.name || profileData.email?.split('@')[0] || 'You',
                    email: profileData.email,
                    referralCode: profileData.referralCode
                });
            }

            if (networkRes.ok) {
                // Add level info to tree data
                const addLevels = (nodes: any[], level: number = 1): TreeMember[] => {
                    return nodes.map(node => ({
                        ...node,
                        level,
                        name: node.name || node.email?.split('@')[0] || 'User',
                        invested: Number(node.invested || 0),
                        children: node.children ? addLevels(node.children, level + 1) : []
                    }));
                };
                setTreeData(addLevels(networkData));
            }
        } catch (err) {
            console.error("Failed to fetch data:", err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate node positions
    const calculatePositions = (
        nodes: TreeMember[],
        startX: number,
        y: number,
        width: number
    ): { node: TreeMember; x: number; y: number; children: any[] }[] => {
        if (nodes.length === 0) return [];

        const segmentWidth = width / nodes.length;
        return nodes.map((node, i) => {
            const x = startX + segmentWidth * i + segmentWidth / 2;
            return {
                node,
                x,
                y,
                children: calculatePositions(node.children, startX + segmentWidth * i, y + 140, segmentWidth)
            };
        });
    };

    const renderTree = (
        positions: { node: TreeMember; x: number; y: number; children: any[] }[],
        parentX?: number,
        parentY?: number
    ): React.ReactNode[] => {
        const elements: React.ReactNode[] = [];

        positions.forEach(pos => {
            elements.push(
                <TreeNode
                    key={pos.node.id}
                    node={pos.node}
                    x={pos.x}
                    y={pos.y}
                    parentX={parentX}
                    parentY={parentY}
                    scale={scale}
                />
            );

            if (pos.children.length > 0) {
                elements.push(...renderTree(pos.children, pos.x, pos.y));
            }
        });

        return elements;
    };

    // Touch/Mouse handlers for pan
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        setDragStart({
            x: e.touches[0].clientX - position.x,
            y: e.touches[0].clientY - position.y
        });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.touches[0].clientX - dragStart.x,
            y: e.touches[0].clientY - dragStart.y
        });
    };

    const zoomIn = () => setScale(s => Math.min(s + 0.2, 2));
    const zoomOut = () => setScale(s => Math.max(s - 0.2, 0.4));
    const resetView = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    // Calculate tree dimensions
    const countNodes = (nodes: TreeMember[]): number => {
        return nodes.reduce((acc, n) => acc + 1 + countNodes(n.children), 0);
    };

    const getMaxDepth = (nodes: TreeMember[], depth: number = 1): number => {
        if (nodes.length === 0) return depth - 1;
        return Math.max(...nodes.map(n => getMaxDepth(n.children, depth + 1)));
    };

    const totalNodes = countNodes(treeData);
    const maxDepth = getMaxDepth(treeData);
    const svgWidth = Math.max(800, totalNodes * 120);
    const svgHeight = Math.max(600, (maxDepth + 2) * 160);

    const positions = calculatePositions(treeData, 0, 160, svgWidth);

    return (
        <div
            className="relative h-screen w-full flex flex-col overflow-hidden"
            style={{
                background: 'radial-gradient(ellipse at top, #2e1065, #0B0A14 60%, #000000)'
            }}
        >
            {/* Header */}
            <div className="flex items-center p-4 justify-between z-20 bg-black/30 backdrop-blur-md">
                <button
                    onClick={() => router.back()}
                    className="flex w-10 h-10 items-center justify-center rounded-full bg-white/10 text-white"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-lg font-bold text-white">Network Tree</h1>
                <div className="w-10" />
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 py-2 text-xs text-white/60">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span>Active</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-600" />
                    <span>Inactive</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>Investment</span>
                </div>
            </div>

            {/* Tree Canvas */}
            <div
                ref={containerRef}
                className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={() => setIsDragging(false)}
            >
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : treeData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-8">
                        <div className="text-6xl mb-4 opacity-50">🌳</div>
                        <p className="text-white text-lg font-medium">No network members yet</p>
                        <p className="text-gray-400 text-sm mt-2">Share your referral code to start building your tree!</p>
                    </div>
                ) : (
                    <svg
                        width="100%"
                        height="100%"
                        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                            transformOrigin: 'center center',
                            transition: isDragging ? 'none' : 'transform 0.2s ease'
                        }}
                    >
                        <defs>
                            <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#6366f1" />
                            </linearGradient>
                            <linearGradient id="rootGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#d946ef" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                        </defs>

                        {/* Root node (current user) */}
                        <g>
                            <circle
                                cx={svgWidth / 2}
                                cy={60}
                                r={45}
                                fill="url(#rootGradient)"
                                stroke="#fff"
                                strokeWidth="3"
                            />
                            <text
                                x={svgWidth / 2}
                                y={65}
                                textAnchor="middle"
                                fill="white"
                                fontSize="16"
                                fontWeight="bold"
                            >
                                {userProfile?.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'YOU'}
                            </text>
                            <text
                                x={svgWidth / 2}
                                y={120}
                                textAnchor="middle"
                                fill="white"
                                fontSize="12"
                                fontWeight="500"
                            >
                                {userProfile?.name || 'You'}
                            </text>
                            <rect
                                x={svgWidth / 2 - 25}
                                y={130}
                                width="50"
                                height="18"
                                rx="9"
                                fill="rgba(217, 70, 239, 0.3)"
                            />
                            <text
                                x={svgWidth / 2}
                                y={142}
                                textAnchor="middle"
                                fill="#d946ef"
                                fontSize="10"
                                fontWeight="bold"
                            >
                                ROOT
                            </text>
                        </g>

                        {/* Connection from root to first level */}
                        {positions.length > 0 && positions.map(pos => (
                            <path
                                key={`root-${pos.node.id}`}
                                d={`M ${svgWidth / 2} ${60 + 45} 
                                    C ${svgWidth / 2} ${120}, 
                                      ${pos.x} ${pos.y - 80}, 
                                      ${pos.x} ${pos.y - 35}`}
                                fill="none"
                                stroke="rgba(217, 70, 239, 0.5)"
                                strokeWidth="2"
                            />
                        ))}

                        {/* Render tree nodes */}
                        {renderTree(positions, svgWidth / 2, 60)}
                    </svg>
                )}
            </div>

            {/* Zoom Controls */}
            <div className="fixed bottom-24 right-4 flex flex-col gap-2 z-30">
                <button
                    onClick={zoomIn}
                    className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 active:scale-95 transition-transform"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </button>
                <button
                    onClick={zoomOut}
                    className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 active:scale-95 transition-transform"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                    </svg>
                </button>
                <button
                    onClick={resetView}
                    className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>

            {/* Stats Bar */}
            <div
                className="flex items-center justify-around py-4 px-4 bg-black/50 backdrop-blur-md border-t border-white/10"
            >
                <div className="text-center">
                    <p className="text-2xl font-bold text-white">{totalNodes}</p>
                    <p className="text-xs text-gray-400">Total Members</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                    <p className="text-2xl font-bold text-purple-400">{maxDepth}</p>
                    <p className="text-xs text-gray-400">Depth Levels</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">{Math.round(scale * 100)}%</p>
                    <p className="text-xs text-gray-400">Zoom</p>
                </div>
            </div>
        </div>
    );
}
