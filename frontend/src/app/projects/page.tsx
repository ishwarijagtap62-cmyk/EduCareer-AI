"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { FolderGit2, Sparkles, Star, ExternalLink, Code2, ArrowRight } from "lucide-react"
import AppLayout from "@/components/layout/AppLayout"

const CURATED_PROJECTS = [
  {
    title: "AI-Powered RAG Knowledge Assistant",
    domain: "AI / Full Stack",
    difficulty: "Advanced",
    description: "Build an intelligent document retrieval and question answering system using FastAPI, ChromaDB, and Groq LLMs.",
    skills: ["Python", "FastAPI", "ChromaDB", "LLMs", "Docker"],
    stars: 120,
  },
  {
    title: "Distributed Task Queue & Job Scheduler",
    domain: "Backend / Systems",
    difficulty: "Intermediate",
    description: "Create a scalable asynchronous worker pipeline utilizing Redis, Celery/Worker pools, and PostgreSQL.",
    skills: ["Python", "Redis", "PostgreSQL", "System Design"],
    stars: 95,
  },
  {
    title: "Real-time Collaborative Code Editor",
    domain: "Full Stack / WebSockets",
    difficulty: "Advanced",
    description: "Interactive browser IDE supporting real-time multi-user cursor sync, syntax highlighting, and execution sandbox.",
    skills: ["Next.js", "TypeScript", "WebSockets", "Node.js"],
    stars: 145,
  },
  {
    title: "End-to-End DevOps CI/CD Pipeline",
    domain: "DevOps / Cloud",
    difficulty: "Intermediate",
    description: "Deploy microservices automatically using GitHub Actions, Docker containers, and Kubernetes on AWS.",
    skills: ["Docker", "Kubernetes", "AWS", "GitHub Actions"],
    stars: 88,
  },
]

export default function ProjectsPage() {
  const [selectedDomain, setSelectedDomain] = useState<string>("all")

  const domains = ["all", "AI / Full Stack", "Backend / Systems", "Full Stack / WebSockets", "DevOps / Cloud"]

  const filtered = selectedDomain === "all"
    ? CURATED_PROJECTS
    : CURATED_PROJECTS.filter(p => p.domain === selectedDomain)

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FolderGit2 className="w-6 h-6 text-primary" />
              Project Recommendations Hub
            </h1>
            <p className="text-muted-foreground text-sm">
              Portfolio-worthy capstone and internship-ready projects tailored to your target career
            </p>
          </div>
          <Link
            href="/ai-assistant?mode=coding"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all"
          >
            <Sparkles className="w-4 h-4" /> Ask Project Agent
          </Link>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {domains.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDomain(d)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedDomain === d
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {d === "all" ? "All Domains" : d}
            </button>
          ))}
        </div>

        {/* Project Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((proj, i) => (
            <motion.div
              key={proj.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-6 rounded-2xl bg-card border border-border flex flex-col justify-between hover:border-primary/40 transition-all shadow-sm group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {proj.domain}
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                    {proj.difficulty}
                  </span>
                </div>

                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                  {proj.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {proj.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {proj.skills.map((s) => (
                    <span
                      key={s}
                      className="text-xs px-2.5 py-1 rounded-lg bg-secondary text-secondary-foreground border border-border font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> {proj.stars} recommendations
                </span>
                <Link
                  href={`/ai-assistant?mode=coding`}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  Generate Scaffold Guide <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
