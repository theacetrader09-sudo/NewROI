"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { MouseEvent } from "react";
import {
    Zap,
    Shield,
    TrendingUp,
    Globe,
    Clock,
    Users,
    BarChart3,
    Lock,
} from "lucide-react";

export default function FeaturesGrid() {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const features = [
        {
            icon: Zap,
            title: "Lightning Fast Execution",
            description: "Instant transactions and real-time ROI distribution powered by advanced low-latency algorithms.",
            size: "large",
        },
        {
            icon: Shield,
            title: "Bank-Level Security",
            description: "Your funds are protected with military-grade encryption and multi-layer security protocols.",
            size: "normal",
        },
        {
            icon: TrendingUp,
            title: "Smart ROI Distribution",
            description: "Automated daily returns calculated with precision and distributed automatically to your wallet.",
            size: "normal",
        },
        {
            icon: Globe,
            title: "Global Infrastructure",
            description: "Access your earnings from anywhere in the world, 24/7, with our distributed node network.",
            size: "large",
        },
        {
            icon: Clock,
            title: "Real-Time Updates",
            description: "Monitor your earnings live with instant notifications and updates.",
            size: "normal",
        },
        {
            icon: Users,
            title: "Multi-Level Network",
            description: "Build your network and earn commissions up to 10 levels deep.",
            size: "normal",
        },
        {
            icon: BarChart3,
            title: "Advanced Analytics",
            description: "Comprehensive dashboards with detailed insights into your earnings.",
            size: "large",
        },
        {
            icon: Lock,
            title: "Secure Wallet",
            description: "Your personal wallet with advanced security features and instant withdrawals.",
            size: "normal",
        },
    ];

    return (
        <section id="features" className="py-24 md:py-32 bg-[#020207] relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-radial from-purple-900/10 via-transparent to-transparent" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
                        <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Powerful Features for
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-[#818eff] to-[#4448B8] bg-clip-text text-transparent">
                            Maximum Earnings
                        </span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
                        Engineered for speed, security, and scalability. Everything you need to build wealth through our automated system.
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} feature={feature} index={index} inView={inView} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function FeatureCard({ feature, index, inView }: { feature: any; index: number; inView: boolean }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    const Icon = feature.icon;
    const isLarge = feature.size === "large";

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className={`group relative border border-white/10 bg-gray-900/50 overflow-hidden rounded-xl ${isLarge ? "md:col-span-2 lg:col-span-1" : ""
                }`}
            onMouseMove={handleMouseMove}
        >
            {/* Spotlight Effect */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(129, 142, 255, 0.15),
              transparent 80%
            )
          `,
                }}
            />

            <div className="relative h-full p-8 flex flex-col items-start justify-start">
                <div className="mb-6 relative">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-6 h-6 text-[#818eff]" />
                    </div>
                </div>

                <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">
                    {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                </p>
            </div>
        </motion.div>
    );
}
