"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { AuthGateProvider } from "@/components/auth-gate"
import { useIsMobile } from "@/hooks/use-mobile"

export type SidebarMode = "expanded" | "icons" | "hidden"

interface SidebarContextValue {
  mode: SidebarMode
  setMode: (mode: SidebarMode) => void
  cycleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

export function useSidebarMode() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error("useSidebarMode must be used within AppShell")
  return ctx
}

const STORAGE_KEY = "sidebar-mode"
const CYCLE_ORDER: SidebarMode[] = ["expanded", "icons", "hidden"]

interface AppShellProps {
  isGuest: boolean
  children: React.ReactNode
}

export function AppShell({ isGuest, children }: AppShellProps) {
  const isMobile = useIsMobile()
  const [mode, setModeState] = useState<SidebarMode>("expanded")
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as SidebarMode | null
    if (stored && CYCLE_ORDER.includes(stored)) {
      setModeState(stored)
    }
    setHydrated(true)
  }, [])

  // On mobile, default to icons mode unless user explicitly chose hidden
  useEffect(() => {
    if (hydrated && isMobile && mode === "expanded") {
      setModeState("icons")
    }
  }, [isMobile, hydrated, mode])

  const setMode = useCallback((newMode: SidebarMode) => {
    setModeState(newMode)
    localStorage.setItem(STORAGE_KEY, newMode)
  }, [])

  const cycleSidebar = useCallback(() => {
    const currentIndex = CYCLE_ORDER.indexOf(mode)
    const nextIndex = (currentIndex + 1) % CYCLE_ORDER.length
    setMode(CYCLE_ORDER[nextIndex])
  }, [mode, setMode])

  // Keyboard shortcut: Ctrl/Cmd + B
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "b" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        cycleSidebar()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [cycleSidebar])

  return (
    <AuthGateProvider isGuest={isGuest}>
      <SidebarContext.Provider value={{ mode, setMode, cycleSidebar }}>
        <div className="flex h-screen flex-col overflow-hidden">
          <div className="flex flex-1 overflow-hidden">
            <AppSidebar isGuest={isGuest} />
            <main className="flex-1 overflow-y-auto">
              <div className="w-full max-w-6xl">
                {children}
              </div>
            </main>
          </div>
        </div>
      </SidebarContext.Provider>
    </AuthGateProvider>
  )
}
