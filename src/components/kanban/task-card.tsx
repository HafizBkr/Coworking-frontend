"use client"

import type React from "react"

import { MoreHorizontal, Calendar, Flag } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Task, Status } from "@/types/kanban"
import { priorityColors, priorityLabels } from "@/constants/kanban"

interface TaskCardProps {
  task: Task
  onMoveTask: (taskId: string, newStatus: Status) => void
  onDeleteTask: (taskId: string) => void
  currentStatus: Status
}

export function TaskCard({ task, onMoveTask, onDeleteTask, currentStatus }: TaskCardProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", task.id)
    e.dataTransfer.effectAllowed = "move"
  }

  return (
    <Card
      className="cursor-grab hover:shadow-md transition-all duration-200 active:cursor-grabbing active:rotate-3 active:scale-105"
      draggable
      onDragStart={handleDragStart}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {currentStatus !== "todo" && (
                <DropdownMenuItem onClick={() => onMoveTask(task.id, "todo")}>Déplacer vers À faire</DropdownMenuItem>
              )}
              {currentStatus !== "in-progress" && (
                <DropdownMenuItem onClick={() => onMoveTask(task.id, "in-progress")}>
                  Déplacer vers En cours
                </DropdownMenuItem>
              )}
              {currentStatus !== "done" && (
                <DropdownMenuItem onClick={() => onMoveTask(task.id, "done")}>Déplacer vers Terminé</DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDeleteTask(task.id)} className="text-red-600">
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>

        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-xs">{task.assignee.initials}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-600">{task.assignee.name}</span>
          </div>

          <Badge className={`text-xs ${priorityColors[task.priority]}`}>
            <Flag className="w-3 h-3 mr-1" />
            {priorityLabels[task.priority]}
          </Badge>
        </div>

        {task.dueDate && (
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            {new Date(task.dueDate).toLocaleDateString("fr-FR")}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
