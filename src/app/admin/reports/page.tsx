"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, FileText, Trash2, Download, Loader2, ExternalLink } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

interface Vendor {
  id: string;
  name: string;
}

interface VendorReport {
  id: string;
  vendorId: string;
  vendorName: string;
  title: string;
  fileUrl: string;
  uploadedAt: string;
}

export default function AdminReportsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [reports, setReports] = useState<VendorReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterVendorId, setFilterVendorId] = useState("");

  const [formVendorId, setFormVendorId] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formFileUrl, setFormFileUrl] = useState("");

  const fetchVendors = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/vendors");
      if (res.ok) {
        const data = await res.json();
        setVendors(Array.isArray(data) ? data : data.vendors || []);
      }
    } catch { /* swallow */ }
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterVendorId) params.set("vendorId", filterVendorId);
      const res = await fetch(`/api/admin/reports/vendor?${params}`);
      if (res.ok) setReports(await res.json());
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [filterVendorId]);

  useEffect(() => {
    fetchVendors();
    fetchReports();
  }, [fetchVendors, fetchReports]);

  function openDialog() {
    setFormVendorId("");
    setFormTitle("");
    setFormFileUrl("");
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formVendorId || !formTitle.trim() || !formFileUrl) {
      toast.error("All fields are required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/reports/vendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId: formVendorId, title: formTitle.trim(), fileUrl: formFileUrl }),
      });
      if (res.ok) {
        toast.success("Report uploaded");
        setDialogOpen(false);
        fetchReports();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to upload");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/reports/uploads/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Report deleted");
        fetchReports();
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Vendor Reports</h1>
          <p className="text-sm text-slate-500 mt-1">Upload and manage reports per vendor</p>
        </div>
        <Button onClick={openDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Upload Report
        </Button>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-end gap-4">
            <div className="space-y-1.5 flex-1">
              <Label className="text-xs">Filter by Vendor</Label>
              <Select value={filterVendorId || "all"} onValueChange={(val) => setFilterVendorId(val === "all" ? "" : val)}>
                <SelectTrigger><SelectValue placeholder="All Vendors" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {vendors.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl">
          <FileText className="h-10 w-10 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 font-medium">No reports uploaded yet</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.vendorName}</TableCell>
                    <TableCell>{r.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(r.uploadedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <a href={r.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="icon" variant="ghost" className="h-8 w-8" title="View">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </a>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                          disabled={deletingId === r.id}
                          onClick={() => handleDelete(r.id)}
                          title="Delete"
                        >
                          {deletingId === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Upload dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Vendor Report</DialogTitle>
            <DialogDescription>Upload a PDF or CSV report for a vendor.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Vendor <span className="text-red-500">*</span></Label>
              <Select value={formVendorId || "none"} onValueChange={(val) => setFormVendorId(val === "none" ? "" : val)}>
                <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" disabled>Select vendor</SelectItem>
                  {vendors.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Report Title <span className="text-red-500">*</span></Label>
              <Input placeholder="e.g. Monthly Sales Report - Jan 2026" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Report File <span className="text-red-500">*</span></Label>
              <ImageUpload
                value={formFileUrl || undefined}
                onChange={(url) => setFormFileUrl(url)}
                onRemove={() => setFormFileUrl("")}
                folder="reports"
                label="Upload PDF/CSV"
                aspectRatio="auto"
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Uploading..." : "Upload Report"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
