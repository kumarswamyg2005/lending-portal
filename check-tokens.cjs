const ethers = require("ethers");

async function checkTokenBalance() {
  const provider = new ethers.providers.JsonRpcProvider(
    "http://127.0.0.1:8545"
  );

  // Your MetaMask account
  const address = "0xca5b3038a012294065c729f61e4c1618dbadf6bd";

  // Token addresses
  const dai = "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e";
  const usdc = "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0";
  const weth = "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82";

  const tokenAbi = [
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
  ];

  const tokens = [
    { address: dai, name: "DAI" },
    { address: usdc, name: "USDC" },
    { address: weth, name: "WETH" },
  ];

  console.log(`Token balances for ${address}:\n`);

  for (const token of tokens) {
    const contract = new ethers.Contract(token.address, tokenAbi, provider);
    const balance = await contract.balanceOf(address);
    const decimals = await contract.decimals();
    const symbol = await contract.symbol();
    console.log(`${symbol}: ${ethers.utils.formatUnits(balance, decimals)}`);
  }
}

checkTokenBalance().catch(console.error);
