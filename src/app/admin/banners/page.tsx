/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { Trash2, Plus, Eye, EyeOff, GripVertical, Loader2, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "sonner";

interface Banner {
    id: string;
    title: string;
    subtitle: string | null;
    ctaText: string | null;
    ctaUrl: string | null;
    imageUrl: string;
    bgColor: string | null;
    active: boolean;
    sortOrder: number;
}

type BannerForm = Omit<Banner, "id" | "sortOrder">;

const EMPTY: BannerForm = {
    title: "",
    subtitle: "",
    ctaText: "",
    ctaUrl: "",
    imageUrl: "",
    bgColor: "#f0f4ff",
    active: true,
};

export default function AdminBannersPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [creating, setCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<BannerForm>({ ...EMPTY });
    const [saving, setSaving] = useState(false);
    const [seeding, setSeeding] = useState(false);

    async function load() {
        const res = await fetch("/api/admin/banners");
        if (res.ok) setBanners(await res.json());
    }

    async function seedDefaults() {
        setSeeding(true);
        try {
            const res = await fetch("/api/admin/banners", { method: "POST" });
            if (res.ok) {
                toast.success("Default banners created! You can now edit them.");
                await load();
            }
        } finally {
            setSeeding(false);
        }
    }

    useEffect(() => { load(); }, []);

    function startEdit(banner: Banner) {
        setEditingId(banner.id);
        setCreating(false);
        setForm({
            title: banner.title,
            subtitle: banner.subtitle || "",
            ctaText: banner.ctaText || "",
            ctaUrl: banner.ctaUrl || "",
            imageUrl: banner.imageUrl,
            bgColor: banner.bgColor || "#f0f4ff",
            active: banner.active,
        });
    }

    function cancelEdit() {
        setEditingId(null);
        setCreating(false);
        setForm({ ...EMPTY });
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/banners", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, sortOrder: banners.length }),
            });
            if (res.ok) {
                toast.success("Banner created");
                cancelEdit();
                await load();
            }
        } finally {
            setSaving(false);
        }
    }

    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault();
        if (!editingId) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/banners/${editingId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                toast.success("Banner updated");
                cancelEdit();
                await load();
            }
        } finally {
            setSaving(false);
        }
    }

    async function handleToggle(banner: Banner) {
        await fetch(`/api/banners/${banner.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ active: !banner.active }),
        });
        toast.success(banner.active ? "Banner hidden" : "Banner is now live");
        await load();
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this banner?")) return;
        await fetch(`/api/banners/${id}`, { method: "DELETE" });
        toast.success("Banner deleted");
        if (editingId === id) cancelEdit();
        await load();
    }

    const isFormOpen = creating || editingId !== null;

    function renderForm() {
        return (
            <form onSubmit={editingId ? handleUpdate : handleCreate} className="border border-border rounded-2xl p-6 bg-card space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-lg">{editingId ? "Edit Banner" : "New Banner"}</h2>
                    <button type="button" onClick={cancelEdit} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                        <X className="h-4 w-4 text-slate-400" />
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Title *</label>
                        <Input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Big discounts — Up to 85% Off" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Subtitle</label>
                        <Input value={form.subtitle || ""} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="Protein, energy drinks & more" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Button Text</label>
                        <Input value={form.ctaText || ""} onChange={(e) => setForm((f) => ({ ...f, ctaText: e.target.value }))} placeholder="Shop Now" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Button URL</label>
                        <Input value={form.ctaUrl || ""} onChange={(e) => setForm((f) => ({ ...f, ctaUrl: e.target.value }))} placeholder="/products?category=health" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Background Colour</label>
                        <div className="flex items-center gap-2">
                            <input type="color" value={form.bgColor || "#f0f4ff"} onChange={(e) => setForm((f) => ({ ...f, bgColor: e.target.value }))} className="h-10 w-14 rounded-lg border border-border cursor-pointer" />
                            <Input value={form.bgColor || ""} onChange={(e) => setForm((f) => ({ ...f, bgColor: e.target.value }))} className="font-mono" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Banner Image *</label>
                        <ImageUpload
                            value={form.imageUrl || undefined}
                            onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
                            onRemove={() => setForm((f) => ({ ...f, imageUrl: "" }))}
                            folder="banners"
                            aspectRatio="banner"
                            label="Upload Banner Image"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                    <Button type="submit" disabled={saving || !form.imageUrl}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {editingId ? "Update Banner" : "Save Banner"}
                    </Button>
                    <Button type="button" variant="ghost" onClick={cancelEdit}>Cancel</Button>
                </div>
            </form>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Hero Banners</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {banners.length} banner{banners.length !== 1 ? "s" : ""} — shown in the homepage hero carousel.
                    </p>
                </div>
                {!isFormOpen && (
                    <Button onClick={() => { setCreating(true); setEditingId(null); setForm({ ...EMPTY }); }} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Add Banner
                    </Button>
                )}
            </div>

            {/* Create / Edit form */}
            {isFormOpen && renderForm()}

            {/* Banner list */}
            <div className="space-y-3">
                {banners.length === 0 && !isFormOpen && (
                    <div className="text-center py-16 border border-dashed border-border rounded-2xl">
                        <p className="text-muted-foreground mb-4">No banners in the database yet.</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Button onClick={seedDefaults} disabled={seeding} variant="default">
                                {seeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Load Default Banners
                            </Button>
                            <span className="text-xs text-muted-foreground">or</span>
                            <Button variant="outline" onClick={() => { setCreating(true); setEditingId(null); setForm({ ...EMPTY }); }}>
                                <Plus className="h-4 w-4 mr-2" /> Create From Scratch
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                            &quot;Load Default Banners&quot; will create the 3 existing hero banners so you can edit them.
                        </p>
                    </div>
                )}
                {banners.map((banner) => (
                    <div
                        key={banner.id}
                        className={`flex items-center gap-4 border rounded-2xl p-4 transition-colors ${
                            editingId === banner.id
                                ? "border-primary bg-primary/5"
                                : "border-border bg-card hover:bg-muted/30"
                        }`}
                    >
                        <GripVertical className="h-5 w-5 text-muted-foreground shrink-0 hidden sm:block" />
                        {/* Preview */}
                        <div
                            className="h-16 w-28 sm:h-20 sm:w-36 rounded-xl shrink-0 overflow-hidden border border-border flex items-center justify-center"
                            style={{ backgroundColor: banner.bgColor || "#f0f4ff" }}
                        >
                            <img src={banner.imageUrl} alt={banner.title} className="max-h-full max-w-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{banner.title}</p>
                            {banner.subtitle && <p className="text-xs text-muted-foreground mt-0.5 truncate">{banner.subtitle}</p>}
                            {banner.ctaText && <p className="text-xs text-primary mt-1 truncate">CTA: {banner.ctaText} → {banner.ctaUrl}</p>}
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                            <span className={`text-[10px] sm:text-xs px-2 sm:px-2.5 py-1 rounded-full font-semibold ${banner.active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                                {banner.active ? "Live" : "Hidden"}
                            </span>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(banner)} title="Edit">
                                <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggle(banner)} title={banner.active ? "Hide" : "Show"}>
                                {banner.active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(banner.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
