"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Briefcase, MapPin, Clock, Sparkles, Loader2, Plus, CheckCircle2, AlertCircle } from "lucide-react"
import AppLayout from "@/components/layout/AppLayout"
import { jobsApi } from "@/services/api"
import { Job } from "@/types"
import toast from "react-hot-toast"

const STATUS_COLORS: Record<string, string> = {
  saved: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  applied: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  assessment: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  technical_interview: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  hr_interview: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  selected: "bg-green-500/10 text-green-600 border-green-500/20",
  rejected: "bg-red-500/10 text-red-600 border-red-500/20",
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [applying, setApplying] = useState<string | null>(null)

  useEffect(() => {
    jobsApi.list()
      .then(setJobs)
      .catch(() => {
        toast.error("Could not load jobs. Backend may be offline.")
        setJobs(DEMO_JOBS)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const applyJob = async (jobId: string) => {
    setApplying(jobId)
    try {
      await jobsApi.createApplication({ job_id: jobId, status: "saved" })
      toast.success("Job saved to your applications!")
    } catch (err: any) {
      if (err?.response?.status === 409) {
        toast("Already tracking this job")
      } else {
        toast.error("Failed to save application")
      }
    } finally {
      setApplying(null)
    }
  }

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Job Board</h1>
            <p className="text-muted-foreground text-sm">
              AI-matched job opportunities based on your profile
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-500/5 border border-yellow-500/20 rounded-lg px-3 py-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            Demo data — not real job listings
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job List */}
          <div className="lg:col-span-2 space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              jobs.map((job, i) => (
                <motion.div
                  key={job.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedJob(job)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all hover:shadow-md ${
                    selectedJob?.id === job.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap">
                        <h3 className="font-semibold text-base">{job.title}</h3>
                        {job.is_demo && (
                          <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full border border-border">
                            Demo
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{job.company}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />{job.job_type}
                        </span>
                        {job.salary_range && <span>{job.salary_range}</span>}
                      </div>
                    </div>

                    {job.match_score != null && (
                      <div className={`text-center shrink-0 px-3 py-1.5 rounded-xl ${
                        job.match_score >= 70 ? "bg-green-500/10 border border-green-500/20" :
                        job.match_score >= 40 ? "bg-yellow-500/10 border border-yellow-500/20" :
                        "bg-red-500/10 border border-red-500/20"
                      }`}>
                        <p className={`text-lg font-bold ${
                          job.match_score >= 70 ? "text-green-600" :
                          job.match_score >= 40 ? "text-yellow-600" : "text-red-600"
                        }`}>{job.match_score}%</p>
                        <p className="text-[10px] text-muted-foreground">match</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {job.required_skills?.slice(0, 5).map((skill: string) => (
                      <span key={skill} className="px-2 py-0.5 rounded-full text-[11px] bg-muted text-muted-foreground border border-border">
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Job Detail */}
          <div className="lg:col-span-1">
            {selectedJob ? (
              <motion.div
                key={selectedJob.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="sticky top-6 p-5 rounded-2xl bg-card border border-border space-y-4"
              >
                <div>
                  <h2 className="font-bold text-lg">{selectedJob.title}</h2>
                  <p className="text-muted-foreground">{selectedJob.company}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />{selectedJob.location}
                    <span>•</span>
                    <span className="capitalize">{selectedJob.job_type}</span>
                  </div>
                </div>

                {selectedJob.match_score != null && (
                  <div className="p-3 rounded-xl bg-muted/50 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">AI Match Score</p>
                    <p className="text-2xl font-bold text-primary">{selectedJob.match_score}%</p>
                    <p className="text-[10px] text-muted-foreground">AI-estimated based on your skills</p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.required_skills?.map((s: string) => (
                      <span key={s} className="px-2.5 py-1 rounded-full text-xs bg-muted border border-border">{s}</span>
                    ))}
                  </div>
                </div>

                {selectedJob.salary_range && (
                  <p className="text-sm"><span className="text-muted-foreground">Salary: </span>{selectedJob.salary_range}</p>
                )}

                <div className="space-y-2">
                  <button
                    onClick={() => applyJob(selectedJob.id)}
                    disabled={applying === selectedJob.id}
                    className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {applying === selectedJob.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Save Application
                  </button>
                  <button
                    onClick={() => {
                      window.open(`/ai-assistant?mode=career&prompt=Prepare me for ${selectedJob.title} at ${selectedJob.company}`, "_blank")
                    }}
                    className="w-full py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-primary" />
                    Prepare for This Role
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="sticky top-6 p-8 rounded-2xl bg-card border border-border text-center">
                <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Select a job to see details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

// Fallback demo data when backend is offline
const DEMO_JOBS = [
  {
    id: "demo-1",
    title: "Software Engineer Intern",
    company: "Tech Startup (Demo)",
    location: "Bangalore, India",
    job_type: "internship",
    required_skills: ["Python", "JavaScript", "SQL", "Git"],
    salary_range: "₹20K-35K/month",
    match_score: 82,
    is_demo: true,
  },
  {
    id: "demo-2",
    title: "AI/ML Engineer Intern",
    company: "AI Research Lab (Demo)",
    location: "Remote",
    job_type: "internship",
    required_skills: ["Python", "Machine Learning", "TensorFlow"],
    salary_range: "₹25K-40K/month",
    match_score: 74,
    is_demo: true,
  },
]
