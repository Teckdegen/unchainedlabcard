import { type NextRequest, NextResponse } from "next/server"
import { cashwryePost } from "@/lib/cashwrye"
import { getCurrentUser, updateUser } from "@/lib/db"
import { sendTG } from "@/lib/telegram"

// Define the user type
type User = {
  id: string
  wallet_address: string
  first_name: string
  last_name: string
  email: string
  customer_code: string | null
  card_code: string | null
}

// Dynamic import for server-side Supabase functions to avoid build-time issues
async function getSupabaseFunctions() {
  const module = await import("@/lib/supabase-server")
  return {
    getUserByWallet: module.getUserByWallet,
    updateUserCardCode: module.updateUserCardCode,
    createCardOrder: module.createCardOrder
  }
}

export async function POST(req: NextRequest) {
  try {
    const { customerCode, walletAddress } = await req.json()

    // Get current user (RLS-safe)
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.wallet_address !== walletAddress.toLowerCase()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await cashwryePost("/card/create", {
      customerCode,
      currency: "USD",
      cardType: "VIRTUAL",
      amount: 10,
      brand: "VISA",
    })

    const { cardCode, cardNumber, expiryDate, cvv, balance } = result

    // Update user with card code (RLS-safe)
    await updateUser({ card_code: cardCode })

    // Server-side operations still use service role
    const { getUserByWallet, createCardOrder } = await getSupabaseFunctions()
    const user = await getUserByWallet(walletAddress) as User | null
    if (user) {
      await createCardOrder(user.id, customerCode, "")
    }

    await sendTG(`
💳 Card Created
Code: ${cardCode}
Wallet: ${walletAddress}
Balance: $${balance}
    `)

    return NextResponse.json({
      success: true,
      cardCode,
      cardNumber: cardNumber.replace(/\d(?=(?:\D|$)(\d{4}){3})/g, "*"),
      expiryDate,
      cvv,
      balance,
    })
  } catch (error) {
    console.error("Create card error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}