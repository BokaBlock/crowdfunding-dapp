// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Crowdfunding {

    struct Campaign {
        address creator;
        uint256 goal;
        uint256 deadline;
        uint256 amountRaised;
        bool withdrawn;
    }
    
    uint256 public campaignCount;
    
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public contributions;

    event CampaignCreated(uint256 indexed campaignId, address indexed creator, uint256 goal, uint256 deadline);
    event ContributionMade(uint256 indexed campaignId, address indexed contributor, uint256 amount);
    event FundsWithdrawn(uint256 indexed campaignId, address indexed creator, uint256 amount);
    event RefundIssued(uint256 indexed campaignId, address indexed contributor, uint256 amount);

    function createCampaign(uint256 _goal, uint256 _deadline) public {
        require(_goal > 0, "Goal must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        
        campaignCount++;
        uint256 campaignId = campaignCount;
        
        campaigns[campaignId] = Campaign({
            creator: msg.sender,
            goal: _goal,
            deadline: _deadline,
            amountRaised: 0,
            withdrawn: false
        });
        
        emit CampaignCreated(campaignId, msg.sender, _goal, _deadline);
    }
    function contribute(uint256 _campaignId) public payable {
    Campaign storage campaign = campaigns[_campaignId];
    
    require(campaign.creator != address(0), "Campaign does not exist");
    require(block.timestamp < campaign.deadline, "Campaign has ended");
    require(msg.value > 0, "Contribution must be greater than 0");
    
    contributions[_campaignId][msg.sender] += msg.value;
    campaign.amountRaised += msg.value;
    
    emit ContributionMade(_campaignId, msg.sender, msg.value);
}
function withdrawFunds(uint256 _campaignId) public {
    Campaign storage campaign = campaigns[_campaignId];
    
    require(msg.sender == campaign.creator, "Only creator can withdraw");
    require(block.timestamp >= campaign.deadline, "Campaign not ended yet");
    require(campaign.amountRaised >= campaign.goal, "Goal not reached");
    require(!campaign.withdrawn, "Funds already withdrawn");
    
    campaign.withdrawn = true;
    
    uint256 amount = campaign.amountRaised;
    
    (bool success, ) = payable(campaign.creator).call{value: amount}("");
    require(success, "Transfer failed");
    
    emit FundsWithdrawn(_campaignId, campaign.creator, amount);
}
function refund(uint256 _campaignId) public {
    Campaign storage campaign = campaigns[_campaignId];
    
    require(block.timestamp >= campaign.deadline, "Campaign not ended yet");
    require(campaign.amountRaised < campaign.goal, "Goal was reached");
    require(contributions[_campaignId][msg.sender] > 0, "No contribution to refund");
    
    uint256 amount = contributions[_campaignId][msg.sender];
    contributions[_campaignId][msg.sender] = 0;
    
    (bool success, ) = payable(msg.sender).call{value: amount}("");
    require(success, "Refund failed");
    
    emit RefundIssued(_campaignId, msg.sender, amount);
}
}

