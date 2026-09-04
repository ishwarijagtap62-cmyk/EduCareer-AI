"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, Cell, PieChart, Pie
} from "recharts"
import { BarChart3, Loader2, AlertCircle } from "lucide-react"
import AppLayout from "@/components/layout/AppLayout"
import { analyticsApi } from "@/services/api"

const COLORS = ["#3b82f6", "#22c55e", "#a855f7", "#f97316", "#ec4899", "#06b6d4"]

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<any>(null)
  const [skillData, setSkillData] = useState<any>(null)
  const [interviewData, setInterviewData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("all")

  useEffect(() => {
    Promise.all([
      analyticsApi.getOverview(),
      analyticsApi.getSkillGrowth(),
      analyticsApi.getInterviewPerformance(),
    ])
      .then(([o, s, i]) => { setOverview(o); setSkillData(s); setInterviewData(i) })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    )
  }

  const scores = overview?.scores || {}
  const radarData = [
    { subject: "Resume", value: scores.resume || 0 },
    { subject: "Technical", value: scores.technical || 0 },
    { subject: "DSA", value: scores.dsa || 0 },
    { subject: "Projects", value: 85 },
    { subject: "Interview", value: scores.interview || 0 },
    { subject: "Comm", value: scores.communication || 0 },
  ]

  const skillChartData = skillData?.skills?.slice(0, 10).map((s: any) => ({
    name: s.name,
    proficiency: s.proficiency,
  })) || []

  const appStatus = overview?.applications?.by_status || {}
  const pieData = Object.entries(appStatus).map(([key, val]) => ({
    name: key.replace("_", " "),
    value: val as number,
  }))

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Analytics</h1>
            <p className="text-muted-foreground text-sm">Track your learning progress and career readiness</p>
          </div>
          <div className="flex gap-2">
            {["7d", "30d", "90d", "all"].map((r) => (
              <button key={r} onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  timeRange === r ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"
                }`}>{r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-xs text-yellow-600 dark:text-yellow-400">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          Scores are AI-estimated. Complete assessments for more accurate data.
        </div>

        {/* Summary stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Conversations", value: overview?.ai_usage?.total_conversations ?? 0, color: "text-blue-500" },
            { label: "Tasks Completed", value: `${overview?.learning?.completed_tasks ?? 0}/${overview?.learning?.total_tasks ?? 0}`, color: "text-green-500" },
            { label: "Interviews", value: overview?.interviews?.completed ?? 0, color: "text-purple-500" },
            { label: "Applications", value: overview?.applications?.total ?? 0, color: "text-orange-500" },
          ].map((stat) => (
            <div key={stat.label} className="p-5 rounded-2xl bg-card border border-border">
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Charts row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Radar Chart - Placement Readiness */}
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h3 className="font-semibold mb-4">Placement Readiness</h3>
            {radarData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                  <Tooltip formatter={(v) => [`${v}%`, "Score"]} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
                No score data yet. Complete your profile.
              </div>
            )}
            <p className="text-[10px] text-muted-foreground text-center mt-1">AI-Estimated Scores</p>
          </div>

          {/* Bar Chart - Skill Proficiency */}
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h3 className="font-semibold mb-4">Skill Proficiency</h3>
            {skillChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={skillChartData} layout="vertical" margin={{ left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => [`${v}%`, "Proficiency"]} />
                  <Bar dataKey="proficiency" radius={[0, 4, 4, 0]}>
                    {skillChartData.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
                Add skills to your profile to see proficiency data.
              </div>
            )}
          </div>
        </motion.div>

        {/* Second charts row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Interview performance */}
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h3 className="font-semibold mb-4">Interview Performance</h3>
            {interviewData?.interviews?.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={interviewData.interviews}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => [`${v}`, "Score"]} />
                  <Line type="monotone" dataKey="score" stroke="#a855f7" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                Complete mock interviews to see performance data.
              </div>
            )}
          </div>

          {/* Application pipeline */}
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h3 className="font-semibold mb-4">Application Pipeline</h3>
            {pieData.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5">
                  {pieData.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="capitalize text-muted-foreground">{item.name}</span>
                      <span className="font-semibold ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[160px] flex items-center justify-center text-muted-foreground text-sm">
                Track job applications to see pipeline data.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  )
}
