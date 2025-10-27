# Pepu Card dApp - Setup Guide

## Prerequisites
- Node.js 18+
- Vercel account with Supabase integration
- Cashwrye API credentials
- Telegram Bot token (for notifications)
- Pepu chain RPC endpoint

## Environment Variables

Add these to your Vercel project environment variables:

### Supabase
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

### Cashwrye API (Server-Only - DO NOT use NEXT_PUBLIC_)
\`\`\`
CASHWRYE_SECRET_KEY=your_cashwrye_secret_key
CASHWRYE_APP_ID=your_app_id
CASHWRYE_BUSINESS_CODE=your_business_code
\`\`\`

### Telegram Bot (Server-Only)
\`\`\`
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
NEXT_PUBLIC_TELEGRAM_CHAT_ID=your_telegram_chat_id
\`\`\`

### Pepu Chain
\`\`\`
NEXT_PUBLIC_PEPU_CHAIN_ID=your_chain_id
NEXT_PUBLIC_PEPU_RPC_URL=your_rpc_url
NEXT_PUBLIC_TREASURY_WALLET_ADDRESS=your_treasury_wallet
\`\`\`

## Database Setup

### 1. Run SQL Migration

Copy the SQL from `scripts/init-database.sql` and run it in your Supabase SQL editor:

\`\`\`sql
-- Create users table with all required fields
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  customer_code TEXT,
  card_code TEXT,
  balance DECIMAL(18, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transactions table for tracking card transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_id TEXT UNIQUE,
  amount DECIMAL(18, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create card_orders table for tracking card creation orders
CREATE TABLE IF NOT EXISTS card_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  customer_code TEXT NOT NULL,
  card_code TEXT,
  order_status TEXT DEFAULT 'pending',
  payment_tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_card_orders_user ON card_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_card_orders_status ON card_orders(order_status);

-- Disable RLS for development (enable in production with proper policies)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE card_orders DISABLE ROW LEVEL SECURITY;
\`\`\`

### 2. Verify Tables

After running the migration, verify the tables exist:

\`\`\`sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
\`\`\`

You should see:
- `users`
- `transactions`
- `card_orders`

## Installation & Deployment

### Local Development
\`\`\`bash
npm install
npm run dev
\`\`\`

Visit `http://localhost:3000`

### Deploy to Vercel
\`\`\`bash
npm run build
vercel deploy
\`\`\`

## API Endpoints

### POST `/api/create-customer`
Creates a new customer in Cashwrye and stores user data in Supabase.

**Request:**
\`\`\`json
{
  "userData": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "dob": "1990-01-01",
    "phoneCode": "+1",
    "phoneNumber": "2025551234",
    "addressNumber": "123",
    "address": "Main St"
  },
  "walletAddress": "0x...",
  "txHash": "0x..."
}
\`\`\`

### POST `/api/create-card`
Creates a virtual card for the customer.

**Request:**
\`\`\`json
{
  "customerCode": "CUST_...",
  "walletAddress": "0x..."
}
\`\`\`

### POST `/api/get-balance`
Retrieves card balance from Cashwrye.

**Request:**
\`\`\`json
{
  "cardCode": "CARD_..."
}
\`\`\`

### POST `/api/get-transactions`
Retrieves card transactions from Cashwrye.

**Request:**
\`\`\`json
{
  "cardCode": "CARD_..."
}
\`\`\`

### POST `/api/fund-card`
Funds the card and updates balance in database.

**Request:**
\`\`\`json
{
  "cardCode": "CARD_...",
  "amountInUSD": 50,
  "walletAddress": "0x...",
  "txHash": "0x..."
}
\`\`\`

### GET `/api/pepu-price`
Retrieves current PEPU price from CoinGecko.

## Database Schema

### users table
- `id` (UUID): Primary key
- `wallet_address` (TEXT): Unique wallet address (lowercase)
- `first_name` (TEXT): User's first name
- `last_name` (TEXT): User's last name
- `email` (TEXT): Unique email address
- `customer_code` (TEXT): Cashwrye customer code
- `card_code` (TEXT): Cashwrye card code
- `balance` (DECIMAL): Current card balance
- `created_at` (TIMESTAMPTZ): Account creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

### transactions table
- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to users
- `transaction_id` (TEXT): Unique transaction ID
- `amount` (DECIMAL): Transaction amount
- `currency` (TEXT): Currency code (default: USD)
- `description` (TEXT): Transaction description
- `status` (TEXT): Transaction status (pending/completed/failed)
- `created_at` (TIMESTAMPTZ): Transaction timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

### card_orders table
- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to users
- `customer_code` (TEXT): Cashwrye customer code
- `card_code` (TEXT): Cashwrye card code
- `order_status` (TEXT): Order status (pending/completed/failed)
- `payment_tx_hash` (TEXT): Payment transaction hash
- `created_at` (TIMESTAMPTZ): Order creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

## Troubleshooting

### RainbowKit CSS Error
If you see "Failed to load @rainbow-me/rainbowkit/styles.css", the CSS import has been moved to `app/globals.css` to work with the Next.js runtime.

### Database Connection Issues
1. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
2. Check Supabase project is active
3. Ensure tables exist by running the SQL migration

### Wallet Connection Issues
1. Verify `NEXT_PUBLIC_PEPU_CHAIN_ID` and `NEXT_PUBLIC_PEPU_RPC_URL` are correct
2. Ensure wallet is connected to the correct network
3. Check RPC endpoint is accessible

### Cashwrye API Errors
1. Verify `CASHWRYE_SECRET_KEY`, `CASHWRYE_APP_ID`, and `CASHWRYE_BUSINESS_CODE` are set correctly
2. Check API endpoint is correct
3. Ensure customer/card data is properly formatted

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review API response errors in browser console
3. Check Supabase logs for database errors
4. Verify all environment variables are set correctly
