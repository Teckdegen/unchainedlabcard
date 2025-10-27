"use client"

import useSWR from "swr"
import { getCurrentUser } from "@/lib/db"

export function useUser(address?: string) {
  const { data, error, isLoading } = useSWR(address ? ["user", address] : null, async () => {
    if (!address) return null
    return await getCurrentUser()
  })

  return { user: data, isLoading, error }
}
