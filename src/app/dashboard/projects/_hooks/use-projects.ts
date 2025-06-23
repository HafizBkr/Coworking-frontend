import { Project } from '@/models/project.model'
import { useEffect, useState } from 'react'
import { getProjects } from '../_services/project.service'
import { useWorkspaceStore } from '@/stores/workspace.store'

export function useProjects() {
    const [projects, setProjects] = useState<Project[]>()
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const { currentWorkspace } = useWorkspaceStore();
    const workspaceId = currentWorkspace?._id

    useEffect(() => {
        if (!workspaceId) {
            setProjects([])
            setIsLoading(false)
            setError("Aucun workspace sélectionné")
            return
        }
        getProjects(workspaceId)
            .then((data) => {
                setProjects(data.data as Project[])
                setError(data.error || "")
            })
            .finally(() => setIsLoading(false))
    }, [workspaceId])

    return {
        projects,
        error,
        isLoading
    }
}
