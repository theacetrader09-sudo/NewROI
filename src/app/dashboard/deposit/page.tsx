"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DepositPage() {
    const router = useRouter();
    const [depositMode, setDepositMode] = useState<'wallet' | 'package'>('package');
    const [paymentMethod, setPaymentMethod] = useState<'usdt' | 'wallet_balance'>('usdt');
    const [amount, setAmount] = useState("500");
    const [txid, setTxid] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [copied, setCopied] = useState(false);
    const [balance, setBalance] = useState(0);
    const [adminWallet, setAdminWallet] = useState("0x15C1eC04D1Db26ff82d66b0654790335292BdB66"); // Default fallback

    const PROCESSING_FEE = paymentMethod === 'wallet_balance' ? 0 : 1.00;

    useEffect(() => {
        fetchBalance();
        fetchAdminWallet();
    }, []);

    const fetchBalance = async () => {
        try {
            const res = await fetch("/api/user/profile");
            const data = await res.json();
            if (res.ok) {
                setBalance(Number(data.balance || 0));
            }
        } catch (err) {
            console.error("Failed to fetch balance");
        }
    };

    const fetchAdminWallet = async () => {
        try {
            const res = await fetch("/api/settings/public");
            const data = await res.json();
            if (res.ok && data.adminWallet) {
                setAdminWallet(data.adminWallet);
            }
        } catch (err) {
            console.error("Failed to fetch admin wallet, using default");
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(adminWallet);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        // Validate amount
        const numAmount = Number(amount);
        if (numAmount < 2) {
            setMessage({ type: "error", text: "Minimum deposit is $2" });
            setLoading(false);
            return;
        }

        // Validate wallet balance if using wallet payment
        if (paymentMethod === 'wallet_balance' && numAmount > balance) {
            setMessage({ type: "error", text: "Insufficient wallet balance" });
            setLoading(false);
            return;
        }

        // Validate TXID if using USDT
        if (paymentMethod === 'usdt' && !txid) {
            setMessage({ type: "error", text: "Transaction ID is required" });
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/invest/deposit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount,
                    txid: paymentMethod === 'usdt' ? txid : null,
                    depositMode,
                    paymentMethod
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Submission failed");

            setMessage({ type: "success", text: data.message });
            setAmount("");
            setTxid("");
            // Refresh balance after successful wallet-based transaction
            if (paymentMethod === 'wallet_balance') {
                fetchBalance();
            }
        } catch (err: any) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const quickAmounts = ["100", "500", "1000", "5000"];
    const isWalletPayment = paymentMethod === 'wallet_balance';
    const canSubmit = loading || !amount || (paymentMethod === 'usdt' && !txid) || (isWalletPayment && Number(amount) > balance);

    // Calculate step numbers dynamically
    const getStepNumber = (step: 'package' | 'amount' | 'method' | 'address' | 'txid') => {
        let num = 0;
        if (depositMode === 'package' && step !== 'package') num++;
        if (step === 'amount') return num + 1;
        if (step === 'method') return num + 2;
        if (step === 'address') return num + 3;
        if (step === 'txid') return num + 4;
        return 1;
    };

    return (
        <div
            className="font-display antialiased flex flex-col w-full min-h-screen relative"
            style={{
                backgroundColor: '#0f0716',
                backgroundImage: `
                    radial-gradient(at 0% 0%, rgba(88, 28, 135, 0.3) 0px, transparent 50%),
                    radial-gradient(at 100% 0%, rgba(127, 19, 236, 0.2) 0px, transparent 50%),
                    radial-gradient(at 100% 100%, rgba(192, 38, 211, 0.1) 0px, transparent 50%)
                `,
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Header */}
            <div className="flex-none flex items-center px-6 pt-12 pb-2 justify-between z-20">
                <button
                    onClick={() => router.back()}
                    className="flex w-10 h-10 shrink-0 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                >
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h2 className="text-white text-lg font-bold tracking-tight">Deposit Funds</h2>
                <Link
                    href="/dashboard/transactions"
                    className="flex w-10 h-10 shrink-0 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/5 text-white/70"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </Link>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pb-32">
                <div className="px-6 flex flex-col gap-5 pt-2">

                    {/* Balance Card */}
                    <div
                        className="rounded-2xl p-4 relative overflow-hidden group"
                        style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.08)'
                        }}
                    >
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-600/30 rounded-full blur-2xl group-hover:bg-purple-600/40 transition-colors duration-500" />
                        <div className="relative z-10 flex justify-between items-end">
                            <div>
                                <p className="text-white/60 text-xs font-medium mb-1">Wallet Balance</p>
                                <h1 className="text-white text-3xl font-bold tracking-tight">${balance.toFixed(2)}</h1>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-emerald-400 text-xs font-medium flex items-center bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                                    <svg className="w-3.5 h-3.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    Available
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Toggle Switch - Deposit Mode */}
                    <div className="relative w-full h-12 bg-white/5 rounded-xl p-1 flex items-center border border-white/10">
                        <div
                            className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg transition-transform duration-300"
                            style={{
                                background: '#7f13ec',
                                boxShadow: '0 0 10px rgba(127, 19, 236, 0.3)',
                                transform: depositMode === 'wallet' ? 'translateX(4px)' : 'translateX(calc(100% + 4px))'
                            }}
                        />
                        <button
                            onClick={() => setDepositMode('wallet')}
                            className={`flex-1 h-full flex items-center justify-center text-xs font-bold uppercase tracking-wide z-10 transition-colors ${depositMode === 'wallet' ? 'text-white' : 'text-white/60 hover:text-white/80'}`}
                        >
                            Deposit to Wallet
                        </button>
                        <button
                            onClick={() => setDepositMode('package')}
                            className={`flex-1 h-full flex items-center justify-center text-xs font-bold uppercase tracking-wide z-10 transition-colors ${depositMode === 'package' ? 'text-white' : 'text-white/60 hover:text-white/80'}`}
                        >
                            Activate Package
                        </button>
                    </div>

                    {/* Package Section - Only show for package mode */}
                    {depositMode === 'package' && (
                        <div>
                            <h3 className="text-white text-xs font-semibold mb-2 flex items-center gap-2 opacity-80 uppercase tracking-wide">
                                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-purple-600 text-[9px] font-bold">1</span>
                                Package
                            </h3>
                            <div
                                className="rounded-xl p-4 relative border border-white/10"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                                    backdropFilter: 'blur(20px)',
                                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), 0 0 10px rgba(127, 19, 236, 0.3)'
                                }}
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <div>
                                        <div className="text-fuchsia-400 text-[10px] font-bold tracking-widest uppercase mb-0.5">Active Plan</div>
                                        <h4 className="text-lg font-bold text-white">Premium Growth</h4>
                                    </div>
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                                        style={{
                                            background: 'linear-gradient(135deg, #7f13ec, #d946ef)',
                                            boxShadow: '0 4px 15px rgba(127, 19, 236, 0.4)'
                                        }}
                                    >
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-xs border-t border-white/10 pt-3">
                                    <div>
                                        <span className="text-white/50 block mb-0.5">ROI</span>
                                        <span className="text-white font-bold text-sm">1%</span>
                                    </div>
                                    <div className="w-px h-6 bg-white/10" />
                                    <div>
                                        <span className="text-white/50 block mb-0.5">Duration</span>
                                        <span className="text-white font-bold text-sm">Daily</span>
                                    </div>
                                    <div className="ml-auto text-right">
                                        <span className="text-white/50 block mb-0.5">Min Deposit</span>
                                        <span className="text-white font-bold text-sm">$2</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Amount Section */}
                    <div>
                        <h3 className="text-white text-xs font-semibold mb-2 flex items-center gap-2 opacity-80 uppercase tracking-wide">
                            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-purple-600 text-[9px] font-bold">
                                {depositMode === 'package' ? '2' : '1'}
                            </span>
                            Amount
                        </h3>
                        <div className="space-y-3">
                            <div className="relative group">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/50 text-lg transition-colors group-focus-within:text-purple-500">$</span>
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className={`w-full h-12 pl-9 pr-16 bg-[#1a1025] border rounded-xl text-white text-lg font-bold placeholder:text-white/20 focus:ring-1 transition-all shadow-inner outline-none ${amount && Number(amount) > 0 && Number(amount) < 2
                                        ? 'border-red-500/50 focus:ring-red-500 focus:border-red-500'
                                        : 'border-white/10 focus:ring-purple-500 focus:border-purple-500'
                                        }`}
                                />
                                <button
                                    onClick={() => setAmount(balance.toString())}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-purple-500 hover:text-white bg-purple-500/10 hover:bg-purple-500 px-3 py-1.5 rounded-lg transition-all uppercase"
                                >
                                    Max
                                </button>
                            </div>

                            {/* Real-time validation warning */}
                            {amount && Number(amount) > 0 && Number(amount) < 2 && (
                                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 animate-pulse">
                                    <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <div className="flex-1">
                                        <p className="text-red-400 text-sm font-semibold">Minimum Deposit: $2</p>
                                        <p className="text-red-400/80 text-xs mt-0.5">Please enter at least $2 to proceed with your deposit.</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {quickAmounts.map((amt) => (
                                    <button
                                        key={amt}
                                        onClick={() => setAmount(amt)}
                                        className={`flex-none px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${amount === amt
                                            ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                                            : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border-white/5'
                                            }`}
                                    >
                                        ${parseInt(amt).toLocaleString()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Payment Method Section */}
                    <div>
                        <h3 className="text-white text-xs font-semibold mb-2 flex items-center gap-2 opacity-80 uppercase tracking-wide">
                            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-purple-600 text-[9px] font-bold">
                                {depositMode === 'package' ? '3' : '2'}
                            </span>
                            Payment Method
                        </h3>
                        <div className="space-y-2">
                            {/* USDT Option */}
                            <button
                                onClick={() => setPaymentMethod('usdt')}
                                className={`w-full flex items-center justify-between p-3 rounded-xl border relative overflow-hidden transition-all ${paymentMethod === 'usdt'
                                    ? 'border-purple-500/50 bg-gradient-to-r from-purple-500/10 to-transparent'
                                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-9 h-9 rounded-full bg-[#26A17B] flex items-center justify-center text-white font-bold shadow-lg">
                                        <span className="text-sm font-bold">₮</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-white text-sm">Tether USDT</p>
                                        <p className="text-[10px] text-white/60">BEP20 Network • External</p>
                                    </div>
                                </div>
                                {paymentMethod === 'usdt' && (
                                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-600 text-white" style={{ boxShadow: '0 0 10px rgba(127, 19, 236, 0.3)' }}>
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </button>

                            {/* Wallet Balance Option - Only show for package mode */}
                            {depositMode === 'package' && (
                                <button
                                    onClick={() => setPaymentMethod('wallet_balance')}
                                    disabled={balance < 2}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl border relative overflow-hidden transition-all ${paymentMethod === 'wallet_balance'
                                        ? 'border-purple-500/50 bg-gradient-to-r from-purple-500/10 to-transparent'
                                        : balance < 2
                                            ? 'border-white/5 bg-white/5 opacity-50 cursor-not-allowed'
                                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-white text-sm">Wallet Balance</p>
                                            <p className="text-[10px] text-white/60">
                                                Available: ${balance.toFixed(2)} {balance < 2 && '• Min $2 required'}
                                            </p>
                                        </div>
                                    </div>
                                    {paymentMethod === 'wallet_balance' && (
                                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-600 text-white" style={{ boxShadow: '0 0 10px rgba(127, 19, 236, 0.3)' }}>
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Wallet Address - Only show for USDT payment */}
                    {paymentMethod === 'usdt' && (
                        <div>
                            <h3 className="text-white text-xs font-semibold mb-2 flex items-center gap-2 opacity-80 uppercase tracking-wide">
                                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-purple-600 text-[9px] font-bold">
                                    {depositMode === 'package' ? '4' : '3'}
                                </span>
                                Payment Address
                            </h3>
                            <div
                                className="rounded-xl p-4 border border-white/10"
                                style={{ background: 'rgba(255, 255, 255, 0.03)' }}
                            >
                                <p className="text-white/50 text-xs mb-2">Send USDT (BEP20) to:</p>
                                <div className="flex items-center gap-2">
                                    <code className="text-xs text-white/80 break-all flex-1">{adminWallet}</code>
                                    <button
                                        onClick={handleCopy}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${copied
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                                            }`}
                                    >
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TXID Input - Only show for USDT payment */}
                    {paymentMethod === 'usdt' && (
                        <div>
                            <h3 className="text-white text-xs font-semibold mb-2 flex items-center gap-2 opacity-80 uppercase tracking-wide">
                                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-purple-600 text-[9px] font-bold">
                                    {depositMode === 'package' ? '5' : '4'}
                                </span>
                                Transaction ID
                            </h3>
                            <input
                                type="text"
                                placeholder="Paste your TXID here"
                                value={txid}
                                onChange={(e) => setTxid(e.target.value)}
                                className="w-full h-12 px-4 bg-[#1a1025] border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                            />
                        </div>
                    )}

                    {/* Wallet Balance Warning */}
                    {paymentMethod === 'wallet_balance' && Number(amount) > balance && (
                        <div className="p-3 rounded-xl text-sm bg-red-500/10 text-red-400 border border-red-500/30">
                            ⚠️ Insufficient balance. You need ${(Number(amount) - balance).toFixed(2)} more.
                        </div>
                    )}

                    {/* Message */}
                    {message.text && (
                        <div className={`p-3 rounded-xl text-sm ${message.type === 'success'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                            : 'bg-red-500/10 text-red-400 border border-red-500/30'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    {/* Submit Section */}
                    <div className="pt-2 pb-6">
                        {!isWalletPayment && (
                            <div className="flex justify-between items-center text-xs mb-3 px-1">
                                <span className="text-white/50">Processing Fee: <span className="text-white">${PROCESSING_FEE.toFixed(2)}</span></span>
                                <span className="text-white/50">Total Payment: <span className="text-fuchsia-400 font-bold">${(Number(amount || 0) + PROCESSING_FEE).toFixed(2)}</span></span>
                            </div>
                        )}
                        {isWalletPayment && (
                            <div className="flex justify-between items-center text-xs mb-3 px-1">
                                <span className="text-white/50">From Wallet: <span className="text-white">${Number(amount || 0).toFixed(2)}</span></span>
                                <span className="text-white/50">After: <span className="text-fuchsia-400 font-bold">${(balance - Number(amount || 0)).toFixed(2)}</span></span>
                            </div>
                        )}
                        <button
                            onClick={handleSubmit}
                            disabled={canSubmit}
                            className="w-full h-12 rounded-xl text-white text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
                            style={{
                                background: 'linear-gradient(to right, #7f13ec, #d946ef)',
                                boxShadow: '0 0 20px rgba(127, 19, 236, 0.5)'
                            }}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <span>{isWalletPayment ? 'Activate from Wallet' : 'Confirm Deposit'}</span>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </>
                            )}
                        </button>
                        <div className="flex items-center justify-center gap-1.5 mt-3 opacity-40">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span className="text-[9px] uppercase tracking-wider font-semibold text-white">
                                {isWalletPayment ? 'Instant Activation' : 'Secure SSL Encrypted'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom navigation is handled by layout.tsx */}
        </div>
    );
}
