import { NextRequest, NextResponse } from 'next/server';
import { cashwryePost } from "@/lib/cashwrye"
import { updateUser } from "@/lib/db"
import { getCurrentUser } from "@/lib/db"
import { sendTG } from "@/lib/telegram"

export async function POST(req: NextRequest) {
  try {
    const { userData, walletAddress, txHash } = await req.json()

    // Get user (RLS-safe)
    const user = await getCurrentUser();
    if (!user || user.wallet_address !== walletAddress.toLowerCase()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await cashwryePost("/customer/create", {
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      dob: userData.dob,
      phoneNumber: `${userData.phoneCode}${userData.phoneNumber}`,
      address: `${userData.addressNumber} ${userData.address}`,
    })

    const { customerCode } = result

    // Update user with customer code (RLS-safe)
    await updateUser({ customer_code: customerCode })

    await sendTG(`
💳 New Pepu Card Registration
Name: ${user.first_name} ${user.last_name}
Email: ${user.email}
Phone: ${userData.phoneCode}${userData.phoneNumber}
DOB: ${userData.dob}
Address: ${userData.addressNumber} ${userData.address}
Wallet: ${walletAddress}
TX Hash: ${txHash}
Customer Code: ${customerCode}
    `)

    return NextResponse.json({ success: true, customerCode })
  } catch (error) {
    console.error("Create customer error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}