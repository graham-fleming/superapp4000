"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createTask(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const title = formData.get("title") as string
  const description = formData.get("description") as string | null
  const priority = formData.get("priority") as string
  const status = formData.get("status") as string
  const due_date = formData.get("due_date") as string | null
  const contact_id = formData.get("contact_id") as string | null

  if (!title) return { error: "Title is required" }

  const { error } = await supabase.from("tasks").insert({
    title,
    description: description || null,
    priority: priority || "medium",
    status: status || "todo",
    due_date: due_date || null,
    contact_id: contact_id || null,
    user_id: user.id,
  })

  if (error) return { error: error.message }

  revalidatePath("/projects")
  return { success: true }
}

export async function updateTaskStatus(id: string, status: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/projects")
  return { success: true }
}

export async function deleteTask(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase.from("tasks").delete().eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/projects")
  return { success: true }
}
