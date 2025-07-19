import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ChatIdState {
  chatId: string 
  setChatId: (id: string) => void
  clearChatId: () => void
}

export const useChatIdStore = create<ChatIdState>()(
  persist(
    (set) => ({
      chatId: "",
      setChatId: (id: string) => set({ chatId: id }),
      clearChatId: () => set({ chatId: "" }),
    }),
    {
      name: 'chat-id-storage', // nom de la clé dans le localStorage
    }
  )
)
