"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateContact(id: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const first_name = formData.get("first_name") as string
  const last_name = formData.get("last_name") as string | null
  const email = formData.get("email") as string | null
  const phone = formData.get("phone") as string | null
  const company = formData.get("company") as string | null
  const role = formData.get("role") as string | null
  const status = formData.get("status") as string
  const notes = formData.get("notes") as string | null

  if (!first_name) return { error: "First name is required" }

  const { error } = await supabase
    .from("contacts")
    .update({
      first_name,
      last_name: last_name || null,
      email: email || null,
      phone: phone || null,
      company: company || null,
      role: role || null,
      status: status || "lead",
      notes: notes || null,
    })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath(`/projects/contacts/${id}`)
  revalidatePath("/projects")
  return { success: true }
}
