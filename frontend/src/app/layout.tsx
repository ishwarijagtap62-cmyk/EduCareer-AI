import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "react-hot-toast"
import { ThemeProvider } from "@/components/shared/ThemeProvider"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "EduCareer AI — Your AI Student & Career Copilot",
  description:
    "One AI Agent for Your Studies, Problems, Skills & Career. Learn smarter. Solve problems faster. Build skills. Get placement-ready.",
  keywords: ["AI tutor", "career guidance", "student copilot", "placement readiness", "AI learning"],
  openGraph: {
    title: "EduCareer AI",
    description: "One AI Agent for Your Studies, Problems, Skills & Career.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "hsl(var(--card))",
                color: "hsl(var(--card-foreground))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.75rem",
                fontSize: "0.875rem",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
