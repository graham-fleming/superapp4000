"use client"

import React, { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { toast } from "sonner"
import {
  Plus,
  Search,
  Trash2,
  MoreHorizontal,
  CalendarDays,
  Pencil,
  MapPin,
  Plane,
  Hotel,
  Utensils,
  Camera,
  Ticket,
  Clock,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  CheckCircle2,
  CircleDot,
  CircleDashed,
  Bookmark,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  ResponsiveContainer,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts"
import {
  createTrip,
  updateTrip,
  deleteTrip,
  createActivity,
  updateActivity,
  deleteActivity,
  createExpense,
  updateExpense,
  deleteExpense,
} from "@/app/(app)/travel/actions"
import { useAuthGate } from "@/components/auth-gate"
import { MockDataBanner, EmptyUserBanner } from "@/components/mock-data-banner"

// ── Types ──

export type Trip = {
  id: string
  destination: string
  description: string | null
  status: string
  start_date: string | null
  end_date: string | null
  budget: number | null
  currency: string
  cover_color: string | null
  tags: string[]
  created_at: string
}

export type TripActivity = {
  id: string
  trip_id: string
  title: string
  description: string | null
  activity_date: string | null
  start_time: string | null
  end_time: string | null
  location: string | null
  category: string
  cost: number | null
  is_booked: boolean
  created_at: string
}

export type TripExpense = {
  id: string
  trip_id: string
  title: string
  amount: number
  category: string
  expense_date: string | null
  notes: string | null
  created_at: string
}

// ── Config ──

const STATUS_CONFIG: Record<string, { label: string; color: string; bgClass: string; icon: React.ElementType }> = {
  planning: { label: "Planning", color: "#6366f1", bgClass: "bg-indigo-500/15 text-indigo-600", icon: CircleDashed },
  booked: { label: "Booked", color: "#3b82f6", bgClass: "bg-blue-500/15 text-blue-600", icon: CircleDot },
  in_progress: { label: "In Progress", color: "#f59e0b", bgClass: "bg-amber-500/15 text-amber-600", icon: Plane },
  completed: { label: "Completed", color: "#22c55e", bgClass: "bg-green-500/15 text-green-600", icon: CheckCircle2 },
}

const ACTIVITY_CATEGORIES: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  transport: { label: "Transport", icon: Plane, color: "#3b82f6" },
  accommodation: { label: "Accommodation", icon: Hotel, color: "#8b5cf6" },
  food: { label: "Food", icon: Utensils, color: "#f59e0b" },
  sightseeing: { label: "Sightseeing", icon: Camera, color: "#ec4899" },
  activity: { label: "Activity", icon: Ticket, color: "#22c55e" },
  other: { label: "Other", icon: Bookmark, color: "#6b7280" },
}

const EXPENSE_CATEGORIES: Record<string, { label: string; color: string }> = {
  transport: { label: "Transport", color: "#3b82f6" },
  accommodation: { label: "Accommodation", color: "#8b5cf6" },
  food: { label: "Food", color: "#f59e0b" },
  activities: { label: "Activities", color: "#22c55e" },
  shopping: { label: "Shopping", color: "#ec4899" },
  other: { label: "Other", color: "#6b7280" },
}

const TRIP_TAGS = ["beach", "city", "adventure", "culture", "food", "nature", "romantic", "business", "road-trip", "wellness"]

const COVER_COLORS = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#6366f1", "#ec4899", "#14b8a6", "#8b5cf6"]

async function fetcher(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

// ── Component ──

interface TravelContentProps {
  initialTrips: Trip[]
  initialActivities: TripActivity[]
  initialExpenses: TripExpense[]
  isGuest?: boolean
  showingMockData?: boolean
}

export function TravelContent({
  initialTrips,
  initialActivities,
  initialExpenses,
  isGuest = false,
  showingMockData = false,
}: TravelContentProps) {
  const router = useRouter()
  const { requireAuth } = useAuthGate()
  const skipFetch = isGuest || showingMockData
  const { data: trips, mutate: mutateTrips } = useSWR<Trip[]>(
    skipFetch ? null : "/api/trips",
    fetcher,
    { fallbackData: initialTrips },
  )
  const { data: activities, mutate: mutateActivities } = useSWR<TripActivity[]>(
    skipFetch ? null : "/api/trip-activities",
    fetcher,
    { fallbackData: initialActivities },
  )
  const { data: expenses, mutate: mutateExpenses } = useSWR<TripExpense[]>(
    skipFetch ? null : "/api/trip-expenses",
    fetcher,
    { fallbackData: initialExpenses },
  )

  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [tripDialogOpen, setTripDialogOpen] = useState(false)
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)
  const [editTripDialogOpen, setEditTripDialogOpen] = useState(false)
  const [activityDialogOpen, setActivityDialogOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<TripActivity | null>(null)
  const [editActivityDialogOpen, setEditActivityDialogOpen] = useState(false)
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<TripExpense | null>(null)
  const [editExpenseDialogOpen, setEditExpenseDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("home")

  const data = trips ?? initialTrips
  const actData = activities ?? initialActivities
  const expData = expenses ?? initialExpenses

  // ── Computed ──

  const today = new Date().toISOString().split("T")[0]

  const nextTrip = useMemo(() => {
    return data
      .filter((t) => t.start_date && t.start_date >= today && t.status !== "completed")
      .sort((a, b) => (a.start_date ?? "").localeCompare(b.start_date ?? ""))[0] ?? null
  }, [data, today])

  const daysUntilNext = useMemo(() => {
    if (!nextTrip?.start_date) return null
    const diff = new Date(nextTrip.start_date).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }, [nextTrip])

  const totalSpent = useMemo(() => expData.reduce((s, e) => s + Number(e.amount), 0), [expData])
  const completedTrips = useMemo(() => data.filter((t) => t.status === "completed").length, [data])
  const uniqueDestinations = useMemo(() => new Set(data.map((t) => t.destination.split(",")[0].trim())).size, [data])

  const filteredTrips = useMemo(() => {
    let list = data
    if (filterStatus !== "all") list = list.filter((t) => t.status === filterStatus)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (t) =>
          t.destination.toLowerCase().includes(q) ||
          (t.description?.toLowerCase().includes(q)) ||
          t.tags.some((tag) => tag.includes(q)),
      )
    }
    return list
  }, [data, filterStatus, search])

  // Itinerary: selected trip & grouped activities
  const selectedTrip = useMemo(() => data.find((t) => t.id === selectedTripId) ?? null, [data, selectedTripId])
  const tripActivities = useMemo(
    () => actData.filter((a) => a.trip_id === selectedTripId).sort((a, b) => {
      const d = (a.activity_date ?? "").localeCompare(b.activity_date ?? "")
      if (d !== 0) return d
      return (a.start_time ?? "").localeCompare(b.start_time ?? "")
    }),
    [actData, selectedTripId],
  )
  const groupedActivities = useMemo(() => {
    const map: Record<string, TripActivity[]> = {}
    for (const act of tripActivities) {
      const key = act.activity_date ?? "Unscheduled"
      if (!map[key]) map[key] = []
      map[key].push(act)
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
  }, [tripActivities])

  // Budget: expenses for selected trip
  const tripExpenses = useMemo(
    () => expData.filter((e) => e.trip_id === selectedTripId).sort((a, b) => (b.expense_date ?? "").localeCompare(a.expense_date ?? "")),
    [expData, selectedTripId],
  )
  const tripTotalSpent = useMemo(() => tripExpenses.reduce((s, e) => s + Number(e.amount), 0), [tripExpenses])
  const expByCat = useMemo(() => {
    const map: Record<string, number> = {}
    for (const e of tripExpenses) {
      map[e.category] = (map[e.category] || 0) + Number(e.amount)
    }
    return Object.entries(map)
      .map(([cat, total]) => ({
        name: EXPENSE_CATEGORIES[cat]?.label ?? cat,
        value: total,
        fill: EXPENSE_CATEGORIES[cat]?.color ?? "#6b7280",
      }))
      .sort((a, b) => b.value - a.value)
  }, [tripExpenses])

  // ── Helpers ──

  function mutateAll() {
    mutateTrips()
    mutateActivities()
    mutateExpenses()
  }

  function formatDate(d: string | null) {
    if (!d) return "TBD"
    return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  function formatDateShort(d: string | null) {
    if (!d) return "TBD"
    return new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  }

  function formatMoney(n: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
  }

  function tripDuration(t: Trip) {
    if (!t.start_date || !t.end_date) return null
    const diff = new Date(t.end_date).getTime() - new Date(t.start_date).getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  // ── Trip Form ──

  function TripForm({ trip, onDone }: { trip?: Trip | null; onDone: () => void }) {
    const [selectedTags, setSelectedTags] = useState<string[]>(trip?.tags ?? [])
    const [selectedColor, setSelectedColor] = useState(trip?.cover_color ?? COVER_COLORS[0])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault()
      if (!requireAuth()) return
      setIsSubmitting(true)
      const form = new FormData(e.currentTarget)
      form.set("tags", selectedTags.join(","))
      form.set("cover_color", selectedColor)
      const result = trip ? await updateTrip(trip.id, form) : await createTrip(form)
      setIsSubmitting(false)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(trip ? "Trip updated" : "Trip created")
        mutateAll()
        onDone()
      }
    }

    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="destination">Destination *</Label>
          <Input id="destination" name="destination" required defaultValue={trip?.destination ?? ""} placeholder="e.g. Tokyo, Japan" />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" defaultValue={trip?.description ?? ""} placeholder="What's the plan?" rows={2} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="start_date">Start Date</Label>
            <Input id="start_date" name="start_date" type="date" defaultValue={trip?.start_date ?? ""} />
          </div>
          <div>
            <Label htmlFor="end_date">End Date</Label>
            <Input id="end_date" name="end_date" type="date" defaultValue={trip?.end_date ?? ""} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="budget">Budget ($)</Label>
            <Input id="budget" name="budget" type="number" step="0.01" min="0" defaultValue={trip?.budget ?? ""} placeholder="0" />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={trip?.status ?? "planning"}>
              <SelectTrigger id="status"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label className="mb-1.5 block">Cover Color</Label>
          <div className="flex flex-wrap gap-2">
            {COVER_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`h-7 w-7 rounded-full border-2 transition-transform ${selectedColor === c ? "scale-110 border-foreground" : "border-transparent"}`}
                style={{ backgroundColor: c }}
                onClick={() => setSelectedColor(c)}
              />
            ))}
          </div>
        </div>
        <div>
          <Label className="mb-1.5 block">Tags</Label>
          <div className="flex flex-wrap gap-1.5">
            {TRIP_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                  selectedTags.includes(tag) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"
                }`}
                onClick={() =>
                  setSelectedTags((prev) =>
                    prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
                  )
                }
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        <Button type="submit" disabled={isSubmitting} className="mt-1">
          {isSubmitting ? "Saving..." : trip ? "Update Trip" : "Create Trip"}
        </Button>
      </form>
    )
  }

  // ── Activity Form ──

  function ActivityForm({ activity, tripId, onDone }: { activity?: TripActivity | null; tripId: string; onDone: () => void }) {
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault()
      if (!requireAuth()) return
      setIsSubmitting(true)
      const form = new FormData(e.currentTarget)
      form.set("trip_id", tripId)
      const result = activity ? await updateActivity(activity.id, form) : await createActivity(form)
      setIsSubmitting(false)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(activity ? "Activity updated" : "Activity added")
        mutateAll()
        onDone()
      }
    }

    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="act_title">Title *</Label>
          <Input id="act_title" name="title" required defaultValue={activity?.title ?? ""} placeholder="e.g. Visit Eiffel Tower" />
        </div>
        <div>
          <Label htmlFor="act_desc">Description</Label>
          <Textarea id="act_desc" name="description" defaultValue={activity?.description ?? ""} rows={2} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="act_date">Date</Label>
            <Input id="act_date" name="activity_date" type="date" defaultValue={activity?.activity_date ?? ""} />
          </div>
          <div>
            <Label htmlFor="act_start">Start</Label>
            <Input id="act_start" name="start_time" type="time" defaultValue={activity?.start_time ?? ""} />
          </div>
          <div>
            <Label htmlFor="act_end">End</Label>
            <Input id="act_end" name="end_time" type="time" defaultValue={activity?.end_time ?? ""} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="act_location">Location</Label>
            <Input id="act_location" name="location" defaultValue={activity?.location ?? ""} placeholder="e.g. Champ de Mars" />
          </div>
          <div>
            <Label htmlFor="act_category">Category</Label>
            <Select name="category" defaultValue={activity?.category ?? "other"}>
              <SelectTrigger id="act_category"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(ACTIVITY_CATEGORIES).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="act_cost">Est. Cost ($)</Label>
            <Input id="act_cost" name="cost" type="number" step="0.01" min="0" defaultValue={activity?.cost ?? ""} />
          </div>
          <div className="flex items-end gap-2 pb-0.5">
            <input type="hidden" name="is_booked" value={activity?.is_booked ? "true" : "false"} />
            <Label htmlFor="act_booked" className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                id="act_booked"
                type="checkbox"
                className="h-4 w-4 rounded"
                defaultChecked={activity?.is_booked ?? false}
                onChange={(e) => {
                  const hidden = e.target.closest("form")?.querySelector('input[name="is_booked"]') as HTMLInputElement
                  if (hidden) hidden.value = e.target.checked ? "true" : "false"
                }}
              />
              Booked
            </Label>
          </div>
        </div>
        <Button type="submit" disabled={isSubmitting} className="mt-1">
          {isSubmitting ? "Saving..." : activity ? "Update Activity" : "Add Activity"}
        </Button>
      </form>
    )
  }

  // ── Expense Form ──

  function ExpenseForm({ expense, tripId, onDone }: { expense?: TripExpense | null; tripId: string; onDone: () => void }) {
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault()
      if (!requireAuth()) return
      setIsSubmitting(true)
      const form = new FormData(e.currentTarget)
      form.set("trip_id", tripId)
      const result = expense ? await updateExpense(expense.id, form) : await createExpense(form)
      setIsSubmitting(false)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(expense ? "Expense updated" : "Expense added")
        mutateAll()
        onDone()
      }
    }

    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="exp_title">Title *</Label>
          <Input id="exp_title" name="title" required defaultValue={expense?.title ?? ""} placeholder="e.g. Hotel booking" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="exp_amount">Amount ($) *</Label>
            <Input id="exp_amount" name="amount" type="number" step="0.01" min="0" required defaultValue={expense?.amount ?? ""} />
          </div>
          <div>
            <Label htmlFor="exp_category">Category</Label>
            <Select name="category" defaultValue={expense?.category ?? "other"}>
              <SelectTrigger id="exp_category"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="exp_date">Date</Label>
          <Input id="exp_date" name="expense_date" type="date" defaultValue={expense?.expense_date ?? today} />
        </div>
        <div>
          <Label htmlFor="exp_notes">Notes</Label>
          <Textarea id="exp_notes" name="notes" defaultValue={expense?.notes ?? ""} rows={2} />
        </div>
        <Button type="submit" disabled={isSubmitting} className="mt-1">
          {isSubmitting ? "Saving..." : expense ? "Update Expense" : "Add Expense"}
        </Button>
      </form>
    )
  }

  // ── Trip Selector for Itinerary & Budget tabs ──

  function TripSelector({ label }: { label: string }) {
    return (
      <div className="mb-6">
        <Label className="mb-1.5 block text-sm text-muted-foreground">{label}</Label>
        <Select value={selectedTripId ?? ""} onValueChange={(v) => setSelectedTripId(v || null)}>
          <SelectTrigger className="w-full max-w-sm">
            <SelectValue placeholder="Choose a trip..." />
          </SelectTrigger>
          <SelectContent>
            {data.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.cover_color ?? "#6b7280" }} />
                  {t.destination}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  // ── Render ──

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {showingMockData && <MockDataBanner featureName="Travel Planner" />}
      {!showingMockData && !isGuest && data.length > 0 && data === initialTrips && <EmptyUserBanner />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Travel Planner</h1>
          <p className="text-sm text-muted-foreground">Plan trips, manage itineraries, and track budgets</p>
        </div>
      </div>

      <Tabs defaultValue="home" className="space-y-6">
        <TabsList>
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="trips">Trips</TabsTrigger>
          <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
        </TabsList>

        {/* ════════ HOME TAB ════════ */}
        <TabsContent value="home" className="flex flex-col gap-6 mt-0">
          {/* Next trip countdown */}
          {nextTrip && (
            <Card className="overflow-hidden">
              <div className="h-2" style={{ backgroundColor: nextTrip.cover_color ?? "#3b82f6" }} />
              <CardContent className="pt-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Next Trip</p>
                    <h2 className="text-xl font-bold text-foreground">{nextTrip.destination}</h2>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(nextTrip.start_date)} - {formatDate(nextTrip.end_date)}
                    </p>
                  </div>
                  <div className="text-center">
                    <span className="text-4xl font-bold text-foreground">{daysUntilNext}</span>
                    <p className="text-xs text-muted-foreground">days away</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{data.length}</p>
                    <p className="text-xs text-muted-foreground">Total Trips</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                    <Plane className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {data.filter((t) => t.status === "planning" || t.status === "booked").length}
                    </p>
                    <p className="text-xs text-muted-foreground">Upcoming</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                    <MapPin className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{uniqueDestinations}</p>
                    <p className="text-xs text-muted-foreground">Destinations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                    <DollarSign className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{formatMoney(totalSpent)}</p>
                    <p className="text-xs text-muted-foreground">Total Spent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts row - 2 cards side by side */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Trip Status Breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Trip Status</CardTitle>
                <CardDescription>Distribution across all trips</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {data.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                    <Globe className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No trips yet</p>
                  </div>
                ) : (
                  <>
                    {/* Status tiles */}
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                        const count = data.filter((t) => t.status === status).length
                        const StatusIcon = config.icon
                        return (
                          <div
                            key={status}
                            className="flex flex-col items-center gap-1 rounded-lg border-t-2 bg-muted/30 px-2 py-3"
                            style={{ borderTopColor: config.color }}
                          >
                            <StatusIcon className="h-3.5 w-3.5" style={{ color: config.color }} />
                            <p className="text-2xl font-bold text-foreground">{count}</p>
                            <p className="text-[11px] text-muted-foreground">{config.label}</p>
                          </div>
                        )
                      })}
                    </div>

                    {/* Distribution bar */}
                    {data.length > 0 && (
                      <div className="flex items-center gap-0.5">
                        {Object.entries(STATUS_CONFIG).map(([status, config], i, arr) => {
                          const count = data.filter((t) => t.status === status).length
                          const pct = Math.max((count / data.length) * 100, count > 0 ? 8 : 0)
                          if (count === 0) return null
                          return (
                            <div
                              key={status}
                              className="flex h-7 items-center justify-center text-[11px] font-semibold"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: config.color,
                                color: "#fff",
                                borderRadius: i === 0 ? "var(--radius) 0 0 var(--radius)" : i === arr.length - 1 ? "0 var(--radius) var(--radius) 0" : "0",
                              }}
                            >
                              {count}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Completion stats */}
                    <div className="mt-1 rounded-lg border border-success/20 bg-success/5 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                          <div>
                            <p className="text-xs text-muted-foreground">Completed</p>
                            <p className="text-lg font-bold text-foreground">{completedTrips}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Destinations</p>
                          <p className="text-lg font-bold text-foreground">{uniqueDestinations}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Activities Preview */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base">Upcoming Activities</CardTitle>
                  <CardDescription>Next scheduled events</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab("itinerary")}>
                  View all <Clock className="ml-1 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {(() => {
                  const upcomingActivities = actData
                    .filter((a) => a.activity_date && a.activity_date >= today)
                    .sort((a, b) => {
                      const d = (a.activity_date ?? "").localeCompare(b.activity_date ?? "")
                      if (d !== 0) return d
                      return (a.start_time ?? "").localeCompare(b.start_time ?? "")
                    })
                    .slice(0, 5)

                  if (upcomingActivities.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                        <CalendarDays className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">No upcoming activities</p>
                      </div>
                    )
                  }

                  return upcomingActivities.map((activity) => {
                    const trip = data.find((t) => t.id === activity.trip_id)
                    const catConfig = ACTIVITY_CATEGORIES[activity.category]
                    const CatIcon = catConfig?.icon ?? Bookmark
                    return (
                      <div
                        key={activity.id}
                        className="flex items-center gap-3 rounded-lg border border-border p-3"
                      >
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                          style={{ backgroundColor: catConfig?.color + "20" ?? "#6b728020" }}
                        >
                          <CatIcon className="h-5 w-5" style={{ color: catConfig?.color ?? "#6b7280" }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm text-foreground">{activity.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {trip && <span className="truncate">{trip.destination}</span>}
                            {activity.start_time && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {activity.start_time}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="shrink-0 text-xs font-medium text-foreground">
                            {formatDateShort(activity.activity_date)}
                          </span>
                          {activity.is_booked && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-success/10 text-success border-success/20">
                              Booked
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })
                })()}
              </CardContent>
            </Card>
          </div>

          {/* Recent trips */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">Recent Trips</CardTitle>
                <CardDescription>Your latest planned and past trips</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab("trips")}>
                View all <Plane className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Globe className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium text-foreground">No trips yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Create your first trip to get started</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {data.slice(0, 5).map((trip) => {
                    const sc = STATUS_CONFIG[trip.status]
                    const StatusIcon = sc?.icon ?? CircleDashed
                    const dur = tripDuration(trip)
                    return (
                      <div key={trip.id} className="flex items-center gap-3 rounded-lg border p-3">
                        <div className="h-10 w-10 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: (trip.cover_color ?? "#6b7280") + "20" }}>
                          <MapPin className="h-5 w-5" style={{ color: trip.cover_color ?? "#6b7280" }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-foreground">{trip.destination}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(trip.start_date)}{dur != null ? ` · ${dur} days` : ""}
                          </p>
                        </div>
                        <Badge variant="outline" className={`${sc?.bgClass} text-xs shrink-0`}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {sc?.label ?? trip.status}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════ TRIPS TAB ════════ */}
        <TabsContent value="trips" className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search trips..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Dialog open={tripDialogOpen} onOpenChange={setTripDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="mr-1.5 h-4 w-4" />New Trip</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Trip</DialogTitle>
                </DialogHeader>
                <TripForm onDone={() => setTripDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          {filteredTrips.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Globe className="mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No trips found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTrips.map((trip) => {
                const sc = STATUS_CONFIG[trip.status]
                const StatusIcon = sc?.icon ?? CircleDashed
                const dur = tripDuration(trip)
                const tripExp = expData.filter((e) => e.trip_id === trip.id)
                const spent = tripExp.reduce((s, e) => s + Number(e.amount), 0)
                return (
                  <Card key={trip.id} className="overflow-hidden">
                    <div className="h-2" style={{ backgroundColor: trip.cover_color ?? "#6b7280" }} />
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-semibold text-foreground">{trip.destination}</h3>
                          {trip.description && (
                            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{trip.description}</p>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingTrip(trip)
                                setEditTripDialogOpen(true)
                              }}
                            >
                              <Pencil className="mr-2 h-3.5 w-3.5" />Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={async () => {
                                if (!requireAuth()) return
                                const res = await deleteTrip(trip.id)
                                if (res.error) toast.error(res.error)
                                else { toast.success("Trip deleted"); mutateAll() }
                              }}
                            >
                              <Trash2 className="mr-2 h-3.5 w-3.5" />Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                        {dur != null && <span className="text-muted-foreground/60">({dur}d)</span>}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <Badge variant="secondary" className={`${sc?.bgClass} text-xs`}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {sc?.label}
                        </Badge>
                        {trip.budget != null && (
                          <span className="text-xs text-muted-foreground">
                            {formatMoney(spent)} / {formatMoney(trip.budget)}
                          </span>
                        )}
                      </div>
                      {trip.tags.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1">
                          {trip.tags.map((tag) => (
                            <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* ════════ ITINERARY TAB ════════ */}
        <TabsContent value="itinerary" className="space-y-6">
          <TripSelector label="Select a trip to view its itinerary" />

          {!selectedTripId ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <CalendarDays className="mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Select a trip above to view its itinerary</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{selectedTrip?.destination}</h2>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(selectedTrip?.start_date ?? null)} - {formatDate(selectedTrip?.end_date ?? null)}
                    {" \u00B7 "}{tripActivities.length} activities
                  </p>
                </div>
                <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Add Activity</Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add Activity</DialogTitle>
                    </DialogHeader>
                    <ActivityForm tripId={selectedTripId} onDone={() => setActivityDialogOpen(false)} />
                  </DialogContent>
                </Dialog>
              </div>

              {groupedActivities.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Camera className="mb-3 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No activities planned yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {groupedActivities.map(([dateKey, acts]) => (
                    <div key={dateKey}>
                      <h3 className="mb-3 text-sm font-semibold text-foreground">
                        {dateKey === "Unscheduled" ? "Unscheduled" : formatDateShort(dateKey)}
                      </h3>
                      <div className="space-y-2">
                        {acts.map((act) => {
                          const cat = ACTIVITY_CATEGORIES[act.category]
                          const CatIcon = cat?.icon ?? Bookmark
                          return (
                            <div key={act.id} className="flex items-start gap-3 rounded-lg border p-3">
                              <div
                                className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                                style={{ backgroundColor: (cat?.color ?? "#6b7280") + "18" }}
                              >
                                <CatIcon className="h-4 w-4" style={{ color: cat?.color ?? "#6b7280" }} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="truncate text-sm font-medium text-foreground">{act.title}</p>
                                  {act.is_booked && (
                                    <Badge variant="secondary" className="bg-green-500/15 text-green-600 text-[10px]">Booked</Badge>
                                  )}
                                </div>
                                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                                  {act.start_time && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {act.start_time}{act.end_time ? ` - ${act.end_time}` : ""}
                                    </span>
                                  )}
                                  {act.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />{act.location}
                                    </span>
                                  )}
                                  {act.cost != null && act.cost > 0 && (
                                    <span className="flex items-center gap-1">
                                      <DollarSign className="h-3 w-3" />{formatMoney(act.cost)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setEditingActivity(act)
                                      setEditActivityDialogOpen(true)
                                    }}
                                  >
                                    <Pencil className="mr-2 h-3.5 w-3.5" />Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={async () => {
                                      if (!requireAuth()) return
                                      const res = await deleteActivity(act.id)
                                      if (res.error) toast.error(res.error)
                                      else { toast.success("Activity deleted"); mutateAll() }
                                    }}
                                  >
                                    <Trash2 className="mr-2 h-3.5 w-3.5" />Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* ════════ BUDGET TAB ════════ */}
        <TabsContent value="budget" className="space-y-6">
          <TripSelector label="Select a trip to view its budget" />

          {!selectedTripId ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <DollarSign className="mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Select a trip above to view its budget</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Budget overview */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-xs text-muted-foreground">Budget</p>
                    <p className="text-2xl font-bold text-foreground">
                      {selectedTrip?.budget != null ? formatMoney(selectedTrip.budget) : "No budget set"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-xs text-muted-foreground">Spent</p>
                    <p className="text-2xl font-bold text-foreground">{formatMoney(tripTotalSpent)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-xs text-muted-foreground">Remaining</p>
                    <p className={`text-2xl font-bold ${selectedTrip?.budget != null && tripTotalSpent > selectedTrip.budget ? "text-destructive" : "text-foreground"}`}>
                      {selectedTrip?.budget != null ? formatMoney(selectedTrip.budget - tripTotalSpent) : "--"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Progress bar */}
              {selectedTrip?.budget != null && selectedTrip.budget > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Budget usage</span>
                      <span className="font-medium text-foreground">
                        {Math.round((tripTotalSpent / selectedTrip.budget) * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.min(100, (tripTotalSpent / selectedTrip.budget) * 100)}
                      className="h-3"
                    />
                  </CardContent>
                </Card>
              )}

              {/* Expense breakdown chart */}
              {expByCat.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Spending by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={Object.fromEntries(
                        Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => [k, { label: v.label, color: v.color }]),
                      )}
                      className="h-[220px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={expByCat} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 0 }} barSize={24}>
                          <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis type="number" hide />
                          <YAxis
                            type="category"
                            dataKey="name"
                            width={100}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                            {expByCat.map((entry) => (
                              <Cell key={entry.name} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              )}

              {/* Expense list */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Expenses</CardTitle>
                    <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline"><Plus className="mr-1.5 h-4 w-4" />Add Expense</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Expense</DialogTitle>
                        </DialogHeader>
                        <ExpenseForm tripId={selectedTripId} onDone={() => setExpenseDialogOpen(false)} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {tripExpenses.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">No expenses recorded yet</p>
                  ) : (
                    <div className="space-y-2">
                      {tripExpenses.map((exp) => {
                        const cat = EXPENSE_CATEGORIES[exp.category]
                        return (
                          <div key={exp.id} className="flex items-center gap-3 rounded-lg border p-3">
                            <div
                              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                              style={{ backgroundColor: (cat?.color ?? "#6b7280") + "18" }}
                            >
                              <DollarSign className="h-4 w-4" style={{ color: cat?.color ?? "#6b7280" }} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-foreground">{exp.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(exp.expense_date)} &middot; {cat?.label ?? exp.category}
                              </p>
                            </div>
                            <span className="font-semibold text-sm text-foreground">{formatMoney(exp.amount)}</span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingExpense(exp)
                                    setEditExpenseDialogOpen(true)
                                  }}
                                >
                                  <Pencil className="mr-2 h-3.5 w-3.5" />Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={async () => {
                                    if (!requireAuth()) return
                                    const res = await deleteExpense(exp.id)
                                    if (res.error) toast.error(res.error)
                                    else { toast.success("Expense deleted"); mutateAll() }
                                  }}
                                >
                                  <Trash2 className="mr-2 h-3.5 w-3.5" />Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Trip Dialog */}
      <Dialog open={editTripDialogOpen} onOpenChange={(o) => { setEditTripDialogOpen(o); if (!o) setEditingTrip(null) }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Trip</DialogTitle>
          </DialogHeader>
          {editingTrip && <TripForm trip={editingTrip} onDone={() => { setEditTripDialogOpen(false); setEditingTrip(null) }} />}
        </DialogContent>
      </Dialog>

      {/* Edit Activity Dialog */}
      <Dialog open={editActivityDialogOpen} onOpenChange={(o) => { setEditActivityDialogOpen(o); if (!o) setEditingActivity(null) }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Activity</DialogTitle>
          </DialogHeader>
          {editingActivity && selectedTripId && (
            <ActivityForm
              activity={editingActivity}
              tripId={selectedTripId}
              onDone={() => { setEditActivityDialogOpen(false); setEditingActivity(null) }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Expense Dialog */}
      <Dialog open={editExpenseDialogOpen} onOpenChange={(o) => { setEditExpenseDialogOpen(o); if (!o) setEditingExpense(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          {editingExpense && selectedTripId && (
            <ExpenseForm
              expense={editingExpense}
              tripId={selectedTripId}
              onDone={() => { setEditExpenseDialogOpen(false); setEditingExpense(null) }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
