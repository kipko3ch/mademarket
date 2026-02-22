"use client";

import { useBranch } from "@/hooks/use-branch";
import { ChevronDown, MapPin, CheckCircle2, Clock } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export function BranchSwitcher() {
  const { branches, selectedBranchId, selectBranch, vendor } = useBranch();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = branches.find((b) => b.id === selectedBranchId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!vendor || branches.length === 0) return null;

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left",
          open
            ? "border-primary/30 bg-primary/5 shadow-sm"
            : "border-slate-200 bg-white hover:border-slate-300"
        )}
      >
        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <MapPin className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Branch</p>
          <p className="text-sm font-semibold text-slate-900 truncate">
            {selected?.branchName || selected?.town || "Select Branch"}
          </p>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-2 max-h-[240px] overflow-y-auto">
            {branches.map((branch) => (
              <button
                key={branch.id}
                type="button"
                onClick={() => {
                  selectBranch(branch.id);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left",
                  branch.id === selectedBranchId
                    ? "bg-primary/5 border border-primary/10"
                    : "hover:bg-slate-50"
                )}
              >
                <MapPin className={cn("h-4 w-4 shrink-0", branch.id === selectedBranchId ? "text-primary" : "text-slate-400")} />
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium truncate", branch.id === selectedBranchId ? "text-slate-900" : "text-slate-700")}>
                    {branch.branchName || branch.town}
                  </p>
                  {branch.town && branch.branchName !== branch.town && (
                    <p className="text-[11px] text-slate-400 truncate">{branch.town}, {branch.region}</p>
                  )}
                </div>
                {branch.approved ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
