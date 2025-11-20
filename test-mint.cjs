const ethers = require("ethers");
const fs = require("fs");
const path = require("path");

async function checkNodeRunning(provider) {
  try {
    await provider.getNetwork();
    return true;
  } catch (error) {
    return false;
  }
}

function loadDeployment() {
  const deploymentPath = path.join(__dirname, "deployment.json");
  if (!fs.existsSync(deploymentPath)) {
    console.error("\n❌ ERROR: deployment.json not found!");
    console.error("\n📝 To fix this:");
    console.error("   1. Make sure Hardhat node is running");
    console.error(
      "   2. Deploy contracts: npx hardhat run scripts/deploy.ts --network localhost"
    );
    console.error("   3. Then run this script again\n");
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
}

async function testMint() {
  const rpcUrl = "http://127.0.0.1:8545";
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

  // Check if node is running
  console.log("🔍 Checking if Hardhat node is running...");
  const isRunning = await checkNodeRunning(provider);

  if (!isRunning) {
    console.error("\n❌ ERROR: Hardhat node is not running!");
    console.error("\n📝 To fix this:");
    console.error("   1. Open a new terminal");
    console.error("   2. Run: npx hardhat node");
    console.error("   3. Or run: bash start-node.sh");
    console.error("   4. Then run this script again\n");
    process.exit(1);
  }

  console.log("✅ Hardhat node is running");

  // Load deployment addresses
  console.log("\n📂 Loading deployment addresses...");
  const deployment = loadDeployment();
  const daiAddress = deployment.tokens.DAI;
  console.log("📍 DAI Token Address:", daiAddress);

  // Get the deployer signer (has test ETH)
  console.log("\n💰 Getting signer account...");
  const signer = provider.getSigner(0);
  const address = await signer.getAddress();
  console.log("📍 Signer address:", address);

  // DAI token contract
  const tokenAbi = [
    "function mint(address to, uint256 amount)",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
  ];

  const token = new ethers.Contract(daiAddress, tokenAbi, signer);

  // Verify contract exists
  const code = await provider.getCode(daiAddress);
  if (code === "0x") {
    console.error("\n❌ ERROR: No contract found at DAI address!");
    console.error("\n📝 To fix this:");
    console.error("   1. Restart Hardhat node: npx hardhat node");
    console.error(
      "   2. Deploy contracts: npx hardhat run scripts/deploy.ts --network localhost"
    );
    console.error("   3. Then run this script again\n");
    process.exit(1);
  }

  // Get decimals
  console.log("\n🔧 Getting token configuration...");
  const decimals = await token.decimals();
  console.log("   Decimals:", decimals);

  // Mint 100 DAI
  const amount = ethers.utils.parseUnits("100", decimals);
  console.log("\n🪙 Minting 100 DAI tokens...");
  console.log("   Amount (wei):", amount.toString());

  try {
    const tx = await token.mint(address, amount);
    console.log("\n📤 Transaction submitted:", tx.hash);
    console.log("⏳ Waiting for confirmation...");

    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);

    // Check balance
    const balance = await token.balanceOf(address);
    console.log(
      "\n💵 New balance:",
      ethers.utils.formatUnits(balance, decimals),
      "DAI\n"
    );
  } catch (error) {
    console.error("\n❌ Failed to mint tokens:", error.message);
    throw error;
  }
}

testMint().catch((error) => {
  console.error("\n💥 Script failed:", error.message);
  process.exit(1);
});
