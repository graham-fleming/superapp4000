"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"

interface MockDataBannerProps {
  /** What kind of data this page shows, e.g. "contacts", "tasks" */
  dataType: string
}

export function MockDataBanner({ dataType }: MockDataBannerProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3 sm:flex-row sm:items-center">
      <Info className="h-4 w-4 shrink-0 text-primary" />
      <p className="flex-1 text-sm text-muted-foreground">
        You are viewing <span className="font-medium text-foreground">sample {dataType}</span>. Sign in to create your own workspace and start adding your own data.
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <Button asChild size="sm" variant="default" className="shrink-0">
          <Link href="/auth/login">Log in</Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="shrink-0 bg-transparent">
          <Link href="/auth/sign-up">Sign up free</Link>
        </Button>
      </div>
    </div>
  )
}

interface EmptyUserBannerProps {
  dataType: string
  actionLabel?: string
}

export function EmptyUserBanner({ dataType, actionLabel }: EmptyUserBannerProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
      <Info className="h-4 w-4 shrink-0 text-primary" />
      <p className="flex-1 text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">demo {dataType}</span> to get you started.
        {actionLabel ? ` ${actionLabel} to see your own data here.` : " Add your own to replace this."}
      </p>
    </div>
  )
}
