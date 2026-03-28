// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract PermitRegistry {
    enum PermitType {
        LENDER,
        AUDITOR,
        FULL
    }

    struct Permit {
        address grantor;
        address grantee;
        PermitType ptype;
        uint256 expiresAt;
        bool revoked;
    }

    struct PermitView {
        bytes32 permitId;
        address grantor;
        address grantee;
        PermitType ptype;
        uint256 expiresAt;
        bool revoked;
        bool valid;
    }

    mapping(bytes32 => Permit) public permits;
    mapping(address => bytes32[]) private grantorPermits;
    mapping(address => bytes32[]) private granteePermits;

    event PermitGranted(
        bytes32 indexed permitId,
        address indexed grantor,
        address indexed grantee,
        PermitType ptype,
        uint256 expiresAt
    );
    event PermitRevoked(bytes32 indexed permitId, address indexed grantor);

    function grantPermit(address grantee, PermitType ptype, uint256 durationSeconds) external returns (bytes32 permitId) {
        require(grantee != address(0), "INVALID_GRANTEE");
        require(durationSeconds > 0, "INVALID_DURATION");

        permitId = keccak256(
            abi.encodePacked(msg.sender, grantee, ptype, block.timestamp, block.prevrandao, grantorPermits[msg.sender].length)
        );
        uint256 expiresAt = block.timestamp + durationSeconds;

        permits[permitId] = Permit({
            grantor: msg.sender,
            grantee: grantee,
            ptype: ptype,
            expiresAt: expiresAt,
            revoked: false
        });

        grantorPermits[msg.sender].push(permitId);
        granteePermits[grantee].push(permitId);
        emit PermitGranted(permitId, msg.sender, grantee, ptype, expiresAt);
    }

    function revokePermit(bytes32 permitId) external {
        Permit storage permit = permits[permitId];
        require(permit.grantor != address(0), "PERMIT_NOT_FOUND");
        require(permit.grantor == msg.sender, "NOT_GRANTOR");
        require(!permit.revoked, "PERMIT_REVOKED");

        permit.revoked = true;
        emit PermitRevoked(permitId, msg.sender);
    }

    function verifyPermit(bytes32 permitId, address expectedGrantee, PermitType requiredType)
        external
        view
        returns (bool valid)
    {
        Permit storage permit = permits[permitId];
        if (permit.grantor == address(0)) return false;
        if (permit.revoked) return false;
        if (permit.expiresAt < block.timestamp) return false;
        if (permit.grantee != expectedGrantee) return false;
        return _matchesType(permit.ptype, requiredType);
    }

    function getPermitsForAddress(address user) external view returns (PermitView[] memory activePermits) {
        bytes32[] storage granted = grantorPermits[user];
        bytes32[] storage received = granteePermits[user];
        uint256 total = granted.length + received.length;
        activePermits = new PermitView[](total);

        uint256 index;
        for (uint256 i = 0; i < granted.length; i++) {
            bytes32 permitId = granted[i];
            Permit storage p = permits[permitId];
            activePermits[index++] = PermitView({
                permitId: permitId,
                grantor: p.grantor,
                grantee: p.grantee,
                ptype: p.ptype,
                expiresAt: p.expiresAt,
                revoked: p.revoked,
                valid: _isValid(p)
            });
        }

        for (uint256 i = 0; i < received.length; i++) {
            bytes32 permitId = received[i];
            Permit storage p = permits[permitId];
            activePermits[index++] = PermitView({
                permitId: permitId,
                grantor: p.grantor,
                grantee: p.grantee,
                ptype: p.ptype,
                expiresAt: p.expiresAt,
                revoked: p.revoked,
                valid: _isValid(p)
            });
        }
    }

    function _matchesType(PermitType current, PermitType requiredType) internal pure returns (bool) {
        if (current == PermitType.FULL) return true;
        return current == requiredType;
    }

    function _isValid(Permit memory permit) internal view returns (bool) {
        return permit.grantor != address(0) && !permit.revoked && permit.expiresAt >= block.timestamp;
    }
}
