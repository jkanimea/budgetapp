"use client";

import { useState, useRef, useCallback } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Navigation } from "@/components/Navigation";

export default function UploadPage() {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useRef<Toast>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith(".csv")) {
      setFileName(file.name);
      const dt = new DataTransfer();
      dt.items.add(file);
      if (fileInputRef.current) fileInputRef.current.files = dt.files;
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.current?.show({ severity: "warn", summary: "No file", detail: "Please select a CSV file first" });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/transactions", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      toast.current?.show({ severity: "success", summary: "Imported", detail: data.message, life: 5000 });
      setFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      toast.current?.show({ severity: "error", summary: "Error", detail: (err as Error).message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <Navigation />
      <Toast ref={toast} />
      <main className="max-w-2xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Import Bank CSV</h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload your bank statement CSV file to automatically categorize transactions.
          </p>
        </div>

        <Card>
          <div className="flex flex-col items-center gap-4">
            <div
              className={`border-2 border-dashed rounded-xl p-10 w-full text-center cursor-pointer transition-colors ${dragOver ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-blue-400"}`}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              {fileName ? (
                <div>
                  <i className="pi pi-file text-4xl text-blue-500 mb-3 block" />
                  <p className="font-medium text-slate-700">{fileName}</p>
                  <p className="text-xs text-slate-400 mt-1">Click to change file</p>
                </div>
              ) : (
                <div>
                  <i className="pi pi-cloud-upload text-4xl text-slate-400 mb-3 block" />
                  <p className="text-slate-600 font-medium">Drop your CSV file here or click to browse</p>
                  <p className="text-xs text-slate-400 mt-1">Bank statement CSV from your bank</p>
                </div>
              )}
            </div>

            <Button
              label={uploading ? "Importing..." : "Import CSV"}
              icon="pi pi-upload"
              onClick={handleUpload}
              disabled={!fileName || uploading}
              loading={uploading}
              className="w-full"
            />
          </div>
        </Card>

        <Card title="Expected CSV Format">
          <p className="text-sm text-slate-500 mb-2">Your CSV should have these columns:</p>
          <pre className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-600 overflow-x-auto">
Type,Details,Particulars,Code,Reference,Amount,Date,ForeignCurrencyAmount,ConversionCharge
          </pre>
          <div className="mt-3 text-xs text-slate-400 space-y-1">
            <p><i className="pi pi-info-circle mr-1" /> Amount should be negative for expenses, positive for income.</p>
            <p><i className="pi pi-info-circle mr-1" /> Date format: DD/MM/YYYY</p>
          </div>
        </Card>
      </main>
    </div>
  );
}
