"use client";

import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
    Brain, TrendingUp, Users, Shield, Download, Eye,
    X, Zap, Globe, BarChart3, ChevronLeft, ChevronRight
} from "lucide-react";

// ─── Optimised fade variant (GPU-accelerated, no layout shift) ────────────────
const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

// ─── Team ─────────────────────────────────────────────────────────────────────
const team = [
    { name: "Reese Miller", role: "Founder & CEO", icon: "🧠", color: "#818eff", desc: "Visionary behind NeoQuant's AI-driven mission to democratise intelligent trading." },
    { name: "Drew Feig", role: "Chief Technology Officer", icon: "⚡", color: "#a78bfa", desc: "Architect of the automation engine. Transforms complex AI into seamless user experiences." },
    { name: "Li Mei Chen", role: "Head of Data Intelligence", icon: "📊", color: "#34d399", desc: "Leads the machine-learning pipeline that processes 25,000+ market patterns daily." },
    { name: "Daniel Ross", role: "Head of Finance & Compliance", icon: "🏛️", color: "#fbbf24", desc: "Ensures regulatory excellence and financial transparency across all operations." },
];

// ─── Level income ─────────────────────────────────────────────────────────────
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

// ─── Packages ─────────────────────────────────────────────────────────────────
const packages = [
    { label: "Bronze", range: "$35 – $999", roi: "0.5%", color: "#4ADE80", glow: "rgba(74,222,128,0.06)", icon: "🥉" },
    { label: "Silver", range: "$1,000 – $9,999", roi: "1%", color: "#60A5FA", glow: "rgba(96,165,250,0.07)", icon: "🥈" },
    { label: "Gold", range: "$10,000 – $29,999", roi: "2%", color: "#818eff", glow: "rgba(129,142,255,0.09)", icon: "🥇" },
    { label: "Diamond", range: "$30,000 – $999,999", roi: "5%", color: "#F59E0B", glow: "rgba(245,158,11,0.07)", icon: "💎" },
];

// ─── Responsive Document Viewer Modal ────────────────────────────────────────
function DocViewer({ onClose }: { onClose: () => void }) {
    // Lock body scroll when open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] flex flex-col bg-[#08080f]"
            style={{ WebkitOverflowScrolling: "touch" }}
        >
            {/* ── Top bar ── */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0 bg-[#0d0d1a]">
                <div className="flex items-center gap-2 min-w-0">
                    <Eye className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span className="text-white font-medium text-sm truncate">NeoQuant Portfolio Document</span>
                    <span className="hidden sm:inline text-[10px] bg-red-500/20 border border-red-500/30 text-red-400 px-2 py-0.5 rounded-full flex-shrink-0">View Only</span>
                </div>
                <button
                    onClick={onClose}
                    className="ml-3 flex-shrink-0 text-white/60 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
                    aria-label="Close viewer"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* ── PDF frame: fills all remaining viewport height ── */}
            <div className="flex-1 relative overflow-hidden">
                {/*
                  #toolbar=0  — hides Chrome/Edge built-in PDF toolbar (download, print)
                  #navpanes=0 — hides sidebar navigation panel
                  #statusbar=0 — hides the status bar
                  width/height 100% fills the container exactly
                */}
                <iframe
                    src="/docs/NeoQuant-Presentation.pdf#toolbar=0&navpanes=0&statusbar=0&view=FitH"
                    className="absolute inset-0 w-full h-full border-0"
                    title="NeoQuant Portfolio Document — View Only"
                    // Disable right-click context menu inside iframe area (best-effort)
                    onContextMenu={(e) => e.preventDefault()}
                    sandbox="allow-scripts allow-same-origin"
                />

                {/* Invisible overlay strips the top-right Chrome download/print icon row */}
                <div
                    className="absolute top-0 right-0 bg-[#08080f] pointer-events-none"
                    style={{ width: 48, height: 48, zIndex: 10 }}
                />
            </div>
        </motion.div>
    );
}

