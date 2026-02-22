"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Crosshair, ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useLocation, NAMIBIA_REGIONS } from "@/hooks/use-location";

const POPULAR_CITIES = ["Windhoek", "Swakopmund", "Walvis Bay", "Oshakati"];

export function LocationModal() {
    const [open, setOpen] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
    const { setLocation } = useLocation();

    useEffect(() => {
        const hasSeenModal = localStorage.getItem("hasSeenLocationModal");
        if (!hasSeenModal) {
            const timer = setTimeout(() => {
                setOpen(true);
            }, 10);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            localStorage.setItem("hasSeenLocationModal", "true");
            setSelectedRegion(null);
        }
    };

    const handleSelectCity = (city: string, region?: string) => {
        setLocation({ city, region });
        handleOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-sm p-0 rounded-3xl gap-0 overflow-hidden border-0 shadow-2xl" showCloseButton={false}>
                {/* Header */}
                <div className="px-6 pt-8 pb-5 text-center bg-gradient-to-b from-primary/5 to-transparent">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/icons/location.png" alt="Location" className="h-10 w-10 mx-auto mb-4 object-contain" />
                    <DialogHeader className="mb-0">
                        <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
                            Where are you shopping?
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-slate-500 text-xs mt-1.5">
                        We&apos;ll show you the best prices nearby
                    </p>
                </div>

                {/* Content */}
                <div className="px-6 pb-6">
                    {/* Auto-detect button */}
                    <button
                        onClick={() => {
                            if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition(
                                    () => {
                                        handleSelectCity("Windhoek");
                                    },
                                    () => {
                                        handleSelectCity("Windhoek");
                                    }
                                );
                            } else {
                                handleSelectCity("Windhoek");
                            }
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 mb-5"
                    >
                        <Crosshair className="h-4 w-4 shrink-0" />
                        <span>Use my current location</span>
                        <ChevronRight className="h-4 w-4 ml-auto opacity-60" />
                    </button>

                    {/* Popular cities */}
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2.5">
                        Popular cities
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {POPULAR_CITIES.map((city) => (
                            <button
                                key={city}
                                onClick={() => handleSelectCity(city)}
                                className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-50 text-sm font-medium text-slate-700 hover:bg-primary/5 hover:text-primary transition-all text-left"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="/icons/location.png" alt="Loc" className="h-4 w-4 shrink-0 object-contain" />
                                {city}
                            </button>
                        ))}
                    </div>

                    {/* Browse by Region */}
                    <details className="group">
                        <summary className="text-xs font-semibold text-primary cursor-pointer hover:underline list-none flex items-center gap-1 mb-2">
                            <ChevronRight className="h-3 w-3 transition-transform group-open:rotate-90" />
                            Browse by Region
                        </summary>

                        <div className="max-h-[200px] overflow-y-auto scrollbar-hide">
                            {selectedRegion ? (
                                <>
                                    <button
                                        onClick={() => setSelectedRegion(null)}
                                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-primary hover:underline mb-1"
                                    >
                                        <ChevronLeft className="h-3 w-3" />
                                        Back to regions
                                    </button>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-3 mb-1.5">
                                        {selectedRegion} Region
                                    </p>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        {NAMIBIA_REGIONS[selectedRegion]?.map((town) => (
                                            <button
                                                key={town}
                                                onClick={() => handleSelectCity(town, selectedRegion)}
                                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-primary/5 hover:text-primary transition-colors text-left"
                                            >
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src="/icons/location.png" alt="Loc" className="h-3 w-3 shrink-0 object-contain opacity-50" />
                                                {town}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-1.5">
                                    {Object.keys(NAMIBIA_REGIONS).map((region) => (
                                        <button
                                            key={region}
                                            onClick={() => setSelectedRegion(region)}
                                            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-primary/5 hover:text-primary transition-colors text-left"
                                        >
                                            <span>{region}</span>
                                            <ChevronRight className="h-3 w-3 opacity-40" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </details>

                    {/* Divider */}
                    <div className="border-t border-slate-100 my-4" />

                    {/* Login link */}
                    <Link
                        href="/login"
                        onClick={() => handleOpenChange(false)}
                        className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-semibold text-slate-400 hover:text-primary transition-colors"
                    >
                        Sign in for saved addresses
                        <ChevronRight className="h-3 w-3" />
                    </Link>
                </div>
            </DialogContent>
        </Dialog>
    );
}
