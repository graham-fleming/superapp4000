"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createContact(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const first_name = formData.get("first_name") as string
  if (!first_name) return { error: "First name is required" }

  const { error } = await supabase.from("contacts").insert({
    user_id: user.id,
    first_name,
    last_name: (formData.get("last_name") as string) || null,
    email: (formData.get("email") as string) || null,
    phone: (formData.get("phone") as string) || null,
    company: (formData.get("company") as string) || null,
    role: (formData.get("role") as string) || null,
    notes: (formData.get("notes") as string) || null,
    status: (formData.get("status") as string) || "lead",
  })

  if (error) return { error: error.message }

  revalidatePath("/projects")
  return { success: true }
}

export async function deleteContact(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase.from("contacts").delete().eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/projects")
  return { success: true }
}
