"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, Send, Loader2, RotateCcw, CheckCircle2 } from "lucide-react"
import AppLayout from "@/components/layout/AppLayout"
import { interviewApi } from "@/services/api"
import toast from "react-hot-toast"

const INTERVIEW_TYPES = [
  { value: "technical", label: "Technical", icon: "💻", desc: "DSA, CS fundamentals, system design" },
  { value: "hr", label: "HR", icon: "👥", desc: "Motivation, teamwork, career goals" },
  { value: "behavioral", label: "Behavioral", icon: "🎯", desc: "STAR method, situational questions" },
  { value: "coding", label: "Coding", icon: "⌨️", desc: "Live coding problems" },
  { value: "role_specific", label: "Role Specific", icon: "🏢", desc: "Questions for your target role" },
]

const ROLES = [
  "Software Engineer", "AI/ML Engineer", "Data Scientist",
  "Full Stack Developer", "DevOps Engineer", "Product Manager",
]

export default function InterviewPage() {
  const [phase, setPhase] = useState<"setup" | "interview" | "complete">("setup")
  const [interviewType, setInterviewType] = useState("technical")
  const [targetRole, setTargetRole] = useState("")
  const [interviewId, setInterviewId] = useState<string | null>(null)
  const [messages, setMessages] = useState<{ role: "ai" | "user"; content: string }[]>([])
  const [answer, setAnswer] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [questionNumber, setQuestionNumber] = useState(0)

  const startInterview = async () => {
    setIsLoading(true)
    try {
      const result = await interviewApi.start({
        interview_type: interviewType,
        target_role: targetRole || undefined,
      })
      setInterviewId(result.interview_id)
      setMessages([{ role: "ai", content: result.content }])
      setQuestionNumber(1)
      setPhase("interview")
    } catch {
      toast.error("Failed to start interview. Check backend connection.")
    } finally {
      setIsLoading(false)
    }
  }

  const submitAnswer = async () => {
    if (!answer.trim() || !interviewId) return
    const myAnswer = answer.trim()
    setAnswer("")
    setMessages((prev) => [...prev, { role: "user", content: myAnswer }])
    setIsLoading(true)

    try {
      const result = await interviewApi.answer(interviewId, myAnswer)
      setMessages((prev) => [...prev, { role: "ai", content: result.content }])
      if (result.is_complete) {
        setPhase("complete")
      } else {
        setQuestionNumber(result.question_number)
      }
    } catch {
      toast.error("Failed to submit answer.")
      setMessages((prev) => [...prev, { role: "ai", content: "Sorry, I had trouble processing that. Please try again." }])
    } finally {
      setIsLoading(false)
    }
  }

  const reset = () => {
    setPhase("setup")
    setInterviewId(null)
    setMessages([])
    setAnswer("")
    setQuestionNumber(0)
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full p-6 lg:p-8 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Mock Interview</h1>
          <p className="text-muted-foreground text-sm">
            Practice with an AI interviewer that adapts to your answers
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {phase === "setup" && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-5"
            >
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-semibold mb-4">Interview Type</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {INTERVIEW_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setInterviewType(type.value)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        interviewType === type.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/40 hover:bg-muted"
                      }`}
                    >
                      <div className="text-2xl mb-1">{type.icon}</div>
                      <p className="font-semibold text-sm">{type.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{type.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-semibold mb-3">Target Role (Optional)</h2>
                <div className="flex flex-wrap gap-2 mb-3">
                  {ROLES.map((role) => (
                    <button
                      key={role}
                      onClick={() => setTargetRole(role)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        targetRole === role
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="Or type a custom role..."
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <button
                onClick={startInterview}
                disabled={isLoading}
                className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />Starting Interview...</>
                ) : (
                  <><Mic className="w-5 h-5" />Start Interview</>
                )}
              </button>
            </motion.div>
          )}

          {phase === "interview" && (
            <motion.div
              key="interview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col flex-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium">Interview in Progress</span>
                </div>
                <span className="text-xs text-muted-foreground">Question {questionNumber}/~8</span>
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-4 mb-4 overflow-y-auto max-h-[50vh] pr-1">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "ai" && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0 mr-2 mt-1">
                        AI
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-muted text-foreground rounded-tl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0 mr-2">AI</div>
                    <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-sm">
                      <div className="flex gap-1.5">
                        {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" style={{animationDelay:`${i*0.2}s`}} />)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex gap-3">
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitAnswer() }
                  }}
                  placeholder="Type your answer... (Shift+Enter for new line)"
                  rows={3}
                  className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
                <div className="flex flex-col gap-2">
                  <button
                    onClick={submitAnswer}
                    disabled={!answer.trim() || isLoading}
                    className="p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                  <button onClick={reset} className="p-3 border border-border rounded-xl hover:bg-muted text-muted-foreground">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {phase === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold">Interview Complete!</h2>

              <div className="p-6 rounded-2xl bg-card border border-border text-left">
                <p className="text-sm font-medium mb-3">Performance Report</p>
                <div className="bg-muted/40 rounded-xl p-4 max-h-80 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">
                    {messages[messages.length - 1]?.content}
                  </pre>
                </div>
              </div>

              <button
                onClick={reset}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                Start New Interview
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  )
}
