"use client";

import { useState, useRef, useEffect } from "react";

interface OTPInputProps {
    length?: number;
    onComplete: (otp: string) => void;
    loading?: boolean;
}

export default function OTPInput({ length = 6, onComplete, loading = false }: OTPInputProps) {
    const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Focus first input on mount
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (value: string, index: number) => {
        if (!/^\d*$/.test(value)) return; // Only allow digits

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Only take last digit
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when complete
        if (newOtp.every(digit => digit !== "") && index === length - 1) {
            onComplete(newOtp.join(""));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === "Backspace") {
            if (!otp[index] && index > 0) {
                // Focus previous input if current is empty
                inputRefs.current[index - 1]?.focus();
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === "ArrowRight" && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData("text").slice(0, length);
        if (!/^\d+$/.test(pasteData)) return;

        const newOtp = [...otp];
        pasteData.split("").forEach((char, i) => {
            if (i < length) newOtp[i] = char;
        });
        setOtp(newOtp);

        // Focus last filled input
        const lastIndex = Math.min(pasteData.length, length) - 1;
        inputRefs.current[lastIndex]?.focus();

        // Auto-submit if complete
        if (newOtp.every(digit => digit !== "")) {
            onComplete(newOtp.join(""));
        }
    };

    return (
        <div className="flex gap-3 justify-center">
            {otp.map((digit, index) => (
                <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(e.target.value, index)}
                    onKeyDown={e => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    disabled={loading}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                        borderColor: digit ? '#667eea' : '#e5e5ea',
                        backgroundColor: loading ? '#f5f5f7' : 'white',
                        color: '#1d1d1f'
                    }}
                />
            ))}
        </div>
    );
}
