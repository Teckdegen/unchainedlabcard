"use client"

import { useEffect, useState } from "react"
import { useAccount, useDisconnect, useSendTransaction, useWaitForTransactionReceipt } from "wagmi"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import toast from "react-hot-toast"
import { parseEther } from "viem"
import { getCurrentUser } from "@/lib/db"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/Input"
import { BalanceCard } from "@/components/BalanceCard"
import { VirtualCard } from "@/components/VirtualCard"
import { TransactionsList } from "@/components/TransactionsList"
import { LogOut } from "lucide-react"
import { CONFIG } from "@/lib/config"

export default function Dashboard() {
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userLoading, setUserLoading] = useState(true)
  const { sendTransaction } = useSendTransaction()
  const [topUpAmount, setTopUpAmount] = useState("")
  const [txHash, setTxHash] = useState<string | null>(null)
  const [isTopUpLoading, setIsTopUpLoading] = useState(false)

  const { data: priceData } = useSWR("/api/pepu-price", async (url) => {
    const res = await fetch(url)
    return res.json()
  })

  const {
    data: balanceData,
    isLoading: balanceLoading,
    mutate: mutateBalance,
  } = useSWR(user?.card_code ? `/api/get-balance?cardCode=${user.card_code}&email=${user.email}` : null, async () => {
    const res = await fetch("/api/get-balance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardCode: user?.card_code,
        customerEmail: user?.email,
      }),
    })
    return res.json()
  })

  const { data: transactionsData, isLoading: txLoading } = useSWR(
    user?.card_code ? `/api/get-transactions?cardCode=${user.card_code}&email=${user.email}` : null,
    async () => {
      const res = await fetch("/api/get-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardCode: user?.card_code,
          customerEmail: user?.email,
        }),
      })
      return res.json()
    },
  )

  const { isSuccess } = useWaitForTransactionReceipt({
    hash: txHash ? (txHash as `0x${string}`) : undefined,
  })

  // Fetch user with RLS
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        if (!currentUser?.card_code) {
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setUserLoading(false);
      }
    };

    if (!address) {
      router.push("/");
    } else {
      fetchUser();
    }
  }, [address, router]);

  useEffect(() => {
    if (isSuccess && txHash) {
      handleFundCard()
    }
  }, [isSuccess, txHash])

  const handleFundCard = async () => {
    try {
      const res = await fetch("/api/fund-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardCode: user?.card_code,
          amountInUSD: Number.parseFloat(topUpAmount),
          walletAddress: address,
          txHash,
        }),
      })

      if (res.ok) {
        toast.success("Card funded successfully!")
        setTopUpAmount("")
        setTxHash(null)
        mutateBalance()
      }
    } catch (error) {
      toast.error("Failed to fund card")
      console.error(error)
    } finally {
      setIsTopUpLoading(false)
    }
  }

  const handleTopUp = async () => {
    const amount = Number.parseFloat(topUpAmount)
    if (amount < CONFIG.MINIMUM_TOPUP_AMOUNT) {
      toast.error(`Minimum top-up is $${CONFIG.MINIMUM_TOPUP_AMOUNT}`)
      return
    }

    if (!priceData?.pepu) {
      toast.error("Unable to calculate PEPU amount")
      return
    }

    try {
      setIsTopUpLoading(true)
      const totalAmount = CONFIG.getTotalAmountWithFee(amount);
      const pepuNeeded = (totalAmount / priceData.pepu).toFixed(0)

      const result = await sendTransaction({
        to: process.env.NEXT_PUBLIC_TREASURY_WALLET_ADDRESS as `0x${string}`,
        value: parseEther(pepuNeeded),
      })

      setTxHash(result.hash || result) // Handle both string and object returns
      toast.success("Top-up payment sent!")
    } catch (error) {
      toast.error("Top-up failed")
      console.error(error)
      setIsTopUpLoading(false)
    }
  }

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
      </div>
    )
  }

  if (!user?.card_code) {
    return null
  }

  return (
    <div className="min-h-screen p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-4aEHQZGC4QdzllME4riED3sDGlz7cN.png"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 flex justify-between items-center relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">Dashboard</h1>
          <p className="text-white/70 drop-shadow-lg">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            disconnect()
            router.push("/")
          }}
          className="gap-2"
        >
          <LogOut size={20} />
          Logout
        </Button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {/* Balance Card */}
        <BalanceCard
          balance={balanceData?.balance || 0}
          status={balanceData?.status || "ACTIVE"}
          isLoading={balanceLoading}
        />

        {/* Virtual Card */}
        <VirtualCard
          cardNumber={balanceData?.cardNumber || "****"}
          cardNumberMasked={balanceData?.cardNumber || "****"}
          expiryDate={balanceData?.expiryDate || "XX/XX"}
          cvv="***"
          balance={balanceData?.balance || 0}
          balanceInfo={balanceData?.balanceInfo || "$0.00"}
          last4={balanceData?.last4 || "****"}
        />

        {/* Top-Up Section */}
        <Card className="bg-black/40 backdrop-blur-md border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Top-Up Your Card</h3>
          <div className="space-y-4">
            <Input
              label={`Amount (USD) - Minimum $${CONFIG.MINIMUM_TOPUP_AMOUNT}`}
              type="number"
              min={CONFIG.MINIMUM_TOPUP_AMOUNT}
              step="0.01"
              placeholder={`${CONFIG.MINIMUM_TOPUP_AMOUNT}.00`}
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
            />
            <div className="bg-green-400/10 p-3 rounded-lg border border-green-400/20">
              <p className="text-sm text-white/70">
                {topUpAmount && priceData?.pepu
                  ? `${(CONFIG.getTotalAmountWithFee(Number.parseFloat(topUpAmount)) / priceData.pepu).toFixed(0)} PEPU`
                  : `Enter amount (minimum $${CONFIG.MINIMUM_TOPUP_AMOUNT})`}
              </p>
            </div>
            <Button
              onClick={handleTopUp}
              disabled={isTopUpLoading || !topUpAmount || Number.parseFloat(topUpAmount) < CONFIG.MINIMUM_TOPUP_AMOUNT}
              className="w-full"
            >
              {isTopUpLoading ? "Processing..." : "Top-Up with Wallet"}
            </Button>
          </div>
        </Card>

        {/* Transactions */}
        <TransactionsList transactions={transactionsData?.transactions || []} isLoading={txLoading} />
      </div>
    </div>
  )
}