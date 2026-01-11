const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Crowdfunding", function () {
  let crowdfunding;
  let owner;
  let creator;
  let contributor1;
  let contributor2;
  
  const GOAL = ethers.parseEther("10");
  const CONTRIBUTION = ethers.parseEther("2");
  
  beforeEach(async function () {
    [owner, creator, contributor1, contributor2] = await ethers.getSigners();
    
    const Crowdfunding = await ethers.getContractFactory("Crowdfunding");
    crowdfunding = await Crowdfunding.deploy();
    await crowdfunding.waitForDeployment();
  });
  
  describe("createCampaign", function () {
    it("Should create a campaign with correct details", async function () {
      const currentBlock = await ethers.provider.getBlock("latest");
      const deadline = currentBlock.timestamp + 7 * 24 * 60 * 60;
      
      await crowdfunding.connect(creator).createCampaign(GOAL, deadline);
      
      const campaign = await crowdfunding.campaigns(1);
      
      expect(campaign.creator).to.equal(creator.address);
      expect(campaign.goal).to.equal(GOAL);
      expect(campaign.deadline).to.equal(deadline);
      expect(campaign.amountRaised).to.equal(0);
      expect(campaign.withdrawn).to.equal(false);
    });
    
    it("Should increment campaign count", async function () {
      const currentBlock = await ethers.provider.getBlock("latest");
      const deadline = currentBlock.timestamp + 7 * 24 * 60 * 60;
      
      await crowdfunding.connect(creator).createCampaign(GOAL, deadline);
      expect(await crowdfunding.campaignCount()).to.equal(1);
      
      await crowdfunding.connect(creator).createCampaign(GOAL, deadline);
      expect(await crowdfunding.campaignCount()).to.equal(2);
    });
    
    it("Should emit CampaignCreated event", async function () {
      const currentBlock = await ethers.provider.getBlock("latest");
      const deadline = currentBlock.timestamp + 7 * 24 * 60 * 60;
      
      await expect(crowdfunding.connect(creator).createCampaign(GOAL, deadline))
        .to.emit(crowdfunding, "CampaignCreated")
        .withArgs(1, creator.address, GOAL, deadline);
    });
    
    it("Should revert if goal is 0", async function () {
      const currentBlock = await ethers.provider.getBlock("latest");
      const deadline = currentBlock.timestamp + 7 * 24 * 60 * 60;
      
      await expect(
        crowdfunding.connect(creator).createCampaign(0, deadline)
      ).to.be.revertedWith("Goal must be greater than 0");
    });
    
    it("Should revert if deadline is in the past", async function () {
      const currentBlock = await ethers.provider.getBlock("latest");
      const pastDeadline = currentBlock.timestamp - 1000;
      
      await expect(
        crowdfunding.connect(creator).createCampaign(GOAL, pastDeadline)
      ).to.be.revertedWith("Deadline must be in the future");
    });
  });
  
  describe("contribute", function () {
    let campaignId;
    let deadline;
    
    beforeEach(async function () {
      const currentBlock = await ethers.provider.getBlock("latest");
      deadline = currentBlock.timestamp + 7 * 24 * 60 * 60;
      await crowdfunding.connect(creator).createCampaign(GOAL, deadline);
      campaignId = 1;
    });
    
    it("Should accept contribution", async function () {
      await crowdfunding.connect(contributor1).contribute(campaignId, {value: CONTRIBUTION});
      
      const campaign = await crowdfunding.campaigns(campaignId);
      expect(campaign.amountRaised).to.equal(CONTRIBUTION);
      
      const userContribution = await crowdfunding.contributions(campaignId, contributor1.address);
      expect(userContribution).to.equal(CONTRIBUTION);
    });
    
    it("Should track multiple contributions from same user", async function () {
      await crowdfunding.connect(contributor1).contribute(campaignId, {value: CONTRIBUTION});
      await crowdfunding.connect(contributor1).contribute(campaignId, {value: CONTRIBUTION});
      
      const userContribution = await crowdfunding.contributions(campaignId, contributor1.address);
      expect(userContribution).to.equal(CONTRIBUTION + CONTRIBUTION);
    });
    
    it("Should emit ContributionMade event", async function () {
      await expect(crowdfunding.connect(contributor1).contribute(campaignId, {value: CONTRIBUTION}))
        .to.emit(crowdfunding, "ContributionMade")
        .withArgs(campaignId, contributor1.address, CONTRIBUTION);
    });
    
    it("Should revert if campaign does not exist", async function () {
      await expect(
        crowdfunding.connect(contributor1).contribute(999, {value: CONTRIBUTION})
      ).to.be.revertedWith("Campaign does not exist");
    });
    
    it("Should revert if campaign has ended", async function () {
      await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      
      await expect(
        crowdfunding.connect(contributor1).contribute(campaignId, {value: CONTRIBUTION})
      ).to.be.revertedWith("Campaign has ended");
    });
    
    it("Should revert if contribution is 0", async function () {
      await expect(
        crowdfunding.connect(contributor1).contribute(campaignId, {value: 0})
      ).to.be.revertedWith("Contribution must be greater than 0");
    });
  });
  
  describe("withdrawFunds", function () {
    let campaignId;
    let deadline;
    
    beforeEach(async function () {
      const currentBlock = await ethers.provider.getBlock("latest");
      deadline = currentBlock.timestamp + 7 * 24 * 60 * 60;
      await crowdfunding.connect(creator).createCampaign(GOAL, deadline);
      campaignId = 1;
      
      await crowdfunding.connect(contributor1).contribute(campaignId, {value: ethers.parseEther("6")});
      await crowdfunding.connect(contributor2).contribute(campaignId, {value: ethers.parseEther("5")});
      
      await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
    });
    
    it("Should allow creator to withdraw funds after successful campaign", async function () {
      const creatorBalanceBefore = await ethers.provider.getBalance(creator.address);
      
      const tx = await crowdfunding.connect(creator).withdrawFunds(campaignId);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      
      const creatorBalanceAfter = await ethers.provider.getBalance(creator.address);
      
      const expectedBalance = creatorBalanceBefore + ethers.parseEther("11") - gasUsed;
      expect(creatorBalanceAfter).to.equal(expectedBalance);
      
      const campaign = await crowdfunding.campaigns(campaignId);
      expect(campaign.withdrawn).to.equal(true);
    });
    
    it("Should emit FundsWithdrawn event", async function () {
      await expect(crowdfunding.connect(creator).withdrawFunds(campaignId))
        .to.emit(crowdfunding, "FundsWithdrawn")
        .withArgs(campaignId, creator.address, ethers.parseEther("11"));
    });
    
    it("Should revert if not creator", async function () {
      await expect(
        crowdfunding.connect(contributor1).withdrawFunds(campaignId)
      ).to.be.revertedWith("Only creator can withdraw");
    });
    
    it("Should revert if campaign not ended", async function () {
      const currentBlock = await ethers.provider.getBlock("latest");
      deadline = currentBlock.timestamp + 7 * 24 * 60 * 60;
      await crowdfunding.connect(creator).createCampaign(GOAL, deadline);
      await crowdfunding.connect(contributor1).contribute(2, {value: GOAL});
      
      await expect(
        crowdfunding.connect(creator).withdrawFunds(2)
      ).to.be.revertedWith("Campaign not ended yet");
    });
    
    it("Should revert if goal not reached", async function () {
      const currentBlock = await ethers.provider.getBlock("latest");
      deadline = currentBlock.timestamp + 7 * 24 * 60 * 60;
      await crowdfunding.connect(creator).createCampaign(GOAL, deadline);
      await crowdfunding.connect(contributor1).contribute(2, {value: ethers.parseEther("5")});
      await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      
      await expect(
        crowdfunding.connect(creator).withdrawFunds(2)
      ).to.be.revertedWith("Goal not reached");
    });
    
    it("Should revert if already withdrawn", async function () {
      await crowdfunding.connect(creator).withdrawFunds(campaignId);
      
      await expect(
        crowdfunding.connect(creator).withdrawFunds(campaignId)
      ).to.be.revertedWith("Funds already withdrawn");
    });
  });
  
  describe("refund", function () {
    let campaignId;
    let deadline;
    
    beforeEach(async function () {
      const currentBlock = await ethers.provider.getBlock("latest");
      deadline = currentBlock.timestamp + 7 * 24 * 60 * 60;
      await crowdfunding.connect(creator).createCampaign(GOAL, deadline);
      campaignId = 1;
      
      await crowdfunding.connect(contributor1).contribute(campaignId, {value: ethers.parseEther("3")});
      await crowdfunding.connect(contributor2).contribute(campaignId, {value: ethers.parseEther("2")});
      
      await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
    });
    
    it("Should allow contributor to get refund after failed campaign", async function () {
      const balanceBefore = await ethers.provider.getBalance(contributor1.address);
      
      const tx = await crowdfunding.connect(contributor1).refund(campaignId);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      
      const balanceAfter = await ethers.provider.getBalance(contributor1.address);
      
      const expectedBalance = balanceBefore + ethers.parseEther("3") - gasUsed;
      expect(balanceAfter).to.equal(expectedBalance);
      
      const userContribution = await crowdfunding.contributions(campaignId, contributor1.address);
      expect(userContribution).to.equal(0);
    });
    
    it("Should emit RefundIssued event", async function () {
      await expect(crowdfunding.connect(contributor1).refund(campaignId))
        .to.emit(crowdfunding, "RefundIssued")
        .withArgs(campaignId, contributor1.address, ethers.parseEther("3"));
    });
    
    it("Should revert if campaign not ended", async function () {
      const currentBlock = await ethers.provider.getBlock("latest");
      deadline = currentBlock.timestamp + 7 * 24 * 60 * 60;
      await crowdfunding.connect(creator).createCampaign(GOAL, deadline);
      await crowdfunding.connect(contributor1).contribute(2, {value: ethers.parseEther("3")});
      
      await expect(
        crowdfunding.connect(contributor1).refund(2)
      ).to.be.revertedWith("Campaign not ended yet");
    });
    
    it("Should revert if goal was reached", async function () {
      const currentBlock = await ethers.provider.getBlock("latest");
      deadline = currentBlock.timestamp + 7 * 24 * 60 * 60;
      await crowdfunding.connect(creator).createCampaign(GOAL, deadline);
      await crowdfunding.connect(contributor1).contribute(2, {value: ethers.parseEther("11")});
      await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      
      await expect(
        crowdfunding.connect(contributor1).refund(2)
      ).to.be.revertedWith("Goal was reached");
    });
    
    it("Should revert if no contribution", async function () {
      await expect(
        crowdfunding.connect(owner).refund(campaignId)
      ).to.be.revertedWith("No contribution to refund");
    });
  });
});