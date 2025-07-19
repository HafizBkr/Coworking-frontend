/* eslint-disable react/react-in-jsx-scope */
"use client"
import { KanbanBoard } from "@/components/kanban/kanban-board"

import { useKanban } from "@/hooks/use-kanban"
import { SearchBar } from "./search-bar"
import { AddTaskDialog } from "./add-task-dialog"
import type { NewTaskForm } from "@/types/kanban"

export function KanbanDashboard() {
  const { getTasksByStatus,searchTerm,addTask, setSearchTerm , moveTask, deleteTask, assignTask, loading } = useKanban()
  // Fonction d'adaptation pour AddTaskDialog
  const handleAddTask = async (task: NewTaskForm) => {
    const formData = new FormData();
    formData.append("title", task.title);
    formData.append("description", task.description);
    formData.append("priority", task.priority);
    formData.append("status", task.status);
    formData.append("dueDate", task.dueDate);
    // Ajoute d'autres champs si besoin (ex: assignee, tags)
    if (task.assignee) formData.append("assignee", task.assignee);
    if (task.tags) formData.append("tags", task.tags);
    return await addTask(formData);
  };

  return (
      <div className="space-y-4 mx-auto">
        <div className="flex items-center justify-between">
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          <AddTaskDialog onAddTask={handleAddTask} />
        </div>
        {/* Kanban Board */}
        <KanbanBoard loading={loading} getTasksByStatus={getTasksByStatus} onMoveTask={moveTask} onDeleteTask={deleteTask} onAssignTask={assignTask} />
        {/* Stats */}

      </div>
  )
}
