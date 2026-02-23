/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  folder?: string;
  className?: string;
  label?: string;
  aspectRatio?: "square" | "banner" | "auto";
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  folder = "uploads",
  className = "",
  label = "Upload Image",
  aspectRatio = "auto",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const aspectClass =
    aspectRatio === "square"
      ? "aspect-square"
      : aspectRatio === "banner"
        ? "aspect-[3/1]"
        : "min-h-[140px]";

  const handleFile = useCallback(
    async (file: File) => {
      // Validate type
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPEG, PNG, WebP, and GIF images are allowed");
        return;
      }

      // Validate size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be under 5MB");
        return;
      }

      setUploading(true);

      try {
        // Upload via server proxy (avoids CORS issues with R2)
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const res = await fetch("/api/upload/image", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to upload image");
        }

        const { publicUrl } = await res.json();

        onChange(publicUrl);
        toast.success("Image uploaded successfully");
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(error instanceof Error ? error.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [folder, onChange]
  );

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so the same file can be re-selected
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
  }

  // Show current image with change overlay
  if (value) {
    return (
      <div className={`relative group ${className}`}>
        <div
          className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 ${aspectClass}`}
        >
          <img
            src={value}
            alt={label}
            className="w-full h-full object-cover"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="px-3 py-1.5 bg-white rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Change"
              )}
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="p-1.5 bg-white rounded-lg text-red-500 hover:bg-red-50 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleInputChange}
        />
      </div>
    );
  }

  // Empty state: drop zone
  return (
    <div className={className}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`
          relative overflow-hidden rounded-2xl border-2 border-dashed cursor-pointer
          transition-colors ${aspectClass} flex flex-col items-center justify-center gap-2 p-4
          ${dragOver
            ? "border-primary bg-primary/5"
            : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"
          }
          ${uploading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        {uploading ? (
          <>
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
            <span className="text-xs font-medium text-slate-500">Uploading...</span>
          </>
        ) : (
          <>
            <div className="h-10 w-10 rounded-xl bg-slate-200 flex items-center justify-center">
              {dragOver ? (
                <Upload className="h-5 w-5 text-primary" />
              ) : (
                <ImageIcon className="h-5 w-5 text-slate-400" />
              )}
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-slate-600">{label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Drop an image here or click to browse
              </p>
              <p className="text-[10px] text-slate-400">
                JPEG, PNG, WebP, GIF up to 5MB
              </p>
            </div>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}
