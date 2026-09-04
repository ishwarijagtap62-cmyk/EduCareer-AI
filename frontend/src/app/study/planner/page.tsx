"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, Plus, Loader2, CheckCircle2, Clock, Calendar, Sparkles } from "lucide-react"
import AppLayout from "@/components/layout/AppLayout"
import { studyApi } from "@/services/api"
import toast from "react-hot-toast"

const SUBJECTS = ["DBMS", "Operating Systems", "Computer Networks", "DSA",
  "Machine Learning", "Web Development", "Software Engineering", "Java", "Python", "C++"]

export default function StudyPlannerPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState("")

  const [form, setForm] = useState({
    subject: "", exam_date: "", available_hours: "2",
    current_knowledge: "intermediate", target_score: "70",
  })

  useEffect(() => {
    studyApi.getPlans()
      .then(setPlans)
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const createPlan = async () => {
    if (!form.subject) { toast.error("Select a subject"); return }
    setIsCreating(true)
    setGeneratedPlan("")
    try {
      const result = await studyApi.createPlan({
        subject: form.subject,
        exam_date: form.exam_date || undefined,
        available_hours_per_day: parseFloat(form.available_hours),
        current_knowledge: form.current_knowledge,
        target_score: form.target_score ? parseFloat(form.target_score) : undefined,
      })
      setGeneratedPlan(result.ai_plan)
      setPlans((prev) => [result, ...prev])
      toast.success(`Study plan for ${form.subject} created!`)
      setShowCreate(false)
    } catch {
      toast.error("Failed to create plan. Check backend.")
    } finally {
      setIsCreating(false)
    }
  }

  const loadPlan = async (planId: string) => {
    try {
      const detail = await studyApi.getPlan(planId)
      setSelectedPlan(detail)
    } catch {
      toast.error("Failed to load plan")
    }
  }

  const markTask = async (taskId: string, status: string) => {
    try {
      await studyApi.updateTask(taskId, status)
      if (selectedPlan) {
        setSelectedPlan((prev: any) => ({
          ...prev,
          tasks: prev.tasks.map((t: any) =>
            t.id === taskId ? { ...t, status } : t
          ),
        }))
      }
      if (status === "completed") toast.success("Task marked complete!")
    } catch {
      toast.error("Failed to update task")
    }
  }

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Study Planner</h1>
            <p className="text-muted-foreground text-sm">AI-generated personalized study plans</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90">
            <Plus className="w-4 h-4" />New Plan
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plans list */}
          <div className="space-y-3">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Your Plans</h2>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : plans.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-2xl">
                <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No study plans yet</p>
                <button onClick={() => setShowCreate(true)} className="text-primary text-sm hover:underline mt-1">
                  Create your first plan →
                </button>
              </div>
            ) : (
              plans.map((plan) => (
                <div key={plan.id} onClick={() => loadPlan(plan.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedPlan?.id === plan.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"
                  }`}>
                  <p className="font-semibold text-sm">{plan.subject}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden mr-3">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${plan.progress || 0}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{plan.progress || 0}%</span>
                  </div>
                  {plan.exam_date && (
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />{plan.exam_date}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Plan detail */}
          <div className="lg:col-span-2">
            {selectedPlan ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="p-5 rounded-2xl bg-card border border-border">
                  <h2 className="font-bold text-lg mb-1">{selectedPlan.subject}</h2>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">Progress: {selectedPlan.progress}%</span>
                    {selectedPlan.exam_date && (
                      <span className="text-sm text-muted-foreground">Exam: {selectedPlan.exam_date}</span>
                    )}
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${selectedPlan.progress}%` }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Tasks</h3>
                  {selectedPlan.tasks?.map((task: any) => (
                    <div key={task.id}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border transition-colors ${
                        task.status === "completed" ? "border-green-500/20 bg-green-500/5" : "border-border bg-card"
                      }`}>
                      <button onClick={() => markTask(task.id, task.status === "completed" ? "pending" : "completed")}>
                        <CheckCircle2 className={`w-5 h-5 ${task.status === "completed" ? "text-green-500" : "text-muted-foreground"}`} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                          {task.title}
                        </p>
                        {task.date && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />{task.date}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />{task.hours}h
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : generatedPlan ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-6 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold">AI-Generated Study Plan</h3>
                </div>
                <div className="bg-muted/30 rounded-xl p-4">
                  <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">{generatedPlan}</pre>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-64 border border-dashed border-border rounded-2xl text-center">
                <div>
                  <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Select a plan or create a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create plan modal */}
        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false) }}>
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <h2 className="font-bold text-lg mb-5">Create Study Plan</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Subject</label>
                    <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option value="">Select subject...</option>
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Exam Date</label>
                      <input type="date" value={form.exam_date} onChange={(e) => setForm({ ...form, exam_date: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Hours/Day</label>
                      <input type="number" min="0.5" max="12" step="0.5" value={form.available_hours}
                        onChange={(e) => setForm({ ...form, available_hours: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Current Level</label>
                      <select value={form.current_knowledge} onChange={(e) => setForm({ ...form, current_knowledge: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Target Score (%)</label>
                      <input type="number" min="50" max="100" value={form.target_score}
                        onChange={(e) => setForm({ ...form, target_score: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted">Cancel</button>
                  <button onClick={createPlan} disabled={isCreating || !form.subject}
                    className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                    {isCreating ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</> : <><Sparkles className="w-4 h-4" />Generate</>}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  )
}
