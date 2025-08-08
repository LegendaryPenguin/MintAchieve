'use client';

import { ReactNode } from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { base, baseSepolia } from 'viem/chains';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 84532);
const chain = CHAIN_ID === 8453 ? base : baseSepolia;

const wagmiConfig = createConfig({
  chains: [chain],
  transports: { [chain.id]: http() },
  connectors: [injected({ shimDisconnect: true })], // MetaMask only
});

const queryClient = new QueryClient();

export default function Providers({ children }: { children: ReactNode }) {
  const API_KEY = process.env.NEXT_PUBLIC_CDP_API_KEY!;
  const PAYMASTER_URL = process.env.NEXT_PUBLIC_PAYMASTER_AND_BUNDLER_ENDPOINT!;

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider apiKey={API_KEY} chain={chain} config={{ paymaster: PAYMASTER_URL }}>
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
