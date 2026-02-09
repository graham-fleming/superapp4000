"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createHabit(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const name = formData.get("name") as string
  const description = formData.get("description") as string | null
  const category = formData.get("category") as string
  const type = formData.get("type") as string
  const target_count = formData.get("target_count") as string | null
  const color = formData.get("color") as string | null

  if (!name) return { error: "Habit name is required" }

  const { error } = await supabase.from("habits").insert({
    name,
    description: description || null,
    category: category || "other",
    type: type || "boolean",
    target_count: type === "counted" && target_count ? parseInt(target_count) : null,
    color: color || null,
    user_id: user.id,
  })

  if (error) return { error: error.message }

  revalidatePath("/habits")
  revalidatePath("/projects")
  return { success: true }
}

export async function updateHabit(id: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const name = formData.get("name") as string
  const description = formData.get("description") as string | null
  const category = formData.get("category") as string
  const type = formData.get("type") as string
  const target_count = formData.get("target_count") as string | null
  const color = formData.get("color") as string | null
  const is_active = formData.get("is_active") as string

  if (!name) return { error: "Habit name is required" }

  const { error } = await supabase
    .from("habits")
    .update({
      name,
      description: description || null,
      category: category || "other",
      type: type || "boolean",
      target_count: type === "counted" && target_count ? parseInt(target_count) : null,
      color: color || null,
      is_active: is_active !== "false",
    })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/habits")
  revalidatePath("/projects")
  return { success: true }
}

export async function deleteHabit(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase.from("habits").delete().eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/habits")
  revalidatePath("/projects")
  return { success: true }
}

export async function toggleCompletion(habitId: string, date: string, currentValue: number | null) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  if (currentValue !== null) {
    // Delete existing completion
    const { error } = await supabase
      .from("habit_completions")
      .delete()
      .eq("habit_id", habitId)
      .eq("completion_date", date)

    if (error) return { error: error.message }
  } else {
    // Create completion
    const { error } = await supabase.from("habit_completions").insert({
      habit_id: habitId,
      user_id: user.id,
      completion_date: date,
      value: 1,
    })

    if (error) return { error: error.message }
  }

  revalidatePath("/habits")
  return { success: true }
}

export async function updateCompletionValue(habitId: string, date: string, value: number) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  if (value <= 0) {
    // Delete if value is 0 or less
    const { error } = await supabase
      .from("habit_completions")
      .delete()
      .eq("habit_id", habitId)
      .eq("completion_date", date)

    if (error) return { error: error.message }
  } else {
    // Upsert completion
    const { error } = await supabase.from("habit_completions").upsert(
      {
        habit_id: habitId,
        user_id: user.id,
        completion_date: date,
        value,
      },
      { onConflict: "habit_id,completion_date" },
    )

    if (error) return { error: error.message }
  }

  revalidatePath("/habits")
  return { success: true }
}
