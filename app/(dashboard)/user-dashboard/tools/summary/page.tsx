"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, RotateCcw, BookOpen, Loader2 } from "lucide-react";
import { useState, useEffect, useContext } from "react";
import { supabase } from "@/lib/supabase/supabase-auth-client";
import { AuthContext } from "@/context/AuthContext";

export default function SummaryPage() {
  const authContext = useContext(AuthContext);
  const userId = authContext?.user?.id;

  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState<any[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<any>(null);
  const [selectedSummaryType, setSelectedSummaryType] = useState<string>("smart");

  useEffect(() => {
    if (userId) {
      fetchSummaries();
    }
  }, [userId]);

  const fetchSummaries = async () => {
    try {
      setLoading(true);

      // Get all summaries for this user
      const { data: summariesData, error: summariesError } = await supabase()
        .from("ai_summaries")
        .select(`
          *,
          pdf_notes (
            id,
            file_name,
            file_url
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (summariesError) throw summariesError;

      setSummaries(summariesData || []);

      // Set first PDF as selected
      if (summariesData && summariesData.length > 0) {
        setSelectedPdf(summariesData[0].pdf_notes);
      }
    } catch (error: any) {
      console.error("Error fetching summaries:", error);
      alert("Failed to load summaries");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const summaryContent = getCurrentSummary()?.content || "";
    navigator.clipboard.writeText(summaryContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const summaryContent = getCurrentSummary()?.content || "";
    const blob = new Blob([summaryContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedPdf?.file_name || "summary"}-${selectedSummaryType}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getCurrentSummary = () => {
    return summaries.find(
      (s) =>
        s.pdf_notes?.id === selectedPdf?.id &&
        s.summary_type === selectedSummaryType
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (summaries.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <main className="p-8">
          <div className="text-center mt-20">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              No Summaries Yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Upload and process a PDF to generate summaries
            </p>
            <Button onClick={() => (window.location.href = "/user-dashboard/upload")}>
              Upload PDF
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const currentSummary = getCurrentSummary();

  return (
    <div className="min-h-screen bg-background">
      <main className="p-8">
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Summary Generator
              </h1>
              <p className="text-muted-foreground">
                Selected document: {selectedPdf?.file_name || "None"}
              </p>
            </div>
            <Button variant="outline" className="gap-2" onClick={fetchSummaries}>
              <RotateCcw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

          {/* Summary Type Selector */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={selectedSummaryType === "smart" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSummaryType("smart")}
            >
              Smart
            </Button>
            <Button
              variant={selectedSummaryType === "brief" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSummaryType("brief")}
            >
              Brief
            </Button>
            <Button
              variant={selectedSummaryType === "detailed" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSummaryType("detailed")}
            >
              Detailed
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-1 gap-6">
          {/* AI Summary */}
          <Card className="border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">
                AI-Generated Summary ({selectedSummaryType})
              </h3>
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div className="bg-linear-to-br from-primary/5 to-accent/5 rounded-lg p-6 text-sm space-y-3 border border-primary/20 min-h-75">
              {currentSummary ? (
                <div className="whitespace-pre-wrap text-muted-foreground">
                  {currentSummary.content}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  No {selectedSummaryType} summary available
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={handleCopy}
                variant="outline"
                className="flex-1 gap-2"
                disabled={!currentSummary}
              >
                <Copy className="w-4 h-4" />
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex-1 gap-2"
                disabled={!currentSummary}
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}