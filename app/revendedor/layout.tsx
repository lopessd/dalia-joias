"use client"

import type React from "react"
import { RouteGuard } from "@/components/auth/route-guard"

export default function RevendedorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RouteGuard allowedRoles={["revendedor"]}>
      {children}
    </RouteGuard>
  )
}
