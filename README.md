# Mining Pool DApp

This repository contains a smart contract and a simple web interface for a decentralized mining pool. The contract is deployed on the Ethereum blockchain, allowing users to contribute Ether to a mining pool, mine tokens using the contributed Ether, and withdraw their mined tokens or contributed Ether.

## Overview

### Smart Contract: `MiningPool`

The `MiningPool` contract allows users to contribute Ether to a collective pool, which is then used to mine tokens from a connected external contract (referred to as the Hypersound contract). Contributors can withdraw their mined tokens proportional to their contribution or withdraw their original Ether contribution minus any Ether that has already been used for mining.

### Key Features

- **Contribution**: Users can contribute Ether to the pool.
- **Mining**: The owner of the contract can initiate the mining process, using the contributed Ether to mine tokens from the connected external contract.
- **Withdrawal**: Users can withdraw their mined tokens or their contributed Ether.
- **No Owner Withdrawal**: The contract owner cannot withdraw Ether directly, ensuring that the pool’s funds are secure from potential misuse.

### Functions in the `MiningPool` Contract

1. **constructor(address _hypersoundAddress)**:
   - Initializes the contract with the address of the Hypersound contract.
   - Sets the deployer as the owner.

2. **contribute()**:
   - Allows users to contribute Ether to the mining pool.
   - Contributions are tracked, and the mining rate is updated based on the contributed amount.

3. **withdrawMinedTokens()**:
   - Allows users to withdraw their share of the mined tokens based on their contributions to the pool.

4. **withdrawContribution()**:
   - Allows users to withdraw their original Ether contribution, minus the Ether that has been spent on mining.

5. **getContributorShare(address contributor)**:
   - Returns the amount of mined tokens a contributor is entitled to based on their contribution.

6. **mine()** (onlyOwner):
   - The owner (deployer) of the contract can trigger the mining process.
   - The function calls the `mine` function of the connected Hypersound contract, distributing the mined tokens proportionally to contributors.

7. **changeOwner(address newOwner)** (onlyOwner):
   - Allows the current owner to transfer ownership of the contract to another address.

## Web Interface

### Files

- **index.html**: The HTML file that contains the structure of the web interface.
- **app.js**: The JavaScript file that interacts with the Ethereum blockchain using Web3.js.

### Features

- **Connect Wallet**: Users can connect their MetaMask wallet to the DApp.
- **Contribute Ether**: Users can contribute Ether to the mining pool.
- **Withdraw Mined Tokens**: Users can withdraw their proportionate share of mined tokens.
- **Withdraw Contribution**: Users can withdraw their original Ether contribution (minus used Ether).

## Setup and Usage

### Prerequisites

- MetaMask installed in your browser.
- A web server to serve the `index.html` file (e.g., Live Server extension in VS Code).

### Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-repo/mining-pool-dapp.git
   cd mining-pool-dapp
