const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Crowdfunding contract...\n");
  
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");
  
  // Deploy contract
  console.log("⏳ Deploying contract...");
  const Crowdfunding = await hre.ethers.getContractFactory("Crowdfunding");
  const crowdfunding = await Crowdfunding.deploy();
  
  await crowdfunding.waitForDeployment();
  
  const address = await crowdfunding.getAddress();
  
  console.log("\n✅ Crowdfunding deployed to:", address);
  console.log("\n📋 Contract Info:");
  console.log("   Network:", hre.network.name);
  console.log("   Deployer:", deployer.address);
  console.log("   Contract:", address);
  
  // Save deployment info
  console.log("\n💾 Save this info:");
  console.log("   CONTRACT_ADDRESS=" + address);
  console.log("\n🔗 View on Etherscan:");
  console.log("   https://sepolia.etherscan.io/address/" + address);
  
  console.log("\n🎉 Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });