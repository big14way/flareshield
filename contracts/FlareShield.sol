// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Flare FTSO Interface for price feeds
interface IFtsoV2 {
    function getFeedById(bytes21 _feedId) external view returns (
        uint256 _value,
        int8 _decimals,
        uint64 _timestamp
    );
    
    function getFeedByIdInWei(bytes21 _feedId) external view returns (
        uint256 _value,
        uint64 _timestamp
    );
}

// Flare Data Connector Interface for cross-chain verification
interface IFdcHub {
    function getAttestation(bytes32 _attestationType, bytes calldata _request) 
        external view returns (bytes memory);
}

// FAssets Interface
interface IFAssetManager {
    function getCollateralRatio(address _agent) external view returns (uint256);
}

/**
 * @title FlareShield
 * @notice Parametric Insurance Protocol for Flare Network
 * @dev Uses FTSO for price feeds, FDC for cross-chain verification
 */
contract FlareShield is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ Structs ============
    
    struct Policy {
        address holder;
        uint256 premium;
        uint256 coverage;
        uint256 strikePrice;      // Price threshold for payout
        bytes21 assetFeedId;      // FTSO feed ID for the asset
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        bool isClaimed;
        PolicyType policyType;
    }

    struct Pool {
        uint256 totalLiquidity;
        uint256 totalCoverage;    // Total coverage obligations
        uint256 availableLiquidity;
        uint256 rewardRate;       // APY for liquidity providers (basis points)
    }

    struct LiquidityPosition {
        uint256 amount;
        uint256 depositTime;
        uint256 rewardsEarned;
        uint256 lastClaimTime;
    }

    // ============ Enums ============
    
    enum PolicyType {
        DEPEG_PROTECTION,      // Stablecoin depeg protection
        PRICE_DROP,            // Asset price drop protection
        FASSET_COLLATERAL,     // FAsset collateral ratio protection
        CROSS_CHAIN_BRIDGE     // Bridge failure protection
    }

    // ============ State Variables ============
    
    IFtsoV2 public ftsoV2;
    IFdcHub public fdcHub;
    
    // Native token (FLR) used for premiums and payouts
    IERC20 public paymentToken;
    
    Pool public insurancePool;
    
    mapping(uint256 => Policy) public policies;
    mapping(address => uint256[]) public userPolicies;
    mapping(address => LiquidityPosition) public liquidityPositions;
    
    uint256 public nextPolicyId;
    uint256 public constant PREMIUM_RATE = 250;        // 2.5% of coverage
    uint256 public constant MIN_COVERAGE = 100e18;     // Minimum 100 tokens
    uint256 public constant MAX_COVERAGE = 1000000e18; // Maximum 1M tokens
    uint256 public constant LP_REWARD_RATE = 1500;     // 15% APY
    uint256 public constant BASIS_POINTS = 10000;
    
    // FTSO Feed IDs (Flare Coston2 testnet)
    bytes21 public constant FLR_USD_FEED = bytes21(0x01464c522f55534400000000000000000000000000); // FLR/USD
    bytes21 public constant BTC_USD_FEED = bytes21(0x014254432f55534400000000000000000000000000); // BTC/USD
    bytes21 public constant XRP_USD_FEED = bytes21(0x015852502f55534400000000000000000000000000); // XRP/USD
    bytes21 public constant USDC_USD_FEED = bytes21(0x01555344432f555344000000000000000000000000); // USDC/USD
    bytes21 public constant USDT_USD_FEED = bytes21(0x01555344542f555344000000000000000000000000); // USDT/USD

    // ============ Events ============
    
    event PolicyCreated(
        uint256 indexed policyId,
        address indexed holder,
        uint256 coverage,
        uint256 premium,
        PolicyType policyType
    );
    
    event PolicyClaimed(
        uint256 indexed policyId,
        address indexed holder,
        uint256 payout,
        uint256 triggerPrice
    );
    
    event LiquidityAdded(address indexed provider, uint256 amount);
    event LiquidityRemoved(address indexed provider, uint256 amount);
    event RewardsClaimed(address indexed provider, uint256 amount);
    event PriceChecked(bytes21 feedId, uint256 price, uint64 timestamp);

    // ============ Constructor ============
    
    constructor(
        address _ftsoV2,
        address _fdcHub,
        address _paymentToken
    ) Ownable(msg.sender) {
        ftsoV2 = IFtsoV2(_ftsoV2);
        fdcHub = IFdcHub(_fdcHub);
        paymentToken = IERC20(_paymentToken);
        
        insurancePool = Pool({
            totalLiquidity: 0,
            totalCoverage: 0,
            availableLiquidity: 0,
            rewardRate: LP_REWARD_RATE
        });
    }

    // ============ Policy Functions ============
    
    /**
     * @notice Purchase a new insurance policy
     * @param _coverage Amount of coverage desired
     * @param _duration Duration in seconds
     * @param _policyType Type of insurance policy
     * @param _assetFeedId FTSO feed ID for the asset to monitor
     * @param _strikePrice Price threshold that triggers payout
     */
    function purchasePolicy(
        uint256 _coverage,
        uint256 _duration,
        PolicyType _policyType,
        bytes21 _assetFeedId,
        uint256 _strikePrice
    ) external nonReentrant returns (uint256 policyId) {
        require(_coverage >= MIN_COVERAGE, "Coverage too low");
        require(_coverage <= MAX_COVERAGE, "Coverage too high");
        require(_duration >= 1 days, "Duration too short");
        require(_duration <= 365 days, "Duration too long");
        require(insurancePool.availableLiquidity >= _coverage, "Insufficient pool liquidity");
        
        // Calculate premium based on coverage and duration
        uint256 premium = calculatePremium(_coverage, _duration, _policyType);
        
        // Transfer premium from user
        paymentToken.safeTransferFrom(msg.sender, address(this), premium);
        
        // Get current price as reference
        (uint256 currentPrice, , ) = ftsoV2.getFeedById(_assetFeedId);
        
        // If no strike price specified, use current price minus 10%
        if (_strikePrice == 0) {
            _strikePrice = (currentPrice * 90) / 100;
        }
        
        policyId = nextPolicyId++;
        
        policies[policyId] = Policy({
            holder: msg.sender,
            premium: premium,
            coverage: _coverage,
            strikePrice: _strikePrice,
            assetFeedId: _assetFeedId,
            startTime: block.timestamp,
            endTime: block.timestamp + _duration,
            isActive: true,
            isClaimed: false,
            policyType: _policyType
        });
        
        userPolicies[msg.sender].push(policyId);
        
        // Lock coverage from available liquidity
        insurancePool.totalCoverage += _coverage;
        insurancePool.availableLiquidity -= _coverage;
        
        emit PolicyCreated(policyId, msg.sender, _coverage, premium, _policyType);
    }

    /**
     * @notice Claim insurance payout if conditions are met
     * @param _policyId ID of the policy to claim
     */
    function claimPolicy(uint256 _policyId) external nonReentrant {
        Policy storage policy = policies[_policyId];
        
        require(policy.holder == msg.sender, "Not policy holder");
        require(policy.isActive, "Policy not active");
        require(!policy.isClaimed, "Already claimed");
        require(block.timestamp <= policy.endTime, "Policy expired");
        
        // Get current price from FTSO
        (uint256 currentPrice, , uint64 timestamp) = ftsoV2.getFeedById(policy.assetFeedId);
        
        emit PriceChecked(policy.assetFeedId, currentPrice, timestamp);
        
        // Check if trigger condition is met
        bool triggerMet = checkTriggerCondition(policy, currentPrice);
        require(triggerMet, "Trigger condition not met");
        
        // Mark as claimed
        policy.isClaimed = true;
        policy.isActive = false;
        
        // Calculate payout (coverage amount)
        uint256 payout = policy.coverage;
        
        // Release coverage obligation
        insurancePool.totalCoverage -= policy.coverage;
        insurancePool.totalLiquidity -= payout;
        
        // Transfer payout to holder
        paymentToken.safeTransfer(msg.sender, payout);
        
        emit PolicyClaimed(_policyId, msg.sender, payout, currentPrice);
    }

    /**
     * @notice Check if trigger condition is met for a policy
     */
    function checkTriggerCondition(Policy memory policy, uint256 currentPrice) 
        internal pure returns (bool) 
    {
        if (policy.policyType == PolicyType.DEPEG_PROTECTION) {
            // Stablecoin should stay near $1, trigger if drops below strike
            return currentPrice < policy.strikePrice;
        } else if (policy.policyType == PolicyType.PRICE_DROP) {
            // Asset price drops below strike price
            return currentPrice < policy.strikePrice;
        } else if (policy.policyType == PolicyType.FASSET_COLLATERAL) {
            // For FAsset, strike price represents minimum collateral ratio
            return currentPrice < policy.strikePrice;
        } else if (policy.policyType == PolicyType.CROSS_CHAIN_BRIDGE) {
            // Bridge failure detection via FDC
            return currentPrice < policy.strikePrice;
        }
        return false;
    }

    /**
     * @notice Calculate premium for a policy
     */
    function calculatePremium(
        uint256 _coverage,
        uint256 _duration,
        PolicyType _policyType
    ) public pure returns (uint256) {
        // Base premium rate: 2.5% of coverage
        uint256 basePremium = (_coverage * PREMIUM_RATE) / BASIS_POINTS;
        
        // Duration multiplier (longer = higher premium)
        uint256 durationMultiplier = (_duration * 100) / 365 days;
        if (durationMultiplier < 10) durationMultiplier = 10; // Minimum 10%
        
        // Policy type risk multiplier
        uint256 riskMultiplier = 100;
        if (_policyType == PolicyType.DEPEG_PROTECTION) {
            riskMultiplier = 80;  // Lower risk
        } else if (_policyType == PolicyType.PRICE_DROP) {
            riskMultiplier = 120; // Higher risk
        } else if (_policyType == PolicyType.FASSET_COLLATERAL) {
            riskMultiplier = 100; // Medium risk
        } else if (_policyType == PolicyType.CROSS_CHAIN_BRIDGE) {
            riskMultiplier = 150; // Highest risk
        }
        
        return (basePremium * durationMultiplier * riskMultiplier) / 10000;
    }

    // ============ Liquidity Provider Functions ============
    
    /**
     * @notice Add liquidity to the insurance pool
     * @param _amount Amount to deposit
     */
    function addLiquidity(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be > 0");
        
        paymentToken.safeTransferFrom(msg.sender, address(this), _amount);
        
        LiquidityPosition storage position = liquidityPositions[msg.sender];
        
        // Claim pending rewards first
        if (position.amount > 0) {
            _claimRewards(msg.sender);
        }
        
        position.amount += _amount;
        position.depositTime = block.timestamp;
        position.lastClaimTime = block.timestamp;
        
        insurancePool.totalLiquidity += _amount;
        insurancePool.availableLiquidity += _amount;
        
        emit LiquidityAdded(msg.sender, _amount);
    }

    /**
     * @notice Remove liquidity from the insurance pool
     * @param _amount Amount to withdraw
     */
    function removeLiquidity(uint256 _amount) external nonReentrant {
        LiquidityPosition storage position = liquidityPositions[msg.sender];
        
        require(position.amount >= _amount, "Insufficient balance");
        require(insurancePool.availableLiquidity >= _amount, "Liquidity locked in coverage");
        
        // Claim pending rewards first
        _claimRewards(msg.sender);
        
        position.amount -= _amount;
        
        insurancePool.totalLiquidity -= _amount;
        insurancePool.availableLiquidity -= _amount;
        
        paymentToken.safeTransfer(msg.sender, _amount);
        
        emit LiquidityRemoved(msg.sender, _amount);
    }

    /**
     * @notice Claim LP rewards
     */
    function claimRewards() external nonReentrant {
        _claimRewards(msg.sender);
    }

    /**
     * @notice Internal function to claim rewards
     */
    function _claimRewards(address _provider) internal {
        LiquidityPosition storage position = liquidityPositions[_provider];
        
        uint256 pendingRewards = calculatePendingRewards(_provider);
        
        if (pendingRewards > 0) {
            position.rewardsEarned += pendingRewards;
            position.lastClaimTime = block.timestamp;
            
            // Transfer rewards (from collected premiums)
            paymentToken.safeTransfer(_provider, pendingRewards);
            
            emit RewardsClaimed(_provider, pendingRewards);
        }
    }

    /**
     * @notice Calculate pending rewards for a liquidity provider
     */
    function calculatePendingRewards(address _provider) public view returns (uint256) {
        LiquidityPosition memory position = liquidityPositions[_provider];
        
        if (position.amount == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - position.lastClaimTime;
        
        // APY calculation: (amount * rate * time) / (365 days * BASIS_POINTS)
        uint256 rewards = (position.amount * insurancePool.rewardRate * timeElapsed) 
            / (365 days * BASIS_POINTS);
        
        return rewards;
    }

    // ============ View Functions ============
    
    /**
     * @notice Get current price from FTSO
     */
    function getCurrentPrice(bytes21 _feedId) external view returns (
        uint256 price,
        int8 decimals,
        uint64 timestamp
    ) {
        return ftsoV2.getFeedById(_feedId);
    }

    /**
     * @notice Get all policies for a user
     */
    function getUserPolicies(address _user) external view returns (uint256[] memory) {
        return userPolicies[_user];
    }

    /**
     * @notice Get policy details
     */
    function getPolicy(uint256 _policyId) external view returns (Policy memory) {
        return policies[_policyId];
    }

    /**
     * @notice Get liquidity position
     */
    function getLiquidityPosition(address _provider) external view returns (
        uint256 amount,
        uint256 depositTime,
        uint256 rewardsEarned,
        uint256 pendingRewards
    ) {
        LiquidityPosition memory position = liquidityPositions[_provider];
        return (
            position.amount,
            position.depositTime,
            position.rewardsEarned,
            calculatePendingRewards(_provider)
        );
    }

    /**
     * @notice Get pool statistics
     */
    function getPoolStats() external view returns (
        uint256 totalLiquidity,
        uint256 totalCoverage,
        uint256 availableLiquidity,
        uint256 utilizationRate
    ) {
        uint256 utilization = insurancePool.totalLiquidity > 0 
            ? (insurancePool.totalCoverage * BASIS_POINTS) / insurancePool.totalLiquidity 
            : 0;
            
        return (
            insurancePool.totalLiquidity,
            insurancePool.totalCoverage,
            insurancePool.availableLiquidity,
            utilization
        );
    }

    /**
     * @notice Check if a policy can be claimed
     */
    function canClaim(uint256 _policyId) external view returns (bool, string memory) {
        Policy memory policy = policies[_policyId];
        
        if (!policy.isActive) return (false, "Policy not active");
        if (policy.isClaimed) return (false, "Already claimed");
        if (block.timestamp > policy.endTime) return (false, "Policy expired");
        
        (uint256 currentPrice, , ) = ftsoV2.getFeedById(policy.assetFeedId);
        
        if (checkTriggerCondition(policy, currentPrice)) {
            return (true, "Trigger condition met");
        }
        
        return (false, "Trigger condition not met");
    }

    // ============ Admin Functions ============
    
    /**
     * @notice Update FTSO address
     */
    function setFtsoV2(address _ftsoV2) external onlyOwner {
        ftsoV2 = IFtsoV2(_ftsoV2);
    }

    /**
     * @notice Update FDC Hub address
     */
    function setFdcHub(address _fdcHub) external onlyOwner {
        fdcHub = IFdcHub(_fdcHub);
    }

    /**
     * @notice Update reward rate for LPs
     */
    function setRewardRate(uint256 _newRate) external onlyOwner {
        require(_newRate <= 5000, "Rate too high"); // Max 50% APY
        insurancePool.rewardRate = _newRate;
    }

    /**
     * @notice Emergency withdraw (only owner, only excess funds)
     */
    function emergencyWithdraw(uint256 _amount) external onlyOwner {
        uint256 excessFunds = paymentToken.balanceOf(address(this)) - insurancePool.totalLiquidity;
        require(_amount <= excessFunds, "Cannot withdraw locked funds");
        paymentToken.safeTransfer(owner(), _amount);
    }
}
