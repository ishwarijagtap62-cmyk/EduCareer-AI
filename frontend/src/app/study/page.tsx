"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { BookOpen, Calendar, Sparkles, Brain, ArrowRight, CheckCircle2 } from "lucide-react"
import AppLayout from "@/components/layout/AppLayout"
import StudyPlannerPage from "./planner/page"

export default function StudyPage() {
  const [activeTab, setActiveTab] = useState<"planner" | "tutor">("planner")

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              Study & Exam Hub
            </h1>
            <p className="text-muted-foreground text-sm">
              AI-driven study plans, subject explanations, revision notes, and exam prep
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-2">
            <Link
              href="/ai-assistant?mode=study"
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-sm font-semibold transition-all"
            >
              <Sparkles className="w-4 h-4" /> Ask Academic AI
            </Link>
          </div>
        </div>

        {/* Quick Hub Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/study/planner"
            className="p-5 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all group"
          >
            <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl w-fit mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors flex items-center justify-between">
              Study Planner
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-muted-foreground">
              Generate customizable day-by-day revision schedules for your upcoming exams.
            </p>
          </Link>

          <Link
            href="/ai-assistant?mode=study"
            className="p-5 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all group"
          >
            <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-xl w-fit mb-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors flex items-center justify-between">
              Academic Tutor
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-muted-foreground">
              Deep concept breakdowns, formula summaries, MCQs, and exam question lists.
            </p>
          </Link>

          <Link
            href="/viva"
            className="p-5 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all group"
          >
            <div className="p-2.5 bg-green-500/10 text-green-500 rounded-xl w-fit mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors flex items-center justify-between">
              Viva Prep Agent
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-muted-foreground">
              Practice rapid-fire viva voce questions with immediate AI scoring and hints.
            </p>
          </Link>
        </div>

        {/* Embedded Study Planner */}
        <div className="pt-4 border-t border-border">
          <StudyPlannerPage />
        </div>
      </div>
    </AppLayout>
  )
}
