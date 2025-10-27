import { NextResponse } from "next/server"

export async function GET() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=pepu&vs_currencies=usd")
    const data = await res.json()
    return NextResponse.json({ pepu: data.pepu?.usd || 0.01 })
  } catch (error) {
    return NextResponse.json({ pepu: 0.01 }, { status: 500 })
  }
}
