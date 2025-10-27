"use client"

import { useState, useEffect } from "react"
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import toast from "react-hot-toast"
import { parseEther } from "viem"
import { OnboardingForm } from "@/components/OnboardingForm"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getCurrentUser, insertUser } from "@/lib/db"
import { CONFIG } from "@/lib/config"

export default function Landing() {
  const { address } = useAccount()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userLoading, setUserLoading] = useState(true)
  const { sendTransaction } = useSendTransaction()
  const [txHash, setTxHash] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)

  const { data: priceData } = useSWR("/api/pepu-price", async (url) => {
    const res = await fetch(url)
    return res.json()
  })

  const { isSuccess } = useWaitForTransactionReceipt({
    hash: txHash ? (txHash as `0x${string}`) : undefined,
  })

  // 1. Sign in + check user
  useEffect(() => {
    if (!address) return;
    (async () => {
      setUserLoading(true)
      try {
        // Call wallet sign-in API
        await fetch('/api/auth/wallet-signin', {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            wallet_address: address, 
            signature: 'temp', 
            message: 'temp' 
          }),
        });
        
        // Get current user (RLS-safe)
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        
        if (currentUser?.card_code) {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error during sign-in:', error);
      } finally {
        setUserLoading(false);
      }
    })();
  }, [address]);

  useEffect(() => {
    if (isSuccess && txHash) {
      handleCreateCustomer()
    }
  }, [isSuccess, txHash])

  const handleCreateCustomer = async () => {
    try {
      const formData = JSON.parse(localStorage.getItem("formData") || "{}")

      const res = await fetch("/api/create-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userData: formData,
          walletAddress: address,
          txHash,
        }),
      })

      const { customerCode } = await res.json()

      const cardRes = await fetch("/api/create-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerCode,
          walletAddress: address,
        }),
      })

      if (cardRes.ok) {
        toast.success("Card created! Redirecting...")
        router.push("/pending")
      }
    } catch (error) {
      toast.error("Failed to create card")
      console.error(error)
    } finally {
      setIsPaymentLoading(false)
    }
  }

  const handleFormSubmit = async (data: any) => {
    try {
      await insertUser({
        wallet_address: address!.toLowerCase(),
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
      });
      
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      localStorage.setItem("formData", JSON.stringify(data))
      setShowForm(false)
    } catch (error) {
      toast.error("Failed to save user information")
      console.error(error)
    }
  }

  const handlePay = async () => {
    if (!address || !priceData?.pepu) {
      toast.error("Please connect wallet first")
      return
    }

    try {
      setIsPaymentLoading(true)
      const totalAmount = CONFIG.getTotalAmountWithFee(CONFIG.CARD_CREATION_AMOUNT);
      const pepuNeeded = (totalAmount / priceData.pepu).toFixed(0)

      const result: any = await sendTransaction({
        to: process.env.NEXT_PUBLIC_TREASURY_WALLET_ADDRESS as `0x${string}`,
        value: parseEther(pepuNeeded),
      })

      // Handle both string and object returns
      if (typeof result === 'string') {
        setTxHash(result)
      } else if (result && result.hash) {
        setTxHash(result.hash)
      } else {
        setTxHash(null)
      }
      
      toast.success("Payment sent! Processing...")
    } catch (error) {
      toast.error("Payment failed")
      console.error(error)
      setIsPaymentLoading(false)
    }
  }

  // Test if Tailwind is working
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="min-h-screen bg-red-500 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-blue-600 mb-4">Tailwind CSS Test</h1>
          <p className="text-gray-800 mb-4">If you see this styled correctly, Tailwind is working.</p>
          <div className="w-16 h-16 bg-green-500 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-4aEHQZGC4QdzllME4riED3sDGlz7cN.png"
            alt="Background"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 text-center max-w-2xl">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">Pepu Card</h1>
          <p className="text-xl text-white/90 mb-8 drop-shadow-lg">Fund with PEPu. Spend Anywhere.</p>

          <Card className="mb-8 bg-black/40 backdrop-blur-md border border-white/20">
            <p className="text-white mb-6">Connect your wallet to get started</p>
            <ConnectButton />
          </Card>
        </div>
      </div>
    )
  }

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
      </div>
    )
  }

  if (user?.card_code) {
    return null
  }

  // Show onboarding form if user exists but hasn't completed onboarding
  if (user && !showForm) {
    setShowForm(true);
  }

  return (
    <div className="min-h-screen p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-4aEHQZGC4QdzllME4riED3sDGlz7cN.png"
          alt="Background"
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error("Background image failed to load:", e);
            // Fallback background color
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement!.style.backgroundColor = '#000';
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">Get Your Card in 2 Minutes</h1>
          <p className="text-lg text-white/80 drop-shadow-lg">Complete your profile and make your first payment</p>
        </div>

        {!showForm ? (
          <Card className="max-w-2xl mx-auto text-center bg-black/40 backdrop-blur-md border border-white/20">
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto mb-6 animate-float">
                <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-500 rounded-2xl shadow-2xl flex items-center justify-center">
                  <span className="text-6xl">💳</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Ready to get started?</h2>
              <p className="text-white/70 mb-6">Initial payment: ${CONFIG.CARD_CREATION_AMOUNT} + {CONFIG.PROCESSING_FEE_PERCENTAGE * 100}% fee</p>
              <p className="text-lg font-semibold text-green-400 mb-6">
                {priceData?.pepu ? `${(CONFIG.getTotalAmountWithFee(CONFIG.CARD_CREATION_AMOUNT) / priceData.pepu).toFixed(0)} PEPU` : "Loading..."}
              </p>
              <Button size="lg" onClick={() => setShowForm(true)} className="w-full">
                Continue
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            <OnboardingForm onSubmit={handleFormSubmit} />

            <Card className="max-w-2xl mx-auto bg-black/40 backdrop-blur-md border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Payment Summary</h3>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-white/80">
                  <span>Card Fee:</span>
                  <span>${CONFIG.CARD_CREATION_AMOUNT}.00</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Processing Fee ({CONFIG.PROCESSING_FEE_PERCENTAGE * 100}%):</span>
                  <span>${(CONFIG.CARD_CREATION_AMOUNT * CONFIG.PROCESSING_FEE_PERCENTAGE).toFixed(2)}</span>
                </div>
                <div className="border-t-2 border-green-400/30 pt-2 flex justify-between font-bold text-white">
                  <span>Total:</span>
                  <span>${CONFIG.getTotalAmountWithFee(CONFIG.CARD_CREATION_AMOUNT).toFixed(2)}</span>
                </div>
              </div>

              <Button size="lg" onClick={handlePay} disabled={isPaymentLoading} className="w-full">
                {isPaymentLoading ? "Processing..." : `Pay ${priceData?.pepu ? `${(CONFIG.getTotalAmountWithFee(CONFIG.CARD_CREATION_AMOUNT) / priceData.pepu).toFixed(0)}` : "..."} PEPU with Wallet`}
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}