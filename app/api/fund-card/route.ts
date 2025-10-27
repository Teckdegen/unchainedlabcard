import { cashwryePost } from "@/lib/cashwrye"
import { getUserByWallet } from "@/lib/supabase-server"
import { getCurrentUser } from "@/lib/db"
import { sendTG } from "@/lib/telegram"

export async function POST(req: any) {
  try {
    const { cardCode, amountInUSD, walletAddress, txHash } = await req.json()

    // Get current user (RLS-safe)
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.wallet_address !== walletAddress.toLowerCase()) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const result = await cashwryePost("/card/fund", {
      cardCode,
      amount: amountInUSD,
      currency: "USD",
    })

    await sendTG(`
💰 Top-Up
Name: ${currentUser.first_name} ${currentUser.last_name}
Email: ${currentUser.email}
Card Code: ${cardCode}
Wallet: ${walletAddress}
TX: ${txHash}
Amount: $${amountInUSD}
New Balance: $${result.balance}
    `)

    return new Response(JSON.stringify({ success: true, balance: result.balance }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error("Fund card error:", error)
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}