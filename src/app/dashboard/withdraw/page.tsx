"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OTPInput from "@/components/OTPInput";

export default function WithdrawPage() {
    const router = useRouter();
    const [amount, setAmount] = useState("");
    const [wallet, setWallet] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [balance, setBalance] = useState(0);

    // OTP State
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [otpError, setOtpError] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0);

    const NETWORK_FEE = 0.29;
    const PLATFORM_FEE_PERCENT = 5; // 5% withdrawal fee
    const MIN_WITHDRAW = 10;

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/user/profile");
            const data = await res.json();
            if (res.ok) setBalance(Number(data.balance || 0));
        } catch (err) {
            console.error("Failed to fetch balance");
        }
    };

    const handleMax = () => {
        setAmount(balance.toFixed(2));
    };

    const getPlatformFee = () => {
        const amt = parseFloat(amount) || 0;
        return (amt * PLATFORM_FEE_PERCENT) / 100;
    };

    const getReceiveAmount = () => {
        const amt = parseFloat(amount) || 0;
        const platformFee = getPlatformFee();
        return Math.max(0, amt - platformFee - NETWORK_FEE);
    };

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        const numAmount = parseFloat(amount);
        if (numAmount < MIN_WITHDRAW) {
            setMessage({ type: "error", text: `Minimum withdrawal is $${MIN_WITHDRAW}` });
            setLoading(false);
            return;
        }

        if (numAmount > balance) {
            setMessage({ type: "error", text: "Insufficient balance" });
            setLoading(false);
            return;
        }

        if (!wallet || wallet.length < 30) {
            setMessage({ type: "error", text: "Please enter a valid wallet address" });
            setLoading(false);
            return;
        }

        try {
            // Request OTP instead of direct submission
            const res = await fetch("/api/withdraw/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: numAmount, walletAddress: wallet }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Request failed");

            // Show OTP modal
            setShowOTPModal(true);
            setMessage({ type: "success", text: "OTP sent to your email. Please check your inbox." });
        } catch (err: any) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleOTPVerify = async (otp: string) => {
        setOtpError("");
        setVerifying(true);

        try {
            const res = await fetch("/api/withdraw/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    otp,
                    amount: parseFloat(amount),
                    walletAddress: wallet
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Invalid OTP");

            // Success!
            setShowOTPModal(false);
            setMessage({ type: "success", text: data.message });
            fetchProfile();
            setAmount("");
            setWallet("");
        } catch (err: any) {
            setOtpError(err.message);
        } finally {
            setVerifying(false);
        }
    };

    const handleResendOTP = async () => {
        if (resendCooldown > 0) return;

        setOtpError("");
        try {
            const res = await fetch("/api/withdraw/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: parseFloat(amount), walletAddress: wallet }),
            });

            const data = await res.json();

            if (res.ok) {
                setResendCooldown(60); // 60 second cooldown
            } else {
                setOtpError(data.error || "Failed to resend OTP");
            }
        } catch {
            setOtpError("Failed to resend OTP");
        }
    };

    const canSubmit = !loading && parseFloat(amount) >= MIN_WITHDRAW && wallet.length >= 30 && parseFloat(amount) <= balance;

    return (
        <div
            className="relative flex min-h-screen w-full flex-col overflow-x-hidden"
            style={{ backgroundColor: '#191022' }}
        >
            {/* Header */}
            <div className="flex items-center p-4 pb-2 justify-between sticky top-0 z-10" style={{ backgroundColor: '#191022' }}>
                <button
                    onClick={() => router.back()}
                    className="flex w-12 h-12 shrink-0 items-center justify-start text-white"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h2 className="text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center">Withdraw USDT</h2>
                <div className="w-12 h-12 shrink-0" />
            </div>

            {/* Content */}
            <div className="flex flex-col p-4 space-y-6 pb-32">
                {/* Balance Display Card */}
                <div
                    className="flex items-stretch justify-between gap-4 rounded-xl p-4 backdrop-blur-sm"
                    style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 0 4px rgba(0,0,0,0.1)'
                    }}
                >
                    <div className="flex flex-col gap-1">
                        <p className="text-sm font-normal" style={{ color: '#ab9db9' }}>Available to Withdraw</p>
                        <p className="text-2xl font-bold text-white">{balance.toFixed(2)} USDT</p>
                    </div>
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #26A17B, #1A7A5C)' }}
                    >
                        <span className="text-white text-xl font-bold">₮</span>
                    </div>
                </div>

                {/* Amount Input Field */}
                <div className="flex flex-col">
                    <p className="text-white text-base font-medium pb-2">Amount</p>
                    <div className="relative w-full">
                        <input
                            type="number"
                            inputMode="decimal"
                            placeholder="0.00 USDT"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full h-14 px-4 pr-20 rounded-lg text-white text-base font-normal focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            style={{
                                background: '#211c27',
                                border: '1px solid #473b54'
                            }}
                        />
                        <button
                            type="button"
                            onClick={handleMax}
                            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 px-3 rounded-md text-sm font-medium"
                            style={{
                                background: '#302839',
                                color: '#A855F7'
                            }}
                        >
                            Max
                        </button>
                    </div>
                </div>

                {/* Wallet Address Input Field */}
                <div className="flex flex-col">
                    <p className="text-white text-base font-medium pb-2">Recipient Wallet Address</p>
                    <div className="flex w-full items-stretch rounded-lg">
                        <input
                            type="text"
                            placeholder="Paste wallet address"
                            value={wallet}
                            onChange={(e) => setWallet(e.target.value)}
                            className="flex-1 h-14 px-4 rounded-l-lg text-white text-base font-normal focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            style={{
                                background: '#211c27',
                                border: '1px solid #473b54',
                                borderRight: 'none'
                            }}
                        />
                        <div
                            className="flex items-center justify-center px-3 rounded-r-lg cursor-pointer"
                            style={{
                                background: '#211c27',
                                border: '1px solid #473b54',
                                borderLeft: 'none',
                                color: '#ab9db9'
                            }}
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Network Information */}
                <div
                    className="rounded-r-lg p-4"
                    style={{
                        background: 'rgba(127, 19, 236, 0.1)',
                        borderLeft: '4px solid #7f13ec'
                    }}
                >
                    <p className="text-white text-base font-medium">Network: Binance Smart Chain (BEP20)</p>
                    <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>
                        Please ensure you are sending only USDT on the BEP20 network. Sending other assets or using a different network may result in permanent loss of funds.
                    </p>
                </div>

                {/* Transaction Summary */}
                <div
                    className="rounded-xl p-4 space-y-3"
                    style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                >
                    <h3 className="text-white text-lg font-bold">Summary</h3>
                    <div className="flex justify-between items-center text-sm">
                        <p style={{ color: '#ab9db9' }}>Withdrawal Amount</p>
                        <p className="text-white font-medium">{parseFloat(amount || '0').toFixed(2)} USDT</p>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <p style={{ color: '#ab9db9' }}>Platform Fee (5%)</p>
                        <p className="text-red-400 font-medium">-{getPlatformFee().toFixed(2)} USDT</p>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <p style={{ color: '#ab9db9' }}>Network Fee</p>
                        <p className="text-red-400 font-medium">-{NETWORK_FEE.toFixed(2)} USDT</p>
                    </div>
                    <div className="border-t border-dashed my-2" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                    <div className="flex justify-between items-center text-base">
                        <p className="font-medium" style={{ color: '#ab9db9' }}>You Will Receive</p>
                        <p className="text-white font-bold text-lg">{getReceiveAmount().toFixed(2)} USDT</p>
                    </div>
                </div>

                {/* Message */}
                {message.text && (
                    <div
                        className={`p-3 rounded-xl text-sm ${message.type === 'success'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                            : 'bg-red-500/10 text-red-400 border border-red-500/30'
                            }`}
                    >
                        {message.text}
                    </div>
                )}
            </div>

            {/* CTA Button - Fixed Bottom with Gradient Fade */}
            <div
                className="fixed bottom-0 left-0 right-0 z-20"
                style={{
                    paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 8px))', // Above bottom nav
                    paddingTop: '24px',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    background: 'linear-gradient(to top, #191022 60%, rgba(25, 16, 34, 0.95) 80%, transparent 100%)'
                }}
            >
                <button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="flex w-full items-center justify-center rounded-2xl h-14 px-4 text-white text-base font-bold tracking-wide transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                        background: canSubmit
                            ? 'linear-gradient(135deg, #8B5CF6, #A855F7)'
                            : '#3d2d4d',
                        boxShadow: canSubmit
                            ? '0 8px 30px rgba(139, 92, 246, 0.5), 0 0 20px rgba(139, 92, 246, 0.3)'
                            : 'none'
                    }}
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                            Withdraw USDT
                        </>
                    )}
                </button>
            </div>

            {/* OTP Verification Modal */}
            {showOTPModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-gradient-to-br from-[#1a1025] to-[#0f0818] rounded-2xl border border-white/10 shadow-2xl p-8">
                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-600/20 flex items-center justify-center">
                                <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Verify Withdrawal</h2>
                            <p className="text-white/60 text-sm">
                                Enter the 6-digit code sent to your email
                            </p>
                        </div>

                        {/* OTP Input */}
                        <div className="mb-6">
                            <OTPInput
                                onComplete={handleOTPVerify}
                                loading={verifying}
                            />
                        </div>

                        {/* Error Message */}
                        {otpError && (
                            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                                {otpError}
                            </div>
                        )}

                        {/* Resend Button */}
                        <div className="text-center">
                            <p className="text-white/60 text-sm mb-2">Didn't receive the code?</p>
                            <button
                                onClick={handleResendOTP}
                                disabled={resendCooldown > 0 || verifying}
                                className="text-purple-500 hover:text-purple-400 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {resendCooldown > 0
                                    ? `Resend in ${resendCooldown}s`
                                    : 'Resend Code'
                                }
                            </button>
                        </div>

                        {/* Info */}
                        <div className="mt-6 p-3 rounded-lg bg-white/5 border border-white/10">
                            <p className="text-white/60 text-xs text-center">
                                <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                Code expires in 5 minutes. Check spam folder if not received.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
