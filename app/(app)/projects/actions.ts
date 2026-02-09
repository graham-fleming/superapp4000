"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function seedDemoData() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const { count } = await supabase
    .from("contacts")
    .select("*", { count: "exact", head: true })

  if (count && count > 0) {
    return { error: "You already have contacts. Clear them first or use as-is." }
  }

  const { data: contacts, error: contactsError } = await supabase
    .from("contacts")
    .insert([
      {
        user_id: user.id,
        first_name: "Sarah",
        last_name: "Chen",
        email: "sarah.chen@acmecorp.com",
        phone: "+1 (415) 555-0102",
        company: "Acme Corp",
        role: "VP of Engineering",
        notes: "Met at React Summit 2025. Interested in our enterprise plan.",
        status: "active",
      },
      {
        user_id: user.id,
        first_name: "Marcus",
        last_name: "Johnson",
        email: "m.johnson@brightlabs.io",
        phone: "+1 (312) 555-0198",
        company: "Bright Labs",
        role: "CTO",
        notes: "Referred by Sarah Chen. Evaluating our API integration.",
        status: "lead",
      },
      {
        user_id: user.id,
        first_name: "Elena",
        last_name: "Rodriguez",
        email: "elena@startupventures.co",
        phone: "+1 (646) 555-0134",
        company: "Startup Ventures",
        role: "Founder & CEO",
        notes: "Early-stage startup, looking for growth tools.",
        status: "active",
      },
      {
        user_id: user.id,
        first_name: "David",
        last_name: "Kim",
        email: "david.kim@globaltrade.com",
        phone: "+1 (213) 555-0177",
        company: "Global Trade Inc",
        role: "Head of Operations",
        notes: "Existing customer since Q1 2025. Renewed annual contract.",
        status: "active",
      },
      {
        user_id: user.id,
        first_name: "Priya",
        last_name: "Patel",
        email: "priya@designforward.studio",
        phone: "+1 (510) 555-0156",
        company: "Design Forward Studio",
        role: "Creative Director",
        notes: "Potential partnership for UI/UX services.",
        status: "lead",
      },
      {
        user_id: user.id,
        first_name: "James",
        last_name: "Wright",
        email: "jwright@oldbridge.org",
        phone: "+1 (202) 555-0143",
        company: "Oldbridge Foundation",
        role: "Program Director",
        notes: "Non-profit org. Contract ended last quarter.",
        status: "inactive",
      },
      {
        user_id: user.id,
        first_name: "Aisha",
        last_name: "Okafor",
        email: "aisha@cloudnine.tech",
        phone: "+1 (737) 555-0189",
        company: "CloudNine Tech",
        role: "Product Manager",
        notes: "Interested in our analytics dashboard. Demo scheduled.",
        status: "lead",
      },
      {
        user_id: user.id,
        first_name: "Tom",
        last_name: "Mueller",
        email: "tom.m@precisionmfg.com",
        phone: "+1 (614) 555-0121",
        company: "Precision Manufacturing",
        role: "IT Director",
        notes: "Enterprise customer. Needs custom SSO integration.",
        status: "active",
      },
    ])
    .select()

  if (contactsError) {
    return { error: contactsError.message }
  }

  const contactMap = new Map(
    (contacts ?? []).map((c) => [`${c.first_name} ${c.last_name}`, c.id])
  )

  const today = new Date()
  const daysFromNow = (d: number) => {
    const date = new Date(today)
    date.setDate(date.getDate() + d)
    return date.toISOString().split("T")[0]
  }

  const { error: tasksError } = await supabase.from("tasks").insert([
    {
      user_id: user.id,
      contact_id: contactMap.get("Sarah Chen"),
      title: "Send proposal to Acme Corp",
      description: "Prepare and send the enterprise pricing proposal for Acme Corp. Include volume discount options.",
      status: "in_progress",
      priority: "high",
      due_date: daysFromNow(2),
    },
    {
      user_id: user.id,
      contact_id: contactMap.get("Marcus Johnson"),
      title: "Schedule API demo for Bright Labs",
      description: "Set up a technical demo of our REST and GraphQL APIs for Marcus and his dev team.",
      status: "todo",
      priority: "high",
      due_date: daysFromNow(5),
    },
    {
      user_id: user.id,
      contact_id: contactMap.get("Elena Rodriguez"),
      title: "Follow up on onboarding progress",
      description: "Check in with Elena to see if her team has completed the onboarding checklist.",
      status: "todo",
      priority: "medium",
      due_date: daysFromNow(3),
    },
    {
      user_id: user.id,
      contact_id: contactMap.get("David Kim"),
      title: "Quarterly business review prep",
      description: "Prepare Q4 performance report and renewal talking points for Global Trade.",
      status: "in_progress",
      priority: "medium",
      due_date: daysFromNow(7),
    },
    {
      user_id: user.id,
      contact_id: contactMap.get("Priya Patel"),
      title: "Draft partnership proposal",
      description: "Create a partnership proposal for Design Forward Studio covering referral terms.",
      status: "todo",
      priority: "low",
      due_date: daysFromNow(14),
    },
    {
      user_id: user.id,
      contact_id: contactMap.get("Tom Mueller"),
      title: "SSO integration requirements doc",
      description: "Document the technical requirements for Precision Manufacturing's custom SSO setup.",
      status: "in_progress",
      priority: "high",
      due_date: daysFromNow(4),
    },
    {
      user_id: user.id,
      contact_id: contactMap.get("Aisha Okafor"),
      title: "Prepare analytics demo environment",
      description: "Set up a sandbox environment with sample data for Aisha's upcoming demo.",
      status: "todo",
      priority: "medium",
      due_date: daysFromNow(6),
    },
    {
      user_id: user.id,
      contact_id: null,
      title: "Update CRM data export feature",
      description: "Add CSV and PDF export options to the contacts list page.",
      status: "todo",
      priority: "low",
      due_date: daysFromNow(21),
    },
    {
      user_id: user.id,
      contact_id: contactMap.get("David Kim"),
      title: "Send renewal invoice",
      description: "Generate and send the annual renewal invoice to Global Trade Inc.",
      status: "done",
      priority: "high",
      due_date: daysFromNow(-3),
    },
    {
      user_id: user.id,
      contact_id: contactMap.get("Sarah Chen"),
      title: "Complete onboarding call notes",
      description: "Write up the notes from last week's onboarding kickoff call with Acme Corp.",
      status: "done",
      priority: "medium",
      due_date: daysFromNow(-5),
    },
  ])

  if (tasksError) {
    return { error: tasksError.message }
  }

  revalidatePath("/projects")

  return { success: true }
}
