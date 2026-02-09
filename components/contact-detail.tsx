"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Calendar,
  Briefcase,
  Edit2,
  Save,
  X,
  Circle,
  Clock,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { updateContact } from "@/app/(app)/projects/contacts/[id]/actions"

type Contact = {
  id: string
  first_name: string
  last_name: string | null
  email: string | null
  phone: string | null
  company: string | null
  role: string | null
  status: string
  notes: string | null
  created_at: string
}

type Task = {
  id: string
  title: string
  status: string
  priority: string
  due_date: string | null
  created_at: string
}

const statusColors: Record<string, string> = {
  lead: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  active: "bg-success/15 text-success border-success/30",
  inactive: "bg-muted text-muted-foreground border-border",
}

const taskStatusIcons: Record<string, React.ReactNode> = {
  todo: <Circle className="h-4 w-4 text-muted-foreground" />,
  in_progress: <Clock className="h-4 w-4 text-primary" />,
  done: <CheckCircle2 className="h-4 w-4 text-success" />,
}

export function ContactDetail({
  contact,
  tasks,
}: {
  contact: Contact
  tasks: Task[]
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function getInitials(firstName: string, lastName: string | null) {
    return `${firstName[0]}${lastName?.[0] ?? ""}`.toUpperCase()
  }

  function getFullName(firstName: string, lastName: string | null) {
    return lastName ? `${firstName} ${lastName}` : firstName
  }

  async function handleSave(formData: FormData) {
    setIsSubmitting(true)
    try {
      const result = await updateContact(contact.id, formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Contact updated")
        setEditing(false)
        router.refresh()
      }
    } catch {
      toast.error("Failed to update contact")
    } finally {
      setIsSubmitting(false)
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  function formatShortDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to contacts</span>
          </Link>
        </Button>
        <div className="flex flex-1 items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(contact.first_name, contact.last_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {getFullName(contact.first_name, contact.last_name)}
            </h1>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`capitalize ${statusColors[contact.status] ?? ""}`}
              >
                {contact.status}
              </Badge>
              {contact.role && (
                <span className="text-sm text-muted-foreground">{contact.role}</span>
              )}
            </div>
          </div>
        </div>
        {!editing && (
          <Button variant="outline" onClick={() => setEditing(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              {editing ? (
                <form action={handleSave} className="flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        name="first_name"
                        defaultValue={contact.first_name}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        defaultValue={contact.last_name ?? ""}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={contact.email ?? ""}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        defaultValue={contact.phone ?? ""}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        name="company"
                        defaultValue={contact.company ?? ""}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="role">Role</Label>
                      <Input
                        id="role"
                        name="role"
                        defaultValue={contact.role ?? ""}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue={contact.status}>
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      defaultValue={contact.notes ?? ""}
                      rows={4}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="submit" disabled={isSubmitting}>
                      <Save className="mr-2 h-4 w-4" />
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditing(false)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {contact.email && (
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                          <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="text-sm font-medium text-foreground">
                            {contact.email}
                          </p>
                        </div>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                          <Phone className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="text-sm font-medium text-foreground">
                            {contact.phone}
                          </p>
                        </div>
                      </div>
                    )}
                    {contact.company && (
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Company</p>
                          <p className="text-sm font-medium text-foreground">
                            {contact.company}
                          </p>
                        </div>
                      </div>
                    )}
                    {contact.role && (
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                          <Briefcase className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Role</p>
                          <p className="text-sm font-medium text-foreground">
                            {contact.role}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Added</p>
                        <p className="text-sm font-medium text-foreground">
                          {formatDate(contact.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                  {contact.notes && (
                    <div className="rounded-lg border border-border bg-muted/50 p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Notes
                      </p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {contact.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Linked Tasks</CardTitle>
              <Badge variant="secondary">{tasks.length}</Badge>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No tasks linked to this contact
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 rounded-lg border border-border p-3"
                    >
                      {taskStatusIcons[task.status] ?? taskStatusIcons.todo}
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-medium ${
                            task.status === "done"
                              ? "line-through text-muted-foreground"
                              : "text-foreground"
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className="text-xs capitalize"
                          >
                            {task.priority}
                          </Badge>
                          {task.due_date && (
                            <span className="text-xs text-muted-foreground">
                              {formatShortDate(task.due_date)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
