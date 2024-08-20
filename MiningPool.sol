// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IHypersound {
    // Interface to interact with the Hypersound contract
    function mine(bytes memory extraData) external;
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract MiningPool is Ownable {
    // Mapping to store contributions by each address
    mapping(address => uint256) public contributions;
    // Mapping to store mined tokens that each contributor can withdraw
    mapping(address => uint256) public minedTokens;
    // Array to keep track of all contributors
    address[] public contributors;
    // Total contributions received in the contract
    uint256 public totalContributions;
    // Rate of transactions per minute based on contributions
    uint256 public txRatePerMinute;
    // Track the total Ether spent by the contract (e.g., gas fees)
    uint256 public totalSpentEther;

    // Address of the Hypersound contract
    address public hypersoundAddress;
    // Hypersound contract interface instance
    IHypersound public hypersound;

    // Events to log contributions, token withdrawals, and ETH withdrawals
    event ContributionReceived(address indexed contributor, uint256 amount, uint256 newTxRate);
    event TokensWithdrawn(address indexed contributor, uint256 amount);
    event ContributionWithdrawn(address indexed contributor, uint256 amount);

    /**
     * @dev Constructor to initialize the contract with the Hypersound contract address
     * @param _hypersoundAddress Address of the deployed Hypersound contract
     */
    constructor(address _hypersoundAddress) Ownable(msg.sender) {
        hypersoundAddress = _hypersoundAddress;
        hypersound = IHypersound(_hypersoundAddress);
    }

    /**
     * @dev Function to handle incoming Ether transactions. Calls _processContribution().
     * This is automatically called when the contract receives Ether with no data.
     */
    receive() external payable {
        _processContribution(msg.sender, msg.value);
    }

    /**
     * @dev Fallback function to handle incoming Ether transactions with data. Calls _processContribution().
     */
    fallback() external payable {
        _processContribution(msg.sender, msg.value);
    }

    /**
     * @dev Public function for users to contribute Ether to the mining pool.
     * Emits a ContributionReceived event.
     */
    function contribute() external payable {
        require(msg.value > 0, "Contribution must be greater than 0");

        _processContribution(msg.sender, msg.value);

        emit ContributionReceived(msg.sender, msg.value, txRatePerMinute);
    }

    /**
     * @dev Internal function to process contributions. Updates contribution data and the transaction rate.
     * @param contributor Address of the contributor
     * @param amount Amount of Ether contributed
     */
    function _processContribution(address contributor, uint256 amount) internal {
        if (contributions[contributor] == 0) {
            contributors.push(contributor);
        }

        contributions[contributor] += amount;
        totalContributions += amount;

        updateMiningRate(amount);
    }

    /**
     * @dev Internal function to update the transaction rate per minute.
     * @param _amount Amount of Ether contributed
     */
    function updateMiningRate(uint256 _amount) internal {
        uint256 additionalRate = (_amount * 20) / 0.01 ether;
        txRatePerMinute += additionalRate;
    }

    /**
     * @dev Public function to allow contributors to withdraw their mined tokens.
     * Emits a TokensWithdrawn event.
     */
    function withdrawMinedTokens() external {
        require(contributions[msg.sender] > 0, "No contributions found");

        // Calculate the contributor's share of the mined tokens
        uint256 contributorShare = getContributorShare(msg.sender);
        require(contributorShare > 0, "No tokens available for withdrawal");

        // Reset the contributor's mined tokens to 0 after withdrawal
        minedTokens[msg.sender] = 0;

        // Transfer the mined tokens to the contributor
        require(hypersound.transfer(msg.sender, contributorShare), "Token transfer failed");

        emit TokensWithdrawn(msg.sender, contributorShare);
    }

    /**
     * @dev Public function to allow contributors to withdraw their original Ether contributions.
     * The amount withdrawn is proportional to the remaining Ether in the contract.
     * Emits a ContributionWithdrawn event.
     */
    function withdrawContribution() external {
        uint256 contribution = contributions[msg.sender];
        require(contribution > 0, "No contribution to withdraw");

        // Calculate the total remaining Ether including spent Ether
        uint256 remainingEther = address(this).balance + totalSpentEther;
        // Calculate the contributor's share of the remaining Ether
        uint256 contributorShare = (contribution * address(this).balance) / remainingEther;

        // Update the contributor's data
        contributions[msg.sender] = 0;
        totalContributions -= contribution;

        // Transfer the remaining share of Ether back to the contributor
        (bool success, ) = msg.sender.call{value: contributorShare}("");
        require(success, "Withdrawal failed");

        emit ContributionWithdrawn(msg.sender, contributorShare);
    }

    /**
     * @dev Public view function to calculate the share of mined tokens for a contributor.
     * @param contributor Address of the contributor
     * @return uint256 Share of mined tokens
     */
    function getContributorShare(address contributor) public view returns (uint256) {
        if (totalContributions == 0) return 0;
        // Calculate the share of mined tokens based on the total contributions and the individual contribution
        return (hypersound.balanceOf(address(this)) * contributions[contributor]) / totalContributions;
    }

    /**
     * @dev Public function to mine new tokens. Only callable by the contract owner.
     * Distributes the newly mined tokens among contributors.
     */
    function mine() external onlyOwner {
        // Get the current balance of tokens in the contract
        uint256 previousBalance = hypersound.balanceOf(address(this));
        
        // Trigger the mining process in the Hypersound contract
        hypersound.mine("");
        // Calculate the amount of new tokens mined
        uint256 newTokens = hypersound.balanceOf(address(this)) - previousBalance;

        // Track the Ether spent during the mining process (e.g., gas fees)
        uint256 etherSpent = address(this).balance;
        totalSpentEther += etherSpent;

        // Distribute the new tokens among contributors based on their contributions
        for (uint i = 0; i < contributors.length; i++) {
            address contributor = contributors[i];
            uint256 share = (newTokens * contributions[contributor]) / totalContributions;
            minedTokens[contributor] += share;
        }
    }

    /**
     * @dev Function to prevent the contract owner from withdrawing any ETH or tokens.
     * This function always reverts. Only callable by the contract owner.
     */
    function emergencyWithdraw() external view onlyOwner {
        revert("Emergency withdraw is disabled");
    }
}
