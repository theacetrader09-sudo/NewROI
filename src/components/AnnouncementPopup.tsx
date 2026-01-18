"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface Announcement {
    id: string;
    title: string;
    description?: string;
    imageUrl: string;
}

export default function AnnouncementPopup() {
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        // Fetch active announcement - shows every time user visits dashboard
        fetch("/api/announcements")
            .then((res) => res.json())
            .then((data) => {
                if (data.announcement) {
                    setAnnouncement(data.announcement);
                    setIsVisible(true);
                }
            })
            .catch(console.error);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
    };

    if (!isVisible || !announcement) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn"
            onClick={handleClose}
        >
            {/* Popup Container */}
            <div
                className="relative max-w-[90vw] max-h-[90vh] animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute -top-3 -right-3 z-10 p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all duration-200 backdrop-blur-md group"
                >
                    <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-200" />
                </button>

                {/* Image Container */}
                <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    {/* Loading shimmer */}
                    {!imageLoaded && (
                        <div className="w-[80vw] max-w-[600px] h-[60vh] bg-gradient-to-r from-purple-900/50 via-purple-800/50 to-purple-900/50 animate-pulse flex items-center justify-center">
                            <div className="text-white/50">Loading...</div>
                        </div>
                    )}

                    {/* Main Image */}
                    <img
                        src={announcement.imageUrl}
                        alt={announcement.title}
                        className={`max-w-[80vw] max-h-[80vh] object-contain ${imageLoaded ? 'block' : 'hidden'}`}
                        onLoad={() => setImageLoaded(true)}
                    />
                </div>

                {/* Title & Description (optional overlay) */}
                {announcement.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl">
                        <h3 className="text-lg font-bold text-white">{announcement.title}</h3>
                        {announcement.description && (
                            <p className="text-sm text-white/70 mt-1">{announcement.description}</p>
                        )}
                    </div>
                )}
            </div>

            {/* Tap to close hint */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-sm">
                Tap anywhere to close
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
