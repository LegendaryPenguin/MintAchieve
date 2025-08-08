require('dotenv').config({ path: '.env.local' });
const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const pk = process.env.DEPLOYER_PRIVATE_KEY;
  if (!pk || !pk.startsWith('0x') || pk.length !== 66) {
    throw new Error("DEPLOYER_PRIVATE_KEY missing/invalid. Put 0x + 64 hex chars in .env.local");
  }

  // Build signer explicitly so we don't rely on accounts[] in config
  const wallet = new ethers.Wallet(pk, ethers.provider);
  console.log("Deploying with:", await wallet.getAddress());

  const ProofMint = await ethers.getContractFactory("ProofMint", wallet);
  const contract = await ProofMint.deploy("ProofMint", "PMINT");

  // ethers v6: wait for deployment + read address
  await contract.waitForDeployment();
  const addr = await contract.getAddress();
  console.log("ProofMint deployed to:", addr);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
