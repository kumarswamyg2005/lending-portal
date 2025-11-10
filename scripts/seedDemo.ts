import { ethers } from "hardhat"

async function main() {
  const [deployer, lenderA, borrowerB, lenderC, flashLoanUser] = await ethers.getSigners()
  console.log("Seeding demo data...")

  // Load deployment
  const fs = await import("fs")
  const deployment = JSON.parse(fs.readFileSync("deployment.json", "utf-8"))

  const dai = await ethers.getContractAt("MockERC20", deployment.dai)
  const usdc = await ethers.getContractAt("MockERC20", deployment.usdc)
  const weth = await ethers.getContractAt("MockERC20", deployment.weth)
  const lendingPool = await ethers.getContractAt("LendingPool", deployment.lendingPool)

  // Mint tokens to demo accounts
  const oneMillionDAI = ethers.parseUnits("1000000", 18)
  const oneMillionUSDC = ethers.parseUnits("1000000", 6)
  const oneMillionWETH = ethers.parseUnits("1000000", 18)

  console.log("Minting tokens...")
  await dai.mint(lenderA.address, oneMillionDAI)
  await dai.mint(borrowerB.address, ethers.parseUnits("500000", 18))
  await usdc.mint(lenderC.address, oneMillionUSDC)
  await weth.mint(borrowerB.address, oneMillionWETH)
  await dai.mint(flashLoanUser.address, ethers.parseUnits("100000", 18))

  // Approve lending pool
  console.log("Approving tokens...")
  await dai.connect(lenderA).approve(deployment.lendingPool, ethers.parseUnits("100000", 18))
  await usdc.connect(lenderC).approve(deployment.lendingPool, ethers.parseUnits("100000", 18))
  await weth.connect(borrowerB).approve(deployment.lendingPool, ethers.parseUnits("1000", 18))
  await dai.connect(borrowerB).approve(deployment.lendingPool, ethers.parseUnits("50000", 18))

  // Deposit liquidity
  console.log("Depositing liquidity...")
  await lendingPool.connect(lenderA).deposit(deployment.dai, ethers.parseUnits("500000", 18))
  await lendingPool.connect(lenderC).deposit(deployment.usdc, ethers.parseUnits("300000", 6))

  console.log("LenderA deposited 500,000 DAI")
  console.log("LenderC deposited 300,000 USDC")

  // Create a borrow
  console.log("Creating borrow...")
  await lendingPool
    .connect(borrowerB)
    .borrow(deployment.weth, ethers.parseUnits("100", 18), deployment.dai, ethers.parseUnits("100000", 18))

  console.log("BorrowerB borrowed 100,000 DAI with 100 WETH collateral")

  // Flash loan
  console.log("Executing flash loan demo...")
  const flashAmount = ethers.parseUnits("50000", 18)
  const mockParams = ethers.toBeHex(0)

  await lendingPool
    .connect(flashLoanUser)
    .flashLoan(deployment.flashLoanReceiver, deployment.dai, flashAmount, mockParams)

  console.log("Flash loan executed successfully!")

  // Display demo state
  console.log("\n=== DEMO STATE ===")
  const daiMarket = await lendingPool.getMarket(deployment.dai)
  console.log(
    "DAI Market:",
    JSON.stringify(
      {
        totalLiquidity: ethers.formatUnits(daiMarket.totalLiquidity, 18),
        totalBorrows: ethers.formatUnits(daiMarket.totalBorrows, 18),
        utilization: ((Number(daiMarket.utilization) / 1e18) * 100).toFixed(2) + "%",
      },
      null,
      2,
    ),
  )

  const repA = await lendingPool.getReputation(lenderA.address)
  const repB = await lendingPool.getReputation(borrowerB.address)
  console.log("LenderA reputation:", repA.toString())
  console.log("BorrowerB reputation:", repB.toString())
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
