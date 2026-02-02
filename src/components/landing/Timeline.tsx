"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { UserPlus, Link as LinkIcon, Settings, Rocket } from "lucide-react";

export default function Timeline() {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const steps = [
        {
            icon: UserPlus,
            number: "01",
            title: "Sign Up",
            description: "Create your account in just 30 seconds. No credit card required to start exploring.",
        },
        {
            icon: LinkIcon,
            number: "02",
            title: "Choose Package",
            description: "Select the perfect investment package that matches your financial goals.",
        },
        {
            icon: Settings,
            number: "03",
            title: "Customize",
            description: "Set your preferences and configure your earning strategy with our smart tools.",
        },
        {
            icon: Rocket,
            number: "04",
            title: "Start Earning",
            description: "Watch your passive income grow automatically with daily ROI distributions.",
        },
    ];

    return (
        <section className="py-24 md:py-32 bg-[#020207] relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-[#020207] to-[#020207]" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
                        <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                            Your Effortless Journey
                        </span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
                        Get started in minutes and begin earning passive income today with our streamlined process.
                    </p>
                </motion.div>

                {/* Timeline */}
                <div ref={ref} className="relative max-w-4xl mx-auto">
                    {/* Vertical Line Container */}
                    <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[2px] bg-white/5 md:-translate-x-1/2 overflow-hidden">
                        {/* Glowing Pulse Animation */}
                        <motion.div
                            animate={{
                                y: [-100, 1200], // Extends beyond container height to loop nicely
                                opacity: [0, 1, 0],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                            className="absolute top-0 left-0 w-full h-[100px] bg-gradient-to-b from-transparent via-[#818eff] to-transparent box-shadow-[0_0_20px_2px_rgba(129,142,255,0.5)]"
                        />
                    </div>

                    {/* Steps */}
                    <div className="space-y-12 md:space-y-24">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isEven = index % 2 === 0;

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                                    animate={inView ? { opacity: 1, x: 0 } : {}}
                                    transition={{ duration: 0.6, delay: index * 0.2 }}
                                    className={`relative flex items-center ${isEven ? "md:flex-row" : "md:flex-row-reverse"
                                        } flex-col md:flex-row group`}
                                >
                                    {/* Content Card */}
                                    <div className={`w-full md:w-5/12 pl-20 md:pl-0 ${isEven ? "md:text-right md:pr-16" : "md:text-left md:pl-16"}`}>
                                        <div className="relative p-6 md:p-8 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm group-hover:bg-white/[0.04] group-hover:border-purple-500/30 transition-all duration-300">
                                            {/* Glass Shine Effect */}
                                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                            <div className="relative z-10">
                                                <div className="text-[#818eff] font-bold text-sm mb-2 tracking-wider uppercase">STEP {step.number}</div>
                                                <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                                                <p className="text-gray-400 leading-relaxed text-sm md:text-base">{step.description}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Center Icon Marker */}
                                    <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 w-16 h-16 flex items-center justify-center top-0 md:top-auto">
                                        {/* Outer Glow Ring */}
                                        <div className="absolute inset-0 bg-[#818eff]/20 rounded-full blur-md group-hover:blur-xl transition-all duration-300" />

                                        {/* Inner Circle */}
                                        <div className="relative w-12 h-12 bg-[#020207] rounded-full border border-[#818eff]/50 flex items-center justify-center z-10 group-hover:scale-110 transition-transform duration-300 group-hover:border-[#818eff]">
                                            <Icon className="w-5 h-5 text-white group-hover:text-[#818eff] transition-colors" />
                                        </div>
                                    </div>

                                    {/* Spacer for opposite side alignment */}
                                    <div className="hidden md:block w-5/12" />
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
