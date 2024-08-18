let web3;
let account;

const miningPoolAddress = 'YOUR_MINING_POOL_CONTRACT_ADDRESS_HERE';
const miningPoolAbi = [
    [
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
    ]
];

const connectButton = document.getElementById('connectButton');
const contributeButton = document.getElementById('contributeButton');
const withdrawButton = document.getElementById('withdrawButton');
const accountDisplay = document.getElementById('account');
const statusDisplay = document.getElementById('status');

connectButton.addEventListener('click', async () => {
    if (window.ethereum) {
        try {
            // Request account access
            await ethereum.request({ method: 'eth_requestAccounts' });
            web3 = new Web3(window.ethereum);
            account = (await web3.eth.getAccounts())[0];
            accountDisplay.innerText = `Connected account: ${account}`;
        } catch (error) {
            console.error("User denied account access");
        }
    } else {
        alert("Please install MetaMask to use this dApp!");
    }
});

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
