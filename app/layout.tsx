import type React from "react"

import "./globals.css"
import { Toaster } from "react-hot-toast"
import { Web3Provider } from "@/components/Web3Provider"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>
          <main className="min-h-screen">{children}</main>
          <Toaster position="top-right" />
        </Web3Provider>
      </body>
    </html>
  )
}

export const metadata = {
  generator: 'v0.app'
};