import { createClient } from "@/lib/supabase/server"
import { ProjectsContent } from "@/components/projects-content"
import { mockContacts, mockTasks, mockAnalyticsTasks } from "@/lib/mock-data"

export default async function ProjectsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Build mock data shapes
  const mockContactOptions = mockContacts.map((c) => ({
    id: c.id,
    name: c.last_name ? `${c.first_name} ${c.last_name}` : c.first_name,
  }))

  const mockAnalyticsContacts = mockContacts.map((c) => ({
    id: c.id,
    first_name: c.first_name,
    last_name: c.last_name,
    email: c.email,
    company: c.company,
    status: c.status,
    created_at: c.created_at,
  }))

  if (!user) {
    return (
      <div className="p-6 lg:p-8">
        <ProjectsContent
          tasks={mockTasks}
          contacts={mockContacts}
          contactOptions={mockContactOptions}
          analyticsContacts={mockAnalyticsContacts}
          analyticsTasks={mockAnalyticsTasks}
          isGuest
        />
      </div>
    )
  }

  // Fetch all data in parallel
  const [
    { data: taskData },
    { data: contactData },
    { data: analyticsContactData },
    { data: analyticsTaskData },
  ] = await Promise.all([
    supabase
      .from("tasks")
      .select("*, contacts(first_name, last_name)")
      .order("created_at", { ascending: false }),
    supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("contacts")
      .select("id, first_name, last_name, email, company, status, created_at")
      .order("created_at", { ascending: true }),
    supabase
      .from("tasks")
      .select("id, title, status, priority, due_date, contact_id, created_at")
      .order("created_at", { ascending: true }),
  ])

  const tasks = taskData ?? []
  const contacts = contactData ?? []
  const analyticsContacts = analyticsContactData ?? []
  const analyticsTasks = analyticsTaskData ?? []

  const contactOptions = contacts.map((c) => ({
    id: c.id,
    name: c.last_name ? `${c.first_name} ${c.last_name}` : c.first_name,
  }))

  const hasNoData = tasks.length === 0 && contacts.length === 0

  return (
    <div className="p-6 lg:p-8">
      <ProjectsContent
        tasks={hasNoData ? mockTasks : tasks}
        contacts={hasNoData ? mockContacts : contacts}
        contactOptions={hasNoData ? mockContactOptions : contactOptions}
        analyticsContacts={hasNoData ? mockAnalyticsContacts : analyticsContacts}
        analyticsTasks={hasNoData ? mockAnalyticsTasks : analyticsTasks}
        showingMockData={hasNoData}
      />
    </div>
  )
}
