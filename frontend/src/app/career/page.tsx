"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Target, TrendingUp, Map, Sparkles, ArrowRight,
  Loader2, AlertCircle, CheckCircle2, XCircle, MinusCircle
} from "lucide-react"
import AppLayout from "@/components/layout/AppLayout"
import { careerApi } from "@/services/api"
import { useAuthStore } from "@/stores/authStore"
import toast from "react-hot-toast"

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }
const stagger = { visible: { transition: { staggerChildren: 0.08 } } }

export default function CareerPage() {
  const [recommendations, setRecommendations] = useState<any>(null)
  const [skillGapResult, setSkillGapResult] = useState<string>("")
  const [whatIfResult, setWhatIfResult] = useState<string>("")
  const [targetRole, setTargetRole] = useState("")
  const [whatIfSkills, setWhatIfSkills] = useState("")
  const [loadingRec, setLoadingRec] = useState(true)
  const [loadingGap, setLoadingGap] = useState(false)
  const [loadingWhatIf, setLoadingWhatIf] = useState(false)
  const { user } = useAuthStore()

  useEffect(() => {
    careerApi.getRecommendations()
      .then(setRecommendations)
      .catch(() => setRecommendations(null))
      .finally(() => setLoadingRec(false))
  }, [])

  const analyzeSkillGap = async () => {
    if (!targetRole.trim()) { toast.error("Enter a target role first"); return }
    setLoadingGap(true)
    setSkillGapResult("")
    try {
      const result = await careerApi.analyzeSkillGap({ target_role: targetRole })
      setSkillGapResult(result.analysis)
    } catch {
      toast.error("Analysis failed. Check backend connection.")
    } finally {
      setLoadingGap(false)
    }
  }

  const runWhatIf = async () => {
    if (!whatIfSkills.trim()) { toast.error("Enter skills to analyze"); return }
    setLoadingWhatIf(true)
    setWhatIfResult("")
    try {
      const skills = whatIfSkills.split(",").map(s => s.trim()).filter(Boolean)
      const result = await careerApi.whatIf({ skills_to_add: skills })
      setWhatIfResult(result.simulation)
    } catch {
      toast.error("Simulation failed. Check backend connection.")
    } finally {
      setLoadingWhatIf(false)
    }
  }

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp}>
            <h1 className="text-2xl font-bold mb-1">Career Intelligence</h1>
            <p className="text-muted-foreground text-sm">
              AI-powered career analysis, skill gap insights, and personalized roadmaps
            </p>
          </motion.div>
        </motion.div>

        {/* Disclaimer */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-xs text-yellow-600 dark:text-yellow-400">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          All career recommendations and scores are AI-estimated. Not a guarantee of employment or placement.
        </div>

        {/* Quick Links */}
        <motion.div
          initial="hidden" animate="visible" variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            { href: "/career/roadmap", icon: Map, title: "Learning Roadmap", desc: "Step-by-step roadmap to your target role", color: "text-blue-500", bg: "bg-blue-500/10" },
            { href: "/career/profile", icon: Target, title: "Career Profile", desc: "Your skills, projects, and career goals", color: "text-green-500", bg: "bg-green-500/10" },
            { href: "/ai-assistant?mode=career", icon: Sparkles, title: "Ask Career AI", desc: "Chat with the Career Agent directly", color: "text-purple-500", bg: "bg-purple-500/10" },
          ].map((item) => (
            <motion.div key={item.title} variants={fadeUp}>
              <Link
                href={item.href}
                className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-0.5">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* AI Career Recommendations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="p-6 rounded-2xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-base">AI Career Recommendations</h2>
              <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">AI-Estimated</span>
            </div>

            {loadingRec ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing your profile...
              </div>
            ) : recommendations?.recommendations ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-sm font-sans bg-muted/40 rounded-xl p-4 leading-relaxed">
                  {recommendations.recommendations}
                </pre>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">
                  Complete your profile to get personalized career recommendations.
                </p>
                <Link href="/profile" className="text-primary text-sm hover:underline mt-2 block">
                  Complete Profile →
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Skill Gap Analysis */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="p-6 rounded-2xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-green-500" />
              <h2 className="font-semibold text-base">Skill Gap Analyzer</h2>
            </div>

            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Target role (e.g. AI/ML Engineer, Full Stack Developer)"
                className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                onKeyDown={(e) => { if (e.key === "Enter") analyzeSkillGap() }}
              />
              <button
                onClick={analyzeSkillGap}
                disabled={loadingGap}
                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
              >
                {loadingGap ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Analyze
              </button>
            </div>

            {skillGapResult && (
              <div className="bg-muted/40 rounded-xl p-4">
                <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">{skillGapResult}</pre>
              </div>
            )}
          </div>
        </motion.div>

        {/* What-If Simulator */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <h2 className="font-semibold text-base">What-If Career Simulator</h2>
              <span className="ml-auto text-xs text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">AI Estimates</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Explore how learning new skills would impact your career readiness (AI-estimated, not guaranteed).
            </p>

            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={whatIfSkills}
                onChange={(e) => setWhatIfSkills(e.target.value)}
                placeholder="Skills to learn (comma-separated: AWS, Docker, Kubernetes)"
                className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                onKeyDown={(e) => { if (e.key === "Enter") runWhatIf() }}
              />
              <button
                onClick={runWhatIf}
                disabled={loadingWhatIf}
                className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loadingWhatIf ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simulate"}
              </button>
            </div>

            {whatIfResult && (
              <div className="bg-card rounded-xl p-4 border border-purple-500/20">
                <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">{whatIfResult}</pre>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  )
}
