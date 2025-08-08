const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const ProofMint = await ethers.getContractFactory("ProofMint");
  const contract = await ProofMint.deploy("ProofMint", "PMINT");
  await contract.deployed();

  console.log("ProofMint deployed to:", contract.address);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
