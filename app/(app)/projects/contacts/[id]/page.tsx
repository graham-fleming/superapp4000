import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { ContactDetail } from "@/components/contact-detail"

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Contact detail requires auth -- guests can't access real contact data
  if (!user) redirect("/auth/login")

  const { data: contact } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", id)
    .single()

  if (!contact) notFound()

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("contact_id", id)
    .order("created_at", { ascending: false })

  return (
    <div className="p-6 lg:p-8">
      <ContactDetail contact={contact} tasks={tasks ?? []} />
    </div>
  )
}
