import type { Column, Priority } from "../types/kanban"

export const columns: Column[] = [
  { id: "todo", title: "À faire", color: "bg-blue-300" },
  { id: "in_progress", title: "En cours", color: "bg-yellow-300" },
  { id: "done", title: "Terminé", color: "bg-green-300" },
]

export const priorityColors: Record<Priority, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
}

export const priorityLabels: Record<Priority, string> = {
  low: "Faible",
  medium: "Moyenne",
  high: "Élevée",
}
