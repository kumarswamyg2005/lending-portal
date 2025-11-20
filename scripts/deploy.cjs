const hre = require("hardhat");

async function main() {
  console.log("Deploying lending platform...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // Deploy mock tokens
  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  const dai = await MockERC20.deploy("Dai Stablecoin", "DAI", 18);
  const usdc = await MockERC20.deploy("USD Coin", "USDC", 6);
  const weth = await MockERC20.deploy("Wrapped Ether", "WETH", 18);

  await dai.deployed();
  await usdc.deployed();
  await weth.deployed();

  console.log("DAI:", dai.address);
  console.log("USDC:", usdc.address);
  console.log("WETH:", weth.address);

  // Deploy interest rate model
  const InterestRateModel = await hre.ethers.getContractFactory(
    "VariableInterestRateModel"
  );
  const dummyLendingPool = hre.ethers.constants.AddressZero;
  const interestModel = await InterestRateModel.deploy(dummyLendingPool);
  await interestModel.deployed();
  console.log("InterestModel:", interestModel.address);

  // Deploy lending pool
  const LendingPool = await hre.ethers.getContractFactory("LendingPool");
  const lendingPool = await LendingPool.deploy(interestModel.address);
  await lendingPool.deployed();
  console.log("LendingPool:", lendingPool.address);

  // Update interest model with actual lending pool address
  await interestModel.setLendingPool(lendingPool.address);
  console.log("InterestModel updated with LendingPool address");

  // Skip transferOwnership - not critical for demo

  // Deploy flash loan receiver
  const FlashLoanReceiver = await hre.ethers.getContractFactory(
    "FlashLoanReceiver"
  );
  const flashLoanReceiver = await FlashLoanReceiver.deploy(lendingPool.address);
  await flashLoanReceiver.deployed();
  console.log("FlashLoanReceiver:", flashLoanReceiver.address);

  // Add markets
  await lendingPool.addMarket(dai.address);
  await lendingPool.addMarket(usdc.address);
  await lendingPool.addMarket(weth.address);
  console.log("Markets added");

  // Save deployment
  const deployment = {
    lendingPool: lendingPool.address,
    tokens: {
      DAI: dai.address,
      USDC: usdc.address,
      WETH: weth.address,
    },
    interestModel: interestModel.address,
    flashLoanReceiver: flashLoanReceiver.address,
    network: "localhost",
    chainId: 31337,
    deployer: deployer.address,
  };

  const fs = require("fs");
  fs.writeFileSync("deployment.json", JSON.stringify(deployment, null, 2));
  console.log("Deployment saved to deployment.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
