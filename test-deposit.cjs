const ethers = require("ethers");

async function testDeposit() {
  const provider = new ethers.providers.JsonRpcProvider(
    "http://127.0.0.1:8545"
  );

  // Your MetaMask account - need to get private key from MetaMask
  // For testing, let's use the Hardhat deployer account
  const signer = provider.getSigner(0);
  const address = await signer.getAddress();
  console.log("Testing with address:", address);

  // Contract addresses - read from deployment.json so they match the local node
  const deployment = require("./deployment.json");
  const daiAddress = deployment.tokens.DAI;
  const lendingPoolAddress = deployment.lendingPool;

  const tokenAbi = [
    "function mint(address to, uint256 amount)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function allowance(address owner, address spender) view returns (uint256)",
  ];

  const lendingPoolAbi = [
    "function deposit(address token, uint256 amount)",
    "function supportedTokens(address token) view returns (bool)",
  ];

  const dai = new ethers.Contract(daiAddress, tokenAbi, signer);
  const lendingPool = new ethers.Contract(
    lendingPoolAddress,
    lendingPoolAbi,
    signer
  );

  try {
    // Check if token is supported
    const isSupported = await lendingPool.supportedTokens(daiAddress);
    console.log("Is DAI supported?", isSupported);

    if (!isSupported) {
      console.log("❌ DAI is NOT supported in the lending pool!");
      console.log("This is why the deposit is failing.");
      return;
    }

    // Mint 100 DAI to test account
    console.log("Minting 100 DAI...");
    const mintTx = await dai.mint(address, ethers.utils.parseUnits("100", 18));
    await mintTx.wait();

    const balance = await dai.balanceOf(address);
    console.log("DAI balance:", ethers.utils.formatUnits(balance, 18));

    // Approve
    console.log("Approving unlimited DAI...");
    const approveTx = await dai.approve(
      lendingPoolAddress,
      ethers.constants.MaxUint256
    );
    await approveTx.wait();

    const allowance = await dai.allowance(address, lendingPoolAddress);
    console.log("Allowance:", ethers.utils.formatUnits(allowance, 18));

    // Try to deposit
    console.log("Depositing 50 DAI...");
    const depositTx = await lendingPool.deposit(
      daiAddress,
      ethers.utils.parseUnits("50", 18)
    );
    const receipt = await depositTx.wait();
    console.log("✅ Deposit successful! Block:", receipt.blockNumber);
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.reason) console.error("Reason:", error.reason);
    if (error.error) console.error("Details:", error.error);
  }
}

testDeposit();
