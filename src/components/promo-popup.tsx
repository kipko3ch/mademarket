/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Link from "next/link";

export function PromoPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);

        const isDismissed = localStorage.getItem("promo-dismissed");
        if (isDismissed) return;

        // Show after location modal has had time to process
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem("promo-dismissed", "true");
    };

    if (!isMounted || !isVisible) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 mx-auto md:left-auto md:right-6 md:bottom-6 z-[60] animate-in slide-in-from-bottom-12 fade-in duration-700 max-w-[calc(100vw-2rem)] md:max-w-[380px]">
            <div className="relative rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 shadow-2xl shadow-blue-900/30 font-sans overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10" />
                <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/5" />

                {/* Close button */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-3.5 right-3.5 h-7 w-7 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center hover:bg-white/25 transition-all z-10"
                    aria-label="Close promotion"
                >
                    <X className="h-3.5 w-3.5 text-white stroke-[2.5]" />
                </button>

                <div className="relative z-10 pr-6">
                    {/* Site logo */}
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center mb-3 p-1.5">
                        <img src="/logo.png" alt="MaDe Market" className="h-full w-auto object-contain" />
                    </div>

                    <h3 className="font-bold text-lg leading-tight mb-1.5 tracking-tight">
                        Compare prices & save on every shop
                    </h3>
                    <p className="text-sm text-blue-100 leading-relaxed mb-4">
                        Find the cheapest groceries across all major stores in Namibia — side by side, in seconds.
                    </p>
                    <Link href="/products" onClick={handleDismiss}>
                        <button className="bg-white text-blue-700 font-bold text-sm py-2.5 px-7 rounded-full hover:bg-blue-50 transition-all shadow-lg shadow-blue-900/20 active:scale-[0.97]">
                            Start Comparing
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
