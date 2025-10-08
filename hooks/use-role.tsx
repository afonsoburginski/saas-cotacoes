"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Role } from "@/lib/types"

interface RoleContextType {
  role: Role
  setRole: (role: Role) => void
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("usuario")

  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>
}

export function useRole() {
  const context = useContext(RoleContext)
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider")
  }
  return context
}
