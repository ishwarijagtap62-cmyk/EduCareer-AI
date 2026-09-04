"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Brain, Zap, Target, FileText, Code2, BookOpen,
  MessageSquare, TrendingUp, Award, ChevronRight,
  Sparkles, Users, BarChart3, CheckCircle2, ArrowRight,
  GraduationCap, Briefcase, Star, Shield
} from "lucide-react"
import Navbar from "./Navbar"
import HeroDashboardPreview from "./HeroDashboardPreview"
import AgentCard from "./AgentCard"
import FeatureSection from "./FeatureSection"
import FAQSection from "./FAQSection"
import Footer from "./Footer"

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
}

export default function LandingPage() {
  const featuresRef = useRef<HTMLDivElement>(null)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-28 lg:pb-32">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-violet-500/8 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            className="flex flex-col items-center text-center mb-16"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            {/* Badge */}
            <motion.div variants={fadeUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-primary/20 bg-primary/5 text-primary">
                <Sparkles className="w-4 h-4" />
                AI-Powered Student Platform
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mb-6 leading-tight"
            >
              Your{" "}
              <span className="gradient-text">AI-Powered</span>{" "}
              Student & Career Companion
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeUp}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed"
            >
              Learn smarter. Solve problems faster. Build skills. Get placement-ready.{" "}
              <span className="font-medium text-foreground">One AI agent</span> for all your student needs.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold text-base hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
              >
                Start Learning Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/ai-assistant"
                className="inline-flex items-center gap-2 px-8 py-3.5 border border-border bg-card text-foreground rounded-xl font-semibold text-base hover:bg-muted transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Try AI Assistant
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-muted-foreground"
            >
              {["11 Specialized Agents", "Multi-Agent AI", "RAG Document Intelligence", "Placement Readiness"].map(
                (item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    {item}
                  </span>
                )
              )}
            </motion.div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <HeroDashboardPreview />
          </motion.div>
        </div>
      </section>

      {/* WHY EDUCAREER AI */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">
              Why EduCareer AI?
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-4">
              Everything a student needs, in one place
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From solving doubts to getting placed — our AI orchestrator routes every request
              to the right specialized agent.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            {whyCards.map((card) => (
              <motion.div
                key={card.title}
                variants={fadeUp}
                className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg hover:border-primary/20 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center mb-4`}>
                  <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{card.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{card.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* AI STUDENT COPILOT */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.p variants={fadeUp} className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">
                AI Student Copilot
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-6">
                Chat like ChatGPT,<br />
                <span className="gradient-text">built for students</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Ask anything — the AI automatically detects whether you need academic help,
                career guidance, resume analysis, or interview prep, and routes to the right agent.
              </motion.p>
              <motion.ul variants={stagger} className="space-y-4">
                {copilotFeatures.map((f) => (
                  <motion.li key={f} variants={fadeUp} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-foreground">{f}</span>
                  </motion.li>
                ))}
              </motion.ul>
              <motion.div variants={fadeUp} className="mt-8">
                <Link
                  href="/ai-assistant"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                >
                  Try the AI Copilot
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </motion.div>

            {/* Chat preview */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <ChatPreviewCard />
            </motion.div>
          </div>
        </div>
      </section>

      {/* SPECIALIZED AGENTS */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">
              Specialized AI Agents
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-4">
              11 agents, each an expert in their domain
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg max-w-2xl mx-auto">
              The AI Orchestrator intelligently routes your request to the most suitable agent — or chains multiple agents for complex tasks.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            {agents.map((agent) => (
              <AgentCard key={agent.name} agent={agent} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">
              How It Works
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-4">
              From question to answer in seconds
            </motion.h2>
          </motion.div>

          <motion.div
            className="relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((step, i) => (
                <motion.div key={step.title} variants={fadeUp} className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 relative">
                    <step.icon className="w-7 h-7 text-primary" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <FeatureSection />

      {/* FAQ */}
      <FAQSection />

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to transform your<br />
              <span className="gradient-text">student journey?</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-xl mb-10 max-w-2xl mx-auto">
              Join thousands of students using EduCareer AI to learn smarter, build skills, and get placement-ready.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors shadow-xl shadow-primary/25"
              >
                Get Started — It&apos;s Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 border border-border bg-card rounded-xl font-bold text-lg hover:bg-muted transition-colors"
              >
                Sign In
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

// ---- Data ----

const whyCards = [
  {
    icon: Brain,
    title: "Multi-Agent AI",
    description: "11 specialized agents work together to solve any student problem — from academics to placement.",
    bgColor: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: Target,
    title: "Personalized for You",
    description: "The AI remembers your goals, skills, and progress to give advice tailored specifically to you.",
    bgColor: "bg-purple-500/10",
    iconColor: "text-purple-500",
  },
  {
    icon: FileText,
    title: "Document Intelligence",
    description: "Upload your notes, syllabus, or resume. The AI reads and answers questions based on your actual documents.",
    bgColor: "bg-green-500/10",
    iconColor: "text-green-500",
  },
  {
    icon: TrendingUp,
    title: "Career Intelligence",
    description: "Get placement readiness scores, skill gap analysis, job matching, and personalized career roadmaps.",
    bgColor: "bg-orange-500/10",
    iconColor: "text-orange-500",
  },
]

const copilotFeatures = [
  "Understands context across the entire conversation",
  "Auto-detects intent — no need to select a mode",
  "Streaming responses with typing animation",
  "Code syntax highlighting and copy buttons",
  "Upload documents and ask questions about them",
  "Full conversation history with search",
  "Shows which AI agent handled your request",
]

const agents = [
  { name: "Academic Agent", emoji: "🧠", description: "Subject explanations, MCQs, exam prep, notes", color: "blue" },
  { name: "Coding Agent", emoji: "💻", description: "Debug code, explain, generate, complexity analysis", color: "green" },
  { name: "Career Agent", emoji: "🎯", description: "Career paths, roadmap, role guidance", color: "purple" },
  { name: "Resume Agent", emoji: "📄", description: "ATS check, improvements, bullet points", color: "orange" },
  { name: "Skill Gap Agent", emoji: "📊", description: "Compare your skills vs target job requirements", color: "pink" },
  { name: "Job Matching Agent", emoji: "💼", description: "Match score, why recommended, missing skills", color: "cyan" },
  { name: "Interview Agent", emoji: "🎤", description: "Mock interviews, scoring, improvement plan", color: "yellow" },
  { name: "Viva Agent", emoji: "📚", description: "Interactive viva, topic-wise scoring", color: "red" },
  { name: "Study Planner", emoji: "📅", description: "Daily/weekly plans, exam schedules", color: "indigo" },
  { name: "Project Agent", emoji: "🚀", description: "Project recommendations based on your goals", color: "teal" },
  { name: "General Agent", emoji: "🤖", description: "General questions, guidance, daily help", color: "gray" },
]

const howItWorks = [
  {
    icon: MessageSquare,
    title: "Ask Anything",
    description: "Type your question in natural language — academic, coding, career, or anything else.",
  },
  {
    icon: Brain,
    title: "AI Understands Intent",
    description: "The orchestrator detects your intent and selects the most relevant specialized agent.",
  },
  {
    icon: Zap,
    title: "Agent Executes",
    description: "The agent processes your request, uses relevant tools, and accesses your profile/documents.",
  },
  {
    icon: Target,
    title: "Personalized Response",
    description: "Get a tailored, high-quality response with your student memory updated for future interactions.",
  },
]

// Chat preview component
function ChatPreviewCard() {
  const messages = [
    { role: "user", content: "Explain database normalization simply." },
    {
      role: "assistant",
      agent: "🧠 Academic Agent",
      content:
        "**Database Normalization** is the process of organizing a database to reduce redundancy and improve data integrity.\n\n**Key Normal Forms:**\n- **1NF**: Atomic values, no repeating groups\n- **2NF**: No partial dependencies\n- **3NF**: No transitive dependencies",
    },
    { role: "user", content: "Give me 3 exam questions about 2NF." },
  ]

  return (
    <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <span className="text-sm font-medium text-muted-foreground mx-auto">EduCareer AI</span>
      </div>

      {/* Messages */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="space-y-1 max-w-[85%]">
                <span className="text-xs text-primary font-medium">{(msg as any).agent}</span>
                <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3 text-sm text-foreground leading-relaxed">
                  <div className="whitespace-pre-line">{msg.content}</div>
                </div>
              </div>
            )}
            {msg.role === "user" && (
              <div className="rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-3 text-sm max-w-[85%]">
                {msg.content}
              </div>
            )}
          </div>
        ))}
        {/* Typing indicator */}
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
            <div className="flex gap-1.5 items-center h-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Input bar */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-muted-foreground text-sm">
          <span className="flex-1">Ask anything...</span>
        </div>
      </div>
    </div>
  )
}
