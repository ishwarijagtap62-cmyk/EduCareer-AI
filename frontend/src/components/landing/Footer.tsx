import Link from "next/link"
import { GraduationCap, Globe, Mail, Code2 } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/20 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">
                EduCareer <span className="text-primary">AI</span>
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              One AI Agent for Your Studies, Problems, Skills & Career.
              Powered by Groq AI and multi-agent architecture.
            </p>
          </div>

          {/* Platform */}
          <div>
            <p className="font-semibold text-sm mb-4">Platform</p>
            <div className="space-y-2">
              {[
                { label: "AI Assistant", href: "/ai-assistant" },
                { label: "Dashboard", href: "/dashboard" },
                { label: "Career Profile", href: "/career/profile" },
                { label: "Job Board", href: "/jobs" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Account */}
          <div>
            <p className="font-semibold text-sm mb-4">Account</p>
            <div className="space-y-2">
              {[
                { label: "Sign Up", href: "/register" },
                { label: "Sign In", href: "/login" },
                { label: "Profile", href: "/profile" },
                { label: "Settings", href: "/settings" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-border gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 EduCareer AI. All scores are AI-estimated. Not a guarantee of placement or employment.
          </p>
          <div className="flex items-center gap-3">
            <a href="#" className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground" aria-label="GitHub">
              <Code2 className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground" aria-label="Portfolio">
              <Globe className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground" aria-label="Contact">
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
