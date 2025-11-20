const ethers = require("ethers");

async function checkBalance() {
  const provider = new ethers.providers.JsonRpcProvider(
    "http://127.0.0.1:8545"
  );

  // Your MetaMask account
  const address = "0xca5b3038a012294065c729f61e4c1618dbadf6bd";

  const balance = await provider.getBalance(address);
  console.log("Account:", address);
  console.log("Balance:", ethers.utils.formatEther(balance), "ETH");

  // Also check network
  const network = await provider.getNetwork();
  console.log("Network Chain ID:", network.chainId);
}

checkBalance().catch(console.error);
