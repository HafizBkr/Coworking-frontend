import type { Task } from "../types/kanban"

export const initialTasks: Task[] = [
  {
    _id: "1",
    title: "Conception de l'interface utilisateur",
    description: "Créer les maquettes pour la nouvelle fonctionnalité",
    priority: "high",
    assignee: { name: "Marie Dubois", avatar: "/placeholder.svg?height=32&width=32", initials: "MD" },
    dueDate: "2024-01-15",
    status: "todo",
    tags: ["Design", "UI/UX"],
  }
]
