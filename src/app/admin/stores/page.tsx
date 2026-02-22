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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Check, X, Store, Eye, EyeOff, Globe, Trash2, Pause, Play } from "lucide-react";

interface StoreItem {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  approved: boolean;
  suspended: boolean;
  showInMarquee: boolean;
  marqueeOrder: number;
  websiteUrl: string | null;
  region: string | null;
  city: string | null;
  createdAt: string;
}

export default function AdminStoresPage() {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StoreItem | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<StoreItem | null>(null);

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
    setActionLoading(storeId);
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
        const err = await res.json();
        toast.error(err.error || "Failed to update store");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(store: StoreItem) {
    setActionLoading(store.id);
    try {
      const res = await fetch(`/api/admin/stores/${store.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success(`"${store.name}" deleted — all products, bundles, and brochures removed`);
        fetchStores();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to delete store");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setActionLoading(null);
      setDeleteTarget(null);
    }
  }

  async function handleSuspendToggle(store: StoreItem) {
    setActionLoading(store.id);
    try {
      const res = await fetch(`/api/admin/stores/${store.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suspended: !store.suspended }),
      });

      if (res.ok) {
        toast.success(store.suspended ? `"${store.name}" reactivated` : `"${store.name}" suspended`);
        fetchStores();
      } else {
        toast.error("Failed to update store");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setActionLoading(null);
      setSuspendTarget(null);
    }
  }

  function getStatusBadge(store: StoreItem) {
    if (store.suspended) {
      return <Badge className="bg-red-100 text-red-700 border-0">Suspended</Badge>;
    }
    if (store.approved) {
      return <Badge className="bg-green-100 text-green-700 border-0">Approved</Badge>;
    }
    return <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-0">Pending</Badge>;
  }

  if (loading) {
    return <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manage Stores</h1>
        <p className="text-sm text-slate-500 mt-0.5">Approve, suspend, or remove vendor stores</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="text-xs font-bold text-slate-500">Store</TableHead>
              <TableHead className="text-xs font-bold text-slate-500">Owner</TableHead>
              <TableHead className="text-xs font-bold text-slate-500">Location</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 text-center">Status</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 text-center">Marquee</TableHead>
              <TableHead className="text-xs font-bold text-slate-500">Registered</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 w-44">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                  <Store className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No stores registered yet
                </TableCell>
              </TableRow>
            ) : (
              stores.map((store) => (
                <TableRow key={store.id} className={`hover:bg-slate-50/50 ${store.suspended ? "opacity-60" : ""}`}>
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
                  <TableCell>
                    <p className="text-sm text-slate-600">
                      {store.city || store.region
                        ? [store.city, store.region].filter(Boolean).join(", ")
                        : "-"}
                    </p>
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(store)}
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={() => handleUpdate(store.id, { showInMarquee: !store.showInMarquee })}
                      disabled={actionLoading === store.id}
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
                      {/* Approve / Revoke */}
                      {!store.approved ? (
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 text-green-600 hover:bg-green-50 border-green-200"
                          disabled={actionLoading === store.id}
                          onClick={() => handleUpdate(store.id, { approved: true })}
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 text-slate-500 hover:bg-slate-50 border-slate-200"
                          disabled={actionLoading === store.id}
                          onClick={() => handleUpdate(store.id, { approved: false })}
                          title="Revoke approval"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}

                      {/* Suspend / Reactivate */}
                      <Button
                        size="icon"
                        variant="outline"
                        className={`h-8 w-8 ${store.suspended
                          ? "text-green-600 hover:bg-green-50 border-green-200"
                          : "text-amber-600 hover:bg-amber-50 border-amber-200"
                        }`}
                        disabled={actionLoading === store.id}
                        onClick={() => setSuspendTarget(store)}
                        title={store.suspended ? "Reactivate" : "Suspend"}
                      >
                        {store.suspended ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                      </Button>

                      {/* Delete */}
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 text-red-500 hover:bg-red-50 border-red-200"
                        disabled={actionLoading === store.id}
                        onClick={() => setDeleteTarget(store)}
                        title="Delete store"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{deleteTarget?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the store and <strong>all associated data</strong>:
              products, prices, bundles, brochures, and sponsored listings.
              The vendor&apos;s account will be downgraded to a regular user.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
            >
              {actionLoading === deleteTarget?.id ? "Deleting..." : "Delete Store"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suspend Confirmation */}
      <AlertDialog open={!!suspendTarget} onOpenChange={(open) => !open && setSuspendTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {suspendTarget?.suspended ? "Reactivate" : "Suspend"} &ldquo;{suspendTarget?.name}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {suspendTarget?.suspended
                ? "This will reactivate the store. Their products will be visible again and the vendor can manage their store."
                : "This will temporarily suspend the store. Their products will be hidden from the public, but no data will be deleted. You can reactivate the store at any time."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={suspendTarget?.suspended ? "bg-green-600 hover:bg-green-700 text-white" : "bg-amber-600 hover:bg-amber-700 text-white"}
              onClick={() => suspendTarget && handleSuspendToggle(suspendTarget)}
            >
              {actionLoading === suspendTarget?.id
                ? "Updating..."
                : suspendTarget?.suspended ? "Reactivate" : "Suspend Store"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
