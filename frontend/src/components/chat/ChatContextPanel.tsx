"use client"

import { useChatStore } from "@/stores/chatStore"
import { useAuthStore } from "@/stores/authStore"
import { Brain, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react"

export default function ChatContextPanel() {
  const { activeConversationId, messages, conversations } = useChatStore()
  const { user } = useAuthStore()

  const conv = conversations.find((c) => c.id === activeConversationId)
  const convMessages = activeConversationId ? (messages[activeConversationId] || []) : []
  const lastAiMsg = [...convMessages].reverse().find((m) => m.role === "assistant")

  return (
    <aside className="h-full border-l border-border bg-card overflow-y-auto p-4 space-y-5 w-full">
      <h3 className="font-semibold text-sm">AI Activity</h3>

      {/* Active agent */}
      {lastAiMsg?.agent_used && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Active Agent</p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                {(lastAiMsg as any).agent_display_name || lastAiMsg.agent_used}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {lastAiMsg.agent_used?.replace(/_/g, " ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Agent execution steps */}
      {lastAiMsg?.agent_steps && lastAiMsg.agent_steps.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">
            Execution Steps
          </p>
          <div className="space-y-2">
            {lastAiMsg.agent_steps.map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-xs fade-in-up">
                {step.status === "completed" ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                ) : step.status === "error" ? (
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-yellow-500 shrink-0" />
                )}
                <span className={`${step.status === "error" ? "text-red-500" : "text-foreground"}`}>
                  {step.step}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tools used */}
      {lastAiMsg?.tools_used && lastAiMsg.tools_used.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">
            Tools Used
          </p>
          <div className="flex flex-wrap gap-1.5">
            {lastAiMsg.tools_used.map((tool) => (
              <span key={tool} className="px-2.5 py-1 rounded-full bg-muted text-xs font-mono text-muted-foreground border border-border">
                {tool}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Document sources */}
      {lastAiMsg?.document_sources && lastAiMsg.document_sources.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">
            Document Sources
          </p>
          <div className="space-y-1.5">
            {lastAiMsg.document_sources.map((src, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted text-xs">
                <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="font-medium truncate">{src.doc_name}</p>
                  {src.content && (
                    <p className="text-muted-foreground mt-0.5 line-clamp-2">{src.content.slice(0, 80)}...</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student profile quick view */}
      {user && (
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">
            Your Context
          </p>
          <div className="p-3 rounded-xl bg-muted/50 space-y-1 text-xs">
            <p><span className="text-muted-foreground">Name:</span> {user.name}</p>
            <p className="text-muted-foreground text-[10px] mt-1">
              Profile context is used to personalize responses
            </p>
          </div>
        </div>
      )}

      {/* No activity state */}
      {!lastAiMsg && (
        <div className="text-center py-8">
          <Brain className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">
            Agent activity will appear here during a conversation
          </p>
        </div>
      )}
    </aside>
  )
}
