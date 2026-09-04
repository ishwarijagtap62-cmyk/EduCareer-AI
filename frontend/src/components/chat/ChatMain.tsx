"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send, Paperclip, RotateCcw, Copy, ThumbsUp, ThumbsDown,
  ChevronDown, Sparkles, Code2, Brain, Target, FileText, Mic,
  BookOpen, PanelRight, StopCircle
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism"
import { useChatStore } from "@/stores/chatStore"
import { chatApi } from "@/services/api"
import { useAuthStore } from "@/stores/authStore"
import { useTheme } from "@/components/shared/ThemeProvider"
import { ChatMode, Message } from "@/types"
import toast from "react-hot-toast"
import { tokenStorage } from "@/services/api"

const SUGGESTED_PROMPTS = [
  { label: "Explain a topic", prompt: "Explain database normalization with examples", icon: Brain },
  { label: "Debug code", prompt: "Debug my Python code: ", icon: Code2 },
  { label: "Career guidance", prompt: "What career path suits me based on my skills?", icon: Target },
  { label: "Study plan", prompt: "Create a 2-week study plan for Operating Systems exam", icon: BookOpen },
  { label: "Resume review", prompt: "Analyze my resume and suggest improvements", icon: FileText },
  { label: "Mock interview", prompt: "Conduct a technical interview for Software Engineer role", icon: Mic },
]

const MODES = [
  { value: "general", label: "General" },
  { value: "study", label: "Study" },
  { value: "coding", label: "Coding" },
  { value: "career", label: "Career" },
  { value: "resume", label: "Resume" },
  { value: "interview", label: "Interview" },
  { value: "exam", label: "Exam" },
]

interface ChatMainProps {
  initialMode?: ChatMode
  onToggleContext?: () => void
}

