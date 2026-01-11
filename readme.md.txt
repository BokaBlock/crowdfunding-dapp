#  Crowdfunding DApp

Decentralized crowdfunding platform built on Ethereum blockchain. Create campaigns, contribute ETH, and automatically handle refunds or withdrawals based on campaign success.

![Crowdfunding DApp](screenshots/homepage.png)

##  Features

- **Create Campaigns** - Set funding goals and deadlines
- **Contribute ETH** - Support campaigns with cryptocurrency
- **Automatic Refunds** - Get your money back if goal not reached
- **Withdraw Funds** - Campaign creators can withdraw when successful
- **Real-time Updates** - Live campaign progress tracking
- **Secure** - Smart contract enforced rules and transparency

##  Tech Stack

**Smart Contract:**
- Solidity 0.8.20
- Hardhat (testing & deployment)
- OpenZeppelin patterns

**Frontend:**
- HTML5 / CSS3 / JavaScript
- Ethers.js v5
- Tailwind CSS
- MetaMask integration

**Network:**
- Sepolia Testnet

## Smart Contract

**Contract Address:** `0x3bF664d5989C2a671E721696a11f74Da3FB7aF34`

**View on Etherscan:** [Sepolia Etherscan](https://sepolia.etherscan.io/address/0x3bF664d5989C2a671E721696a11f74Da3FB7aF34)

### Contract Functions:
- `createCampaign(uint256 _goal, uint256 _deadline)` - Create new campaign
- `contribute(uint256 _campaignId)` - Contribute ETH to campaign
- `withdrawFunds(uint256 _campaignId)` - Withdraw funds (creator only, if successful)
- `refund(uint256 _campaignId)` - Get refund (if campaign failed)

##  Local Setup

### Prerequisites
```bash
node >= 16.0.0
npm >= 8.0.0
MetaMask browser extension
```

### Installation

1. **Clone repository:**
```bash
git clone https://github.com/YOUR_USERNAME/crowdfunding-dapp.git
cd crowdfunding-dapp
```

2. **Install dependencies:**
```bash
npm install
```

3. **Compile contracts:**
```bash
npx hardhat compile
```

4. **Run tests:**
```bash
npx hardhat test
```

5. **Deploy to Sepolia (optional):**
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

6. **Open frontend:**
```bash
# Simply open index.html in browser
# Or use Live Server extension in VS Code
```

## 📖 How to Use

### For Contributors:

1. **Connect Wallet** - Click "Connect Wallet" and approve MetaMask
2. **Browse Campaigns** - View all active campaigns
3. **Select Campaign** - Click on a campaign to see details
4. **Contribute** - Enter amount and confirm transaction
5. **Track Progress** - See real-time funding progress
6. **Get Refund** - If campaign fails, claim your refund

### For Campaign Creators:

1. **Create Campaign** - Click "Create" in navigation
2. **Set Goal** - Enter funding goal in ETH
3. **Set Duration** - Choose campaign duration in days
4. **Submit** - Confirm transaction to deploy campaign
5. **Share** - Share campaign ID with supporters
6. **Withdraw** - Claim funds when goal reached after deadline

##  Testing

Test suite includes 22 comprehensive tests:
```bash
npx hardhat test
```

**Test Coverage:**
-  Campaign creation
-  Contribution handling
-  Withdrawal functionality
-  Refund mechanism
-  Access control
-  Edge cases & security

All tests passing: **22/22** 

##  Security Features

- **Checks-Effects-Interactions** pattern
- **Reentrancy protection**
- **Access control** (creator-only withdrawal)
- **Automatic refunds** for failed campaigns
- **Time-locked** withdrawals
- **Transparent** on-chain logic

##  What I Learned

Building this project taught me:

- Smart contract development with Solidity
- Writing comprehensive test suites
- Deploying to Ethereum testnets
- Web3 integration with Ethers.js
- Handling blockchain transactions in frontend
- Security patterns (CEI, reentrancy protection)
- Event-driven architecture
- Async/await patterns in JavaScript

##  Future Improvements

- [ ] Campaign categories/tags
- [ ] Campaign descriptions & images
- [ ] Milestone-based funding
- [ ] Social features (comments, updates)
- [ ] Multi-chain support
- [ ] IPFS integration for media
- [ ] Mobile-responsive improvements
- [ ] React migration

##  License

MIT License - feel free to use this project for learning!

##  Author

**BokaBlock**
- GitHub: [@BokaBlock](https://github.com/BokaBlock)


##  Acknowledgments

- Ethereum & Solidity documentation
- Hardhat framework
- OpenZeppelin contracts
- Web3 community


**Built with Love by a blockchain developer**
