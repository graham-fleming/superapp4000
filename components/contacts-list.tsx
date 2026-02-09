"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { toast } from "sonner"
import {
  Plus,
  Search,
  Mail,
  Phone,
  Building2,
  MoreHorizontal,
  Trash2,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { createContact, deleteContact } from "@/app/(app)/contacts/actions"
import { useAuthGate } from "@/components/auth-gate"
import { MockDataBanner, EmptyUserBanner } from "@/components/mock-data-banner"

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

const statusColors: Record<string, string> = {
  lead: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  active: "bg-success/15 text-success border-success/30",
  inactive: "bg-muted text-muted-foreground border-border",
}

async function fetcher(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

export function ContactsList({
  initialContacts,
  isGuest = false,
  showingMockData = false,
  hideHeader = false,
}: {
  initialContacts: Contact[]
  isGuest?: boolean
  showingMockData?: boolean
  hideHeader?: boolean
}) {
  const router = useRouter()
  const { requireAuth } = useAuthGate()
  const { data: contacts, mutate } = useSWR<Contact[]>(
    (isGuest || showingMockData) ? null : "/api/contacts",
    fetcher,
    { fallbackData: initialContacts }
  )
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filtered = (contacts ?? initialContacts).filter((c) => {
    const fullName = `${c.first_name} ${c.last_name ?? ""}`.toLowerCase()
    const q = search.toLowerCase()
    return (
      fullName.includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q)
    )
  })

  function handleAddClick() {
    if (!requireAuth("add a contact")) return
    setDialogOpen(true)
  }

  async function handleCreate(formData: FormData) {
    setIsSubmitting(true)
    try {
      const result = await createContact(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Contact created")
        setDialogOpen(false)
        mutate()
        router.refresh()
      }
    } catch {
      toast.error("Failed to create contact")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!requireAuth("delete a contact")) return
    try {
      const result = await deleteContact(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Contact deleted")
        mutate()
        router.refresh()
      }
    } catch {
      toast.error("Failed to delete contact")
    }
  }

  function handleViewDetails(id: string) {
    if (isGuest) {
      requireAuth("view contact details")
      return
    }
    router.push(`/projects/contacts/${id}`)
  }

  function getInitials(firstName: string, lastName: string | null) {
    return `${firstName[0]}${lastName?.[0] ?? ""}`.toUpperCase()
  }

  function getFullName(firstName: string, lastName: string | null) {
    return lastName ? `${firstName} ${lastName}` : firstName
  }

  return (
    <div className="flex flex-col gap-6">
      {isGuest && <MockDataBanner dataType="contacts" />}
      {showingMockData && (
        <EmptyUserBanner dataType="contacts" actionLabel="Add your first contact" />
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {!hideHeader && (
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Contacts</h1>
            <p className="text-sm text-muted-foreground">
              Manage your contacts and relationships
            </p>
          </div>
        )}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddClick}>
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
            </DialogHeader>
            <form action={handleCreate} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input id="first_name" name="first_name" required placeholder="John" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input id="last_name" name="last_name" placeholder="Doe" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="john@example.com" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" placeholder="+1 (555) 000-0000" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" name="company" placeholder="Acme Inc." />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" name="role" placeholder="CEO" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue="lead">
                  <SelectTrigger>
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
                <Textarea id="notes" name="notes" placeholder="Any additional notes..." rows={3} />
              </div>
              <Button type="submit" disabled={isSubmitting} className="mt-2">
                {isSubmitting ? "Creating..." : "Create Contact"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No contacts found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {search ? "Try adjusting your search" : "Add your first contact to get started"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((contact) => (
            <Card key={contact.id} className="transition-colors hover:bg-accent/50">
              <CardContent className="flex items-center gap-4 p-4">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    {getInitials(contact.first_name, contact.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">
                      {getFullName(contact.first_name, contact.last_name)}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      {contact.email && (
                        <span className="flex items-center gap-1 truncate">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{contact.email}</span>
                        </span>
                      )}
                      {contact.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 shrink-0" />
                          {contact.phone}
                        </span>
                      )}
                      {contact.company && (
                        <span className="flex items-center gap-1 truncate">
                          <Building2 className="h-3 w-3 shrink-0" />
                          <span className="truncate">{contact.company}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`shrink-0 capitalize ${statusColors[contact.status] ?? ""}`}
                  >
                    {contact.status}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewDetails(contact.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(contact.id)}
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
