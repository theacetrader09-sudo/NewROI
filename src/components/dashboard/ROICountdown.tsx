"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export default function ROICountdown() {
    const [timeLeft, setTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            // Assume ROI is credited at 00:00 (Midnight) server time
            const nextROI = new Date();
            nextROI.setHours(24, 0, 0, 0);

            const diff = nextROI.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            } else {
                setTimeLeft({
                    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((diff / 1000 / 60) % 60),
                    seconds: Math.floor((diff / 1000) % 60),
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const format = (num: number) => num.toString().padStart(2, '0');

    return (
        <div className="glass" style={{
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            background: 'linear-gradient(90deg, var(--glass-bg), rgba(59, 130, 246, 0.05))',
            borderLeft: '4px solid var(--accent-blue)'
        }}>
            <div style={{
                background: 'var(--accent-blue)',
                padding: '12px',
                borderRadius: '12px',
                color: 'white'
            }}>
                <Clock size={24} />
            </div>
            <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px', fontWeight: '500' }}>
                    NEXT ROI DISTRIBUTION IN:
                </p>
                <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    letterSpacing: '2px',
                    fontFamily: 'monospace'
                }}>
                    {format(timeLeft.hours)}h : {format(timeLeft.minutes)}m : {format(timeLeft.seconds)}s
                </div>
            </div>
        </div>
    );
}
