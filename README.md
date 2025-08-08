# ProofMint — Gasless "Proof of Accomplishment" NFTs on Base (Pinata)

## Quickstart
```bash
npm install
cp .env.example .env.local
# fill keys (see below)
npm run deploy:sepolia
# copy printed address to NEXT_PUBLIC_PROOFMINT_CONTRACT in .env.local
npm run dev
# open http://localhost:3010
```

## Minimal keys you must paste
- `NEXT_PUBLIC_CDP_API_KEY` — CDP OnchainKit client key
- `NEXT_PUBLIC_PAYMASTER_AND_BUNDLER_ENDPOINT` — CDP Paymaster URL (Base Sepolia)
- `NEXT_PUBLIC_WC_PROJECT_ID` — WalletConnect Project ID
- `NEXT_PUBLIC_CHAIN_ID=84532` — keep Sepolia for dev
- `NEXT_PUBLIC_PROOFMINT_CONTRACT` — set after deploy
- **Pinata auth**: either `PINATA_JWT` (recommended) **or** `PINATA_API_KEY` + `PINATA_SECRET`
- `DEPLOYER_PRIVATE_KEY` — test wallet for deploy (use Base Sepolia faucet)

## What happens
- Client hashes your proof (file or text) with SHA-256
- `/api/ipfs` pins optional image (pinFileToIPFS) and JSON metadata (pinJSONToIPFS) to Pinata
- `/api/tx` builds a sponsored call to `mintWithURI(0x0, uri)`
- Contract mints to `msg.sender` when `to == 0x0`

## Verify
Visit `/verify` to recompute the hash and compare to the NFT's `ProofHash` attribute.

## Notes
- Gasless via OnchainKit `Transaction` with `isSponsored` and your Paymaster
- For production: change `NEXT_PUBLIC_CHAIN_ID=8453` and deploy with `npm run deploy:mainnet`
