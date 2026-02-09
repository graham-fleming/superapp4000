"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// ── Trips ──

export async function createTrip(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const destination = formData.get("destination") as string
  if (!destination?.trim()) return { error: "Destination is required" }

  const description = formData.get("description") as string | null
  const status = (formData.get("status") as string) || "planning"
  const start_date = (formData.get("start_date") as string) || null
  const end_date = (formData.get("end_date") as string) || null
  const budgetRaw = formData.get("budget") as string | null
  const budget = budgetRaw ? parseFloat(budgetRaw) : null
  const currency = (formData.get("currency") as string) || "USD"
  const cover_color = (formData.get("cover_color") as string) || null
  const tagsRaw = formData.get("tags") as string | null
  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
    : []

  const { error } = await supabase.from("trips").insert({
    user_id: user.id,
    destination: destination.trim(),
    description: description || null,
    status,
    start_date,
    end_date,
    budget,
    currency,
    cover_color,
    tags,
  })

  if (error) return { error: error.message }

  revalidatePath("/travel")
  return { success: true }
}

export async function updateTrip(id: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const destination = formData.get("destination") as string
  if (!destination?.trim()) return { error: "Destination is required" }

  const description = formData.get("description") as string | null
  const status = (formData.get("status") as string) || "planning"
  const start_date = (formData.get("start_date") as string) || null
  const end_date = (formData.get("end_date") as string) || null
  const budgetRaw = formData.get("budget") as string | null
  const budget = budgetRaw ? parseFloat(budgetRaw) : null
  const currency = (formData.get("currency") as string) || "USD"
  const cover_color = (formData.get("cover_color") as string) || null
  const tagsRaw = formData.get("tags") as string | null
  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
    : []

  const { error } = await supabase
    .from("trips")
    .update({
      destination: destination.trim(),
      description: description || null,
      status,
      start_date,
      end_date,
      budget,
      currency,
      cover_color,
      tags,
    })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/travel")
  return { success: true }
}

export async function deleteTrip(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase.from("trips").delete().eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/travel")
  return { success: true }
}

// ── Trip Activities ──

export async function createActivity(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const trip_id = formData.get("trip_id") as string
  const title = formData.get("title") as string
  if (!trip_id || !title?.trim()) return { error: "Trip and title are required" }

  const description = formData.get("description") as string | null
  const activity_date = (formData.get("activity_date") as string) || null
  const start_time = (formData.get("start_time") as string) || null
  const end_time = (formData.get("end_time") as string) || null
  const location = (formData.get("location") as string) || null
  const category = (formData.get("category") as string) || "other"
  const costRaw = formData.get("cost") as string | null
  const cost = costRaw ? parseFloat(costRaw) : null
  const is_booked = formData.get("is_booked") === "true"

  const { error } = await supabase.from("trip_activities").insert({
    trip_id,
    user_id: user.id,
    title: title.trim(),
    description: description || null,
    activity_date,
    start_time,
    end_time,
    location: location || null,
    category,
    cost,
    is_booked,
  })

  if (error) return { error: error.message }

  revalidatePath("/travel")
  return { success: true }
}

export async function updateActivity(id: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const title = formData.get("title") as string
  if (!title?.trim()) return { error: "Title is required" }

  const description = formData.get("description") as string | null
  const activity_date = (formData.get("activity_date") as string) || null
  const start_time = (formData.get("start_time") as string) || null
  const end_time = (formData.get("end_time") as string) || null
  const location = (formData.get("location") as string) || null
  const category = (formData.get("category") as string) || "other"
  const costRaw = formData.get("cost") as string | null
  const cost = costRaw ? parseFloat(costRaw) : null
  const is_booked = formData.get("is_booked") === "true"

  const { error } = await supabase
    .from("trip_activities")
    .update({
      title: title.trim(),
      description: description || null,
      activity_date,
      start_time,
      end_time,
      location: location || null,
      category,
      cost,
      is_booked,
    })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/travel")
  return { success: true }
}

export async function deleteActivity(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase.from("trip_activities").delete().eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/travel")
  return { success: true }
}

// ── Trip Expenses ──

export async function createExpense(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const trip_id = formData.get("trip_id") as string
  const title = formData.get("title") as string
  const amountRaw = formData.get("amount") as string
  if (!trip_id || !title?.trim() || !amountRaw) return { error: "Trip, title, and amount are required" }

  const amount = parseFloat(amountRaw)
  const category = (formData.get("category") as string) || "other"
  const expense_date = (formData.get("expense_date") as string) || new Date().toISOString().split("T")[0]
  const notes = (formData.get("notes") as string) || null

  const { error } = await supabase.from("trip_expenses").insert({
    trip_id,
    user_id: user.id,
    title: title.trim(),
    amount,
    category,
    expense_date,
    notes: notes || null,
  })

  if (error) return { error: error.message }

  revalidatePath("/travel")
  return { success: true }
}

export async function updateExpense(id: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const title = formData.get("title") as string
  const amountRaw = formData.get("amount") as string
  if (!title?.trim() || !amountRaw) return { error: "Title and amount are required" }

  const amount = parseFloat(amountRaw)
  const category = (formData.get("category") as string) || "other"
  const expense_date = (formData.get("expense_date") as string) || new Date().toISOString().split("T")[0]
  const notes = (formData.get("notes") as string) || null

  const { error } = await supabase
    .from("trip_expenses")
    .update({
      title: title.trim(),
      amount,
      category,
      expense_date,
      notes: notes || null,
    })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/travel")
  return { success: true }
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase.from("trip_expenses").delete().eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/travel")
  return { success: true }
}
