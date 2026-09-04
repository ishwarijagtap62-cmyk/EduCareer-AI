"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  GraduationCap, LayoutDashboard, MessageSquare, BookOpen,
  Code2, Target, Briefcase, FileText, Mic, BookMarked,
  FolderOpen, BarChart3, User, Settings, LogOut,
  ChevronLeft, ChevronRight, Moon, Sun, Menu, X
} from "lucide-react"
import { useAuthStore } from "@/stores/authStore"
import { useTheme } from "@/components/shared/ThemeProvider"
import toast from "react-hot-toast"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ai-assistant", label: "AI Assistant", icon: MessageSquare },
  { href: "/study", label: "Study", icon: BookOpen },
  { href: "/coding", label: "Coding", icon: Code2 },
  { href: "/career", label: "Career", icon: Target },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/resume", label: "Resume", icon: FileText },
  { href: "/interview", label: "Interview", icon: Mic },
  { href: "/viva", label: "Viva", icon: BookMarked },
  { href: "/projects", label: "Projects", icon: FolderOpen },
  { href: "/applications", label: "Applications", icon: Briefcase },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
]

interface SidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { resolvedTheme, setTheme } = useTheme()

  const handleLogout = () => {
    logout()
    toast.success("Signed out")
    router.push("/login")
  }

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center ${collapsed && !mobile ? "justify-center px-2" : "justify-between px-4"} py-4 border-b border-border`}>
        {(!collapsed || mobile) && (
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-base">
              EduCareer <span className="text-primary">AI</span>
            </span>
          </Link>
        )}
        {collapsed && !mobile && (
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
        )}
        {!mobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground ml-auto"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
        {mobile && (
          <button onClick={onMobileClose} className="p-1.5 rounded-lg hover:bg-muted">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={mobile ? onMobileClose : undefined}
              title={collapsed && !mobile ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="w-4.5 h-4.5 shrink-0 w-[18px] h-[18px]" />
              {(!collapsed || mobile) && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border p-2 space-y-0.5">
        <Link
          href="/profile"
          onClick={mobile ? onMobileClose : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all ${
            pathname === "/profile" ? "bg-primary/10 text-primary" : ""
          }`}
        >
          <User className="w-[18px] h-[18px] shrink-0" />
          {(!collapsed || mobile) && <span>Profile</span>}
        </Link>

        <Link
          href="/settings"
          onClick={mobile ? onMobileClose : undefined}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <Settings className="w-[18px] h-[18px] shrink-0" />
          {(!collapsed || mobile) && <span>Settings</span>}
        </Link>

        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="w-[18px] h-[18px] shrink-0" />
          ) : (
            <Moon className="w-[18px] h-[18px] shrink-0" />
          )}
          {(!collapsed || mobile) && (
            <span>{resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          )}
        </button>

        {/* User info */}
        {(!collapsed || mobile) && user && (
          <div className="flex items-center gap-2 px-3 py-3 mt-2 rounded-xl bg-muted/50">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col h-screen sticky top-0 border-r border-border bg-card transition-all duration-300 ${
          collapsed ? "w-[68px]" : "w-64"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-50 bg-card border-r border-border lg:hidden"
            >
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
