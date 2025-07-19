import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CodeStore {
  code: string | null
  setCode: (code: string|null) => void
  clearCode: () => void
}

export const useCodeStore = create<CodeStore>()(
  persist(
    (set) => ({
      code: null,
      setCode: (code: string|null) => set({ code }),
      clearCode: () => set({ code: null }),
    }),
    {
      name: 'code-storage',
    }
  )
)
