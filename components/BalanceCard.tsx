"use client"

import { Card } from "./ui/card"
import { Wallet } from "lucide-react"

interface BalanceCardProps {
  balance: number
  status: string
  isLoading?: boolean
}

export function BalanceCard({ balance, status, isLoading = false }: BalanceCardProps) {
  return (
    <Card className="bg-gradient-to-br from-amber-100 to-amber-200/20 border-2 border-amber-300 dark:from-amber-900/30 dark:to-amber-800/20 dark:border-amber-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-foreground/60 text-sm uppercase tracking-wider mb-2">Available Balance</p>
          {isLoading ? (
            <div className="h-8 w-32 bg-gray-300 rounded animate-pulse" />
          ) : (
            <p className="text-4xl font-bold text-foreground">${balance.toFixed(2)}</p>
          )}
          <p className="text-foreground/70 text-sm mt-2">
            Status: <span className="font-semibold text-green-600 dark:text-green-400">{status}</span>
          </p>
        </div>
        <div className="w-16 h-16 bg-amber-300/20 rounded-full flex items-center justify-center dark:bg-amber-700/20">
          <Wallet size={32} className="text-amber-600 dark:text-amber-400" />
        </div>
      </div>
    </Card>
  )
}