import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"
import { SaverContent } from "@/components/saver-content"
import { mockSavedItems } from "@/lib/mock-data"

export const metadata: Metadata = {
  title: "Universal Saver - SuperApp-4000",
  description: "Paste anything and let AI organize it for you",
}

function getMockCounts() {
  const counts: Record<string, number> = {}
  for (const item of mockSavedItems) {
    counts[item.category] = (counts[item.category] || 0) + 1
  }
  return counts
}

export default async function SaverPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="p-6 lg:p-8">
        <SaverContent 
          recentItems={mockSavedItems.slice(0, 5)} 
          allItems={mockSavedItems}
          categoryCounts={getMockCounts()}
          isGuest 
        />
      </div>
    )
  }

  const { data: allData } = await supabase
    .from("saved_items")
    .select("id, raw_text, title, summary, category, tags, metadata, created_at")
    .order("created_at", { ascending: false })

  const { data: categoryCounts } = await supabase
    .from("saved_items")
    .select("category")

  const allItems = allData ?? []
  const recentItems = allItems.slice(0, 5)
  const hasNoData = allItems.length === 0
  
  const counts: Record<string, number> = {}
  for (const row of categoryCounts ?? []) {
    counts[row.category] = (counts[row.category] || 0) + 1
  }

  return (
    <div className="p-6 lg:p-8">
      <SaverContent
        recentItems={hasNoData ? mockSavedItems.slice(0, 5) : recentItems}
        allItems={hasNoData ? mockSavedItems : allItems}
        categoryCounts={hasNoData ? getMockCounts() : counts}
        showingMockData={hasNoData}
      />
    </div>
  )
}
