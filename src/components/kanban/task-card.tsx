/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { MoreHorizontal, Calendar, Flag, Loader } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Task, Status } from "@/types/kanban"
import { priorityColors, priorityLabels } from "@/constants/kanban"
import { useState } from "react"
import { Input } from "../ui/input"
import { useActiveUsersWorkspaces } from "@/app/dashboard/_hooks/use-workspaces-members-active"
import { assignTask } from "@/app/dashboard/projects/[projectId]/_services/task.service"
import { createAvatar } from "@dicebear/core"
import { glass } from "@dicebear/collection"
import { toast } from "sonner"
import { useWorkspaceStore } from "@/stores/workspace.store"

interface TaskCardProps {
  task: Task
  onMoveTask: (taskId: string, newStatus: Status) => void
  onDeleteTask: (taskId: string) => void
  // onAssignTask: (taskId: string, assignee: string) => Promise<void>
  currentStatus: Status
}

export function TaskCard({ task, onMoveTask, onDeleteTask, currentStatus}: TaskCardProps) {
  const [isOpenAssigning, setIsOpenAssigning] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", task._id);
    e.dataTransfer.effectAllowed = "move";
  };

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
            {task.assignedTo && (
              <div className="flex bg-secondary rounded-full shrink-0 p-1 items-center gap-2">
                <img
                  src={createAvatar(glass, {
                    seed: task.assignedTo.username,
                  }).toDataUri()}
                  alt={task.assignedTo.username}
                  className="w-6 h-6 rounded-full"
                />
              
              <span className="text-xs text-gray-600">{task.assignedTo?.username}</span>
            </div>
          )}

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
      <AssignTaskDialog
        open={isOpenAssigning}
        setOpen={setIsOpenAssigning}
        taskId={task._id}
        taskName={task.title}
        // onAssign={onAssignTask}
      />
    </>
  );
}


function AssignTaskForm({ taskId, onClose, taskName }:{
  taskId: string;
  taskName: string;
  onClose: () => void;
  // onAssign: (taskId: string, userId: string) => Promise<void>;
}) {
  const { membersActive, isLoading } = useActiveUsersWorkspaces();
  const [search, setSearch] = useState("");
  const { currentWorkspace } = useWorkspaceStore();
  // const [assigning, setAssigning] = useState();
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");
  const [isPending, startTransition] = React.useTransition();
  const filteredMembers = membersActive?.filter(
    (m) => m.user?.username?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleAssign = async () => {
    setError("");
    startTransition(async () => {
      try {
        const result = await assignTask(taskId, userId, currentWorkspace?._id||"");
        if (!result.success) {
          throw new Error(result.message || "Erreur lors de l'assignation.");
        }
        toast.success(`Tâche "${taskName}" assignée avec succès à ${filteredMembers.find(m => m._id === userId)?.user?.username || "l'utilisateur"}.`);
        onClose();
      } catch (e: any) {
        setError(e?.message || "Erreur lors de l'assignation.");
      }
    });
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle>Assigner la tâche <span>&quot;{taskName}&quot;</span> a :</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          placeholder="Rechercher par username..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mb-3"
        />
        {isLoading ? (
          <div className=" w-full flex flex-col justify-center items-center h-32">
            <Loader className="animate-spin"/>
          </div>
        ) : (
          <div className="flex flex-col divide-y max-h-64 overflow-y-auto">
            {filteredMembers.length === 0 ? (
              <div className="text-sm text-center  text-muted-foreground">
                Aucun membre trouvé.
              </div>
            ) : (
              filteredMembers.map(member => (
                <div 
                onClick={() => setUserId(member?.user?._id||"")}
                key={member._id} 
                className={`flex items-center justify-between p-2 ${userId === member?.user?._id ? "bg-muted" : ""}`}>
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        createAvatar(glass,{
                            seed: member.user?.username
                          }).toDataUri()
                        }
                      alt={member.user?.username}
                      className="w-8 h-8 rounded-full"/>
                    <span className="text-sm">{member.user?.username}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          size={"lg"}
          disabled={!userId || isPending}
          loading={isPending}
          onClick={() => handleAssign()}
        >Assigner
        </Button>
      </CardFooter>
    </Card>
  );
}


export function AssignTaskDialog({ open, setOpen, taskId, taskName }:{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  taskId: string;
  taskName: string;
  // onAssign: (taskId: string, userId: string) => Promise<void>;
}) {
  const handleClose = () => setOpen(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0">
        <AssignTaskForm taskId={taskId} taskName={taskName} onClose={handleClose} />
      </DialogContent>
    </Dialog>
  );
}


