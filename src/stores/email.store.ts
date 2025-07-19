import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface EmailStore {
  email: string | null
  setEmail: (email: string|null) => void
  clearEmail: () => void
}

export const useEmailStore = create<EmailStore>()(
  persist(
    (set) => ({
      email: null,
      setEmail: (email: string|null) => set({ email }),
      clearEmail: () => set({ email: null }),
    }),
    {
      name: 'email-storage',
    }
  )
)
