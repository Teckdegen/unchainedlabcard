# Row Level Security (RLS) Setup Guide

## Overview
This guide explains how to set up Row Level Security (RLS) for the Pepu Card platform on Supabase.

## What is RLS?
Row Level Security is a database security feature that restricts which rows users can access based on policies. This ensures users can only see and modify their own data.

## Tables Protected
- **users**: Users can only view/update their own profile
- **transactions**: Users can only view/update their own transactions
- **card_orders**: Users can only view/update their own card orders

## Setup Instructions

### Step 1: Run the RLS Script
1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of `scripts/rls-policies.sql`
5. Click "Run" to execute the script

### Step 2: Verify RLS is Enabled
In the Supabase dashboard:
1. Go to Authentication → Policies
2. You should see all the policies listed for each table
3. Verify that RLS is enabled (toggle should be ON) for:
   - public.users
   - public.transactions
   - public.card_orders

## How It Works

### For Authenticated Users
- Users can only SELECT, INSERT, and UPDATE their own rows
- The policy checks `user_id = auth.uid()` to ensure data isolation
- Users cannot access other users' data

### For Service Role (API Routes)
- API routes use the service role key (SUPABASE_SERVICE_ROLE_KEY)
- Service role bypasses RLS policies and can perform all operations
- This allows the backend to create users, update card status, etc.

## Development vs Production

### Development
- RLS is enabled but permissive
- Service role can perform all operations
- Good for testing and development

### Production
- Same RLS policies apply
- Ensure SUPABASE_SERVICE_ROLE_KEY is kept secret
- Never expose service role key in client-side code

## Testing RLS

### Test 1: User Can View Own Data
\`\`\`javascript
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId);
// Should return user's own data
\`\`\`

### Test 2: User Cannot View Other's Data
\`\`\`javascript
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', otherUserId);
// Should return empty array or error
\`\`\`

### Test 3: Service Role Can Access All Data
\`\`\`javascript
const { data } = await supabaseServer
  .from('users')
  .select('*');
// Should return all users (server-side only)
\`\`\`

## Troubleshooting

### "Permission denied" Error
- Ensure RLS policies are correctly applied
- Check that the user is authenticated
- Verify the policy conditions match your use case

### API Routes Not Working
- Ensure you're using `supabaseServer` (service role) in API routes
- Check that SUPABASE_SERVICE_ROLE_KEY is set in environment variables
- Verify the policy allows service role operations

### Users Can See Other Users' Data
- Check that the policy condition is `user_id = auth.uid()`
- Ensure RLS is enabled on the table
- Verify the policy is applied to SELECT operations

## Policy Reference

### Users Table
- **SELECT**: `user_id = auth.uid()` - Users see only their own profile
- **INSERT**: `user_id = auth.uid()` - Users can only create their own profile
- **UPDATE**: `user_id = auth.uid()` - Users can only update their own profile

### Transactions Table
- **SELECT**: `user_id = auth.uid()` - Users see only their own transactions
- **INSERT**: `user_id = auth.uid()` - Users can only create their own transactions
- **UPDATE**: `user_id = auth.uid()` - Users can only update their own transactions

### Card Orders Table
- **SELECT**: `user_id = auth.uid()` - Users see only their own card orders
- **INSERT**: `user_id = auth.uid()` - Users can only create their own card orders
- **UPDATE**: `user_id = auth.uid()` - Users can only update their own card orders

## Next Steps
1. Run the RLS script in your Supabase dashboard
2. Test the policies with your application
3. Monitor for any permission-related errors
4. Adjust policies as needed for your use case
