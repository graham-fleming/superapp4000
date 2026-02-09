"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createMeal(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const meal_name = formData.get("meal_name") as string
  const meal_type = formData.get("meal_type") as string
  const calories = formData.get("calories") as string | null
  const protein_g = formData.get("protein_g") as string | null
  const carbs_g = formData.get("carbs_g") as string | null
  const fat_g = formData.get("fat_g") as string | null
  const notes = formData.get("notes") as string | null
  const meal_date = formData.get("meal_date") as string | null

  if (!meal_name) return { error: "Meal name is required" }

  const { error } = await supabase.from("meals").insert({
    meal_name,
    meal_type: meal_type || "lunch",
    calories: calories ? parseFloat(calories) : null,
    protein_g: protein_g ? parseFloat(protein_g) : null,
    carbs_g: carbs_g ? parseFloat(carbs_g) : null,
    fat_g: fat_g ? parseFloat(fat_g) : null,
    notes: notes || null,
    meal_date: meal_date || new Date().toISOString().split("T")[0],
    user_id: user.id,
  })

  if (error) return { error: error.message }

  revalidatePath("/meals")
  revalidatePath("/projects")
  return { success: true }
}

export async function deleteMeal(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase.from("meals").delete().eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/meals")
  revalidatePath("/projects")
  return { success: true }
}
