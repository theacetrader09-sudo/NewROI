"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";
import {
    Brain, TrendingUp, Users, Shield, Download, Eye,
    ChevronLeft, ChevronRight, X, Zap, Globe, BarChart3
} from "lucide-react";

// ─── Animation helpers ────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ─── Team data ────────────────────────────────────────────────────────────────
const team = [
    { name: "Reese Miller", role: "Founder & CEO", icon: "🧠", color: "#818eff", desc: "Visionary behind NeoQuant's AI-driven mission to democratise intelligent trading." },
    { name: "Drew Feig", role: "Chief Technology Officer", icon: "⚡", color: "#a78bfa", desc: "Architect of the automation engine. Transforms complex AI into seamless user experiences." },
    { name: "Li Mei Chen", role: "Head of Data Intelligence", icon: "📊", color: "#34d399", desc: "Leads the machine-learning pipeline that processes 25,000+ market patterns daily." },
    { name: "Daniel Ross", role: "Head of Finance & Compliance", icon: "🏛️", color: "#fbbf24", desc: "Ensures regulatory excellence and financial transparency across all operations." },
];

// ─── Level income data ────────────────────────────────────────────────────────
const levels = [
    { level: 1, directs: 1, percent: "10%" },
    { level: 2, directs: 2, percent: "5%" },
    { level: 3, directs: 6, percent: "3%" },
    { level: 4, directs: 8, percent: "2%" },
    { level: 5, directs: 12, percent: "1%" },
    { level: 6, directs: 14, percent: "0.5%" },
    { level: 7, directs: 16, percent: "0.5%" },
    { level: 8, directs: 22, percent: "0.3%" },
    { level: 9, directs: 28, percent: "0.2%" },
    { level: 10, directs: 30, percent: "0.1%" },
];

// ─── Package data ─────────────────────────────────────────────────────────────
const packages = [
    { label: "Starter", range: "$35 – $9,999", roi: "1%", color: "#818eff", glow: "rgba(129,142,255,0.15)", icon: "🚀" },
    { label: "Silver", range: "$10,000 – $29,999", roi: "2%", color: "#a78bfa", glow: "rgba(167,139,250,0.15)", icon: "⭐" },
    { label: "Gold", range: "$30,000+", roi: "5%", color: "#fbbf24", glow: "rgba(251,191,36,0.15)", icon: "🏆" },
];

// ─── Document Viewer Modal ─────────────────────────────────────────────────────
function DocViewer({ onClose }: { onClose: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-xl"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-semibold">NeoQuant Portfolio Document</span>
                    <span className="text-xs bg-red-500/20 border border-red-500/30 text-red-400 px-2 py-0.5 rounded-full">View Only</span>
                </div>
                <button
                    onClick={onClose}
                    className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* PDF Viewer — toolbar disabled via URL hash params */}
            <div className="flex-1 relative overflow-hidden">
                {/* Transparent overlay strips browser download button area */}
                <div className="absolute top-0 right-0 w-full h-12 z-10 pointer-events-none" />
                <iframe
                    src="/docs/NeoQuant-Presentation.pdf#toolbar=0&navpanes=0&statusbar=0&scrollbar=1&view=FitH"
                    className="w-full h-full border-0"
                    title="NeoQuant Portfolio Document"
                    onContextMenu={(e) => e.preventDefault()}
                />
                {/* Bottom right overlay blocks the Chrome PDF download button */}
                <div
                    className="absolute bottom-0 right-0 w-12 h-12 z-10"
                    style={{ background: "#0a0a10", pointerEvents: "all" }}
                />
            </div>
        </motion.div>
    );
}

