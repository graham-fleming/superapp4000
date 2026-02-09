"use client"

import React, { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { toast } from "sonner"
import {
  Plus,
  Search,
  Dumbbell,
  Timer,
  Flame,
  TrendingUp,
  Trash2,
  MoreHorizontal,
  Activity,
  CalendarDays,
  Target,
  Zap,
  ArrowRight,
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
} from "recharts"
import { createWorkout, deleteWorkout } from "@/app/(app)/fitness/actions"
import { useAuthGate } from "@/components/auth-gate"
import { MockDataBanner, EmptyUserBanner } from "@/components/mock-data-banner"

export type Workout = {
  id: string
  exercise_name: string
  category: string
  sets: number | null
  reps: number | null
  weight_lbs: number | null
  duration_minutes: number | null
  notes: string | null
  workout_date: string
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
  strength: {
    label: "Strength",
    class: "bg-primary/15 text-primary border-primary/30",
  },
  cardio: {
    label: "Cardio",
    class: "bg-destructive/15 text-destructive border-destructive/30",
  },
  flexibility: {
    label: "Flexibility",
    class: "bg-success/15 text-success border-success/30",
  },
}

const WEEKLY_GOALS = {
  sessions: 5,
  volumeLbs: 50000,
  durationMin: 180,
  activeDays: 5,
}

async function fetcher(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

interface FitnessContentProps {
  initialWorkouts: Workout[]
  isGuest?: boolean
  showingMockData?: boolean
}

export function FitnessContent({
  initialWorkouts,
  isGuest = false,
  showingMockData = false,
}: FitnessContentProps) {
  const router = useRouter()
  const { requireAuth } = useAuthGate()
  const { data: workouts, mutate } = useSWR<Workout[]>(
    isGuest || showingMockData ? null : "/api/workouts",
    fetcher,
    { fallbackData: initialWorkouts },
  )
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("home")

  const allWorkouts = workouts ?? initialWorkouts

  // -- Filtered workouts --
  const filtered = allWorkouts.filter((w) => {
    const matchSearch = w.exercise_name
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchCategory =
      filterCategory === "all" || w.category === filterCategory
    return matchSearch && matchCategory
  })

  // -- Stats --
  const stats = useMemo(() => {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisWeek = allWorkouts.filter(
      (w) => new Date(w.workout_date) >= sevenDaysAgo,
    )
    const totalVolume = thisWeek.reduce((sum, w) => {
      if (w.sets && w.reps && w.weight_lbs)
        return sum + w.sets * w.reps * w.weight_lbs
      return sum
    }, 0)
    const totalDuration = thisWeek.reduce(
      (sum, w) => sum + (w.duration_minutes ?? 0),
      0,
    )
    const uniqueDays = new Set(thisWeek.map((w) => w.workout_date)).size
    const streakDays = calculateStreak(allWorkouts)

    return {
      weeklyWorkouts: thisWeek.length,
      totalVolume,
      totalDuration: Math.round(totalDuration),
      activeDays: uniqueDays,
      streak: streakDays,
    }
  }, [allWorkouts])

  // -- Chart: Volume over last 4 weeks --
  const volumeChartData = useMemo(() => {
    const now = new Date()
    const weeks: { week: string; volume: number; sessions: number }[] = []
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(
        now.getTime() - (i * 7 + 6) * 24 * 60 * 60 * 1000,
      )
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
      const weekLabel = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
      const weekWorkouts = allWorkouts.filter((w) => {
        const d = new Date(w.workout_date)
        return d >= weekStart && d <= weekEnd
      })
      const vol = weekWorkouts.reduce((s, w) => {
        if (w.sets && w.reps && w.weight_lbs)
          return s + w.sets * w.reps * w.weight_lbs
        return s
      }, 0)
      weeks.push({
        week: weekLabel,
        volume: Math.round(vol),
        sessions: weekWorkouts.length,
      })
    }
    return weeks
  }, [allWorkouts])

  // -- Chart: Daily activity for last 14 days --
  const dailyActivityData = useMemo(() => {
    const now = new Date()
    const days: { day: string; workouts: number; duration: number }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = d.toISOString().split("T")[0]
      const label = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
      const dayWorkouts = allWorkouts.filter(
        (w) => w.workout_date === dateStr,
      )
      const dur = dayWorkouts.reduce(
        (s, w) => s + (w.duration_minutes ?? 0),
        0,
      )
      days.push({
        day: label,
        workouts: dayWorkouts.length,
        duration: Math.round(dur),
      })
    }
    return days
  }, [allWorkouts])

  // -- Goals: weekly day-by-day data --
  const weeklyGoalsData = useMemo(() => {
    const now = new Date()
    const rows: {
      label: string
      dateStr: string
      workouts: number
      volume: number
      duration: number
    }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = d.toISOString().split("T")[0]
      const label = d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
      const dayWorkouts = allWorkouts.filter((w) => w.workout_date === dateStr)
      const vol = dayWorkouts.reduce((s, w) => {
        if (w.sets && w.reps && w.weight_lbs)
          return s + w.sets * w.reps * w.weight_lbs
        return s
      }, 0)
      const dur = dayWorkouts.reduce(
        (s, w) => s + (w.duration_minutes ?? 0),
        0,
      )
      rows.push({
        label,
        dateStr,
        workouts: dayWorkouts.length,
        volume: Math.round(vol),
        duration: Math.round(dur),
      })
    }
    return rows
  }, [allWorkouts])

  // -- Handlers --
  function handleAddClick() {
    if (!requireAuth("log a workout")) return
    setDialogOpen(true)
  }

  async function handleCreate(formData: FormData) {
    setIsSubmitting(true)
    try {
      const result = await createWorkout(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Workout logged")
        setDialogOpen(false)
        mutate()
        router.refresh()
      }
    } catch {
      toast.error("Failed to log workout")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!requireAuth("delete a workout")) return
    try {
      const result = await deleteWorkout(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Workout deleted")
        mutate()
        router.refresh()
      }
    } catch {
      toast.error("Failed to delete workout")
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  function formatVolume(n: number) {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
    return n.toString()
  }

  function clampPercent(value: number, goal: number) {
    return Math.min(Math.round((value / goal) * 100), 100)
  }

  // -- Group workouts by date --
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Workout[]> = {}
    for (const w of filtered) {
      if (!groups[w.workout_date]) groups[w.workout_date] = []
      groups[w.workout_date].push(w)
    }
    return Object.entries(groups).sort(
      (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime(),
    )
  }, [filtered])

  // -- Recent workouts (for home tab, limit to 5) --
  const recentWorkouts = allWorkouts.slice(0, 5)

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
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">This Week</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-foreground">{stats.weeklyWorkouts}</p>
              <span className="text-xs text-muted-foreground">workouts</span>
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
            <p className="text-xs text-muted-foreground">Volume</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-foreground">{formatVolume(stats.totalVolume)}</p>
              <span className="text-xs text-muted-foreground">lbs</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warning/10">
            <Timer className="h-5 w-5 text-warning" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Duration</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-foreground">{stats.totalDuration}</p>
              <span className="text-xs text-muted-foreground">min</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success/10">
            <Zap className="h-5 w-5 text-success" />
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
    </div>
  )

  const VolumeChart = (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Weekly Volume</CardTitle>
        <CardDescription>Total lifting volume (sets x reps x weight) per week</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            volume: { label: "Volume (lbs)", color: "hsl(var(--chart-1))" },
            sessions: { label: "Sessions", color: "hsl(var(--chart-2))" },
          }}
          className="h-[260px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="week" className="text-xs" tick={{ fill: COLORS.muted }} />
              <YAxis className="text-xs" tick={{ fill: COLORS.muted }} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="volume" fill={COLORS.primary} radius={[4, 4, 0, 0]} name="Volume (lbs)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )

  const ActivityChart = (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Daily Activity</CardTitle>
        <CardDescription>Workouts and duration over the last 14 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            workouts: { label: "Workouts", color: "hsl(var(--chart-1))" },
            duration: { label: "Duration (min)", color: "hsl(var(--chart-2))" },
          }}
          className="h-[260px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyActivityData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="day" className="text-xs" tick={{ fill: COLORS.muted }} interval="preserveStartEnd" />
              <YAxis className="text-xs" tick={{ fill: COLORS.muted }} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="duration" stroke={COLORS.chart2} fill={COLORS.chart2} fillOpacity={0.15} strokeWidth={2} name="Duration (min)" />
              <Line type="monotone" dataKey="workouts" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 3, fill: COLORS.primary }} name="Workouts" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )

  const GoalsProgressCards = (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Card>
        <CardContent className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Sessions</p>
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {stats.weeklyWorkouts}{" "}
              <span className="text-sm font-normal text-muted-foreground">/ {WEEKLY_GOALS.sessions}</span>
            </p>
          </div>
          <Progress value={clampPercent(stats.weeklyWorkouts, WEEKLY_GOALS.sessions)} className="h-2" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Volume</p>
            <Flame className="h-4 w-4 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {formatVolume(stats.totalVolume)}{" "}
              <span className="text-sm font-normal text-muted-foreground">/ {formatVolume(WEEKLY_GOALS.volumeLbs)} lbs</span>
            </p>
          </div>
          <Progress value={clampPercent(stats.totalVolume, WEEKLY_GOALS.volumeLbs)} className="h-2" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Duration</p>
            <Timer className="h-4 w-4 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {stats.totalDuration}{" "}
              <span className="text-sm font-normal text-muted-foreground">/ {WEEKLY_GOALS.durationMin} min</span>
            </p>
          </div>
          <Progress value={clampPercent(stats.totalDuration, WEEKLY_GOALS.durationMin)} className="h-2" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Active Days</p>
            <CalendarDays className="h-4 w-4 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {stats.activeDays}{" "}
              <span className="text-sm font-normal text-muted-foreground">/ {WEEKLY_GOALS.activeDays} days</span>
            </p>
          </div>
          <Progress value={clampPercent(stats.activeDays, WEEKLY_GOALS.activeDays)} className="h-2" />
        </CardContent>
      </Card>
    </div>
  )

  function WorkoutCard({ workout }: { workout: Workout }) {
    return (
      <Card className="transition-colors hover:bg-accent/50">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            {workout.category === "cardio" ? (
              <Flame className="h-5 w-5 text-destructive" />
            ) : workout.category === "flexibility" ? (
              <Target className="h-5 w-5 text-success" />
            ) : (
              <Dumbbell className="h-5 w-5 text-primary" />
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">{workout.exercise_name}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {workout.sets && workout.reps && (
                  <span>
                    {workout.sets} x {workout.reps}
                    {workout.weight_lbs ? ` @ ${workout.weight_lbs} lbs` : ""}
                  </span>
                )}
                {workout.duration_minutes && (
                  <span className="flex items-center gap-1">
                    <Timer className="h-3 w-3 shrink-0" />
                    {workout.duration_minutes} min
                  </span>
                )}
              </div>
              {workout.notes && (
                <p className="mt-0.5 text-xs text-muted-foreground truncate max-w-md">{workout.notes}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`shrink-0 capitalize ${categoryConfig[workout.category]?.class ?? ""}`}>
                {categoryConfig[workout.category]?.label ?? workout.category}
              </Badge>
              {workout.weight_lbs ? (
                <Badge variant="secondary" className="shrink-0">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {workout.weight_lbs} lbs
                </Badge>
              ) : null}
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
              <DropdownMenuItem
                onClick={() => handleDelete(workout.id)}
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

  const LogDialog = (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={handleAddClick} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Log Workout
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Workout</DialogTitle>
        </DialogHeader>
        <form action={handleCreate} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="exercise_name">Exercise *</Label>
            <Input id="exercise_name" name="exercise_name" required placeholder="e.g. Bench Press, Running, Yoga" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue="strength">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="strength">Strength</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="flexibility">Flexibility</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="workout_date">Date</Label>
              <Input id="workout_date" name="workout_date" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="sets">Sets</Label>
              <Input id="sets" name="sets" type="number" min="0" placeholder="3" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="reps">Reps</Label>
              <Input id="reps" name="reps" type="number" min="0" placeholder="10" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="weight_lbs">Weight (lbs)</Label>
              <Input id="weight_lbs" name="weight_lbs" type="number" min="0" step="0.5" placeholder="135" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="duration_minutes">Duration (min)</Label>
            <Input id="duration_minutes" name="duration_minutes" type="number" min="0" placeholder="45" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="How did it feel? Any PRs?" rows={2} />
          </div>
          <Button type="submit" disabled={isSubmitting} className="mt-2">
            {isSubmitting ? "Logging..." : "Log Workout"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="flex flex-col gap-6">
      {isGuest && <MockDataBanner dataType="workouts" />}
      {showingMockData && (
        <EmptyUserBanner dataType="workouts" actionLabel="Log your first workout" />
      )}

      {/* -- Header -- */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Fitness Tracker</h1>
          <p className="text-sm text-muted-foreground">Log workouts, track progress, stay consistent</p>
        </div>
        {LogDialog}
      </div>

      {/* -- Tabs -- */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-6">
        <TabsList className="w-fit">
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="log">Log</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        {/* ===================== HOME TAB ===================== */}
        <TabsContent value="home" className="flex flex-col gap-6 mt-0">
          {/* Stat cards row */}
          {StatCards}

          {/* Charts row - 2 cards side by side on larger screens */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Weekly progress breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Weekly Progress</CardTitle>
                <CardDescription>Activity breakdown for the last 7 days</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {/* Mini goal progress bars */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Activity className="h-3.5 w-3.5 text-primary" />
                        Sessions
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {stats.weeklyWorkouts}/{WEEKLY_GOALS.sessions}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${clampPercent(stats.weeklyWorkouts, WEEKLY_GOALS.sessions)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Flame className="h-3.5 w-3.5 text-destructive" />
                        Volume
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatVolume(stats.totalVolume)}/{formatVolume(WEEKLY_GOALS.volumeLbs)} lbs
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-destructive transition-all"
                        style={{ width: `${clampPercent(stats.totalVolume, WEEKLY_GOALS.volumeLbs)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Timer className="h-3.5 w-3.5 text-warning" />
                        Duration
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {stats.totalDuration}/{WEEKLY_GOALS.durationMin} min
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-warning transition-all"
                        style={{ width: `${clampPercent(stats.totalDuration, WEEKLY_GOALS.durationMin)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Active days visualization */}
                <div className="mt-1 rounded-lg border p-3">
                  <p className="mb-2 text-xs text-muted-foreground">Active days this week</p>
                  <div className="flex items-center gap-1">
                    {weeklyGoalsData.map((day) => (
                      <div
                        key={day.dateStr}
                        className={`flex h-8 flex-1 items-center justify-center rounded text-[10px] font-medium transition-colors ${
                          day.workouts > 0
                            ? "bg-success text-success-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                        title={`${day.label}: ${day.workouts} workout${day.workouts !== 1 ? 's' : ''}`}
                      >
                        {day.label.split(',')[0].substring(0, 1)}
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    {stats.activeDays} of {WEEKLY_GOALS.activeDays} days complete
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Category breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">By Category</CardTitle>
                <CardDescription>Workout distribution this week</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {(() => {
                  const now = new Date()
                  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                  const thisWeek = allWorkouts.filter((w) => new Date(w.workout_date) >= sevenDaysAgo)
                  const strengthCount = thisWeek.filter((w) => w.category === "strength").length
                  const cardioCount = thisWeek.filter((w) => w.category === "cardio").length
                  const flexibilityCount = thisWeek.filter((w) => w.category === "flexibility").length
                  const total = thisWeek.length
                  
                  return (
                    <>
                      {/* Category tiles */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col items-center gap-1 rounded-lg border-t-2 border-t-primary bg-muted/30 px-2 py-3">
                          <Dumbbell className="h-3.5 w-3.5 text-primary" />
                          <p className="text-2xl font-bold text-foreground">{strengthCount}</p>
                          <p className="text-[11px] text-muted-foreground">Strength</p>
                        </div>
                        <div className="flex flex-col items-center gap-1 rounded-lg border-t-2 border-t-destructive bg-muted/30 px-2 py-3">
                          <Flame className="h-3.5 w-3.5 text-destructive" />
                          <p className="text-2xl font-bold text-foreground">{cardioCount}</p>
                          <p className="text-[11px] text-muted-foreground">Cardio</p>
                        </div>
                        <div className="flex flex-col items-center gap-1 rounded-lg border-t-2 border-t-success bg-muted/30 px-2 py-3">
                          <Target className="h-3.5 w-3.5 text-success" />
                          <p className="text-2xl font-bold text-foreground">{flexibilityCount}</p>
                          <p className="text-[11px] text-muted-foreground">Flexibility</p>
                        </div>
                      </div>

                      {/* Distribution bar */}
                      <div className="flex items-center gap-0.5">
                        {[
                          { label: "Strength", count: strengthCount, color: "hsl(var(--primary))" },
                          { label: "Cardio", count: cardioCount, color: "hsl(var(--destructive))" },
                          { label: "Flexibility", count: flexibilityCount, color: "hsl(var(--success))" },
                        ].map((cat, i, arr) => {
                          const pct = total > 0 ? Math.max((cat.count / total) * 100, 8) : 33
                          return (
                            <div
                              key={cat.label}
                              className="flex h-7 items-center justify-center text-[11px] font-semibold"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: cat.color,
                                color: "#fff",
                                borderRadius: i === 0 ? "var(--radius) 0 0 var(--radius)" : i === arr.length - 1 ? "0 var(--radius) var(--radius) 0" : "0",
                              }}
                            >
                              {cat.count > 0 ? cat.count : ""}
                            </div>
                          )
                        })}
                      </div>

                      {/* Streak highlight */}
                      <div className="flex items-center gap-2 rounded-lg border border-success/20 bg-success/5 p-3">
                        <Zap className="h-4 w-4 shrink-0 text-success" />
                        <div>
                          <p className="text-xs text-muted-foreground">Current streak</p>
                          <p className="text-lg font-bold text-foreground">
                            {stats.streak} {stats.streak === 1 ? 'day' : 'days'}
                          </p>
                        </div>
                      </div>
                    </>
                  )
                })()}
              </CardContent>
            </Card>
          </div>

          {/* Recent workouts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">Recent Workouts</CardTitle>
                <CardDescription>{allWorkouts.length} total workouts logged</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab("log")}>
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentWorkouts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Dumbbell className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium text-foreground">No workouts yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Log your first workout to get started</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {recentWorkouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="flex items-center gap-3 rounded-lg border border-border p-3"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        {workout.category === "cardio" ? (
                          <Flame className="h-5 w-5 text-destructive" />
                        ) : workout.category === "flexibility" ? (
                          <Target className="h-5 w-5 text-success" />
                        ) : (
                          <Dumbbell className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground">{workout.exercise_name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {workout.sets && workout.reps && (
                            <span>
                              {workout.sets} x {workout.reps}
                              {workout.weight_lbs ? ` @ ${workout.weight_lbs} lbs` : ""}
                            </span>
                          )}
                          {workout.duration_minutes && (
                            <span className="flex items-center gap-1">
                              <Timer className="h-3 w-3" />
                              {workout.duration_minutes} min
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`shrink-0 capitalize ${categoryConfig[workout.category]?.class ?? ""}`}>
                          {categoryConfig[workout.category]?.label ?? workout.category}
                        </Badge>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatDate(workout.workout_date)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================== LOG TAB ===================== */}
        <TabsContent value="log" className="flex flex-col gap-6 mt-0">
          {/* Search / filter */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search exercises..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="strength">Strength</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="flexibility">Flexibility</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Workout list grouped by date */}
          {groupedByDate.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Dumbbell className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium text-foreground">No workouts found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {search || filterCategory !== "all" ? "Try adjusting your filters" : "Log your first workout to get started"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-6">
              {groupedByDate.map(([date, dateWorkouts]) => {
                const dayVolume = dateWorkouts.reduce((s, w) => {
                  if (w.sets && w.reps && w.weight_lbs) return s + w.sets * w.reps * w.weight_lbs
                  return s
                }, 0)
                return (
                  <div key={date} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-medium text-muted-foreground">{formatDate(date)}</h2>
                      {dayVolume > 0 && (
                        <span className="text-xs text-muted-foreground">{formatVolume(dayVolume)} lbs volume</span>
                      )}
                    </div>
                    <div className="grid gap-3">
                      {dateWorkouts.map((workout) => (
                        <WorkoutCard key={workout.id} workout={workout} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* ===================== ANALYTICS TAB ===================== */}
        <TabsContent value="analytics" className="flex flex-col gap-6 mt-0">
          {StatCards}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {VolumeChart}
            {ActivityChart}
          </div>
        </TabsContent>

        {/* ===================== GOALS TAB ===================== */}
        <TabsContent value="goals" className="flex flex-col gap-6 mt-0">
          {GoalsProgressCards}

          {/* Daily breakdown for the week */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Weekly Breakdown</CardTitle>
              <CardDescription>Day-by-day activity for the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {weeklyGoalsData.map((day) => {
                  const isToday = day.dateStr === new Date().toISOString().split("T")[0]
                  return (
                    <div
                      key={day.dateStr}
                      className={`flex flex-col gap-2 rounded-lg border p-4 ${isToday ? "border-primary/30 bg-primary/5" : "border-border"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium ${isToday ? "text-primary" : "text-foreground"}`}>{day.label}</p>
                          {isToday && <Badge variant="secondary" className="text-xs">Today</Badge>}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {day.workouts} workout{day.workouts !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-muted-foreground">Volume</span>
                          <span className="font-medium text-foreground">
                            {day.volume > 0 ? `${formatVolume(day.volume)} lbs` : "---"}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-muted-foreground">Duration</span>
                          <span className="font-medium text-foreground">
                            {day.duration > 0 ? `${day.duration} min` : "---"}
                          </span>
                        </div>
                      </div>
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

/** Compute current streak: consecutive days (ending today or yesterday) with at least one workout */
function calculateStreak(workouts: Workout[]): number {
  if (workouts.length === 0) return 0
  const dates = new Set(workouts.map((w) => w.workout_date))
  const today = new Date()
  let streak = 0
  const d = new Date(today)

  const todayStr = d.toISOString().split("T")[0]
  if (!dates.has(todayStr)) {
    d.setDate(d.getDate() - 1)
  }

  while (true) {
    const dateStr = d.toISOString().split("T")[0]
    if (dates.has(dateStr)) {
      streak++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}