export default function ChatMain({ initialMode = "general", onToggleContext }: ChatMainProps) {
  const {
    activeConversationId, messages, isStreaming, streamingContent,
    setStreaming, setStreamingContent, appendStreamingContent,
    setMessages, addMessage, updateLastMessage, setMode, activeMode,
    addConversation, setActiveConversation,
  } = useChatStore()

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { user } = useAuthStore()
  const { resolvedTheme } = useTheme()

  const currentMessages = activeConversationId
    ? (messages[activeConversationId] || [])
    : []

  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [currentMessages, streamingContent])

  const autoResize = () => {
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = "auto"
      ta.style.height = Math.min(ta.scrollHeight, 200) + "px"
    }
  }

  const sendMessage = useCallback(async (messageText?: string) => {
    const text = (messageText || input).trim()
    if (!text || isLoading) return

    setInput("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
    setIsLoading(true)

    // Optimistic user message
    const userMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: text,
      tools_used: [],
      agent_steps: [],
      document_sources: [],
      created_at: new Date().toISOString(),
    }

    const convId = activeConversationId
    if (convId) {
      addMessage(convId, userMsg)
    }

    // Placeholder AI message
    const aiPlaceholder: Message = {
      id: `temp-ai-${Date.now()}`,
      role: "assistant",
      content: "",
      agent_used: "general_agent",
      tools_used: [],
      agent_steps: [{ step: "Processing...", status: "in_progress" }],
      document_sources: [],
      created_at: new Date().toISOString(),
    }
    if (convId) {
      addMessage(convId, aiPlaceholder)
    }

    try {
      // Use non-streaming for now (more reliable)
      const result = await chatApi.sendMessage({
        conversation_id: convId || undefined,
        message: text,
        mode: activeMode,
      })

      // If new conversation was created
      if (!convId && result.conversation_id) {
        const newConv = {
          id: result.conversation_id,
          title: text.slice(0, 60),
          mode: activeMode,
          message_count: "2",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        addConversation(newConv as any)
        setActiveConversation(result.conversation_id)
        setMessages(result.conversation_id, [
          { ...userMsg, id: `user-${Date.now()}` },
          {
            id: result.message_id,
            role: "assistant",
            content: result.content,
            agent_used: result.agent_used,
            agent_display_name: result.agent_display_name,
            tools_used: result.tools_used,
            agent_steps: result.agent_steps,
            document_sources: result.document_sources,
            created_at: new Date().toISOString(),
          },
        ])
      } else if (convId) {
        // Update placeholder with real content
        updateLastMessage(convId, result.content, {
          id: result.message_id,
          agent_used: result.agent_used,
          agent_display_name: result.agent_display_name,
          tools_used: result.tools_used,
          agent_steps: result.agent_steps,
          document_sources: result.document_sources,
        })
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.detail || "Failed to get response. Please try again."
      if (convId) {
        updateLastMessage(convId, errMsg, { agent_steps: [{ step: "Error", status: "error" }] })
      }
      toast.error(errMsg)
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, activeConversationId, activeMode, addMessage, addConversation, setActiveConversation, setMessages, updateLastMessage])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">EduCareer AI</p>
            <p className="text-xs text-muted-foreground">AI Student Copilot</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode selector */}
          <select
            value={activeMode}
            onChange={(e) => setMode(e.target.value as ChatMode)}
            className="text-xs border border-border rounded-lg px-2 py-1.5 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {MODES.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          {onToggleContext && (
            <button
              onClick={onToggleContext}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
              title="Toggle context panel"
            >
              <PanelRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {currentMessages.length === 0 ? (
          <WelcomeScreen
            onPromptClick={(prompt) => sendMessage(prompt)}
            userName={user?.name?.split(" ")[0]}
          />
        ) : (
          <>
            {currentMessages.map((msg, i) => (
              <MessageBubble
                key={msg.id || i}
                message={msg}
                isLast={i === currentMessages.length - 1}
                isLoading={isLoading && i === currentMessages.length - 1 && msg.role === "assistant"}
                resolvedTheme={resolvedTheme}
                onRegenerate={msg.role === "assistant" ? () => {
                  // Get last user message
                  const lastUser = [...currentMessages].reverse().find((m) => m.role === "user")
                  if (lastUser) sendMessage(lastUser.content)
                } : undefined}
              />
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-border p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3 p-3 rounded-2xl border border-border bg-card shadow-sm focus-within:border-primary/50 transition-colors">
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors shrink-0" title="Attach file">
              <Paperclip className="w-4 h-4" />
            </button>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => { setInput(e.target.value); autoResize() }}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything — academic, coding, career, or any student question..."
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none text-sm text-foreground placeholder:text-muted-foreground max-h-48 leading-relaxed"
              aria-label="Message input"
            />

            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              aria-label="Send message"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-center text-[11px] text-muted-foreground mt-2">
            EduCareer AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  )
}

// ---- Welcome Screen ----
function WelcomeScreen({
  onPromptClick,
  userName,
}: {
  onPromptClick: (prompt: string) => void
  userName?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-full text-center py-12"
    >
      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
        <Sparkles className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-2xl font-bold mb-2">
        {userName ? `Hi ${userName}! ` : ""}How can I help you?
      </h2>
      <p className="text-muted-foreground text-sm mb-8 max-w-md">
        I&apos;m your AI Student Copilot. Ask me anything about academics, coding, career, or interview prep.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl">
        {SUGGESTED_PROMPTS.map((p) => (
          <button
            key={p.label}
            onClick={() => onPromptClick(p.prompt)}
            className="flex flex-col items-start gap-2 p-4 rounded-2xl border border-border bg-card hover:border-primary/40 hover:bg-muted transition-all text-left group"
          >
            <p.icon className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs font-semibold">{p.label}</p>
              <p className="text-[11px] text-muted-foreground truncate">{p.prompt}</p>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  )
}

// ---- Message Bubble ----
function MessageBubble({
  message,
  isLast,
  isLoading,
  resolvedTheme,
  onRegenerate,
}: {
  message: Message
  isLast: boolean
  isLoading: boolean
  resolvedTheme: "dark" | "light"
  onRegenerate?: () => void
}) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === "user"

  const copyMessage = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} gap-3`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0 mt-1">
          AI
        </div>
      )}

      <div className={`max-w-[85%] ${isUser ? "order-1" : ""}`}>
        {/* Agent indicator */}
        {!isUser && (message as any).agent_display_name && (
          <p className="text-xs text-primary font-medium mb-1 ml-1">
            {(message as any).agent_display_name}
          </p>
        )}

        {/* Message content */}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted text-foreground rounded-tl-sm"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : isLoading && !message.content ? (
            <div className="flex items-center gap-1.5 py-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-muted-foreground typing-dot"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          ) : (
            <MarkdownContent content={message.content} resolvedTheme={resolvedTheme} />
          )}
        </div>

        {/* Agent steps */}
        {!isUser && message.agent_steps?.length > 0 && !isLoading && (
          <div className="mt-2 space-y-1">
            {message.agent_steps.map((step, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[11px] text-muted-foreground fade-in-up">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  step.status === "completed" ? "bg-green-500" :
                  step.status === "error" ? "bg-red-500" : "bg-yellow-500"
                }`} />
                {step.step}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {!isUser && message.content && !isLoading && (
          <div className="flex items-center gap-1 mt-2 opacity-0 hover:opacity-100 transition-opacity group-hover:opacity-100">
            <button
              onClick={copyMessage}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Copy className="w-3 h-3" />
              {copied ? "Copied!" : "Copy"}
            </button>
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Regenerate
              </button>
            )}
            <button className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-muted-foreground hover:bg-muted hover:text-green-500 transition-colors">
              <ThumbsUp className="w-3 h-3" />
            </button>
            <button className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-muted-foreground hover:bg-muted hover:text-red-500 transition-colors">
              <ThumbsDown className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0 mt-1">
          You
        </div>
      )}
    </motion.div>
  )
}

// ---- Markdown renderer with code highlighting ----
function MarkdownContent({
  content,
  resolvedTheme,
}: {
  content: string
  resolvedTheme: "dark" | "light"
}) {
  return (
    <div className="markdown-body space-y-2">
      <ReactMarkdown
        remarkPlugins={[]}
        components={{
          pre: ({ children }: any) => <div className="not-prose">{children}</div>,
          code({ node, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "")
            const isBlock = Boolean(match) || String(children).includes("\n")
            const lang = match?.[1] || "code"

            if (isBlock) {
              return (
                <div className="relative group my-3 rounded-xl overflow-hidden border border-border bg-background/50 shadow-sm">
                  <div className="flex items-center justify-between px-3.5 py-1.5 bg-muted/80 border-b border-border text-xs font-mono text-muted-foreground">
                    <span className="font-semibold text-primary">{lang}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(String(children).replace(/\n$/, ""))
                        toast.success("Copied to clipboard!")
                      }}
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </button>
                  </div>
                  <SyntaxHighlighter
                    language={lang}
                    style={resolvedTheme === "dark" ? oneDark : oneLight}
                    customStyle={{
                      margin: 0,
                      padding: "1rem",
                      fontSize: "0.85rem",
                      background: "transparent",
                    }}
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                </div>
              )
            }
            return (
              <code className="px-1.5 py-0.5 rounded-md bg-muted-foreground/15 text-[0.875em] font-mono text-primary font-semibold" {...props}>
                {children}
              </code>
            )
          },
          h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-2 text-foreground border-b border-border/50 pb-1">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-bold mt-3 mb-1.5 text-foreground">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-semibold mt-2.5 mb-1 text-foreground">{children}</h3>,
          ul: ({ children }) => <ul className="list-disc list-outside space-y-1.5 my-2 ml-5 text-sm">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-outside space-y-1.5 my-2 ml-5 text-sm">{children}</ol>,
          li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
          p: ({ children }) => <div className="mb-2.5 last:mb-0 leading-relaxed text-sm">{children}</div>,
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/50 pl-3.5 my-2.5 py-1 text-muted-foreground italic bg-muted/20 rounded-r-lg">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-xl border border-border">
              <table className="min-w-full text-xs border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="px-3.5 py-2.5 bg-muted border-b border-border font-semibold text-left">{children}</th>,
          td: ({ children }) => <td className="px-3.5 py-2 border-b border-border/50 last:border-b-0">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
