"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import {
  getCompanyStatus,
  getDocuments,
  deleteDocument,
  uploadDocument,
  uploadUrl,
  getVoiceSettings,
  updateVoiceSettings,
  ensureCompany,
  type Document,
  type CompanyStats,
  type VoiceSettings,
} from "@/lib/ragApi";

export default function KnowledgePage() {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  // Company ID state
  const [companyId, setCompanyId] = useState<string>("");

  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingVoice, setSavingVoice] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Voice settings form
  const [voiceForm, setVoiceForm] = useState({
    voice_guidelines: "",
    brand_tone: "",
    positioning: "",
  });

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-in");
    }
  }, [isLoaded, userId, router]);

  // Auto-create company for user
  useEffect(() => {
    if (userId) {
      initializeCompany();
    }
  }, [userId]);

  const initializeCompany = async () => {
    try {
      const result = await ensureCompany(user?.firstName ? `${user.firstName}'s Company` : undefined);
      setCompanyId(result.company_id);
      
      // Store in localStorage for extension access
      localStorage.setItem('companyId', result.company_id);
      
      console.log(`✅ Company ${result.existed ? 'loaded' : 'created'}: ${result.company_id}`);
    } catch (error) {
      console.error('Failed to initialize company:', error);
      setMessage({
        type: 'error',
        text: 'Failed to initialize company. Please refresh the page.',
      });
    }
  };

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  const loadData = async () => {
    if (!companyId) return;

    setLoading(true);
    try {
      const [statsResult, docsResult, voiceResult] = await Promise.all([
        getCompanyStatus(companyId),
        getDocuments(companyId),
        getVoiceSettings(companyId),
      ]);

      setStats(statsResult);
      setDocuments(docsResult.documents);
      setVoiceSettings(voiceResult.voice_settings);

      // Populate voice form
      if (voiceResult.voice_settings) {
        setVoiceForm({
          voice_guidelines: voiceResult.voice_settings.voice_guidelines || "",
          brand_tone: voiceResult.voice_settings.brand_tone || "",
          positioning: voiceResult.voice_settings.positioning || "",
        });
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      setMessage({
        type: "error",
        text: "Failed to load company knowledge data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const validExtensions = [".pdf", ".docx", ".txt", ".md"];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    
    if (!validExtensions.includes(fileExtension)) {
      setMessage({
        type: "error",
        text: "Invalid file type. Please upload PDF, DOCX, TXT, or MD files.",
      });
      e.target.value = "";
      return;
    }

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: "File too large. Maximum size is 50MB.",
      });
      e.target.value = "";
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      await uploadDocument(companyId, file);
      setMessage({
        type: "success",
        text: `✅ ${file.name} uploaded! Processing in background...`,
      });
      setTimeout(() => loadData(), 2000); // Reload after 2 seconds
    } catch (error) {
      setMessage({
        type: "error",
        text: `❌ Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleUrlUpload = async () => {
    if (!urlInput.trim()) {
      setMessage({ type: "error", text: "Please enter a URL" });
      return;
    }

    // Basic URL validation
    try {
      new URL(urlInput);
    } catch {
      setMessage({ type: "error", text: "Invalid URL format" });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      await uploadUrl(companyId, urlInput);
      setMessage({
        type: "success",
        text: `✅ URL added! Processing in background...`,
      });
      setUrlInput("");
      setTimeout(() => loadData(), 2000);
    } catch (error) {
      setMessage({
        type: "error",
        text: `❌ Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document and all its chunks?")) {
      return;
    }

    try {
      await deleteDocument(companyId, documentId);
      setMessage({ type: "success", text: "✅ Document deleted" });
      loadData();
    } catch (error) {
      setMessage({
        type: "error",
        text: `❌ Delete failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  };

  const handleSaveVoice = async () => {
    setSavingVoice(true);
    setMessage(null);

    try {
      await updateVoiceSettings(companyId, voiceForm);
      setMessage({ type: "success", text: "✅ Voice settings saved!" });
      loadData();
    } catch (error) {
      setMessage({
        type: "error",
        text: `❌ Save failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setSavingVoice(false);
    }
  };

  const getStatusBadgeColor = (status: Document["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading company knowledge...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <nav className="border-b border-border/30 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/image.png" alt="Logo" width={32} height={32} />
              <span className="text-xl md:text-2xl font-bold font-grotesk">
                ReplyDash
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-sm hover:text-primary transition"
              >
                Dashboard
              </Link>
              <span className="text-sm font-medium">
                <a
                  href="https://elcara.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition"
                >
                  by Elcara
                </a>
              </span>
              <UserButton
                appearance={{
                  elements: {
                    rootBox: "text-slate-200",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-grotesk mb-3 leading-tight">
              Company Knowledge 🧠
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Upload documents to generate contextual, on-brand replies
            </p>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 border ${
                message.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-red-50 border-red-200 text-red-900"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-6 border border-border bg-card">
              <div className="text-3xl md:text-4xl font-bold font-grotesk">
                {stats?.total_documents || 0}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Documents
              </div>
            </div>
            <div className="p-6 border border-border bg-card">
              <div className="text-3xl md:text-4xl font-bold font-grotesk">
                {stats?.total_chunks || 0}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Chunks</div>
            </div>
            <div className="p-6 border border-border bg-card">
              <div className="text-3xl md:text-4xl font-bold font-grotesk">
                {stats ? Math.round(stats.total_tokens / 1000) : 0}K
              </div>
              <div className="text-sm text-muted-foreground mt-1">Tokens</div>
            </div>
            <div className="p-6 border border-border bg-card">
              <div className="text-3xl md:text-4xl font-bold font-grotesk">
                {stats ? Math.round(stats.total_storage_bytes / 1024 / 1024) : 0}MB
              </div>
              <div className="text-sm text-muted-foreground mt-1">Storage</div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            {/* Left Column: Upload & Documents */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              {/* Upload Section */}
              <div className="bg-card border border-border p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-bold font-grotesk mb-6">
                  Upload Documents
                </h2>

                {/* File Upload */}
                <div className="space-y-4 mb-6">
                  <label className="block text-sm font-bold">
                    Upload File (PDF, DOCX, TXT, MD)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt,.md"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="block w-full text-sm border border-border p-3 bg-muted disabled:opacity-50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum file size: 50MB
                  </p>
                </div>

                <div className="border-t border-border my-6"></div>

                {/* URL Upload */}
                <div className="space-y-4">
                  <label className="block text-sm font-bold">Add from URL</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com/documentation"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      disabled={uploading}
                      className="flex-1 border border-border p-3 bg-muted disabled:opacity-50"
                    />
                    <button
                      onClick={handleUrlUpload}
                      disabled={uploading || !urlInput.trim()}
                      className="px-6 py-3 bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition disabled:opacity-50"
                    >
                      {uploading ? "Adding..." : "Add"}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    We'll scrape and extract content from the URL
                  </p>
                </div>
              </div>

              {/* Documents List */}
              <div className="bg-card border border-border p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-bold font-grotesk mb-6">
                  Knowledge Base ({documents.length})
                </h2>

                {documents.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-lg mb-2">No documents uploaded yet</p>
                    <p className="text-sm">Upload your first document to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="border border-border p-4 hover:border-primary/50 transition"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="font-bold mb-1 truncate">
                              {doc.filename}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span className="uppercase font-bold">
                                {doc.file_type}
                              </span>
                              <span>•</span>
                              <span>{formatFileSize(doc.file_size)}</span>
                              <span>•</span>
                              <span>{doc.total_chunks} chunks</span>
                              <span>•</span>
                              <span
                                className={`px-2 py-1 text-xs font-bold ${getStatusBadgeColor(doc.status)}`}
                              >
                                {doc.status}
                              </span>
                            </div>
                            {doc.status === "failed" && doc.error_message && (
                              <div className="text-xs text-red-600 mt-2">
                                Error: {doc.error_message}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="px-3 py-1 text-sm border border-border hover:bg-red-50 hover:border-red-200 transition flex-shrink-0"
                            title="Delete document"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Voice Settings */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border p-6 md:p-8 sticky top-24">
                <h2 className="text-2xl md:text-3xl font-bold font-grotesk mb-4">
                  Voice Settings
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Define your company's voice for on-brand replies
                </p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Voice Guidelines
                    </label>
                    <textarea
                      value={voiceForm.voice_guidelines}
                      onChange={(e) =>
                        setVoiceForm({
                          ...voiceForm,
                          voice_guidelines: e.target.value,
                        })
                      }
                      placeholder="We are a developer-first company. Our communication is technical yet approachable..."
                      rows={6}
                      className="w-full border border-border p-3 bg-muted text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Detailed guidelines for how your company communicates
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Brand Tone
                    </label>
                    <input
                      type="text"
                      value={voiceForm.brand_tone}
                      onChange={(e) =>
                        setVoiceForm({
                          ...voiceForm,
                          brand_tone: e.target.value,
                        })
                      }
                      placeholder="Technical, friendly, helpful"
                      className="w-full border border-border p-3 bg-muted text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Overall tone and personality
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Positioning
                    </label>
                    <input
                      type="text"
                      value={voiceForm.positioning}
                      onChange={(e) =>
                        setVoiceForm({
                          ...voiceForm,
                          positioning: e.target.value,
                        })
                      }
                      placeholder="The fastest way to build APIs"
                      className="w-full border border-border p-3 bg-muted text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Your company's positioning statement
                    </p>
                  </div>

                  <button
                    onClick={handleSaveVoice}
                    disabled={savingVoice}
                    className="w-full px-6 py-3 bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/90 transition disabled:opacity-50"
                  >
                    {savingVoice ? "Saving..." : "Save Voice Settings"}
                  </button>

                  {voiceSettings && (
                    <div className="text-xs text-muted-foreground pt-4 border-t border-border">
                      Last updated:{" "}
                      {new Date(voiceSettings.updated_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-12 bg-accent/30 border border-border p-6 md:p-8">
            <h3 className="text-xl md:text-2xl font-bold font-grotesk mb-4">
              How It Works
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-3xl mb-2">📤</div>
                <div className="font-bold mb-1">1. Upload Documents</div>
                <div className="text-sm text-muted-foreground">
                  Add PDFs, docs, URLs with your company information
                </div>
              </div>
              <div>
                <div className="text-3xl mb-2">🧠</div>
                <div className="font-bold mb-1">2. AI Processes</div>
                <div className="text-sm text-muted-foreground">
                  We extract, chunk, and create embeddings automatically
                </div>
              </div>
              <div>
                <div className="text-3xl mb-2">✨</div>
                <div className="font-bold mb-1">3. Contextual Replies</div>
                <div className="text-sm text-muted-foreground">
                  Generate on-brand replies that reference your knowledge
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

