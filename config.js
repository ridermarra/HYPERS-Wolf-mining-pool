require('dotenv').config({ path: './deploy/.env' });

module.exports = {
    MINER_PRIVATE_KEY: process.env.PRIVATE_KEY, // Load the private key from the environment variable
    MINING_POOL_ADDRESS: process.env.MINING_POOL_ADDRESS,
    MINE_TX_PER_MINUTE: 50,
    // RPC: 'https://rpc.ankr.com/blast'
    RPC: 'https://blast-sepolia.infura.io/v3/b03abf15f1254f6cb0119f6b578f59d8'
};