"use client"

import React from "react"

import { useState, useTransition, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Save,
  Loader2,
  CheckCircle2,
  User,
  ListTodo,
  FileText,
  Link2,
  Lightbulb,
  Calendar,
  FolderOpen,
  BookOpen,
  Inbox,
  Sparkles,
  Clock,
  X,
  Tag,
  Search,
  Trash2,
  Eye,
  Archive,
  Home,
  Database,
  ArrowRight,
  TrendingUp,
} from "lucide-react"
import { saveItem, deleteItem } from "@/app/(app)/saver/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useAuthGate } from "@/components/auth-gate"
import { MockDataBanner, EmptyUserBanner } from "@/components/mock-data-banner"

type SavedItem = {
  id: string
  raw_text?: string
  title: string
  summary: string | null
  category: string
  tags: string[]
  metadata: Record<string, unknown>
  created_at: string
  similarity?: number
}

type SaveResult = {
  id: string
  title: string
  summary: string
  category: string
  tags: string[]
  metadata: Record<string, unknown>
}

const categoryConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  person: { icon: User, label: "Person", color: "bg-blue-100 text-blue-700" },
  task: { icon: ListTodo, label: "Task", color: "bg-amber-100 text-amber-700" },
  note: { icon: FileText, label: "Note", color: "bg-emerald-100 text-emerald-700" },
  link: { icon: Link2, label: "Link", color: "bg-indigo-100 text-indigo-700" },
  idea: { icon: Lightbulb, label: "Idea", color: "bg-yellow-100 text-yellow-700" },
  meeting: { icon: Calendar, label: "Meeting", color: "bg-rose-100 text-rose-700" },
  project: { icon: FolderOpen, label: "Project", color: "bg-teal-100 text-teal-700" },
  reference: { icon: BookOpen, label: "Reference", color: "bg-purple-100 text-purple-700" },
  general: { icon: Inbox, label: "General", color: "bg-gray-100 text-gray-700" },
}

interface SaverContentProps {
  recentItems: SavedItem[]
  allItems: SavedItem[]
  categoryCounts: Record<string, number>
  isGuest?: boolean
  showingMockData?: boolean
}

