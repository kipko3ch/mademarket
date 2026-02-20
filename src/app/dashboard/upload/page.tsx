"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, Download } from "lucide-react";

interface UploadResult {
  total: number;
  created: number;
  updated: number;
  errors: { row: number; error: string }[];
}

export default function BulkUploadPage() {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  useEffect(() => {
    async function fetchStoreId() {
      try {
        const res = await fetch("/api/dashboard/overview");
        if (res.ok) {
          const data = await res.json();
          if (data.store) setStoreId(data.store.id);
        }
      } catch {}
    }
    fetchStoreId();
  }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !storeId) return;
    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("storeId", storeId);

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
            <Button type="submit" disabled={uploading || !file || !storeId} className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Uploading..." : "Upload & Process"}
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
