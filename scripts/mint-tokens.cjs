const hre = require("hardhat");
const fs = require("fs");

async function main() {
  // Read deployment addresses
  const deployment = JSON.parse(fs.readFileSync("deployment.json", "utf8"));

  const [deployer] = await hre.ethers.getSigners();
  console.log("Minting tokens from:", deployer.address);

  // Account to mint to (Hardhat account #0)
  const recipient = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

  const tokens = [
    { name: "DAI", address: deployment.tokens.DAI },
    { name: "USDC", address: deployment.tokens.USDC },
    { name: "WETH", address: deployment.tokens.WETH },
  ];

  for (const token of tokens) {
    console.log(`\nMinting 1000 ${token.name} to ${recipient}...`);
    const tokenContract = await hre.ethers.getContractAt(
      "MockERC20",
      token.address
    );
    const amount = hre.ethers.utils.parseEther("1000");
    const tx = await tokenContract.mint(recipient, amount);
    await tx.wait();

    // Check balance
    const balance = await tokenContract.balanceOf(recipient);
    console.log(
      `✅ ${token.name} balance: ${hre.ethers.utils.formatEther(balance)}`
    );
  }

  console.log("\n✅ All tokens minted successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
