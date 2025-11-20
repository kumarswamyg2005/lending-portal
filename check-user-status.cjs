const ethers = require("ethers");

async function checkUserStatus() {
  const provider = new ethers.providers.JsonRpcProvider(
    "http://127.0.0.1:8545"
  );
  const userAddr = "0xca5b3038a012294065c729f61e4c1618dbadf6bd";

  console.log("=== CHECKING YOUR ACCOUNT ===\n");
  console.log("Address:", userAddr);

  // Check ETH balance
  const ethBal = await provider.getBalance(userAddr);
  console.log("ETH Balance:", ethers.utils.formatEther(ethBal), "ETH");

  // Load deployment
  const deployment = require("./deployment.json");

  // Check DAI
  const daiAbi = [
    "function balanceOf(address) view returns (uint256)",
    "function allowance(address,address) view returns (uint256)",
  ];
  const dai = new ethers.Contract(deployment.tokens.DAI, daiAbi, provider);

  const daiBal = await dai.balanceOf(userAddr);
  const daiAllowance = await dai.allowance(userAddr, deployment.lendingPool);

  console.log("\n=== TOKEN STATUS ===");
  console.log("DAI Balance:", ethers.utils.formatEther(daiBal), "DAI");
  console.log(
    "DAI Allowance for LendingPool:",
    ethers.utils.formatEther(daiAllowance),
    "DAI"
  );

  console.log("\n=== ISSUE FOUND? ===");
  if (parseFloat(ethers.utils.formatEther(daiBal)) === 0) {
    console.log("❌ You have 0 DAI tokens!");
    console.log(
      "👉 Solution: First MINT tokens before trying to supply/deposit"
    );
  } else {
    console.log("✅ You have DAI tokens");
  }

  if (parseFloat(ethers.utils.formatEther(daiAllowance)) === 0) {
    console.log("⚠️  LendingPool has 0 allowance");
    console.log("👉 This is normal - approval happens in the transaction");
  } else {
    console.log("✅ LendingPool already approved");
  }
}

checkUserStatus().catch(console.error);
