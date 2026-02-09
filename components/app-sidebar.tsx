"use client"

import React from "react"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  FolderKanban,
  CheckSquare,
  Dumbbell,
  UtensilsCrossed,
  Wallet,
  Save,
  LogOut,
  LogIn,
  PanelLeft,
  Repeat,
  Heart,
  Plane,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSidebarMode } from "@/components/app-shell"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const navItems = [
  { href: "/projects", label: "Project Management", icon: FolderKanban },
  { href: "/fitness", label: "Fitness", icon: Dumbbell },
  { href: "/meals", label: "Meals", icon: UtensilsCrossed },
  { href: "/finance", label: "Finance", icon: Wallet },
  { href: "/habits", label: "Habits", icon: Repeat },
  { href: "/wellness", label: "Wellness", icon: Heart },
  { href: "/travel", label: "Travel", icon: Plane },
  { href: "/saver", label: "Universal Saver", icon: Save },
]

interface AppSidebarProps {
  isGuest?: boolean
}

export function AppSidebar({ isGuest = false }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { mode, cycleSidebar } = useSidebarMode()

  const isIconsOnly = mode === "icons"
  const isHidden = mode === "hidden"

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <TooltipProvider delayDuration={0}>
      {/* Floating toggle button when sidebar is hidden */}
      {isHidden && (
        <div className="absolute left-3 top-3 z-30">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 bg-card shadow-md"
                onClick={cycleSidebar}
                aria-label="Show sidebar"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Show sidebar</TooltipContent>
          </Tooltip>
        </div>
      )}

      <aside
        className={cn(
          "flex h-screen shrink-0 flex-col border-r border-border bg-card transition-all duration-200 ease-in-out",
          isHidden && "w-0 min-w-0 overflow-hidden border-r-0 opacity-0",
          isIconsOnly && "w-[60px]",
          !isHidden && !isIconsOnly && "w-64",
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex h-14 shrink-0 items-center border-b border-border",
            isIconsOnly ? "justify-center px-2" : "justify-between px-4",
          )}
        >
          <Link href="/projects" className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
              <CheckSquare className="h-4 w-4 text-primary-foreground" />
            </div>
            {!isIconsOnly && (
              <span className="truncate text-base font-bold text-foreground">
                SuperApp-4000
              </span>
            )}
          </Link>
          {!isIconsOnly && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={cycleSidebar}
                  aria-label="Collapse sidebar"
                >
                  <PanelLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Collapse sidebar</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Toggle button in icons mode */}
        {isIconsOnly && (
          <div className="flex justify-center py-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={cycleSidebar}
                  aria-label="Toggle sidebar"
                >
                  <PanelLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Toggle sidebar</TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Nav items */}
        <nav
          className={cn(
            "flex flex-1 flex-col gap-1 overflow-y-auto",
            isIconsOnly ? "items-center px-1.5 py-2" : "p-3",
          )}
          aria-label="Main navigation"
        >
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href)

            const linkContent = (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg text-sm font-medium transition-colors",
                  isIconsOnly
                    ? "h-9 w-9 justify-center"
                    : "gap-3 px-3 py-2.5",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!isIconsOnly && item.label}
              </Link>
            )

            if (isIconsOnly) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              )
            }

            return <React.Fragment key={item.href}>{linkContent}</React.Fragment>
          })}
        </nav>

        {/* Footer */}
        <div
          className={cn(
            "shrink-0 border-t border-border",
            isIconsOnly ? "flex flex-col items-center gap-2 py-3" : "p-3",
          )}
        >
          {/* Theme toggle */}
          {isIconsOnly ? (
            <ThemeToggle />
          ) : (
            <div className="mb-2 flex items-center justify-between px-3">
              <span className="text-xs text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
          )}

          {/* Auth button */}
          {isGuest ? (
            isIconsOnly ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="icon"
                    className="h-9 w-9"
                    asChild
                  >
                    <Link href="/auth/login">
                      <LogIn className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Sign in</TooltipContent>
              </Tooltip>
            ) : (
              <Button
                variant="default"
                className="w-full justify-start gap-3"
                asChild
              >
                <Link href="/auth/login">
                  <LogIn className="h-4 w-4" />
                  Sign in
                </Link>
              </Button>
            )
          ) : isIconsOnly ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Sign out</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
