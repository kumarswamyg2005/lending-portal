const hre = require("hardhat");

async function main() {
  const signers = await hre.ethers.getSigners();
  const recipient = "0xca5b3038a012294065c729f61e4c1618dbadf6bd";

  // Check current balance
  const currentBalance = await hre.ethers.provider.getBalance(recipient);
  console.log(
    `Current balance: ${hre.ethers.utils.formatEther(currentBalance)} ETH\n`
  );

  console.log("Funding account from multiple Hardhat test accounts...");

  let totalSent = 0;

  // Send 9999 ETH from accounts 1-5 (5 * 9999 = 49995 ETH)
  for (let i = 1; i <= 5; i++) {
    const amount = "9999";
    console.log(
      `Sending ${amount} ETH from account #${i}: ${signers[i].address}`
    );

    const tx = await signers[i].sendTransaction({
      to: recipient,
      value: hre.ethers.utils.parseEther(amount),
    });

    await tx.wait();
    totalSent += parseFloat(amount);
    console.log(`✓ Sent ${amount} ETH\n`);
  }

  const balance = await hre.ethers.provider.getBalance(recipient);
  console.log(`✓ Total additional ETH sent: ${totalSent} ETH`);
  console.log(`✓ Final balance: ${hre.ethers.utils.formatEther(balance)} ETH`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
