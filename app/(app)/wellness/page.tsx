import { createClient } from "@/lib/supabase/server"
import { WellnessContent } from "@/components/wellness-content"
import { mockMoodEntries } from "@/lib/mock-data"

export default async function WellnessPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="p-6 lg:p-8">
        <WellnessContent initialEntries={mockMoodEntries} isGuest />
      </div>
    )
  }

  const { data: entriesData } = await supabase
    .from("mood_entries")
    .select("*")
    .order("entry_date", { ascending: false })

  const entries = entriesData ?? []
  const hasNoData = entries.length === 0

  return (
    <div className="p-6 lg:p-8">
      <WellnessContent
        initialEntries={hasNoData ? mockMoodEntries : entries}
        showingMockData={hasNoData}
      />
    </div>
  )
}
