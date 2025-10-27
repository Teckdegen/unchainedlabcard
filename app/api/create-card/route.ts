import { type NextRequest, NextResponse } from "next/server"
import { cashwryePost } from "@/lib/cashwrye"
import { getUserByWallet, updateUserCardCode, createCardOrder } from "@/lib/supabase-server"
import { getCurrentUser, updateUser } from "@/lib/db"
import { sendTG } from "@/lib/telegram"

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
    const user = await getUserByWallet(walletAddress)
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