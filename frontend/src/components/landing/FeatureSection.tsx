"use client"

import { motion } from "framer-motion"
import { FileText, TrendingUp, Code2, Brain, Target, BarChart3 } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "RAG Document Intelligence",
    description: "Upload your notes, PDFs, syllabus, or question papers. Ask questions in natural language and get answers grounded in your actual documents.",
    tag: "AI + RAG",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Target,
    title: "Placement Readiness Score",
    description: "Get a transparent, AI-estimated readiness score across Resume, Technical Skills, DSA, Projects, Interview, and Communication. Clearly labeled as estimates.",
    tag: "Career Intelligence",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    icon: Code2,
    title: "Coding Agent",
    description: "Debug, explain, generate, and optimize code. Get time/space complexity analysis and test cases for Python, Java, C++, JavaScript, and SQL.",
    tag: "Coding",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: FileText,
    title: "Resume Intelligence",
    description: "Upload your resume for ATS compatibility check, keyword analysis, section scoring, and role-specific improvement suggestions.",
    tag: "Resume",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: TrendingUp,
    title: "What-If Career Simulator",
    description: "Ask 'What if I learn AWS?' and get an estimated impact on your career readiness score, newly matching roles, and a learning plan. Clearly labeled as AI estimates.",
    tag: "Career Simulation",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    icon: BarChart3,
    title: "Learning Analytics",
    description: "Track your skill growth, interview performance, coding progress, study plan completion, and application success rate over time.",
    tag: "Analytics",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function FeatureSection() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.p variants={fadeUp} className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">
            Features
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-4">
            Built for serious students
          </motion.h2>
          <motion.p variants={fadeUp} className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Every feature is connected through the AI Student Copilot — not a collection of disconnected tools.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              whileHover={{ y: -3 }}
              className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center shrink-0`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-base">{f.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
                  <span className={`inline-block mt-3 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${f.bg} ${f.color} border border-current/20`}>
                    {f.tag}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
