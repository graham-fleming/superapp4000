"use client"

import React, { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { toast } from "sonner"
import {
  Plus,
  Search,
  Check,
  Flame,
  TrendingUp,
  Trash2,
  MoreHorizontal,
  CalendarDays,
  Target,
  ArrowRight,
  Pencil,
  Minus,
  CheckCircle2,
  Circle,
  BarChart3,
  ListChecks,
  History,
  Repeat,
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
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
  Cell,
} from "recharts"
import {
  createHabit,
  updateHabit,
  deleteHabit,
  toggleCompletion,
  updateCompletionValue,
} from "@/app/(app)/habits/actions"
import { useAuthGate } from "@/components/auth-gate"
import { MockDataBanner, EmptyUserBanner } from "@/components/mock-data-banner"

export type Habit = {
  id: string
  name: string
  description: string | null
  category: string
  type: string
  target_count: number | null
  color: string | null
  is_active: boolean
  created_at: string
}

export type HabitCompletion = {
  id: string
  habit_id: string
  completion_date: string
  value: number
  created_at: string
}

const COLORS = {
  primary: "hsl(215, 80%, 48%)",
  success: "hsl(142, 71%, 45%)",
  warning: "hsl(38, 92%, 50%)",
  destructive: "hsl(0, 72%, 51%)",
  muted: "hsl(220, 10%, 46%)",
  chart2: "hsl(160, 60%, 45%)",
}

const categoryConfig: Record<string, { label: string; class: string }> = {
  health: { label: "Health", class: "bg-success/15 text-success border-success/30" },
  productivity: { label: "Productivity", class: "bg-primary/15 text-primary border-primary/30" },
  mindfulness: { label: "Mindfulness", class: "bg-chart-4/15 text-chart-4 border-chart-4/30" },
  learning: { label: "Learning", class: "bg-warning/15 text-warning border-warning/30" },
  social: { label: "Social", class: "bg-chart-5/15 text-chart-5 border-chart-5/30" },
  other: { label: "Other", class: "bg-muted text-muted-foreground border-border" },
}

const HABIT_COLORS = [
  "#6366f1", "#06b6d4", "#22c55e", "#f59e0b", "#ef4444",
  "#ec4899", "#8b5cf6", "#14b8a6", "#f97316", "#64748b",
]

async function fetcher(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

interface HabitsContentProps {
  initialHabits: Habit[]
  initialCompletions: HabitCompletion[]
  isGuest?: boolean
  showingMockData?: boolean
}

export function HabitsContent({
  initialHabits,
  initialCompletions,
  isGuest = false,
  showingMockData = false,
}: HabitsContentProps) {
  const router = useRouter()
  const { requireAuth } = useAuthGate()
  const { data: habits, mutate: mutateHabits } = useSWR<Habit[]>(
    isGuest || showingMockData ? null : "/api/habits",
    fetcher,
    { fallbackData: initialHabits },
  )
  const { data: completions, mutate: mutateCompletions } = useSWR<HabitCompletion[]>(
    isGuest || showingMockData ? null : "/api/habit-completions",
    fetcher,
    { fallbackData: initialCompletions },
  )

  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("home")
  const [habitType, setHabitType] = useState("boolean")
  const [editHabitType, setEditHabitType] = useState("boolean")

  const allHabits = habits ?? initialHabits
  const allCompletions = completions ?? initialCompletions
  const activeHabits = allHabits.filter((h) => h.is_active)

  const today = new Date().toISOString().split("T")[0]

  // -- Completion helpers --
  function getCompletion(habitId: string, date: string): HabitCompletion | undefined {
    return allCompletions.find((c) => c.habit_id === habitId && c.completion_date === date)
  }

  function isCompleted(habitId: string, date: string): boolean {
    const habit = allHabits.find((h) => h.id === habitId)
    const completion = getCompletion(habitId, date)
    if (!completion) return false
    if (habit?.type === "counted" && habit.target_count) {
      return completion.value >= habit.target_count
    }
    return true
  }

  // -- Filtered habits --
  const filtered = allHabits.filter((h) => {
    const matchSearch = h.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = filterCategory === "all" || h.category === filterCategory
    return matchSearch && matchCategory
  })

  // -- Stats --
  const stats = useMemo(() => {
    const todayCompletions = allCompletions.filter((c) => c.completion_date === today)
    const completedToday = activeHabits.filter((h) => isCompleted(h.id, today)).length
    const totalActiveToday = activeHabits.length

    // Current streak: consecutive days where at least half habits were completed
    const streak = calculateStreak(activeHabits, allCompletions)

    // Best completion rate in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const weekCompletions = allCompletions.filter(
      (c) => new Date(c.completion_date) >= sevenDaysAgo,
    )
    const uniqueDaysWithCompletions = new Set(weekCompletions.map((c) => c.completion_date)).size

    // Overall completion rate for past 7 days
    let totalPossible = 0
    let totalDone = 0
    for (let i = 0; i < 7; i++) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const dateStr = d.toISOString().split("T")[0]
      for (const habit of activeHabits) {
        if (new Date(habit.created_at) <= d) {
          totalPossible++
          if (isCompleted(habit.id, dateStr)) totalDone++
        }
      }
    }
    const weeklyRate = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0

    return {
      completedToday,
      totalActiveToday,
      streak,
      activeDays: uniqueDaysWithCompletions,
      weeklyRate,
    }
  }, [allHabits, allCompletions, today, activeHabits])

  // -- Chart: Daily completion rate for last 14 days --
  const dailyRateData = useMemo(() => {
    const days: { day: string; rate: number; completed: number; total: number }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const dateStr = d.toISOString().split("T")[0]
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      let done = 0
      let total = 0
      for (const habit of activeHabits) {
        if (new Date(habit.created_at) <= d) {
          total++
          if (isCompleted(habit.id, dateStr)) done++
        }
      }
      days.push({
        day: label,
        rate: total > 0 ? Math.round((done / total) * 100) : 0,
        completed: done,
        total,
      })
    }
    return days
  }, [allCompletions, activeHabits])

  // -- Chart: Per-habit completion over last 7 days --
  const perHabitData = useMemo(() => {
    return activeHabits.map((habit) => {
      let completed = 0
      for (let i = 0; i < 7; i++) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        const dateStr = d.toISOString().split("T")[0]
        if (isCompleted(habit.id, dateStr)) completed++
      }
      return {
        name: habit.name.length > 12 ? habit.name.slice(0, 12) + "..." : habit.name,
        fullName: habit.name,
        completed,
        rate: Math.round((completed / 7) * 100),
        color: habit.color || HABIT_COLORS[0],
      }
    })
  }, [activeHabits, allCompletions])

  // -- History: calendar data for last 30 days --
  const calendarData = useMemo(() => {
    const days: { date: string; label: string; dayName: string; completed: number; total: number; rate: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const dateStr = d.toISOString().split("T")[0]
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" })
      let done = 0
      let total = 0
      for (const habit of activeHabits) {
        if (new Date(habit.created_at) <= d) {
          total++
          if (isCompleted(habit.id, dateStr)) done++
        }
      }
      days.push({
        date: dateStr,
        label,
        dayName,
        completed: done,
        total,
        rate: total > 0 ? Math.round((done / total) * 100) : 0,
      })
    }
    return days
  }, [activeHabits, allCompletions])

  // -- Handlers --
  function handleAddClick() {
    if (!requireAuth("create a habit")) return
    setHabitType("boolean")
    setDialogOpen(true)
  }

  function handleEditClick(habit: Habit) {
    if (!requireAuth("edit a habit")) return
    setEditingHabit(habit)
    setEditHabitType(habit.type)
    setEditDialogOpen(true)
  }

  async function handleCreate(formData: FormData) {
    setIsSubmitting(true)
    try {
      const result = await createHabit(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Habit created")
        setDialogOpen(false)
        mutateHabits()
        router.refresh()
      }
    } catch {
      toast.error("Failed to create habit")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdate(formData: FormData) {
    if (!editingHabit) return
    setIsSubmitting(true)
    try {
      const result = await updateHabit(editingHabit.id, formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Habit updated")
        setEditDialogOpen(false)
        setEditingHabit(null)
        mutateHabits()
        router.refresh()
      }
    } catch {
      toast.error("Failed to update habit")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!requireAuth("delete a habit")) return
    try {
      const result = await deleteHabit(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Habit deleted")
        mutateHabits()
        mutateCompletions()
        router.refresh()
      }
    } catch {
      toast.error("Failed to delete habit")
    }
  }

  async function handleToggle(habitId: string, date: string) {
    if (!requireAuth("track a habit")) return
    const existing = getCompletion(habitId, date)
    try {
      const result = await toggleCompletion(habitId, date, existing ? existing.value : null)
      if (result.error) {
        toast.error(result.error)
      } else {
        mutateCompletions()
        router.refresh()
      }
    } catch {
      toast.error("Failed to update completion")
    }
  }

  async function handleCounterChange(habitId: string, date: string, delta: number) {
    if (!requireAuth("track a habit")) return
    const existing = getCompletion(habitId, date)
    const currentValue = existing?.value ?? 0
    const newValue = Math.max(0, currentValue + delta)
    try {
      const result = await updateCompletionValue(habitId, date, newValue)
      if (result.error) {
        toast.error(result.error)
      } else {
        mutateCompletions()
        router.refresh()
      }
    } catch {
      toast.error("Failed to update count")
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  function clampPercent(value: number, goal: number) {
    return Math.min(Math.round((value / goal) * 100), 100)
  }

  function getRateColor(rate: number): string {
    if (rate >= 80) return "bg-success"
    if (rate >= 50) return "bg-warning"
    if (rate > 0) return "bg-destructive/70"
    return "bg-muted"
  }

  // =============================================
  // SHARED UI PIECES
  // =============================================

  function SectionHeader({ title, description, tabTarget }: { title: string; description: string; tabTarget: string }) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setActiveTab(tabTarget)} className="text-xs text-muted-foreground gap-1">
          View all
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  const StatCards = (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Today</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-foreground">{stats.completedToday}</p>
              <span className="text-xs text-muted-foreground">/ {stats.totalActiveToday}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
            <Flame className="h-5 w-5 text-destructive" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Streak</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-foreground">{stats.streak}</p>
              <span className="text-xs text-muted-foreground">days</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warning/10">
            <TrendingUp className="h-5 w-5 text-warning" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Weekly Rate</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-foreground">{stats.weeklyRate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success/10">
            <CalendarDays className="h-5 w-5 text-success" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Active Days</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-foreground">{stats.activeDays}</p>
              <span className="text-xs text-muted-foreground">/ 7</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // -- Today's checklist for home tab --
  function TodayChecklist() {
    return (
      <div className="grid gap-3">
        {activeHabits.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium text-foreground">No habits yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">Create your first habit to get started</p>
            </CardContent>
          </Card>
        ) : (
          activeHabits.map((habit) => {
            const completion = getCompletion(habit.id, today)
            const completed = isCompleted(habit.id, today)

            return (
              <Card key={habit.id} className={`transition-colors ${completed ? "bg-success/5 border-success/20" : "hover:bg-accent/50"}`}>
                <CardContent className="flex items-center gap-4 p-4">
                  {habit.type === "boolean" ? (
                    <button
                      type="button"
                      onClick={() => handleToggle(habit.id, today)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors"
                      style={{
                        backgroundColor: completed ? (habit.color || HABIT_COLORS[0]) + "20" : undefined,
                      }}
                    >
                      {completed ? (
                        <CheckCircle2 className="h-6 w-6" style={{ color: habit.color || HABIT_COLORS[0] }} />
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground/40" />
                      )}
                    </button>
                  ) : (
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: (habit.color || HABIT_COLORS[0]) + "20" }}
                    >
                      <Target className="h-5 w-5" style={{ color: habit.color || HABIT_COLORS[0] }} />
                    </div>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <p className={`font-medium ${completed ? "text-foreground line-through opacity-60" : "text-foreground"}`}>
                        {habit.name}
                      </p>
                      {habit.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-md">{habit.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`shrink-0 capitalize ${categoryConfig[habit.category]?.class ?? ""}`}>
                        {categoryConfig[habit.category]?.label ?? habit.category}
                      </Badge>
                      {habit.type === "counted" && habit.target_count && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 bg-transparent"
                            onClick={() => handleCounterChange(habit.id, today, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="min-w-[3rem] text-center text-sm font-medium text-foreground">
                            {completion?.value ?? 0} / {habit.target_count}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 bg-transparent"
                            onClick={() => handleCounterChange(habit.id, today, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    )
  }

  // -- Habit card for the Habits (manage) tab --
  function HabitManageCard({ habit }: { habit: Habit }) {
    // 7-day mini streak
    const last7 = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const dateStr = d.toISOString().split("T")[0]
      last7.push({ date: dateStr, done: isCompleted(habit.id, dateStr) })
    }

    return (
      <Card className="transition-colors hover:bg-accent/50">
        <CardContent className="flex items-center gap-4 p-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: (habit.color || HABIT_COLORS[0]) + "20" }}
          >
            {habit.type === "counted" ? (
              <Target className="h-5 w-5" style={{ color: habit.color || HABIT_COLORS[0] }} />
            ) : (
              <Repeat className="h-5 w-5" style={{ color: habit.color || HABIT_COLORS[0] }} />
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground">{habit.name}</p>
                {!habit.is_active && <Badge variant="secondary" className="text-xs">Paused</Badge>}
              </div>
              {habit.description && (
                <p className="text-xs text-muted-foreground truncate max-w-md">{habit.description}</p>
              )}
              <div className="mt-1.5 flex items-center gap-1">
                {last7.map((day) => (
                  <div
                    key={day.date}
                    className={`h-2.5 w-2.5 rounded-sm ${day.done ? "" : "bg-muted"}`}
                    style={day.done ? { backgroundColor: habit.color || HABIT_COLORS[0] } : undefined}
                    title={day.date}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`shrink-0 capitalize ${categoryConfig[habit.category]?.class ?? ""}`}>
                {categoryConfig[habit.category]?.label ?? habit.category}
              </Badge>
              {habit.type === "counted" && habit.target_count && (
                <Badge variant="secondary" className="shrink-0">
                  <Target className="mr-1 h-3 w-3" />
                  {habit.target_count}x
                </Badge>
              )}
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
              <DropdownMenuItem onClick={() => handleEditClick(habit)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(habit.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>
    )
  }

  const CompletionRateChart = (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Daily Completion Rate</CardTitle>
        <CardDescription>Percentage of habits completed each day over the last 14 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            rate: { label: "Completion Rate (%)", color: "hsl(var(--chart-1))" },
          }}
          className="h-[260px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyRateData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="day" className="text-xs" tick={{ fill: COLORS.muted }} interval="preserveStartEnd" />
              <YAxis className="text-xs" tick={{ fill: COLORS.muted }} domain={[0, 100]} unit="%" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="rate"
                stroke={COLORS.primary}
                fill={COLORS.primary}
                fillOpacity={0.15}
                strokeWidth={2}
                name="Completion Rate (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )

  const PerHabitChart = (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Per-Habit Performance</CardTitle>
        <CardDescription>Days completed out of the last 7 days for each active habit</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            completed: { label: "Days Completed", color: "hsl(var(--chart-1))" },
          }}
          className="h-[260px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={perHabitData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
              <XAxis type="number" domain={[0, 7]} className="text-xs" tick={{ fill: COLORS.muted }} />
              <YAxis type="category" dataKey="name" className="text-xs" tick={{ fill: COLORS.muted }} width={100} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="completed" radius={[0, 4, 4, 0]} name="Days Completed">
                {perHabitData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )

  function HabitForm({ onSubmit, defaults }: { onSubmit: (fd: FormData) => Promise<void>; defaults?: Habit }) {
    const currentType = defaults ? editHabitType : habitType
    const setCurrentType = defaults ? setEditHabitType : setHabitType

    return (
      <form action={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor={defaults ? "edit_name" : "name"}>Name *</Label>
          <Input id={defaults ? "edit_name" : "name"} name="name" required placeholder="e.g. Morning Meditation" defaultValue={defaults?.name} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={defaults ? "edit_description" : "description"}>Description</Label>
          <Textarea
            id={defaults ? "edit_description" : "description"}
            name="description"
            placeholder="What does this habit involve?"
            rows={2}
            defaultValue={defaults?.description ?? ""}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor={defaults ? "edit_category" : "category"}>Category</Label>
            <Select name="category" defaultValue={defaults?.category ?? "other"}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="productivity">Productivity</SelectItem>
                <SelectItem value="mindfulness">Mindfulness</SelectItem>
                <SelectItem value="learning">Learning</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={defaults ? "edit_type" : "type"}>Type</Label>
            <Select name="type" defaultValue={defaults?.type ?? "boolean"} onValueChange={setCurrentType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="boolean">Yes / No</SelectItem>
                <SelectItem value="counted">Counted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {currentType === "counted" && (
          <div className="flex flex-col gap-2">
            <Label htmlFor={defaults ? "edit_target_count" : "target_count"}>Daily Target</Label>
            <Input
              id={defaults ? "edit_target_count" : "target_count"}
              name="target_count"
              type="number"
              min="1"
              placeholder="e.g. 8"
              defaultValue={defaults?.target_count ?? ""}
            />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Label>Color</Label>
          <div className="flex flex-wrap gap-2">
            {HABIT_COLORS.map((color) => (
              <label key={color} className="cursor-pointer">
                <input type="radio" name="color" value={color} defaultChecked={defaults ? defaults.color === color : color === HABIT_COLORS[0]} className="sr-only peer" />
                <div
                  className="h-8 w-8 rounded-full border-2 border-transparent peer-checked:border-foreground peer-checked:ring-2 peer-checked:ring-foreground/20 transition-all"
                  style={{ backgroundColor: color }}
                />
              </label>
            ))}
          </div>
        </div>
        {defaults && (
          <div className="flex flex-col gap-2">
            <Label>Status</Label>
            <Select name="is_active" defaultValue={defaults.is_active ? "true" : "false"}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? (defaults ? "Updating..." : "Creating...") : (defaults ? "Update Habit" : "Create Habit")}
        </Button>
      </form>
    )
  }

  const CreateDialog = (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={handleAddClick} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          New Habit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Habit</DialogTitle>
        </DialogHeader>
        <HabitForm onSubmit={handleCreate} />
      </DialogContent>
    </Dialog>
  )

  const EditDialog = (
    <Dialog open={editDialogOpen} onOpenChange={(open) => { setEditDialogOpen(open); if (!open) setEditingHabit(null) }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Habit</DialogTitle>
        </DialogHeader>
        {editingHabit && <HabitForm onSubmit={handleUpdate} defaults={editingHabit} />}
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="flex flex-col gap-6">
      {isGuest && <MockDataBanner dataType="habits" />}
      {showingMockData && (
        <EmptyUserBanner dataType="habits" actionLabel="Create your first habit" />
      )}

      {/* -- Header -- */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Habit Tracker</h1>
          <p className="text-sm text-muted-foreground">Build consistency, track streaks, achieve your goals</p>
        </div>
        {CreateDialog}
      </div>

      {EditDialog}

      {/* -- Tabs -- */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-6">
        <TabsList className="w-fit">
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="habits">Habits</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* ===================== HOME TAB ===================== */}
        <TabsContent value="home" className="flex flex-col gap-6 mt-0">
          {/* Stat cards row */}
          {StatCards}

          {/* Charts row - 2 cards side by side */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Today's Habits Checklist */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base">{"Today's Habits"}</CardTitle>
                  <CardDescription>{stats.completedToday} of {stats.totalActiveToday} completed</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab("habits")}>
                  Manage <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {activeHabits.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                    <Target className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No habits yet</p>
                    <p className="text-xs mt-1">Create your first habit</p>
                  </div>
                ) : (
                  activeHabits.slice(0, 5).map((habit) => {
                    const completion = getCompletion(habit.id, today)
                    const completed = isCompleted(habit.id, today)

                    return (
                      <div
                        key={habit.id}
                        className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${completed ? "bg-success/5 border-success/20" : "hover:bg-accent/50"}`}
                      >
                        {habit.type === "boolean" ? (
                          <button
                            type="button"
                            onClick={() => handleToggle(habit.id, today)}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors"
                            style={{
                              backgroundColor: completed ? (habit.color || HABIT_COLORS[0]) + "20" : undefined,
                            }}
                          >
                            {completed ? (
                              <CheckCircle2 className="h-5 w-5" style={{ color: habit.color || HABIT_COLORS[0] }} />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground/40" />
                            )}
                          </button>
                        ) : (
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                            style={{ backgroundColor: (habit.color || HABIT_COLORS[0]) + "20" }}
                          >
                            <Target className="h-4 w-4" style={{ color: habit.color || HABIT_COLORS[0] }} />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium ${completed ? "text-foreground line-through opacity-60" : "text-foreground"}`}>
                            {habit.name}
                          </p>
                          {habit.type === "counted" && habit.target_count && (
                            <p className="text-xs text-muted-foreground">
                              {completion?.value ?? 0} / {habit.target_count}
                            </p>
                          )}
                        </div>
                        {habit.type === "counted" && habit.target_count && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 bg-transparent"
                              onClick={() => handleCounterChange(habit.id, today, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 bg-transparent"
                              onClick={() => handleCounterChange(habit.id, today, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
                {activeHabits.length > 5 && (
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("habits")} className="mt-2 bg-transparent">
                    View all {activeHabits.length} habits
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Habit Performance */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Habit Performance</CardTitle>
                <CardDescription>Last 7 days completion for top habits</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {perHabitData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                    <BarChart3 className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No habit data yet</p>
                  </div>
                ) : (
                  <>
                    {/* Top performing habits */}
                    <div className="flex flex-col gap-3">
                      {perHabitData.slice(0, 5).map((habit) => (
                        <div key={habit.fullName} className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: habit.color }}
                              />
                              {habit.name}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {habit.completed}/7 days
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${(habit.completed / 7) * 100}%`,
                                backgroundColor: habit.color,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Category breakdown */}
                    <div className="mt-1 rounded-lg border p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-foreground">By Category</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          const categoryCounts = activeHabits.reduce((acc, h) => {
                            acc[h.category] = (acc[h.category] || 0) + 1
                            return acc
                          }, {} as Record<string, number>)
                          
                          return Object.entries(categoryCounts).map(([cat, count]) => (
                            <Badge key={cat} variant="outline" className={`capitalize ${categoryConfig[cat]?.class ?? ""}`}>
                              {categoryConfig[cat]?.label ?? cat} ({count})
                            </Badge>
                          ))
                        })()}
                      </div>
                    </div>

                    {/* Weekly completion highlight */}
                    <div className="flex items-center gap-2 rounded-lg border border-success/20 bg-success/5 p-3">
                      <TrendingUp className="h-4 w-4 shrink-0 text-success" />
                      <div>
                        <p className="text-xs text-muted-foreground">Weekly completion</p>
                        <p className="text-lg font-bold text-foreground">{stats.weeklyRate}%</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Completion trend chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">Completion Trend</CardTitle>
                <CardDescription>Daily completion rate over the last 14 days</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab("analytics")}>
                View analytics <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  rate: { label: "Completion Rate (%)", color: "hsl(var(--chart-1))" },
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyRateData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" className="text-xs" tick={{ fill: COLORS.muted }} interval="preserveStartEnd" />
                    <YAxis className="text-xs" tick={{ fill: COLORS.muted }} domain={[0, 100]} unit="%" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="rate"
                      stroke={COLORS.primary}
                      fill={COLORS.primary}
                      fillOpacity={0.15}
                      strokeWidth={2}
                      name="Completion Rate (%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================== HABITS TAB ===================== */}
        <TabsContent value="habits" className="flex flex-col gap-6 mt-0">
          {/* Search / filter */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search habits..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="productivity">Productivity</SelectItem>
                  <SelectItem value="mindfulness">Mindfulness</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Habit list */}
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ListChecks className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium text-foreground">No habits found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {search || filterCategory !== "all" ? "Try adjusting your filters" : "Create your first habit to get started"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {filtered.map((habit) => (
                <HabitManageCard key={habit.id} habit={habit} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ===================== HISTORY TAB ===================== */}
        <TabsContent value="history" className="flex flex-col gap-6 mt-0">
          {/* 30-day heatmap-style grid */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">30-Day Overview</CardTitle>
              <CardDescription>Daily completion rates for the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-10">
                {calendarData.map((day) => {
                  const isToday = day.date === today
                  return (
                    <div
                      key={day.date}
                      className={`flex flex-col items-center gap-1 rounded-lg border p-2 ${isToday ? "border-primary/30 bg-primary/5" : "border-border"}`}
                    >
                      <span className="text-[10px] font-medium text-muted-foreground">{day.dayName}</span>
                      <div className={`h-6 w-6 rounded-md ${getRateColor(day.rate)}`} title={`${day.rate}% completed`} />
                      <span className="text-[10px] text-muted-foreground">{day.label}</span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-sm bg-muted" />
                  <span>0%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-sm bg-destructive/70" />
                  <span>{'1-49%'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-sm bg-warning" />
                  <span>{'50-79%'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-sm bg-success" />
                  <span>{'80-100%'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Per-habit history for last 7 days */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Habit-by-Habit History</CardTitle>
              <CardDescription>Detailed completion status for each habit over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left font-medium text-muted-foreground pb-3 pr-4">Habit</th>
                      {Array.from({ length: 7 }).map((_, i) => {
                        const d = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000)
                        const isT = d.toISOString().split("T")[0] === today
                        return (
                          <th key={i} className={`text-center font-medium pb-3 px-2 ${isT ? "text-primary" : "text-muted-foreground"}`}>
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-[10px]">{d.toLocaleDateString("en-US", { weekday: "short" })}</span>
                              <span className="text-xs">{d.getDate()}</span>
                            </div>
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {activeHabits.map((habit) => (
                      <tr key={habit.id} className="border-t border-border">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2.5 w-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: habit.color || HABIT_COLORS[0] }}
                            />
                            <span className="text-foreground truncate max-w-[150px]">{habit.name}</span>
                          </div>
                        </td>
                        {Array.from({ length: 7 }).map((_, i) => {
                          const d = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000)
                          const dateStr = d.toISOString().split("T")[0]
                          const done = isCompleted(habit.id, dateStr)
                          const completion = getCompletion(habit.id, dateStr)
                          return (
                            <td key={i} className="text-center py-3 px-2">
                              {done ? (
                                <CheckCircle2 className="h-5 w-5 mx-auto" style={{ color: habit.color || HABIT_COLORS[0] }} />
                              ) : completion ? (
                                <span className="text-xs text-muted-foreground">{completion.value}</span>
                              ) : (
                                <Circle className="h-5 w-5 mx-auto text-muted-foreground/20" />
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================== ANALYTICS TAB ===================== */}
        <TabsContent value="analytics" className="flex flex-col gap-6 mt-0">
          {StatCards}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {CompletionRateChart}
            {PerHabitChart}
          </div>

          {/* Per-habit stats cards */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Habit Statistics</CardTitle>
              <CardDescription>Completion rate and streaks for each active habit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {activeHabits.map((habit) => {
                  const perf = perHabitData.find((p) => p.fullName === habit.name)
                  const rate = perf?.rate ?? 0
                  // Calculate habit-specific streak
                  let hStreak = 0
                  const d = new Date()
                  const todayStr = d.toISOString().split("T")[0]
                  if (!isCompleted(habit.id, todayStr)) d.setDate(d.getDate() - 1)
                  while (true) {
                    const ds = d.toISOString().split("T")[0]
                    if (isCompleted(habit.id, ds)) {
                      hStreak++
                      d.setDate(d.getDate() - 1)
                    } else {
                      break
                    }
                  }

                  return (
                    <div key={habit.id} className="flex flex-col gap-3 rounded-lg border border-border p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{ backgroundColor: habit.color || HABIT_COLORS[0] }}
                        />
                        <p className="text-sm font-medium text-foreground">{habit.name}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">7-Day Rate</p>
                          <p className="text-lg font-bold text-foreground">{rate}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Current Streak</p>
                          <p className="text-lg font-bold text-foreground">{hStreak} days</p>
                        </div>
                      </div>
                      <Progress value={rate} className="h-2" />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

/** Compute current streak: consecutive days (ending today or yesterday) where at least one habit was completed */
function calculateStreak(activeHabits: Habit[], completions: HabitCompletion[]): number {
  if (activeHabits.length === 0 || completions.length === 0) return 0

  const completionDates = new Set(completions.map((c) => c.completion_date))
  const today = new Date()
  let streak = 0
  const d = new Date(today)

  const todayStr = d.toISOString().split("T")[0]
  if (!completionDates.has(todayStr)) {
    d.setDate(d.getDate() - 1)
  }

  while (true) {
    const dateStr = d.toISOString().split("T")[0]
    if (completionDates.has(dateStr)) {
      streak++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}
