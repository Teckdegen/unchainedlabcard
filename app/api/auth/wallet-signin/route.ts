import { NextRequest, NextResponse } from 'next/server';
import { recoverMessageAddress } from 'viem';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function POST(req: NextRequest) {
  const { wallet_address, signature, message = 'Sign-in to Pepu Card' } = await req.json();

  // 1. Verify signature
  const recovered = await recoverMessageAddress({
    message,
    signature: signature as `0x${string}`,
  });

  if (recovered.toLowerCase() !== wallet_address.toLowerCase()) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // 2. Issue JWT (sub = wallet_address)
  const jwt = await new SignJWT({ sub: wallet_address.toLowerCase() })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30m')
    .sign(JWT_SECRET);

  // 3. Set cookie
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: 'sb-access-token',
    value: jwt,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 60,
  });

  return response;
}