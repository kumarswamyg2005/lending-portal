import hre from "hardhat";
import fs from "fs";

async function main() {
  console.log("🚀 Deploying DeFi Lending Platform...\n");

  // Get deployer
  const signers = await hre.network.provider.request({
    method: "eth_accounts",
    params: [],
  });
  console.log("Deployer account:", signers[0]);

  // Deploy DAI
  console.log("\n1️⃣  Deploying DAI Token...");
  const daiAddress = await hre.ignition
    .deploy("MockERC20", {
      constructorArgs: ["Dai Stablecoin", "DAI", 18],
    })
    .then((c) => c.address);
  console.log("✅ DAI deployed to:", daiAddress);

  // Deploy USDC
  console.log("\n2️⃣  Deploying USDC Token...");
  const usdcAddress = await hre.ignition
    .deploy("MockERC20", {
      constructorArgs: ["USD Coin", "USDC", 6],
    })
    .then((c) => c.address);
  console.log("✅ USDC deployed to:", usdcAddress);

  // Deploy WETH
  console.log("\n3️⃣  Deploying WETH Token...");
  const wethAddress = await hre.ignition
    .deploy("MockERC20", {
      constructorArgs: ["Wrapped Ether", "WETH", 18],
    })
    .then((c) => c.address);
  console.log("✅ WETH deployed to:", wethAddress);

  // Deploy Interest Rate Model
  console.log("\n4️⃣  Deploying Interest Rate Model...");
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  const interestModelAddress = await hre.ignition
    .deploy("VariableInterestRateModel", {
      constructorArgs: [zeroAddress],
    })
    .then((c) => c.address);
  console.log("✅ Interest Rate Model deployed to:", interestModelAddress);

  // Deploy Lending Pool
  console.log("\n5️⃣  Deploying Lending Pool...");
  const lendingPoolAddress = await hre.ignition
    .deploy("LendingPool", {
      constructorArgs: [interestModelAddress],
    })
    .then((c) => c.address);
  console.log("✅ Lending Pool deployed to:", lendingPoolAddress);

  // Deploy Flash Loan Receiver
  console.log("\n6️⃣  Deploying Flash Loan Receiver...");
  const flashLoanReceiverAddress = await hre.ignition
    .deploy("FlashLoanReceiver", {
      constructorArgs: [lendingPoolAddress],
    })
    .then((c) => c.address);
  console.log("✅ Flash Loan Receiver deployed to:", flashLoanReceiverAddress);

  // Save deployment info
  const deployment = {
    lendingPool: lendingPoolAddress,
    tokens: {
      DAI: daiAddress,
      USDC: usdcAddress,
      WETH: wethAddress,
    },
    interestModel: interestModelAddress,
    flashLoanReceiver: flashLoanReceiverAddress,
    network: "localhost",
    chainId: 31337,
    deployer: signers[0],
  };

  fs.writeFileSync("deployment.json", JSON.stringify(deployment, null, 2));

  console.log("\n✅ Deployment complete!");
  console.log("📝 Deployment info saved to deployment.json\n");
  console.log("Contract Addresses:");
  console.log("  DAI:          ", daiAddress);
  console.log("  USDC:         ", usdcAddress);
  console.log("  WETH:         ", wethAddress);
  console.log("  LendingPool:  ", lendingPoolAddress);
  console.log("  InterestModel:", interestModelAddress);
  console.log("  FlashLoan:    ", flashLoanReceiverAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
