/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function PromoPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const pathname = usePathname();

    // Don't show on dashboard or admin pages
    const isDashboard = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

    useEffect(() => {
        setIsMounted(true);
        if (isDashboard) return;

        const isDismissed = localStorage.getItem("promo-dismissed");
        if (isDismissed) return;

        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 5000);
        return () => clearTimeout(timer);
    }, [isDashboard]);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem("promo-dismissed", "true");
    };

    if (!isMounted || !isVisible || isDashboard) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 mx-auto md:left-auto md:right-6 md:bottom-6 z-[60] animate-in slide-in-from-bottom-12 fade-in duration-700 max-w-[calc(100vw-2rem)] md:max-w-[360px]">
            <div className="relative rounded-2xl bg-white text-slate-900 p-5 shadow-2xl ring-1 ring-slate-900/5 font-sans overflow-hidden">
                {/* Close button */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-all z-10"
                    aria-label="Close promotion"
                >
                    <X className="h-3.5 w-3.5 text-slate-500 stroke-[2.5]" />
                </button>

                <div className="relative z-10 pr-6">
                    {/* Site logo */}
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3 p-1.5">
                        <img src="/logo.png" alt="MaDe Market" className="h-full w-auto object-contain" />
                    </div>

                    <h3 className="font-bold text-base leading-tight mb-1 tracking-tight text-slate-900">
                        Compare prices & save
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        Find the cheapest groceries across all major stores in Namibia.
                    </p>
                    <Link href="/products" onClick={handleDismiss}>
                        <button className="bg-primary text-white font-bold text-xs py-2.5 px-6 rounded-full hover:bg-primary/90 transition-all active:scale-[0.97]">
                            Start Comparing
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
