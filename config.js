require('dotenv').config({ path: './deploy/.env' });

module.exports = {
    MINER_PRIVATE_KEY: process.env.PRIVATE_KEY, // Load the private key from the environment variable
    MINING_POOL_ADDRESS: 'YOUR_MINING_POOL_CONTRACT_ADDRESS_HERE',
    MINE_TX_PER_MINUTE: 50,
    RPC: 'https://rpc.ankr.com/blast'
};