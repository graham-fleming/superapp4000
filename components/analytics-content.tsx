"use client"

import { useMemo } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Pie,
  PieChart,
  Legend,
  RadialBarChart,
  RadialBar,
} from "recharts"
import {
  Users,
  CheckSquare,
  TrendingUp,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Building2,
  CalendarDays,
  Zap,
  AlertTriangle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { MockDataBanner } from "@/components/mock-data-banner"

interface Contact {
  id: string
  first_name: string
  last_name: string | null
  email: string | null
  company: string | null
  status: string
  created_at: string
}

interface Task {
  id: string
  title: string
  status: string
  priority: string
  due_date: string | null
  contact_id: string | null
  created_at: string
}

interface AnalyticsContentProps {
  contacts: Contact[]
  tasks: Task[]
  isGuest?: boolean
  showingMockData?: boolean
  hideHeader?: boolean
}

const COLORS = {
  primary: "hsl(215, 80%, 48%)",
  success: "hsl(142, 71%, 45%)",
  warning: "hsl(38, 92%, 50%)",
  destructive: "hsl(0, 72%, 51%)",
  muted: "hsl(220, 10%, 46%)",
  chart2: "hsl(160, 60%, 45%)",
  chart3: "hsl(30, 80%, 55%)",
  chart4: "hsl(280, 65%, 60%)",
  chart5: "hsl(340, 75%, 55%)",
}

export function AnalyticsContent({
  contacts,
  tasks,
  isGuest = false,
  hideHeader = false,
}: AnalyticsContentProps) {
  // --- Core stats ---
  const totalContacts = contacts.length
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === "done").length
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length
  const todoTasks = tasks.filter((t) => t.status === "todo").length
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const activeContacts = contacts.filter((c) => c.status === "active").length
  const leadContacts = contacts.filter((c) => c.status === "lead").length

  // --- Overdue tasks ---
  const overdueTasks = useMemo(() => {
    const now = new Date()
    return tasks.filter(
      (t) => t.due_date && new Date(t.due_date) < now && t.status !== "done"
    )
  }, [tasks])

  // --- Avg tasks per contact ---
  const linkedTasks = tasks.filter((t) => t.contact_id).length
  const avgTasksPerContact =
    totalContacts > 0 ? (linkedTasks / totalContacts).toFixed(1) : "0"

  // --- Contact Growth (last 6 months) ---
  const contactGrowthData = useMemo(() => {
    const now = new Date()
    const months: { month: string; contacts: number; cumulative: number }[] = []
    let cumulative = 0
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = d.toLocaleString("default", { month: "short" })
      const count = contacts.filter((c) => {
        const created = new Date(c.created_at)
        return (
          created.getMonth() === d.getMonth() &&
          created.getFullYear() === d.getFullYear()
        )
      }).length
      cumulative += count
      months.push({ month: label, contacts: count, cumulative })
    }
    return months
  }, [contacts])

  // --- Task Flow (created vs completed per month) ---
  const tasksPerMonthData = useMemo(() => {
    const now = new Date()
    const months: { month: string; created: number; completed: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = d.toLocaleString("default", { month: "short" })
      const created = tasks.filter((t) => {
        const cr = new Date(t.created_at)
        return (
          cr.getMonth() === d.getMonth() &&
          cr.getFullYear() === d.getFullYear()
        )
      }).length
      const completed = tasks.filter((t) => {
        if (t.status !== "done") return false
        const cr = new Date(t.created_at)
        return (
          cr.getMonth() === d.getMonth() &&
          cr.getFullYear() === d.getFullYear()
        )
      }).length
      months.push({ month: label, created, completed })
    }
    return months
  }, [tasks])

  // --- Completion rate trend (last 6 months) ---
  const completionTrendData = useMemo(() => {
    const now = new Date()
    const months: { month: string; rate: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = d.toLocaleString("default", { month: "short" })
      const monthTasks = tasks.filter((t) => {
        const cr = new Date(t.created_at)
        return (
          cr.getMonth() === d.getMonth() &&
          cr.getFullYear() === d.getFullYear()
        )
      })
      const monthCompleted = monthTasks.filter(
        (t) => t.status === "done"
      ).length
      const rate =
        monthTasks.length > 0
          ? Math.round((monthCompleted / monthTasks.length) * 100)
          : 0
      months.push({ month: label, rate })
    }
    return months
  }, [tasks])

  // --- Task Status Breakdown ---
  const taskStatusData = useMemo(() => {
    const statusMap: Record<string, number> = {
      todo: 0,
      in_progress: 0,
      done: 0,
    }
    for (const t of tasks) {
      if (statusMap[t.status] !== undefined) statusMap[t.status]++
    }
    return [
      { name: "To Do", value: statusMap.todo, fill: COLORS.muted },
      {
        name: "In Progress",
        value: statusMap.in_progress,
        fill: COLORS.primary,
      },
      { name: "Done", value: statusMap.done, fill: COLORS.success },
    ]
  }, [tasks])

  // --- Task Priority Distribution ---
  const taskPriorityData = useMemo(() => {
    const priorityMap: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
    }
    for (const t of tasks) {
      if (priorityMap[t.priority] !== undefined) priorityMap[t.priority]++
    }
    return [
      { name: "Low", value: priorityMap.low, fill: COLORS.chart2 },
      { name: "Medium", value: priorityMap.medium, fill: COLORS.warning },
      { name: "High", value: priorityMap.high, fill: COLORS.destructive },
    ]
  }, [tasks])

  // --- Contact Status Breakdown ---
  const contactStatusData = useMemo(() => {
    const statusMap: Record<string, number> = {
      active: 0,
      lead: 0,
      inactive: 0,
    }
    for (const c of contacts) {
      if (statusMap[c.status] !== undefined) statusMap[c.status]++
    }
    return [
      { name: "Active", count: statusMap.active },
      { name: "Lead", count: statusMap.lead },
      { name: "Inactive", count: statusMap.inactive },
    ]
  }, [contacts])

  // --- Tasks by Contact (top 5) ---
  const tasksByContactData = useMemo(() => {
    const contactTaskMap: Record<string, { name: string; tasks: number; completed: number }> = {}
    for (const t of tasks) {
      if (!t.contact_id) continue
      const contact = contacts.find((c) => c.id === t.contact_id)
      if (!contact) continue
      const name = contact.last_name
        ? `${contact.first_name} ${contact.last_name}`
        : contact.first_name
      if (!contactTaskMap[t.contact_id]) {
        contactTaskMap[t.contact_id] = { name, tasks: 0, completed: 0 }
      }
      contactTaskMap[t.contact_id].tasks++
      if (t.status === "done") contactTaskMap[t.contact_id].completed++
    }
    return Object.values(contactTaskMap)
      .sort((a, b) => b.tasks - a.tasks)
      .slice(0, 5)
  }, [tasks, contacts])

  // --- Company distribution ---
  const companyData = useMemo(() => {
    const companyMap: Record<string, number> = {}
    for (const c of contacts) {
      const company = c.company || "No Company"
      companyMap[company] = (companyMap[company] || 0) + 1
    }
    return Object.entries(companyMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }, [contacts])

  // --- Activity by day of week ---
  const activityByDayData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const dayCounts = Array(7).fill(0)
    for (const t of tasks) {
      const day = new Date(t.created_at).getDay()
      dayCounts[day]++
    }
    for (const c of contacts) {
      const day = new Date(c.created_at).getDay()
      dayCounts[day]++
    }
    return days.map((day, i) => ({ day, activity: dayCounts[i] }))
  }, [tasks, contacts])

  // --- Upcoming deadlines ---
  const upcomingDeadlines = useMemo(() => {
    const now = new Date()
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
    return tasks
      .filter(
        (t) =>
          t.due_date &&
          t.status !== "done" &&
          new Date(t.due_date) >= now &&
          new Date(t.due_date) <= twoWeeksFromNow
      )
      .sort(
        (a, b) =>
          new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()
      )
      .slice(0, 5)
  }, [tasks])

  // --- Radial completion gauge data ---
  const completionGaugeData = useMemo(() => {
    return [
      {
        name: "Completion",
        value: completionRate,
        fill: COLORS.success,
      },
    ]
  }, [completionRate])

  // --- High priority open tasks ---
  const highPriorityOpen = tasks.filter(
    (t) => t.priority === "high" && t.status !== "done"
  ).length

  return (
    <div className="flex flex-col gap-6">
      {isGuest && <MockDataBanner dataType="analytics" />}

      {!hideHeader && (
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
            Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Insights across your contacts and tasks
          </p>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Total Contacts</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-foreground">
                  {totalContacts}
                </p>
                <span className="flex items-center text-xs text-success">
                  <ArrowUpRight className="h-3 w-3" />
                  {activeContacts} active
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <CheckSquare className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Total Tasks</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-foreground">
                  {totalTasks}
                </p>
                <span className="flex items-center text-xs text-success">
                  <ArrowUpRight className="h-3 w-3" />
                  {completedTasks} done
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Overdue</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-foreground">
                  {overdueTasks.length}
                </p>
                {highPriorityOpen > 0 && (
                  <span className="flex items-center text-xs text-destructive">
                    <ArrowDownRight className="h-3 w-3" />
                    {highPriorityOpen} high pri
                  </span>
                )}
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
              <p className="text-xs text-muted-foreground">
                Avg Tasks / Contact
              </p>
              <p className="text-2xl font-bold text-foreground">
                {avgTasksPerContact}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Secondary stat row ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warning/10">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-foreground">
                {inProgressTasks}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted">
              <Target className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">To Do</p>
              <p className="text-2xl font-bold text-foreground">{todoTasks}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Companies</p>
              <p className="text-2xl font-bold text-foreground">
                {companyData.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-chart4/10">
              <CalendarDays className="h-5 w-5 text-[hsl(280,65%,60%)]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Leads</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-foreground">
                  {leadContacts}
                </p>
                <span className="text-xs text-muted-foreground">
                  in pipeline
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 1: Contact Growth + Task Flow ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact Growth</CardTitle>
            <CardDescription>
              Cumulative contacts over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                cumulative: {
                  label: "Total Contacts",
                  color: "hsl(var(--chart-1))",
                },
                contacts: {
                  label: "New Contacts",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[280px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={contactGrowthData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="month"
                    className="text-xs"
                    tick={{ fill: COLORS.muted }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: COLORS.muted }}
                    allowDecimals={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke={COLORS.primary}
                    fill={COLORS.primary}
                    fillOpacity={0.15}
                    strokeWidth={2}
                    name="Total Contacts"
                  />
                  <Area
                    type="monotone"
                    dataKey="contacts"
                    stroke={COLORS.chart2}
                    fill={COLORS.chart2}
                    fillOpacity={0.1}
                    strokeWidth={2}
                    name="New Contacts"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Task Flow</CardTitle>
            <CardDescription>
              Tasks created vs completed over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                created: {
                  label: "Created",
                  color: "hsl(var(--chart-1))",
                },
                completed: {
                  label: "Completed",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[280px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={tasksPerMonthData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="month"
                    className="text-xs"
                    tick={{ fill: COLORS.muted }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: COLORS.muted }}
                    allowDecimals={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="created"
                    fill={COLORS.primary}
                    radius={[4, 4, 0, 0]}
                    name="Created"
                  />
                  <Bar
                    dataKey="completed"
                    fill={COLORS.success}
                    radius={[4, 4, 0, 0]}
                    name="Completed"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 2: Completion Rate Trend + Completion Gauge + Weekly Activity ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Completion Rate Trend</CardTitle>
            <CardDescription>
              Monthly task completion percentage over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                rate: {
                  label: "Completion %",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[240px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={completionTrendData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="month"
                    className="text-xs"
                    tick={{ fill: COLORS.muted }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: COLORS.muted }}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value) => [`${value}%`, "Completion Rate"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke={COLORS.success}
                    strokeWidth={2.5}
                    dot={{ fill: COLORS.success, strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Completion %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Overall Completion</CardTitle>
            <CardDescription>
              {completedTasks} of {totalTasks} tasks done
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <ChartContainer
              config={{
                completion: {
                  label: "Completion",
                  color: "hsl(var(--success))",
                },
              }}
              className="h-[180px] w-[180px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="70%"
                  outerRadius="100%"
                  barSize={14}
                  data={completionGaugeData}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar
                    dataKey="value"
                    cornerRadius={8}
                    background={{ fill: "hsl(var(--muted))" }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </ChartContainer>
            <p className="mt-[-2rem] text-3xl font-bold text-foreground">
              {completionRate}%
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 3: Task Status + Task Priority + Contact Pipeline ── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Task Status</CardTitle>
            <CardDescription>Current breakdown by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                todo: { label: "To Do", color: COLORS.muted },
                in_progress: {
                  label: "In Progress",
                  color: COLORS.primary,
                },
                done: { label: "Done", color: COLORS.success },
              }}
              className="mx-auto h-[240px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`status-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs text-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Task Priority</CardTitle>
            <CardDescription>Distribution by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                low: { label: "Low", color: COLORS.chart2 },
                medium: { label: "Medium", color: COLORS.warning },
                high: { label: "High", color: COLORS.destructive },
              }}
              className="mx-auto h-[240px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskPriorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {taskPriorityData.map((entry, index) => (
                      <Cell key={`priority-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs text-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact Pipeline</CardTitle>
            <CardDescription>Contacts by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Contacts",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[240px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={contactStatusData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fill: COLORS.muted }}
                    className="text-xs"
                    allowDecimals={false}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fill: COLORS.muted }}
                    className="text-xs"
                    width={70}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="count"
                    radius={[0, 4, 4, 0]}
                    name="Contacts"
                  >
                    {contactStatusData.map((_, index) => (
                      <Cell
                        key={`pipeline-${index}`}
                        fill={
                          [COLORS.success, COLORS.warning, COLORS.muted][index]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 4: Weekly Activity + Company Distribution ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly Activity Pattern</CardTitle>
            <CardDescription>
              Tasks and contacts created by day of week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                activity: {
                  label: "Activity",
                  color: "hsl(var(--chart-4))",
                },
              }}
              className="h-[260px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activityByDayData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="day"
                    className="text-xs"
                    tick={{ fill: COLORS.muted }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: COLORS.muted }}
                    allowDecimals={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="activity"
                    radius={[4, 4, 0, 0]}
                    name="Activity"
                  >
                    {activityByDayData.map((entry, index) => (
                      <Cell
                        key={`day-${index}`}
                        fill={
                          entry.activity ===
                          Math.max(...activityByDayData.map((d) => d.activity))
                            ? COLORS.primary
                            : COLORS.chart4
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Contacts by Organization
            </CardTitle>
            <CardDescription>
              Top companies in your network
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Contacts",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[260px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={companyData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fill: COLORS.muted }}
                    className="text-xs"
                    allowDecimals={false}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fill: COLORS.muted }}
                    className="text-xs"
                    width={90}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="count"
                    radius={[0, 4, 4, 0]}
                    name="Contacts"
                  >
                    {companyData.map((_, index) => (
                      <Cell
                        key={`company-${index}`}
                        fill={
                          [
                            COLORS.primary,
                            COLORS.chart2,
                            COLORS.chart3,
                            COLORS.chart4,
                            COLORS.chart5,
                            COLORS.muted,
                          ][index % 6]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 5: Top Contacts by Tasks + Upcoming Deadlines ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Contacts by Tasks</CardTitle>
            <CardDescription>
              Contacts with the most assigned tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tasksByContactData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No tasks linked to contacts yet.
              </p>
            ) : (
              <ChartContainer
                config={{
                  tasks: {
                    label: "Total",
                    color: "hsl(var(--chart-1))",
                  },
                  completed: {
                    label: "Completed",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[260px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={tasksByContactData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-border"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: COLORS.muted }}
                      className="text-xs"
                    />
                    <YAxis
                      tick={{ fill: COLORS.muted }}
                      className="text-xs"
                      allowDecimals={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="tasks"
                      fill={COLORS.primary}
                      radius={[4, 4, 0, 0]}
                      name="Total"
                    />
                    <Bar
                      dataKey="completed"
                      fill={COLORS.success}
                      radius={[4, 4, 0, 0]}
                      name="Completed"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Deadlines</CardTitle>
            <CardDescription>
              Tasks due within the next 2 weeks
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No upcoming deadlines.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {upcomingDeadlines.map((task) => {
                  const dueDate = new Date(task.due_date!)
                  const now = new Date()
                  const daysUntil = Math.ceil(
                    (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                  )
                  const isUrgent = daysUntil <= 3
                  return (
                    <div
                      key={task.id}
                      className="flex items-start justify-between gap-3 rounded-lg border border-border p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {task.title}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge
                            variant={
                              task.priority === "high"
                                ? "destructive"
                                : task.priority === "medium"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="text-[10px]"
                          >
                            {task.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {task.status === "in_progress"
                              ? "In Progress"
                              : "To Do"}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p
                          className={`text-sm font-medium ${isUrgent ? "text-destructive" : "text-foreground"}`}
                        >
                          {dueDate.toLocaleDateString("default", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p
                          className={`text-xs ${isUrgent ? "text-destructive" : "text-muted-foreground"}`}
                        >
                          {daysUntil === 0
                            ? "Due today"
                            : daysUntil === 1
                              ? "Due tomorrow"
                              : `${daysUntil} days left`}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Row 6: Overdue Tasks List ── */}
      {overdueTasks.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Overdue Tasks
            </CardTitle>
            <CardDescription>
              {overdueTasks.length} task{overdueTasks.length !== 1 ? "s" : ""}{" "}
              past due date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {overdueTasks.slice(0, 6).map((task) => {
                const dueDate = new Date(task.due_date!)
                const now = new Date()
                const daysOverdue = Math.ceil(
                  (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
                )
                const contact = task.contact_id
                  ? contacts.find((c) => c.id === task.contact_id)
                  : null
                return (
                  <div
                    key={task.id}
                    className="rounded-lg border border-destructive/20 bg-destructive/5 p-3"
                  >
                    <p className="truncate text-sm font-medium text-foreground">
                      {task.title}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge
                        variant={
                          task.priority === "high"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {task.priority}
                      </Badge>
                      <span className="text-xs text-destructive">
                        {daysOverdue} day{daysOverdue !== 1 ? "s" : ""} overdue
                      </span>
                    </div>
                    {contact && (
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {contact.first_name}{" "}
                        {contact.last_name && contact.last_name}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
