import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function productUrl(id: string, name: string): string {
  return `/product/${id}/${slugify(name)}`;
}

/**
 * Normalize a product name for matching/deduplication.
 * - Lowercase
 * - Collapse whitespace
 * - Standardize weight/volume units (10 kg, 10KG, 10 Kg → 10kg)
 * - Remove common filler words
 * - Strip special characters except alphanumeric and spaces
 */
export function normalizeProductName(name: string): string {
  let n = name.toLowerCase().trim();

  // Standardize unit patterns: "10 kg" "10kg" "10KG" "10 KG" → "10kg"
  // Weight units
  n = n.replace(/(\d+)\s*(kg|kgs|kilogram|kilograms)\b/gi, "$1kg");
  n = n.replace(/(\d+)\s*(g|gm|gms|gram|grams)\b/gi, "$1g");
  // Volume units
  n = n.replace(/(\d+)\s*(l|lt|ltr|litre|litres|liter|liters)\b/gi, "$1l");
  n = n.replace(/(\d+)\s*(ml|mls|millilitre|millilitres)\b/gi, "$1ml");
  // Pack/piece units
  n = n.replace(/(\d+)\s*(pk|pck|pack|packs|pc|pcs|piece|pieces)\b/gi, "$1pack");
  // Count units (e.g. "x6", "x 6", "6x", "6 x")
  n = n.replace(/(\d+)\s*x\s*/gi, "$1x");
  n = n.replace(/\s*x\s*(\d+)/gi, "x$1");

  // Remove common filler/brand qualifiers that cause mismatches
  n = n.replace(/\b(brand|original|classic|regular|standard|new|improved)\b/gi, "");

  // Remove possessives
  n = n.replace(/['']s\b/g, "s");

  // Collapse multiple spaces
  n = n.replace(/\s+/g, " ").trim();

  // Remove non-alphanumeric except spaces
  n = n.replace(/[^a-z0-9 ]/g, "").trim();

  // Final collapse
  n = n.replace(/\s+/g, " ").trim();

  return n;
}

/**
 * Extract brand and size from a product name.
 * Returns best-effort extraction.
 */
export function extractProductMeta(name: string): { brand: string | null; size: string | null } {
  const sizeMatch = name.match(/(\d+(?:\.\d+)?)\s*(kg|kgs|g|gm|gms|l|lt|ltr|litre|litres|liter|ml|mls|pack|packs|pk|pcs|pieces?)\b/i);
  const size = sizeMatch ? `${sizeMatch[1]}${sizeMatch[2].toLowerCase().replace(/s$/, "").replace(/litres?|liters?|ltr?/, "l").replace(/gm|grams?/, "g").replace(/kilograms?|kgs/, "kg").replace(/mls/, "ml").replace(/packs?|pck|pk/, "pack").replace(/pcs|pieces?/, "pack")}` : null;

  // Brand is typically the first word(s) before the size or product descriptor
  const words = name.trim().split(/\s+/);
  const brand = words.length > 0 ? words[0] : null;

  return { brand, size };
}
