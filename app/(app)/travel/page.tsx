import { createClient } from "@/lib/supabase/server"
import { TravelContent } from "@/components/travel-content"
import { mockTrips, mockTripActivities, mockTripExpenses } from "@/lib/mock-data"

export default async function TravelPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="p-6 lg:p-8">
        <TravelContent
          initialTrips={mockTrips}
          initialActivities={mockTripActivities}
          initialExpenses={mockTripExpenses}
          isGuest
        />
      </div>
    )
  }

  const [tripsRes, activitiesRes, expensesRes] = await Promise.all([
    supabase.from("trips").select("*").order("start_date", { ascending: true }),
    supabase.from("trip_activities").select("*").order("activity_date", { ascending: true }),
    supabase.from("trip_expenses").select("*").order("expense_date", { ascending: false }),
  ])

  const trips = tripsRes.data ?? []
  const activities = activitiesRes.data ?? []
  const expenses = expensesRes.data ?? []
  const hasNoData = trips.length === 0

  return (
    <div className="p-6 lg:p-8">
      <TravelContent
        initialTrips={hasNoData ? mockTrips : trips}
        initialActivities={hasNoData ? mockTripActivities : activities}
        initialExpenses={hasNoData ? mockTripExpenses : expenses}
        showingMockData={hasNoData}
      />
    </div>
  )
}
