"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Briefcase, Calendar, Clock, Loader2, Plus, ExternalLink, AlertCircle } from "lucide-react"
import AppLayout from "@/components/layout/AppLayout"
import { jobsApi } from "@/services/api"
import toast from "react-hot-toast"

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  saved: { label: "Saved", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  applied: { label: "Applied", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  assessment: { label: "Assessment", color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  technical_interview: { label: "Technical Interview", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  hr_interview: { label: "HR Interview", color: "bg-pink-500/10 text-pink-600 border-pink-500/20" },
  selected: { label: "Selected", color: "bg-green-500/10 text-green-600 border-green-500/20" },
  rejected: { label: "Rejected", color: "bg-red-500/10 text-red-600 border-red-500/20" },
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = () => {
    setIsLoading(true)
    jobsApi
      .getApplications()
      .then(setApplications)
      .catch(() => {
        toast.error("Could not load applications")
      })
      .finally(() => setIsLoading(false))
  }

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      await jobsApi.updateApplication(appId, { status: newStatus })
      toast.success("Application updated!")
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      )
    } catch {
      toast.error("Failed to update status")
    }
  }

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Job Applications Tracker</h1>
            <p className="text-muted-foreground text-sm">
              Track your internship and full-time job pipeline from application to offer
            </p>
          </div>
          <Link
            href="/jobs"
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all"
          >
            <Plus className="w-4 h-4" /> Browse Jobs
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-base mb-1">No Applications Tracked Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Browse the AI-matched job board and click &ldquo;Save to Applications&rdquo; to start tracking.
            </p>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90"
            >
              Explore Job Board →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {applications.map((app) => {
              const statusMeta = STATUS_LABELS[app.status] || STATUS_LABELS.saved
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between hover:border-primary/40 transition-all shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${statusMeta.color}`}
                      >
                        {statusMeta.label}
                      </span>
                    </div>

                    <h3 className="font-bold text-base mb-0.5">{app.job?.title || "Job Application"}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{app.job?.company || "Company"}</p>

                    {app.deadline && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
                        <Calendar className="w-3.5 h-3.5" /> Deadline: {app.deadline}
                      </p>
                    )}
                    {app.applied_date && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
                        <Clock className="w-3.5 h-3.5" /> Applied: {app.applied_date}
                      </p>
                    )}
                    {app.notes && (
                      <p className="text-xs bg-muted/50 p-2.5 rounded-lg text-muted-foreground mt-2">
                        {app.notes}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/60">
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      Update Stage
                    </label>
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="saved">Saved</option>
                      <option value="applied">Applied</option>
                      <option value="assessment">Assessment</option>
                      <option value="technical_interview">Technical Interview</option>
                      <option value="hr_interview">HR Interview</option>
                      <option value="selected">Selected</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
