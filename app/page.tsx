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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  CreditCard, 
  Loader2, 
  ShieldCheck, 
  Globe, 
  Wallet, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  ChevronRight,
  Sparkles
} from "lucide-react"
import { getCurrentUser, insertUser } from "@/lib/db"
import { CONFIG } from "@/lib/config"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

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
      
      // Calculate amounts
      const subtotal = CONFIG.INSURANCE_FEE + CONFIG.CARD_BALANCE;
      const processingFee = subtotal * CONFIG.PROCESSING_FEE_PERCENTAGE;
      const totalAmount = CONFIG.getTotalPaymentAmount();
      const pepuNeeded = (totalAmount / priceData.pepu).toFixed(0)

      // Show payment summary
      toast.success("Processing payment...", {
        duration: 3000,
        icon: '💳',
      });

      const result: any = await sendTransaction({
        to: process.env.NEXT_PUBLIC_TREASURY_WALLET_ADDRESS as `0x${string}`,
        value: parseEther(pepuNeeded),
      })

      // Handle both string and object returns
      const txHash = typeof result === 'string' ? result : result?.hash;
      setTxHash(txHash || null);
      
      if (txHash) {
        toast.success((t) => (
          <div className="space-y-2">
            <p>Payment submitted!</p>
            <p className="text-sm">Transaction: {txHash.substring(0, 10)}...{txHash.substring(txHash.length - 4)}</p>
          </div>
        ), { duration: 5000 });
      } else {
        throw new Error("No transaction hash received");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsPaymentLoading(false);
    }
  }

  if (!address) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-950">
        <div className="absolute inset-0 bg-grid-white/[0.05]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto w-full px-4">
          <div className="flex flex-col items-center justify-center space-y-8">
            <div className="animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
                <ShieldCheck className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-green-500 mb-4">
                Pepe Unchained V2
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Securely manage your PEPU tokens with our decentralized virtual card platform
              </p>
            </div>

            <Card className="w-full max-w-md bg-background/80 backdrop-blur-sm border-border/50 shadow-xl">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Connect Your Wallet</CardTitle>
                <CardDescription className="text-muted-foreground">
                  To get started with Pepe Card, connect your wallet
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex justify-center">
                  <ConnectButton 
                    label="Connect Wallet" 
                    showBalance={false}
                    accountStatus="address"
                    chainStatus="none"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-8">
              {[
                {
                  icon: <Wallet className="w-6 h-6 text-primary" />,
                  title: "Secure Wallet",
                  description: "Connect your existing wallet with full control over your assets"
                },
                {
                  icon: <Globe className="w-6 h-6 text-primary" />,
                  title: "Global Payments",
                  description: "Spend your PEPU anywhere that accepts card payments"
                },
                {
                  icon: <ShieldCheck className="w-6 h-6 text-primary" />,
                  title: "DeFi Ready",
                  description: "Seamlessly integrate with the decentralized finance ecosystem"
                }
              ].map((feature, index) => (
                <Card key={index} className="p-6 bg-background/50 backdrop-blur-sm border-border/30">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {feature.icon}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (userLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your account...</p>
        </div>
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

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center flex-1">
                <div 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2",
                    currentStep >= step 
                      ? "bg-primary border-primary text-primary-foreground" 
                      : "border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  {step}
                </div>
                <span className="mt-2 text-sm text-muted-foreground">
                  {step === 1 ? "Verify" : step === 2 ? "Pay" : "Complete"}
                </span>
              </div>
            ))}
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </div>

        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {!showForm 
                ? "Get Your PEPU Card" 
                : "Complete Your Profile"}
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              {!showForm 
                ? "Fund with PEPU. Spend anywhere."
                : "We need a few details to verify your identity"}
            </p>
          </div>

          {!showForm ? (
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center space-y-1">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">PEPU Virtual Card</CardTitle>
                <CardDescription>
                  Get your virtual card in minutes and start spending your PEPU anywhere
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-6">
                  <div className="rounded-lg border p-4 bg-muted/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                        <p className="text-sm text-muted-foreground">Insurance Fee</p>
                      </div>
                      <p className="text-sm font-medium">${CONFIG.INSURANCE_FEE}.00</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4 text-blue-500" />
                        <p className="text-sm text-muted-foreground">Initial Card Balance</p>
                      </div>
                      <p className="text-sm font-medium">+ ${CONFIG.CARD_BALANCE}.00</p>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Subtotal</p>
                        <p className="font-medium">${(CONFIG.INSURANCE_FEE + CONFIG.CARD_BALANCE).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <p className="text-muted-foreground">Processing ({CONFIG.PROCESSING_FEE_PERCENTAGE * 100}%)</p>
                        <p>+ ${((CONFIG.INSURANCE_FEE + CONFIG.CARD_BALANCE) * CONFIG.PROCESSING_FEE_PERCENTAGE).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Total in PEPU</p>
                        <p className="text-xl font-bold text-primary">
                          {priceData?.pepu 
                            ? `${(CONFIG.getTotalPaymentAmount() / priceData.pepu).toFixed(0)} PEPU`
                            : <Loader2 className="h-5 w-5 animate-spin" />}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      size="lg" 
                      onClick={() => setShowForm(true)}
                      className="w-full"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      By continuing, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <OnboardingForm onSubmit={handleFormSubmit} />

              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center">
                        <ShieldCheck className="h-4 w-4 mr-2 text-green-500" />
                        Insurance Fee
                      </span>
                      <span>${CONFIG.INSURANCE_FEE}.00</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 text-blue-500" />
                        Initial Card Balance
                      </span>
                      <span>${CONFIG.CARD_BALANCE}.00</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${(CONFIG.INSURANCE_FEE + CONFIG.CARD_BALANCE).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Processing Fee ({CONFIG.PROCESSING_FEE_PERCENTAGE * 100}%)
                      </span>
                      <span>${((CONFIG.INSURANCE_FEE + CONFIG.CARD_BALANCE) * CONFIG.PROCESSING_FEE_PERCENTAGE).toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-border my-2" />
                    <div className="flex items-center justify-between font-medium">
                      <span>Total</span>
                      <div className="text-right">
                        <p className="text-lg">${CONFIG.getTotalAmountWithFee(CONFIG.CARD_CREATION_AMOUNT).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {priceData?.pepu 
                            ? `${(CONFIG.getTotalAmountWithFee(CONFIG.CARD_CREATION_AMOUNT) / priceData.pepu).toFixed(0)} PEPU`
                            : ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    size="lg" 
                    onClick={handlePay} 
                    disabled={isPaymentLoading}
                    className="w-full mt-4"
                  >
                    {isPaymentLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Pay with Wallet
                        <Wallet className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    <span>Secure payment processing</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}