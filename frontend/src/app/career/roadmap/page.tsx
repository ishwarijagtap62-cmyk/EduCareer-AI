"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Map, Loader2, Sparkles, ArrowRight, ChevronDown } from "lucide-react"
import AppLayout from "@/components/layout/AppLayout"
import { careerApi } from "@/services/api"
import toast from "react-hot-toast"

const POPULAR_ROLES = [
  "Software Engineer", "AI/ML Engineer", "Data Scientist",
  "Full Stack Developer", "DevOps Engineer", "Cloud Engineer",
  "Data Analyst", "Cybersecurity Analyst", "Mobile Developer",
]

export default function RoadmapPage() {
  const [targetRole, setTargetRole] = useState("")
  const [level, setLevel] = useState("beginner")
  const [roadmap, setRoadmap] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const generate = async () => {
    if (!targetRole.trim()) { toast.error("Select a target role"); return }
    setIsLoading(true)
    setRoadmap("")
    try {
      const result = await careerApi.generateRoadmap({ target_role: targetRole, current_level: level })
      setRoadmap(result.roadmap)
    } catch {
      toast.error("Failed to generate roadmap. Check backend connection.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-1">Learning Roadmap</h1>
          <p className="text-muted-foreground text-sm">
            Get a personalized, step-by-step roadmap to your target career
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-card border border-border"
        >
          <h2 className="font-semibold mb-4">Configure Your Roadmap</h2>

          {/* Popular roles */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Popular roles:</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => setTargetRole(role)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    targetRole === role
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40 hover:bg-muted"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Or type your target role..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <button
            onClick={generate}
            disabled={isLoading || !targetRole}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Generating roadmap...</>
            ) : (
              <><Sparkles className="w-4 h-4" />Generate Roadmap</>
            )}
          </button>
        </motion.div>

        {roadmap && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-card border border-border"
          >
            <div className="flex items-center gap-2 mb-4">
              <Map className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Roadmap: {targetRole}</h2>
            </div>
            <div className="bg-muted/30 rounded-xl p-5">
              <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">{roadmap}</pre>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              ℹ️ This roadmap is AI-generated based on industry standards. Timelines are estimates.
            </p>
          </motion.div>
        )}
      </div>
    </AppLayout>
  )
}