export function SaverContent({ recentItems, allItems, categoryCounts, isGuest = false, showingMockData = false }: SaverContentProps) {
  const [activeTab, setActiveTab] = useState("home")
  const [text, setText] = useState("")
  const [isPending, startTransition] = useTransition()
  const [lastResult, setLastResult] = useState<SaveResult | null>(null)
  
  // Saved items tab state
  const [items, setItems] = useState<SavedItem[]>(allItems)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isSearching, setIsSearching] = useState(false)
  const [isSemanticResults, setIsSemanticResults] = useState(false)
  const [viewItem, setViewItem] = useState<SavedItem | null>(null)
  
  const router = useRouter()
  const { requireAuth } = useAuthGate()

  // Semantic search handler
  const handleSemanticSearch = useCallback(async () => {
    if (!requireAuth("use AI-powered search")) return
    if (!searchQuery.trim()) {
      setItems(allItems)
      setIsSemanticResults(false)
      return
    }

    setIsSearching(true)
    try {
      const res = await fetch("/api/saved-items/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, category: categoryFilter }),
      })
      const data = await res.json()
      if (data.results) {
        setItems(data.results)
        setIsSemanticResults(true)
      }
    } catch {
      toast.error("Search failed. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }, [searchQuery, categoryFilter, allItems, requireAuth])

  function handleClearSearch() {
    setSearchQuery("")
    setItems(allItems)
    setIsSemanticResults(false)
  }

  function handleCategoryChange(value: string) {
    setCategoryFilter(value)
    if (isSemanticResults) {
      return
    }
    if (value === "all") {
      setItems(allItems)
    } else {
      setItems(allItems.filter((item) => item.category === value))
    }
  }

  function handleDeleteItem(id: string) {
    if (!requireAuth("delete saved items")) return
    startTransition(async () => {
      const result = await deleteItem(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        setItems((prev) => prev.filter((item) => item.id !== id))
        toast.success("Item deleted")
        router.refresh()
      }
    })
  }

  function handleSubmit() {
    if (!requireAuth("save and categorize content")) return
    if (!text.trim()) return

    setLastResult(null)
    startTransition(async () => {
      const result = await saveItem(text)
      if (result.error) {
        toast.error(result.error)
      } else if (result.item) {
        setLastResult(result.item as SaveResult)
        setText("")
        toast.success("Saved and categorized successfully!")
        router.refresh()
      }
    })
  }

  const charCount = text.length
  const isOverLimit = charCount > 50000
  const totalItems = Object.values(categoryCounts).reduce((a, b) => a + b, 0)
  const topCategories = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  return (
    <div className="flex flex-col gap-6">
      {isGuest && <MockDataBanner dataType="saver data" />}
      {showingMockData && (
        <EmptyUserBanner dataType="saved items" actionLabel="Save your first item using the form below" />
      )}
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
          Universal Saver
        </h1>
        <p className="text-sm text-muted-foreground">
          Paste anything -- AI will analyze, categorize, and index it for smart retrieval.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
          <TabsTrigger value="home" className="gap-2">
            <Home className="h-4 w-4" />
            Home
          </TabsTrigger>
          <TabsTrigger value="saved" className="gap-2">
            <Database className="h-4 w-4" />
            Saved Items ({totalItems})
          </TabsTrigger>
        </TabsList>

        {/* ===================== HOME TAB ===================== */}
        <TabsContent value="home" className="flex flex-col gap-6 mt-6">
          {/* Stat cards row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Database className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{totalItems}</p>
                    <p className="text-xs text-muted-foreground">Total Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                    <FolderOpen className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{Object.keys(categoryCounts).length}</p>
                    <p className="text-xs text-muted-foreground">Categories</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{recentItems.length}</p>
                    <p className="text-xs text-muted-foreground">Recent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                    <Sparkles className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">AI</p>
                    <p className="text-xs text-muted-foreground">Powered</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts row - 2 cards side by side */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Input Area */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Save New Item</CardTitle>
                <CardDescription>Paste any text and AI will organize it</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Textarea
                  placeholder="Paste a LinkedIn profile, meeting notes, task description, article snippet, contact info, or any text you want to save and organize..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[200px] resize-y text-sm leading-relaxed"
                  disabled={isPending}
                />
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs ${isOverLimit ? "text-destructive font-medium" : "text-muted-foreground"}`}
                  >
                    {charCount.toLocaleString()} / 50,000
                  </span>
                  <Button
                    onClick={handleSubmit}
                    disabled={isPending || !text.trim() || isOverLimit}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Save & Categorize
                      </>
                    )}
                  </Button>
                </div>

                {/* Result Preview */}
                {lastResult && (
                  <div className="rounded-lg border-success/30 bg-success/5 p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <p className="text-sm font-medium text-success">Saved Successfully</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 bg-transparent"
                        onClick={() => setLastResult(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">{lastResult.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{lastResult.summary}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <CategoryBadge category={lastResult.category} small />
                      {lastResult.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Category Breakdown</CardTitle>
                <CardDescription>Your saved items by type</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {totalItems === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Archive className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No items saved yet</p>
                  </div>
                ) : (
                  <>
                    {/* Top categories */}
                    <div className="flex flex-col gap-3">
                      {topCategories.map(([category, count]) => {
                        const config = categoryConfig[category] || categoryConfig.general
                        const Icon = config.icon
                        const pct = Math.round((count / totalItems) * 100)
                        return (
                          <div key={category} className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <Icon className="h-3.5 w-3.5" style={{ color: config.color.split(' ')[1] }} />
                                {config.label}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {count} ({pct}%)
                              </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className={`h-full rounded-full transition-all ${config.color.split(' ')[0]}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Summary */}
                    <div className="mt-1 rounded-lg border border-primary/20 bg-primary/5 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 shrink-0 text-primary" />
                          <div>
                            <p className="text-xs text-muted-foreground">Most used</p>
                            <p className="text-sm font-bold text-foreground">
                              {topCategories[0] ? categoryConfig[topCategories[0][0]]?.label : "N/A"}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveTab("saved")}
                          className="bg-transparent"
                        >
                          View all <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent saves */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">Recent Saves</CardTitle>
                <CardDescription>Your latest {recentItems.length} saved items</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab("saved")} className="bg-transparent">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentItems.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <Save className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-2 text-lg font-medium text-foreground">No saved items yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Paste something above to get started!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {recentItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg border border-border p-3"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        {(() => {
                          const config = categoryConfig[item.category] || categoryConfig.general
                          const Icon = config.icon
                          return <Icon className="h-5 w-5 text-muted-foreground" />
                        })()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground line-clamp-1">{item.title}</p>
                        {item.summary && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{item.summary}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <CategoryBadge category={item.category} small />
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================== SAVED ITEMS TAB ===================== */}
        <TabsContent value="saved" className="flex flex-col gap-6 mt-6">
          {/* Search & Filter Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by meaning... e.g. 'people at AI startups' or 'urgent tasks'"
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSemanticSearch()}
                  />
                </div>
                <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {Object.entries(categoryConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label} {categoryCounts[key] ? `(${categoryCounts[key]})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleSemanticSearch} disabled={isSearching || !searchQuery.trim()}>
                  {isSearching ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  AI Search
                </Button>
              </div>
              {isSemanticResults && (
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Sparkles className="mr-1 h-3 w-3" />
                    Semantic results for &quot;{searchQuery}&quot;
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={handleClearSearch} className="h-6 text-xs bg-transparent">
                    Clear search
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          {items.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-12">
                <Archive className="h-10 w-10 text-muted-foreground/40" />
                <div className="text-center">
                  <p className="font-medium text-foreground">
                    {isSemanticResults ? "No matching items found" : "No saved items yet"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isSemanticResults
                      ? "Try a different search query or clear the search"
                      : "Head to the Home tab to start saving content"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => {
                const config = categoryConfig[item.category] || categoryConfig.general
                const Icon = config.icon
                return (
                  <Card key={item.id} className="flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="line-clamp-2 text-sm font-medium">
                          {item.title}
                        </CardTitle>
                        <Badge
                          variant="secondary"
                          className={`shrink-0 px-1.5 py-0 text-[10px] ${config.color}`}
                        >
                          <Icon className="mr-1 h-2.5 w-2.5" />
                          {config.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col gap-3">
                      {item.summary && (
                        <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                          {item.summary}
                        </p>
                      )}
                      {item.similarity !== undefined && (
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${Math.round(item.similarity * 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-medium text-muted-foreground">
                            {Math.round(item.similarity * 100)}% match
                          </span>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {item.tags?.slice(0, 4).map((tag) => (
                          <Badge key={tag} variant="outline" className="px-1.5 py-0 text-[10px]">
                            <Tag className="mr-0.5 h-2.5 w-2.5" />
                            {tag}
                          </Badge>
                        ))}
                        {item.tags?.length > 4 && (
                          <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                            +{item.tags.length - 4}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(item.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 bg-transparent"
                            onClick={() => setViewItem(item)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span className="sr-only">View item</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive bg-transparent"
                            onClick={() => handleDeleteItem(item.id)}
                            disabled={isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="sr-only">Delete item</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          {viewItem && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-2">
                  <DialogTitle className="text-lg">{viewItem.title}</DialogTitle>
                </div>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <CategoryBadge category={viewItem.category} />
                  {viewItem.tags?.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Tag className="mr-1 h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
                {viewItem.summary && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Summary
                    </p>
                    <p className="text-sm leading-relaxed text-foreground">{viewItem.summary}</p>
                  </div>
                )}
                {viewItem.metadata && Object.keys(viewItem.metadata).length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Extracted Metadata
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(viewItem.metadata as { content_type?: string }).content_type && (
                        <Badge variant="secondary" className="text-xs">
                          Type: {(viewItem.metadata as { content_type?: string }).content_type}
                        </Badge>
                      )}
                      {(viewItem.metadata as { sentiment?: string }).sentiment && (
                        <Badge variant="secondary" className="text-xs">
                          Sentiment: {(viewItem.metadata as { sentiment?: string }).sentiment}
                        </Badge>
                      )}
                      {(viewItem.metadata as { urgency?: string }).urgency && (
                        <Badge variant="secondary" className="text-xs">
                          Urgency: {(viewItem.metadata as { urgency?: string }).urgency}
                        </Badge>
                      )}
                      {(viewItem.metadata as { entities?: string[] }).entities?.map((entity) => (
                        <Badge key={entity} variant="outline" className="text-xs">
                          {entity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {viewItem.raw_text && (
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Original Content
                    </p>
                    <div className="max-h-[300px] overflow-y-auto rounded-lg border border-border bg-muted/50 p-4">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                        {viewItem.raw_text}
                      </pre>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Saved on{" "}
                  {new Date(viewItem.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CategoryBadge({ category, small = false }: { category: string; small?: boolean }) {
  const config = categoryConfig[category] || categoryConfig.general
  const Icon = config.icon
  return (
    <Badge
      variant="secondary"
      className={`${config.color} ${small ? "px-1.5 py-0 text-[10px]" : "text-xs"}`}
    >
      <Icon className={`mr-1 ${small ? "h-2.5 w-2.5" : "h-3 w-3"}`} />
      {config.label}
    </Badge>
  )
}
