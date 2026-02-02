"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";

export default function HeroSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"]
    });

    // Transform scroll progress to bar height (0 to 100%)
    const barHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    return (
        <section ref={sectionRef} className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden bg-[#020207] pt-24 pb-12 sm:pt-32 sm:pb-20">
            {/* Background Shadow Effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-[1400px] z-0 pointer-events-none">
                <Image
                    src="/assets/landing/hero-shadow.avif"
                    alt="Background Glow"
                    fill
                    priority
                    className="object-cover object-top opacity-60"
                />
            </div>

            {/* Glowing Pipe Animation (SVG Overlay) */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <svg className="w-full h-full min-w-[375px]" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMin slice" fill="none">
                    <defs>
                        <linearGradient id="pipeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(68, 72, 184, 0)" />
                            <stop offset="50%" stopColor="#818eff" />
                            <stop offset="100%" stopColor="rgba(68, 72, 184, 0)" />
                        </linearGradient>
                    </defs>

                    {/* Left Pipe - Adjusted for mobile visibility */}
                    <path
                        d="M0 100 C 400 100, 600 300, 720 450"
                        stroke="#1a1b2e"
                        strokeWidth="2"
                        fill="none"
                        className="opacity-30 hidden sm:block"
                    />
                    <motion.path
                        d="M0 100 C 400 100, 600 300, 720 450"
                        stroke="url(#pipeGradient)"
                        strokeWidth="2"
                        fill="none"
                        initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }}
                        animate={{ pathLength: 0.4, pathOffset: 1, opacity: [0, 1, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="hidden sm:block"
                    />

                    {/* Right Pipe - Adjusted for mobile visibility */}
                    <path
                        d="M1440 100 C 1040 100, 840 300, 720 450"
                        stroke="#1a1b2e"
                        strokeWidth="2"
                        fill="none"
                        className="opacity-30 hidden sm:block"
                    />
                    <motion.path
                        d="M1440 100 C 1040 100, 840 300, 720 450"
                        stroke="url(#pipeGradient)"
                        strokeWidth="2"
                        fill="none"
                        initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }}
                        animate={{ pathLength: 0.4, pathOffset: 1, opacity: [0, 1, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 2 }}
                        className="hidden sm:block"
                    />

                    {/* Center Down Pipe - Visible on all screens but optimized */}
                    <path
                        d="M720 450 L 720 900"
                        stroke="#1a1b2e"
                        strokeWidth="2"
                        fill="none"
                        className="opacity-30"
                    />
                    <motion.path
                        d="M720 450 L 720 900"
                        stroke="url(#pipeGradient)"
                        strokeWidth="2"
                        fill="none"
                        initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }}
                        animate={{ pathLength: 0.4, pathOffset: 1, opacity: [0, 1, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1 }}
                    />
                </svg>
            </div>

            {/* Scroll-Linked Vertical Bar */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 z-[5] pointer-events-none" style={{ height: '200vh' }}>
                {/* Static background line */}
                <div className="absolute left-1/2 -translate-x-1/2 w-[2px] h-full bg-gradient-to-b from-[#1a1b2e] via-[#1a1b2e] to-transparent opacity-30" />

                {/* Scroll-linked animated bar */}
                <motion.div
                    className="absolute left-1/2 -translate-x-1/2 w-[2px] top-0 origin-top"
                    style={{ height: barHeight }}
                >
                    {/* Gradient bar */}
                    <div className="w-full h-full bg-gradient-to-b from-[#818eff] via-[#4448B8] to-transparent opacity-80" />

                    {/* Glowing effect */}
                    <div className="absolute inset-0 w-[4px] -translate-x-[1px] bg-gradient-to-b from-[#818eff] via-[#4448B8] to-transparent blur-md opacity-60" />

                    {/* Moving light particles */}
                    <motion.div
                        className="absolute w-2 h-2 bg-[#818eff] rounded-full blur-sm"
                        style={{ left: '-3px' }}
                        animate={{
                            y: ['0%', '100%'],
                            opacity: [0, 1, 1, 0]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                </motion.div>
            </div>


            {/* Main Content Container */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">

                {/* Trending Pill */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="mb-6 sm:mb-8"
                >
                    <div className="inline-flex items-center space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/[0.05] border border-white/10 rounded-full backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default max-w-[90vw]">
                        <span className="text-white/90 text-[12px] sm:text-[14px] font-medium tracking-wide truncate">
                            New: AI-Powered Investment Automation
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70 flex-shrink-0" />
                    </div>
                </motion.div>

                {/* Hero Headline - Responsive Typography */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                    className="text-[32px] sm:text-[56px] md:text-[64px] font-normal text-white leading-[1.1] tracking-[-0.84px] mb-4 sm:mb-6 max-w-4xl mx-auto"
                >
                    Trade Smarter with <br className="hidden sm:block" />
                    AI-Powered Insights
                </motion.h1>

                {/* Subheadline - Responsive Spacing & Size */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                    className="text-[15px] sm:text-[18px] text-white/80 font-normal leading-relaxed mb-8 sm:mb-10 max-w-[90%] sm:max-w-[600px] mx-auto"
                >
                    AI that trades with you, anytime anywhere, with confidence.
                    Manage your portfolio with automated precision.
                </motion.p>

                {/* CTA Buttons - Stacked on Mobile */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                    className="w-full sm:w-auto flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 mb-16 sm:mb-20 px-4"
                >
                    <Link
                        href="/register"
                        className="w-full sm:w-auto px-8 py-3.5 bg-[#4448B8] border-[0.5px] border-[#B4B7FF] text-white rounded-[10px] font-medium text-[16px] hover:bg-[#3b3ea3] transition-all shadow-[inset_0px_-4px_10px_rgba(202,205,255,0.55)] text-center"
                    >
                        Start Your AI Journey
                    </Link>
                    <Link
                        href="/login"
                        className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-b from-transparent to-[#494c7f]/40 border-[0.5px] border-[#B4B7FF]/50 text-white rounded-[10px] font-medium text-[16px] hover:bg-white/5 transition-all shadow-[inset_0px_-4px_10px_rgba(202,205,255,0.2)] text-center"
                    >
                        Login
                    </Link>
                </motion.div>

                {/* Dashboard Preview Image - Optimized for Mobile */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                    className="relative w-full max-w-[1200px] px-2 sm:px-0"
                >
                    {/* Floating AI Badge - Repositioned for Mobile */}
                    <motion.div
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-8 right-0 sm:-top-12 sm:-right-0 z-20 w-20 sm:w-32"
                    >
                        <Image
                            src="/assets/landing/ai-badge.avif"
                            alt="AI Powered"
                            width={128}
                            height={128}
                            className="w-full h-auto drop-shadow-2xl"
                        />
                    </motion.div>

                    {/* Animated Border Wrapper */}
                    <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-[#4448B8] via-[#818eff] to-[#4448B8] bg-[length:200%_100%] animate-gradient-flow">
                        <style jsx>{`
                            @keyframes gradient-flow {
                                0% {
                                    background-position: 0% 50%;
                                }
                                50% {
                                    background-position: 100% 50%;
                                }
                                100% {
                                    background-position: 0% 50%;
                                }
                            }
                            .animate-gradient-flow {
                                animation: gradient-flow 3s ease infinite;
                            }
                        `}</style>

                        {/* Glowing Effect Behind Border */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#4448B8] via-[#818eff] to-[#4448B8] blur-xl opacity-50 animate-pulse" />

                        <div className="relative rounded-xl overflow-hidden shadow-2xl bg-[#0A0A10]">
                            <Image
                                src="/assets/landing/dashboard-preview-new.png"
                                alt="Dashboard Preview"
                                width={1200}
                                height={800}
                                className="w-full h-auto relative z-10"
                                priority
                            />
                            {/* Overlay Gradient to blend bottom if needed */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#020207] via-transparent to-transparent opacity-20 pointer-events-none z-20" />
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
