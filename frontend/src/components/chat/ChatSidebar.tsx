"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Search, MessageSquare, Trash2, Pencil, Check, X } from "lucide-react"
import { useChatStore } from "@/stores/chatStore"
import { chatApi } from "@/services/api"
import { formatRelativeTime } from "@/lib/utils"
import toast from "react-hot-toast"

export default function ChatSidebar() {
  const {
    conversations, activeConversationId, setActiveConversation,
    setMessages, addConversation, deleteConversation, updateConversationTitle
  } = useChatStore()
  const [search, setSearch] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")

  const filtered = conversations.filter((c) =>
    c.title?.toLowerCase().includes(search.toLowerCase())
  )

  const handleNewChat = async () => {
    try {
      const conv = await chatApi.createConversation({ mode: "general" })
      addConversation(conv)
      setActiveConversation(conv.id)
      setMessages(conv.id, [])
    } catch {
      toast.error("Failed to create conversation")
    }
  }

  const handleSelect = async (id: string) => {
    setActiveConversation(id)
    try {
      const msgs = await chatApi.getMessages(id)
      setMessages(id, msgs)
    } catch {}
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      await chatApi.deleteConversation(id)
      deleteConversation(id)
    } catch {
      toast.error("Failed to delete")
    }
  }

  const startEdit = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation()
    setEditingId(id)
    setEditTitle(title)
  }

  const saveEdit = async (id: string) => {
    if (!editTitle.trim()) return
    try {
      await chatApi.updateConversation(id, { title: editTitle })
      updateConversationTitle(id, editTitle)
    } catch {}
    setEditingId(null)
  }

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card flex-shrink-0 h-full overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="flex-1 bg-transparent text-xs outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                {search ? "No matches" : "No conversations yet"}
              </p>
            </motion.div>
          ) : (
            filtered.map((conv) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                  activeConversationId === conv.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted text-foreground"
                }`}
                onClick={() => handleSelect(conv.id)}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />

                {editingId === conv.id ? (
                  <div className="flex items-center gap-1 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                    <input
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(conv.id)
                        if (e.key === "Escape") setEditingId(null)
                      }}
                      className="flex-1 min-w-0 bg-background border border-border rounded px-1.5 py-0.5 text-xs outline-none"
                    />
                    <button onClick={() => saveEdit(conv.id)} className="text-green-500 hover:text-green-600">
                      <Check className="w-3 h-3" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{conv.title || "New Chat"}</p>
                    <p className="text-[10px] text-muted-foreground">{formatRelativeTime(conv.updated_at)}</p>
                  </div>
                )}

                {editingId !== conv.id && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => startEdit(e, conv.id, conv.title || "New Chat")}
                      className="p-1 rounded hover:bg-muted-foreground/20"
                    >
                      <Pencil className="w-3 h-3 text-muted-foreground" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, conv.id)}
                      className="p-1 rounded hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3 h-3 text-muted-foreground hover:text-red-500" />
                    </button>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </aside>
  )
}
