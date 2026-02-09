import React from "react"
import { createClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/app-shell"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <AppShell isGuest={!user}>
      {children}
    </AppShell>
  )
}
