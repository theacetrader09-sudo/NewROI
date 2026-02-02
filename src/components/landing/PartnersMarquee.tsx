"use client";

import { motion } from "framer-motion";

// Fictional tech company brands
const PARTNERS = [
    { name: "NexFlow", type: "flow" },
    { name: "Quantix", type: "quantum" },
    { name: "StratAI", type: "neural" },
    { name: "VaultX", type: "vault" },
    { name: "Prismix", type: "prism" },
    { name: "Zenith", type: "peak" },
    { name: "Axiom", type: "abstract" },
    { name: "Lumina", type: "light" }
];

// Professional SVG Logo Components
const LogoComponent = ({ partner }: { partner: typeof PARTNERS[0] }) => {
    const logos = {
        flow: (
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="w-8 h-8 sm:w-10 sm:h-10">
                <path d="M10 20C10 15 12 10 15 8C18 6 22 6 25 8M30 20C30 25 28 30 25 32C22 34 18 34 15 32"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="15" cy="12" r="2" fill="currentColor" />
                <circle cx="25" cy="28" r="2" fill="currentColor" />
            </svg>
        ),
        quantum: (
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="w-8 h-8 sm:w-10 sm:h-10">
                <circle cx="20" cy="20" r="8" stroke="currentColor" strokeWidth="2" />
                <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
                <circle cx="20" cy="8" r="2" fill="currentColor" />
                <circle cx="20" cy="32" r="2" fill="currentColor" />
                <circle cx="8" cy="20" r="2" fill="currentColor" />
                <circle cx="32" cy="20" r="2" fill="currentColor" />
            </svg>
        ),
        neural: (
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="w-8 h-8 sm:w-10 sm:h-10">
                <circle cx="10" cy="15" r="3" stroke="currentColor" strokeWidth="2" />
                <circle cx="30" cy="15" r="3" stroke="currentColor" strokeWidth="2" />
                <circle cx="10" cy="25" r="3" stroke="currentColor" strokeWidth="2" />
                <circle cx="30" cy="25" r="3" stroke="currentColor" strokeWidth="2" />
                <circle cx="20" cy="20" r="4" fill="currentColor" />
                <path d="M13 15L17 19M17 21L13 25M27 15L23 19M23 21L27 25"
                    stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
            </svg>
        ),
        vault: (
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="w-8 h-8 sm:w-10 sm:h-10">
                <rect x="10" y="12" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                <circle cx="20" cy="20" r="4" stroke="currentColor" strokeWidth="2" />
                <path d="M20 16V24M16 20H24" stroke="currentColor" strokeWidth="1.5" />
            </svg>
        ),
        prism: (
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="w-8 h-8 sm:w-10 sm:h-10">
                <path d="M20 8L32 28H8L20 8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <path d="M20 8L20 28" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
            </svg>
        ),
        peak: (
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="w-8 h-8 sm:w-10 sm:h-10">
                <path d="M8 30L20 10L32 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 30L20 20L26 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        abstract: (
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="w-8 h-8 sm:w-10 sm:h-10">
                <rect x="12" y="12" width="8" height="8" stroke="currentColor" strokeWidth="2" />
                <rect x="20" y="20" width="8" height="8" stroke="currentColor" strokeWidth="2" />
                <path d="M20 16V20M16 20H20" stroke="currentColor" strokeWidth="2" />
            </svg>
        ),
        light: (
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="w-8 h-8 sm:w-10 sm:h-10">
                <circle cx="20" cy="20" r="6" stroke="currentColor" strokeWidth="2" />
                <path d="M20 8V12M20 28V32M32 20H28M12 20H8M28.5 11.5L25.5 14.5M14.5 25.5L11.5 28.5M28.5 28.5L25.5 25.5M14.5 14.5L11.5 11.5"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        )
    };

    return (
        <div className="flex items-center space-x-3 opacity-40 hover:opacity-80 transition-opacity duration-300 px-6 sm:px-10">
            <div className="text-white/80">
                {logos[partner.type as keyof typeof logos]}
            </div>
            <span className="text-base sm:text-lg font-semibold text-white/60 tracking-tight whitespace-nowrap">
                {partner.name}
            </span>
        </div>
    );
};

export default function PartnersMarquee() {
    return (
        <section className="relative w-full bg-[#020207] py-8 sm:py-12 border-b border-white/5 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8 text-center">
                <p className="text-xs sm:text-sm text-gray-500 font-medium tracking-widest uppercase">
                    Trusted by industry leaders
                </p>
            </div>

            <div className="relative w-full overflow-hidden mask-image-linear-gradient">
                {/* Gradient Masks */}
                <div className="absolute top-0 left-0 w-16 sm:w-32 h-full bg-gradient-to-r from-[#020207] to-transparent z-10" />
                <div className="absolute top-0 right-0 w-16 sm:w-32 h-full bg-gradient-to-l from-[#020207] to-transparent z-10" />

                {/* Marquee Track */}
                <div className="flex">
                    <motion.div
                        className="flex items-center space-x-4 sm:space-x-8 whitespace-nowrap"
                        animate={{ x: "-50%" }}
                        transition={{
                            ease: "linear",
                            duration: 40,
                            repeat: Infinity,
                        }}
                    >
                        {/* Duplicate the logos enough times to ensure seamless scrolling */}
                        {[...PARTNERS, ...PARTNERS, ...PARTNERS, ...PARTNERS, ...PARTNERS, ...PARTNERS].map((partner, idx) => (
                            <LogoComponent key={`${partner.name}-${idx}`} partner={partner} />
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
