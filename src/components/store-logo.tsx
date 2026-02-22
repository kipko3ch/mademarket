/* eslint-disable @next/next/no-img-element */
"use client";

import { Store } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoreLogoProps {
  src: string | null | undefined;
  name: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  xs: "h-6 w-6",
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
};

const iconSizeMap = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-7 w-7",
};

export function StoreLogo({ src, name, size = "md", className }: StoreLogoProps) {
  return (
    <div
      className={cn(
        "relative rounded-full bg-white border border-border/60 overflow-hidden shrink-0 flex items-center justify-center",
        sizeMap[size],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <Store className={cn("text-muted-foreground", iconSizeMap[size])} />
      )}
    </div>
  );
}
