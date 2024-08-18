const config = require('./config.js');
const ethers = require('ethers');
const provider = new ethers.JsonRpcProvider(config.RPC);
const miner = new ethers.Wallet(config.MINER_PRIVATE_KEY, provider); // Assuming the owner of the mining pool needs to trigger mining

const MINING_POOL_ADDRESS = config.MINING_POOL_ADDRESS;
const MINING_POOL_ABI = require('./miningPoolAbi.json');

const miningPool = new ethers.Contract(MINING_POOL_ADDRESS, MINING_POOL_ABI, miner);

async function mine() {
    try {
        const tx = await miningPool.mine();
        console.log('Mine transaction sent');
        await tx.wait();
        console.log('Mine transaction confirmed');
    } catch (e) {
        console.error('An error occurred while executing the mining transaction', e);
    }
}

async function startMining() {
    setInterval(async () => {
        await mine();
    }, 60000 / config.MINE_TX_PER_MINUTE);
}

startMining();
