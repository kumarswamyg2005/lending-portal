const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const recipient = "0xca5b3038a012294065c729f61e4c1618dbadf6bd";
  const amount = "50000"; // ETH

  console.log("Funding account from:", signer.address);
  console.log(`Sending ${amount} ETH to ${recipient}...`);

  const tx = await signer.sendTransaction({
    to: recipient,
    value: hre.ethers.utils.parseEther(amount),
  });

  await tx.wait();
  console.log(`✓ Sent ${amount} ETH to ${recipient}`);

  const balance = await hre.ethers.provider.getBalance(recipient);
  console.log("New balance:", hre.ethers.utils.formatEther(balance), "ETH");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
