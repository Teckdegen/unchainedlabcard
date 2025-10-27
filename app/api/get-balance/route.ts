import { type NextRequest, NextResponse } from "next/server"
import { getCardDetails } from "@/lib/cashwrye"

export async function POST(req: NextRequest) {
  try {
    const { cardCode, customerEmail } = await req.json()

    if (!cardCode || !customerEmail) {
      return NextResponse.json({ error: "cardCode and customerEmail are required" }, { status: 400 })
    }

    const result = await getCardDetails(cardCode, customerEmail)

    if (!result.success || !result.data || result.data.length === 0) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 })
    }

    const card = result.data[0]

    return NextResponse.json({
      success: true,
      balance: card.cardBalance,
      balanceInfo: card.cardBalanceInfo,
      status: card.status,
      currency: "USD",
      cardNumber: card.cardNumberMaxked,
      last4: card.last4,
      expiryDate: card.validMonthYear,
    })
  } catch (error) {
    console.error("Get balance error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
