import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Workspace } from '@/models/worksapce.model'

interface WorkspaceStore {
  currentWorkspace: Workspace | null
  setCurrentWorkspace: (workspace: Workspace) => void
  clearCurrentWorkspace: () => void
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set) => ({
      currentWorkspace: null,
      setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
      clearCurrentWorkspace: () => set({ currentWorkspace: null }),
    }),
    {
      name: 'workspace-storage',
    }
  )
)
