"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function BulkUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    // Check if file is CSV
    if (!file.name.endsWith('.csv')) {
      setError("Please upload a CSV file");
      return;
    }

    setUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setUploadResult(`Successfully uploaded ${result.data.count} tenants!`);
        toast.success(`${result.data.count} tenants imported successfully`);
      } else {
        throw new Error(result.error?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError(error instanceof Error ? error.message : "Upload failed");
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Create CSV template content
    const csvContent = `firstName,lastName,email,phone,unitId,leaseStartDate,leaseEndDate,monthlyRent,securityDeposit
John,Doe,john.doe@example.com,+1-555-123-4567,unit_101,2024-01-01,2024-12-31,2500,500
Jane,Smith,jane.smith@example.com,+1-555-987-6543,unit_102,2024-02-01,2025-01-31,2800,600`;

    // Create and download the template
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tenant-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success("Template downloaded successfully");
  };

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Bulk Upload</h1>
            <p className="text-muted-foreground">
              Upload multiple tenants at once using a CSV file
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/tenants")}>
            Back to Tenants
          </Button>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Tenants CSV</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Select CSV File</Label>
              <Input
                id="file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="file:mr-2"
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleDownloadTemplate}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Download Template
              </Button>
              
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-2 border-r-2 border-b-2 border-l-2 border-primary" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload Tenants
                  </>
                )}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {uploadResult && (
              <Alert className="mt-4">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>{uploadResult}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>CSV Format Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-2">
              <p><strong>Required Columns:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                <li><code>firstName</code> - Tenant's first name</li>
                <li><code>lastName</code> - Tenant's last name</li>
                <li><code>email</code> - Tenant's email address</li>
                <li><code>phone</code> - Tenant's phone number (optional)</li>
                <li><code>unitId</code> - Unit ID to assign tenant to</li>
                <li><code>leaseStartDate</code> - Lease start date (YYYY-MM-DD format)</li>
                <li><code>leaseEndDate</code> - Lease end date (YYYY-MM-DD format, optional)</li>
                <li><code>monthlyRent</code> - Monthly rent amount</li>
                <li><code>securityDeposit</code> - Security deposit amount (optional)</li>
              </ul>
              
              <p><strong>Sample Row:</strong></p>
              <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                <code>John,Doe,john.doe@example.com,+1-555-123-4567,unit_101,2024-01-01,2024-12-31,2500,500</code>
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
