"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Target, FileText, Brain, Code2, Mic, TrendingUp,
  ArrowRight, Plus, MessageSquare, Clock, Briefcase,
  Sparkles, AlertCircle, BookOpen
} from "lucide-react"
import AppLayout from "@/components/layout/AppLayout"
import { dashboardApi } from "@/services/api"
import { useAuthStore } from "@/stores/authStore"
import { DashboardData } from "@/types"
import { formatRelativeTime, getScoreColor } from "@/lib/utils"

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}
const stagger = {
  visible: { transition: { staggerChildren: 0.07 } },
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuthStore()

  useEffect(() => {
    dashboardApi.get()
      .then(setData)
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  if (isLoading) {
    return (
      <AppLayout>
        <DashboardSkeleton />
      </AppLayout>
    )
  }

  const scores = data?.scores
  const profile = data?.profile

  const scoreCards = [
    { label: "Placement Readiness", value: scores?.placement_readiness, icon: Target, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Resume Score", value: scores?.resume_score, icon: FileText, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Technical Skills", value: scores?.technical_score, icon: Brain, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "DSA Score", value: scores?.dsa_score, icon: Code2, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Interview Score", value: scores?.interview_score, icon: Mic, color: "text-pink-500", bg: "bg-pink-500/10" },
    { label: "Communication", value: scores?.communication_score, icon: TrendingUp, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  ]

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <motion.div variants={fadeUp}>
            <h1 className="text-2xl font-bold">
              {greeting()}, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {profile?.target_career
                ? `Your goal: ${profile.target_career}`
                : "Complete your profile to get personalized recommendations"}
            </p>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Link
              href="/ai-assistant"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              <Sparkles className="w-4 h-4" />
              Ask EduCareer AI
            </Link>
          </motion.div>
        </motion.div>

        {/* Score disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-xs text-yellow-600 dark:text-yellow-400"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          All scores are AI-estimated based on your profile. Complete assessments for more accurate scores.
        </motion.div>

        {/* Score Cards */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
        >
          {scoreCards.map((card) => (
            <motion.div
              key={card.label}
              variants={fadeUp}
              className="p-4 rounded-2xl bg-card border border-border hover:shadow-md transition-shadow"
            >
              <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                <card.icon className={`w-4.5 h-4.5 w-[18px] h-[18px] ${card.color}`} />
              </div>
              <p className={`text-xl font-bold ${card.value ? getScoreColor(card.value) : "text-muted-foreground"}`}>
                {card.value ? `${card.value}%` : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{card.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Career Recommendation + Quick Actions */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        >
          {/* Career Card */}
          <motion.div
            variants={fadeUp}
            className="lg:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-violet-500/5 border border-primary/20"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                  Recommended Career
                </p>
                <h2 className="text-xl font-bold mb-1">
                  🎯 {profile?.target_career || "Complete your profile"}
                </h2>
                {profile?.target_career ? (
                  <p className="text-sm text-muted-foreground mb-4">
                    Based on your skills in {profile.skills.slice(0, 3).join(", ") || "your profile"}.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground mb-4">
                    Set your target career during onboarding to get personalized recommendations.
                  </p>
                )}

                <div className="flex gap-3">
                  <Link
                    href="/career/roadmap"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                  >
                    View Roadmap <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/career"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors"
                  >
                    Career Analysis
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={fadeUp} className="p-5 rounded-2xl bg-card border border-border">
            <h3 className="font-semibold text-sm mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted transition-colors group"
                >
                  <div className={`w-8 h-8 rounded-lg ${action.bg} flex items-center justify-center shrink-0`}>
                    <action.icon className={`w-4 h-4 ${action.color}`} />
                  </div>
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">
                    {action.label}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom row */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        >
          {/* Recent Conversations */}
          <motion.div variants={fadeUp} className="p-5 rounded-2xl bg-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Recent Conversations</h3>
              <Link href="/ai-assistant" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            {data?.recent_conversations?.length ? (
              <div className="space-y-2">
                {data.recent_conversations.slice(0, 4).map((conv) => (
                  <Link
                    key={conv.id}
                    href={`/ai-assistant?conv=${conv.id}`}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-muted transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{conv.title}</p>
                      <p className="text-[11px] text-muted-foreground">{formatRelativeTime(conv.updated_at)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No conversations yet</p>
                <Link href="/ai-assistant" className="text-xs text-primary hover:underline mt-1 block">
                  Start chatting →
                </Link>
              </div>
            )}
          </motion.div>

          {/* Upcoming Tasks */}
          <motion.div variants={fadeUp} className="p-5 rounded-2xl bg-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Upcoming Tasks</h3>
              <Link href="/study" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            {data?.upcoming_tasks?.length ? (
              <div className="space-y-2">
                {data.upcoming_tasks.slice(0, 4).map((task) => (
                  <div key={task.id} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-muted/50">
                    <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium">{task.title}</p>
                      {task.scheduled_date && (
                        <p className="text-[11px] text-muted-foreground">{task.scheduled_date}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No upcoming tasks</p>
                <Link href="/study/planner" className="text-xs text-primary hover:underline mt-1 block">
                  Create study plan →
                </Link>
              </div>
            )}
          </motion.div>

          {/* Applications */}
          <motion.div variants={fadeUp} className="p-5 rounded-2xl bg-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Applications</h3>
              <Link href="/applications" className="text-xs text-primary hover:underline">Track all</Link>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{data?.applications?.total ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Total applications</p>
                </div>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Active</span>
                <span className="font-semibold">{data?.applications?.active ?? 0}</span>
              </div>
              <Link
                href="/jobs"
                className="block text-center text-xs text-primary border border-primary/20 rounded-lg py-2 hover:bg-primary/5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 inline mr-1" />
                Find New Jobs
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </AppLayout>
  )
}

const quickActions = [
  { label: "Solve My Problem", href: "/ai-assistant?mode=solve", icon: Sparkles, color: "text-primary", bg: "bg-primary/10" },
  { label: "Practice Coding", href: "/coding", icon: Code2, color: "text-green-500", bg: "bg-green-500/10" },
  { label: "Mock Interview", href: "/interview", icon: Mic, color: "text-purple-500", bg: "bg-purple-500/10" },
  { label: "Analyze Resume", href: "/resume", icon: FileText, color: "text-orange-500", bg: "bg-orange-500/10" },
  { label: "Study Planner", href: "/study/planner", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
]

function DashboardSkeleton() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
      <div className="h-8 bg-muted rounded-xl w-64" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 bg-muted rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-40 bg-muted rounded-2xl" />
        <div className="h-40 bg-muted rounded-2xl" />
      </div>
    </div>
  )
}
