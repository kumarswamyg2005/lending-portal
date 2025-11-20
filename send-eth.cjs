const ethers = require("ethers");

async function sendETH() {
  const provider = new ethers.providers.JsonRpcProvider(
    "http://127.0.0.1:8545"
  );

  // Get the deployer signer (has 10,000 test ETH)
  const signer = provider.getSigner(0);
  const fromAddress = await signer.getAddress();

  // Your MetaMask account
  const toAddress = "0xca5b3038a012294065c729f61e4c1618dbadf6bd";

  console.log(`Sending 100 test ETH from ${fromAddress} to ${toAddress}...`);

  // Send 100 ETH (increased for more gas fees)
  const tx = await signer.sendTransaction({
    to: toAddress,
    value: ethers.utils.parseEther("100"),
  });

  console.log("Transaction hash:", tx.hash);

  const receipt = await tx.wait();
  console.log("Transaction confirmed in block:", receipt.blockNumber);

  // Check new balance
  const balance = await provider.getBalance(toAddress);
  console.log("New balance:", ethers.utils.formatEther(balance), "ETH");
}

sendETH().catch(console.error);
