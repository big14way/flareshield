// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockFtsoV2
 * @notice Mock FTSO for local testing
 * @dev Simulates Flare Time Series Oracle functionality
 */
contract MockFtsoV2 {
    mapping(bytes21 => uint256) public prices;
    mapping(bytes21 => int8) public decimals;
    
    // Feed IDs
    bytes21 public constant FLR_USD = bytes21(0x01464c522f55534400000000000000000000000000);
    bytes21 public constant BTC_USD = bytes21(0x014254432f55534400000000000000000000000000);
    bytes21 public constant XRP_USD = bytes21(0x015852502f55534400000000000000000000000000);
    bytes21 public constant USDC_USD = bytes21(0x01555344432f555344000000000000000000000000);
    bytes21 public constant USDT_USD = bytes21(0x01555344542f555344000000000000000000000000);
    bytes21 public constant ETH_USD = bytes21(0x014554482f55534400000000000000000000000000);
    bytes21 public constant DOGE_USD = bytes21(0x01444f47452f555344000000000000000000000000);
    
    constructor() {
        // Set initial prices (scaled by 10^5 for 5 decimals)
        prices[FLR_USD] = 2500;       // $0.025
        prices[BTC_USD] = 10500000000; // $105,000
        prices[XRP_USD] = 250000;      // $2.50
        prices[USDC_USD] = 100000;     // $1.00
        prices[USDT_USD] = 100000;     // $1.00
        prices[ETH_USD] = 400000000;   // $4,000
        prices[DOGE_USD] = 45000;      // $0.45
        
        // All use 5 decimals
        decimals[FLR_USD] = 5;
        decimals[BTC_USD] = 5;
        decimals[XRP_USD] = 5;
        decimals[USDC_USD] = 5;
        decimals[USDT_USD] = 5;
        decimals[ETH_USD] = 5;
        decimals[DOGE_USD] = 5;
    }
    
    /**
     * @notice Get price feed by ID (matches Flare FTSO interface)
     */
    function getFeedById(bytes21 _feedId) external view returns (
        uint256 _value,
        int8 _decimals,
        uint64 _timestamp
    ) {
        return (prices[_feedId], decimals[_feedId], uint64(block.timestamp));
    }
    
    /**
     * @notice Get price in wei
     */
    function getFeedByIdInWei(bytes21 _feedId) external view returns (
        uint256 _value,
        uint64 _timestamp
    ) {
        uint256 price = prices[_feedId];
        int8 dec = decimals[_feedId];
        
        // Convert to 18 decimals (wei)
        uint256 weiValue = price * (10 ** (18 - uint8(int8(dec) < 0 ? -dec : dec)));
        
        return (weiValue, uint64(block.timestamp));
    }
    
    /**
     * @notice Set price for testing (owner only in production)
     */
    function setPrice(bytes21 _feedId, uint256 _price) external {
        prices[_feedId] = _price;
    }
    
    /**
     * @notice Simulate price crash for testing claims
     */
    function simulateCrash(bytes21 _feedId, uint256 _percentageDrop) external {
        uint256 currentPrice = prices[_feedId];
        uint256 newPrice = (currentPrice * (100 - _percentageDrop)) / 100;
        prices[_feedId] = newPrice;
    }
    
    /**
     * @notice Simulate stablecoin depeg
     */
    function simulateDepeg(bytes21 _feedId) external {
        // Set to $0.85 (15% depeg)
        prices[_feedId] = 85000;
    }
    
    /**
     * @notice Reset to normal prices
     */
    function resetPrices() external {
        prices[FLR_USD] = 2500;
        prices[BTC_USD] = 10500000000;
        prices[XRP_USD] = 250000;
        prices[USDC_USD] = 100000;
        prices[USDT_USD] = 100000;
        prices[ETH_USD] = 400000000;
        prices[DOGE_USD] = 45000;
    }
}
