"use client"

import { Card } from "./ui/Card"
import { format } from "date-fns"
import { ArrowUp, ArrowDown } from "lucide-react"

interface CashwyreTransaction {
  id: string
  description: string
  amount: number
  amountInfo: string
  type: "DR" | "CR"
  status: string
  date: string
  reference: string
  category: string
  fee: number
  feeInfo: string
}

interface TransactionsListProps {
  transactions: CashwyreTransaction[]
  isLoading?: boolean
}

export function TransactionsList({ transactions, isLoading = false }: TransactionsListProps) {
  return (
    <Card className="bg-black/40 backdrop-blur-md border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">Recent Transactions</h3>

      <div className="max-h-96 overflow-y-auto space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-gray-300/20 rounded animate-pulse" />)
        ) : transactions.length === 0 ? (
          <p className="text-white/60 text-center py-8">No transactions yet</p>
        ) : (
          transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors border border-white/10"
            >
              <div className="flex items-center gap-3 flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    tx.type === "DR" ? "bg-red-500/20" : "bg-green-500/20"
                  }`}
                >
                  {tx.type === "DR" ? (
                    <ArrowUp size={20} className="text-red-400" />
                  ) : (
                    <ArrowDown size={20} className="text-green-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">{tx.description}</p>
                  <p className="text-xs text-white/50">{format(new Date(tx.date), "MMM dd, yyyy HH:mm")}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p className={`font-bold ${tx.type === "DR" ? "text-red-400" : "text-green-400"}`}>
                  {tx.type === "DR" ? "-" : "+"} {tx.amountInfo}
                </p>
                {tx.fee > 0 && <p className="text-xs text-white/50">Fee: {tx.feeInfo}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
