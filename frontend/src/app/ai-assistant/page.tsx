"use client"

import { useEffect, useRef, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ChatSidebar from "@/components/chat/ChatSidebar"
import ChatMain from "@/components/chat/ChatMain"
import ChatContextPanel from "@/components/chat/ChatContextPanel"
import { chatApi } from "@/services/api"
import { useChatStore } from "@/stores/chatStore"

function AIAssistantContent() {
  const searchParams = useSearchParams()
  const convId = searchParams.get("conv")
  const mode = searchParams.get("mode") || "general"

  const { setConversations, setActiveConversation, setMessages } = useChatStore()
  const [contextOpen, setContextOpen] = useState(false)

  useEffect(() => {
    // Load conversations
    chatApi.getConversations()
      .then(setConversations)
      .catch(() => {})

    // If a conversation ID is provided, load it
    if (convId) {
      setActiveConversation(convId)
      chatApi.getMessages(convId)
        .then((msgs) => setMessages(convId, msgs))
        .catch(() => {})
    }
  }, [convId])

  return (
    <AppLayout>
      <div className="flex h-full overflow-hidden">
        {/* Left: Conversation History */}
        <ChatSidebar />

        {/* Center: Chat */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatMain
            initialMode={mode as any}
            onToggleContext={() => setContextOpen(!contextOpen)}
          />
        </div>

        {/* Right: Context Panel */}
        {contextOpen && (
          <div className="hidden xl:flex w-72 flex-shrink-0">
            <ChatContextPanel />
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default function AIAssistantPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
      <AIAssistantContent />
    </Suspense>
  )
}
