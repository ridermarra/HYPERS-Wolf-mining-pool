// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IHypersound {
    function mine(bytes memory extraData) external;
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract MiningPool is Ownable {
    mapping(address => uint256) public contributions;
    mapping(address => uint256) public minedTokens;
    uint256 public totalContributions;
    uint256 public totalMinedTokens;
    uint256 public txRatePerMinute;
    
    address public hypersoundAddress;
    IHypersound public hypersound;

    event ContributionReceived(address indexed contributor, uint256 amount, uint256 newTxRate);
    event TokensWithdrawn(address indexed contributor, uint256 amount);

    constructor(address _hypersoundAddress) Ownable(msg.sender) {
        hypersoundAddress = _hypersoundAddress;
        hypersound = IHypersound(_hypersoundAddress);
    }

    function contribute() external payable {
        require(msg.value > 0, "Contribution must be greater than 0");

        _processContribution(msg.sender, msg.value);

        emit ContributionReceived(msg.sender, msg.value, txRatePerMinute);
    }

    function _processContribution(address contributor, uint256 amount) internal {
        contributions[contributor] += amount;
        totalContributions += amount;

        updateMiningRate(amount);
    }

    function updateMiningRate(uint256 _amount) internal {
        uint256 additionalRate = (_amount / 0.01 ether) * 20;
        txRatePerMinute += additionalRate;
    }

    function withdraw() external {
        require(contributions[msg.sender] > 0, "No contributions found");

        uint256 contributorShare = getContributorShare(msg.sender);
        require(contributorShare > 0, "No tokens available for withdrawal");

        minedTokens[msg.sender] = 0;
        totalMinedTokens -= contributorShare;

        require(hypersound.transfer(msg.sender, contributorShare), "Token transfer failed");

        emit TokensWithdrawn(msg.sender, contributorShare);
    }

    function getContributorShare(address contributor) public view returns (uint256) {
        if (totalContributions == 0) return 0;
        return (minedTokens[contributor] * contributions[contributor]) / totalContributions;
    }

    function mine() external onlyOwner {
        hypersound.mine("");
        uint256 newTokens = hypersound.balanceOf(address(this)) - totalMinedTokens;
        totalMinedTokens += newTokens;

        // Distribute new tokens among contributors based on their contributions
        address[] memory contributors = getAllContributors();
        for (uint i = 0; i < contributors.length; i++) {
            address contributor = contributors[i];
            minedTokens[contributor] += (newTokens * contributions[contributor]) / totalContributions;
        }
    }

    function getAllContributors() internal view returns (address[] memory) {
        address[] memory contributors = new address[](totalContributions);
        uint256 index = 0;
        for (uint i = 0; i < contributors.length; i++) {
            if (contributions[contributors[i]] > 0) {
                contributors[index] = contributors[i];
                index++;
            }
        }
        return contributors;
    }

    // Prevent the contract owner from withdrawing any ETH or tokens
    function emergencyWithdraw() external view onlyOwner {
        revert("Emergency withdraw is disabled");
    }
}
