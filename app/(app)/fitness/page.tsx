import { createClient } from "@/lib/supabase/server"
import { FitnessContent } from "@/components/fitness-content"
import { mockWorkouts } from "@/lib/mock-data"

export default async function FitnessPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="p-6 lg:p-8">
        <FitnessContent initialWorkouts={mockWorkouts} isGuest />
      </div>
    )
  }

  const { data: workoutData } = await supabase
    .from("workouts")
    .select("*")
    .order("workout_date", { ascending: false })
    .order("created_at", { ascending: false })

  const workouts = workoutData ?? []
  const hasNoData = workouts.length === 0

  return (
    <div className="p-6 lg:p-8">
      <FitnessContent
        initialWorkouts={hasNoData ? mockWorkouts : workouts}
        showingMockData={hasNoData}
      />
    </div>
  )
}
