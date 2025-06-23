/* eslint-disable react/react-in-jsx-scope */
"use client"
import { KanbanBoard } from "@/components/kanban/kanban-board"
import { TaskStats } from "@/components/kanban/task-stats"
import { useKanban } from "@/hooks/use-kanban"
import { SearchBar } from "./search-bar"

export function KanbanDashboard() {
  const { tasks, getTasksByStatus,searchTerm, setSearchTerm , moveTask, deleteTask } = useKanban()

  return (
      <div className="space-y-4 mx-auto">
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        {/* Kanban Board */}
        <KanbanBoard getTasksByStatus={getTasksByStatus} onMoveTask={moveTask} onDeleteTask={deleteTask} />
        {/* Stats */}
        <div className="mt-8">
          <TaskStats tasks={tasks} getTasksByStatus={getTasksByStatus} />
        </div>
      </div>
  )
}
