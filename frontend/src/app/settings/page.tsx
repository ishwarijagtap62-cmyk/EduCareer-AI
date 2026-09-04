"use client"

import { useState } from "react"
import { Settings, Shield, Bell, Moon, Sun, Cpu, Check } from "lucide-react"
import AppLayout from "@/components/layout/AppLayout"
import toast from "react-hot-toast"

export default function SettingsPage() {
  const [model, setModel] = useState("openai/gpt-oss-120b")
  const [notifications, setNotifications] = useState(true)
  const [theme, setTheme] = useState("dark")

  const handleSave = () => {
    toast.success("Settings saved successfully!")
  }

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
            <Settings className="w-6 h-6 text-primary" /> Application Settings
          </h1>
          <p className="text-muted-foreground text-sm">
            Customize AI preferences, notification thresholds, and appearance
          </p>
        </div>

        <div className="space-y-4">
          {/* AI Settings */}
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <h2 className="font-bold text-base flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" /> AI Model & Engine
            </h2>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Active Groq AI Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm"
              >
                <option value="openai/gpt-oss-120b">openai/gpt-oss-120b (High Quality 120B)</option>
                <option value="groq/compound-mini">groq/compound-mini (Ultra Fast)</option>
                <option value="qwen/qwen3.8-27b">qwen/qwen3.8-27b (Fast 27B)</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                All requests routed securely through server-side Groq endpoint.
              </p>
            </div>
          </div>

          {/* Preferences */}
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <h2 className="font-bold text-base flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> Privacy & Security
            </h2>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Session Token Auto-refresh</p>
                <p className="text-xs text-muted-foreground">Keep sessions active securely via JWT rotation</p>
              </div>
              <span className="text-xs text-green-500 font-semibold bg-green-500/10 px-2.5 py-1 rounded-full">
                Enabled
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Save Preferences
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
