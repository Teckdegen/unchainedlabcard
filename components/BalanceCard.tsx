"use client"

import { Card } from "./ui/Card"
import { Wallet } from "lucide-react"

interface BalanceCardProps {
  balance: number
  status: string
  isLoading?: boolean
}

export function BalanceCard({ balance, status, isLoading = false }: BalanceCardProps) {
  return (
    <Card className="bg-gradient-to-br from-beige to-gold/20 border-2 border-gold">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-dark/60 text-sm uppercase tracking-wider mb-2">Available Balance</p>
          {isLoading ? (
            <div className="h-8 w-32 bg-gray-300 rounded animate-pulse" />
          ) : (
            <p className="text-4xl font-bold text-dark">${balance.toFixed(2)}</p>
          )}
          <p className="text-dark/70 text-sm mt-2">
            Status: <span className="font-semibold text-success">{status}</span>
          </p>
        </div>
        <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center">
          <Wallet size={32} className="text-gold" />
        </div>
      </div>
    </Card>
  )
}
