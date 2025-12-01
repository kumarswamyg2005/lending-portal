const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const recipient = "0xca5b3038a012294065c729f61e4c1618dbadf6bd";

  // Load deployment addresses
  const deployment = require("./deployment.json");

  console.log("Minting tokens to:", recipient);
  console.log("Minter account:", signer.address);

  const tokenAbi = [
    "function mint(address to, uint256 amount)",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
  ];

  const tokens = {
    DAI: deployment.tokens.DAI,
    USDC: deployment.tokens.USDC,
    WETH: deployment.tokens.WETH,
  };

  for (const [symbol, address] of Object.entries(tokens)) {
    console.log(`\n--- ${symbol} ---`);
    const token = await hre.ethers.getContractAt(tokenAbi, address);

    const decimals = await token.decimals();
    const amount = hre.ethers.utils.parseUnits("50000", decimals);

    console.log(`Minting 50,000 ${symbol}...`);
    const tx = await token.mint(recipient, amount);
    await tx.wait();
    console.log(`✓ Minted 50,000 ${symbol}`);

    const balance = await token.balanceOf(recipient);
    console.log(
      `New balance: ${hre.ethers.utils.formatUnits(
        balance,
        decimals
      )} ${symbol}`
    );
  }

  console.log("\n✓ All tokens minted successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
