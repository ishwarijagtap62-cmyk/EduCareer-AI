"use client"

import { motion } from "framer-motion"
import { Brain, TrendingUp, Target, Code2, BookOpen, Award } from "lucide-react"

export default function HeroDashboardPreview() {
  const skills = [
    { name: "Python", level: 85 },
    { name: "Machine Learning", level: 72 },
    { name: "SQL", level: 78 },
    { name: "Docker", level: 35 },
  ]

  return (
    <div className="relative mx-auto max-w-5xl">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-3xl -z-10" />

      <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-muted/40">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <span className="text-xs text-muted-foreground font-medium">EduCareer AI Dashboard</span>
          <div className="flex items-center gap-1.5 text-xs text-green-500">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Live
          </div>
        </div>

        <div className="grid grid-cols-12 gap-0 divide-x divide-border">
          {/* Sidebar */}
          <div className="col-span-2 p-4 space-y-1 bg-muted/20">
            {["Dashboard", "AI Chat", "Study", "Career", "Jobs", "Resume"].map(
              (item, i) => (
                <div
                  key={item}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    i === 0
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item}
                </div>
              )
            )}
          </div>

          {/* Main content */}
          <div className="col-span-10 p-5 space-y-4">
            {/* Score row */}
            <div className="grid grid-cols-3 gap-3">
              <ScoreCard
                label="Placement Readiness"
                value={78}
                color="text-blue-500"
                icon={<Target className="w-4 h-4" />}
                delay={0}
              />
              <ScoreCard
                label="Resume Score"
                value={82}
                color="text-green-500"
                icon={<Award className="w-4 h-4" />}
                delay={0.1}
              />
              <ScoreCard
                label="Interview Score"
                value={74}
                color="text-purple-500"
                icon={<Brain className="w-4 h-4" />}
                delay={0.2}
              />
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Career recommendation */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-xl border border-border bg-gradient-to-br from-blue-500/5 to-violet-500/5"
              >
                <p className="text-xs text-muted-foreground mb-1">Recommended Career</p>
                <p className="font-bold text-base mb-2">🎯 AI/ML Engineer</p>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Missing skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {["Docker", "AWS", "MLOps"].map((s) => (
                      <span key={s} className="px-1.5 py-0.5 rounded text-[10px] bg-destructive/10 text-destructive border border-destructive/20">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Skill progress */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-4 rounded-xl border border-border"
              >
                <p className="text-xs text-muted-foreground mb-3">Skill Progress</p>
                <div className="space-y-2">
                  {skills.map((skill, i) => (
                    <div key={skill.name} className="space-y-0.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-foreground font-medium">{skill.name}</span>
                        <span className="text-muted-foreground">{skill.level}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${
                            skill.level >= 70 ? "bg-green-500" : skill.level >= 50 ? "bg-yellow-500" : "bg-red-400"
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.level}%` }}
                          transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScoreCard({
  label,
  value,
  color,
  icon,
  delay,
}: {
  label: string
  value: number
  color: string
  icon: React.ReactNode
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-4 rounded-xl border border-border"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground">{label}</p>
        <span className={`${color}`}>{icon}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}%</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">AI-Estimated</p>
    </motion.div>
  )
}
