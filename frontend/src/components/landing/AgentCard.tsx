"use client"

import { motion } from "framer-motion"

const colorMap: Record<string, string> = {
  blue: "from-blue-500/10 to-blue-600/5 border-blue-500/20",
  green: "from-green-500/10 to-green-600/5 border-green-500/20",
  purple: "from-purple-500/10 to-purple-600/5 border-purple-500/20",
  orange: "from-orange-500/10 to-orange-600/5 border-orange-500/20",
  pink: "from-pink-500/10 to-pink-600/5 border-pink-500/20",
  cyan: "from-cyan-500/10 to-cyan-600/5 border-cyan-500/20",
  yellow: "from-yellow-500/10 to-yellow-600/5 border-yellow-500/20",
  red: "from-red-500/10 to-red-600/5 border-red-500/20",
  indigo: "from-indigo-500/10 to-indigo-600/5 border-indigo-500/20",
  teal: "from-teal-500/10 to-teal-600/5 border-teal-500/20",
  gray: "from-gray-500/10 to-gray-600/5 border-gray-500/20",
}

interface Agent {
  name: string
  emoji: string
  description: string
  color: string
}

export default function AgentCard({ agent }: { agent: Agent }) {
  const gradient = colorMap[agent.color] || colorMap.gray

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`p-4 rounded-2xl border bg-gradient-to-br ${gradient} cursor-default hover:shadow-md transition-shadow duration-300`}
    >
      <div className="text-3xl mb-3">{agent.emoji}</div>
      <h3 className="font-semibold text-base mb-1">{agent.name}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{agent.description}</p>
    </motion.div>
  )
}
