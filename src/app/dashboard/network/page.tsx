"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ReferralMember {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    totalInvested: number;
    level: number;
    commission: number;
}

export default function NetworkPage() {
    const router = useRouter();
    const [networkData, setNetworkData] = useState<ReferralMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, active: 0, totalEarnings: 0 });
    const [referralCode, setReferralCode] = useState("");
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'total' | 'income' | 'successful'>('income');

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
                // Flatten the tree structure into an array
                const members: ReferralMember[] = [];
                let totalEarnings = 0;

                // Commission rates per level (as percentage of ROI)
                // Level 1: 10%, Level 2: 5%, Level 3: 3%, Level 4: 2%, Level 5: 1%
                const commissionRates = [0.10, 0.05, 0.03, 0.02, 0.01];

                const traverse = (nodes: any[], level: number = 1) => {
                    nodes.forEach(node => {
                        // Calculate estimated commission based on level
                        // Commission is based on ROI (1% of investment), then level percentage of that
                        const investedAmount = Number(node.invested || 0);
                        const estimatedDailyRoi = investedAmount * 0.01; // 1% daily ROI
                        const commissionRate = commissionRates[level - 1] || 0.01; // Default to 1% for levels beyond 5
                        const commission = estimatedDailyRoi * commissionRate;
                        totalEarnings += commission;
                        members.push({
                            id: node.id,
                            name: node.name || node.email?.split('@')[0] || 'User',
                            email: node.email,
                            createdAt: node.createdAt,
                            totalInvested: investedAmount,
                            level,
                            commission
                        });
                        if (node.children) traverse(node.children, level + 1);
                    });
                };

                traverse(data);
                setNetworkData(members);
                setStats({
                    total: members.length,
                    active: members.filter(m => m.totalInvested > 0).length,
                    totalEarnings
                });
            }
        } catch (err) {
            console.error("Failed to fetch network:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(referralCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleShare = () => {
        const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
        const message = `Join me on this amazing investment platform! Use my referral code: ${referralCode}`;

        if (navigator.share) {
            navigator.share({
                title: 'Join My Network',
                text: message,
                url: referralLink
            });
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(message + " " + referralLink)}`, '_blank');
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getAvatarColor = (name: string) => {
        const colors = [
            'bg-indigo-900/30 text-indigo-300',
            'bg-pink-900/30 text-pink-300',
            'bg-teal-900/30 text-teal-300',
            'bg-orange-900/30 text-orange-300',
            'bg-purple-900/30 text-purple-300',
            'bg-blue-900/30 text-blue-300',
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const filteredMembers = activeTab === 'successful'
        ? networkData.filter(m => m.totalInvested > 0)
        : networkData;

    return (
        <div
            className="relative min-h-screen flex flex-col max-w-md mx-auto overflow-x-hidden pb-32"
            style={{ backgroundColor: '#191022' }}
        >
            {/* Header */}
            <div className="flex items-center p-4 sticky top-0 z-30 backdrop-blur-md" style={{ backgroundColor: 'rgba(25, 16, 34, 0.8)' }}>
                <button
                    onClick={() => router.back()}
                    className="flex w-10 h-10 shrink-0 items-center justify-center rounded-full active:bg-white/10 transition-colors text-white"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h2 className="text-lg font-bold leading-tight flex-1 text-center text-white">Referrals</h2>
                <div className="w-10 h-10 shrink-0" />
            </div>

            {/* Content */}
            <div className="flex-grow flex flex-col px-4 space-y-6">
                {/* Referral Code Card */}
                <div
                    className="flex flex-col rounded-2xl p-5 border border-white/5 relative overflow-hidden group"
                    style={{ backgroundColor: '#211c27' }}
                >
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-600/20 rounded-full blur-2xl group-hover:bg-purple-600/30 transition-all duration-500" />
                    <p className="text-lg font-bold z-10 text-white">Your Unique Referral Code</p>
                    <p className="text-[#ab9db9] text-base mt-1 z-10">{referralCode || 'Loading...'}</p>
                    <div className="flex items-center gap-3 justify-between mt-5 z-10">
                        <button
                            onClick={handleCopy}
                            className="flex flex-1 items-center justify-center rounded-xl h-12 px-4 bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition-colors text-sm font-bold gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>{copied ? 'Copied!' : 'Copy'}</span>
                        </button>
                        <button
                            onClick={handleShare}
                            className="flex flex-1 items-center justify-center rounded-xl h-12 px-4 bg-purple-600 hover:bg-purple-500 transition-colors text-white text-sm font-bold gap-2 shadow-lg shadow-purple-600/20"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            <span>Share</span>
                        </button>
                    </div>
                </div>

                {/* Your Team Section */}
                <div>
                    <div className="flex justify-between items-center pb-3 pt-2">
                        <h2 className="text-xl font-bold text-white">Your Team</h2>
                        <span className="text-xs font-bold text-purple-400 bg-purple-600/10 px-2 py-1 rounded-lg">
                            {stats.total} Members
                        </span>
                    </div>
                    <div className="flex items-center py-2 overflow-x-auto">
                        <div className="flex items-center space-x-[-12px] pl-1">
                            {networkData.slice(0, 4).map((member, idx) => (
                                <div
                                    key={member.id}
                                    className={`w-12 h-12 rounded-full border-[3px] flex items-center justify-center text-xs font-bold shadow-sm ${getAvatarColor(member.name)}`}
                                    style={{
                                        borderColor: '#191022',
                                        zIndex: idx * 10
                                    }}
                                >
                                    {getInitials(member.name)}
                                </div>
                            ))}
                            {networkData.length > 4 && (
                                <div
                                    className="w-12 h-12 rounded-full border-[3px] bg-purple-600 text-white flex items-center justify-center text-xs font-bold shadow-sm relative"
                                    style={{ borderColor: '#191022', zIndex: 40 }}
                                >
                                    +{networkData.length - 4}
                                    <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 rounded-full" style={{ borderColor: '#191022' }} />
                                </div>
                            )}
                        </div>
                        <Link href="/dashboard/network/tree" className="ml-4 flex flex-col justify-center text-left">
                            <span className="text-sm font-bold text-white">View Tree</span>
                            <span className="text-xs text-[#ab9db9]">Network map</span>
                        </Link>
                    </div>
                </div>

                {/* Tabs */}
                <div className="sticky top-[72px] z-20 pt-2 pb-1" style={{ backgroundColor: '#191022' }}>
                    <div className="flex border-b border-[#473b54] justify-between">
                        <button
                            onClick={() => setActiveTab('total')}
                            className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-2 flex-1 transition-colors ${activeTab === 'total'
                                ? 'border-b-purple-600 text-white'
                                : 'border-b-transparent text-[#ab9db9] hover:text-white'
                                }`}
                        >
                            <p className="text-sm font-bold">Total ({stats.total})</p>
                        </button>
                        <button
                            onClick={() => setActiveTab('income')}
                            className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-2 flex-1 transition-colors ${activeTab === 'income'
                                ? 'border-b-purple-600 text-white'
                                : 'border-b-transparent text-[#ab9db9] hover:text-white'
                                }`}
                        >
                            <p className="text-sm font-bold">Level Income</p>
                        </button>
                        <button
                            onClick={() => setActiveTab('successful')}
                            className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-2 flex-1 transition-colors ${activeTab === 'successful'
                                ? 'border-b-purple-600 text-white'
                                : 'border-b-transparent text-[#ab9db9] hover:text-white'
                                }`}
                        >
                            <p className="text-sm font-bold">Active ({stats.active})</p>
                        </button>
                    </div>
                </div>

                {/* Members List */}
                <div className="flex flex-col space-y-4">
                    {loading ? (
                        <div className="text-center py-10 text-[#ab9db9]">Loading your network...</div>
                    ) : filteredMembers.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="text-4xl mb-3">👥</div>
                            <p className="text-white font-medium">No referrals yet</p>
                            <p className="text-sm text-[#ab9db9] mt-1">Share your code to start building your team</p>
                        </div>
                    ) : (
                        filteredMembers.map((member) => {
                            // Calculate daily ROI (1% of investment)
                            const dailyRoi = member.totalInvested * 0.01;

                            return (
                                <div
                                    key={member.id}
                                    className="rounded-xl p-4 border border-white/5 flex flex-col gap-3"
                                    style={{ backgroundColor: '#211c27' }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getAvatarColor(member.name)}`}>
                                                {getInitials(member.name)}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-white">{member.name}</h3>
                                                <p className="text-xs text-[#ab9db9]">
                                                    {member.totalInvested > 0
                                                        ? `Invested: $${member.totalInvested.toFixed(2)}`
                                                        : 'No active package'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-emerald-400">
                                                {member.commission > 0 ? `+ $${member.commission.toFixed(2)}` : '$0.00'}
                                            </p>
                                            <p className="text-[10px] text-[#ab9db9] font-medium">Level {member.level}</p>
                                        </div>
                                    </div>
                                    {member.totalInvested > 0 && (
                                        <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
                                            <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                            </svg>
                                            <p className="text-xs text-gray-300">
                                                <span className="font-bold">
                                                    {member.level === 1 ? '10%' : member.level === 2 ? '5%' : member.level === 3 ? '3%' : member.level === 4 ? '2%' : '1%'} Commission
                                                </span> from ${dailyRoi.toFixed(2)} daily ROI
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
