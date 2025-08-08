'use client';

import { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export default function WalletBar() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);           // avoid SSR/CSR mismatch

  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (!mounted) return null;                       // <- key line

  if (isConnected) {
    return (
      <div className="row">
        <span className="pill">Connected: {address?.slice(0,6)}…{address?.slice(-4)}</span>
        <button className="button" onClick={() => disconnect()}>Disconnect</button>
      </div>
    );
  }

  // MetaMask-only setup: you likely have 1 connector (injected)
  const injected = connectors.find(c => c.id === 'injected') ?? connectors[0];

  return (
    <button
      className="button"
      onClick={() => connect({ connector: injected })}
      disabled={isPending || !injected}
    >
      {injected ? 'Connect MetaMask' : 'Install MetaMask'}
    </button>
  );
}
