"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { toast } from "sonner"
import {
  Plus,
  Search,
  Circle,
  Clock,
  CheckCircle2,
  MoreHorizontal,
  Trash2,
  ArrowUpCircle,
  ArrowRightCircle,
  ArrowDownCircle,
  Calendar,
  User2,
  ListTodo,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createTask, updateTaskStatus, deleteTask } from "@/app/(app)/tasks/actions"
import { useAuthGate } from "@/components/auth-gate"
import { MockDataBanner, EmptyUserBanner } from "@/components/mock-data-banner"

type Task = {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  due_date: string | null
  contact_id: string | null
  contacts: { first_name: string; last_name: string | null } | null
  created_at: string
}

type ContactOption = {
  id: string
  name: string
}

const statusIcons: Record<string, React.ReactNode> = {
  todo: <Circle className="h-4 w-4 text-muted-foreground" />,
  in_progress: <Clock className="h-4 w-4 text-primary" />,
  done: <CheckCircle2 className="h-4 w-4 text-success" />,
}

const statusLabels: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
}

const priorityConfig: Record<string, { icon: React.ReactNode; class: string }> = {
  low: {
    icon: <ArrowDownCircle className="h-3.5 w-3.5" />,
    class: "bg-muted text-muted-foreground border-border",
  },
  medium: {
    icon: <ArrowRightCircle className="h-3.5 w-3.5" />,
    class: "bg-warning/15 text-warning border-warning/30",
  },
  high: {
    icon: <ArrowUpCircle className="h-3.5 w-3.5" />,
    class: "bg-destructive/15 text-destructive border-destructive/30",
  },
}

async function fetcher(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

export function TasksList({
  initialTasks,
  contacts,
  isGuest = false,
  showingMockData = false,
  hideHeader = false,
}: {
  initialTasks: Task[]
  contacts: ContactOption[]
  isGuest?: boolean
  showingMockData?: boolean
  hideHeader?: boolean
}) {
  const router = useRouter()
  const { requireAuth } = useAuthGate()
  const { data: tasks, mutate } = useSWR<Task[]>(
    (isGuest || showingMockData) ? null : "/api/tasks",
    fetcher,
    { fallbackData: initialTasks }
  )
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filtered = (tasks ?? initialTasks).filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === "all" || t.status === filterStatus
    return matchSearch && matchStatus
  })

  function handleAddClick() {
    if (!requireAuth("add a task")) return
    setDialogOpen(true)
  }

  async function handleCreate(formData: FormData) {
    setIsSubmitting(true)
    try {
      const result = await createTask(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Task created")
        setDialogOpen(false)
        mutate()
        router.refresh()
      }
    } catch {
      toast.error("Failed to create task")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleStatusChange(id: string, status: string) {
    if (!requireAuth("update a task")) return
    try {
      const result = await updateTaskStatus(id, status)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Task updated")
        mutate()
        router.refresh()
      }
    } catch {
      toast.error("Failed to update task")
    }
  }

  async function handleDelete(id: string) {
    if (!requireAuth("delete a task")) return
    try {
      const result = await deleteTask(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Task deleted")
        mutate()
        router.refresh()
      }
    } catch {
      toast.error("Failed to delete task")
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {isGuest && <MockDataBanner dataType="tasks" />}
      {showingMockData && (
        <EmptyUserBanner dataType="tasks" actionLabel="Create your first task" />
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {!hideHeader && (
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tasks</h1>
            <p className="text-sm text-muted-foreground">Track and manage your work</p>
          </div>
        )}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddClick}>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <form action={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" name="title" required placeholder="Task title" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the task..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select name="priority" defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue="todo">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input id="due_date" name="due_date" type="date" />
              </div>
              {contacts.length > 0 && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="contact_id">Linked Contact</Label>
                  <Select name="contact_id">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a contact (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button type="submit" disabled={isSubmitting} className="mt-2">
                {isSubmitting ? "Creating..." : "Create Task"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ListTodo className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No tasks found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {search || filterStatus !== "all"
                ? "Try adjusting your filters"
                : "Add your first task to get started"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((task) => (
            <Card key={task.id} className="transition-colors hover:bg-accent/50">
              <CardContent className="flex items-center gap-4 p-4">
                <button
                  type="button"
                  onClick={() =>
                    handleStatusChange(
                      task.id,
                      task.status === "done" ? "todo" : "done"
                    )
                  }
                  className="shrink-0"
                  aria-label={task.status === "done" ? "Mark as todo" : "Mark as done"}
                >
                  {statusIcons[task.status] ?? statusIcons.todo}
                </button>
                <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <p
                      className={`font-medium ${
                        task.status === "done"
                          ? "line-through text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      {task.due_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 shrink-0" />
                          {formatDate(task.due_date)}
                        </span>
                      )}
                      {task.contacts?.first_name && (
                        <span className="flex items-center gap-1 truncate">
                          <User2 className="h-3 w-3 shrink-0" />
                          <span className="truncate">
                            {task.contacts.first_name} {task.contacts.last_name ?? ""}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`shrink-0 capitalize ${
                        priorityConfig[task.priority]?.class ?? ""
                      }`}
                    >
                      {priorityConfig[task.priority]?.icon}
                      <span className="ml-1">{task.priority}</span>
                    </Badge>
                    <Badge variant="secondary" className="shrink-0 capitalize">
                      {statusLabels[task.status] ?? task.status}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStatusChange(task.id, "todo")}>
                      <Circle className="mr-2 h-4 w-4" />
                      To Do
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(task.id, "in_progress")}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(task.id, "done")}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Done
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(task.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
