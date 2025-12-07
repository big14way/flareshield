// FlareShield Contract ABI
export const FLARESHIELD_ABI = [
  // Events
  "event PolicyCreated(uint256 indexed policyId, address indexed holder, uint256 coverage, uint256 premium, uint8 policyType)",
  "event PolicyClaimed(uint256 indexed policyId, address indexed holder, uint256 payout, uint256 triggerPrice)",
  "event LiquidityAdded(address indexed provider, uint256 amount)",
  "event LiquidityRemoved(address indexed provider, uint256 amount)",
  "event RewardsClaimed(address indexed provider, uint256 amount)",
  "event PriceChecked(bytes21 feedId, uint256 price, uint64 timestamp)",

  // View Functions
  "function getPoolStats() external view returns (uint256 totalLiquidity, uint256 totalCoverage, uint256 availableLiquidity, uint256 utilizationRate)",
  "function getUserPolicies(address _user) external view returns (uint256[] memory)",
  "function getPolicy(uint256 _policyId) external view returns (tuple(address holder, uint256 premium, uint256 coverage, uint256 strikePrice, bytes21 assetFeedId, uint256 startTime, uint256 endTime, bool isActive, bool isClaimed, uint8 policyType))",
  "function getLiquidityPosition(address _provider) external view returns (uint256 amount, uint256 depositTime, uint256 rewardsEarned, uint256 pendingRewards)",
  "function calculatePremium(uint256 _coverage, uint256 _duration, uint8 _policyType) external pure returns (uint256)",
  "function calculatePendingRewards(address _provider) external view returns (uint256)",
  "function canClaim(uint256 _policyId) external view returns (bool, string memory)",
  "function getCurrentPrice(bytes21 _feedId) external view returns (uint256 price, int8 decimals, uint64 timestamp)",
  "function insurancePool() external view returns (uint256 totalLiquidity, uint256 totalCoverage, uint256 availableLiquidity, uint256 rewardRate)",

  // State Changing Functions
  "function purchasePolicy(uint256 _coverage, uint256 _duration, uint8 _policyType, bytes21 _assetFeedId, uint256 _strikePrice) external returns (uint256 policyId)",
  "function claimPolicy(uint256 _policyId) external",
  "function addLiquidity(uint256 _amount) external",
  "function removeLiquidity(uint256 _amount) external",
  "function claimRewards() external",

  // Constants
  "function PREMIUM_RATE() external view returns (uint256)",
  "function MIN_COVERAGE() external view returns (uint256)",
  "function MAX_COVERAGE() external view returns (uint256)",
  "function LP_REWARD_RATE() external view returns (uint256)",
  
  // Feed IDs
  "function FLR_USD_FEED() external view returns (bytes21)",
  "function BTC_USD_FEED() external view returns (bytes21)",
  "function XRP_USD_FEED() external view returns (bytes21)",
  "function USDC_USD_FEED() external view returns (bytes21)",
  "function USDT_USD_FEED() external view returns (bytes21)",
];

// Mock WFLR Token ABI
export const MOCKWFLR_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount) external",
  "function faucet() external",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
];

// Mock FTSO ABI
export const MOCKFTSO_ABI = [
  "function getFeedById(bytes21 _feedId) external view returns (uint256 _value, int8 _decimals, uint64 _timestamp)",
  "function getFeedByIdInWei(bytes21 _feedId) external view returns (uint256 _value, uint64 _timestamp)",
  "function setPrice(bytes21 _feedId, uint256 _price) external",
  "function simulateCrash(bytes21 _feedId, uint256 _percentageDrop) external",
  "function simulateDepeg(bytes21 _feedId) external",
  "function resetPrices() external",
  "function prices(bytes21) external view returns (uint256)",
  "function decimals(bytes21) external view returns (int8)",
  "function FLR_USD() external view returns (bytes21)",
  "function BTC_USD() external view returns (bytes21)",
  "function XRP_USD() external view returns (bytes21)",
  "function USDC_USD() external view returns (bytes21)",
  "function USDT_USD() external view returns (bytes21)",
  "function ETH_USD() external view returns (bytes21)",
  "function DOGE_USD() external view returns (bytes21)",
];

// Mock FDC Hub ABI
export const MOCKFDC_ABI = [
  "function getAttestation(bytes32 _attestationType, bytes calldata _request) external view returns (bytes memory)",
  "function storeAttestation(bytes32 _attestationType, bytes calldata _request, bytes calldata _response) external",
  "function verifyBitcoinPayment(bytes32 _txHash, address _recipient, uint256 _amount) external pure returns (bool verified, string memory message)",
  "function verifyXRPPayment(bytes32 _txHash, string calldata _destination, uint256 _amount) external pure returns (bool verified, string memory message)",
  "function verifyBridgeTransaction(uint256 _sourceChainId, uint256 _destChainId, bytes32 _txHash) external pure returns (bool success, uint256 status)",
  "function simulateBridgeFailure(bytes32 _attestationType, bytes calldata _request) external",
];
