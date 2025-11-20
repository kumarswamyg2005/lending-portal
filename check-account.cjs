const ethers = require("ethers");

async function sendTestETH() {
  const provider = new ethers.providers.JsonRpcProvider(
    "http://127.0.0.1:8545"
  );

  // Hardhat test account with 10,000 ETH
  const wallet = new ethers.Wallet(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    provider
  );

  console.log("=== HARDHAT TEST ACCOUNT ===");
  console.log("Address:", wallet.address);

  const balance = await wallet.getBalance();
  console.log("Balance:", ethers.utils.formatEther(balance), "ETH");
  console.log("");

  console.log("=== AVAILABLE FOR YOUR DEMO ===");
  console.log("You can use this account in MetaMask!");
  console.log("");
  console.log("TO FIX YOUR ISSUE:");
  console.log("1. Open MetaMask");
  console.log("2. Click your account dropdown");
  console.log('3. Click "Import Account"');
  console.log("4. Paste this private key:");
  console.log(
    "   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
  );
  console.log("5. Click Import");
  console.log("6. You will have 10,000 TEST ETH!");
  console.log("7. Try your transaction again - it will work!");
  console.log("");
  console.log("✅ This is FREE test ETH for your college demo!");
}

sendTestETH().catch(console.error);
