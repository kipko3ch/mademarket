"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Check, X, Store, Eye, EyeOff, Globe } from "lucide-react";

interface StoreItem {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  approved: boolean;
  showInMarquee: boolean;
  marqueeOrder: number;
  websiteUrl: string | null;
  createdAt: string;
}

export default function AdminStoresPage() {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchStores() {
    try {
      const res = await fetch("/api/admin/stores");
      if (res.ok) setStores(await res.json());
    } catch {} finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStores();
  }, []);

  async function handleUpdate(storeId: string, data: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/admin/stores/${storeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success("Store updated");
        fetchStores();
      } else {
        toast.error("Failed to update store");
      }
    } catch {
      toast.error("Something went wrong");
    }
  }

  if (loading) {
    return <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manage Stores</h1>
        <p className="text-sm text-slate-500 mt-0.5">Approve stores and control homepage marquee</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="text-xs font-bold text-slate-500">Store</TableHead>
              <TableHead className="text-xs font-bold text-slate-500">Owner</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 text-center">Status</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 text-center">Marquee</TableHead>
              <TableHead className="text-xs font-bold text-slate-500">Registered</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                  <Store className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No stores registered yet
                </TableCell>
              </TableRow>
            ) : (
              stores.map((store) => (
                <TableRow key={store.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{store.name}</p>
                      {store.websiteUrl && (
                        <a href={store.websiteUrl} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-3.5 w-3.5 text-slate-400 hover:text-primary" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-slate-700">{store.ownerName}</p>
                    <p className="text-xs text-slate-400">{store.ownerEmail}</p>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={store.approved ? "default" : "secondary"}
                      className={store.approved ? "bg-green-100 text-green-700 border-0" : "bg-amber-100 text-amber-700 border-0"}
                    >
                      {store.approved ? "Approved" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={() => handleUpdate(store.id, { showInMarquee: !store.showInMarquee })}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                        store.showInMarquee
                          ? "bg-primary/10 text-primary"
                          : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                      }`}
                    >
                      {store.showInMarquee ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {store.showInMarquee ? "Visible" : "Hidden"}
                    </button>
                  </TableCell>
                  <TableCell className="text-xs text-slate-400">
                    {new Date(store.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {!store.approved ? (
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 text-green-600 hover:bg-green-50 border-green-200"
                          onClick={() => handleUpdate(store.id, { approved: true })}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 text-red-500 hover:bg-red-50 border-red-200"
                          onClick={() => handleUpdate(store.id, { approved: false })}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
