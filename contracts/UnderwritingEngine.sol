// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {FHE, ebool, euint8, euint32, euint256} from "@fhenixprotocol/contracts/FHE.sol";
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
        (BorrowerRegistry.BorrowerProfile memory profile, bool exists) = borrowerRegistry.getEncryptedProfile(borrower);

        require(exists, "PROFILE_NOT_FOUND");
        require(block.timestamp - profile.submittedAt <= MAX_PROFILE_AGE, "PROFILE_TOO_OLD");

        euint256 dscrScore = _computeDSCR(profile.annualRevenue, profile.totalDebt);
        euint256 runwayScore = _computeRunway(profile.cashOnHand, profile.monthlyBurnRate);
        euint256 leverageScore = _computeLeverageRatio(profile.totalDebt, profile.annualRevenue);
        euint256 receivablesScore = _computeReceivablesScore(profile.accountsReceivable, profile.annualRevenue);
        euint256 aggregate = _aggregateScore(dscrScore, runwayScore, leverageScore, receivablesScore);

        ebool ageEligible = profile.businessAgeMonths.gte(FHE.asEuint32(MIN_BUSINESS_AGE));
        euint256 adjustedScore = FHE.select(ageEligible, aggregate, FHE.asEuint256(0));
        euint8 band = _mapToBand(adjustedScore);

        (euint256 maxLoanSize, euint256 interestRateBps, euint256 ltvBps) = _computeLoanTerms(
            band,
            profile.annualRevenue
        );
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
            dscrAboveThreshold: FHE.asEuint32(dscrScore).gte(FHE.asEuint32(120)),
            leverageWithinPolicy: FHE.asEuint32(leverageScore).gte(FHE.asEuint32(40)),
            covenantCompliant: band.lte(FHE.asEuint8(4))
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
        (BorrowerRegistry.BorrowerProfile memory profile, bool exists) = borrowerRegistry.getEncryptedProfile(borrower);
        require(exists, "PROFILE_NOT_FOUND");

        band = FHE.decrypt(creditScores[borrower].riskBand);
        revenueBucket = _bucketRevenue(profile.annualRevenue);
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
        euint32 rev = FHE.asEuint32(revenue);
        euint32 d = FHE.asEuint32(debt);
        euint32 safeDebt = FHE.select(d.eq(FHE.asEuint32(0)), FHE.asEuint32(1), d);
        euint32 dscr = rev.mul(FHE.asEuint32(100)).div(safeDebt);
        euint32 capped = FHE.min(dscr, FHE.asEuint32(200));
        return FHE.asEuint256(capped);
    }

    function _computeRunway(euint256 cash, euint256 burn) internal pure returns (euint256) {
        euint32 c = FHE.asEuint32(cash);
        euint32 b = FHE.asEuint32(burn);
        euint32 safeBurn = FHE.select(b.eq(FHE.asEuint32(0)), FHE.asEuint32(1), b);
        euint32 months = c.div(safeBurn);
        euint32 cappedMonths = FHE.min(months, FHE.asEuint32(36));
        euint32 runwayScore = cappedMonths.mul(FHE.asEuint32(100)).div(FHE.asEuint32(36));
        return FHE.asEuint256(runwayScore);
    }

    function _computeLeverageRatio(euint256 debt, euint256 revenue) internal pure returns (euint256) {
        euint32 d = FHE.asEuint32(debt);
        euint32 r = FHE.asEuint32(revenue);
        euint32 safeRevenue = FHE.select(r.eq(FHE.asEuint32(0)), FHE.asEuint32(1), r);
        euint32 leverage = d.mul(FHE.asEuint32(100)).div(safeRevenue);
        euint32 leverageCapped = FHE.min(leverage, FHE.asEuint32(100));
        euint32 score = FHE.asEuint32(100) - leverageCapped;
        return FHE.asEuint256(score);
    }

    function _computeReceivablesScore(euint256 receivables, euint256 revenue) internal pure returns (euint256) {
        euint32 ar = FHE.asEuint32(receivables);
        euint32 quarterlyRevenue = FHE.asEuint32(revenue).div(FHE.asEuint32(4));
        euint32 safeQuarterlyRevenue = FHE.select(
            quarterlyRevenue.eq(FHE.asEuint32(0)),
            FHE.asEuint32(1),
            quarterlyRevenue
        );
        euint32 ratio = ar.mul(FHE.asEuint32(100)).div(safeQuarterlyRevenue);
        euint32 cappedRatio = FHE.min(ratio, FHE.asEuint32(100));
        return FHE.asEuint256(cappedRatio);
    }

    function _aggregateScore(
        euint256 dscrScore,
        euint256 runwayScore,
        euint256 leverageScore,
        euint256 receivablesScore
    ) internal pure returns (euint256 totalScore) {
        euint32 dscr = FHE.asEuint32(dscrScore);
        euint32 runway = FHE.asEuint32(runwayScore);
        euint32 leverage = FHE.asEuint32(leverageScore);
        euint32 receivables = FHE.asEuint32(receivablesScore);

        euint32 weighted = dscr
            .mul(FHE.asEuint32(DSCR_WEIGHT))
            .add(runway.mul(FHE.asEuint32(RUNWAY_WEIGHT)))
            .add(leverage.mul(FHE.asEuint32(LEVERAGE_WEIGHT)))
            .add(receivables.mul(FHE.asEuint32(RECEIVABLES_WEIGHT)));

        return FHE.asEuint256(weighted.div(FHE.asEuint32(100)));
    }

    function _mapToBand(euint256 score) internal pure returns (euint8 band) {
        euint32 s = FHE.asEuint32(score);
        band = FHE.asEuint8(6);

        // FHE.select is required because the score is encrypted, so branching must remain on ciphertexts.
        band = FHE.select(s.gte(FHE.asEuint32(BAND_B_THRESHOLD)), FHE.asEuint8(5), band);
        band = FHE.select(s.gte(FHE.asEuint32(BAND_BB_THRESHOLD)), FHE.asEuint8(4), band);
        band = FHE.select(s.gte(FHE.asEuint32(BAND_BBB_THRESHOLD)), FHE.asEuint8(3), band);
        band = FHE.select(s.gte(FHE.asEuint32(BAND_A_THRESHOLD)), FHE.asEuint8(2), band);
        band = FHE.select(s.gte(FHE.asEuint32(BAND_AA_THRESHOLD)), FHE.asEuint8(1), band);
    }

    function _computeLoanTerms(euint8 band, euint256 revenue)
        internal
        pure
        returns (euint256 maxLoanSize, euint256 interestRateBps, euint256 ltvBps)
    {
        euint32 bpsRate = FHE.asEuint32(0);
        euint32 ltv = FHE.asEuint32(0);
        euint32 loanPct = FHE.asEuint32(0);

        bpsRate = FHE.select(band.eq(FHE.asEuint8(1)), FHE.asEuint32(600), bpsRate);
        bpsRate = FHE.select(band.eq(FHE.asEuint8(2)), FHE.asEuint32(750), bpsRate);
        bpsRate = FHE.select(band.eq(FHE.asEuint8(3)), FHE.asEuint32(950), bpsRate);
        bpsRate = FHE.select(band.eq(FHE.asEuint8(4)), FHE.asEuint32(1200), bpsRate);
        bpsRate = FHE.select(band.eq(FHE.asEuint8(5)), FHE.asEuint32(1500), bpsRate);

        ltv = FHE.select(band.eq(FHE.asEuint8(1)), FHE.asEuint32(7500), ltv);
        ltv = FHE.select(band.eq(FHE.asEuint8(2)), FHE.asEuint32(6500), ltv);
        ltv = FHE.select(band.eq(FHE.asEuint8(3)), FHE.asEuint32(5500), ltv);
        ltv = FHE.select(band.eq(FHE.asEuint8(4)), FHE.asEuint32(4000), ltv);
        ltv = FHE.select(band.eq(FHE.asEuint8(5)), FHE.asEuint32(3000), ltv);

        loanPct = FHE.select(band.eq(FHE.asEuint8(1)), FHE.asEuint32(40), loanPct);
        loanPct = FHE.select(band.eq(FHE.asEuint8(2)), FHE.asEuint32(35), loanPct);
        loanPct = FHE.select(band.eq(FHE.asEuint8(3)), FHE.asEuint32(25), loanPct);
        loanPct = FHE.select(band.eq(FHE.asEuint8(4)), FHE.asEuint32(15), loanPct);
        loanPct = FHE.select(band.eq(FHE.asEuint8(5)), FHE.asEuint32(10), loanPct);

        euint32 maxLoan = FHE.asEuint32(revenue).mul(loanPct).div(FHE.asEuint32(100));
        maxLoanSize = FHE.asEuint256(maxLoan);
        interestRateBps = FHE.asEuint256(bpsRate);
        ltvBps = FHE.asEuint256(ltv);
    }

    function _bucketRevenue(euint256 annualRevenue) internal pure returns (string memory) {
        euint32 revenue = FHE.asEuint32(annualRevenue);
        euint8 bucketIndex = FHE.asEuint8(1);
        bucketIndex = FHE.select(revenue.gte(FHE.asEuint32(1_000_000)), FHE.asEuint8(2), bucketIndex);
        bucketIndex = FHE.select(revenue.gte(FHE.asEuint32(5_000_000)), FHE.asEuint8(3), bucketIndex);
        bucketIndex = FHE.select(revenue.gte(FHE.asEuint32(20_000_000)), FHE.asEuint8(4), bucketIndex);
        uint8 idx = FHE.decrypt(bucketIndex);
        if (idx == 1) return "<$1M";
        if (idx == 2) return "$1M-$5M";
        if (idx == 3) return "$5M-$20M";
        return ">$20M";
    }
}
