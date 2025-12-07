// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockWFLR
 * @notice Mock Wrapped FLR token for testing on testnet
 */
contract MockWFLR is ERC20 {
    constructor() ERC20("Wrapped Flare", "WFLR") {
        // Mint initial supply to deployer
        _mint(msg.sender, 10000000 * 10**18); // 10 million WFLR
    }

    /**
     * @notice Allow anyone to mint tokens for testing
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /**
     * @notice Faucet function for easy testing
     */
    function faucet() external {
        _mint(msg.sender, 10000 * 10**18); // 10,000 WFLR per request
    }
}
