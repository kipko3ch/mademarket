/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { ChevronDown, Crosshair, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLocation, NAMIBIA_REGIONS } from "@/hooks/use-location";
import { cn } from "@/lib/utils";

const POPULAR_CITIES = ["Windhoek", "Swakopmund", "Walvis Bay", "Oshakati"];

export function LocationSelector({ className }: { className?: string }) {
  const { location, loading, setLocation, detectLocation } = useLocation();
  const [open, setOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  function handleSelectCity(city: string) {
    setLocation({ city });
    setOpen(false);
    setSelectedRegion(null);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSelectedRegion(null); }}>
      <DialogTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1.5 text-sm font-medium hover:text-primary transition-colors rounded-full px-3 py-1.5 hover:bg-accent",
            className
          )}
        >
          <img src="/icons/location.png" alt="Loc" className="h-3.5 w-3.5 object-contain" />
          <span className="max-w-[120px] truncate">
            {location ? location.city : "Select town"}
          </span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm p-0 rounded-3xl gap-0 overflow-hidden border-0 shadow-2xl">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center bg-gradient-to-b from-primary/5 to-transparent">
          <img src="/icons/location.png" alt="Location" className="h-8 w-8 mx-auto mb-3 object-contain" />
          <DialogHeader className="mb-0">
            <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
              Choose Your Town
            </DialogTitle>
          </DialogHeader>
          <p className="text-slate-500 text-xs mt-1">
            We&apos;ll show you the best prices nearby
          </p>
        </div>

        <div className="px-5 pb-5">
          {/* Auto-detect */}
          <button
            onClick={async () => {
              await detectLocation();
              setOpen(false);
            }}
            disabled={loading}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 mb-4"
          >
            <Crosshair className="h-4 w-4 shrink-0" />
            <span>{loading ? "Detecting..." : "Use my current location"}</span>
            <ChevronRight className="h-4 w-4 ml-auto opacity-60" />
          </button>

          {/* Popular cities */}
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
            Popular towns
          </p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {POPULAR_CITIES.map((city) => (
              <button
                key={city}
                onClick={() => handleSelectCity(city)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left",
                  location?.city === city
                    ? "bg-primary text-white"
                    : "bg-slate-50 text-slate-700 hover:bg-primary/5 hover:text-primary"
                )}
              >
                <img src="/icons/location.png" alt="Loc" className={cn("h-3.5 w-3.5 shrink-0 object-contain", location?.city === city && "brightness-0 invert")} />
                {city}
              </button>
            ))}
          </div>

          {/* Browse by Region */}
          <details className="group">
            <summary className="text-xs font-semibold text-primary cursor-pointer hover:underline list-none flex items-center gap-1 mb-2">
              <ChevronRight className="h-3 w-3 transition-transform group-open:rotate-90" />
              Browse by region
            </summary>
            <div className="max-h-[200px] overflow-y-auto scrollbar-hide space-y-1">
              {selectedRegion ? (
                <>
                  <button
                    onClick={() => setSelectedRegion(null)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary mb-2 transition-colors"
                  >
                    <ChevronRight className="h-3 w-3 rotate-180" />
                    Back to regions
                  </button>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(NAMIBIA_REGIONS[selectedRegion] || []).map((city) => (
                      <button
                        key={city}
                        onClick={() => handleSelectCity(city)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left",
                          location?.city === city
                            ? "bg-primary text-white"
                            : "bg-slate-50 text-slate-600 hover:bg-primary/5 hover:text-primary"
                        )}
                      >
                        <img src="/icons/location.png" alt="" className={cn("h-3 w-3 shrink-0 object-contain opacity-50", location?.city === city && "brightness-0 invert opacity-100")} />
                        {city}
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
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium bg-slate-50 text-slate-700 hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                      <span>{region}</span>
                      <ChevronRight className="h-3 w-3 opacity-40" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </details>

          {/* Clear location */}
          {location && (
            <>
              <div className="border-t border-slate-100 my-3" />
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground text-xs"
                onClick={() => {
                  useLocation.getState().clearLocation();
                  setOpen(false);
                }}
              >
                <X className="h-3 w-3 mr-1" />
                Clear location
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
