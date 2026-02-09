"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createTransaction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const description = formData.get("description") as string
  const amount = formData.get("amount") as string
  const type = formData.get("type") as string
  const category = formData.get("category") as string
  const transaction_date = formData.get("transaction_date") as string | null
  const notes = formData.get("notes") as string | null

  if (!description) return { error: "Description is required" }
  if (!amount || isNaN(parseFloat(amount))) return { error: "Valid amount is required" }

  const { error } = await supabase.from("transactions").insert({
    description,
    amount: parseFloat(amount),
    type: type || "expense",
    category: category || "other",
    transaction_date: transaction_date || new Date().toISOString().split("T")[0],
    notes: notes || null,
    user_id: user.id,
  })

  if (error) return { error: error.message }

  revalidatePath("/finance")
  revalidatePath("/projects")
  return { success: true }
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase.from("transactions").delete().eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/finance")
  revalidatePath("/projects")
  return { success: true }
}

export async function upsertBudget(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const category = formData.get("category") as string | null
  const monthly_limit = formData.get("monthly_limit") as string
  const budget_month = formData.get("budget_month") as string

  if (!monthly_limit || isNaN(parseFloat(monthly_limit)))
    return { error: "Valid budget amount is required" }

  const budgetCategory = category === "overall" ? null : category

  // Use upsert with the unique constraint
  const { error } = await supabase.from("budgets").upsert(
    {
      user_id: user.id,
      category: budgetCategory,
      monthly_limit: parseFloat(monthly_limit),
      budget_month: budget_month || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    },
    { onConflict: "user_id,category,budget_month" },
  )

  if (error) return { error: error.message }

  revalidatePath("/finance")
  return { success: true }
}

export async function deleteBudget(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase.from("budgets").delete().eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/finance")
  return { success: true }
}
