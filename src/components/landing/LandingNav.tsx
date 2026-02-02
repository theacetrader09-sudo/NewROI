"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export default function LandingNav() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        setIsMenuOpen(false);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <motion.nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || isMenuOpen
                ? "bg-[#020207]/80 backdrop-blur-xl border-b border-white/5"
                : "bg-transparent"
                }`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center z-50">
                        <span className="text-white font-bold text-xl tracking-tight">NovaQuant</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {["Features", "Solutions", "Resources"].map((item) => (
                            <button
                                key={item}
                                onClick={() => scrollToSection(item.toLowerCase())}
                                className="text-white/70 hover:text-white transition-colors text-sm font-medium"
                            >
                                {item}
                            </button>
                        ))}
                    </div>

                    {/* Right Actions (Desktop) */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link href="/login" className="text-white text-sm font-medium hover:opacity-80 transition-opacity">
                            Login
                        </Link>
                        <Link
                            href="/register"
                            className="px-5 py-2.5 bg-[#4448B8] border border-[#B4B7FF]/50 text-white rounded-lg text-sm font-medium hover:bg-[#3b3ea3] transition-all shadow-[inset_0px_-4px_10px_rgba(202,205,255,0.2)]"
                        >
                            Sign Up
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="flex md:hidden items-center space-x-4">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-white p-2 focus:outline-none z-50"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "100vh" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="fixed inset-0 top-0 bg-[#020207] z-40 flex flex-col pt-24 px-6 md:hidden overflow-y-auto"
                    >
                        <div className="flex flex-col space-y-6">
                            {["Features", "Solutions", "Resources"].map((item) => (
                                <button
                                    key={item}
                                    onClick={() => scrollToSection(item.toLowerCase())}
                                    className="text-left text-white/90 hover:text-white text-2xl font-medium border-b border-white/5 pb-4"
                                >
                                    {item}
                                </button>
                            ))}

                            <div className="pt-8 flex flex-col space-y-4">
                                <Link
                                    href="/register"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="w-full py-4 bg-[#4448B8] text-white rounded-xl text-center font-medium text-lg shadow-lg shadow-blue-900/20"
                                >
                                    Start Your AI Journey
                                </Link>
                                <Link
                                    href="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-xl font-medium text-lg text-center"
                                >
                                    Login
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
