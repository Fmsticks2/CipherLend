// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, ebool, euint8, euint32, euint128, euint256, inEuint32, inEuint256} from "@fhenixprotocol/contracts/FHE.sol";
import {Permission, Permissioned} from "@fhenixprotocol/contracts/access/Permissioned.sol";

contract BorrowerRegistry is Permissioned {
    struct BorrowerProfile {
        euint256 annualRevenue;
        euint256 totalDebt;
        euint256 monthlyBurnRate;
        euint256 accountsReceivable;
        euint256 cashOnHand;
        euint32 businessAgeMonths;
        uint8 industrySector;
        address borrower;
        uint256 submittedAt;
        uint256 version;
    }

    mapping(address => BorrowerProfile) private profiles;
    mapping(address => uint256) public profileTimestamp;
    mapping(address => bool) public hasProfile;

    event ProfileSubmitted(address indexed borrower, uint256 version);
    event ProfileUpdated(address indexed borrower, uint256 version);

    function submitProfile(
        inEuint256 calldata revenue,
        inEuint256 calldata debt,
        inEuint256 calldata burnRate,
        inEuint256 calldata receivables,
        inEuint256 calldata cash,
        inEuint32 calldata businessAge,
        uint8 sector
    ) external {
        require(!hasProfile[msg.sender], "PROFILE_EXISTS");
        _upsertProfile(msg.sender, revenue, debt, burnRate, receivables, cash, businessAge, sector, 1);
        emit ProfileSubmitted(msg.sender, 1);
    }

    function updateProfile(
        inEuint256 calldata revenue,
        inEuint256 calldata debt,
        inEuint256 calldata burnRate,
        inEuint256 calldata receivables,
        inEuint256 calldata cash,
        inEuint32 calldata businessAge,
        uint8 sector
    ) external {
        require(hasProfile[msg.sender], "PROFILE_NOT_FOUND");
        uint256 nextVersion = profiles[msg.sender].version + 1;
        _upsertProfile(msg.sender, revenue, debt, burnRate, receivables, cash, businessAge, sector, nextVersion);
        emit ProfileUpdated(msg.sender, nextVersion);
    }

    function getProfileMetadata(address borrower)
        external
        view
        returns (uint8 sector, uint256 submittedAt, uint256 version, bool exists)
    {
        BorrowerProfile storage profile = profiles[borrower];
        return (profile.industrySector, profile.submittedAt, profile.version, hasProfile[borrower]);
    }

    function getEncryptedProfile(address borrower)
        external
        view
        returns (
            euint256 annualRevenue,
            euint256 totalDebt,
            euint256 monthlyBurnRate,
            euint256 accountsReceivable,
            euint256 cashOnHand,
            euint32 businessAgeMonths,
            uint8 industrySector,
            uint256 submittedAt,
            uint256 version,
            bool exists
        )
    {
        BorrowerProfile storage profile = profiles[borrower];
        return (
            profile.annualRevenue,
            profile.totalDebt,
            profile.monthlyBurnRate,
            profile.accountsReceivable,
            profile.cashOnHand,
            profile.businessAgeMonths,
            profile.industrySector,
            profile.submittedAt,
            profile.version,
            hasProfile[borrower]
        );
    }

    function sealRevenueBucket(address borrower, Permission calldata permission)
        external
        view
        onlyPermitted(permission, borrower)
        returns (string memory bucket)
    {
        require(hasProfile[borrower], "PROFILE_NOT_FOUND");
        BorrowerProfile storage profile = profiles[borrower];

        // Revenue remains encrypted at all times and we only decrypt a low-entropy bucket index.
        euint128 revenue = FHE.asEuint128(profile.annualRevenue);
        euint8 bucketIndex = FHE.asEuint8(1);
        ebool atLeastOneMillion = revenue.gte(FHE.asEuint128(1_000_000));
        ebool atLeastFiveMillion = revenue.gte(FHE.asEuint128(5_000_000));
        ebool atLeastTwentyMillion = revenue.gte(FHE.asEuint128(20_000_000));

        // We use FHE.select rather than if/else so conditional branching is executed on ciphertext, not plaintext.
        bucketIndex = FHE.select(atLeastOneMillion, FHE.asEuint8(2), bucketIndex);
        bucketIndex = FHE.select(atLeastFiveMillion, FHE.asEuint8(3), bucketIndex);
        bucketIndex = FHE.select(atLeastTwentyMillion, FHE.asEuint8(4), bucketIndex);

        uint8 idx = FHE.decrypt(bucketIndex);
        if (idx == 1) return "<$1M";
        if (idx == 2) return "$1M-$5M";
        if (idx == 3) return "$5M-$20M";
        return ">$20M";
    }

    function _upsertProfile(
        address borrower,
        inEuint256 calldata revenue,
        inEuint256 calldata debt,
        inEuint256 calldata burnRate,
        inEuint256 calldata receivables,
        inEuint256 calldata cash,
        inEuint32 calldata businessAge,
        uint8 sector,
        uint256 version
    ) internal {
        profiles[borrower] = BorrowerProfile({
            annualRevenue: FHE.asEuint256(revenue),
            totalDebt: FHE.asEuint256(debt),
            monthlyBurnRate: FHE.asEuint256(burnRate),
            accountsReceivable: FHE.asEuint256(receivables),
            cashOnHand: FHE.asEuint256(cash),
            businessAgeMonths: FHE.asEuint32(businessAge),
            industrySector: sector,
            borrower: borrower,
            submittedAt: block.timestamp,
            version: version
        });
        profileTimestamp[borrower] = block.timestamp;
        hasProfile[borrower] = true;
    }
}
