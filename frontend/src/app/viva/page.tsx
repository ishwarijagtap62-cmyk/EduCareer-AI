"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BookMarked, Send, Loader2, RotateCcw, CheckCircle2 } from "lucide-react"
import AppLayout from "@/components/layout/AppLayout"
import { interviewApi } from "@/services/api"
import toast from "react-hot-toast"

const SUBJECTS = [
  "DBMS", "Operating Systems", "Computer Networks", "DSA",
  "Software Engineering", "Web Development", "Machine Learning",
  "Java", "Python", "C/C++", "Computer Architecture", "Theory of Computation",
]

export default function VivaPage() {
  const [phase, setPhase] = useState<"setup" | "viva" | "complete">("setup")
  const [subject, setSubject] = useState("")
  const [topic, setTopic] = useState("")
  const [difficulty, setDifficulty] = useState("medium")
  const [vivaId, setVivaId] = useState<string | null>(null)
  const [messages, setMessages] = useState<{ role: "ai" | "user"; content: string }[]>([])
  const [answer, setAnswer] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [qNum, setQNum] = useState(0)

  const startViva = async () => {
    if (!subject) { toast.error("Select a subject"); return }
    setIsLoading(true)
    try {
      const result = await interviewApi.startViva({ subject, topic: topic || undefined, difficulty })
      setVivaId(result.viva_id)
      setMessages([{ role: "ai", content: result.content }])
      setQNum(1)
      setPhase("viva")
    } catch {
      toast.error("Failed to start viva. Check backend.")
    } finally {
      setIsLoading(false)
    }
  }

  const submitAnswer = async () => {
    if (!answer.trim() || !vivaId) return
    const myAnswer = answer.trim()
    setAnswer("")
    setMessages((prev) => [...prev, { role: "user", content: myAnswer }])
    setIsLoading(true)
    try {
      const result = await interviewApi.answerViva(vivaId, myAnswer)
      setMessages((prev) => [...prev, { role: "ai", content: result.content }])
      if (result.is_complete) setPhase("complete")
      else setQNum(result.question_number)
    } catch {
      toast.error("Failed to submit.")
    } finally {
      setIsLoading(false)
    }
  }

  const reset = () => {
    setPhase("setup"); setVivaId(null); setMessages([]); setAnswer(""); setQNum(0)
  }

  return (
    <AppLayout>
      <div className="flex flex-col p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-1">Viva Practice</h1>
          <p className="text-muted-foreground text-sm">AI-conducted viva voce — one question at a time</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {phase === "setup" && (
            <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-semibold mb-3">Select Subject</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {SUBJECTS.map((s) => (
                    <button key={s} onClick={() => setSubject(s)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                        subject === s ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"
                      }`}>{s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
                <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
                  placeholder="Specific topic (optional, e.g. Normalization)"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />

                <div className="flex gap-3">
                  {["easy", "medium", "hard"].map((d) => (
                    <button key={d} onClick={() => setDifficulty(d)}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize border transition-colors ${
                        difficulty === d ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"
                      }`}>{d}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={startViva} disabled={isLoading || !subject}
                className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" />Starting...</> : <><BookMarked className="w-5 h-5" />Start Viva</>}
              </button>
            </motion.div>
          )}

          {phase === "viva" && (
            <motion.div key="viva" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col flex-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium">{subject} Viva</span>
                </div>
                <span className="text-xs text-muted-foreground">Q{qNum}/~10 • Type &apos;done&apos; to end</span>
              </div>

              <div className="space-y-4 mb-4 max-h-[50vh] overflow-y-auto pr-1">
                {messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "ai" && (
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-xs font-bold text-blue-500 shrink-0 mr-2 mt-1">
                        Prof
                      </div>
                    )}
                    <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm"
                    }`}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-xs font-bold text-blue-500 shrink-0 mr-2">Prof</div>
                    <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-sm">
                      <div className="flex gap-1.5">{[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" style={{animationDelay:`${i*0.2}s`}}/>)}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <textarea value={answer} onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitAnswer() } }}
                  placeholder='Your answer... (or type "done" to finish)'
                  rows={3}
                  className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                <div className="flex flex-col gap-2">
                  <button onClick={submitAnswer} disabled={!answer.trim() || isLoading} className="p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50">
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
            <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold">Viva Complete!</h2>
              <div className="p-6 rounded-2xl bg-card border border-border text-left">
                <div className="bg-muted/40 rounded-xl p-4 max-h-80 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">{messages[messages.length - 1]?.content}</pre>
                </div>
              </div>
              <button onClick={reset} className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90">
                Start New Viva
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  )
}
