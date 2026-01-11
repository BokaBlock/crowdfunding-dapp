const hre = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "0x3bF664d5989C2a671E721696a11f74Da3FB7aF34";
  
  console.log("🧪 Testing Crowdfunding on Sepolia...\n");
  
  // Connect to deployed contract
  const crowdfunding = await hre.ethers.getContractAt("Crowdfunding", CONTRACT_ADDRESS);
  
  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 Testing with account:", deployer.address);
  
  // Create test campaign
  console.log("\n📝 Creating test campaign...");
  const currentBlock = await hre.ethers.provider.getBlock("latest");
  const deadline = currentBlock.timestamp + 7 * 24 * 60 * 60; // 7 days
  const goal = hre.ethers.parseEther("1"); // 1 ETH goal
  
  const tx = await crowdfunding.createCampaign(goal, deadline);
  console.log("⏳ Transaction sent:", tx.hash);
  
  await tx.wait();
  console.log("✅ Transaction confirmed!");
  
  // Check campaign
  const campaignCount = await crowdfunding.campaignCount();
  console.log("\n📊 Total campaigns:", campaignCount.toString());
  
  const campaign = await crowdfunding.campaigns(campaignCount);
  console.log("📋 Campaign #" + campaignCount + " details:");
  console.log("   Creator:", campaign.creator);
  console.log("   Goal:", hre.ethers.formatEther(campaign.goal), "ETH");
  console.log("   Deadline:", new Date(Number(campaign.deadline) * 1000).toLocaleString());
  
  console.log("\n🎉 Contract works on Sepolia! ✅");
  console.log("\n🔗 View on Etherscan:");
  console.log("   https://sepolia.etherscan.io/address/" + CONTRACT_ADDRESS);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });