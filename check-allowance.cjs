const ethers = require("ethers");

async function checkAllowance() {
  const provider = new ethers.providers.JsonRpcProvider(
    "http://127.0.0.1:8545"
  );

  // Your MetaMask account
  const userAddress = "0xca5b3038a012294065c729f61e4c1618dbadf6bd";
  // LendingPool address
  const lendingPoolAddress = "0x0B306BF915C4d645ff596e518fAf3F9669b97016";
  // DAI token address
  const daiAddress = "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e";

  const tokenAbi = [
    "function allowance(address owner, address spender) view returns (uint256)",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
  ];

  const dai = new ethers.Contract(daiAddress, tokenAbi, provider);

  const allowance = await dai.allowance(userAddress, lendingPoolAddress);
  const balance = await dai.balanceOf(userAddress);
  const decimals = await dai.decimals();

  console.log("Your DAI balance:", ethers.utils.formatUnits(balance, decimals));
  console.log(
    "Allowance to LendingPool:",
    ethers.utils.formatUnits(allowance, decimals)
  );
  console.log("");

  if (allowance.lt(balance)) {
    console.log("⚠️ WARNING: Allowance is less than balance!");
    console.log(
      "You approved:",
      ethers.utils.formatUnits(allowance, decimals),
      "DAI"
    );
    console.log(
      "But you have:",
      ethers.utils.formatUnits(balance, decimals),
      "DAI"
    );
    console.log("");
    console.log("The contract can only transfer up to the approved amount.");
  } else {
    console.log("✅ Allowance is sufficient");
  }
}

checkAllowance().catch(console.error);
