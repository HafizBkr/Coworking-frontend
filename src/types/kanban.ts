export type Priority = "low" | "medium" | "high"
export type Status = "todo" | "in-progress" | "done"

export interface Task {
  id: string
  title: string
  description: string
  priority: Priority
  assignee: {
    name: string
    avatar: string
    initials: string
  }
  dueDate: string
  status: Status
  tags: string[]
}

export interface Column {
  id: Status
  title: string
  color: string
}

export interface NewTaskForm {
  title: string
  description: string
  priority: Priority
  assignee: string
  dueDate: string
  tags: string
}
