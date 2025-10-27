import { createConfig, http } from "wagmi"
import { defineChain } from "viem"

const pepuChain = defineChain({
  id: Number(process.env.NEXT_PUBLIC_PEPU_CHAIN_ID || "12345"),
  name: "Pepu",
  nativeCurrency: {
    name: "PEPU",
    symbol: "PEPU",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_PEPU_RPC_URL || "https://rpc.pepu.chain"],
    },
  },
})

export const wagmiConfig = createConfig({
  chains: [pepuChain],
  transports: {
    [pepuChain.id]: http(process.env.NEXT_PUBLIC_PEPU_RPC_URL),
  },
  // Disable storage on server-side to prevent functions from being passed to Client Components
  storage: typeof window !== 'undefined' ? undefined : null,
})

export { pepuChain }