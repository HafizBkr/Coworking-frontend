"use client"

import type React from "react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { TaskCard } from "./task-card"
import type { Task, Status, Column } from "@/types/kanban"

interface KanbanColumnProps {
  column: Column
  tasks: Task[]
  onMoveTask: (taskId: string, newStatus: Status) => void
  onDeleteTask: (taskId: string) => void
  onAssignTask: (taskId: string, assignee: string) => void
}

export function KanbanColumn({ column, tasks, onMoveTask, onDeleteTask, onAssignTask }: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const taskId = e.dataTransfer.getData("text/plain");
    console.log({taskId: taskId, column: column.id})
    if (taskId) {
      onMoveTask(taskId, column.id)
    }
  }

  return (
    <div className="dark:bg-secondary rounded-lg shadow-sm dark:shadow-none border">
      <div className={`p-4 rounded-t-lg ${column.color}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">{column.title}</h3>
          <Badge variant="secondary" >
            {tasks.length}
          </Badge>
        </div>
      </div>

      <div
        className={`p-4 space-y-3 min-h-[500px] transition-colors duration-200 ${
          isDragOver ? "dark:bg-secondary border-2 border-dashed border-blue-500" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            {isDragOver ? "Déposez la tâche ici" : "Aucune tâche"}
          </div>
        )}

        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onAssignTask={onAssignTask}
            onMoveTask={onMoveTask}
            onDeleteTask={onDeleteTask}
            currentStatus={column.id}
          />
        ))}
      </div>
    </div>
  )
}
