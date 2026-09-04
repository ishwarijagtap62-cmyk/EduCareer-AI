"use client"

import { Suspense } from "react"
import AppLayout from "@/components/layout/AppLayout"
import ChatSidebar from "@/components/chat/ChatSidebar"
import ChatMain from "@/components/chat/ChatMain"

function CodingContent() {
  return (
    <AppLayout>
      <div className="flex h-full overflow-hidden">
        {/* Left: Conversation History */}
        <ChatSidebar />

        {/* Center: Coding Assistant */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatMain initialMode="coding" />
        </div>
      </div>
    </AppLayout>
  )
}

export default function CodingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <CodingContent />
    </Suspense>
  )
}
