"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { GraduationCap, ArrowRight, ArrowLeft, Loader2, Plus, X } from "lucide-react"
import { authApi } from "@/services/api"
import toast from "react-hot-toast"

const CAREERS = [
  "Software Engineer", "AI/ML Engineer", "Data Scientist",
  "Data Analyst", "Web Developer", "Cloud Engineer",
  "DevOps Engineer", "Cybersecurity Analyst", "Mobile Developer",
  "Product Manager", "Embedded Systems Engineer",
]

const SKILLS_SUGGESTIONS = [
  "Python", "Java", "C++", "JavaScript", "TypeScript", "SQL",
  "Machine Learning", "Deep Learning", "React", "Node.js",
  "Docker", "AWS", "Git", "Data Structures", "System Design",
]

const DEGREES = ["B.Tech", "B.E.", "BCA", "B.Sc CS", "M.Tech", "MCA", "MBA"]
const BRANCHES = ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil", "Other"]
const YEARS = [1, 2, 3, 4]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    college: "",
    degree: "B.Tech",
    branch: "Computer Science",
    year: 2,
    cgpa: "",
    target_career: "",
    target_job_role: "",
    experience_level: "beginner",
    skills: [] as string[],
    interests: [] as string[],
    customSkill: "",
  })

  const steps = [
    { title: "Education", description: "Tell us about your academic background" },
    { title: "Career Goals", description: "What's your target career path?" },
    { title: "Your Skills", description: "What technologies do you know?" },
  ]

  const addSkill = (skill: string) => {
    if (!formData.skills.includes(skill) && skill.trim()) {
      setFormData({ ...formData, skills: [...formData.skills, skill], customSkill: "" })
    }
  }

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skill) })
  }

  const handleFinish = async () => {
    setIsLoading(true)
    try {
      await authApi.onboarding({
        college: formData.college,
        degree: formData.degree,
        branch: formData.branch,
        year: formData.year,
        cgpa: formData.cgpa ? parseFloat(formData.cgpa) : undefined,
        target_career: formData.target_career,
        target_job_role: formData.target_job_role,
        experience_level: formData.experience_level,
        skills: formData.skills,
        interests: formData.interests,
      })
      toast.success("Profile created! Welcome to EduCareer AI 🎓")
      router.push("/dashboard")
    } catch (err: any) {
      toast.error("Failed to save profile. Skipping to dashboard.")
      router.push("/dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/3 -right-32 w-80 h-80 rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">EduCareer <span className="text-primary">AI</span></span>
          </div>
          <h1 className="text-2xl font-bold mb-1">Set up your profile</h1>
          <p className="text-muted-foreground text-sm">This helps us personalize your AI experience</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i < step ? "bg-green-500 text-white" : i === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {i < step ? "✓" : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 transition-colors ${i < step ? "bg-green-500" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          <h2 className="font-semibold text-lg mb-1">{steps[step].title}</h2>
          <p className="text-muted-foreground text-sm mb-6">{steps[step].description}</p>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <FormInput label="College / University" value={formData.college} onChange={(v) => setFormData({ ...formData, college: v })} placeholder="e.g. IIT Bombay" />

                <div className="grid grid-cols-2 gap-3">
                  <FormSelect label="Degree" value={formData.degree} onChange={(v) => setFormData({ ...formData, degree: v })} options={DEGREES} />
                  <FormSelect label="Year" value={String(formData.year)} onChange={(v) => setFormData({ ...formData, year: parseInt(v) })} options={YEARS.map(String)} />
                </div>

                <FormSelect label="Branch" value={formData.branch} onChange={(v) => setFormData({ ...formData, branch: v })} options={BRANCHES} />
                <FormInput label="CGPA (optional)" value={formData.cgpa} onChange={(v) => setFormData({ ...formData, cgpa: v })} placeholder="e.g. 8.5" type="number" />
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="text-sm font-medium mb-2 block">Target Career</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CAREERS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFormData({ ...formData, target_career: c, target_job_role: c })}
                        className={`px-3 py-2 rounded-lg text-xs font-medium text-left border transition-colors ${
                          formData.target_career === c
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/40 hover:bg-muted"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Experience Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["beginner", "intermediate", "advanced"].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setFormData({ ...formData, experience_level: lvl })}
                        className={`py-2 rounded-lg text-xs font-medium capitalize border transition-colors ${
                          formData.experience_level === lvl
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/40 hover:bg-muted"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Selected skills */}
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                      <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium">
                        {skill}
                        <button onClick={() => removeSkill(skill)} aria-label={`Remove ${skill}`}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Suggestions */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Quick add:</p>
                  <div className="flex flex-wrap gap-2">
                    {SKILLS_SUGGESTIONS.filter((s) => !formData.skills.includes(s)).map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => addSkill(skill)}
                        className="px-3 py-1 rounded-full border border-border hover:border-primary/40 hover:bg-muted text-xs font-medium transition-colors"
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom skill */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.customSkill}
                    onChange={(e) => setFormData({ ...formData, customSkill: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addSkill(formData.customSkill) }
                    }}
                    placeholder="Add custom skill..."
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() => addSkill(formData.customSkill)}
                    className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => step > 0 ? setStep(step - 1) : router.push("/dashboard")}
              className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {step === 0 ? "Skip" : "Back"}
            </button>

            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : (
                  <>Finish Setup <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function FormInput({
  label, value, onChange, placeholder, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors text-sm"
      />
    </div>
  )
}

function FormSelect({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void; options: string[]
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors text-sm"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}
