"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
    return (
        <section className="py-32 bg-[#020207] relative overflow-hidden flex items-center justify-center">
            {/* Background Gradient Mesh - Animated */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full blur-[100px]"
                />
            </div>

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,#020207_100%)] pointer-events-none" />

            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    {/* Badge */}
                    <div className="inline-flex items-center px-4 py-2 bg-white/[0.03] border border-white/10 rounded-full mb-8 backdrop-blur-sm">
                        <span className="text-sm text-purple-300 font-medium tracking-wide">
                            Join 5,000+ Active Users
                        </span>
                    </div>

                    {/* Headline */}
                    <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-[1.1] tracking-tight text-white">
                        Ready to Start <br className="hidden md:block" />
                        <span className="bg-gradient-to-r from-[#818eff] via-purple-400 to-[#818eff] bg-clip-text text-transparent">
                            Earning Passive Income?
                        </span>
                    </h2>

                    {/* Description */}
                    <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Join thousands of successful investors who are already building wealth through our AI investment strategies. Start your journey today.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <Link
                            href="/register"
                            className="bg-[#4448B8] border-[0.5px] border-[#B4B7FF] text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-[#3b3ea3] transition-all shadow-[inset_0px_-4px_10px_rgba(202,205,255,0.55)] flex items-center group"
                        >
                            Sign Up
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/login"
                            className="bg-white/[0.05] border border-white/10 text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-white/10 transition-all flex items-center"
                        >
                            Login
                        </Link>
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-gray-500 text-sm font-medium">
                        <div className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full box-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                            <span>No credit card required</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full box-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                            <span>Setup in 30 seconds</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full box-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                            <span>Cancel anytime</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
