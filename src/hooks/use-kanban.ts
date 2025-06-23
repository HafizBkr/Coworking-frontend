"use client"

import { useState } from "react"
import type { Task, Status, NewTaskForm } from "../types/kanban"
import { initialTasks } from "../data/initial-tasks"

export function useKanban() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const getTasksByStatus = (status: Status) => {
    return filteredTasks.filter((task) => task.status === status)
  }

  const addTask = (newTaskData: NewTaskForm) => {
    if (newTaskData.title.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTaskData.title,
        description: newTaskData.description,
        priority: newTaskData.priority,
        assignee: {
          name: newTaskData.assignee || "Non assigné",
          avatar: "/placeholder.svg?height=32&width=32",
          initials:
            newTaskData.assignee
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase() || "NA",
        },
        dueDate: newTaskData.dueDate,
        status: "todo",
        tags: newTaskData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      }
      setTasks([...tasks, task])
      return true
    }
    return false
  }

  const moveTask = (taskId: string, newStatus: Status) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)))
  }

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
  }

  return {
    tasks,
    filteredTasks,
    searchTerm,
    setSearchTerm,
    getTasksByStatus,
    addTask,
    moveTask,
    deleteTask,
  }
}
