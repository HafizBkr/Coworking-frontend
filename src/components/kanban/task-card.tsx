"use client"

import type React from "react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { MoreHorizontal, Calendar, Flag } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Task, Status } from "@/types/kanban"
import { priorityColors, priorityLabels } from "@/constants/kanban"
import { useState } from "react"

interface TaskCardProps {
  task: Task
  onMoveTask: (taskId: string, newStatus: Status) => void
  onDeleteTask: (taskId: string) => void
  onAssignTask: (taskId: string, assignee: string) => void
  currentStatus: Status
}

export function TaskCard({ task, onMoveTask, onDeleteTask, currentStatus }: TaskCardProps) {
  const [isOpenAssigning, setIsOpenAssigning] = useState(false);
  
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", task._id)
    e.dataTransfer.effectAllowed = "move"
  }

  return (
    <>
    <Card
      className="cursor-grab gap-3 hover:shadow-md transition-all duration-200 active:cursor-grabbing active:rotate-3 active:scale-105"
      draggable
      onDragStart={handleDragStart}
    >
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between">
          <h4 className="font-medium text-md leading-tight">{task.title}</h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {currentStatus !== "todo" && (
                <DropdownMenuItem onClick={() => onMoveTask(task._id, "todo")}>Déplacer vers À faire</DropdownMenuItem>
              )}
              {currentStatus !== "in_progress" && (
                <DropdownMenuItem onClick={() => onMoveTask(task._id, "in_progress")}>
                  Déplacer vers En cours
                </DropdownMenuItem>
              )}
              {currentStatus !== "done" && (
                <DropdownMenuItem onClick={() => onMoveTask(task._id, "done")}>Déplacer vers Terminé</DropdownMenuItem>
              )}

              <DropdownMenuItem onClick={() => setIsOpenAssigning(true)}>
                Assigner
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => onDeleteTask(task._id)} className="text-red-600">
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>

        <div className="flex items-center justify-between">
          {/* <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-xs">{task.assignee.initials}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-600">{task.assignee.name}</span>
          </div> */}

          <Badge className={`text-xs ${priorityColors[task.priority]}`}>
            <Flag className="w-3 h-3 mr-1" />
            {priorityLabels[task.priority]}
          </Badge>
        </div>

        {task.dueDate && (
          <Badge variant="secondary" className="flex items-center gap-1 mt-4 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {new Date(task.dueDate).toLocaleDateString("fr-FR")}
          </Badge>
        )}
      </CardContent>
    </Card>
    <AssignTaskDialog open={isOpenAssigning} setOpen={setIsOpenAssigning}/>
    </>
  )
}

function AssignTaskForm() {
  return (
   <Card>
    <CardHeader>
        <CardTitle>Assigner une tâche</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center gap-2">

      </div>
    </CardContent>
   </Card>
  )
}


export function AssignTaskDialog({ open, setOpen }:
    { 
        open: boolean
        setOpen: (e: false)=> void
    }) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
            <AssignTaskForm/>
        </DialogContent>
    </Dialog>
  )
}


