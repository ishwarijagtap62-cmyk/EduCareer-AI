"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    q: "Is EduCareer AI a simple chatbot?",
    a: "No. It's a multi-agent AI platform. The AI Orchestrator detects your intent and routes your request to a specialized agent — Academic, Coding, Career, Resume, Interview, or others. For complex tasks, multiple agents collaborate.",
  },
  {
    q: "Does it really understand my documents?",
    a: "Yes. Upload your PDFs, notes, or syllabus. We extract the text, chunk it, create embeddings using ChromaDB, and retrieve relevant sections when you ask questions. Answers are grounded in your actual uploaded content.",
  },
  {
    q: "How accurate are the placement readiness scores?",
    a: "All scores are clearly labeled as AI-estimated. They are based on your profile, skills, projects, and assessment performance. We never claim guaranteed placement outcomes — scores are directional guidance, not guarantees.",
  },
  {
    q: "Which AI model does EduCareer AI use?",
    a: "EduCareer AI uses Groq's API with Llama 3.3 70B Versatile for fast, high-quality responses. Your GROQ_API_KEY is used only on the backend and never exposed to the frontend.",
  },
  {
    q: "Can I practice mock interviews?",
    a: "Yes. The Interview Agent conducts adaptive mock interviews (Technical, HR, Behavioral, Coding, Role-specific). Questions adapt based on your previous answers. You get a score, strengths/weaknesses analysis, and an improvement plan at the end.",
  },
  {
    q: "Does the AI remember my previous conversations?",
    a: "Yes. EduCareer AI maintains both conversation context (within a session) and persistent student memory (across sessions). It remembers your target career, weak subjects, skills, and past performance to give personalized advice.",
  },
  {
    q: "Is there a free plan?",
    a: "EduCareer AI is currently in development preview. Core features are available for students to use. You'll need a Groq API key (free tier available at console.groq.com) to use AI features.",
  },
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-24">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">FAQ</p>
          <h2 className="text-4xl font-bold">Frequently asked questions</h2>
        </motion.div>

        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted/30 transition-colors"
                aria-expanded={openIndex === i}
              >
                <span className="font-medium text-base pr-4">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-4 text-muted-foreground text-sm leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
