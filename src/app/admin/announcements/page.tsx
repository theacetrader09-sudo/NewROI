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
        <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
            {/* Header */}
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Announcements</h1>
                        <p className="text-white/60 text-sm">Manage popup announcements for users</p>
                    </div>
                </div>

                {/* Create Button */}
                {!showCreateForm && (
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="mb-6 flex items-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-medium transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Create New Announcement
                    </button>
                )}

                {/* Create Form */}
                {showCreateForm && (
                    <div className="mb-8 p-6 bg-white/5 border border-white/10 rounded-2xl">
                        <h2 className="text-lg font-semibold mb-4">New Announcement</h2>

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
                                className={`p-4 rounded-2xl border transition-colors ${ann.isActive
                                    ? "bg-white/5 border-purple-500/30"
                                    : "bg-white/[0.02] border-white/10"
                                    }`}
                            >
                                <div className="flex gap-4">
                                    {/* Thumbnail */}
                                    <img
                                        src={ann.imageUrl}
                                        alt={ann.title}
                                        className="w-24 h-24 object-cover rounded-xl border border-white/10"
                                    />

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="font-semibold truncate">{ann.title}</h3>
                                                {ann.description && (
                                                    <p className="text-sm text-white/60 truncate">{ann.description}</p>
                                                )}
                                            </div>
                                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${ann.isActive
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-white/10 text-white/40"
                                                }`}>
                                                {ann.isActive ? "Active" : "Inactive"}
                                            </div>
                                        </div>
                                        <p className="text-xs text-white/40 mt-2">
                                            Created: {new Date(ann.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => toggleActive(ann.id, ann.isActive)}
                                            className={`p-2 rounded-lg transition-colors ${ann.isActive
                                                ? "bg-green-500/20 hover:bg-green-500/30 text-green-400"
                                                : "bg-white/10 hover:bg-white/20 text-white/60"
                                                }`}
                                            title={ann.isActive ? "Deactivate" : "Activate"}
                                        >
                                            {ann.isActive ? (
                                                <ToggleRight className="w-5 h-5" />
                                            ) : (
                                                <ToggleLeft className="w-5 h-5" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(ann.id)}
                                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-5 h-5" />
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
