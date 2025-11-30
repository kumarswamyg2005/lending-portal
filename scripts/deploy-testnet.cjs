const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Starting deployment...");
  console.log("");

  // Get network info
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;
  const chainId = network.chainId;

  console.log(`📡 Deploying to: ${networkName} (Chain ID: ${chainId})`);
  console.log("");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  const balance = await deployer.getBalance();

  console.log(`👤 Deployer address: ${deployer.address}`);
  console.log(`💰 Deployer balance: ${ethers.utils.formatEther(balance)} ETH`);
  console.log("");

  // Check if enough ETH
  if (balance.lt(ethers.utils.parseEther("0.01"))) {
    console.error("❌ Insufficient ETH for deployment!");
    if (chainId === 11155111) {
      console.log("💡 Get free Sepolia ETH from: https://sepoliafaucet.com/");
    }
    process.exit(1);
  }

  // Deploy Variable Interest Rate Model
  console.log("📝 Deploying VariableInterestRateModel...");
  const VariableInterestRateModel = await ethers.getContractFactory(
    "VariableInterestRateModel"
  );
  const interestRateModel = await VariableInterestRateModel.deploy();
  await interestRateModel.deployed();
  console.log(
    `✅ VariableInterestRateModel deployed to: ${interestRateModel.address}`
  );
  console.log("");

  // Deploy Lending Pool
  console.log("📝 Deploying LendingPool...");
  const LendingPool = await ethers.getContractFactory("LendingPool");
  const lendingPool = await LendingPool.deploy(interestRateModel.address);
  await lendingPool.deployed();
  console.log(`✅ LendingPool deployed to: ${lendingPool.address}`);
  console.log("");

  // Deploy Mock Tokens
  console.log("📝 Deploying Mock Tokens...");

  // DAI
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const dai = await MockERC20.deploy("Dai Stablecoin", "DAI");
  await dai.deployed();
  console.log(`✅ DAI deployed to: ${dai.address}`);

  // USDC
  const usdc = await MockERC20.deploy("USD Coin", "USDC");
  await usdc.deployed();
  console.log(`✅ USDC deployed to: ${usdc.address}`);

  // WETH
  const weth = await MockERC20.deploy("Wrapped Ether", "WETH");
  await weth.deployed();
  console.log(`✅ WETH deployed to: ${weth.address}`);
  console.log("");

  // For localhost, mint initial tokens to deployer
  if (chainId === 31337) {
    console.log("🪙 Minting initial tokens to deployer (localhost only)...");
    const mintAmount = ethers.utils.parseEther("10000");

    await dai.mint(deployer.address, mintAmount);
    await usdc.mint(deployer.address, mintAmount);
    await weth.mint(deployer.address, mintAmount);

    console.log("✅ Minted 10,000 of each token to deployer");
    console.log("");
  }

  // Save deployment info
  const deployment = {
    network: networkName,
    chainId: chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      interestRateModel: interestRateModel.address,
      lendingPool: lendingPool.address,
      tokens: {
        DAI: dai.address,
        USDC: usdc.address,
        WETH: weth.address,
      },
    },
  };

  // Save to network-specific file
  const fileName = `deployment-${networkName}.json`;
  fs.writeFileSync(fileName, JSON.stringify(deployment, null, 2));
  console.log(`💾 Deployment info saved to: ${fileName}`);
  console.log("");

  // Also update main deployment.json for localhost
  if (chainId === 31337) {
    fs.writeFileSync("deployment.json", JSON.stringify(deployment, null, 2));
    console.log(`💾 Updated deployment.json`);
    console.log("");
  }

  // Print summary
  console.log("=".repeat(60));
  console.log("🎉 DEPLOYMENT SUCCESSFUL!");
  console.log("=".repeat(60));
  console.log("");
  console.log("📋 Contract Addresses:");
  console.log(`   Interest Rate Model: ${interestRateModel.address}`);
  console.log(`   Lending Pool:        ${lendingPool.address}`);
  console.log(`   DAI Token:           ${dai.address}`);
  console.log(`   USDC Token:          ${usdc.address}`);
  console.log(`   WETH Token:          ${weth.address}`);
  console.log("");

  if (chainId === 11155111) {
    console.log("🔗 View on Etherscan:");
    console.log(
      `   https://sepolia.etherscan.io/address/${lendingPool.address}`
    );
    console.log("");
    console.log("📝 Next Steps:");
    console.log("   1. Copy contract addresses to .env.local:");
    console.log(
      `      NEXT_PUBLIC_SEPOLIA_LENDING_POOL=${lendingPool.address}`
    );
    console.log(`      NEXT_PUBLIC_SEPOLIA_DAI=${dai.address}`);
    console.log(`      NEXT_PUBLIC_SEPOLIA_USDC=${usdc.address}`);
    console.log(`      NEXT_PUBLIC_SEPOLIA_WETH=${weth.address}`);
    console.log("");
    console.log("   2. Update lib/contracts.ts with new addresses");
    console.log("   3. Deploy frontend to Vercel");
    console.log("");
    console.log("💡 Users can mint test tokens by calling:");
    console.log("   - dai.mint(userAddress, amount)");
    console.log("   - usdc.mint(userAddress, amount)");
    console.log("   - weth.mint(userAddress, amount)");
  } else {
    console.log("📝 Next Steps:");
    console.log("   1. Start frontend: npm run dev");
    console.log("   2. Open http://localhost:3000");
    console.log("   3. Connect MetaMask to localhost network");
    console.log("   4. Start using the platform!");
  }

  console.log("");
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
