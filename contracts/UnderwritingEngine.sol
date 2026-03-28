// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {FHE, ebool, euint8, euint32, euint128, euint256} from "@fhenixprotocol/contracts/FHE.sol";
import {Permission, Permissioned} from "@fhenixprotocol/contracts/access/Permissioned.sol";
import {BorrowerRegistry} from "./BorrowerRegistry.sol";

contract UnderwritingEngine is Ownable, Permissioned {
    uint256 public constant DSCR_WEIGHT = 40;
    uint256 public constant RUNWAY_WEIGHT = 30;
    uint256 public constant LEVERAGE_WEIGHT = 20;
    uint256 public constant RECEIVABLES_WEIGHT = 10;

    uint256 public constant MIN_BUSINESS_AGE = 12;
    uint256 public constant MAX_PROFILE_AGE = 180 days;

    uint256 public constant BAND_AA_THRESHOLD = 85;
    uint256 public constant BAND_A_THRESHOLD = 70;
    uint256 public constant BAND_BBB_THRESHOLD = 55;
    uint256 public constant BAND_BB_THRESHOLD = 40;
    uint256 public constant BAND_B_THRESHOLD = 25;
    uint256 public constant SCORE_MAX_AGE = 90 days;

    struct CreditScore {
        euint8 riskBand;
        euint256 maxLoanSize;
        euint256 interestRateBps;
        euint256 ltvBps;
        uint256 computedAt;
        bytes32 proofHash;
        bool exists;
    }

    struct ScoreSignals {
        ebool dscrAboveThreshold;
        ebool leverageWithinPolicy;
        ebool covenantCompliant;
    }

    BorrowerRegistry public immutable borrowerRegistry;
    address public loanVault;

    mapping(address => CreditScore) public creditScores;
    mapping(address => bytes32) public latestScoreId;
    mapping(bytes32 => address) public scoreBorrower;
    mapping(address => ScoreSignals) private scoreSignals;

    event UnderwritingComplete(address indexed borrower, bytes32 indexed scoreId, uint256 computedAt);
    event ScoreExpired(address indexed borrower);

    error OnlyLoanVault();

    constructor(address borrowerRegistryAddress) Ownable(msg.sender) {
        borrowerRegistry = BorrowerRegistry(borrowerRegistryAddress);
    }

    function setLoanVault(address loanVaultAddress) external onlyOwner {
        loanVault = loanVaultAddress;
    }

    function runUnderwriting(address borrower) external returns (bytes32 scoreId) {
        (
            euint256 revenue,
            euint256 debt,
            euint256 burnRate,
            euint256 receivables,
            euint256 cash,
            euint32 businessAgeMonths,
            ,
            uint256 submittedAt,
            ,
            bool exists
        ) = borrowerRegistry.getEncryptedProfile(borrower);

        require(exists, "PROFILE_NOT_FOUND");
        require(block.timestamp - submittedAt <= MAX_PROFILE_AGE, "PROFILE_TOO_OLD");

        euint256 dscrScore = _computeDSCR(revenue, debt);
        euint256 runwayScore = _computeRunway(cash, burnRate);
        euint256 leverageScore = _computeLeverageRatio(debt, revenue);
        euint256 receivablesScore = _computeReceivablesScore(receivables, revenue);
        euint256 aggregate = _aggregateScore(dscrScore, runwayScore, leverageScore, receivablesScore);

        ebool ageEligible = FHE.asEuint32(businessAgeMonths).gte(FHE.asEuint32(MIN_BUSINESS_AGE));
        euint256 adjustedScore = FHE.select(ageEligible, aggregate, FHE.asEuint256(0));
        euint8 band = _mapToBand(adjustedScore);

        (euint256 maxLoanSize, euint256 interestRateBps, euint256 ltvBps) = _computeLoanTerms(band, revenue);
        bytes32 proofHash = keccak256(
            abi.encode(
                euint8.unwrap(band),
                euint256.unwrap(maxLoanSize),
                euint256.unwrap(interestRateBps),
                euint256.unwrap(ltvBps),
                block.timestamp,
                borrower
            )
        );

        creditScores[borrower] = CreditScore({
            riskBand: band,
            maxLoanSize: maxLoanSize,
            interestRateBps: interestRateBps,
            ltvBps: ltvBps,
            computedAt: block.timestamp,
            proofHash: proofHash,
            exists: true
        });

        scoreSignals[borrower] = ScoreSignals({
            dscrAboveThreshold: FHE.asEuint128(dscrScore).gte(FHE.asEuint128(120)),
            leverageWithinPolicy: FHE.asEuint128(leverageScore).gte(FHE.asEuint128(40)),
            covenantCompliant: FHE.asEuint8(band).lte(FHE.asEuint8(4))
        });

        scoreId = keccak256(abi.encodePacked(borrower, block.timestamp, proofHash, block.prevrandao));
        latestScoreId[borrower] = scoreId;
        scoreBorrower[scoreId] = borrower;
        emit UnderwritingComplete(borrower, scoreId, block.timestamp);
    }

    function sealBandForLender(address borrower, Permission calldata permission)
        external
        view
        onlyPermitted(permission, borrower)
        returns (uint8 band)
    {
        require(creditScores[borrower].exists, "SCORE_NOT_FOUND");
        return FHE.decrypt(creditScores[borrower].riskBand);
    }

    function sealTermsForBorrower(address borrower, Permission calldata permission)
        external
        view
        onlyPermitted(permission, borrower)
        returns (uint256 maxLoan, uint256 rateBps, uint256 ltvBps)
    {
        require(creditScores[borrower].exists, "SCORE_NOT_FOUND");
        CreditScore storage score = creditScores[borrower];
        return (FHE.decrypt(score.maxLoanSize), FHE.decrypt(score.interestRateBps), FHE.decrypt(score.ltvBps));
    }

    function sealAuditView(address borrower, Permission calldata permission)
        external
        view
        onlyPermitted(permission, borrower)
        returns (
            uint8 band,
            string memory revenueBucket,
            bool dscrAboveThreshold,
            bool leverageWithinPolicy,
            bool covenantCompliant
        )
    {
        require(creditScores[borrower].exists, "SCORE_NOT_FOUND");
        (
            euint256 revenue,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            bool exists
        ) = borrowerRegistry.getEncryptedProfile(borrower);
        require(exists, "PROFILE_NOT_FOUND");

        band = FHE.decrypt(creditScores[borrower].riskBand);
        revenueBucket = _bucketRevenue(revenue);
        dscrAboveThreshold = FHE.decrypt(scoreSignals[borrower].dscrAboveThreshold);
        leverageWithinPolicy = FHE.decrypt(scoreSignals[borrower].leverageWithinPolicy);
        covenantCompliant = FHE.decrypt(scoreSignals[borrower].covenantCompliant);
    }

    function getLatestScoreForVault(address borrower)
        external
        view
        returns (uint8 band, uint256 maxLoanSize, uint256 rateBps, uint256 ltvBps, uint256 computedAt, bytes32 scoreId, bytes32 proofHash, bool exists)
    {
        if (msg.sender != loanVault) revert OnlyLoanVault();
        CreditScore storage score = creditScores[borrower];
        if (!score.exists) {
            return (0, 0, 0, 0, 0, bytes32(0), bytes32(0), false);
        }
        return (
            FHE.decrypt(score.riskBand),
            FHE.decrypt(score.maxLoanSize),
            FHE.decrypt(score.interestRateBps),
            FHE.decrypt(score.ltvBps),
            score.computedAt,
            latestScoreId[borrower],
            score.proofHash,
            true
        );
    }

    function isScoreFresh(address borrower) public returns (bool) {
        CreditScore storage score = creditScores[borrower];
        if (!score.exists) return false;
        bool fresh = (block.timestamp - score.computedAt) <= SCORE_MAX_AGE;
        if (!fresh) {
            emit ScoreExpired(borrower);
        }
        return fresh;
    }

    function _computeDSCR(euint256 revenue, euint256 debt) internal pure returns (euint256) {
        euint128 rev = FHE.asEuint128(revenue);
        euint128 d = FHE.asEuint128(debt);
        euint128 safeDebt = FHE.select(d.eq(FHE.asEuint128(0)), FHE.asEuint128(1), d);
        euint128 dscr = (rev * FHE.asEuint128(100)) / safeDebt;
        euint128 capped = FHE.min(dscr, FHE.asEuint128(200));
        return FHE.asEuint256(capped);
    }

    function _computeRunway(euint256 cash, euint256 burn) internal pure returns (euint256) {
        euint128 c = FHE.asEuint128(cash);
        euint128 b = FHE.asEuint128(burn);
        euint128 safeBurn = FHE.select(b.eq(FHE.asEuint128(0)), FHE.asEuint128(1), b);
        euint128 months = c / safeBurn;
        euint128 cappedMonths = FHE.min(months, FHE.asEuint128(36));
        euint128 runwayScore = (cappedMonths * FHE.asEuint128(100)) / FHE.asEuint128(36);
        return FHE.asEuint256(runwayScore);
    }

    function _computeLeverageRatio(euint256 debt, euint256 revenue) internal pure returns (euint256) {
        euint128 d = FHE.asEuint128(debt);
        euint128 r = FHE.asEuint128(revenue);
        euint128 safeRevenue = FHE.select(r.eq(FHE.asEuint128(0)), FHE.asEuint128(1), r);
        euint128 leverage = (d * FHE.asEuint128(100)) / safeRevenue;
        euint128 leverageCapped = FHE.min(leverage, FHE.asEuint128(100));
        euint128 score = FHE.asEuint128(100) - leverageCapped;
        return FHE.asEuint256(score);
    }

    function _computeReceivablesScore(euint256 receivables, euint256 revenue) internal pure returns (euint256) {
        euint128 ar = FHE.asEuint128(receivables);
        euint128 quarterlyRevenue = FHE.asEuint128(revenue) / FHE.asEuint128(4);
        euint128 safeQuarterlyRevenue = FHE.select(
            quarterlyRevenue.eq(FHE.asEuint128(0)),
            FHE.asEuint128(1),
            quarterlyRevenue
        );
        euint128 ratio = (ar * FHE.asEuint128(100)) / safeQuarterlyRevenue;
        euint128 cappedRatio = FHE.min(ratio, FHE.asEuint128(100));
        return FHE.asEuint256(cappedRatio);
    }

    function _aggregateScore(
        euint256 dscrScore,
        euint256 runwayScore,
        euint256 leverageScore,
        euint256 receivablesScore
    ) internal pure returns (euint256 totalScore) {
        euint128 dscr = FHE.asEuint128(dscrScore);
        euint128 runway = FHE.asEuint128(runwayScore);
        euint128 leverage = FHE.asEuint128(leverageScore);
        euint128 receivables = FHE.asEuint128(receivablesScore);

        euint128 weighted =
            (dscr * FHE.asEuint128(DSCR_WEIGHT)) +
            (runway * FHE.asEuint128(RUNWAY_WEIGHT)) +
            (leverage * FHE.asEuint128(LEVERAGE_WEIGHT)) +
            (receivables * FHE.asEuint128(RECEIVABLES_WEIGHT));

        return FHE.asEuint256(weighted / FHE.asEuint128(100));
    }

    function _mapToBand(euint256 score) internal pure returns (euint8 band) {
        euint128 s = FHE.asEuint128(score);
        band = FHE.asEuint8(6);

        // FHE.select is required because the score is encrypted, so branching must remain on ciphertexts.
        band = FHE.select(s.gte(FHE.asEuint128(BAND_B_THRESHOLD)), FHE.asEuint8(5), band);
        band = FHE.select(s.gte(FHE.asEuint128(BAND_BB_THRESHOLD)), FHE.asEuint8(4), band);
        band = FHE.select(s.gte(FHE.asEuint128(BAND_BBB_THRESHOLD)), FHE.asEuint8(3), band);
        band = FHE.select(s.gte(FHE.asEuint128(BAND_A_THRESHOLD)), FHE.asEuint8(2), band);
        band = FHE.select(s.gte(FHE.asEuint128(BAND_AA_THRESHOLD)), FHE.asEuint8(1), band);
    }

    function _computeLoanTerms(euint8 band, euint256 revenue)
        internal
        pure
        returns (euint256 maxLoanSize, euint256 interestRateBps, euint256 ltvBps)
    {
        euint128 bpsRate = FHE.asEuint128(0);
        euint128 ltv = FHE.asEuint128(0);
        euint128 loanPct = FHE.asEuint128(0);

        bpsRate = FHE.select(band.eq(FHE.asEuint8(1)), FHE.asEuint128(600), bpsRate);
        bpsRate = FHE.select(band.eq(FHE.asEuint8(2)), FHE.asEuint128(750), bpsRate);
        bpsRate = FHE.select(band.eq(FHE.asEuint8(3)), FHE.asEuint128(950), bpsRate);
        bpsRate = FHE.select(band.eq(FHE.asEuint8(4)), FHE.asEuint128(1200), bpsRate);
        bpsRate = FHE.select(band.eq(FHE.asEuint8(5)), FHE.asEuint128(1500), bpsRate);

        ltv = FHE.select(band.eq(FHE.asEuint8(1)), FHE.asEuint128(7500), ltv);
        ltv = FHE.select(band.eq(FHE.asEuint8(2)), FHE.asEuint128(6500), ltv);
        ltv = FHE.select(band.eq(FHE.asEuint8(3)), FHE.asEuint128(5500), ltv);
        ltv = FHE.select(band.eq(FHE.asEuint8(4)), FHE.asEuint128(4000), ltv);
        ltv = FHE.select(band.eq(FHE.asEuint8(5)), FHE.asEuint128(3000), ltv);

        loanPct = FHE.select(band.eq(FHE.asEuint8(1)), FHE.asEuint128(40), loanPct);
        loanPct = FHE.select(band.eq(FHE.asEuint8(2)), FHE.asEuint128(35), loanPct);
        loanPct = FHE.select(band.eq(FHE.asEuint8(3)), FHE.asEuint128(25), loanPct);
        loanPct = FHE.select(band.eq(FHE.asEuint8(4)), FHE.asEuint128(15), loanPct);
        loanPct = FHE.select(band.eq(FHE.asEuint8(5)), FHE.asEuint128(10), loanPct);

        euint128 maxLoan = (FHE.asEuint128(revenue) * loanPct) / FHE.asEuint128(100);
        maxLoanSize = FHE.asEuint256(maxLoan);
        interestRateBps = FHE.asEuint256(bpsRate);
        ltvBps = FHE.asEuint256(ltv);
    }

    function _bucketRevenue(euint256 annualRevenue) internal pure returns (string memory) {
        euint128 revenue = FHE.asEuint128(annualRevenue);
        euint8 bucketIndex = FHE.asEuint8(1);
        bucketIndex = FHE.select(revenue.gte(FHE.asEuint128(1_000_000)), FHE.asEuint8(2), bucketIndex);
        bucketIndex = FHE.select(revenue.gte(FHE.asEuint128(5_000_000)), FHE.asEuint8(3), bucketIndex);
        bucketIndex = FHE.select(revenue.gte(FHE.asEuint128(20_000_000)), FHE.asEuint8(4), bucketIndex);
        uint8 idx = FHE.decrypt(bucketIndex);
        if (idx == 1) return "<$1M";
        if (idx == 2) return "$1M-$5M";
        if (idx == 3) return "$5M-$20M";
        return ">$20M";
    }
}
