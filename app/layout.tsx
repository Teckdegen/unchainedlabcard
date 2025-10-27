import type React from "react"

import "./globals.css"
import { WagmiProvider } from "wagmi"
import { RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { Toaster } from "react-hot-toast"
import { wagmiConfig } from "@/lib/wagmi"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <WagmiProvider config={wagmiConfig}>
          <RainbowKitProvider>
            <main className="min-h-screen">{children}</main>
            <Toaster position="top-right" />
          </RainbowKitProvider>
        </WagmiProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.app'
    };