// ─── Section wrapper — uses whileInView directly for zero extra re-renders ────
function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.08 }}
            className={`py-24 md:py-28 px-4 sm:px-6 relative ${className}`}
        >
            {children}
        </motion.section>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AboutPage() {
    const [docOpen, setDocOpen] = useState(false);

    return (
        <main className="bg-[#020207] text-white overflow-x-hidden">

            {/* ── HERO ──────────────────────────────────────────────────────── */}
            <section className="relative min-h-screen flex flex-col items-center justify-center pt-28 pb-20 overflow-hidden">
                {/* Static glow blobs — no JS animation, CSS only for perf */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-[#4448B8]/20 blur-[120px]" />
                    <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-purple-600/10 blur-[100px]" />
                </div>

                <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.05] border border-white/10 rounded-full mb-8 text-sm text-white/70"
                    >
                        <Brain className="w-4 h-4 text-purple-400" />
                        AI-Powered Financial Intelligence
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="text-5xl sm:text-6xl md:text-7xl font-normal leading-[1.08] tracking-tight mb-6"
                    >
                        A New Way to{" "}
                        <span className="bg-gradient-to-r from-[#818eff] via-[#a78bfa] to-[#818eff] bg-clip-text text-transparent">
                            Grow, Earn,
                        </span>
                        <br /> and Rise Together.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="text-base sm:text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-10"
                    >
                        NeoQuant is an AI-driven trading intelligence platform designed to replace fear-based decisions with precision, speed, and daily automated returns.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link href="/register"
                            className="w-full sm:w-auto px-8 py-3.5 bg-[#4448B8] border border-[#B4B7FF]/50 text-white rounded-xl font-medium hover:bg-[#3b3ea3] transition-colors shadow-[inset_0px_-4px_10px_rgba(202,205,255,0.3)] text-center"
                        >
                            Start Your Journey
                        </Link>
                        <button onClick={() => setDocOpen(true)}
                            className="w-full sm:w-auto px-8 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                        >
                            <Eye className="w-4 h-4 text-purple-400" /> View Portfolio Document
                        </button>
                    </motion.div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-[1px] h-10 bg-gradient-to-b from-[#818eff] to-transparent mx-auto"
                    />
                </div>
            </section>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* ── OUR STORY ─────────────────────────────────────────────────── */}
            <Section>
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-purple-400 text-xs font-medium tracking-widest uppercase mb-3">Our Origin</p>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight">
                            The Beginning of <span className="text-white/40">Intelligent Trading</span>
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            { icon: "🧠", color: "#818eff", title: "Human Instinct", body: "Before automation, traders relied on instinct, luck, and fear. Markets moved faster than human reactions, and opportunities slipped away constantly.", sub: "Emotional decisions, hesitation, and doubt shaped outcomes more than strategy." },
                            { icon: "⚡", color: "#34d399", title: "Machine Evolution", body: "A quiet shift began — data started replacing emotion, and intelligence began to evolve beyond human limitation. Speed became essential, precision became survival.", sub: "Calculated decisions powered by patterns, speed, and learning without fear." },
                        ].map((card, i) => (
                            <motion.div key={i}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true, amount: 0.1 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-7 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
                                style={{ boxShadow: `0 0 40px ${card.color}06` }}
                            >
                                <div className="text-4xl mb-4">{card.icon}</div>
                                <h3 className="text-lg font-semibold mb-3" style={{ color: card.color }}>{card.title}</h3>
                                <p className="text-white/55 leading-relaxed mb-4 text-sm">{card.body}</p>
                                <p className="text-xs text-white/30 italic border-l-2 pl-3" style={{ borderColor: card.color + "50" }}>{card.sub}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-8">
                        {[
                            { stat: "25K+", label: "Patterns Processed Daily", icon: <BarChart3 className="w-5 h-5" /> },
                            { stat: "+40", label: "Market Behaviours Learned", icon: <Brain className="w-5 h-5" /> },
                            { stat: "+27", label: "Industry Technologies", icon: <Globe className="w-5 h-5" /> },
                        ].map((s, i) => (
                            <motion.div key={i}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true, amount: 0.1 }}
                                transition={{ delay: i * 0.08 }}
                                className="text-center p-5 rounded-2xl bg-white/[0.03] border border-white/10"
                            >
                                <div className="text-purple-400 flex justify-center mb-2">{s.icon}</div>
                                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{s.stat}</div>
                                <div className="text-[11px] text-white/40">{s.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </Section>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* ── VISION ────────────────────────────────────────────────────── */}
            <Section className="relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#4448B8]/10 blur-[140px]" />
                </div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <p className="text-purple-400 text-xs font-medium tracking-widest uppercase mb-3">Vision Statement</p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight mb-8">
                        A Future Where Every{" "}
                        <span className="bg-gradient-to-r from-[#818eff] to-[#a78bfa] bg-clip-text text-transparent">
                            Trader Can Rise
                        </span>
                    </h2>
                    <div className="space-y-5 text-base sm:text-lg text-white/55 leading-relaxed">
                        <p>For too long, only institutions held the advantage — speed, data, and control. NeoQuant envisions a world where everyday traders can earn daily returns effortlessly.</p>
                        <p>With Bronze, Silver, Gold and Diamond packages creating growth for all investor levels. A world where sharing the system strengthens entire communities through a ten-level income structure.</p>
                        <p className="text-white/80 font-medium text-lg sm:text-xl">A future where success is no longer reserved for the few, but awakened in the many.</p>
                    </div>
                </div>
            </Section>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* ── MISSION ───────────────────────────────────────────────────── */}
            <Section>
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-purple-400 text-xs font-medium tracking-widest uppercase mb-3">Our Mission</p>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight">
                            Built for Every <span className="text-white/40">Level of Investor</span>
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-5">
                        {[
                            { icon: <Zap className="w-5 h-5" />, color: "#818eff", title: "Eliminate Fear-Based Trading", body: "We aim to eliminate fear-based trading and replace uncertainty with reliable daily returns generated through evolving AI intelligence." },
                            { icon: <Users className="w-5 h-5" />, color: "#34d399", title: "Reward Connection", body: "Through a ten-level referral system, users benefit from shared momentum, expanding networks, and collective acceleration." },
                            { icon: <Shield className="w-5 h-5" />, color: "#fbbf24", title: "Transparent & Structured", body: "Every user can participate in growth through investment packages built for accessibility, progress, and sustainable long-term advancement." },
                            { icon: <TrendingUp className="w-5 h-5" />, color: "#a78bfa", title: "Accessible at Every Level", body: "From first-time investors at $35 to seasoned traders, NeoQuant provides a structured pathway to consistent daily income through AI automation." },
                        ].map((c, i) => (
                            <motion.div key={i}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true, amount: 0.1 }}
                                transition={{ delay: i * 0.08 }}
                                className="flex gap-4 p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                            >
                                <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: c.color + "15", color: c.color }}>
                                    {c.icon}
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1.5 text-white text-sm">{c.title}</h3>
                                    <p className="text-xs text-white/50 leading-relaxed">{c.body}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </Section>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* ── PACKAGES ──────────────────────────────────────────────────── */}
            <Section>
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-purple-400 text-xs font-medium tracking-widest uppercase mb-3">Investment Tiers</p>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight">Packages & Daily ROI</h2>
                        <p className="text-white/40 mt-4 max-w-xl mx-auto text-sm sm:text-base">Daily returns credited automatically every 24 hours.</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {packages.map((pkg, i) => (
                            <motion.div key={i}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true, amount: 0.1 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="relative p-7 rounded-2xl border text-center overflow-hidden"
                                style={{ borderColor: pkg.color + "30", background: pkg.glow }}
                            >
                                <div className="text-4xl mb-4">{pkg.icon}</div>
                                <div className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: pkg.color }}>{pkg.label}</div>
                                <div className="text-white/50 text-sm mb-5">{pkg.range}</div>
                                <div className="text-5xl sm:text-6xl font-bold mb-1" style={{ color: pkg.color }}>{pkg.roi}</div>
                                <div className="text-white/40 text-xs">Daily ROI</div>
                                <div className="mt-6 pt-5 border-t border-white/10">
                                    <Link href="/register"
                                        className="block w-full py-2.5 rounded-xl font-medium text-sm transition-colors"
                                        style={{ background: pkg.color + "1a", color: pkg.color, border: `1px solid ${pkg.color}30` }}>
                                        Get Started →
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <p className="text-center text-white/25 text-xs mt-6">Minimum withdrawal: $20 USDT • Fees: 5% platform + 0.20% network</p>
                </div>
            </Section>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* ── LEVEL INCOME ──────────────────────────────────────────────── */}
            <Section>
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-purple-400 text-xs font-medium tracking-widest uppercase mb-3">Referral Rewards</p>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight">10-Level Income System</h2>
                        <p className="text-white/40 mt-4 text-sm sm:text-base max-w-lg mx-auto">Earn commissions from your network's daily ROI — up to 10 levels deep.</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 overflow-hidden">
                        <div className="grid grid-cols-3 text-[10px] sm:text-xs font-medium tracking-widest uppercase text-white/30 px-4 sm:px-6 py-3 border-b border-white/10 bg-white/[0.02]">
                            <span>Level</span>
                            <span className="text-center">Directs Needed</span>
                            <span className="text-right">Commission</span>
                        </div>
                        {levels.map((l, i) => (
                            <motion.div key={l.level}
                                initial={{ opacity: 0, x: -16 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, amount: 0.05 }}
                                transition={{ delay: i * 0.04, duration: 0.35 }}
                                className="grid grid-cols-3 px-4 sm:px-6 py-3.5 border-b border-white/5 hover:bg-white/[0.03] transition-colors last:border-0"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                                        style={{ background: `hsl(${250 + i * 5},70%,60%)18`, color: `hsl(${250 + i * 5},70%,72%)` }}>
                                        {l.level}
                                    </div>
                                    <span className="text-white/60 text-xs sm:text-sm font-medium">Lvl {l.level}</span>
                                </div>
                                <div className="text-center text-white/45 text-xs sm:text-sm self-center">{l.directs}</div>
                                <div className="text-right">
                                    <span className="font-bold text-sm" style={{ color: `hsl(${260 + i * 8},80%,72%)` }}>{l.percent}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <p className="text-center text-white/20 text-xs mt-3">Commission earned on downline's daily ROI — not on deposit amount.</p>
                </div>
            </Section>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* ── TEAM ──────────────────────────────────────────────────────── */}
            <Section>
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-purple-400 text-xs font-medium tracking-widest uppercase mb-3">Meet the Team</p>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight">
                            The Minds Behind <span className="text-white/40">NeoQuant</span>
                        </h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {team.map((member, i) => (
                            <motion.div key={i}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true, amount: 0.1 }}
                                transition={{ delay: i * 0.08 }}
                                whileHover={{ y: -6 }}
                                className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-center"
                            >
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
                                    style={{ background: member.color + "15" }}>
                                    {member.icon}
                                </div>
                                <h3 className="font-semibold text-white mb-1 text-sm">{member.name}</h3>
                                <p className="text-xs mb-3 font-medium" style={{ color: member.color }}>{member.role}</p>
                                <p className="text-xs text-white/40 leading-relaxed">{member.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </Section>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* ── AI STATS ──────────────────────────────────────────────────── */}
            <Section>
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-normal tracking-tight">AI-Driven Market Intelligence</h2>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-5">
                        {[
                            { pct: "67%", w: "67%", label: "AI Market Growth", desc: "AI drives global market growth through cutting-edge innovations.", color: "#818eff" },
                            { pct: "87%", w: "87%", label: "AI in Business", desc: "Businesses use AI to boost efficiency and streamline processes.", color: "#34d399" },
                            { pct: "77%", w: "77%", label: "Tech Confidence", desc: "Investors trust AI-guided decisions over traditional methods.", color: "#fbbf24" },
                        ].map((s, i) => (
                            <motion.div key={i}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true, amount: 0.1 }}
                                transition={{ delay: i * 0.08 }}
                                className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] text-center"
                            >
                                <div className="text-4xl sm:text-5xl font-bold mb-2" style={{ color: s.color }}>{s.pct}</div>
                                <div className="font-medium text-white mb-2 text-sm">{s.label}</div>
                                <div className="text-xs text-white/40 leading-relaxed mb-4">{s.desc}</div>
                                <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{ background: s.color }}
                                        initial={{ width: 0 }}
                                        whileInView={{ width: s.w }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </Section>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* ── DOCUMENTS ─────────────────────────────────────────────────── */}
            <Section>
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-purple-400 text-xs font-medium tracking-widest uppercase mb-3">Resources</p>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight">Portfolio & Documents</h2>
                        <p className="text-white/40 mt-4 max-w-xl mx-auto text-sm sm:text-base">
                            Our document framework outlines how NeoQuant blends AI-driven trading with a structured ROI system and ten-level referral model.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* View-Only */}
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{ delay: 0.05 }}
                            whileHover={{ y: -4 }}
                            className="p-7 rounded-2xl border border-purple-500/20 bg-purple-500/5 flex flex-col gap-4"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 flex items-center justify-center">
                                <Eye className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <span className="text-[10px] bg-red-500/20 border border-red-500/30 text-red-400 px-2 py-0.5 rounded-full">View Only</span>
                                <h3 className="text-lg font-semibold text-white mt-2 mb-1.5">Portfolio Document</h3>
                                <p className="text-white/45 text-sm leading-relaxed">View our full company portfolio and AI trading framework. Available for reading only to ensure document integrity.</p>
                            </div>
                            <button onClick={() => setDocOpen(true)}
                                className="mt-auto flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium text-purple-300 border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 transition-colors text-sm"
                            >
                                <Eye className="w-4 h-4" /> Open Document Viewer
                            </button>
                        </motion.div>

                        {/* Downloadable */}
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{ delay: 0.12 }}
                            whileHover={{ y: -4 }}
                            className="p-7 rounded-2xl border border-green-500/20 bg-green-500/5 flex flex-col gap-4"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-green-500/15 flex items-center justify-center">
                                <Download className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <span className="text-[10px] bg-green-500/20 border border-green-500/30 text-green-400 px-2 py-0.5 rounded-full">Free Download</span>
                                <h3 className="text-lg font-semibold text-white mt-2 mb-1.5">Business Presentation</h3>
                                <p className="text-white/45 text-sm leading-relaxed">Download our complete business presentation. Includes packages, ROI details, and the full referral income structure.</p>
                            </div>
                            <a href="/docs/NeoQuant-Presentation.pdf"
                                download="NeoQuant-Presentation.pdf"
                                className="mt-auto flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium text-green-300 border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 transition-colors text-sm"
                            >
                                <Download className="w-4 h-4" /> Download Presentation
                            </a>
                        </motion.div>
                    </div>
                </div>
            </Section>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
            <Section className="relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-[#4448B8]/15 blur-[100px]" />
                </div>
                <div className="max-w-3xl mx-auto text-center relative z-10">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight mb-6">
                        Ready to{" "}
                        <span className="bg-gradient-to-r from-[#818eff] to-[#a78bfa] bg-clip-text text-transparent">
                            Rise Together?
                        </span>
                    </h2>
                    <p className="text-white/50 text-base sm:text-lg leading-relaxed mb-10">
                        Join NeoQuant and start earning daily AI-automated returns from day one. Empower your network. Build your future.
                    </p>
                    <Link href="/register"
                        className="inline-block px-10 py-4 bg-[#4448B8] border border-[#B4B7FF]/50 text-white rounded-xl font-medium text-base sm:text-lg hover:bg-[#3b3ea3] transition-colors shadow-[inset_0px_-4px_10px_rgba(202,205,255,0.3)]"
                    >
                        Create Your Account
                    </Link>
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-white/25 text-xs sm:text-sm">
                        <span>🌐 www.NeoQuant.Finance</span>
                        <span className="hidden sm:inline">•</span>
                        <span>✉️ support@NeoQuant.Finance</span>
                    </div>
                </div>
            </Section>

            {/* ── DOCUMENT VIEWER MODAL ─────────────────────────────────────── */}
            {docOpen && <DocViewer onClose={() => setDocOpen(false)} />}
        </main>
    );
}
