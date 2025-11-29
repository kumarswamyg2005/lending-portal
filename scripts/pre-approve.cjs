const hre = require("hardhat");
const fs = require("fs");

async function main() {
  // Read deployment addresses
  const deployment = JSON.parse(fs.readFileSync("deployment.json", "utf8"));

  const [signer] = await hre.ethers.getSigners();
  const account = signer.address;

  console.log("Pre-approving all tokens for:", account);
  console.log("LendingPool address:", deployment.lendingPool);

  const tokens = [
    { name: "DAI", address: deployment.tokens.DAI },
    { name: "USDC", address: deployment.tokens.USDC },
    { name: "WETH", address: deployment.tokens.WETH },
  ];

  for (const token of tokens) {
    console.log(`\nApproving unlimited ${token.name}...`);
    const tokenContract = await hre.ethers.getContractAt(
      "MockERC20",
      token.address
    );

    // Check current allowance
    const currentAllowance = await tokenContract.allowance(
      account,
      deployment.lendingPool
    );
    console.log(
      `Current allowance: ${hre.ethers.utils.formatEther(currentAllowance)}`
    );

    if (currentAllowance.eq(0)) {
      // Approve unlimited
      const tx = await tokenContract.approve(
        deployment.lendingPool,
        hre.ethers.constants.MaxUint256
      );
      await tx.wait();
      console.log(`✅ ${token.name} unlimited approval granted!`);
    } else {
      console.log(`✅ ${token.name} already approved`);
    }
  }

  console.log(
    "\n✅ All tokens pre-approved! Now you'll only see 'Confirm' buttons!"
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
