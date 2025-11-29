const hre = require("hardhat");
const fs = require("fs");

async function main() {
  // Your MetaMask account
  const targetAccount = "0xcA5b3038A012294065c729f61e4c1618dbadf6BD";

  // Read deployment addresses
  const deployment = JSON.parse(fs.readFileSync("deployment.json", "utf8"));

  // Use deployer to send tokens and approve
  const [deployer] = await hre.ethers.getSigners();

  console.log("Setting up Account:", targetAccount);
  console.log("LendingPool address:", deployment.lendingPool);

  const tokens = [
    { name: "DAI", address: deployment.tokens.DAI },
    { name: "USDC", address: deployment.tokens.USDC },
    { name: "WETH", address: deployment.tokens.WETH },
  ];

  for (const token of tokens) {
    console.log(`\n=== ${token.name} ===`);
    const tokenContract = await hre.ethers.getContractAt(
      "MockERC20",
      token.address,
      deployer
    );

    // 1. Mint tokens to target account
    console.log(`Minting 1000 ${token.name} to ${targetAccount}...`);
    const mintTx = await tokenContract.mint(
      targetAccount,
      hre.ethers.utils.parseEther("1000")
    );
    await mintTx.wait();
    console.log(`✅ Minted 1000 ${token.name}`);

    // 2. Check balance
    const balance = await tokenContract.balanceOf(targetAccount);
    console.log(
      `Balance: ${hre.ethers.utils.formatEther(balance)} ${token.name}`
    );

    // 3. Impersonate the account to approve (only works on hardhat)
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [targetAccount],
    });

    const targetSigner = await hre.ethers.getSigner(targetAccount);
    const tokenAsTarget = tokenContract.connect(targetSigner);

    // 4. Approve unlimited spending
    console.log(`Pre-approving unlimited ${token.name}...`);
    const approveTx = await tokenAsTarget.approve(
      deployment.lendingPool,
      hre.ethers.constants.MaxUint256
    );
    await approveTx.wait();
    console.log(`✅ ${token.name} unlimited approval granted!`);

    // Stop impersonating
    await hre.network.provider.request({
      method: "hardhat_stopImpersonatingAccount",
      params: [targetAccount],
    });
  }

  console.log(
    "\n🎉 All done! Now all your transactions will show 'Confirm' only!"
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
