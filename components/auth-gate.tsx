"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LogIn, UserPlus, Lock } from "lucide-react"
import Link from "next/link"

interface AuthGateContextValue {
  isGuest: boolean
  /** Call this before any action that requires auth. Returns true if authenticated, false if guest (and shows the dialog). */
  requireAuth: (actionLabel?: string) => boolean
}

const AuthGateContext = createContext<AuthGateContextValue>({
  isGuest: false,
  requireAuth: () => true,
})

export function useAuthGate() {
  return useContext(AuthGateContext)
}

interface AuthGateProviderProps {
  isGuest: boolean
  children: React.ReactNode
}

export function AuthGateProvider({ isGuest, children }: AuthGateProviderProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [actionLabel, setActionLabel] = useState<string | undefined>()

  const requireAuth = useCallback(
    (label?: string) => {
      if (!isGuest) return true
      setActionLabel(label)
      setDialogOpen(true)
      return false
    },
    [isGuest],
  )

  return (
    <AuthGateContext.Provider value={{ isGuest, requireAuth }}>
      {children}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center sm:text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-xl">Sign in to continue</DialogTitle>
            <DialogDescription className="text-balance">
              {actionLabel
                ? `You need an account to ${actionLabel}. Sign in or create a free account to unlock all features.`
                : "You're currently browsing as a guest. Sign in or create a free account to save your data and unlock all features."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-2">
            <Button asChild size="lg">
              <Link href="/auth/login" className="gap-2">
                <LogIn className="h-4 w-4" />
                Sign in
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/sign-up" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Create free account
              </Link>
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground pt-1">
            Your demo preview data is not saved. Sign up to start building your own workspace.
          </p>
        </DialogContent>
      </Dialog>
    </AuthGateContext.Provider>
  )
}
