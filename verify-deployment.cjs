const ethers = require("ethers");
const deployment = require("./deployment.json");

async function verifyDeployment() {
  const provider = new ethers.providers.JsonRpcProvider(
    "http://127.0.0.1:8545"
  );

  console.log("Checking deployment...\n");

  for (const [tokenName, address] of Object.entries(deployment.tokens)) {
    const code = await provider.getCode(address);
    const hasContract = code !== "0x";
    console.log(`${tokenName}: ${address}`);
    console.log(`  Has contract: ${hasContract ? "✅ YES" : "❌ NO"}`);
    console.log(`  Code length: ${code.length} chars\n`);
  }

  const poolCode = await provider.getCode(deployment.lendingPool);
  console.log(`LendingPool: ${deployment.lendingPool}`);
  console.log(`  Has contract: ${poolCode !== "0x" ? "✅ YES" : "❌ NO"}`);
  console.log(`  Code length: ${poolCode.length} chars`);
}

verifyDeployment().catch(console.error);
