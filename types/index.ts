export interface User {
  id: string
  wallet_address: string
  first_name: string
  last_name: string
  email: string
  customer_code?: string
  card_code?: string
  created_at: string
}

export interface Transaction {
  id: string
  amount: number
  type: "DR" | "CR"
  description: string
  date: string
}

export interface Card {
  cardCode: string
  cardNumber: string
  expiryDate: string
  cvv: string
  balance: number
  status: string
}
