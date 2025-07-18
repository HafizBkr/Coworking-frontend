/* eslint-disable react/react-in-jsx-scope */
import { Card, CardContent } from "@/components/ui/card"
import type { Task, Status } from "@/types/kanban"

interface TaskStatsProps {
  tasks: Task[]
  getTasksByStatus: (status: Status) => Task[]
}

export function TaskStats({ tasks, getTasksByStatus }: TaskStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-blue-600">{getTasksByStatus("todo").length}</div>
          <div className="text-muted-foreground">Tâches à faire</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-yellow-600">{getTasksByStatus("in_progress").length}</div>
          <div className="text-muted-foreground">En cours</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-green-600">{getTasksByStatus("done").length}</div>
          <div className="text-muted-foreground">Terminées</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-2">
          <div className="text-2xl font-bold text-violet-600">{tasks?.length || 0}</div>
          <div className="text-muted-foreground">Total</div>
        </CardContent>
      </Card>
    </div>
  )
}
