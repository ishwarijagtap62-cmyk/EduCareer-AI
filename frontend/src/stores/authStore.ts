/**
 * Zustand auth store — user session state.
 */
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { User } from "@/types"
import { tokenStorage } from "@/services/api"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  login: (tokens: any, user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),

      login: (tokens, user) => {
        tokenStorage.set(tokens.access_token, tokens.refresh_token)
        set({ user, isAuthenticated: true, isLoading: false })
      },

      logout: () => {
        tokenStorage.clear()
        set({ user: null, isAuthenticated: false })
      },
    }),
    {
      name: "educareer-auth",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
