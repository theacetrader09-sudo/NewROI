"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FAQ {
    question: string;
    answer: string;
}

const faqs: FAQ[] = [
    {
        question: "How does the daily ROI work?",
        answer: "You earn 1% daily return on your active investment packages. ROI is automatically credited to your wallet every 24 hours at 6:00 AM UTC."
    },
    {
        question: "What is the minimum deposit amount?",
        answer: "The minimum deposit amount is $10 USDT. You can deposit using USDT on the BEP20 (Binance Smart Chain) network."
    },
    {
        question: "How do I withdraw my earnings?",
        answer: "Go to the Withdraw page, enter the amount and your BEP20 wallet address. Withdrawals are typically processed within 24 hours."
    },
    {
        question: "How does the referral program work?",
        answer: "Share your unique referral code with friends. When they invest, you earn commission on their daily ROI: Level 1 (10%), Level 2 (5%), Level 3 (3%), Level 4 (2%), Level 5 (1%)."
    },
    {
        question: "Is my investment safe?",
        answer: "We use industry-standard security measures to protect your account. Always use a strong password and never share your login credentials."
    },
    {
        question: "How do I contact support?",
        answer: "You can reach our support team via Telegram @MLMSupport or email support@mlmroi.com. We typically respond within 24 hours."
    },
    {
        question: "Can I have multiple accounts?",
        answer: "No, each user is allowed only one account. Multiple accounts may result in suspension and loss of funds."
    },
    {
        question: "What happens if my deposit is pending?",
        answer: "If your deposit shows as pending, it's awaiting admin verification. This usually takes 1-24 hours. Contact support if it takes longer."
    }
];

export default function HelpPage() {
    const router = useRouter();
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <div
            className="relative flex min-h-screen w-full flex-col overflow-x-hidden"
            style={{ backgroundColor: '#191022' }}
        >
            {/* Header */}
            <div className="flex items-center p-4 sticky top-0 z-10" style={{ backgroundColor: '#191022' }}>
                <button
                    onClick={() => router.back()}
                    className="flex w-10 h-10 shrink-0 items-center justify-center rounded-full text-white"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h2 className="text-lg font-bold leading-tight flex-1 text-center text-white">Support / Help</h2>
                <div className="w-10 h-10 shrink-0" />
            </div>

            {/* Content */}
            <div className="flex flex-col p-4 space-y-6 pb-32">
                {/* Header Section */}
                <div className="text-center py-4">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.3))' }}
                    >
                        <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-white font-bold text-xl">Frequently Asked Questions</h3>
                    <p className="text-[#ab9db9] text-sm mt-1">Find answers to common questions</p>
                </div>

                {/* FAQ List */}
                <div className="space-y-3">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="rounded-2xl overflow-hidden border border-white/5 transition-all"
                            style={{ backgroundColor: '#211c27' }}
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full flex items-center justify-between p-4 text-left"
                            >
                                <span className="text-white font-medium pr-4">{faq.question}</span>
                                <svg
                                    className={`w-5 h-5 text-purple-400 transition-transform ${expandedIndex === index ? 'rotate-180' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-300 ${expandedIndex === index ? 'max-h-48' : 'max-h-0'
                                    }`}
                            >
                                <div className="px-4 pb-4 pt-0">
                                    <p className="text-[#ab9db9] text-sm leading-relaxed">{faq.answer}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact Support */}
                <div
                    className="rounded-2xl p-5 border border-white/5 mt-4"
                    style={{ backgroundColor: '#211c27' }}
                >
                    <h4 className="text-white font-bold mb-3">Still need help?</h4>
                    <p className="text-[#ab9db9] text-sm mb-4">Our support team is here to assist you.</p>

                    <div className="space-y-3">
                        <a
                            href="https://t.me/MLMSupport"
                            target="_blank"
                            className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-white font-medium text-sm">Telegram Support</p>
                                <p className="text-blue-400 text-xs">@MLMSupport</p>
                            </div>
                        </a>

                        <a
                            href="mailto:support@mlmroi.com"
                            className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-white font-medium text-sm">Email Support</p>
                                <p className="text-purple-400 text-xs">support@mlmroi.com</p>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
