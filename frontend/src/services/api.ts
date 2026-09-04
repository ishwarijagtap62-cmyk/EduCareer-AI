/**
 * API service layer — all backend calls go through here.
 * Handles token injection, refresh, and error normalization.
 * GROQ_API_KEY is NEVER accessed here — stays server-side only.
 */
import axios, { AxiosError, AxiosInstance } from "axios"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

export const tokenStorage = {
  getAccess: () =>
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null,
  getRefresh: () =>
    typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null,
  set: (access: string, refresh: string) => {
    localStorage.setItem("access_token", access)
    localStorage.setItem("refresh_token", refresh)
  },
  clear: () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user")
  },
}

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 60000,
})

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      tokenStorage.getRefresh()
    ) {
      originalRequest._retry = true
      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh_token: tokenStorage.getRefresh(),
        })
        tokenStorage.set(data.access_token, data.refresh_token)
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`
        return api(originalRequest)
      } catch {
        tokenStorage.clear()
        if (typeof window !== "undefined") window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)

export default api

// ---- Auth ----
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post("/auth/register", data).then((r) => r.data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data).then((r) => r.data),
  onboarding: (data: object) =>
    api.post("/auth/onboarding", data).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
}

// ---- Chat ----
export const chatApi = {
  getConversations: () =>
    api.get("/chat/conversations").then((r) => r.data),
  createConversation: (data: { title?: string; mode?: string }) =>
    api.post("/chat/conversations", data).then((r) => r.data),
  getMessages: (conversationId: string) =>
    api.get(`/chat/conversations/${conversationId}/messages`).then((r) => r.data),
  updateConversation: (id: string, data: { title: string }) =>
    api.patch(`/chat/conversations/${id}`, data).then((r) => r.data),
  deleteConversation: (id: string) =>
    api.delete(`/chat/conversations/${id}`),
  sendMessage: (data: {
    conversation_id?: string
    message: string
    mode?: string
    document_ids?: string[]
  }) => api.post("/chat/send", data).then((r) => r.data),
  submitFeedback: (messageId: string, feedback: "thumbs_up" | "thumbs_down") =>
    api.post(`/chat/messages/${messageId}/feedback`, { feedback }).then((r) => r.data),
  getStreamUrl: () => `${BASE_URL}/chat/stream`,
  getAccessToken: () => tokenStorage.getAccess(),
}

// ---- Profile ----
export const profileApi = {
  get: () => api.get("/profile/").then((r) => r.data),
  update: (data: object) => api.patch("/profile/", data).then((r) => r.data),
  addSkill: (data: { name: string; category?: string; level?: string; proficiency?: number }) =>
    api.post("/profile/skills", data).then((r) => r.data),
  deleteSkill: (skillId: string) => api.delete(`/profile/skills/${skillId}`),
  addProject: (data: object) => api.post("/profile/projects", data).then((r) => r.data),
  getPlacementScore: () => api.get("/profile/placement-score").then((r) => r.data),
}

// ---- Dashboard ----
export const dashboardApi = {
  get: () => api.get("/dashboard/").then((r) => r.data),
}

// ---- Documents ----
export const documentsApi = {
  upload: (
    file: File,
    metadata: { document_type?: string; subject?: string; description?: string }
  ) => {
    const form = new FormData()
    form.append("file", file)
    if (metadata.document_type) form.append("document_type", metadata.document_type)
    if (metadata.subject) form.append("subject", metadata.subject)
    if (metadata.description) form.append("description", metadata.description)
    return api
      .post("/documents/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data)
  },
  list: () => api.get("/documents/").then((r) => r.data),
  delete: (id: string) => api.delete(`/documents/${id}`),
}

// ---- Career ----
export const careerApi = {
  analyzeSkillGap: (data: { target_role: string; target_skills?: string[] }) =>
    api.post("/career/skill-gap", data).then((r) => r.data),
  whatIf: (data: { skills_to_add: string[] }) =>
    api.post("/career/what-if", data).then((r) => r.data),
  generateRoadmap: (data: { target_role: string; current_level?: string }) =>
    api.post("/career/roadmap", data).then((r) => r.data),
  getRecommendations: () =>
    api.get("/career/recommendations").then((r) => r.data),
}

// ---- Study ----
export const studyApi = {
  getPlans: () => api.get("/study/plans").then((r) => r.data),
  createPlan: (data: {
    subject: string
    exam_date?: string
    available_hours_per_day?: number
    current_knowledge?: string
    target_score?: number
  }) => api.post("/study/plans", data).then((r) => r.data),
  getPlan: (planId: string) =>
    api.get(`/study/plans/${planId}`).then((r) => r.data),
  updateTask: (taskId: string, status: string) =>
    api.patch(`/study/tasks/${taskId}`, { status }).then((r) => r.data),
  getExamPrep: (subject: string, examDate?: string) =>
    api.post(`/study/exam-prep?subject=${encodeURIComponent(subject)}${examDate ? `&exam_date=${examDate}` : ""}`).then((r) => r.data),
}

// ---- Interview ----
export const interviewApi = {
  start: (data: { interview_type?: string; target_role?: string; subject?: string }) =>
    api.post("/interview/start", data).then((r) => r.data),
  answer: (interviewId: string, answer: string) =>
    api.post(`/interview/${interviewId}/answer`, { answer }).then((r) => r.data),
  getHistory: () => api.get("/interview/history").then((r) => r.data),
  startViva: (data: { subject: string; topic?: string; difficulty?: string }) =>
    api.post("/interview/viva/start", data).then((r) => r.data),
  answerViva: (vivaId: string, answer: string) =>
    api.post(`/interview/viva/${vivaId}/answer`, { answer }).then((r) => r.data),
}

// ---- Jobs ----
export const jobsApi = {
  list: (params?: { role?: string; job_type?: string }) =>
    api.get("/jobs/", { params }).then((r) => r.data),
  get: (id: string) => api.get(`/jobs/${id}`).then((r) => r.data),
  getApplications: () => api.get("/jobs/applications/list").then((r) => r.data),
  createApplication: (data: { job_id: string; status?: string; notes?: string }) =>
    api.post("/jobs/applications", data).then((r) => r.data),
  updateApplication: (id: string, data: { status: string; notes?: string }) =>
    api.patch(`/jobs/applications/${id}`, data).then((r) => r.data),
}

// ---- Analytics ----
export const analyticsApi = {
  getOverview: () => api.get("/analytics/overview").then((r) => r.data),
  getSkillGrowth: () => api.get("/analytics/skill-growth").then((r) => r.data),
  getInterviewPerformance: () =>
    api.get("/analytics/interview-performance").then((r) => r.data),
}
