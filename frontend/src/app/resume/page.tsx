"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FileText, Upload, Loader2, Sparkles, AlertCircle, X, CheckCircle2 } from "lucide-react"
import AppLayout from "@/components/layout/AppLayout"
import { documentsApi, chatApi } from "@/services/api"
import toast from "react-hot-toast"

export default function ResumePage() {
  const [resumeText, setResumeText] = useState("")
  const [targetRole, setTargetRole] = useState("")
  const [analysis, setAnalysis] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedDocId, setUploadedDocId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const result = await documentsApi.upload(file, { document_type: "resume" })
      setUploadedFile(file)
      setUploadedDocId(result.id)
      toast.success("Resume uploaded and processed!")
    } catch {
      toast.error("Upload failed. Check file type (PDF, DOCX, TXT).")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }

  const analyzeResume = async () => {
    if (!resumeText.trim() && !uploadedDocId) {
      toast.error("Paste your resume text or upload a file first")
      return
    }
    setIsLoading(true)
    setAnalysis("")
    try {
      const message = `Analyze my resume${targetRole ? ` for the role of ${targetRole}` : ""}.

${resumeText ? `Resume Content:\n${resumeText}` : "I've uploaded my resume above."}`

      const result = await chatApi.sendMessage({
        message,
        mode: "resume",
        document_ids: uploadedDocId ? [uploadedDocId] : [],
      })
      setAnalysis(result.content)
    } catch {
      toast.error("Analysis failed. Make sure the backend is running.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-1">Resume Analyzer</h1>
          <p className="text-muted-foreground text-sm">
            Get AI-powered ATS analysis, improvement suggestions, and keyword optimization
          </p>
        </motion.div>

        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-xs text-yellow-600 dark:text-yellow-400">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          All scores are AI-estimated. For accurate ATS testing, use official ATS tools.
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload section */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
              <h2 className="font-semibold text-sm">Upload Resume</h2>

              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer"
                onClick={() => document.getElementById("resume-upload")?.click()}
              >
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                  }}
                />
                {isUploading ? (
                  <><Loader2 className="w-8 h-8 text-primary mx-auto mb-2 animate-spin" /><p className="text-sm text-muted-foreground">Processing...</p></>
                ) : uploadedFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                    <p className="text-sm font-medium">{uploadedFile.name}</p>
                    <button onClick={(e) => { e.stopPropagation(); setUploadedFile(null); setUploadedDocId(null) }}>
                      <X className="w-4 h-4 text-muted-foreground hover:text-red-500" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium">Drop your resume here</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, TXT (max 20MB)</p>
                  </>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs text-muted-foreground">
                  <span className="bg-card px-2">or paste text</span>
                </div>
              </div>

              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume content here..."
                rows={8}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>
          </motion.div>

          {/* Config + Analysis */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
            <div className="p-6 rounded-2xl bg-card border border-border">
              <h2 className="font-semibold text-sm mb-4">Analysis Options</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Target Role (optional)
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. AI/ML Engineer, Software Developer"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <button
                  onClick={analyzeResume}
                  disabled={isLoading || (!resumeText.trim() && !uploadedDocId)}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Analyzing...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" />Analyze Resume</>
                  )}
                </button>
              </div>
            </div>

            {analysis && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl bg-muted/30 border border-border"
              >
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm">📄 Resume Agent Analysis</h3>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">{analysis}</pre>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </AppLayout>
  )
}
