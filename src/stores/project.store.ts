import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Project } from '@/models/project.model'

interface ProjectStore {
  currentProject: Project | null
  setCurrentProject: (project: Project) => void
  clearCurrentProject: () => void
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      currentProject: null,
      setCurrentProject: (project) => set({ currentProject: project }),
      clearCurrentProject: () => set({ currentProject: null }),
    }),
    {
      name: 'project-storage',
    }
  )
)
