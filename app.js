let web3;
let account;

const miningPoolAddress = '0xc3b23B8AbbD89a37992b33dc431310B5fCcEec4B';
const miningPoolAbi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "extraData",
                "type": "bytes"
            }
        ],
        "name": "mine",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

const connectButton = document.getElementById('connectButton');
const contributeButton = document.getElementById('contributeButton');
const withdrawButton = document.getElementById('withdrawButton');
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
            await contract.methods.withdraw().send({ from: account });
            statusDisplay.innerText = `Successfully withdrew mined tokens.`;
        } catch (error) {
            console.error("Withdrawal failed", error);
            statusDisplay.innerText = `Failed to withdraw: ${error.message}`;
        }
    } else {
        alert("Please connect your wallet first.");
    }
});
