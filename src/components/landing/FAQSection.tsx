"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function FAQSection() {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            question: "How does the ROI system work?",
            answer: "Our automated ROI distribution system calculates and distributes daily returns based on your investment package. Returns are credited automatically to your account every 24 hours.",
        },
        {
            question: "When can I withdraw my earnings?",
            answer: "Withdrawals are available to you anytime! You can request your withdrawal whenever you want through your dashboard. Simply submit a withdrawal request and our team will process it promptly.",
        },
        {
            question: "What are level commissions?",
            answer: "Level commissions are earnings you receive when users in your network earn ROI. You can earn commissions up to 10 levels deep, depending on your package tier. Each level has a specific commission rate.",
        },
        {
            question: "Is my investment safe?",
            answer: "All investments are protected with bank-level security, including military-grade encryption, multi-factor authentication, and secure wallet infrastructure. We also maintain regular security audits.",
        },
        {
            question: "Can I upgrade my package later?",
            answer: "Yes! You can upgrade your package at any time from your dashboard. The new ROI rates will apply from the next day, and you'll immediately gain access to enhanced features.",
        },
        {
            question: "What happens if I miss ROI opportunities?",
            answer: "If you don't have an active package when commissions are distributed, those earnings are recorded as 'Missed ROI' to show you what you could be earning. Once you activate a package, you'll start earning from the next day.",
        },
    ];

    return (
        <section id="faq" className="py-24 md:py-32 bg-[#020207] relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-radial from-blue-900/10 via-transparent to-transparent pointer-events-none" />

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
                        <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                            Frequently Asked Questions
                        </span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
                        Answers to the most common questions about our platform and investment strategies.
                    </p>
                </motion.div>

                {/* FAQ Accordion */}
                <div ref={ref} className="space-y-4">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index;

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className={`border rounded-xl overflow-hidden transition-all duration-300 ${isOpen
                                    ? "bg-white/[0.03] border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                                    : "bg-transparent border-white/5 hover:bg-white/[0.02] hover:border-white/10"
                                    }`}
                            >
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                    className="w-full px-6 py-5 flex items-center justify-between text-left group"
                                >
                                    <span className={`text-lg font-semibold transition-colors ${isOpen ? "text-white" : "text-gray-300 group-hover:text-white"}`}>
                                        {faq.question}
                                    </span>
                                    <div className={`p-1 rounded-full transition-colors ${isOpen ? "bg-purple-500/20 text-purple-400" : "bg-white/5 text-gray-400 group-hover:bg-white/10"}`}>
                                        <ChevronDown
                                            className={`w-5 h-5 transition-transform duration-300 ${isOpen ? "transform rotate-180" : ""
                                                }`}
                                        />
                                    </div>
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-6 text-gray-400 leading-relaxed border-t border-white/5 pt-4 mt-2 mx-6">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
