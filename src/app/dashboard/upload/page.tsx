"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, Download, MapPin } from "lucide-react";
import { useBranch } from "@/hooks/use-branch";

interface UploadResult {
  total: number;
  created: number;
  updated: number;
  errors: { row: number; error: string }[];
}

export default function BulkUploadPage() {
  const { vendor, branches, fetchVendorData, loading: branchLoading } = useBranch();

  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  useEffect(() => {
    fetchVendorData();
  }, [fetchVendorData]);

  function toggleBranch(branchId: string) {
    setSelectedBranchIds((prev) =>
      prev.includes(branchId)
        ? prev.filter((id) => id !== branchId)
        : [...prev, branchId]
    );
  }

  function selectAllBranches() {
    if (selectedBranchIds.length === branches.length) {
      setSelectedBranchIds([]);
    } else {
      setSelectedBranchIds(branches.map((b) => b.id));
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || selectedBranchIds.length === 0) return;
    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("branchIds", selectedBranchIds.join(","));

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Upload failed");
        return;
      }

      setResult(data.results);
      toast.success(`Upload complete: ${data.results.created} created, ${data.results.updated} updated`);
      setFile(null);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setUploading(false);
    }
  }

  const selectedBranchNames = branches
    .filter((b) => selectedBranchIds.includes(b.id))
    .map((b) => b.branchName);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bulk Upload</h1>
        <p className="text-muted-foreground">
          Upload an Excel file to add or update products in bulk
        </p>
      </div>

      {/* Template download */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Excel Template</CardTitle>
          <CardDescription>
            Download the template and fill in your product data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium mb-2">Required columns:</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">product_name</Badge>
              <Badge variant="secondary">price</Badge>
              <Badge variant="outline">bundle_info (optional)</Badge>
              <Badge variant="outline">unit (optional)</Badge>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </CardContent>
      </Card>

      {/* Branch Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Select Branches
          </CardTitle>
          <CardDescription>
            Choose which branches to upload products to. Products will be added to all selected branches.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {branchLoading ? (
            <div className="h-20 bg-muted rounded-lg animate-pulse" />
          ) : branches.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No branches found. Please set up branches first.
            </p>
          ) : (
            <div className="space-y-3">
              {/* Select all toggle */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-700">
                  {selectedBranchIds.length} of {branches.length} selected
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={selectAllBranches}
                >
                  {selectedBranchIds.length === branches.length ? "Deselect All" : "Select All"}
                </Button>
              </div>

              {/* Branch checkboxes */}
              <div className="space-y-2">
                {branches.map((branch) => (
                  <label
                    key={branch.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      selectedBranchIds.includes(branch.id)
                        ? "border-blue-200 bg-blue-50"
                        : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedBranchIds.includes(branch.id)}
                      onChange={() => toggleBranch(branch.id)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{branch.branchName}</p>
                      <p className="text-xs text-slate-500">
                        {branch.town || "No town"}{branch.region ? ` · ${branch.region}` : ""}
                      </p>
                    </div>
                    {branch.approved ? (
                      <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Active</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-[10px]">Pending</Badge>
                    )}
                  </label>
                ))}
              </div>

              {/* Selected summary */}
              {selectedBranchNames.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-blue-800 mb-1">Uploading to:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedBranchNames.map((name) => (
                      <Badge key={name} variant="secondary" className="bg-blue-100 text-blue-700 text-[10px]">
                        {name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Upload File
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-2">
              <Label>Excel File (.xlsx)</Label>
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
              />
              <p className="text-xs text-muted-foreground">Max 500 rows per file</p>
            </div>
            <Button
              type="submit"
              disabled={uploading || !file || selectedBranchIds.length === 0}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading
                ? "Uploading..."
                : selectedBranchIds.length === 0
                ? "Select branches first"
                : `Upload to ${selectedBranchIds.length} ${selectedBranchIds.length === 1 ? "branch" : "branches"}`}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upload Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{result.total}</p>
                <p className="text-xs text-muted-foreground">Total Rows</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{result.created}</p>
                <p className="text-xs text-muted-foreground">Created</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{result.updated}</p>
                <p className="text-xs text-muted-foreground">Updated</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="border rounded-lg p-4">
                <p className="text-sm font-medium text-destructive mb-2">
                  <XCircle className="h-4 w-4 inline mr-1" />
                  {result.errors.length} errors
                </p>
                <ul className="space-y-1">
                  {result.errors.map((err, i) => (
                    <li key={i} className="text-xs text-muted-foreground">
                      Row {err.row}: {err.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.errors.length === 0 && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                All rows processed successfully
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
