import { expect } from "chai"
import { ethers } from "hardhat"
import type { LendingPool, MockERC20, VariableInterestRateModel } from "../typechain-types"

describe("LendingPool", () => {
  let lendingPool: LendingPool
  let interestModel: VariableInterestRateModel
  let dai: MockERC20
  let weth: MockERC20
  let owner: any
  let lender: any
  let borrower: any

  beforeEach(async () => {
    ;[owner, lender, borrower] = await ethers.getSigners()

    // Deploy tokens
    const MockERC20Factory = await ethers.getContractFactory("MockERC20")
    dai = await MockERC20Factory.deploy("Dai", "DAI", 18)
    weth = await MockERC20Factory.deploy("Wrapped Ether", "WETH", 18)

    // Deploy interest model
    const dummyPool = ethers.ZeroAddress
    const InterestModelFactory = await ethers.getContractFactory("VariableInterestRateModel")
    interestModel = await InterestModelFactory.deploy(dummyPool)

    // Deploy lending pool
    const LendingPoolFactory = await ethers.getContractFactory("LendingPool")
    lendingPool = await LendingPoolFactory.deploy(await interestModel.getAddress())

    // Add markets
    await lendingPool.addMarket(await dai.getAddress())
    await lendingPool.addMarket(await weth.getAddress())

    // Mint and approve
    const amount = ethers.parseUnits("1000000", 18)
    await dai.mint(lender.address, amount)
    await dai.mint(borrower.address, amount)
    await weth.mint(borrower.address, amount)

    await dai.connect(lender).approve(await lendingPool.getAddress(), amount)
    await dai.connect(borrower).approve(await lendingPool.getAddress(), amount)
    await weth.connect(borrower).approve(await lendingPool.getAddress(), amount)
  })

  describe("Deposit", () => {
    it("Should allow deposits", async () => {
      const depositAmount = ethers.parseUnits("1000", 18)
      await lendingPool.connect(lender).deposit(await dai.getAddress(), depositAmount)

      const market = await lendingPool.getMarket(await dai.getAddress())
      expect(market.totalLiquidity).to.equal(depositAmount)
    })

    it("Should track user deposits", async () => {
      const depositAmount = ethers.parseUnits("1000", 18)
      await lendingPool.connect(lender).deposit(await dai.getAddress(), depositAmount)

      const balance = await lendingPool.userDeposits(lender.address, await dai.getAddress())
      expect(balance).to.equal(depositAmount)
    })
  })

  describe("Borrow", () => {
    it("Should allow borrowing within LTV", async () => {
      // Setup: lender deposits
      await lendingPool.connect(lender).deposit(await dai.getAddress(), ethers.parseUnits("100000", 18))

      // Borrow: collateral=100 WETH, borrow=75000 DAI (LTV=75%)
      await lendingPool
        .connect(borrower)
        .borrow(
          await weth.getAddress(),
          ethers.parseUnits("100", 18),
          await dai.getAddress(),
          ethers.parseUnits("75000", 18),
        )

      const loan = await lendingPool.userLoans(borrower.address, 0)
      expect(loan.borrowAmount).to.equal(ethers.parseUnits("75000", 18))
      expect(loan.active).to.be.true
    })

    it("Should reject borrow exceeding LTV", async () => {
      await lendingPool.connect(lender).deposit(await dai.getAddress(), ethers.parseUnits("100000", 18))

      const tx = lendingPool
        .connect(borrower)
        .borrow(
          await weth.getAddress(),
          ethers.parseUnits("100", 18),
          await dai.getAddress(),
          ethers.parseUnits("100000", 18),
        )

      await expect(tx).to.be.revertedWith("Exceeds LTV limit")
    })
  })

  describe("Repay", () => {
    beforeEach(async () => {
      await lendingPool.connect(lender).deposit(await dai.getAddress(), ethers.parseUnits("100000", 18))
      await lendingPool
        .connect(borrower)
        .borrow(
          await weth.getAddress(),
          ethers.parseUnits("100", 18),
          await dai.getAddress(),
          ethers.parseUnits("50000", 18),
        )
    })

    it("Should allow repayment", async () => {
      const repayAmount = ethers.parseUnits("50000", 18)
      await lendingPool.connect(borrower).repay(0, repayAmount)

      const loan = await lendingPool.userLoans(borrower.address, 0)
      expect(loan.active).to.be.false
    })

    it("Should update reputation on repay", async () => {
      const repayAmount = ethers.parseUnits("50000", 18)
      await lendingPool.connect(borrower).repay(0, repayAmount)

      const reputation = await lendingPool.getReputation(borrower.address)
      expect(reputation).to.be.gt(0)
    })
  })

  describe("Flash Loans", () => {
    it("Should handle flash loans", async () => {
      await lendingPool.connect(lender).deposit(await dai.getAddress(), ethers.parseUnits("100000", 18))

      const FlashReceiverFactory = await ethers.getContractFactory("FlashLoanReceiver")
      const receiver = await FlashReceiverFactory.deploy(await lendingPool.getAddress())

      const flashAmount = ethers.parseUnits("10000", 18)
      await dai.mint(await receiver.getAddress(), ethers.parseUnits("100", 18))

      const tx = await lendingPool.flashLoan(await receiver.getAddress(), await dai.getAddress(), flashAmount, "0x")

      expect(tx).to.not.be.reverted
    })
  })

  describe("Reputation", () => {
    it("Should track reputation changes", async () => {
      await lendingPool.connect(lender).deposit(await dai.getAddress(), ethers.parseUnits("1000", 18))

      const repBefore = await lendingPool.getReputation(lender.address)
      expect(repBefore).to.be.gte(0)
    })
  })
})
