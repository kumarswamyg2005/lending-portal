import { ethers } from "ethers";
import fs from "fs";

// Contract ABIs (simplified for deployment)
const ERC20_BYTECODE = ""; // Will be loaded from compiled contracts
const LENDING_POOL_BYTECODE = "";

async function main() {
  console.log("🚀 Starting deployment to Hardhat local network...\n");

  // Connect to local Hardhat node
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  // Use Hardhat's first account (has 10000 ETH)
  const privateKey =
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log(`Deployer: ${wallet.address}`);
  console.log(
    `Balance: ${ethers.formatEther(
      await provider.getBalance(wallet.address)
    )} ETH\n`
  );

  // Read compiled contracts
  const daiArtifact = JSON.parse(
    fs.readFileSync("artifacts/contracts/MockERC20.sol/MockERC20.json", "utf8")
  );
  const lendingPoolArtifact = JSON.parse(
    fs.readFileSync(
      "artifacts/contracts/LendingPool.sol/LendingPool.json",
      "utf8"
    )
  );
  const interestModelArtifact = JSON.parse(
    fs.readFileSync(
      "artifacts/contracts/VariableInterestRateModel.sol/VariableInterestRateModel.json",
      "utf8"
    )
  );
  const flashLoanArtifact = JSON.parse(
    fs.readFileSync(
      "artifacts/contracts/FlashLoanReceiver.sol/FlashLoanReceiver.json",
      "utf8"
    )
  );

  // Deploy DAI
  console.log("📝 Deploying DAI...");
  const DAI = new ethers.ContractFactory(
    daiArtifact.abi,
    daiArtifact.bytecode,
    wallet
  );
  const dai = await DAI.deploy("Dai Stablecoin", "DAI", 18);
  await dai.waitForDeployment();
  const daiAddress = await dai.getAddress();
  console.log(`✅ DAI deployed at: ${daiAddress}\n`);

  // Deploy USDC
  console.log("📝 Deploying USDC...");
  const USDC = new ethers.ContractFactory(
    daiArtifact.abi,
    daiArtifact.bytecode,
    wallet
  );
  const usdc = await USDC.deploy("USD Coin", "USDC", 6);
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log(`✅ USDC deployed at: ${usdcAddress}\n`);

  // Deploy WETH
  console.log("📝 Deploying WETH...");
  const WETH = new ethers.ContractFactory(
    daiArtifact.abi,
    daiArtifact.bytecode,
    wallet
  );
  const weth = await WETH.deploy("Wrapped Ether", "WETH", 18);
  await weth.waitForDeployment();
  const wethAddress = await weth.getAddress();
  console.log(`✅ WETH deployed at: ${wethAddress}\n`);

  // Deploy Interest Rate Model
  console.log("📝 Deploying Interest Rate Model...");
  const InterestModel = new ethers.ContractFactory(
    interestModelArtifact.abi,
    interestModelArtifact.bytecode,
    wallet
  );
  const interestModel = await InterestModel.deploy(ethers.ZeroAddress);
  await interestModel.waitForDeployment();
  const interestModelAddress = await interestModel.getAddress();
  console.log(`✅ Interest Model deployed at: ${interestModelAddress}\n`);

  // Deploy Lending Pool
  console.log("📝 Deploying Lending Pool...");
  const LendingPool = new ethers.ContractFactory(
    lendingPoolArtifact.abi,
    lendingPoolArtifact.bytecode,
    wallet
  );
  const lendingPool = await LendingPool.deploy(interestModelAddress);
  await lendingPool.waitForDeployment();
  const lendingPoolAddress = await lendingPool.getAddress();
  console.log(`✅ Lending Pool deployed at: ${lendingPoolAddress}\n`);

  // Deploy Flash Loan Receiver
  console.log("📝 Deploying Flash Loan Receiver...");
  const FlashLoanReceiver = new ethers.ContractFactory(
    flashLoanArtifact.abi,
    flashLoanArtifact.bytecode,
    wallet
  );
  const flashLoanReceiver = await FlashLoanReceiver.deploy(lendingPoolAddress);
  await flashLoanReceiver.waitForDeployment();
  const flashLoanReceiverAddress = await flashLoanReceiver.getAddress();
  console.log(
    `✅ Flash Loan Receiver deployed at: ${flashLoanReceiverAddress}\n`
  );

  // Add markets to lending pool
  console.log("📝 Adding markets to lending pool...");
  await lendingPool.addMarket(daiAddress);
  await lendingPool.addMarket(usdcAddress);
  await lendingPool.addMarket(wethAddress);
  console.log("✅ Markets added\n");

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
    deployer: wallet.address,
  };

  fs.writeFileSync("deployment.json", JSON.stringify(deployment, null, 2));
  console.log("💾 Deployment info saved to deployment.json");

  console.log("\n🎉 Deployment complete!\n");
  console.log("📋 Summary:");
  console.log(`   DAI: ${daiAddress}`);
  console.log(`   USDC: ${usdcAddress}`);
  console.log(`   WETH: ${wethAddress}`);
  console.log(`   Lending Pool: ${lendingPoolAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
