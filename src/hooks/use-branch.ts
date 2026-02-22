"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BranchInfo {
  id: string;
  branchName: string;
  slug: string;
  town: string | null;
  region: string | null;
  approved: boolean;
  active: boolean;
}

interface VendorInfo {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  approved: boolean;
  active: boolean;
}

interface BranchStore {
  vendor: VendorInfo | null;
  branches: BranchInfo[];
  selectedBranchId: string | null;
  loading: boolean;
  setVendor: (vendor: VendorInfo | null) => void;
  setBranches: (branches: BranchInfo[]) => void;
  selectBranch: (branchId: string) => void;
  setLoading: (loading: boolean) => void;
  fetchVendorData: () => Promise<void>;
  selectedBranch: () => BranchInfo | null;
}

export const useBranch = create<BranchStore>()(
  persist(
    (set, get) => ({
      vendor: null,
      branches: [],
      selectedBranchId: null,
      loading: false,

      setVendor: (vendor) => set({ vendor }),
      setBranches: (branches) => {
        const { selectedBranchId } = get();
        // If no branch selected or selected branch no longer exists, select first one
        if (!selectedBranchId || !branches.find((b) => b.id === selectedBranchId)) {
          set({ branches, selectedBranchId: branches[0]?.id || null });
        } else {
          set({ branches });
        }
      },
      selectBranch: (branchId) => set({ selectedBranchId: branchId }),
      setLoading: (loading) => set({ loading }),

      fetchVendorData: async () => {
        set({ loading: true });
        try {
          const res = await fetch("/api/dashboard/overview");
          if (!res.ok) {
            set({ vendor: null, branches: [], selectedBranchId: null, loading: false });
            return;
          }
          const data = await res.json();
          if (data.vendor) {
            set({ vendor: data.vendor });
            const branchList: BranchInfo[] = data.branches || [];
            const { selectedBranchId } = get();
            if (!selectedBranchId || !branchList.find((b) => b.id === selectedBranchId)) {
              set({ branches: branchList, selectedBranchId: branchList[0]?.id || null });
            } else {
              set({ branches: branchList });
            }
          } else {
            set({ vendor: null, branches: [], selectedBranchId: null });
          }
        } catch {
          set({ vendor: null, branches: [], selectedBranchId: null });
        } finally {
          set({ loading: false });
        }
      },

      selectedBranch: () => {
        const { branches, selectedBranchId } = get();
        return branches.find((b) => b.id === selectedBranchId) || null;
      },
    }),
    {
      name: "made-market-branch",
      partialize: (state) => ({ selectedBranchId: state.selectedBranchId }),
    }
  )
);
