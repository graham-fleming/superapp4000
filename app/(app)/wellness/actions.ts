"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createMoodEntry(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const mood = parseInt(formData.get("mood") as string)
  const energy_level = formData.get("energy_level")
    ? parseInt(formData.get("energy_level") as string)
    : null
  const sleep_quality = formData.get("sleep_quality")
    ? parseInt(formData.get("sleep_quality") as string)
    : null
  const notes = formData.get("notes") as string | null
  const tagsRaw = formData.get("tags") as string | null
  const entry_date = (formData.get("entry_date") as string) || new Date().toISOString().split("T")[0]

  if (!mood || mood < 1 || mood > 5) return { error: "Valid mood (1-5) is required" }

  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
    : []

  const { error } = await supabase.from("mood_entries").upsert(
    {
      user_id: user.id,
      mood,
      energy_level,
      sleep_quality,
      notes: notes || null,
      tags,
      entry_date,
    },
    { onConflict: "user_id,entry_date" },
  )

  if (error) return { error: error.message }

  revalidatePath("/wellness")
  return { success: true }
}

export async function updateMoodEntry(id: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const mood = parseInt(formData.get("mood") as string)
  const energy_level = formData.get("energy_level")
    ? parseInt(formData.get("energy_level") as string)
    : null
  const sleep_quality = formData.get("sleep_quality")
    ? parseInt(formData.get("sleep_quality") as string)
    : null
  const notes = formData.get("notes") as string | null
  const tagsRaw = formData.get("tags") as string | null

  if (!mood || mood < 1 || mood > 5) return { error: "Valid mood (1-5) is required" }

  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
    : []

  const { error } = await supabase
    .from("mood_entries")
    .update({
      mood,
      energy_level,
      sleep_quality,
      notes: notes || null,
      tags,
    })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/wellness")
  return { success: true }
}

export async function deleteMoodEntry(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase.from("mood_entries").delete().eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/wellness")
  return { success: true }
}
