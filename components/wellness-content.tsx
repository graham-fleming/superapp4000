"use client"

import React, { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { toast } from "sonner"
import {
  Plus,
  Search,
  TrendingUp,
  Trash2,
  MoreHorizontal,
  CalendarDays,
  ArrowRight,
  Pencil,
  Brain,
  Smile,
  Frown,
  Meh,
  SmilePlus,
  Angry,
  Moon,
  Zap,
  Tag,
  BarChart3,
  BookOpen,
  Activity,
  Heart,
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Scatter,
  ScatterChart,
  ZAxis,
} from "recharts"
import {
  createMoodEntry,
  updateMoodEntry,
  deleteMoodEntry,
} from "@/app/(app)/wellness/actions"
import { useAuthGate } from "@/components/auth-gate"
import { MockDataBanner, EmptyUserBanner } from "@/components/mock-data-banner"

export type MoodEntry = {
  id: string
  mood: number
  energy_level: number | null
  sleep_quality: number | null
  notes: string | null
  tags: string[]
  entry_date: string
  created_at: string
}

const MOOD_CONFIG: Record<number, { label: string; color: string; bgClass: string; icon: React.ElementType }> = {
  1: { label: "Awful", color: "#ef4444", bgClass: "bg-red-500/15 text-red-600", icon: Angry },
  2: { label: "Bad", color: "#f97316", bgClass: "bg-orange-500/15 text-orange-600", icon: Frown },
  3: { label: "Okay", color: "#eab308", bgClass: "bg-yellow-500/15 text-yellow-700", icon: Meh },
  4: { label: "Good", color: "#14b8a6", bgClass: "bg-teal-500/15 text-teal-600", icon: Smile },
  5: { label: "Great", color: "#22c55e", bgClass: "bg-green-500/15 text-green-600", icon: SmilePlus },
}

const LEVEL_LABELS = ["", "Very Low", "Low", "Moderate", "High", "Very High"]

const SUGGESTED_TAGS = [
  "work", "exercise", "social", "family", "travel",
  "stress", "relax", "creative", "nature", "learning",
]

const COLORS = {
  primary: "hsl(215, 80%, 48%)",
  success: "hsl(142, 71%, 45%)",
  warning: "hsl(38, 92%, 50%)",
  destructive: "hsl(0, 72%, 51%)",
  muted: "hsl(220, 10%, 46%)",
}

async function fetcher(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

interface WellnessContentProps {
  initialEntries: MoodEntry[]
  isGuest?: boolean
  showingMockData?: boolean
}

export function WellnessContent({
  initialEntries,
  isGuest = false,
  showingMockData = false,
}: WellnessContentProps) {
  const router = useRouter()
  const { requireAuth } = useAuthGate()
  const { data: entries, mutate: mutateEntries } = useSWR<MoodEntry[]>(
    isGuest || showingMockData ? null : "/api/mood-entries",
    fetcher,
    { fallbackData: initialEntries },
  )

  const [search, setSearch] = useState("")
  const [filterMood, setFilterMood] = useState<string>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<MoodEntry | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("home")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [editSelectedTags, setEditSelectedTags] = useState<string[]>([])

  const allEntries = entries ?? initialEntries
  const today = new Date().toISOString().split("T")[0]
  const todayEntry = allEntries.find((e) => e.entry_date === today)

  // -- Filtered entries for journal --
  const filtered = allEntries.filter((e) => {
    const matchSearch = !search || (e.notes && e.notes.toLowerCase().includes(search.toLowerCase()))
    const matchMood = filterMood === "all" || e.mood === parseInt(filterMood)
    return matchSearch && matchMood
  })

  // -- Stats --
  const stats = useMemo(() => {
    if (allEntries.length === 0) return { avgMood: 0, avgEnergy: 0, avgSleep: 0, streak: 0, totalEntries: 0, weekAvg: 0 }

    const last7 = allEntries.filter((e) => {
      const d = new Date(e.entry_date)
      const sevenAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return d >= sevenAgo
    })

    const avgMood = last7.length > 0
      ? parseFloat((last7.reduce((s, e) => s + e.mood, 0) / last7.length).toFixed(1))
      : 0

    const energyEntries = last7.filter((e) => e.energy_level !== null)
    const avgEnergy = energyEntries.length > 0
      ? parseFloat((energyEntries.reduce((s, e) => s + (e.energy_level ?? 0), 0) / energyEntries.length).toFixed(1))
      : 0

    const sleepEntries = last7.filter((e) => e.sleep_quality !== null)
    const avgSleep = sleepEntries.length > 0
      ? parseFloat((sleepEntries.reduce((s, e) => s + (e.sleep_quality ?? 0), 0) / sleepEntries.length).toFixed(1))
      : 0

    // Streak: consecutive days with an entry
    let streak = 0
    const d = new Date()
    const todayStr = d.toISOString().split("T")[0]
    const hasToday = allEntries.some((e) => e.entry_date === todayStr)
    if (!hasToday) d.setDate(d.getDate() - 1)
    while (true) {
      const dateStr = d.toISOString().split("T")[0]
      if (allEntries.some((e) => e.entry_date === dateStr)) {
        streak++
        d.setDate(d.getDate() - 1)
      } else {
        break
      }
    }

    return { avgMood, avgEnergy, avgSleep, streak, totalEntries: allEntries.length, weekAvg: avgMood }
  }, [allEntries])

  // -- Chart: Mood trend over last 30 days --
  const moodTrendData = useMemo(() => {
    const days: { day: string; mood: number | null; energy: number | null; sleep: number | null }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const dateStr = d.toISOString().split("T")[0]
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      const entry = allEntries.find((e) => e.entry_date === dateStr)
      days.push({
        day: label,
        mood: entry?.mood ?? null,
        energy: entry?.energy_level ?? null,
        sleep: entry?.sleep_quality ?? null,
      })
    }
    return days
  }, [allEntries])

  // -- Chart: Mood distribution --
  const moodDistribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]
    allEntries.forEach((e) => { counts[e.mood - 1]++ })
    return [1, 2, 3, 4, 5].map((m) => ({
      mood: MOOD_CONFIG[m].label,
      count: counts[m - 1],
      fill: MOOD_CONFIG[m].color,
    }))
  }, [allEntries])

  // -- Chart: Day of week averages --
  const dayOfWeekData = useMemo(() => {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const daySums: number[] = [0, 0, 0, 0, 0, 0, 0]
    const dayCounts: number[] = [0, 0, 0, 0, 0, 0, 0]

    allEntries.forEach((e) => {
      const day = new Date(e.entry_date + "T00:00:00").getDay()
      daySums[day] += e.mood
      dayCounts[day]++
    })

    return dayNames.map((name, i) => ({
      day: name,
      avgMood: dayCounts[i] > 0 ? parseFloat((daySums[i] / dayCounts[i]).toFixed(2)) : 0,
      entries: dayCounts[i],
      fill: dayCounts[i] > 0
        ? MOOD_CONFIG[Math.round(daySums[i] / dayCounts[i])].color
        : "hsl(var(--muted))",
    }))
  }, [allEntries])

  // -- Chart: Tag frequency with mood averages --
  const tagData = useMemo(() => {
    const tagMap: Record<string, { count: number; moodSum: number }> = {}
    allEntries.forEach((e) => {
      (e.tags ?? []).forEach((tag) => {
        if (!tagMap[tag]) tagMap[tag] = { count: 0, moodSum: 0 }
        tagMap[tag].count++
        tagMap[tag].moodSum += e.mood
      })
    })

    return Object.entries(tagMap)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([tag, data]) => ({
        tag,
        count: data.count,
        avgMood: parseFloat((data.moodSum / data.count).toFixed(2)),
        fill: MOOD_CONFIG[Math.round(data.moodSum / data.count)]?.color ?? COLORS.muted,
      }))
  }, [allEntries])

  // -- Chart: Energy vs Sleep scatter correlation --
  const correlationData = useMemo(() => {
    return allEntries
      .filter((e) => e.energy_level !== null && e.sleep_quality !== null)
      .map((e) => ({
        energy: e.energy_level,
        sleep: e.sleep_quality,
        mood: e.mood,
        fill: MOOD_CONFIG[e.mood].color,
      }))
  }, [allEntries])

  // -- Calendar heatmap for patterns --
  const calendarData = useMemo(() => {
    const days: { date: string; label: string; dayName: string; mood: number | null }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const dateStr = d.toISOString().split("T")[0]
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" })
      const entry = allEntries.find((e) => e.entry_date === dateStr)
      days.push({ date: dateStr, label, dayName, mood: entry?.mood ?? null })
    }
    return days
  }, [allEntries])

  // -- Handlers --
  function handleAddClick() {
    if (!requireAuth("log a mood entry")) return
    setSelectedTags([])
    setDialogOpen(true)
  }

  function handleEditClick(entry: MoodEntry) {
    if (!requireAuth("edit a mood entry")) return
    setEditingEntry(entry)
    setEditSelectedTags(entry.tags ?? [])
    setEditDialogOpen(true)
  }

  async function handleCreate(formData: FormData) {
    setIsSubmitting(true)
    try {
      formData.set("tags", selectedTags.join(","))
      const result = await createMoodEntry(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Mood entry saved")
        setDialogOpen(false)
        setSelectedTags([])
        mutateEntries()
        router.refresh()
      }
    } catch {
      toast.error("Failed to save entry")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdate(formData: FormData) {
    if (!editingEntry) return
    setIsSubmitting(true)
    try {
      formData.set("tags", editSelectedTags.join(","))
      const result = await updateMoodEntry(editingEntry.id, formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Entry updated")
        setEditDialogOpen(false)
        setEditingEntry(null)
        mutateEntries()
        router.refresh()
      }
    } catch {
      toast.error("Failed to update entry")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!requireAuth("delete a mood entry")) return
    try {
      const result = await deleteMoodEntry(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Entry deleted")
        mutateEntries()
        router.refresh()
      }
    } catch {
      toast.error("Failed to delete entry")
    }
  }

  function toggleTag(tag: string, isEdit = false) {
    if (isEdit) {
      setEditSelectedTags((prev) =>
        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
      )
    } else {
      setSelectedTags((prev) =>
        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
      )
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  function getMoodBgColor(mood: number | null): string {
    if (mood === null) return "bg-muted"
    if (mood >= 5) return "bg-green-500"
    if (mood >= 4) return "bg-teal-500"
    if (mood >= 3) return "bg-yellow-500"
    if (mood >= 2) return "bg-orange-500"
    return "bg-red-500"
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

  function MoodIcon({ mood, className }: { mood: number; className?: string }) {
    const Icon = MOOD_CONFIG[mood]?.icon ?? Meh
    return <Icon className={className} style={{ color: MOOD_CONFIG[mood]?.color }} />
  }

  const StatCards = (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-500/10">
            <Smile className="h-5 w-5 text-teal-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Avg Mood</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-foreground">{stats.avgMood}</p>
              <span className="text-xs text-muted-foreground">/ 5</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
            <Zap className="h-5 w-5 text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Avg Energy</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-foreground">{stats.avgEnergy}</p>
              <span className="text-xs text-muted-foreground">/ 5</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10">
            <Moon className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Avg Sleep</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-foreground">{stats.avgSleep}</p>
              <span className="text-xs text-muted-foreground">/ 5</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/10">
            <CalendarDays className="h-5 w-5 text-rose-600" />
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

  // -- Today's Check-in Card --
  function TodayCheckin() {
    if (todayEntry) {
      const moodCfg = MOOD_CONFIG[todayEntry.mood]
      return (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
                style={{ backgroundColor: moodCfg.color + "20" }}
              >
                <MoodIcon mood={todayEntry.mood} className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{"Today's mood"}</p>
                <p className="text-xl font-bold text-foreground">{moodCfg.label}</p>
                {todayEntry.notes && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-1 max-w-md">{todayEntry.notes}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {todayEntry.energy_level && (
                <div className="text-center">
                  <Zap className="mx-auto h-4 w-4 text-amber-500" />
                  <p className="text-xs text-muted-foreground mt-0.5">{LEVEL_LABELS[todayEntry.energy_level]}</p>
                </div>
              )}
              {todayEntry.sleep_quality && (
                <div className="text-center">
                  <Moon className="mx-auto h-4 w-4 text-indigo-500" />
                  <p className="text-xs text-muted-foreground mt-0.5">{LEVEL_LABELS[todayEntry.sleep_quality]}</p>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={() => handleEditClick(todayEntry)} className="bg-transparent">
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-8">
          <Heart className="h-10 w-10 text-muted-foreground/40" />
          <div className="text-center">
            <p className="font-medium text-foreground">How are you feeling today?</p>
            <p className="text-sm text-muted-foreground">Take a moment to check in with yourself</p>
          </div>
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" />
            Log Mood
          </Button>
        </CardContent>
      </Card>
    )
  }

  // -- Recent Entries List --
  function RecentEntries({ limit = 5 }: { limit?: number }) {
    const recent = allEntries.slice(0, limit)
    if (recent.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No entries yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Start journaling to see your entries here</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="grid gap-3">
        {recent.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>
    )
  }

  // -- Entry Card --
  function EntryCard({ entry }: { entry: MoodEntry }) {
    const moodCfg = MOOD_CONFIG[entry.mood]
    return (
      <Card className="transition-colors hover:bg-accent/50">
        <CardContent className="flex items-start gap-4 p-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: moodCfg.color + "20" }}
          >
            <MoodIcon mood={entry.mood} className="h-5 w-5" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground">{formatDate(entry.entry_date)}</p>
              <Badge variant="outline" className={moodCfg.bgClass}>
                {moodCfg.label}
              </Badge>
            </div>
            {entry.notes && (
              <p className="text-sm text-muted-foreground line-clamp-2">{entry.notes}</p>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {entry.energy_level && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Zap className="h-3 w-3 text-amber-500" /> Energy: {LEVEL_LABELS[entry.energy_level]}
                </span>
              )}
              {entry.sleep_quality && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Moon className="h-3 w-3 text-indigo-500" /> Sleep: {LEVEL_LABELS[entry.sleep_quality]}
                </span>
              )}
              {(entry.tags ?? []).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs capitalize">
                  {tag}
                </Badge>
              ))}
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
              <DropdownMenuItem onClick={() => handleEditClick(entry)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(entry.id)}
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

  // -- Mood Trend Chart --
  const MoodTrendChart = (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Mood Trend</CardTitle>
        <CardDescription>Your mood, energy, and sleep over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            mood: { label: "Mood", color: MOOD_CONFIG[4].color },
            energy: { label: "Energy", color: "#f59e0b" },
            sleep: { label: "Sleep", color: "#6366f1" },
          }}
          className="h-[280px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={moodTrendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="day" className="text-xs" tick={{ fill: COLORS.muted }} interval="preserveStartEnd" />
              <YAxis className="text-xs" tick={{ fill: COLORS.muted }} domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="mood"
                stroke={MOOD_CONFIG[4].color}
                strokeWidth={2.5}
                dot={false}
                connectNulls
                name="Mood"
              />
              <Line
                type="monotone"
                dataKey="energy"
                stroke="#f59e0b"
                strokeWidth={1.5}
                dot={false}
                connectNulls
                strokeDasharray="4 4"
                name="Energy"
              />
              <Line
                type="monotone"
                dataKey="sleep"
                stroke="#6366f1"
                strokeWidth={1.5}
                dot={false}
                connectNulls
                strokeDasharray="4 4"
                name="Sleep"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )

  // -- Mood Distribution Chart --
  const MoodDistChart = (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Mood Distribution</CardTitle>
        <CardDescription>How often you feel each mood level</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            count: { label: "Entries", color: "hsl(var(--chart-1))" },
          }}
          className="h-[280px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={moodDistribution} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis dataKey="mood" className="text-xs" tick={{ fill: COLORS.muted }} />
              <YAxis className="text-xs" tick={{ fill: COLORS.muted }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Entries">
                {moodDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )

  // -- Entry Form --
  function EntryForm({ onSubmit, defaults }: { onSubmit: (fd: FormData) => Promise<void>; defaults?: MoodEntry }) {
    const tags = defaults ? editSelectedTags : selectedTags
    const toggle = (tag: string) => toggleTag(tag, !!defaults)

    return (
      <form action={onSubmit} className="flex flex-col gap-4">
        {!defaults && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="entry_date">Date</Label>
            <Input id="entry_date" name="entry_date" type="date" defaultValue={today} max={today} />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Label>Mood *</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((level) => {
              const cfg = MOOD_CONFIG[level]
              return (
                <label key={level} className="cursor-pointer flex-1">
                  <input type="radio" name="mood" value={level} defaultChecked={defaults ? defaults.mood === level : level === 3} className="sr-only peer" />
                  <div className="flex flex-col items-center gap-1.5 rounded-lg border-2 border-transparent p-2 transition-all peer-checked:border-foreground peer-checked:bg-accent hover:bg-accent/50">
                    <MoodIcon mood={level} className="h-6 w-6" />
                    <span className="text-xs font-medium text-muted-foreground">{cfg.label}</span>
                  </div>
                </label>
              )
            })}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label>Energy Level</Label>
            <Select name="energy_level" defaultValue={defaults?.energy_level?.toString() ?? "3"}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((l) => (
                  <SelectItem key={l} value={l.toString()}>{l} - {LEVEL_LABELS[l]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Sleep Quality</Label>
            <Select name="sleep_quality" defaultValue={defaults?.sleep_quality?.toString() ?? "3"}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((l) => (
                  <SelectItem key={l} value={l.toString()}>{l} - {LEVEL_LABELS[l]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={defaults ? "edit_notes" : "notes"}>Notes</Label>
          <Textarea
            id={defaults ? "edit_notes" : "notes"}
            name="notes"
            placeholder="How was your day? What happened?"
            rows={3}
            defaultValue={defaults?.notes ?? ""}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggle(tag)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  tags.includes(tag)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? (defaults ? "Updating..." : "Saving...") : (defaults ? "Update Entry" : "Save Entry")}
        </Button>
      </form>
    )
  }

  const CreateDialog = (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={handleAddClick} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Log Mood
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Mood</DialogTitle>
        </DialogHeader>
        <EntryForm onSubmit={handleCreate} />
      </DialogContent>
    </Dialog>
  )

  const EditDialog = (
    <Dialog open={editDialogOpen} onOpenChange={(open) => { setEditDialogOpen(open); if (!open) setEditingEntry(null) }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Entry</DialogTitle>
        </DialogHeader>
        {editingEntry && <EntryForm onSubmit={handleUpdate} defaults={editingEntry} />}
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="flex flex-col gap-6">
      {isGuest && <MockDataBanner dataType="wellness journal" />}
      {showingMockData && (
        <EmptyUserBanner dataType="wellness journal" actionLabel="Log your first mood" />
      )}

      {/* -- Header -- */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Wellness Journal</h1>
          <p className="text-sm text-muted-foreground">Track your mood, energy, and sleep patterns</p>
        </div>
        {CreateDialog}
      </div>

      {EditDialog}

      {/* -- Tabs -- */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-6">
        <TabsList className="w-fit">
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
        </TabsList>

        {/* ===================== HOME TAB ===================== */}
        <TabsContent value="home" className="flex flex-col gap-6 mt-0">
          {/* Stat cards row */}
          {StatCards}

          {/* Today's check-in */}
          <TodayCheckin />

          {/* Charts row - 2 cards side by side */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Weekly Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Weekly Summary</CardTitle>
                <CardDescription>7-day mood and wellness breakdown</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {moodDistribution.length === 0 || moodDistribution.every(m => m.count === 0) ? (
                  <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                    <BarChart3 className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No entries yet</p>
                  </div>
                ) : (
                  <>
                    {/* Mood distribution mini bars */}
                    <div className="flex flex-col gap-3">
                      {[5, 4, 3, 2, 1].map((moodLevel) => {
                        const dist = moodDistribution.find(m => MOOD_CONFIG[moodLevel].label === m.mood)
                        const count = dist?.count ?? 0
                        const totalCount = moodDistribution.reduce((s, m) => s + m.count, 0)
                        const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0
                        
                        return (
                          <div key={moodLevel} className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <MoodIcon mood={moodLevel} className="h-3.5 w-3.5" />
                                {MOOD_CONFIG[moodLevel].label}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {count} ({pct}%)
                              </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: MOOD_CONFIG[moodLevel].color,
                                }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Weekly stats highlight */}
                    <div className="mt-1 rounded-lg border border-teal-500/20 bg-teal-500/5 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 shrink-0 text-teal-600" />
                          <div>
                            <p className="text-xs text-muted-foreground">Weekly average</p>
                            <p className="text-lg font-bold text-foreground">{stats.weekAvg}/5</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Total entries</p>
                          <p className="text-lg font-bold text-foreground">{stats.totalEntries}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Recent Entries Preview */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base">Recent Entries</CardTitle>
                  <CardDescription>Your latest journal entries</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab("journal")}>
                  View all <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {allEntries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                    <BookOpen className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No entries yet</p>
                    <p className="text-xs mt-1">Start journaling</p>
                  </div>
                ) : (
                  allEntries.slice(0, 4).map((entry) => {
                    const moodCfg = MOOD_CONFIG[entry.mood]
                    return (
                      <div
                        key={entry.id}
                        className="flex items-start gap-3 rounded-lg border border-border p-3"
                      >
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                          style={{ backgroundColor: moodCfg.color + "20" }}
                        >
                          <MoodIcon mood={entry.mood} className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-foreground">{moodCfg.label}</p>
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {new Date(entry.entry_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          </div>
                          {entry.notes && (
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{entry.notes}</p>
                          )}
                          <div className="mt-1.5 flex items-center gap-3">
                            {entry.energy_level && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Zap className="h-3 w-3 text-amber-500" />
                                {entry.energy_level}/5
                              </span>
                            )}
                            {entry.sleep_quality && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Moon className="h-3 w-3 text-indigo-500" />
                                {entry.sleep_quality}/5
                              </span>
                            )}
                            {entry.tags && entry.tags.length > 0 && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Tag className="h-3 w-3" />
                                {entry.tags[0]}
                                {entry.tags.length > 1 && ` +${entry.tags.length - 1}`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Mood trend chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">Mood Trend</CardTitle>
                <CardDescription>Your mood, energy, and sleep over the last 30 days</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab("insights")}>
                View insights <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  mood: { label: "Mood", color: MOOD_CONFIG[4].color },
                  energy: { label: "Energy", color: "#f59e0b" },
                  sleep: { label: "Sleep", color: "#6366f1" },
                }}
                className="h-[240px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={moodTrendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" className="text-xs" tick={{ fill: COLORS.muted }} interval="preserveStartEnd" />
                    <YAxis className="text-xs" tick={{ fill: COLORS.muted }} domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="mood"
                      stroke={MOOD_CONFIG[4].color}
                      strokeWidth={2.5}
                      dot={false}
                      connectNulls
                      name="Mood"
                    />
                    <Line
                      type="monotone"
                      dataKey="energy"
                      stroke="#f59e0b"
                      strokeWidth={1.5}
                      dot={false}
                      connectNulls
                      strokeDasharray="4 4"
                      name="Energy"
                    />
                    <Line
                      type="monotone"
                      dataKey="sleep"
                      stroke="#6366f1"
                      strokeWidth={1.5}
                      dot={false}
                      connectNulls
                      strokeDasharray="4 4"
                      name="Sleep"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================== JOURNAL TAB ===================== */}
        <TabsContent value="journal" className="flex flex-col gap-6 mt-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search notes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={filterMood} onValueChange={setFilterMood}>
                <SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Moods</SelectItem>
                  {[5, 4, 3, 2, 1].map((m) => (
                    <SelectItem key={m} value={m.toString()}>{MOOD_CONFIG[m].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium text-foreground">No entries found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {search || filterMood !== "all" ? "Try adjusting your filters" : "Log your first mood to get started"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {filtered.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ===================== INSIGHTS TAB ===================== */}
        <TabsContent value="insights" className="flex flex-col gap-6 mt-0">
          {StatCards}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {MoodTrendChart}
            {MoodDistChart}
          </div>

          {/* Energy vs Sleep Correlation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Energy vs Sleep Correlation</CardTitle>
              <CardDescription>How your sleep quality relates to your energy levels, colored by mood</CardDescription>
            </CardHeader>
            <CardContent>
              {correlationData.length === 0 ? (
                <p className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
                  Not enough data yet
                </p>
              ) : (
                <ChartContainer
                  config={{
                    energy: { label: "Energy", color: "#f59e0b" },
                    sleep: { label: "Sleep", color: "#6366f1" },
                  }}
                  className="h-[280px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" dataKey="sleep" name="Sleep Quality" domain={[0, 6]} ticks={[1, 2, 3, 4, 5]} tick={{ fill: COLORS.muted }} label={{ value: "Sleep Quality", position: "insideBottom", offset: -2, fill: COLORS.muted, fontSize: 12 }} />
                      <YAxis type="number" dataKey="energy" name="Energy Level" domain={[0, 6]} ticks={[1, 2, 3, 4, 5]} tick={{ fill: COLORS.muted }} label={{ value: "Energy Level", angle: -90, position: "insideLeft", fill: COLORS.muted, fontSize: 12 }} />
                      <ZAxis range={[60, 60]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Scatter data={correlationData} name="Entries">
                        {correlationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.7} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
              <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                {[1, 2, 3, 4, 5].map((m) => (
                  <div key={m} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: MOOD_CONFIG[m].color }} />
                    {MOOD_CONFIG[m].label}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tag Insights */}
          {tagData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tag Insights</CardTitle>
                <CardDescription>Most frequent tags and their average mood</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    count: { label: "Entries", color: "hsl(var(--chart-1))" },
                  }}
                  className="h-[280px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tagData} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                      <XAxis type="number" className="text-xs" tick={{ fill: COLORS.muted }} />
                      <YAxis type="category" dataKey="tag" className="text-xs" tick={{ fill: COLORS.muted }} width={80} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Entries">
                        {tagData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ===================== PATTERNS TAB ===================== */}
        <TabsContent value="patterns" className="flex flex-col gap-6 mt-0">
          {/* 30-day mood heatmap */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">30-Day Mood Map</CardTitle>
              <CardDescription>Your mood levels over the last 30 days</CardDescription>
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
                      <div
                        className={`h-6 w-6 rounded-md ${getMoodBgColor(day.mood)}`}
                        title={day.mood ? MOOD_CONFIG[day.mood].label : "No entry"}
                      />
                      <span className="text-[10px] text-muted-foreground">{day.label}</span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-sm bg-muted" />
                  <span>None</span>
                </div>
                {[1, 2, 3, 4, 5].map((m) => (
                  <div key={m} className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: MOOD_CONFIG[m].color }} />
                    <span>{MOOD_CONFIG[m].label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Day of Week Patterns */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Day of Week Patterns</CardTitle>
              <CardDescription>Average mood by day of the week</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  avgMood: { label: "Avg Mood", color: MOOD_CONFIG[4].color },
                }}
                className="h-[280px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dayOfWeekData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                    <XAxis dataKey="day" className="text-xs" tick={{ fill: COLORS.muted }} />
                    <YAxis className="text-xs" tick={{ fill: COLORS.muted }} domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="avgMood" radius={[6, 6, 0, 0]} name="Avg Mood">
                      {dayOfWeekData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Weekly mood summary table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Weekly Summary</CardTitle>
              <CardDescription>Detailed breakdown of the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left font-medium text-muted-foreground pb-3 pr-4">Date</th>
                      <th className="text-center font-medium text-muted-foreground pb-3 px-3">Mood</th>
                      <th className="text-center font-medium text-muted-foreground pb-3 px-3">Energy</th>
                      <th className="text-center font-medium text-muted-foreground pb-3 px-3">Sleep</th>
                      <th className="text-left font-medium text-muted-foreground pb-3 px-3">Tags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 7 }).map((_, i) => {
                      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
                      const dateStr = d.toISOString().split("T")[0]
                      const entry = allEntries.find((e) => e.entry_date === dateStr)
                      const isT = dateStr === today

                      return (
                        <tr key={dateStr} className="border-t border-border">
                          <td className={`py-3 pr-4 ${isT ? "font-medium text-primary" : "text-foreground"}`}>
                            {d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                          </td>
                          <td className="text-center py-3 px-3">
                            {entry ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <MoodIcon mood={entry.mood} className="h-4 w-4" />
                                <span className="text-xs" style={{ color: MOOD_CONFIG[entry.mood].color }}>
                                  {MOOD_CONFIG[entry.mood].label}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground/40">--</span>
                            )}
                          </td>
                          <td className="text-center py-3 px-3">
                            {entry?.energy_level ? (
                              <span className="text-xs text-foreground">{entry.energy_level}/5</span>
                            ) : (
                              <span className="text-xs text-muted-foreground/40">--</span>
                            )}
                          </td>
                          <td className="text-center py-3 px-3">
                            {entry?.sleep_quality ? (
                              <span className="text-xs text-foreground">{entry.sleep_quality}/5</span>
                            ) : (
                              <span className="text-xs text-muted-foreground/40">--</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex flex-wrap gap-1">
                              {(entry?.tags ?? []).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-[10px] capitalize">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
