const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();

  console.log("Funding account from:", signer.address);

  const tx = await signer.sendTransaction({
    to: "0xca5b3038a012294065c729f61e4c1618dbadf6bd",
    value: hre.ethers.utils.parseEther("100"),
  });

  await tx.wait();
  console.log("✓ Sent 100 ETH to 0xca5b3038a012294065c729f61e4c1618dbadf6bd");

  const balance = await hre.ethers.provider.getBalance(
    "0xca5b3038a012294065c729f61e4c1618dbadf6bd"
  );
  console.log("New balance:", hre.ethers.utils.formatEther(balance), "ETH");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
