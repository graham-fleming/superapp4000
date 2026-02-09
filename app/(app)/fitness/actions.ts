"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createWorkout(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const exercise_name = formData.get("exercise_name") as string
  const category = formData.get("category") as string
  const sets = formData.get("sets") as string | null
  const reps = formData.get("reps") as string | null
  const weight_lbs = formData.get("weight_lbs") as string | null
  const duration_minutes = formData.get("duration_minutes") as string | null
  const notes = formData.get("notes") as string | null
  const workout_date = formData.get("workout_date") as string | null

  if (!exercise_name) return { error: "Exercise name is required" }

  const { error } = await supabase.from("workouts").insert({
    exercise_name,
    category: category || "strength",
    sets: sets ? parseInt(sets) : null,
    reps: reps ? parseInt(reps) : null,
    weight_lbs: weight_lbs ? parseFloat(weight_lbs) : null,
    duration_minutes: duration_minutes ? parseFloat(duration_minutes) : null,
    notes: notes || null,
    workout_date: workout_date || new Date().toISOString().split("T")[0],
    user_id: user.id,
  })

  if (error) return { error: error.message }

  revalidatePath("/fitness")
  revalidatePath("/projects")
  return { success: true }
}

export async function deleteWorkout(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase.from("workouts").delete().eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/fitness")
  revalidatePath("/projects")
  return { success: true }
}
