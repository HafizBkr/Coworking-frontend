/* eslint-disable react/react-in-jsx-scope */
import { KanbanColumn } from "./kanban-column"
import { columns } from "@/constants/kanban"
import type { Task, Status } from "@/types/kanban"

interface KanbanBoardProps {
  getTasksByStatus: (status: Status) => Task[]
  onMoveTask: (taskId: string, newStatus: Status) => void
  onDeleteTask: (taskId: string) => void
  onAssignTask: (taskId: string, assignee: string) => void
}

export function KanbanBoard({ getTasksByStatus, onMoveTask, onDeleteTask, onAssignTask }: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          column={column}
          tasks={getTasksByStatus(column.id)}
          onMoveTask={onMoveTask}
          onDeleteTask={onDeleteTask}
          onAssignTask={onAssignTask}
        />
      ))}
    </div>
  )
}
