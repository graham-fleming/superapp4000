import { createClient } from "@/lib/supabase/server"
import { MealsContent } from "@/components/meals-content"
import { mockMeals } from "@/lib/mock-data"

export default async function MealsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="p-6 lg:p-8">
        <MealsContent initialMeals={mockMeals} isGuest />
      </div>
    )
  }

  const { data: mealData } = await supabase
    .from("meals")
    .select("*")
    .order("meal_date", { ascending: false })
    .order("created_at", { ascending: false })

  const meals = mealData ?? []
  const hasNoData = meals.length === 0

  return (
    <div className="p-6 lg:p-8">
      <MealsContent
        initialMeals={hasNoData ? mockMeals : meals}
        showingMockData={hasNoData}
      />
    </div>
  )
}
