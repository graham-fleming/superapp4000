"use client"

import React, { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { toast } from "sonner"
import {
  Plus,
  Search,
  UtensilsCrossed,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Trash2,
  MoreHorizontal,
  TrendingUp,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Target,
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
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import { createMeal, deleteMeal } from "@/app/(app)/meals/actions"
import { useAuthGate } from "@/components/auth-gate"
import { MockDataBanner, EmptyUserBanner } from "@/components/mock-data-banner"

export type Meal = {
  id: string
  meal_name: string
  meal_type: string
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  notes: string | null
  meal_date: string
  created_at: string
}

const COLORS = {
  primary: "hsl(215, 80%, 48%)",
  success: "hsl(142, 71%, 45%)",
  warning: "hsl(38, 92%, 50%)",
  destructive: "hsl(0, 72%, 51%)",
  muted: "hsl(220, 10%, 46%)",
  chart2: "hsl(160, 60%, 45%)",
  protein: "hsl(215, 80%, 48%)",
  carbs: "hsl(38, 92%, 50%)",
  fat: "hsl(0, 72%, 51%)",
}

const mealTypeConfig: Record<string, { label: string; class: string; icon: React.ElementType }> = {
  breakfast: { label: "Breakfast", class: "bg-warning/15 text-warning border-warning/30", icon: Coffee },
  lunch: { label: "Lunch", class: "bg-primary/15 text-primary border-primary/30", icon: Sun },
  dinner: { label: "Dinner", class: "bg-chart-2/15 text-chart-2 border-chart-2/30", icon: Moon },
  snack: { label: "Snack", class: "bg-destructive/15 text-destructive border-destructive/30", icon: Cookie },
}

const DAILY_GOALS = {
  calories: 2000,
  protein_g: 150,
  carbs_g: 250,
  fat_g: 65,
}

async function fetcher(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

interface MealsContentProps {
  initialMeals: Meal[]
  isGuest?: boolean
  showingMockData?: boolean
}

export function MealsContent({
  initialMeals,
  isGuest = false,
  showingMockData = false,
}: MealsContentProps) {
  const router = useRouter()
  const { requireAuth } = useAuthGate()
  const { data: meals, mutate } = useSWR<Meal[]>(
    isGuest || showingMockData ? null : "/api/meals",
    fetcher,
    { fallbackData: initialMeals },
  )
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("home")

  const allMeals = meals ?? initialMeals

  // -- Filtered meals --
  const filtered = allMeals.filter((m) => {
    const matchSearch = m.meal_name.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === "all" || m.meal_type === filterType
    return matchSearch && matchType
  })

  // -- Stats (today + this week) --
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0]
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const todayMeals = allMeals.filter((m) => m.meal_date === todayStr)
    const weekMeals = allMeals.filter((m) => new Date(m.meal_date) >= sevenDaysAgo)

    const todayCalories = todayMeals.reduce((s, m) => s + (m.calories ?? 0), 0)
    const todayProtein = todayMeals.reduce((s, m) => s + (m.protein_g ?? 0), 0)
    const todayCarbs = todayMeals.reduce((s, m) => s + (m.carbs_g ?? 0), 0)
    const todayFat = todayMeals.reduce((s, m) => s + (m.fat_g ?? 0), 0)

    const weekDays = new Set(weekMeals.map((m) => m.meal_date)).size
    const avgCalories = weekDays > 0
      ? Math.round(weekMeals.reduce((s, m) => s + (m.calories ?? 0), 0) / weekDays)
      : 0

    return {
      todayCalories: Math.round(todayCalories),
      todayProtein: Math.round(todayProtein),
      todayCarbs: Math.round(todayCarbs),
      todayFat: Math.round(todayFat),
      todayMealCount: todayMeals.length,
      weeklyAvgCalories: avgCalories,
      totalMealsThisWeek: weekMeals.length,
    }
  }, [allMeals])

  // -- Chart: Daily calories over last 7 days --
  const dailyCaloriesData = useMemo(() => {
    const now = new Date()
    const days: { day: string; calories: number; meals: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = d.toISOString().split("T")[0]
      const label = d.toLocaleDateString("en-US", { weekday: "short" })
      const dayMeals = allMeals.filter((m) => m.meal_date === dateStr)
      const cal = dayMeals.reduce((s, m) => s + (m.calories ?? 0), 0)
      days.push({ day: label, calories: Math.round(cal), meals: dayMeals.length })
    }
    return days
  }, [allMeals])

  // -- Chart: Macro breakdown over last 7 days --
  const macroChartData = useMemo(() => {
    const now = new Date()
    const days: { day: string; protein: number; carbs: number; fat: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = d.toISOString().split("T")[0]
      const label = d.toLocaleDateString("en-US", { weekday: "short" })
      const dayMeals = allMeals.filter((m) => m.meal_date === dateStr)
      days.push({
        day: label,
        protein: Math.round(dayMeals.reduce((s, m) => s + (m.protein_g ?? 0), 0)),
        carbs: Math.round(dayMeals.reduce((s, m) => s + (m.carbs_g ?? 0), 0)),
        fat: Math.round(dayMeals.reduce((s, m) => s + (m.fat_g ?? 0), 0)),
      })
    }
    return days
  }, [allMeals])

  // -- Goals: weekly day-by-day data --
  const weeklyGoalsData = useMemo(() => {
    const now = new Date()
    const rows: {
      label: string
      dateStr: string
      calories: number
      protein: number
      carbs: number
      fat: number
      mealCount: number
    }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = d.toISOString().split("T")[0]
      const label = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
      const dayMeals = allMeals.filter((m) => m.meal_date === dateStr)
      rows.push({
        label,
        dateStr,
        calories: Math.round(dayMeals.reduce((s, m) => s + (m.calories ?? 0), 0)),
        protein: Math.round(dayMeals.reduce((s, m) => s + (m.protein_g ?? 0), 0)),
        carbs: Math.round(dayMeals.reduce((s, m) => s + (m.carbs_g ?? 0), 0)),
        fat: Math.round(dayMeals.reduce((s, m) => s + (m.fat_g ?? 0), 0)),
        mealCount: dayMeals.length,
      })
    }
    return rows
  }, [allMeals])

  // -- Handlers --
  function handleAddClick() {
    if (!requireAuth("log a meal")) return
    setDialogOpen(true)
  }

  async function handleCreate(formData: FormData) {
    setIsSubmitting(true)
    try {
      const result = await createMeal(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Meal logged")
        setDialogOpen(false)
        mutate()
        router.refresh()
      }
    } catch {
      toast.error("Failed to log meal")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!requireAuth("delete a meal")) return
    try {
      const result = await deleteMeal(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Meal deleted")
        mutate()
        router.refresh()
      }
    } catch {
      toast.error("Failed to delete meal")
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

  // -- Group meals by date --
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Meal[]> = {}
    for (const meal of filtered) {
      if (!groups[meal.meal_date]) groups[meal.meal_date] = []
      groups[meal.meal_date].push(meal)
    }
    const typeOrder = ["breakfast", "lunch", "dinner", "snack"]
    for (const date of Object.keys(groups)) {
      groups[date].sort(
        (a, b) => typeOrder.indexOf(a.meal_type) - typeOrder.indexOf(b.meal_type),
      )
    }
    return Object.entries(groups).sort(
      (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime(),
    )
  }, [filtered])

  // -- Recent meals (for home tab, limit to 5) --
  const recentMeals = allMeals.slice(0, 5)

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
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
            <Flame className="h-5 w-5 text-destructive" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Today</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-foreground">{stats.todayCalories.toLocaleString()}</p>
              <span className="text-xs text-muted-foreground">cal</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Beef className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Protein</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-foreground">{stats.todayProtein}</p>
              <span className="text-xs text-muted-foreground">g today</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warning/10">
            <Wheat className="h-5 w-5 text-warning" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Carbs</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-foreground">{stats.todayCarbs}</p>
              <span className="text-xs text-muted-foreground">g today</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success/10">
            <TrendingUp className="h-5 w-5 text-success" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Weekly Avg</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-foreground">{stats.weeklyAvgCalories.toLocaleString()}</p>
              <span className="text-xs text-muted-foreground">cal/day</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const CaloriesChart = (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Daily Calories</CardTitle>
        <CardDescription>Calorie intake over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{ calories: { label: "Calories", color: "hsl(var(--chart-1))" } }}
          className="h-[260px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyCaloriesData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="day" className="text-xs" tick={{ fill: COLORS.muted }} />
              <YAxis className="text-xs" tick={{ fill: COLORS.muted }} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="calories" fill={COLORS.primary} radius={[4, 4, 0, 0]} name="Calories" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )

  const MacroChart = (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Macro Breakdown</CardTitle>
        <CardDescription>Protein, carbs, and fat over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            protein: { label: "Protein (g)", color: "hsl(var(--chart-1))" },
            carbs: { label: "Carbs (g)", color: "hsl(var(--chart-3))" },
            fat: { label: "Fat (g)", color: "hsl(var(--chart-5))" },
          }}
          className="h-[260px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={macroChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="day" className="text-xs" tick={{ fill: COLORS.muted }} />
              <YAxis className="text-xs" tick={{ fill: COLORS.muted }} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="protein" stroke={COLORS.protein} fill={COLORS.protein} fillOpacity={0.15} strokeWidth={2} name="Protein (g)" />
              <Area type="monotone" dataKey="carbs" stroke={COLORS.carbs} fill={COLORS.carbs} fillOpacity={0.15} strokeWidth={2} name="Carbs (g)" />
              <Area type="monotone" dataKey="fat" stroke={COLORS.fat} fill={COLORS.fat} fillOpacity={0.1} strokeWidth={2} name="Fat (g)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )

  const TodaysGoalsCard = (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">{"Today's Progress"}</CardTitle>
            <CardDescription>
              Daily targets: {DAILY_GOALS.calories.toLocaleString()} cal, {DAILY_GOALS.protein_g}g protein, {DAILY_GOALS.carbs_g}g carbs, {DAILY_GOALS.fat_g}g fat
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium text-foreground"><Flame className="h-4 w-4 text-destructive" />Calories</span>
            <span className="text-muted-foreground">{stats.todayCalories.toLocaleString()} / {DAILY_GOALS.calories.toLocaleString()}</span>
          </div>
          <Progress value={clampPercent(stats.todayCalories, DAILY_GOALS.calories)} className="h-3" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium text-foreground"><Beef className="h-4 w-4 text-primary" />Protein</span>
            <span className="text-muted-foreground">{stats.todayProtein}g / {DAILY_GOALS.protein_g}g</span>
          </div>
          <Progress value={clampPercent(stats.todayProtein, DAILY_GOALS.protein_g)} className="h-3" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium text-foreground"><Wheat className="h-4 w-4 text-warning" />Carbs</span>
            <span className="text-muted-foreground">{stats.todayCarbs}g / {DAILY_GOALS.carbs_g}g</span>
          </div>
          <Progress value={clampPercent(stats.todayCarbs, DAILY_GOALS.carbs_g)} className="h-3" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium text-foreground"><Droplets className="h-4 w-4 text-chart-2" />Fat</span>
            <span className="text-muted-foreground">{stats.todayFat}g / {DAILY_GOALS.fat_g}g</span>
          </div>
          <Progress value={clampPercent(stats.todayFat, DAILY_GOALS.fat_g)} className="h-3" />
        </div>
      </CardContent>
    </Card>
  )

  function MealCard({ meal }: { meal: Meal }) {
    const TypeIcon = mealTypeConfig[meal.meal_type]?.icon ?? UtensilsCrossed
    return (
      <Card className="transition-colors hover:bg-accent/50">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <TypeIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">{meal.meal_name}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {meal.calories != null && (
                  <span className="flex items-center gap-1"><Flame className="h-3 w-3 shrink-0" />{meal.calories} cal</span>
                )}
                {meal.protein_g != null && <span>{meal.protein_g}g P</span>}
                {meal.carbs_g != null && <span>{meal.carbs_g}g C</span>}
                {meal.fat_g != null && <span>{meal.fat_g}g F</span>}
              </div>
              {meal.notes && (
                <p className="mt-0.5 max-w-md truncate text-xs text-muted-foreground">{meal.notes}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`shrink-0 capitalize ${mealTypeConfig[meal.meal_type]?.class ?? ""}`}>
                {mealTypeConfig[meal.meal_type]?.label ?? meal.meal_type}
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
              <DropdownMenuItem
                onClick={() => handleDelete(meal.id)}
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
          Log Meal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Meal</DialogTitle>
        </DialogHeader>
        <form action={handleCreate} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="meal_name">Meal Name *</Label>
            <Input id="meal_name" name="meal_name" required placeholder="e.g. Grilled chicken salad" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="meal_type">Type</Label>
              <Select name="meal_type" defaultValue="lunch">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="meal_date">Date</Label>
              <Input id="meal_date" name="meal_date" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="calories">Calories</Label>
            <Input id="calories" name="calories" type="number" min="0" placeholder="520" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="protein_g">Protein (g)</Label>
              <Input id="protein_g" name="protein_g" type="number" min="0" step="0.1" placeholder="35" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="carbs_g">Carbs (g)</Label>
              <Input id="carbs_g" name="carbs_g" type="number" min="0" step="0.1" placeholder="45" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="fat_g">Fat (g)</Label>
              <Input id="fat_g" name="fat_g" type="number" min="0" step="0.1" placeholder="18" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Ingredients, how it tasted, etc." rows={2} />
          </div>
          <Button type="submit" disabled={isSubmitting} className="mt-2">
            {isSubmitting ? "Logging..." : "Log Meal"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )

  // ============================
  // RENDER
  // ============================
  return (
    <div className="flex flex-col gap-6">
      {isGuest && <MockDataBanner dataType="meals" />}
      {showingMockData && (
        <EmptyUserBanner dataType="meals" actionLabel="Log your first meal" />
      )}

      {/* -- Header -- */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Meal Tracker</h1>
          <p className="text-sm text-muted-foreground">Log meals, track macros, stay on target</p>
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
            {/* Today's Goals Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{"Today's Progress"}</CardTitle>
                <CardDescription>Nutrition targets for today</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {/* Goal progress bars */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Flame className="h-3.5 w-3.5 text-destructive" />
                        Calories
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {stats.todayCalories.toLocaleString()}/{DAILY_GOALS.calories.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-destructive transition-all"
                        style={{ width: `${clampPercent(stats.todayCalories, DAILY_GOALS.calories)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Beef className="h-3.5 w-3.5 text-primary" />
                        Protein
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {stats.todayProtein}g/{DAILY_GOALS.protein_g}g
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${clampPercent(stats.todayProtein, DAILY_GOALS.protein_g)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Wheat className="h-3.5 w-3.5 text-warning" />
                        Carbs
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {stats.todayCarbs}g/{DAILY_GOALS.carbs_g}g
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-warning transition-all"
                        style={{ width: `${clampPercent(stats.todayCarbs, DAILY_GOALS.carbs_g)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Droplets className="h-3.5 w-3.5 text-chart-2" />
                        Fat
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {stats.todayFat}g/{DAILY_GOALS.fat_g}g
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-chart-2 transition-all"
                        style={{ width: `${clampPercent(stats.todayFat, DAILY_GOALS.fat_g)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Meal count today */}
                <div className="mt-1 rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">Meals today</p>
                    <p className="text-2xl font-bold text-foreground">{stats.todayMealCount}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {stats.todayMealCount === 0 && "No meals logged yet"}
                    {stats.todayMealCount === 1 && "1 meal logged"}
                    {stats.todayMealCount > 1 && `${stats.todayMealCount} meals logged`}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Weekly Activity</CardTitle>
                <CardDescription>Meal distribution over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {(() => {
                  const now = new Date()
                  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                  const thisWeek = allMeals.filter((m) => new Date(m.meal_date) >= sevenDaysAgo)
                  const breakfastCount = thisWeek.filter((m) => m.meal_type === "breakfast").length
                  const lunchCount = thisWeek.filter((m) => m.meal_type === "lunch").length
                  const dinnerCount = thisWeek.filter((m) => m.meal_type === "dinner").length
                  const snackCount = thisWeek.filter((m) => m.meal_type === "snack").length
                  const total = thisWeek.length
                  
                  return (
                    <>
                      {/* Meal type tiles */}
                      <div className="grid grid-cols-4 gap-2">
                        <div className="flex flex-col items-center gap-1 rounded-lg border-t-2 border-t-warning bg-muted/30 px-2 py-3">
                          <Coffee className="h-3.5 w-3.5 text-warning" />
                          <p className="text-2xl font-bold text-foreground">{breakfastCount}</p>
                          <p className="text-[11px] text-muted-foreground">Breakfast</p>
                        </div>
                        <div className="flex flex-col items-center gap-1 rounded-lg border-t-2 border-t-primary bg-muted/30 px-2 py-3">
                          <Sun className="h-3.5 w-3.5 text-primary" />
                          <p className="text-2xl font-bold text-foreground">{lunchCount}</p>
                          <p className="text-[11px] text-muted-foreground">Lunch</p>
                        </div>
                        <div className="flex flex-col items-center gap-1 rounded-lg border-t-2 border-t-chart-2 bg-muted/30 px-2 py-3">
                          <Moon className="h-3.5 w-3.5 text-chart-2" />
                          <p className="text-2xl font-bold text-foreground">{dinnerCount}</p>
                          <p className="text-[11px] text-muted-foreground">Dinner</p>
                        </div>
                        <div className="flex flex-col items-center gap-1 rounded-lg border-t-2 border-t-destructive bg-muted/30 px-2 py-3">
                          <Cookie className="h-3.5 w-3.5 text-destructive" />
                          <p className="text-2xl font-bold text-foreground">{snackCount}</p>
                          <p className="text-[11px] text-muted-foreground">Snack</p>
                        </div>
                      </div>

                      {/* Distribution bar */}
                      {total > 0 && (
                        <div className="flex items-center gap-0.5">
                          {[
                            { label: "Breakfast", count: breakfastCount, color: "hsl(var(--warning))" },
                            { label: "Lunch", count: lunchCount, color: "hsl(var(--primary))" },
                            { label: "Dinner", count: dinnerCount, color: "hsl(var(--chart-2))" },
                            { label: "Snack", count: snackCount, color: "hsl(var(--destructive))" },
                          ].map((cat, i, arr) => {
                            const pct = Math.max((cat.count / total) * 100, 8)
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
                      )}

                      {/* Weekly average highlight */}
                      <div className="flex items-center gap-2 rounded-lg border border-success/20 bg-success/5 p-3">
                        <TrendingUp className="h-4 w-4 shrink-0 text-success" />
                        <div>
                          <p className="text-xs text-muted-foreground">Weekly average</p>
                          <p className="text-lg font-bold text-foreground">
                            {stats.weeklyAvgCalories.toLocaleString()} cal/day
                          </p>
                        </div>
                      </div>
                    </>
                  )
                })()}
              </CardContent>
            </Card>
          </div>

          {/* Recent meals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">Recent Meals</CardTitle>
                <CardDescription>{allMeals.length} total meals logged</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab("log")}>
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentMeals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <UtensilsCrossed className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium text-foreground">No meals logged yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Log your first meal to get started</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {recentMeals.map((meal) => {
                    const TypeIcon = mealTypeConfig[meal.meal_type]?.icon ?? UtensilsCrossed
                    return (
                      <div
                        key={meal.id}
                        className="flex items-center gap-3 rounded-lg border border-border p-3"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <TypeIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground">{meal.meal_name}</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                            {meal.calories != null && (
                              <span className="flex items-center gap-1">
                                <Flame className="h-3 w-3 shrink-0" />
                                {meal.calories} cal
                              </span>
                            )}
                            {meal.protein_g != null && <span>{meal.protein_g}g P</span>}
                            {meal.carbs_g != null && <span>{meal.carbs_g}g C</span>}
                            {meal.fat_g != null && <span>{meal.fat_g}g F</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`shrink-0 capitalize ${mealTypeConfig[meal.meal_type]?.class ?? ""}`}>
                            {mealTypeConfig[meal.meal_type]?.label ?? meal.meal_type}
                          </Badge>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {formatDate(meal.meal_date)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
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
                <Input placeholder="Search meals..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Meal list grouped by date */}
          {groupedByDate.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <UtensilsCrossed className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium text-foreground">No meals found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {search || filterType !== "all" ? "Try adjusting your filters" : "Log your first meal to get started"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-6">
              {groupedByDate.map(([date, dateMeals]) => {
                const dayCalories = dateMeals.reduce((s, m) => s + (m.calories ?? 0), 0)
                return (
                  <div key={date} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-medium text-muted-foreground">{formatDate(date)}</h2>
                      <span className="text-xs text-muted-foreground">{Math.round(dayCalories).toLocaleString()} cal</span>
                    </div>
                    <div className="grid gap-3">
                      {dateMeals.map((meal) => (
                        <MealCard key={meal.id} meal={meal} />
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
            {CaloriesChart}
            {MacroChart}
          </div>
        </TabsContent>

        {/* ===================== GOALS TAB ===================== */}
        <TabsContent value="goals" className="flex flex-col gap-6 mt-0">
          {TodaysGoalsCard}

          {/* Weekly Summary Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Weekly Summary</CardTitle>
              <CardDescription>How each day stacked up against your goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {weeklyGoalsData.map((day) => {
                  const calPercent = clampPercent(day.calories, DAILY_GOALS.calories)
                  const isToday = day.dateStr === new Date().toISOString().split("T")[0]
                  return (
                    <div
                      key={day.dateStr}
                      className={`flex items-center gap-4 rounded-lg border p-3 ${isToday ? "border-primary/30 bg-primary/5" : "border-border"}`}
                    >
                      <div className="w-28 shrink-0">
                        <p className={`text-sm font-medium ${isToday ? "text-primary" : "text-foreground"}`}>
                          {isToday ? "Today" : day.label}
                        </p>
                        <p className="text-xs text-muted-foreground">{day.mealCount} meal{day.mealCount !== 1 ? "s" : ""}</p>
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{day.calories.toLocaleString()} cal</span>
                          <span>{calPercent}%</span>
                        </div>
                        <Progress value={calPercent} className="h-2" />
                      </div>
                      <div className="hidden shrink-0 items-center gap-3 text-xs text-muted-foreground sm:flex">
                        <span>{day.protein}g P</span>
                        <span>{day.carbs}g C</span>
                        <span>{day.fat}g F</span>
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
