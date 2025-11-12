import { ethers } from "ethers";
import fs from "fs";

async function main() {
  console.log("🚀 Deploying DeFi Lending Platform...\n");

  // Connect to localhost
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const signer = await provider.getSigner(0);

  console.log("Deployer account:", await signer.getAddress());
  console.log(
    "Balance:",
    ethers.formatEther(await provider.getBalance(await signer.getAddress())),
    "ETH\n"
  );

  // Read compiled contracts
  const daiArtifact = JSON.parse(
    fs.readFileSync(
      "./artifacts/contracts/MockERC20.sol/MockERC20.json",
      "utf8"
    )
  );
  const lendingPoolArtifact = JSON.parse(
    fs.readFileSync(
      "./artifacts/contracts/LendingPool.sol/LendingPool.json",
      "utf8"
    )
  );
  const interestModelArtifact = JSON.parse(
    fs.readFileSync(
      "./artifacts/contracts/VariableInterestRateModel.sol/VariableInterestRateModel.json",
      "utf8"
    )
  );
  const flashLoanArtifact = JSON.parse(
    fs.readFileSync(
      "./artifacts/contracts/FlashLoanReceiver.sol/FlashLoanReceiver.json",
      "utf8"
    )
  );

  // Deploy DAI
  console.log("1️⃣  Deploying DAI Token...");
  const DAI = new ethers.ContractFactory(
    daiArtifact.abi,
    daiArtifact.bytecode,
    signer
  );
  const dai = await DAI.deploy("Dai Stablecoin", "DAI", 18);
  await dai.waitForDeployment();
  const daiAddress = await dai.getAddress();
  console.log("✅ DAI deployed to:", daiAddress);

  // Deploy USDC
  console.log("\n2️⃣  Deploying USDC Token...");
  const USDC = new ethers.ContractFactory(
    daiArtifact.abi,
    daiArtifact.bytecode,
    signer
  );
  const usdc = await USDC.deploy("USD Coin", "USDC", 6);
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("✅ USDC deployed to:", usdcAddress);

  // Deploy WETH
  console.log("\n3️⃣  Deploying WETH Token...");
  const WETH = new ethers.ContractFactory(
    daiArtifact.abi,
    daiArtifact.bytecode,
    signer
  );
  const weth = await WETH.deploy("Wrapped Ether", "WETH", 18);
  await weth.waitForDeployment();
  const wethAddress = await weth.getAddress();
  console.log("✅ WETH deployed to:", wethAddress);

  // Deploy Interest Rate Model
  console.log("\n4️⃣  Deploying Interest Rate Model...");
  const InterestModel = new ethers.ContractFactory(
    interestModelArtifact.abi,
    interestModelArtifact.bytecode,
    signer
  );
  const interestModel = await InterestModel.deploy(ethers.ZeroAddress);
  await interestModel.waitForDeployment();
  const interestModelAddress = await interestModel.getAddress();
  console.log("✅ Interest Rate Model deployed to:", interestModelAddress);

  // Deploy Lending Pool
  console.log("\n5️⃣  Deploying Lending Pool...");
  const LendingPool = new ethers.ContractFactory(
    lendingPoolArtifact.abi,
    lendingPoolArtifact.bytecode,
    signer
  );
  const lendingPool = await LendingPool.deploy(interestModelAddress);
  await lendingPool.waitForDeployment();
  const lendingPoolAddress = await lendingPool.getAddress();
  console.log("✅ Lending Pool deployed to:", lendingPoolAddress);

  // Deploy Flash Loan Receiver
  console.log("\n6️⃣  Deploying Flash Loan Receiver...");
  const FlashLoan = new ethers.ContractFactory(
    flashLoanArtifact.abi,
    flashLoanArtifact.bytecode,
    signer
  );
  const flashLoan = await FlashLoan.deploy(lendingPoolAddress);
  await flashLoan.waitForDeployment();
  const flashLoanAddress = await flashLoan.getAddress();
  console.log("✅ Flash Loan Receiver deployed to:", flashLoanAddress);

  // Add markets to lending pool
  console.log("\n7️⃣  Adding token markets...");
  await lendingPool.addMarket(daiAddress);
  console.log("   Added DAI market");
  await lendingPool.addMarket(usdcAddress);
  console.log("   Added USDC market");
  await lendingPool.addMarket(wethAddress);
  console.log("   Added WETH market");

  // Save deployment info
  const deployment = {
    lendingPool: lendingPoolAddress,
    tokens: {
      DAI: daiAddress,
      USDC: usdcAddress,
      WETH: wethAddress,
    },
    interestModel: interestModelAddress,
    flashLoanReceiver: flashLoanAddress,
    network: "localhost",
    chainId: 31337,
    deployer: await signer.getAddress(),
  };

  fs.writeFileSync("deployment.json", JSON.stringify(deployment, null, 2));

  console.log("\n✅ Deployment complete!");
  console.log("📝 Deployment info saved to deployment.json\n");
  console.log("📋 Contract Addresses:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  DAI:           ", daiAddress);
  console.log("  USDC:          ", usdcAddress);
  console.log("  WETH:          ", wethAddress);
  console.log("  LendingPool:   ", lendingPoolAddress);
  console.log("  InterestModel: ", interestModelAddress);
  console.log("  FlashLoan:     ", flashLoanAddress);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
