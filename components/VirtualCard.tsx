"use client"

import { useState } from "react"
import { Card } from "./ui/Card"
import { Eye, EyeOff } from "lucide-react"

interface VirtualCardProps {
  cardNumber: string
  cardNumberMasked: string
  expiryDate: string
  cvv: string
  balance: number
  balanceInfo: string
  last4: string
}

export function VirtualCard({
  cardNumber,
  cardNumberMasked,
  expiryDate,
  cvv,
  balance,
  balanceInfo,
  last4,
}: VirtualCardProps) {
  const [showCVV, setShowCVV] = useState(false)

  return (
    <Card variant="dark" className="relative overflow-hidden h-64 flex flex-col justify-between">
      <div className="absolute inset-0">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ax7SBeeNt2ao6E9dhH86Ivy51DaKms.png"
          alt="Card background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-white/80 text-xs uppercase tracking-wider">Card Balance</p>
            <p className="text-3xl font-bold text-green-400">{balanceInfo}</p>
          </div>
          <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center">
            <span className="text-green-400 text-xl font-bold">💳</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 space-y-4">
        <div>
          <p className="text-white/80 text-xs uppercase tracking-wider mb-1">Card Number</p>
          <p className="text-xl font-mono tracking-widest text-white">{cardNumberMasked}</p>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p className="text-white/80 text-xs uppercase tracking-wider mb-1">Expires</p>
            <p className="text-lg font-mono text-white">{expiryDate}</p>
          </div>
          <div className="flex items-center gap-2">
            <div>
              <p className="text-white/80 text-xs uppercase tracking-wider mb-1">CVV</p>
              <p className="text-lg font-mono text-white">{showCVV ? cvv : "***"}</p>
            </div>
            <button
              onClick={() => setShowCVV(!showCVV)}
              className="text-green-400 hover:text-green-300 transition-colors"
            >
              {showCVV ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>
    </Card>
  )
}
