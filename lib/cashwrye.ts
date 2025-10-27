import { randomUUID } from "crypto"

export const CASHWRYE_BASE = "https://businessapi.cashwyre.com/api/v1.0"

export const CASHWRYE_HEADERS = {
  Authorization: `Bearer ${process.env.CASHWRYE_SECRET_KEY}`,
  "Content-Type": "application/json",
}

export async function cashwryePost(endpoint: string, body: any) {
  const requestId = randomUUID().toString().replace(/-/g, "").slice(0, 32)

  const payload = {
    ...body,
    appId: process.env.CASHWRYE_APP_ID,
    businessCode: process.env.CASHWRYE_BUSINESS_CODE,
    requestId,
  }

  const res = await fetch(`${CASHWRYE_BASE}${endpoint}`, {
    method: "POST",
    headers: CASHWRYE_HEADERS,
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Cashwrye ${res.status}: ${errorText}`)
  }

  return res.json()
}

export async function getCardDetails(cardCode: string, customerEmail: string) {
  return cashwryePost("/CustomerCard/getCards", {
    cardCode,
    customerEmail,
  })
}

export async function getCardTransactions(cardCode: string, customerEmail: string) {
  return cashwryePost("/CustomerCard/getCardTransactions", {
    cardCode,
    customerEmail,
  })
}
