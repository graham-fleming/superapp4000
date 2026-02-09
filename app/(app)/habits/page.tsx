import { createClient } from "@/lib/supabase/server"
import { HabitsContent } from "@/components/habits-content"
import { mockHabits, mockHabitCompletions } from "@/lib/mock-data"

export default async function HabitsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="p-6 lg:p-8">
        <HabitsContent initialHabits={mockHabits} initialCompletions={mockHabitCompletions} isGuest />
      </div>
    )
  }

  const [{ data: habitsData }, { data: completionsData }] = await Promise.all([
    supabase
      .from("habits")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("habit_completions")
      .select("*")
      .order("completion_date", { ascending: false }),
  ])

  const habits = habitsData ?? []
  const completions = completionsData ?? []
  const hasNoData = habits.length === 0

  return (
    <div className="p-6 lg:p-8">
      <HabitsContent
        initialHabits={hasNoData ? mockHabits : habits}
        initialCompletions={hasNoData ? mockHabitCompletions : completions}
        showingMockData={hasNoData}
      />
    </div>
  )
}
