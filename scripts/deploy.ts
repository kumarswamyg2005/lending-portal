import hre from "hardhat";

async function main() {
  console.log("Deploying lending platform...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // Deploy mock tokens
  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  const dai = await MockERC20.deploy("Dai Stablecoin", "DAI", 18);
  const usdc = await MockERC20.deploy("USD Coin", "USDC", 6);
  const weth = await MockERC20.deploy("Wrapped Ether", "WETH", 18);

  await dai.waitForDeployment();
  await usdc.waitForDeployment();
  await weth.waitForDeployment();

  console.log("DAI:", await dai.getAddress());
  console.log("USDC:", await usdc.getAddress());
  console.log("WETH:", await weth.getAddress());

  // Deploy interest rate model
  const InterestRateModel = await hre.ethers.getContractFactory(
    "VariableInterestRateModel"
  );
  const dummyLendingPool = hre.ethers.ZeroAddress;
  const interestModel = await InterestRateModel.deploy(dummyLendingPool);
  await interestModel.waitForDeployment();
  console.log("InterestModel:", await interestModel.getAddress());

  // Deploy lending pool
  const LendingPool = await hre.ethers.getContractFactory("LendingPool");
  const lendingPool = await LendingPool.deploy(
    await interestModel.getAddress()
  );
  await lendingPool.waitForDeployment();
  console.log("LendingPool:", await lendingPool.getAddress());

  // Update interest model with correct lending pool address
  await interestModel
    .connect(deployer)
    .transferOwnership(await lendingPool.getAddress());

  // Deploy flash loan receiver
  const FlashLoanReceiver = await hre.ethers.getContractFactory(
    "FlashLoanReceiver"
  );
  const flashLoanReceiver = await FlashLoanReceiver.deploy(
    await lendingPool.getAddress()
  );
  await flashLoanReceiver.waitForDeployment();
  console.log("FlashLoanReceiver:", await flashLoanReceiver.getAddress());

  // Add markets
  await lendingPool.addMarket(await dai.getAddress());
  await lendingPool.addMarket(await usdc.getAddress());
  await lendingPool.addMarket(await weth.getAddress());
  console.log("Markets added");

  // Save deployment
  const deployment = {
    dai: await dai.getAddress(),
    usdc: await usdc.getAddress(),
    weth: await weth.getAddress(),
    lendingPool: await lendingPool.getAddress(),
    interestModel: await interestModel.getAddress(),
    flashLoanReceiver: await flashLoanReceiver.getAddress(),
  };

  const fs = await import("fs");
  fs.writeFileSync("deployment.json", JSON.stringify(deployment, null, 2));
  console.log("Deployment saved to deployment.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
