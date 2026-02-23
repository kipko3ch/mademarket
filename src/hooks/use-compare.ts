"use client";

import { create } from "zustand";
import type { CompareResult } from "@/types";

interface BranchOption {
  id: string;
  vendorName: string;
  branchTown: string | null;
  vendorSlug: string;
  branchSlug: string;
  vendorLogoUrl: string | null;
}

interface CompareStore {
  selectedBranchIds: string[];
  results: CompareResult[];
  branches: BranchOption[];
  loading: boolean;
  toggleBranch: (branchId: string) => void;
  clearSelection: () => void;
  compare: (category?: string, search?: string) => Promise<void>;
}

export const useCompare = create<CompareStore>()((set, get) => ({
  selectedBranchIds: [],
  results: [],
  branches: [],
  loading: false,

  toggleBranch: (branchId: string) => {
    const { selectedBranchIds } = get();
    if (selectedBranchIds.includes(branchId)) {
      set({
        selectedBranchIds: selectedBranchIds.filter((id) => id !== branchId),
        results: [],
      });
    } else if (selectedBranchIds.length < 3) {
      set({
        selectedBranchIds: [...selectedBranchIds, branchId],
        results: [],
      });
    }
  },

  clearSelection: () => {
    set({ selectedBranchIds: [], results: [], branches: [] });
  },

  compare: async (category?: string, search?: string) => {
    const { selectedBranchIds } = get();
    if (selectedBranchIds.length < 2) return;

    set({ loading: true });

    try {
      const params = new URLSearchParams({
        branchIds: selectedBranchIds.join(","),
      });
      if (category) params.set("category", category);
      if (search) params.set("search", search);

      const res = await fetch(`/api/compare?${params}`);
      if (!res.ok) throw new Error("Failed to compare");

      const data = await res.json();
      set({
        results: data.results,
        branches: data.branches,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },
}));
