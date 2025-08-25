"use client"

import type React from "react"

import { AuthProvider } from "@/components/auth/auth-context"

export default function RevendedorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthProvider>{children}</AuthProvider>
}
