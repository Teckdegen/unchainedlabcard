import { type NextRequest, NextResponse } from "next/server"
import { getCardTransactions } from "@/lib/cashwrye"

export async function POST(req: NextRequest) {
  try {
    const { cardCode, customerEmail } = await req.json()

    if (!cardCode || !customerEmail) {
      return NextResponse.json({ error: "cardCode and customerEmail are required" }, { status: 400 })
    }

    const result = await getCardTransactions(cardCode, customerEmail)

    if (!result.success) {
      return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 400 })
    }

    const transactions = (result.data || []).map((tx: any) => ({
      id: tx.code,
      description: tx.description,
      amount: tx.amount,
      amountInfo: tx.amountInfo,
      type: tx.drcr, // DR = debit (outgoing), CR = credit (incoming)
      status: tx.status,
      date: tx.createdOn,
      reference: tx.reference,
      category: tx.category,
      fee: tx.fee,
      feeInfo: tx.feeInfo,
    }))

    return NextResponse.json({
      success: true,
      transactions,
    })
  } catch (error) {
    console.error("Get transactions error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
