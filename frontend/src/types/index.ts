// =============================================
// EduCareer AI — Core TypeScript types
// =============================================

export interface User {
  id: string
  name: string
  email: string
  role: "student" | "admin"
  onboarding_completed: boolean
  avatar_url?: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
  user_id: string
  name: string
  role: string
  onboarding_completed: boolean
}

export interface StudentProfile {
  id: string
  college?: string
  degree?: string
  branch?: string
  year?: number
  cgpa?: number
  target_career?: string
  target_job_role?: string
  experience_level: string
  interests: string[]
  resume_score?: number
  technical_score?: number
  dsa_score?: number
  projects_score?: number
  interview_score?: number
  communication_score?: number
  placement_readiness_score?: number
  score_sources: Record<string, string>
  skills: Skill[]
  projects: Project[]
}

export interface Skill {
  id: string
  name: string
  category?: string
  level: "beginner" | "intermediate" | "advanced" | "expert"
  status: "strong" | "moderate" | "weak" | "missing"
  proficiency: number
  is_verified: boolean
}

export interface Project {
  id: string
  title: string
  description?: string
  technologies?: string
  github_url?: string
  live_url?: string
  is_ai_recommended: boolean
  resume_value?: string
}

export interface Conversation {
  id: string
  title: string
  mode: ChatMode
  last_agent_used?: string
  message_count: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  agent_used?: string
  agent_display_name?: string
  tools_used: string[]
  agent_steps: AgentStep[]
  document_sources: DocumentSource[]
  created_at: string
  feedback?: "thumbs_up" | "thumbs_down"
}

export interface AgentStep {
  step: string
  status: "completed" | "in_progress" | "error"
}

export interface DocumentSource {
  doc_name: string
  doc_id: string
  chunk_index: number
  content?: string
}

export type ChatMode =
  | "general"
  | "study"
  | "coding"
  | "career"
  | "resume"
  | "interview"
  | "exam"
  | "document_qa"

export interface Document {
  id: string
  filename: string
  file_type: string
  file_size: number
  is_processed: boolean
  document_type: string
  subject?: string
  chunk_count: number
  created_at: string
}

export interface PlacementScore {
  resume_score?: number
  technical_score?: number
  dsa_score?: number
  projects_score?: number
  interview_score?: number
  communication_score?: number
  overall_score?: number
  score_sources: Record<string, string>
  label: string
}

export interface DashboardData {
  user: {
    id: string
    name: string
    email: string
    onboarding_completed: boolean
  }
  profile: {
    college?: string
    degree?: string
    branch?: string
    year?: number
    target_career?: string
    target_job_role?: string
    skills: string[]
  }
  scores: PlacementScore & { placement_readiness?: number; score_label: string }
  recent_conversations: Conversation[]
  active_study_plans: StudyPlanSummary[]
  upcoming_tasks: TaskSummary[]
  applications: { total: number; active: number }
  recent_interviews: InterviewSummary[]
}

export interface StudyPlanSummary {
  id: string
  subject: string
  progress: number
  exam_date?: string
}

export interface TaskSummary {
  id: string
  title: string
  topic?: string
  scheduled_date?: string
  priority: number
}

export interface InterviewSummary {
  id: string
  type: string
  score?: number
  role?: string
  created_at: string
}

export interface Job {
  id: string
  title: string
  company: string
  location?: string
  job_type?: string
  description?: string
  required_skills: string[]
  nice_to_have_skills: string[]
  experience_required?: string
  salary_range?: string
  match_score?: number
  is_demo: boolean
}

export interface JobApplication {
  id: string
  job: Job
  status: ApplicationStatus
  applied_date?: string
  deadline?: string
  notes?: string
}

export type ApplicationStatus =
  | "saved"
  | "applied"
  | "assessment"
  | "technical_interview"
  | "hr_interview"
  | "selected"
  | "rejected"

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  action_url?: string
  created_at: string
}

export interface OnboardingData {
  college?: string
  degree?: string
  branch?: string
  year?: number
  skills: string[]
  interests: string[]
  target_career?: string
  target_job_role?: string
  experience_level: string
  cgpa?: number
}
