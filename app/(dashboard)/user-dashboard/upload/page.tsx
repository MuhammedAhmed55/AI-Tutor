"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle, Loader2 } from "lucide-react";
import { useState, useContext } from "react";

import { createPdfNote } from "@/lib/supabase/actions/createPdfNote";
import { AuthContext } from "@/context/AuthContext";

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  progress: number;
}

export default function UploadPage() {
  const authContext = useContext(AuthContext);
  const userId = authContext?.user?.id;
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleFileSelect = async (file: File) => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      if (!userId) throw new Error("User not authenticated");

      const pdfNote = await createPdfNote({
        userId,
        fileUrl: data.url,
        fileName: data.name,
        fileSize: data.size,
      });

      setUploadedFiles((prev: UploadedFile[]) => [
        ...prev,
        {
          id: pdfNote.id, // Store the PDF ID
          name: data.name,
          size: `${(data.size / 1024 / 1024).toFixed(2)} MB`,
          progress: 100,
        },
      ]);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleProcessWithAI = async () => {
    if (uploadedFiles.length === 0) {
      alert("No files to process");
      return;
    }

    try {
      setProcessing(true);

      // Process the most recently uploaded file
      const latestFile = uploadedFiles[uploadedFiles.length - 1];

      const res = await fetch("/api/process-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfNoteId: latestFile.id,
          userId,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      alert(
        `✅ Processing complete!\n\n${data.summaries?.length || 0} summaries created\n${data.flashcards?.length || 0} flashcards created`
      );

      // Optional: Clear uploaded files after processing
      // setUploadedFiles([]);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="p-8">
        <input
          type="file"
          accept=".pdf"
          hidden
          id="fileInput"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleFileSelect(e.target.files[0]);
            }
          }}
        />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Upload Notes
          </h1>
          <p className="text-muted-foreground">
            Upload your study materials to generate AI-powered learning tools
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card
              onClick={() => document.getElementById("fileInput")?.click()}
              className="border-2 border-dashed border-border bg-linear-to-br from-primary/5 to-accent/5 p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <div className="flex flex-col items-center">
                <div className="bg-primary/10 rounded-xl p-4 mb-4">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Drop files here or click to browse
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Supported formats: PDF only
                </p>
                <Button variant="outline" disabled={uploading || processing}>
                  {uploading ? "Uploading..." : "Choose Files"}
                </Button>
              </div>
            </Card>

            {uploadedFiles.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">
                  Uploaded Files
                </h3>

                {uploadedFiles.map((file: UploadedFile, idx: number) => (
                  <Card key={idx} className="border border-border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="text-sm">{file.name}</span>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {file.size}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={handleProcessWithAI}
              disabled={uploading || processing || uploadedFiles.length === 0}
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing with AI...
                </>
              ) : (
                "Process with AI"
              )}
            </Button>
          </div>

          <div className="space-y-4">
            <Card className="border p-6">
              <h3 className="font-semibold mb-3">Supported File Types</h3>
              <div className="flex gap-3 text-sm text-muted-foreground">
                <span>PDF</span>
              </div>
            </Card>

            <Card className="border p-6">
              <h3 className="font-semibold mb-3">What happens?</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>✅ Smart summaries generated</li>
                <li>✅ Flashcards created</li>
                <li>✅ Ready to study!</li>
              </ul>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}