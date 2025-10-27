"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/db"
import { Card } from "@/components/ui/Card"

export default function Pending() {
  const router = useRouter()

  useEffect(() => {
    const i = setInterval(async () => {
      try {
        const user = await getCurrentUser();
        if (user?.card_code) {
          clearInterval(i);
          router.push('/dashboard');
        }
      } catch (error) {
        console.error("Error checking card status:", error)
      }
    }, 3000);
    return () => clearInterval(i);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center min-h-screen">
      <Card className="max-w-md text-center p-8">
        <div className="mb-6">
          <div className="flex justify-center space-x-2 mt-6">
            <div className="w-3 h-3 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <h2 className="text-2xl font-bold text-dark mb-2">Creating Your Card...</h2>
          <p className="text-dark/60">You'll be redirected automatically when your card is ready.</p>
        </div>
      </Card>
    </div>
  )
}