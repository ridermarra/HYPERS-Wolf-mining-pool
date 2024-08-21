let web3;
let account;

const miningPoolAddress = '<YOUR_MINING_POOL_CONTRACT_ADDRESS>'; // Replace with your deployed contract address
const miningPoolAbi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_hypersoundAddress",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "contributor",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "newTxRate",
                "type": "uint256"
            }
        ],
        "name": "ContributionReceived",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "contributor",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "ContributionWithdrawn",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "contributor",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "TokensWithdrawn",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "contribute",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdrawMinedTokens",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdrawContribution",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

const connectButton = document.getElementById('connectButton');
const contributeButton = document.getElementById('contributeButton');
const withdrawButton = document.getElementById('withdrawButton');
const withdrawMinedButton = document.getElementById('withdrawMinedButton');
const accountDisplay = document.getElementById('account');
const statusDisplay = document.getElementById('status');

// Initialize Web3 and check if MetaMask is available
async function initializeWeb3() {
    if (typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum);
        try {
            // Request account access if needed
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const accounts = await web3.eth.getAccounts();
            account = accounts[0];
            accountDisplay.innerText = `Connected account: ${account}`;
            statusDisplay.innerText = "Wallet connected successfully.";
        } catch (error) {
            console.error("User denied account access or other error", error);
            statusDisplay.innerText = "Failed to connect wallet.";
        }
    } else {
        alert("Please install MetaMask to use this DApp!");
        statusDisplay.innerText = "MetaMask not installed.";
    }
}

// Call initializeWeb3 when the script loads
initializeWeb3();

connectButton.addEventListener('click', initializeWeb3);

contributeButton.addEventListener('click', async () => {
    const amount = document.getElementById('contributionAmount').value;
    if (web3 && account) {
        try {
            const contract = new web3.eth.Contract(miningPoolAbi, miningPoolAddress);
            await contract.methods.contribute().send({
                from: account,
                value: web3.utils.toWei(amount, 'ether')
            });
            statusDisplay.innerText = `Successfully contributed ${amount} ETH to the mining pool.`;
        } catch (error) {
            console.error("Contribution failed", error);
            statusDisplay.innerText = `Failed to contribute: ${error.message}`;
        }
    } else {
        alert("Please connect your wallet first.");
    }
});

withdrawButton.addEventListener('click', async () => {
    if (web3 && account) {
        try {
            const contract = new web3.eth.Contract(miningPoolAbi, miningPoolAddress);
            await contract.methods.withdrawContribution().send({ from: account });
            statusDisplay.innerText = `Successfully withdrew your contribution.`;
        } catch (error) {
            console.error("Withdrawal failed", error);
            statusDisplay.innerText = `Failed to withdraw: ${error.message}`;
        }
    } else {
        alert("Please connect your wallet first.");
    }
});

withdrawMinedButton.addEventListener('click', async () => {
    if (web3 && account) {
        try {
            const contract = new web3.eth.Contract(miningPoolAbi, miningPoolAddress);
            await contract.methods.withdrawMinedTokens().send({ from: account });
            statusDisplay.innerText = `Successfully withdrew your mined tokens.`;
        } catch (error) {
            console.error("Mined token withdrawal failed", error);
            statusDisplay.innerText = `Failed to withdraw mined tokens: ${error.message}`;
        }
    } else {
        alert("Please connect your wallet first.");
    }
});
