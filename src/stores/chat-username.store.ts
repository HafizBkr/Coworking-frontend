import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ChatUsernameState {
  username: string 
  setUsername: (username: string) => void
  clearUsername: () => void
}

export const useChatUsernameStore = create<ChatUsernameState>()(
  persist(
    (set) => ({
      username: "",
      setUsername: (username: string) => set({ username }),
      clearUsername: () => set({ username: "" }),
    }),
    {
      name: 'chat-username-storage', // nom de la clé dans le localStorage
    }
  )
)
