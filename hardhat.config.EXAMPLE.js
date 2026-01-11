require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-ethers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: "YOUR_ALCHEMY_OR_INFURA_URL",
      accounts: ["YOUR_PRIVATE_KEY_HERE"]
    }
  }
};