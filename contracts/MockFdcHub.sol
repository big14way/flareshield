// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockFdcHub
 * @notice Mock Flare Data Connector for local testing
 * @dev Simulates cross-chain data verification
 */
contract MockFdcHub {
    // Attestation types
    bytes32 public constant PAYMENT_ATTESTATION = keccak256("Payment");
    bytes32 public constant BALANCE_ATTESTATION = keccak256("BalanceDecreasingTransaction");
    bytes32 public constant REFERENCED_PAYMENT = keccak256("ReferencedPaymentNonexistence");
    
    // Stored attestations for testing
    mapping(bytes32 => mapping(bytes32 => bytes)) public attestations;
    
    // Events for monitoring
    event AttestationRequested(bytes32 indexed attestationType, bytes32 indexed requestHash);
    event AttestationStored(bytes32 indexed attestationType, bytes32 indexed requestHash);
    
    /**
     * @notice Get an attestation (matches Flare FDC interface)
     */
    function getAttestation(bytes32 _attestationType, bytes calldata _request) 
        external 
        view 
        returns (bytes memory) 
    {
        bytes32 requestHash = keccak256(_request);
        return attestations[_attestationType][requestHash];
    }
    
    /**
     * @notice Store an attestation for testing
     */
    function storeAttestation(
        bytes32 _attestationType,
        bytes calldata _request,
        bytes calldata _response
    ) external {
        bytes32 requestHash = keccak256(_request);
        attestations[_attestationType][requestHash] = _response;
        emit AttestationStored(_attestationType, requestHash);
    }
    
    /**
     * @notice Verify a Bitcoin transaction (simulated)
     */
    function verifyBitcoinPayment(
        bytes32 _txHash,
        address _recipient,
        uint256 _amount
    ) external pure returns (bool verified, string memory message) {
        // In production, this would verify actual BTC transactions
        // For testing, we simulate successful verification
        if (_txHash != bytes32(0) && _recipient != address(0) && _amount > 0) {
            return (true, "Bitcoin payment verified");
        }
        return (false, "Invalid payment data");
    }
    
    /**
     * @notice Verify XRP Ledger transaction (simulated)
     */
    function verifyXRPPayment(
        bytes32 _txHash,
        string calldata _destination,
        uint256 _amount
    ) external pure returns (bool verified, string memory message) {
        if (_txHash != bytes32(0) && bytes(_destination).length > 0 && _amount > 0) {
            return (true, "XRP payment verified");
        }
        return (false, "Invalid XRP payment data");
    }
    
    /**
     * @notice Check bridge transaction status
     */
    function verifyBridgeTransaction(
        uint256 _sourceChainId,
        uint256 _destChainId,
        bytes32 _txHash
    ) external pure returns (bool success, uint256 status) {
        // Status: 0 = pending, 1 = completed, 2 = failed
        if (_sourceChainId > 0 && _destChainId > 0 && _txHash != bytes32(0)) {
            return (true, 1); // Simulated success
        }
        return (false, 2);
    }
    
    /**
     * @notice Simulate bridge failure for testing insurance claims
     */
    function simulateBridgeFailure(
        bytes32 _attestationType,
        bytes calldata _request
    ) external {
        bytes32 requestHash = keccak256(_request);
        // Store a "failed" attestation
        attestations[_attestationType][requestHash] = abi.encode(false, 2, "Bridge failure simulated");
        emit AttestationStored(_attestationType, requestHash);
    }
}
