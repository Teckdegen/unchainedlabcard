import { createClient } from "@supabase/supabase-js"
import { Database } from "@/types/supabase"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

export const supabaseServer = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Service role functions that bypass RLS (only for server-side operations)
export async function getUserByWallet(walletAddress: string) {
  const { data, error } = await supabaseServer
    .from("users")
    .select("*")
    .eq("wallet_address", walletAddress.toLowerCase())
    .single()

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching user:", error)
  }

  return data
}

export async function createUser(userData: {
  walletAddress: string
  firstName: string
  lastName: string
  email: string
}) {
  const { data, error } = await supabaseServer
    .from("users")
    .insert([
      {
        wallet_address: userData.walletAddress.toLowerCase(),
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Error creating user:", error)
    throw error
  }

  return data
}

export async function updateUserCustomerCode(userId: string, customerCode: string) {
  const { data, error } = await supabaseServer
    .from("users")
    .update({ customer_code: customerCode })
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    console.error("Error updating customer code:", error)
    throw error
  }

  return data
}

export async function updateUserCardCode(userId: string, cardCode: string) {
  const { data, error } = await supabaseServer
    .from("users")
    .update({ card_code: cardCode })
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    console.error("Error updating card code:", error)
    throw error
  }

  return data
}

export async function createCardOrder(userId: string, customerCode: string, txHash: string) {
  const { data, error } = await supabaseServer
    .from("card_orders")
    .insert([
      {
        user_id: userId,
        customer_code: customerCode,
        payment_tx_hash: txHash,
        order_status: "pending",
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Error creating card order:", error)
    throw error
  }

  return data
}

export async function updateCardOrderStatus(orderId: string, status: string, cardCode?: string) {
  const updateData: any = { order_status: status }
  if (cardCode) {
    updateData.card_code = cardCode
  }

  const { data, error } = await supabaseServer
    .from("card_orders")
    .update(updateData)
    .eq("id", orderId)
    .select()
    .single()

  if (error) {
    console.error("Error updating card order:", error)
    throw error
  }

  return data
}

export async function getCardOrderByCustomerCode(customerCode: string) {
  const { data, error } = await supabaseServer
    .from("card_orders")
    .select("*")
    .eq("customer_code", customerCode)
    .single()

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching card order:", error)
  }

  return data
}