// ─── Main About Page ──────────────────────────────────────────────────────────
export default function AboutPage() {
    const [docOpen, setDocOpen] = useState(false);

    return (
        <main className="bg-[#020207] text-white overflow-x-hidden">
            {/* ── HERO ──────────────────────────────────────────────────────── */}
            <section className="relative min-h-screen flex flex-col items-center justify-center pt-28 pb-20 overflow-hidden">
                {/* Animated background glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-[#4448B8]/20 blur-[120px]" />
                    <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[100px]" />
                    <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-blue-600/10 blur-[100px]" />
                </div>

                {/* Floating orbs */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full opacity-20"
                        style={{
                            width: `${Math.random() * 6 + 3}px`,
                            height: `${Math.random() * 6 + 3}px`,
                            background: i % 2 === 0 ? "#818eff" : "#a78bfa",
                            left: `${15 + i * 15}%`,
                            top: `${20 + (i % 3) * 20}%`,
                        }}
                        animate={{ y: [0, -30 - i * 5, 0] }}
                        transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.7 }}
                    />
                ))}

                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.05] border border-white/10 rounded-full mb-8 text-sm text-white/70"
                    >
                        <Brain className="w-4 h-4 text-purple-400" />
                        AI-Powered Financial Intelligence
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="text-5xl sm:text-6xl md:text-7xl font-normal leading-[1.05] tracking-tight mb-6"
                    >
                        A New Way to{" "}
                        <span className="bg-gradient-to-r from-[#818eff] via-[#a78bfa] to-[#818eff] bg-clip-text text-transparent">
                            Grow, Earn,
                        </span>
                        <br /> and Rise Together.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.25 }}
                        className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-12"
                    >
                        NeoQuant is an AI-driven trading intelligence platform designed to replace fear-based decisions with precision, speed, and daily automated returns.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.35 }}
                        className="flex flex-wrap items-center justify-center gap-4"
                    >
                        <Link
                            href="/register"
                            className="px-8 py-3.5 bg-[#4448B8] border border-[#B4B7FF]/50 text-white rounded-xl font-medium hover:bg-[#3b3ea3] transition-all shadow-[inset_0px_-4px_10px_rgba(202,205,255,0.3)]"
                        >
                            Start Your Journey
                        </Link>
                        <button
                            onClick={() => setDocOpen(true)}
                            className="px-8 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-all flex items-center gap-2"
                        >
                            <Eye className="w-4 h-4 text-purple-400" /> View Portfolio Document
                        </button>
                    </motion.div>
                </div>

                {/* Scroll indicator */}
                <motion.div
                    className="absolute bottom-10 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                    <div className="w-[1px] h-12 bg-gradient-to-b from-[#818eff] to-transparent mx-auto" />
                </motion.div>
            </section>

            {/* ── OUR STORY ─────────────────────────────────────────────────── */}
            <section className="py-28 px-6 relative">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
                <div className="max-w-6xl mx-auto">
                    <FadeIn className="text-center mb-16">
                        <p className="text-purple-400 text-sm font-medium tracking-widest uppercase mb-3">Our Origin</p>
                        <h2 className="text-4xl sm:text-5xl font-normal tracking-tight">The Beginning of<br /><span className="text-white/40">Intelligent Trading</span></h2>
                    </FadeIn>

                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            {
                                icon: "🧠", color: "#818eff", title: "Human Instinct",
                                body: "Before automation, traders relied on instinct, luck, and fear. Markets moved faster than human reactions, and opportunities slipped away constantly.",
                                sub: "Emotional decisions, hesitation, and doubt shaped outcomes more than strategy."
                            },
                            {
                                icon: "⚡", color: "#34d399", title: "Machine Evolution",
                                body: "A quiet shift began — data started replacing emotion, and intelligence began to evolve beyond human limitation. Speed became essential, precision became survival.",
                                sub: "Calculated decisions powered by patterns, speed, and learning without fear."
                            }
                        ].map((card, i) => (
                            <FadeIn key={i} delay={i * 0.15}>
                                <div className="relative p-8 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] transition-all group h-full"
                                    style={{ boxShadow: `0 0 60px ${card.color}08` }}>
                                    <div className="text-4xl mb-4">{card.icon}</div>
                                    <h3 className="text-xl font-semibold mb-3" style={{ color: card.color }}>{card.title}</h3>
                                    <p className="text-white/60 leading-relaxed mb-4">{card.body}</p>
                                    <p className="text-sm text-white/30 italic border-l-2 pl-3" style={{ borderColor: card.color + "60" }}>{card.sub}</p>
                                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                                        style={{ background: `radial-gradient(circle at 30% 30%, ${card.color}08, transparent 60%)` }} />
                                </div>
                            </FadeIn>
                        ))}
                    </div>

                    {/* Stats row */}
                    <FadeIn delay={0.3} className="mt-12">
                        <div className="grid grid-cols-3 gap-6">
                            {[
                                { stat: "25K+", label: "Patterns Processed Daily", icon: <BarChart3 className="w-5 h-5" /> },
                                { stat: "+40", label: "Market Behaviours Learned", icon: <Brain className="w-5 h-5" /> },
                                { stat: "+27", label: "Industry Technologies", icon: <Globe className="w-5 h-5" /> },
                            ].map((s, i) => (
                                <div key={i} className="text-center p-6 rounded-2xl bg-white/[0.03] border border-white/10">
                                    <div className="text-purple-400 flex justify-center mb-2">{s.icon}</div>
                                    <div className="text-3xl font-bold text-white mb-1">{s.stat}</div>
                                    <div className="text-xs text-white/40">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* ── VISION ────────────────────────────────────────────────────── */}
            <section className="py-28 px-6 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#4448B8]/10 blur-[150px]" />
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <FadeIn>
                        <p className="text-purple-400 text-sm font-medium tracking-widest uppercase mb-3">Vision Statement</p>
                        <h2 className="text-4xl sm:text-5xl font-normal tracking-tight mb-8">
                            A Future Where Every<br /><span className="bg-gradient-to-r from-[#818eff] to-[#a78bfa] bg-clip-text text-transparent">Trader Can Rise</span>
                        </h2>
                        <div className="text-lg text-white/60 leading-relaxed space-y-4 max-w-3xl mx-auto">
                            <p>For too long, only institutions held the advantage — speed, data, and control. NeoQuant envisions a world where everyday traders can earn daily returns effortlessly.</p>
                            <p>With Starter, Silver, and Gold packages creating growth for all levels. A world where sharing the system strengthens entire communities through a ten-level income structure.</p>
                            <p className="text-white/80 font-medium text-xl">A future where success is no longer reserved for the few, but awakened in the many.</p>
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* ── MISSION ───────────────────────────────────────────────────── */}
            <section className="py-28 px-6 relative">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                <div className="max-w-6xl mx-auto">
                    <FadeIn className="text-center mb-16">
                        <p className="text-purple-400 text-sm font-medium tracking-widest uppercase mb-3">Our Mission</p>
                        <h2 className="text-4xl sm:text-5xl font-normal tracking-tight">Built for Every<br /><span className="text-white/40">Level of Investor</span></h2>
                    </FadeIn>
                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            {
                                icon: <Zap className="w-6 h-6" />, color: "#818eff", title: "Eliminate Fear-Based Trading",
                                body: "We aim to eliminate fear-based trading and replace uncertainty with reliable daily returns generated through evolving AI intelligence."
                            },
                            {
                                icon: <Users className="w-6 h-6" />, color: "#34d399", title: "Reward Connection",
                                body: "Our mission expands beyond earnings. Through a ten-level referral system, users benefit from shared momentum, expanding networks, and collective acceleration."
                            },
                            {
                                icon: <Shield className="w-6 h-6" />, color: "#fbbf24", title: "Transparent & Structured",
                                body: "Every user can participate in growth through investment packages built for accessibility, progress, and sustainable long-term advancement."
                            },
                            {
                                icon: <TrendingUp className="w-6 h-6" />, color: "#a78bfa", title: "Accessible at Every Level",
                                body: "From first-time investors at $35 to seasoned traders, NeoQuant provides a structured pathway to consistent daily income through AI automation."
                            }
                        ].map((c, i) => (
                            <FadeIn key={i} delay={i * 0.1}>
                                <div className="flex gap-4 p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all group">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                                        style={{ background: c.color + "15", color: c.color }}>
                                        {c.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-2 text-white">{c.title}</h3>
                                        <p className="text-sm text-white/50 leading-relaxed">{c.body}</p>
                                    </div>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── PACKAGES ──────────────────────────────────────────────────── */}
            <section className="py-28 px-6 relative">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
                <div className="max-w-6xl mx-auto">
                    <FadeIn className="text-center mb-16">
                        <p className="text-purple-400 text-sm font-medium tracking-widest uppercase mb-3">Investment Tiers</p>
                        <h2 className="text-4xl sm:text-5xl font-normal tracking-tight">Packages & Daily ROI</h2>
                        <p className="text-white/40 mt-4 max-w-xl mx-auto">Choose the tier that matches your investment goals. Daily returns credited automatically every 24 hours.</p>
                    </FadeIn>

                    <div className="grid md:grid-cols-3 gap-6">
                        {packages.map((pkg, i) => (
                            <FadeIn key={i} delay={i * 0.15}>
                                <motion.div
                                    whileHover={{ y: -6, scale: 1.02 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="relative p-8 rounded-2xl border text-center overflow-hidden cursor-default"
                                    style={{ borderColor: pkg.color + "30", background: pkg.glow }}
                                >
                                    <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
                                        style={{ background: `radial-gradient(circle at 50% 0%, ${pkg.color}15, transparent 70%)` }} />
                                    <div className="text-4xl mb-4">{pkg.icon}</div>
                                    <div className="text-xs font-medium tracking-widest uppercase mb-2" style={{ color: pkg.color }}>{pkg.label}</div>
                                    <div className="text-white/60 text-sm mb-6">{pkg.range}</div>
                                    <div className="text-6xl font-bold mb-1" style={{ color: pkg.color }}>{pkg.roi}</div>
                                    <div className="text-white/40 text-sm">Daily ROI</div>
                                    <div className="mt-6 pt-6 border-t border-white/10">
                                        <Link href="/register"
                                            className="block w-full py-3 rounded-xl font-medium text-sm transition-all"
                                            style={{ background: pkg.color + "20", color: pkg.color, border: `1px solid ${pkg.color}30` }}>
                                            Get Started →
                                        </Link>
                                    </div>
                                </motion.div>
                            </FadeIn>
                        ))}
                    </div>

                    <FadeIn delay={0.4} className="mt-8 text-center">
                        <p className="text-white/30 text-sm">Minimum withdrawal: $20 USDT • Fees: 5% platform + 0.20% network</p>
                    </FadeIn>
                </div>
            </section>

            {/* ── LEVEL INCOME ──────────────────────────────────────────────── */}
            <section className="py-28 px-6 relative">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                <div className="max-w-4xl mx-auto">
                    <FadeIn className="text-center mb-16">
                        <p className="text-purple-400 text-sm font-medium tracking-widest uppercase mb-3">Referral Rewards</p>
                        <h2 className="text-4xl sm:text-5xl font-normal tracking-tight">10-Level Income System</h2>
                        <p className="text-white/40 mt-4 max-w-xl mx-auto">Earn commissions from your network's daily ROI — up to 10 levels deep. Only active members count toward level unlocks.</p>
                    </FadeIn>

                    <FadeIn delay={0.2}>
                        <div className="rounded-2xl border border-white/10 overflow-hidden">
                            <div className="grid grid-cols-3 text-xs font-medium tracking-widest uppercase text-white/30 px-6 py-4 border-b border-white/10 bg-white/[0.02]">
                                <span>Level</span>
                                <span className="text-center">Direct Members Needed</span>
                                <span className="text-right">Commission</span>
                            </div>
                            {levels.map((l, i) => (
                                <motion.div
                                    key={l.level}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05, duration: 0.4 }}
                                    className="grid grid-cols-3 px-6 py-4 border-b border-white/5 hover:bg-white/[0.03] transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                                            style={{
                                                background: `hsl(${250 + i * 5}, 70%, 60%)20`,
                                                color: `hsl(${250 + i * 5}, 70%, 70%)`
                                            }}>
                                            {l.level}
                                        </div>
                                        <span className="text-white/70 font-medium text-sm">Level {l.level}</span>
                                    </div>
                                    <div className="text-center text-white/50 text-sm self-center">
                                        {l.directs} {l.directs === 1 ? "member" : "members"}
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-bold"
                                            style={{ color: `hsl(${260 + i * 8}, 80%, 72%)` }}>
                                            {l.percent}
                                        </span>
                                        <span className="text-white/30 text-xs ml-1">of ROI</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <p className="text-center text-white/20 text-xs mt-4">Commission is earned on your downline's daily ROI — not on their deposit amount.</p>
                    </FadeIn>
                </div>
            </section>

            {/* ── TEAM ──────────────────────────────────────────────────────── */}
            <section className="py-28 px-6 relative">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                <div className="max-w-6xl mx-auto">
                    <FadeIn className="text-center mb-16">
                        <p className="text-purple-400 text-sm font-medium tracking-widest uppercase mb-3">Meet the Team</p>
                        <h2 className="text-4xl sm:text-5xl font-normal tracking-tight">The Minds Behind<br /><span className="text-white/40">NeoQuant</span></h2>
                    </FadeIn>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {team.map((member, i) => (
                            <FadeIn key={i} delay={i * 0.1}>
                                <motion.div
                                    whileHover={{ y: -8 }}
                                    transition={{ type: "spring", stiffness: 250 }}
                                    className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all text-center group"
                                >
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
                                        style={{ background: member.color + "15" }}>
                                        {member.icon}
                                    </div>
                                    <h3 className="font-semibold text-white mb-1">{member.name}</h3>
                                    <p className="text-xs mb-3 font-medium" style={{ color: member.color }}>{member.role}</p>
                                    <p className="text-xs text-white/40 leading-relaxed">{member.desc}</p>
                                </motion.div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── AI STATS ──────────────────────────────────────────────────── */}
            <section className="py-20 px-6 relative">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                <div className="max-w-5xl mx-auto">
                    <FadeIn className="text-center mb-12">
                        <h2 className="text-3xl font-normal tracking-tight">AI-Driven Market Intelligence</h2>
                    </FadeIn>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {[
                            { pct: "67%", label: "AI Market Growth", desc: "AI drives global market growth through cutting-edge innovations.", color: "#818eff" },
                            { pct: "87%", label: "AI in Business", desc: "Businesses use AI to boost efficiency and streamline processes.", color: "#34d399" },
                            { pct: "77%", label: "Tech Confidence", desc: "Investors trust AI-guided decisions over traditional methods.", color: "#fbbf24" },
                        ].map((s, i) => (
                            <FadeIn key={i} delay={i * 0.1}>
                                <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] text-center">
                                    <div className="text-5xl font-bold mb-2" style={{ color: s.color }}>{s.pct}</div>
                                    <div className="font-medium text-white mb-2 text-sm">{s.label}</div>
                                    <div className="text-xs text-white/40 leading-relaxed">{s.desc}</div>
                                    {/* Progress bar */}
                                    <div className="mt-4 h-1 rounded-full bg-white/10 overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full"
                                            style={{ background: s.color }}
                                            initial={{ width: 0 }}
                                            whileInView={{ width: s.pct }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                        />
                                    </div>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── DOCUMENTS ─────────────────────────────────────────────────── */}
            <section className="py-28 px-6 relative">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                <div className="max-w-5xl mx-auto">
                    <FadeIn className="text-center mb-16">
                        <p className="text-purple-400 text-sm font-medium tracking-widest uppercase mb-3">Resources</p>
                        <h2 className="text-4xl sm:text-5xl font-normal tracking-tight">Portfolio & Documents</h2>
                        <p className="text-white/40 mt-4 max-w-xl mx-auto">
                            Our document framework outlines how NeoQuant blends AI-driven trading intelligence with a structured ROI system and ten-level referral model.
                        </p>
                    </FadeIn>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* View-Only Document */}
                        <FadeIn delay={0.1}>
                            <motion.div
                                whileHover={{ y: -4 }}
                                className="p-8 rounded-2xl border border-purple-500/20 bg-purple-500/5 flex flex-col gap-4"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-purple-500/15 flex items-center justify-center">
                                    <Eye className="w-7 h-7 text-purple-400" />
                                </div>
                                <div>
                                    <div className="inline-block text-xs bg-red-500/20 border border-red-500/30 text-red-400 px-2 py-0.5 rounded-full mb-2">View Only</div>
                                    <h3 className="text-xl font-semibold text-white mb-2">Portfolio Document</h3>
                                    <p className="text-white/50 text-sm leading-relaxed">
                                        View our full company portfolio and AI trading framework. This document is available for reading only to ensure document integrity.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setDocOpen(true)}
                                    className="mt-auto flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-medium text-purple-300 border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 transition-all"
                                >
                                    <Eye className="w-4 h-4" /> Open Document Viewer
                                </button>
                            </motion.div>
                        </FadeIn>

                        {/* Downloadable Presentation */}
                        <FadeIn delay={0.2}>
                            <motion.div
                                whileHover={{ y: -4 }}
                                className="p-8 rounded-2xl border border-green-500/20 bg-green-500/5 flex flex-col gap-4"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-green-500/15 flex items-center justify-center">
                                    <Download className="w-7 h-7 text-green-400" />
                                </div>
                                <div>
                                    <div className="inline-block text-xs bg-green-500/20 border border-green-500/30 text-green-400 px-2 py-0.5 rounded-full mb-2">Free Download</div>
                                    <h3 className="text-xl font-semibold text-white mb-2">Business Presentation</h3>
                                    <p className="text-white/50 text-sm leading-relaxed">
                                        Download our complete business presentation to share with your network. Includes packages, ROI details, and the referral income structure.
                                    </p>
                                </div>
                                <a
                                    href="/docs/NeoQuant-Presentation.pdf"
                                    download="NeoQuant-Presentation.pdf"
                                    className="mt-auto flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-medium text-green-300 border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 transition-all"
                                >
                                    <Download className="w-4 h-4" />
                                    <motion.span
                                        animate={{ opacity: [1, 0.6, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        Download Presentation
                                    </motion.span>
                                </a>
                            </motion.div>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
            <section className="py-28 px-6 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-[#4448B8]/15 blur-[100px]" />
                </div>
                <div className="max-w-3xl mx-auto text-center relative z-10">
                    <FadeIn>
                        <h2 className="text-4xl sm:text-5xl font-normal tracking-tight mb-6">
                            Ready to{" "}
                            <span className="bg-gradient-to-r from-[#818eff] to-[#a78bfa] bg-clip-text text-transparent">
                                Rise Together?
                            </span>
                        </h2>
                        <p className="text-white/50 text-lg leading-relaxed mb-10">
                            Join NeoQuant and start earning daily AI-automated returns from day one. Empower your network. Build your future.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link
                                href="/register"
                                className="px-10 py-4 bg-[#4448B8] border border-[#B4B7FF]/50 text-white rounded-xl font-medium text-lg hover:bg-[#3b3ea3] transition-all shadow-[inset_0px_-4px_10px_rgba(202,205,255,0.3)]"
                            >
                                Create Your Account
                            </Link>
                        </div>
                        <div className="mt-12 flex items-center justify-center gap-6 text-white/30 text-sm">
                            <span>🌐 www.NeoQuant.Finance</span>
                            <span>•</span>
                            <span>✉️ support@NeoQuant.Finance</span>
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* ── DOCUMENT VIEWER MODAL ─────────────────────────────────────── */}
            {docOpen && <DocViewer onClose={() => setDocOpen(false)} />}
        </main>
    );
}
