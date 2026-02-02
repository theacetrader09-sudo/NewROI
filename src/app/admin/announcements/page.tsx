"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Upload,
    Image as ImageIcon,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Plus,
    ArrowLeft,
    CheckCircle,
    XCircle,
    Loader2
} from "lucide-react";

interface Announcement {
    id: string;
    title: string;
    description?: string;
    imageUrl: string;
    isActive: boolean;
    startDate?: string;
    endDate?: string;
    createdAt: string;
}

export default function AdminAnnouncementsPage() {
    const router = useRouter();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [previewUrl, setPreviewUrl] = useState("");

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch("/api/admin/announcements");
            const data = await res.json();
            setAnnouncements(data.announcements || []);
        } catch (error) {
            console.error("Failed to fetch announcements:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to Cloudinary
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (data.success) {
                setImageUrl(data.url);
            } else {
                alert("Upload failed: " + data.error);
            }
        } catch (error) {
            alert("Upload failed");
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const handleCreate = async () => {
        if (!title || !imageUrl) {
            alert("Title and image are required");
            return;
        }

        try {
            const res = await fetch("/api/announcements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description, imageUrl }),
            });

            const data = await res.json();
            if (data.success) {
                setShowCreateForm(false);
                setTitle("");
                setDescription("");
                setImageUrl("");
                setPreviewUrl("");
                fetchAnnouncements();
            } else {
                alert("Failed to create: " + data.error);
            }
        } catch (error) {
            alert("Failed to create announcement");
            console.error(error);
        }
    };

    const toggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await fetch(`/api/announcements/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !currentStatus }),
            });
            fetchAnnouncements();
        } catch (error) {
            console.error("Failed to toggle:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this announcement?")) return;

        try {
            await fetch(`/api/announcements/${id}`, { method: "DELETE" });
            fetchAnnouncements();
        } catch (error) {
            console.error("Failed to delete:", error);
        }
    };

    return (
        <div className="responsive-padding" style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
            {/* Header */}
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 16px)', marginBottom: 'clamp(20px, 4vw, 32px)', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => router.back()}
                        className="card"
                        style={{ padding: '8px', border: 'none', background: 'var(--glass-bg)', cursor: 'pointer' }}
                    >
                        <ArrowLeft style={{ width: '20px', height: '20px' }} />
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: '800', margin: 0 }}>Announcements</h1>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'clamp(0.75rem, 2vw, 0.9rem)', margin: 0 }}>Manage popup announcements for users</p>
                    </div>
                </div>

                {/* Create Button */}
                {!showCreateForm && (
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="btn btn-primary"
                        style={{ marginBottom: 'clamp(16px, 3vw, 24px)', display: 'flex', alignItems: 'center', gap: '8px', padding: 'clamp(10px, 2vw, 14px) clamp(16px, 3vw, 24px)', width: '100%' }}
                    >
                        <Plus style={{ width: '20px', height: '20px', flexShrink: 0 }} />
                        <span>Create New Announcement</span>
                    </button>
                )}

                {/* Create Form */}
                {showCreateForm && (
                    <div className="glass" style={{ marginBottom: 'clamp(20px, 4vw, 32px)', padding: 'clamp(16px, 4vw, 24px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h2 style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: '700', marginBottom: 'clamp(12px, 3vw, 16px)' }}>New Announcement</h2>

                        <div className="space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm text-white/70 mb-2">Title *</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., 🎉 Special Offer!"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm text-white/70 mb-2">Description (optional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Brief description..."
                                    rows={2}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 resize-none"
                                />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm text-white/70 mb-2">Poster Image *</label>

                                {!previewUrl ? (
                                    <label
                                        className={`w-full h-48 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-purple-500 hover:bg-purple-500/5 transition-colors cursor-pointer ${uploading ? 'pointer-events-none' : ''}`}
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            disabled={uploading}
                                        />
                                        {uploading ? (
                                            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                                        ) : (
                                            <>
                                                <Upload className="w-8 h-8 text-white/40" />
                                                <span className="text-white/40">Click to upload image</span>
                                            </>
                                        )}
                                    </label>
                                ) : (
                                    <div className="relative">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-full max-h-64 object-contain rounded-xl border border-white/10"
                                        />
                                        {uploading && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                                                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                                            </div>
                                        )}
                                        {imageUrl && (
                                            <div className="absolute top-2 right-2 p-2 bg-green-500 rounded-full">
                                                <CheckCircle className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                        <button
                                            onClick={() => {
                                                setPreviewUrl("");
                                                setImageUrl("");
                                            }}
                                            className="absolute top-2 left-2 p-2 bg-red-500/80 hover:bg-red-500 rounded-full transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleCreate}
                                    disabled={!title || !imageUrl || uploading}
                                    className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors"
                                >
                                    Create Announcement
                                </button>
                                <button
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        setTitle("");
                                        setDescription("");
                                        setImageUrl("");
                                        setPreviewUrl("");
                                    }}
                                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Announcements List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="text-center py-20 text-white/40">
                        <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No announcements yet</p>
                        <p className="text-sm">Create one to show popups to users</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {announcements.map((ann) => (
                            <div
                                key={ann.id}
                                style={{
                                    padding: 'clamp(12px, 3vw, 16px)',
                                    borderRadius: '16px',
                                    border: `1px solid ${ann.isActive ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255,255,255,0.1)'}`,
                                    background: ann.isActive ? 'rgba(168, 85, 247, 0.05)' : 'rgba(255,255,255,0.02)'
                                }}
                                className="card"
                            >
                                <div style={{ display: 'flex', gap: 'clamp(12px, 3vw, 16px)', flexWrap: 'wrap' }}>
                                    {/* Thumbnail */}
                                    <img
                                        src={ann.imageUrl}
                                        alt={ann.title}
                                        style={{ width: 'clamp(60px, 15vw, 100px)', height: 'clamp(60px, 15vw, 100px)', objectFit: 'cover', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}
                                    />

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <h3 style={{ fontWeight: '700', fontSize: 'clamp(0.9rem, 2.5vw, 1rem)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ann.title}</h3>
                                                {ann.description && (
                                                    <p style={{ fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', color: 'rgba(255,255,255,0.6)', margin: '4px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ann.description}</p>
                                                )}
                                            </div>
                                            <div style={{
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                fontSize: 'clamp(0.7rem, 1.5vw, 0.75rem)',
                                                fontWeight: '600',
                                                background: ann.isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)',
                                                color: ann.isActive ? '#10b981' : 'rgba(255,255,255,0.4)',
                                                flexShrink: 0
                                            }}>
                                                {ann.isActive ? "Active" : "Inactive"}
                                            </div>
                                        </div>
                                        <p style={{ fontSize: 'clamp(0.7rem, 1.5vw, 0.75rem)', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                                            Created: {new Date(ann.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => toggleActive(ann.id, ann.isActive)}
                                            style={{
                                                padding: '10px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                background: ann.isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)',
                                                color: ann.isActive ? '#10b981' : 'rgba(255,255,255,0.6)',
                                                cursor: 'pointer',
                                                flexShrink: 0
                                            }}
                                            title={ann.isActive ? "Deactivate" : "Activate"}
                                        >
                                            {ann.isActive ? (
                                                <ToggleRight style={{ width: '20px', height: '20px' }} />
                                            ) : (
                                                <ToggleLeft style={{ width: '20px', height: '20px' }} />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(ann.id)}
                                            style={{
                                                padding: '10px',
                                                background: 'rgba(239, 68, 68, 0.2)',
                                                color: '#ef4444',
                                                borderRadius: '8px',
                                                border: 'none',
                                                cursor: 'pointer',
                                                flexShrink: 0
                                            }}
                                            title="Delete"
                                        >
                                            <Trash2 style={{ width: '20px', height: '20px' }} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
