import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DeployAllModule = buildModule("DeployAll", (m) => {
  // Deploy mock tokens
  const dai = m.contract("MockERC20", ["Dai Stablecoin", "DAI", 18]);
  const usdc = m.contract("MockERC20", ["USD Coin", "USDC", 6], { id: "USDC" });
  const weth = m.contract("MockERC20", ["Wrapped Ether", "WETH", 18], {
    id: "WETH",
  });

  // Deploy interest rate model with zero address placeholder
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  const interestModel = m.contract("VariableInterestRateModel", [zeroAddress]);

  // Deploy lending pool
  const lendingPool = m.contract("LendingPool", [interestModel]);

  // Deploy flash loan receiver
  const flashLoanReceiver = m.contract("FlashLoanReceiver", [lendingPool]);

  return { dai, usdc, weth, interestModel, lendingPool, flashLoanReceiver };
});

export default DeployAllModule;
