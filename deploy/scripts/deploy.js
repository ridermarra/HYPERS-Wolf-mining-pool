async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const balance = await deployer.getBalance();
    console.log("Account balance:", balance.toString());

    // Replace with the actual contract artifact
    const MiningPool = await ethers.getContractFactory("MiningPool");

    // Replace with the actual address of the Hypersound contract
    const hypersoundAddress = "0x7E82481423B09c78e4fd65D9C1473a36E5aEd405";

    const miningPool = await MiningPool.deploy(hypersoundAddress);

    console.log("MiningPool contract deployed to address:", miningPool.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
