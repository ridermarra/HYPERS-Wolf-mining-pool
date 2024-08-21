// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IHypersound {
    function mine(bytes memory extraData) external;
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract MiningPool is ReentrancyGuard {
    mapping(address => uint256) public contributions;
    mapping(address => uint256) public minedTokens;
    address[] public contributors;
    uint256 public totalContributions;
    uint256 public txRatePerMinute;
    uint256 public totalSpentEther; // Track the total Ether spent by the contract
    
    address public hypersoundAddress;
    IHypersound public hypersound;
    address public owner;

    event ContributionReceived(address indexed contributor, uint256 amount, uint256 newTxRate);
    event TokensWithdrawn(address indexed contributor, uint256 amount);
    event ContributionWithdrawn(address indexed contributor, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    // Constructor to initialize the Hypersound contract address and set the owner
    constructor(address _hypersoundAddress) {
        hypersoundAddress = _hypersoundAddress;
        hypersound = IHypersound(_hypersoundAddress);
        owner = msg.sender; // Set the deployer as the owner
    }

    // Function to contribute Ether to the mining pool
    function contribute() external payable nonReentrant {
        require(msg.value != 0, "Contribution must be > 0");

        _processContribution(msg.sender, msg.value);

        emit ContributionReceived(msg.sender, msg.value, txRatePerMinute);
    }

    // Internal function to process contributions
    function _processContribution(address contributor, uint256 amount) internal {
        if (contributions[contributor] == 0) {
            contributors.push(contributor);
        }

        contributions[contributor] += amount;
        totalContributions += amount;

        updateMiningRate(amount);
    }

    // Internal function to update the mining rate based on contributions
    function updateMiningRate(uint256 _amount) internal {
        uint256 additionalRate = (_amount * 20) / 0.01 ether;
        txRatePerMinute += additionalRate;
    }

    // Function to withdraw mined tokens by contributors
    function withdrawMinedTokens() external nonReentrant {
        uint256 contribution = contributions[msg.sender];
        require(contribution != 0, "No contributions found");

        uint256 contributorShare = getContributorShare(msg.sender);
        require(contributorShare != 0, "No tokens available for withdrawal");

        minedTokens[msg.sender] = 0;

        require(hypersound.transfer(msg.sender, contributorShare), "Token transfer failed");

        emit TokensWithdrawn(msg.sender, contributorShare);
    }

    // Function for contributors to withdraw their contributed Ether
    function withdrawContribution() external nonReentrant {
        uint256 contribution = contributions[msg.sender];
        require(contribution != 0, "No contribution to withdraw");

        // Calculate the total remaining Ether including spent Ether
        uint256 remainingEther = address(this).balance + totalSpentEther;
        // Calculate the contributor's share of the remaining Ether
        uint256 contributorShare = (contribution * address(this).balance) / remainingEther;

        contributions[msg.sender] = 0;
        totalContributions -= contribution;

        // Transfer the remaining share of Ether back to the contributor
        (bool success, ) = msg.sender.call{value: contributorShare}("");
        require(success, "Withdrawal failed");

        emit ContributionWithdrawn(msg.sender, contributorShare);
    }

    // Function to get the share of mined tokens for a contributor
    function getContributorShare(address contributor) public view returns (uint256) {
        if (totalContributions == 0) return 0;
        return (hypersound.balanceOf(address(this)) * contributions[contributor]) / totalContributions;
    }

    // Function to initiate the mining process (only the owner can call this)
    function mine() external onlyOwner nonReentrant {
        uint256 previousBalance = hypersound.balanceOf(address(this));

        hypersound.mine("");

        uint256 newTokens = hypersound.balanceOf(address(this)) - previousBalance;

        uint256 etherSpent = address(this).balance;
        totalSpentEther += etherSpent;

        uint256 contributorCount = contributors.length;
        for (uint i = 0; i < contributorCount; ++i) {
            address contributor = contributors[i];
            uint256 share = (newTokens * contributions[contributor]) / totalContributions;
            minedTokens[contributor] += share;
        }
    }

    // Function to change the owner of the contract (optional, for flexibility)
    function changeOwner(address newOwner) external onlyOwner {
        owner = newOwner;
    }
}
