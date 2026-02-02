"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import CountUp from "react-countup";

export default function StatsRibbon() {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.3,
    });

    const stats = [
        { value: 5, suffix: "K+", label: "Active Users", decimals: 1 },
        { value: 99.9, suffix: "%", label: "Uptime Guarantee", decimals: 1 },
        { value: 2000000, prefix: "$", suffix: "+", label: "Total Earnings", decimals: 0 },
        { value: 18, suffix: "+", label: "Countries Worldwide" },
    ];

    return (
        <section ref={ref} className="relative py-20 bg-[#020207] border-y border-white/5 overflow-hidden">
            {/* Glassmorphic Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-transparent to-blue-900/10 pointer-events-none" />

            {/* Animated Top/Bottom Borders */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="text-center group"
                        >
                            <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                                {stat.prefix}
                                {inView && (
                                    <CountUp
                                        end={stat.value}
                                        duration={2.5}
                                        decimals={stat.decimals || 0}
                                        separator=","
                                    />
                                )}
                                {stat.suffix}
                            </div>
                            <div className="text-gray-400 text-sm md:text-base font-medium tracking-wide">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
