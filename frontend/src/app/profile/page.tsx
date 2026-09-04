"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User as UserIcon, Award, Briefcase, GraduationCap, Plus, Trash2, Loader2, Sparkles, Check } from "lucide-react"
import AppLayout from "@/components/layout/AppLayout"
import { profileApi } from "@/services/api"
import toast from "react-hot-toast"

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [placementScore, setPlacementScore] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [newSkill, setNewSkill] = useState("")

  const [form, setForm] = useState({
    college: "",
    degree: "",
    branch: "",
    year: 1,
    cgpa: 0,
    target_career: "",
    target_job_role: "",
    experience_level: "beginner",
    linkedin_url: "",
    github_url: "",
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setIsLoading(true)
    try {
      const [profData, scoreData] = await Promise.all([
        profileApi.get(),
        profileApi.getPlacementScore().catch(() => null),
      ])
      setProfile(profData)
      setPlacementScore(scoreData)
      setForm({
        college: profData.college || "",
        degree: profData.degree || "",
        branch: profData.branch || "",
        year: profData.year || 1,
        cgpa: profData.cgpa || 0,
        target_career: profData.target_career || "",
        target_job_role: profData.target_job_role || "",
        experience_level: profData.experience_level || "beginner",
        linkedin_url: profData.linkedin_url || "",
        github_url: profData.github_url || "",
      })
    } catch {
      toast.error("Could not load profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await profileApi.update({
        college: form.college,
        degree: form.degree,
        branch: form.branch,
        year: Number(form.year),
        cgpa: Number(form.cgpa),
        target_career: form.target_career,
        target_job_role: form.target_job_role,
        experience_level: form.experience_level,
        linkedin_url: form.linkedin_url,
        github_url: form.github_url,
      })
      toast.success("Profile updated successfully!")
      loadProfile()
    } catch {
      toast.error("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return
    try {
      await profileApi.addSkill({ name: newSkill.trim() })
      toast.success(`Added skill: ${newSkill}`)
      setNewSkill("")
      loadProfile()
    } catch {
      toast.error("Failed to add skill")
    }
  }

  const handleDeleteSkill = async (skillId: string) => {
    try {
      await profileApi.deleteSkill(skillId)
      toast.success("Skill removed")
      loadProfile()
    } catch {
      toast.error("Failed to remove skill")
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        {/* Header & Placement Score */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-card border border-border">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl">
              {profile?.user?.name?.[0]?.toUpperCase() || "S"}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profile?.user?.name || "Student Profile"}</h1>
              <p className="text-sm text-muted-foreground">{profile?.user?.email}</p>
              <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium">
                {form.target_job_role || "Aspiring Engineer"}
              </span>
            </div>
          </div>

          {placementScore && (
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
              <Award className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">Placement Readiness</p>
                <p className="text-xl font-bold">{placementScore.placement_readiness_score || 75}%</p>
                <p className="text-[10px] text-muted-foreground">AI Estimated Score</p>
              </div>
            </div>
          )}
        </div>

        {/* Profile Edit Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Education & Academic Info */}
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <h2 className="font-bold text-base flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" /> Academic Details
            </h2>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">College / University</label>
              <input
                type="text"
                value={form.college}
                onChange={(e) => setForm({ ...form, college: e.target.value })}
                placeholder="e.g. National Institute of Tech"
                className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Degree</label>
                <input
                  type="text"
                  value={form.degree}
                  onChange={(e) => setForm({ ...form, degree: e.target.value })}
                  placeholder="B.Tech, BCA, BS"
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Branch</label>
                <input
                  type="text"
                  value={form.branch}
                  onChange={(e) => setForm({ ...form, branch: e.target.value })}
                  placeholder="Computer Science"
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Year of Study</label>
                <select
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm"
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">CGPA / Percentage</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={form.cgpa}
                  onChange={(e) => setForm({ ...form, cgpa: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm"
                />
              </div>
            </div>
          </div>

          {/* Career Preferences */}
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <h2 className="font-bold text-base flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" /> Career Aspirations
            </h2>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Target Career Domain</label>
              <input
                type="text"
                value={form.target_career}
                onChange={(e) => setForm({ ...form, target_career: e.target.value })}
                placeholder="Software Engineering, AI/ML, Cloud"
                className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Target Job Role</label>
              <input
                type="text"
                value={form.target_job_role}
                onChange={(e) => setForm({ ...form, target_job_role: e.target.value })}
                placeholder="Full Stack Developer, Data Scientist"
                className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">LinkedIn URL</label>
                <input
                  type="text"
                  value={form.linkedin_url}
                  onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">GitHub URL</label>
                <input
                  type="text"
                  value={form.github_url}
                  onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Technical & Soft Skills
            </h2>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
              placeholder="Enter skill (e.g. Python, Docker, React, DSA)..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-border bg-background text-sm"
            />
            <button
              onClick={handleAddSkill}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Skill
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {profile?.skills?.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No skills added yet.</p>
            ) : (
              profile?.skills?.map((s: any) => (
                <span
                  key={s.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium border border-border"
                >
                  {s.name}
                  <button
                    onClick={() => handleDeleteSkill(s.id)}
                    className="hover:text-destructive transition-colors ml-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save Profile Changes
          </button>
        </div>
      </div>
    </AppLayout>
  )
}
