"use client"

import React, { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { toast } from "sonner"
import {
  Plus,
  Search,
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Trash2,
  MoreHorizontal,
  ArrowRight,
  Target,
  ShoppingCart,
  Home,
  Car,
  Film,
  HeartPulse,
  Zap,
  CreditCard,
  CircleDollarSign,
  HelpCircle,
  UtensilsCrossed,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
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
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { createTransaction, deleteTransaction, upsertBudget, deleteBudget } from "@/app/(app)/finance/actions"
import { useAuthGate } from "@/components/auth-gate"
import { MockDataBanner, EmptyUserBanner } from "@/components/mock-data-banner"

export type Transaction = {
  id: string
  description: string
  amount: number
  type: string
  category: string
  transaction_date: string
  notes: string | null
  created_at: string
}

export type Budget = {
  id: string
  category: string | null
  monthly_limit: number
  budget_month: string
  created_at: string
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; badgeClass: string }> = {
  food: { label: "Food", icon: UtensilsCrossed, color: "hsl(38, 92%, 50%)", badgeClass: "bg-warning/15 text-warning border-warning/30" },
  transport: { label: "Transport", icon: Car, color: "hsl(215, 80%, 48%)", badgeClass: "bg-primary/15 text-primary border-primary/30" },
  housing: { label: "Housing", icon: Home, color: "hsl(160, 60%, 45%)", badgeClass: "bg-chart-2/15 text-chart-2 border-chart-2/30" },
  entertainment: { label: "Entertainment", icon: Film, color: "hsl(280, 60%, 55%)", badgeClass: "bg-[hsl(280,60%,55%)]/15 text-[hsl(280,60%,55%)] border-[hsl(280,60%,55%)]/30" },
  shopping: { label: "Shopping", icon: ShoppingCart, color: "hsl(330, 70%, 50%)", badgeClass: "bg-[hsl(330,70%,50%)]/15 text-[hsl(330,70%,50%)] border-[hsl(330,70%,50%)]/30" },
  health: { label: "Health", icon: HeartPulse, color: "hsl(0, 72%, 51%)", badgeClass: "bg-destructive/15 text-destructive border-destructive/30" },
  utilities: { label: "Utilities", icon: Zap, color: "hsl(45, 85%, 50%)", badgeClass: "bg-warning/15 text-warning border-warning/30" },
  subscriptions: { label: "Subscriptions", icon: CreditCard, color: "hsl(200, 70%, 50%)", badgeClass: "bg-primary/15 text-primary border-primary/30" },
  income: { label: "Income", icon: CircleDollarSign, color: "hsl(142, 71%, 45%)", badgeClass: "bg-success/15 text-success border-success/30" },
  other: { label: "Other", icon: HelpCircle, color: "hsl(220, 10%, 46%)", badgeClass: "bg-muted text-muted-foreground border-border" },
}

const PIE_COLORS = [
  "hsl(215, 80%, 48%)",
  "hsl(38, 92%, 50%)",
  "hsl(160, 60%, 45%)",
  "hsl(280, 60%, 55%)",
  "hsl(0, 72%, 51%)",
  "hsl(330, 70%, 50%)",
  "hsl(45, 85%, 50%)",
  "hsl(200, 70%, 50%)",
  "hsl(142, 71%, 45%)",
  "hsl(220, 10%, 46%)",
]

const COLORS = {
  income: "hsl(142, 71%, 45%)",
  expense: "hsl(0, 72%, 51%)",
  muted: "hsl(220, 10%, 46%)",
  primary: "hsl(215, 80%, 48%)",
}

async function fetcher(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

interface FinanceContentProps {
  initialTransactions: Transaction[]
  initialBudgets: Budget[]
  isGuest?: boolean
  showingMockData?: boolean
}

export function FinanceContent({
  initialTransactions,
  initialBudgets,
  isGuest = false,
  showingMockData = false,
}: FinanceContentProps) {
  const router = useRouter()
  const { requireAuth } = useAuthGate()

  const { data: transactions, mutate: mutateTransactions } = useSWR<Transaction[]>(
    isGuest || showingMockData ? null : "/api/transactions",
    fetcher,
    { fallbackData: initialTransactions },
  )

  const { data: budgets, mutate: mutateBudgets } = useSWR<Budget[]>(
    isGuest || showingMockData ? null : "/api/budgets",
    fetcher,
    { fallbackData: initialBudgets },
  )

  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [txDialogOpen, setTxDialogOpen] = useState(false)
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("home")

  const allTransactions = transactions ?? initialTransactions
  const allBudgets = budgets ?? initialBudgets

  // Current month string for budget matching
  const currentMonthStr = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
  const currentMonthBudgets = allBudgets.filter((b) => b.budget_month === currentMonthStr)

  // Filtered transactions
  const filtered = allTransactions.filter((t) => {
    const matchSearch = t.description.toLowerCase().includes(search.toLowerCase())
    const matchCategory = filterCategory === "all" || t.category === filterCategory
    const matchType = filterType === "all" || t.type === filterType
    return matchSearch && matchCategory && matchType
  })

  // Stats
  const stats = useMemo(() => {
    const now = new Date()
    const thisMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    const monthTransactions = allTransactions.filter((t) => t.transaction_date.startsWith(thisMonthStr))

    const monthIncome = monthTransactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
    const monthExpenses = monthTransactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)
    const netSavings = monthIncome - monthExpenses

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const weekExpenses = allTransactions
      .filter((t) => t.type === "expense" && new Date(t.transaction_date) >= sevenDaysAgo)
      .reduce((s, t) => s + t.amount, 0)

    return {
      monthIncome: Math.round(monthIncome * 100) / 100,
      monthExpenses: Math.round(monthExpenses * 100) / 100,
      netSavings: Math.round(netSavings * 100) / 100,
      weekExpenses: Math.round(weekExpenses * 100) / 100,
      transactionCount: allTransactions.length,
    }
  }, [allTransactions])

  // Spending by category (this month, expenses only)
  const categoryBreakdown = useMemo(() => {
    const now = new Date()
    const thisMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    const monthExpenses = allTransactions.filter(
      (t) => t.type === "expense" && t.transaction_date.startsWith(thisMonthStr),
    )
    const map: Record<string, number> = {}
    for (const t of monthExpenses) {
      map[t.category] = (map[t.category] ?? 0) + t.amount
    }
    return Object.entries(map)
      .map(([category, amount]) => ({
        category,
        label: CATEGORY_CONFIG[category]?.label ?? category,
        amount: Math.round(amount * 100) / 100,
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [allTransactions])

  // Daily spending trend (last 7 days)
  const dailySpendingData = useMemo(() => {
    const now = new Date()
    const days: { day: string; expenses: number; income: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = d.toISOString().split("T")[0]
      const label = d.toLocaleDateString("en-US", { weekday: "short" })
      const dayTx = allTransactions.filter((t) => t.transaction_date === dateStr)
      const expenses = dayTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)
      const income = dayTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
      days.push({ day: label, expenses: Math.round(expenses * 100) / 100, income: Math.round(income * 100) / 100 })
    }
    return days
  }, [allTransactions])

  // Income vs Expenses (last 7 days)
  const incomeVsExpenseData = useMemo(() => {
    const now = new Date()
    const days: { day: string; income: number; expenses: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = d.toISOString().split("T")[0]
      const label = d.toLocaleDateString("en-US", { weekday: "short" })
      const dayTx = allTransactions.filter((t) => t.transaction_date === dateStr)
      days.push({
        day: label,
        income: Math.round(dayTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0) * 100) / 100,
        expenses: Math.round(dayTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0) * 100) / 100,
      })
    }
    return days
  }, [allTransactions])

  // Budget progress for current month
  const budgetProgress = useMemo(() => {
    const now = new Date()
    const thisMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    const monthExpenses = allTransactions.filter(
      (t) => t.type === "expense" && t.transaction_date.startsWith(thisMonthStr),
    )
    const totalExpenses = monthExpenses.reduce((s, t) => s + t.amount, 0)

    return currentMonthBudgets.map((b) => {
      const spent = b.category === null
        ? totalExpenses
        : monthExpenses.filter((t) => t.category === b.category).reduce((s, t) => s + t.amount, 0)
      return {
        ...b,
        spent: Math.round(spent * 100) / 100,
        percent: b.monthly_limit > 0 ? Math.min(Math.round((spent / b.monthly_limit) * 100), 100) : 0,
      }
    })
  }, [allTransactions, currentMonthBudgets])

  // Handlers
  function handleAddTxClick() {
    if (!requireAuth("add a transaction")) return
    setTxDialogOpen(true)
  }

  function handleAddBudgetClick() {
    if (!requireAuth("set a budget")) return
    setBudgetDialogOpen(true)
  }

  async function handleCreateTx(formData: FormData) {
    setIsSubmitting(true)
    try {
      const result = await createTransaction(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Transaction added")
        setTxDialogOpen(false)
        mutateTransactions()
        router.refresh()
      }
    } catch {
      toast.error("Failed to add transaction")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteTx(id: string) {
    if (!requireAuth("delete a transaction")) return
    try {
      const result = await deleteTransaction(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Transaction deleted")
        mutateTransactions()
        router.refresh()
      }
    } catch {
      toast.error("Failed to delete transaction")
    }
  }

  async function handleCreateBudget(formData: FormData) {
    setIsSubmitting(true)
    try {
      const result = await upsertBudget(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Budget saved")
        setBudgetDialogOpen(false)
        mutateBudgets()
        router.refresh()
      }
    } catch {
      toast.error("Failed to save budget")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteBudget(id: string) {
    if (!requireAuth("delete a budget")) return
    try {
      const result = await deleteBudget(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Budget removed")
        mutateBudgets()
        router.refresh()
      }
    } catch {
      toast.error("Failed to remove budget")
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  function clampPercent(value: number, goal: number) {
    return goal > 0 ? Math.min(Math.round((value / goal) * 100), 100) : 0
  }

  // Group transactions by date
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Transaction[]> = {}
    for (const tx of filtered) {
      if (!groups[tx.transaction_date]) groups[tx.transaction_date] = []
      groups[tx.transaction_date].push(tx)
    }
    return Object.entries(groups).sort(
      (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime(),
    )
  }, [filtered])

  const recentTransactions = allTransactions.slice(0, 5)

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
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success/10">
            <TrendingUp className="h-5 w-5 text-success" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Income</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(stats.monthIncome)}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
            <TrendingDown className="h-5 w-5 text-destructive" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Expenses</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(stats.monthExpenses)}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <PiggyBank className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Net Savings</p>
            <p className={`text-xl font-bold ${stats.netSavings >= 0 ? "text-success" : "text-destructive"}`}>
              {formatCurrency(stats.netSavings)}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warning/10">
            <DollarSign className="h-5 w-5 text-warning" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Week Spend</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(stats.weekExpenses)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const SpendingTrendChart = (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Spending Trend</CardTitle>
        <CardDescription>Daily spending over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{ expenses: { label: "Expenses", color: "hsl(var(--chart-5))" } }}
          className="h-[260px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailySpendingData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="day" className="text-xs" tick={{ fill: COLORS.muted }} />
              <YAxis className="text-xs" tick={{ fill: COLORS.muted }} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="expenses" stroke={COLORS.expense} fill={COLORS.expense} fillOpacity={0.15} strokeWidth={2} name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )

  const IncomeVsExpenseChart = (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Income vs Expenses</CardTitle>
        <CardDescription>Daily comparison over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            income: { label: "Income", color: "hsl(var(--chart-2))" },
            expenses: { label: "Expenses", color: "hsl(var(--chart-5))" },
          }}
          className="h-[260px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={incomeVsExpenseData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="day" className="text-xs" tick={{ fill: COLORS.muted }} />
              <YAxis className="text-xs" tick={{ fill: COLORS.muted }} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="income" fill={COLORS.income} radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expenses" fill={COLORS.expense} radius={[4, 4, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )

  const CategoryPieChart = (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Spending by Category</CardTitle>
        <CardDescription>Where your money goes this month</CardDescription>
      </CardHeader>
      <CardContent>
        {categoryBreakdown.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Wallet className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No expenses this month</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 lg:flex-row">
            <ChartContainer
              config={Object.fromEntries(
                categoryBreakdown.map((c, i) => [c.category, { label: c.label, color: PIE_COLORS[i % PIE_COLORS.length] }])
              )}
              className="h-[220px] w-full max-w-[220px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={categoryBreakdown}
                    dataKey="amount"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {categoryBreakdown.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex flex-1 flex-col gap-2">
              {categoryBreakdown.map((c, i) => {
                const CatIcon = CATEGORY_CONFIG[c.category]?.icon ?? HelpCircle
                return (
                  <div key={c.category} className="flex items-center gap-3 text-sm">
                    <div className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <CatIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 text-foreground">{c.label}</span>
                    <span className="font-medium text-foreground">{formatCurrency(c.amount)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const BudgetOverviewCard = (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Budget Progress</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })} budgets
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {budgetProgress.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
            <PiggyBank className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No budgets set for this month</p>
            <p className="text-xs">Set budgets in the Budgets tab to track your spending</p>
          </div>
        ) : (
          budgetProgress.map((bp) => {
            const CatIcon = bp.category ? (CATEGORY_CONFIG[bp.category]?.icon ?? HelpCircle) : Wallet
            const label = bp.category ? (CATEGORY_CONFIG[bp.category]?.label ?? bp.category) : "Overall"
            const isOver = bp.spent > bp.monthly_limit
            return (
              <div key={bp.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    <CatIcon className="h-4 w-4 text-muted-foreground" />
                    {label}
                  </span>
                  <span className={isOver ? "text-destructive font-medium" : "text-muted-foreground"}>
                    {formatCurrency(bp.spent)} / {formatCurrency(bp.monthly_limit)}
                  </span>
                </div>
                <Progress value={bp.percent} className={`h-3 ${isOver ? "[&>div]:bg-destructive" : ""}`} />
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )

  function TransactionCard({ tx }: { tx: Transaction }) {
    const CatIcon = CATEGORY_CONFIG[tx.category]?.icon ?? HelpCircle
    const isIncome = tx.type === "income"
    return (
      <Card className="transition-colors hover:bg-accent/50">
        <CardContent className="flex items-center gap-4 p-4">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isIncome ? "bg-success/10" : "bg-muted"}`}>
            <CatIcon className={`h-5 w-5 ${isIncome ? "text-success" : "text-muted-foreground"}`} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">{tx.description}</p>
              {tx.notes && (
                <p className="mt-0.5 max-w-md truncate text-xs text-muted-foreground">{tx.notes}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`shrink-0 capitalize ${CATEGORY_CONFIG[tx.category]?.badgeClass ?? ""}`}>
                {CATEGORY_CONFIG[tx.category]?.label ?? tx.category}
              </Badge>
              <span className={`text-sm font-semibold whitespace-nowrap ${isIncome ? "text-success" : "text-foreground"}`}>
                {isIncome ? "+" : "-"}{formatCurrency(tx.amount)}
              </span>
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
                onClick={() => handleDeleteTx(tx.id)}
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

  const TxDialog = (
    <Dialog open={txDialogOpen} onOpenChange={setTxDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={handleAddTxClick} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <form action={handleCreateTx} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description *</Label>
            <Input id="description" name="description" required placeholder="e.g. Grocery shopping" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input id="amount" name="amount" type="number" min="0" step="0.01" required placeholder="42.50" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="type">Type</Label>
              <Select name="type" defaultValue="expense">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue="other">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="transaction_date">Date</Label>
              <Input id="transaction_date" name="transaction_date" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Optional details..." rows={2} />
          </div>
          <Button type="submit" disabled={isSubmitting} className="mt-2">
            {isSubmitting ? "Adding..." : "Add Transaction"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )

  const BudgetDialog = (
    <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={handleAddBudgetClick} className="shrink-0 bg-transparent">
          <Target className="mr-2 h-4 w-4" />
          Set Budget
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Monthly Budget</DialogTitle>
        </DialogHeader>
        <form action={handleCreateBudget} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="budget_category">Category</Label>
            <Select name="category" defaultValue="overall">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="overall">Overall (Total Budget)</SelectItem>
                {Object.entries(CATEGORY_CONFIG)
                  .filter(([key]) => key !== "income")
                  .map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="monthly_limit">Monthly Limit *</Label>
            <Input id="monthly_limit" name="monthly_limit" type="number" min="0" step="0.01" required placeholder="500.00" />
          </div>
          <input type="hidden" name="budget_month" value={currentMonthStr} />
          <Button type="submit" disabled={isSubmitting} className="mt-2">
            {isSubmitting ? "Saving..." : "Save Budget"}
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
      {isGuest && <MockDataBanner dataType="finance" />}
      {showingMockData && (
        <EmptyUserBanner dataType="finance" actionLabel="Add your first transaction" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Finance Tracker</h1>
          <p className="text-sm text-muted-foreground">Track spending, manage budgets, reach your goals</p>
        </div>
        <div className="flex items-center gap-2">
          {TxDialog}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-6">
        <TabsList className="w-fit">
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
        </TabsList>

        {/* ===================== HOME TAB ===================== */}
        <TabsContent value="home" className="flex flex-col gap-6 mt-0">
          {/* Stat cards row */}
          {StatCards}

          {/* Charts row - 2 cards side by side */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Category Spending Breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Spending by Category</CardTitle>
                <CardDescription>Where your money goes this month</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {categoryBreakdown.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                    <Wallet className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No expenses this month</p>
                  </div>
                ) : (
                  <>
                    {/* Top categories */}
                    <div className="flex flex-col gap-3">
                      {categoryBreakdown.slice(0, 4).map((cat) => {
                        const CatIcon = CATEGORY_CONFIG[cat.category]?.icon ?? HelpCircle
                        const catColor = CATEGORY_CONFIG[cat.category]?.color ?? COLORS.muted
                        const totalExpenses = categoryBreakdown.reduce((s, c) => s + c.amount, 0)
                        const pct = totalExpenses > 0 ? Math.round((cat.amount / totalExpenses) * 100) : 0
                        
                        return (
                          <div key={cat.category} className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <CatIcon className="h-3.5 w-3.5" style={{ color: catColor }} />
                                {cat.label}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatCurrency(cat.amount)} ({pct}%)
                              </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: catColor,
                                }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Total monthly expenses highlight */}
                    <div className="mt-1 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 shrink-0 text-destructive" />
                          <div>
                            <p className="text-xs text-muted-foreground">Total spent</p>
                            <p className="text-lg font-bold text-foreground">
                              {formatCurrency(stats.monthExpenses)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Categories</p>
                          <p className="text-lg font-bold text-foreground">
                            {categoryBreakdown.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Budget Progress */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Budget Progress</CardTitle>
                <CardDescription>Tracking against your limits</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {budgetProgress.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                    <Target className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No budgets set</p>
                    <p className="text-xs mt-1">Set a budget to track spending</p>
                  </div>
                ) : (
                  <>
                    {/* Budget progress bars */}
                    <div className="flex flex-col gap-3">
                      {budgetProgress.map((bp) => {
                        const isOver = bp.spent > bp.monthly_limit
                        const CatIcon = bp.category
                          ? CATEGORY_CONFIG[bp.category]?.icon ?? Target
                          : Target
                        const catColor = bp.category
                          ? CATEGORY_CONFIG[bp.category]?.color
                          : COLORS.primary
                        
                        return (
                          <div key={bp.id} className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <CatIcon className="h-3.5 w-3.5" style={{ color: catColor }} />
                                {bp.category
                                  ? CATEGORY_CONFIG[bp.category]?.label ?? bp.category
                                  : "Overall"}
                              </div>
                              <span className={`text-xs font-medium ${isOver ? "text-destructive" : "text-muted-foreground"}`}>
                                {formatCurrency(bp.spent)} / {formatCurrency(bp.monthly_limit)}
                              </span>
                            </div>
                            <Progress
                              value={bp.percent}
                              className={`h-2 ${isOver ? "[&>div]:bg-destructive" : ""}`}
                            />
                          </div>
                        )
                      })}
                    </div>

                    {/* Budget summary */}
                    <div className="mt-1 grid grid-cols-2 gap-2">
                      <div className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground">Budgets set</p>
                        <p className="text-xl font-bold text-foreground">
                          {budgetProgress.length}
                        </p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground">Over budget</p>
                        <p className="text-xl font-bold text-destructive">
                          {budgetProgress.filter((bp) => bp.spent > bp.monthly_limit).length}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent transactions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">Recent Transactions</CardTitle>
                <CardDescription>{allTransactions.length} total transactions</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab("transactions")}>
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Wallet className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium text-foreground">No transactions yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Add your first transaction to get started</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {recentTransactions.map((tx) => {
                    const CatIcon = CATEGORY_CONFIG[tx.category]?.icon ?? HelpCircle
                    const isIncome = tx.type === "income"
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center gap-3 rounded-lg border border-border p-3"
                      >
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isIncome ? "bg-success/10" : "bg-muted"}`}>
                          <CatIcon className={`h-5 w-5 ${isIncome ? "text-success" : "text-muted-foreground"}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground">{tx.description}</p>
                          {tx.notes && (
                            <p className="mt-0.5 max-w-md truncate text-xs text-muted-foreground">{tx.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`shrink-0 capitalize ${CATEGORY_CONFIG[tx.category]?.badgeClass ?? ""}`}>
                            {CATEGORY_CONFIG[tx.category]?.label ?? tx.category}
                          </Badge>
                          <span className={`shrink-0 text-sm font-semibold whitespace-nowrap ${isIncome ? "text-success" : "text-foreground"}`}>
                            {isIncome ? "+" : "-"}{formatCurrency(tx.amount)}
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {formatDate(tx.transaction_date)}
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

        {/* ===================== TRANSACTIONS TAB ===================== */}
        <TabsContent value="transactions" className="flex flex-col gap-6 mt-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search transactions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[140px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="expense">Expenses</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {groupedByDate.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Wallet className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium text-foreground">No transactions found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {search || filterCategory !== "all" || filterType !== "all" ? "Try adjusting your filters" : "Add your first transaction to get started"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-6">
              {groupedByDate.map(([date, dateTxs]) => {
                const dayExpenses = dateTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)
                const dayIncome = dateTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
                return (
                  <div key={date} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-medium text-muted-foreground">{formatDate(date)}</h2>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {dayIncome > 0 && (
                          <span className="flex items-center gap-1 text-success">
                            <ArrowUpRight className="h-3 w-3" />
                            {formatCurrency(dayIncome)}
                          </span>
                        )}
                        {dayExpenses > 0 && (
                          <span className="flex items-center gap-1 text-destructive">
                            <ArrowDownRight className="h-3 w-3" />
                            {formatCurrency(dayExpenses)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="grid gap-3">
                      {dateTxs.map((tx) => (
                        <TransactionCard key={tx.id} tx={tx} />
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
            {CategoryPieChart}
            {SpendingTrendChart}
          </div>
          {IncomeVsExpenseChart}
        </TabsContent>

        {/* ===================== BUDGETS TAB ===================== */}
        <TabsContent value="budgets" className="flex flex-col gap-6 mt-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })} Budgets
              </h2>
              <p className="text-xs text-muted-foreground">Set spending limits and track your progress</p>
            </div>
            {BudgetDialog}
          </div>

          {BudgetOverviewCard}

          {/* Individual budget cards */}
          {currentMonthBudgets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Budget Details</CardTitle>
                <CardDescription>Manage your monthly budget limits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {budgetProgress.map((bp) => {
                    const CatIcon = bp.category ? (CATEGORY_CONFIG[bp.category]?.icon ?? HelpCircle) : Wallet
                    const label = bp.category ? (CATEGORY_CONFIG[bp.category]?.label ?? bp.category) : "Overall"
                    const isOver = bp.spent > bp.monthly_limit
                    const remaining = bp.monthly_limit - bp.spent
                    return (
                      <div
                        key={bp.id}
                        className={`flex items-center gap-4 rounded-lg border p-4 ${isOver ? "border-destructive/30 bg-destructive/5" : "border-border"}`}
                      >
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isOver ? "bg-destructive/10" : "bg-muted"}`}>
                          <CatIcon className={`h-5 w-5 ${isOver ? "text-destructive" : "text-muted-foreground"}`} />
                        </div>
                        <div className="flex flex-1 flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-foreground">{label}</p>
                            <span className={`text-sm font-semibold ${isOver ? "text-destructive" : "text-foreground"}`}>
                              {formatCurrency(bp.spent)} / {formatCurrency(bp.monthly_limit)}
                            </span>
                          </div>
                          <Progress value={bp.percent} className={`h-2 ${isOver ? "[&>div]:bg-destructive" : ""}`} />
                          <p className={`text-xs ${isOver ? "text-destructive" : "text-muted-foreground"}`}>
                            {isOver
                              ? `Over budget by ${formatCurrency(Math.abs(remaining))}`
                              : `${formatCurrency(remaining)} remaining`}
                          </p>
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
                              onClick={() => handleDeleteBudget(bp.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove Budget
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
