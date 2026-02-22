"use client";

import { useState } from "react";
import { ChevronDown, Crosshair, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLocation, NAMIBIA_CITIES } from "@/hooks/use-location";
import { cn } from "@/lib/utils";

export function LocationSelector({ className }: { className?: string }) {
  const { location, loading, setLocation, detectLocation } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1.5 text-sm font-medium hover:text-primary transition-colors rounded-full px-3 py-1.5 hover:bg-accent",
            className
          )}
        >
          <img src="/icons/location.png" alt="Loc" className="h-3.5 w-3.5 object-contain" />
          <span className="max-w-[120px] truncate">
            {location ? location.city : "Select location"}
          </span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose your location</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {/* Auto-detect */}
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={async () => {
              await detectLocation();
              setOpen(false);
            }}
            disabled={loading}
          >
            <Crosshair className="h-4 w-4 text-primary" />
            {loading ? "Detecting..." : "Use my current location"}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or select a city
              </span>
            </div>
          </div>

          {/* City grid */}
          <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
            {NAMIBIA_CITIES.map((city) => (
              <button
                key={city}
                onClick={() => {
                  setLocation({ city });
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left",
                  location?.city === city
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 hover:bg-muted text-foreground"
                )}
              >
                <img src="/icons/location.png" alt="Loc" className={cn("h-3.5 w-3.5 shrink-0 object-contain", location?.city === city && "brightness-0 invert")} />
                {city}
              </button>
            ))}
          </div>

          {/* Clear */}
          {location && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={() => {
                useLocation.getState().clearLocation();
                setOpen(false);
              }}
            >
              <X className="h-3 w-3 mr-1" />
              Clear location
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
