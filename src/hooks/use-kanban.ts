"use client"

import { useState, useEffect, useOptimistic, useTransition } from "react"
import { createTask, getAllTasks, updateTask } from "@/app/dashboard/projects/[projectId]/_services/task.service"
import type { Task, Status } from "../types/kanban"
import { useProjectStore } from "@/stores/project.store"
import { useWorkspaceStore } from "@/stores/workspace.store"

export function useKanban() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null);
  const { currentProject } = useProjectStore();
  const { currentWorkspace } = useWorkspaceStore();
  const [, startTransition] = useTransition();
  const projectId = currentProject?._id || "";
  const workspaceId = currentWorkspace?._id || "";

  // Optimistic state pour les tâches
  const [optimisticTasks, setOptimisticTasks] = useOptimistic<Task[]>(tasks)

  // Charger les tâches depuis l'API
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await getAllTasks(projectId)
        console.log({res: res})
        if (res.success) {
          const taskData = res.data as Task[]
          setTasks(taskData)
          // Utiliser startTransition pour les mises à jour optimistes
          startTransition(() => {
            setOptimisticTasks(taskData)
          })
        } else {
          setError(res.message ?? "Erreur inconnue")
        }
      } catch {
        setError("Erreur lors du chargement des tâches.")
      }
      setLoading(false)
    }
    if (projectId) fetchTasks()
  }, [projectId])

  const filteredTasks = optimisticTasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.tags && task.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  )

  const getTasksByStatus = (status: Status) => {
    return filteredTasks.filter((task) => task.status === status)
  }

  // Ajout d'une tâche via l'API
  const addTask = async (formData: FormData) => {
    setLoading(true)
    setError(null)
    try {
      const res = await createTask(formData, projectId, workspaceId)
      console.log({res: res})
      if (res.success) {
        const newTask = res.data as Task
        setTasks((prev) => [...prev, newTask])
        // Utiliser startTransition pour les mises à jour optimistes
        startTransition(() => {
          setOptimisticTasks((prev) => [...prev, newTask])
        })
        setLoading(false)
        return true
      } else {
        setError(res.message ?? "Erreur inconnue")
        // Conserver l'ancienne valeur en cas d'erreur
        startTransition(() => {
          setOptimisticTasks([...tasks])
        })
      }
    } catch {
      setError("Erreur lors de l'ajout de la tâche.")
    }
    setLoading(false)
    return false
  }

  // Déplacement de tâche avec update optimiste
  const moveTask = async (taskId: string, newStatus: Status) => {
    // Stocker la valeur actuelle avant la mise à jour
    const previousTasks = [...tasks];
    
    // Optimistic update avec startTransition
    startTransition(() => {
      setOptimisticTasks((prev) => prev.map((task) => (task._id === taskId ? { ...task, status: newStatus } : task)))
    })
    
    setLoading(true)
    setError(null)
    try {
      const res = await updateTask(newStatus, taskId)
      console.log({res: res})
      if (res.success) {
        setTasks((prev) => prev.map((task) => (task._id === taskId ? { ...task, status: newStatus } : task)))
        setLoading(false)
        return true
      } else {
        setError(res.message ?? "Erreur inconnue")
        // Rollback si erreur en utilisant la valeur précédente
        startTransition(() => {
          setOptimisticTasks(previousTasks)
        })
      }
    } catch {
      setError("Erreur lors du déplacement de la tâche.")
      // Rollback si erreur en utilisant la valeur précédente
      startTransition(() => {
        setOptimisticTasks(previousTasks)
      })
    }
    setLoading(false)
  }

  const deleteTask = (taskId: string) => {
    // Stocker la valeur actuelle avant la mise à jour
    const previousTasks = [...tasks];
    
    try {
      setTasks(tasks.filter((task) => task._id !== taskId))
      // Utiliser startTransition pour les mises à jour optimistes
      startTransition(() => {
        setOptimisticTasks(optimisticTasks.filter((task) => task._id !== taskId))
      })
    } catch {
      // Conserver l'ancienne valeur en cas d'erreur
      startTransition(() => {
        setOptimisticTasks(previousTasks)
      })
    }
  }

  const assignTask = (taskId: string, assigneeName: string) => {
    // Stocker la valeur actuelle avant la mise à jour
    const previousTasks = [...tasks];
    
    try {
      setTasks(tasks.map((task) =>
        task._id === taskId
          ? { ...task, assignee: { ...task.assignee, name: assigneeName } }
          : task
      ));
      // Utiliser startTransition pour les mises à jour optimistes
      startTransition(() => {
        setOptimisticTasks(optimisticTasks.map((task) =>
          task._id === taskId
            ? { ...task, assignee: { ...task.assignee, name: assigneeName } }
            : task
        ));
      })
    } catch  {
      // Conserver l'ancienne valeur en cas d'erreur
      startTransition(() => {
        setOptimisticTasks(previousTasks)
      })
    }
  };


  return {
    tasks: optimisticTasks,
    filteredTasks,
    searchTerm,
    setSearchTerm,
    getTasksByStatus,
    addTask,
    moveTask,
    deleteTask,
    assignTask,
    loading,
    error,

  }
}
