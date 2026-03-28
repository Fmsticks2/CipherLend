import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

const permissionTypes = {
  Permissioned: [{ name: "publicKey", type: "bytes32" }],
};

const buildPermission = async (signer: any, contractAddress: string) => {
  const { chainId } = await ethers.provider.getNetwork();
  const publicKey = ethers.hexlify(ethers.randomBytes(32));
  const signature = await signer.signTypedData(
    {
      name: "Fhenix Permission",
      version: "1.0",
      chainId,
      verifyingContract: contractAddress,
    },
    permissionTypes,
    { publicKey }
  );
  return { publicKey, signature };
};

const encryptProfile = async (profile: {
  revenue: bigint;
  debt: bigint;
  burnRate: bigint;
  receivables: bigint;
  cash: bigint;
  businessAge: number;
}) => {
  const fhenix = hre.fhenixjs;
  return {
    revenue: await fhenix.encrypt_uint256(profile.revenue),
    debt: await fhenix.encrypt_uint256(profile.debt),
    burnRate: await fhenix.encrypt_uint256(profile.burnRate),
    receivables: await fhenix.encrypt_uint256(profile.receivables),
    cash: await fhenix.encrypt_uint256(profile.cash),
    businessAge: await fhenix.encrypt_uint32(profile.businessAge),
  };
};

describe("CipherLend", function () {
  async function deployFixture() {
    const [deployer, borrower, lender, auditor] = await ethers.getSigners();

    const BorrowerRegistry = await ethers.getContractFactory("BorrowerRegistry");
    const registry = await BorrowerRegistry.deploy();
    await registry.waitForDeployment();

    const UnderwritingEngine = await ethers.getContractFactory("UnderwritingEngine");
    const underwriting = await UnderwritingEngine.deploy(await registry.getAddress());
    await underwriting.waitForDeployment();

    const LoanVault = await ethers.getContractFactory("LoanVault");
    const vault = await LoanVault.deploy(await underwriting.getAddress());
    await vault.waitForDeployment();

    const PermitRegistry = await ethers.getContractFactory("PermitRegistry");
    const permitRegistry = await PermitRegistry.deploy();
    await permitRegistry.waitForDeployment();

    await underwriting.setLoanVault(await vault.getAddress());

    return { deployer, borrower, lender, auditor, registry, underwriting, vault, permitRegistry };
  }

  describe("BorrowerRegistry", function () {
    it("Should submit encrypted profile", async function () {
      const { borrower, registry } = await deployFixture();
      const encrypted = await encryptProfile({
        revenue: 2_500_000n,
        debt: 400_000n,
        burnRate: 120_000n,
        receivables: 500_000n,
        cash: 900_000n,
        businessAge: 30,
      });

      await expect(
        registry
          .connect(borrower)
          .submitProfile(
            encrypted.revenue,
            encrypted.debt,
            encrypted.burnRate,
            encrypted.receivables,
            encrypted.cash,
            encrypted.businessAge,
            1
          )
      ).to.emit(registry, "ProfileSubmitted");
      expect(await registry.hasProfile(borrower.address)).to.equal(true);
    });

    it("Should return correct metadata (sector, timestamp)", async function () {
      const { borrower, registry } = await deployFixture();
      const encrypted = await encryptProfile({
        revenue: 2_000_000n,
        debt: 300_000n,
        burnRate: 100_000n,
        receivables: 350_000n,
        cash: 800_000n,
        businessAge: 26,
      });
      await registry
        .connect(borrower)
        .submitProfile(
          encrypted.revenue,
          encrypted.debt,
          encrypted.burnRate,
          encrypted.receivables,
          encrypted.cash,
          encrypted.businessAge,
          3
        );

      const metadata = await registry.getProfileMetadata(borrower.address);
      expect(Number(metadata[0])).to.equal(3);
      expect(Number(metadata[1])).to.be.greaterThan(0);
      expect(Number(metadata[2])).to.equal(1);
      expect(metadata[3]).to.equal(true);
    });

    it("Should not expose raw financials to non-permitted callers", async function () {
      const { borrower, lender, registry } = await deployFixture();
      const encrypted = await encryptProfile({
        revenue: 1_800_000n,
        debt: 250_000n,
        burnRate: 90_000n,
        receivables: 280_000n,
        cash: 700_000n,
        businessAge: 20,
      });
      await registry
        .connect(borrower)
        .submitProfile(
          encrypted.revenue,
          encrypted.debt,
          encrypted.burnRate,
          encrypted.receivables,
          encrypted.cash,
          encrypted.businessAge,
          0
        );

      const badPermission = await buildPermission(lender, await registry.getAddress());
      await expect(
        registry.connect(lender).sealRevenueBucket(borrower.address, badPermission)
      ).to.be.revertedWithCustomError(registry, "SignerNotOwner");
    });

    it("Should update profile and increment version", async function () {
      const { borrower, registry } = await deployFixture();
      const encrypted = await encryptProfile({
        revenue: 2_100_000n,
        debt: 280_000n,
        burnRate: 95_000n,
        receivables: 300_000n,
        cash: 650_000n,
        businessAge: 24,
      });
      await registry
        .connect(borrower)
        .submitProfile(
          encrypted.revenue,
          encrypted.debt,
          encrypted.burnRate,
          encrypted.receivables,
          encrypted.cash,
          encrypted.businessAge,
          2
        );

      const updated = await encryptProfile({
        revenue: 2_300_000n,
        debt: 250_000n,
        burnRate: 90_000n,
        receivables: 320_000n,
        cash: 700_000n,
        businessAge: 25,
      });
      await expect(
        registry
          .connect(borrower)
          .updateProfile(
            updated.revenue,
            updated.debt,
            updated.burnRate,
            updated.receivables,
            updated.cash,
            updated.businessAge,
            2
          )
      ).to.emit(registry, "ProfileUpdated");

      const metadata = await registry.getProfileMetadata(borrower.address);
      expect(Number(metadata[2])).to.equal(2);
    });

    it("Should return bucketed revenue with valid permit", async function () {
      const { borrower, lender, registry } = await deployFixture();
      const encrypted = await encryptProfile({
        revenue: 3_000_000n,
        debt: 200_000n,
        burnRate: 75_000n,
        receivables: 250_000n,
        cash: 950_000n,
        businessAge: 36,
      });
      await registry
        .connect(borrower)
        .submitProfile(
          encrypted.revenue,
          encrypted.debt,
          encrypted.burnRate,
          encrypted.receivables,
          encrypted.cash,
          encrypted.businessAge,
          1
        );

      const permission = await buildPermission(borrower, await registry.getAddress());
      const bucket = await registry.connect(lender).sealRevenueBucket(borrower.address, permission);
      expect(bucket).to.equal("$1M-$5M");
    });
  });

  describe("UnderwritingEngine", function () {
    it("Should run underwriting and store encrypted score", async function () {
      const { borrower, registry, underwriting } = await deployFixture();
      const encrypted = await encryptProfile({
        revenue: 2_500_000n,
        debt: 300_000n,
        burnRate: 80_000n,
        receivables: 450_000n,
        cash: 1_000_000n,
        businessAge: 28,
      });
      await registry
        .connect(borrower)
        .submitProfile(
          encrypted.revenue,
          encrypted.debt,
          encrypted.burnRate,
          encrypted.receivables,
          encrypted.cash,
          encrypted.businessAge,
          2
        );

      await expect(underwriting.runUnderwriting(borrower.address)).to.emit(underwriting, "UnderwritingComplete");
      const score = await underwriting.creditScores(borrower.address);
      expect(score.exists).to.equal(true);
      expect(Number(score.computedAt)).to.be.greaterThan(0);
    });

    it("Should return correct band to permitted lender", async function () {
      const { borrower, lender, registry, underwriting } = await deployFixture();
      const encrypted = await encryptProfile({
        revenue: 2_400_000n,
        debt: 200_000n,
        burnRate: 75_000n,
        receivables: 420_000n,
        cash: 1_200_000n,
        businessAge: 30,
      });
      await registry.connect(borrower).submitProfile(
        encrypted.revenue,
        encrypted.debt,
        encrypted.burnRate,
        encrypted.receivables,
        encrypted.cash,
        encrypted.businessAge,
        1
      );
      await underwriting.runUnderwriting(borrower.address);

      const permission = await buildPermission(borrower, await underwriting.getAddress());
      const band = await underwriting.connect(lender).sealBandForLender(borrower.address, permission);
      expect(Number(band)).to.be.greaterThanOrEqual(1);
      expect(Number(band)).to.be.lessThanOrEqual(6);
    });

    it("Should return correct terms to borrower", async function () {
      const { borrower, registry, underwriting } = await deployFixture();
      const encrypted = await encryptProfile({
        revenue: 2_200_000n,
        debt: 350_000n,
        burnRate: 110_000n,
        receivables: 380_000n,
        cash: 900_000n,
        businessAge: 22,
      });
      await registry.connect(borrower).submitProfile(
        encrypted.revenue,
        encrypted.debt,
        encrypted.burnRate,
        encrypted.receivables,
        encrypted.cash,
        encrypted.businessAge,
        3
      );
      await underwriting.runUnderwriting(borrower.address);
      const permission = await buildPermission(borrower, await underwriting.getAddress());
      const terms = await underwriting.connect(borrower).sealTermsForBorrower(borrower.address, permission);
      expect(terms[0]).to.be.greaterThan(0);
      expect(terms[1]).to.be.greaterThan(0);
      expect(terms[2]).to.be.greaterThan(0);
    });

    it("Should return boolean audit view to auditor", async function () {
      const { borrower, auditor, registry, underwriting } = await deployFixture();
      const encrypted = await encryptProfile({
        revenue: 1_600_000n,
        debt: 450_000n,
        burnRate: 120_000n,
        receivables: 300_000n,
        cash: 650_000n,
        businessAge: 18,
      });
      await registry.connect(borrower).submitProfile(
        encrypted.revenue,
        encrypted.debt,
        encrypted.burnRate,
        encrypted.receivables,
        encrypted.cash,
        encrypted.businessAge,
        2
      );
      await underwriting.runUnderwriting(borrower.address);
      const permission = await buildPermission(borrower, await underwriting.getAddress());
      const auditView = await underwriting.connect(auditor).sealAuditView(borrower.address, permission);
      expect(Number(auditView[0])).to.be.greaterThan(0);
      expect(typeof auditView[1]).to.equal("string");
      expect(typeof auditView[2]).to.equal("boolean");
      expect(typeof auditView[3]).to.equal("boolean");
      expect(typeof auditView[4]).to.equal("boolean");
    });

    it("Should reject underwriting if profile too old", async function () {
      const { borrower, registry, underwriting } = await deployFixture();
      const encrypted = await encryptProfile({
        revenue: 1_900_000n,
        debt: 500_000n,
        burnRate: 130_000n,
        receivables: 280_000n,
        cash: 550_000n,
        businessAge: 16,
      });
      await registry.connect(borrower).submitProfile(
        encrypted.revenue,
        encrypted.debt,
        encrypted.burnRate,
        encrypted.receivables,
        encrypted.cash,
        encrypted.businessAge,
        0
      );
      await time.increase(181 * 24 * 60 * 60);
      await expect(underwriting.runUnderwriting(borrower.address)).to.be.revertedWith("PROFILE_TOO_OLD");
    });
  });

  describe("LoanVault", function () {
    it("Should create loan request after valid score", async function () {
      const { borrower, registry, underwriting, vault } = await deployFixture();
      const encrypted = await encryptProfile({
        revenue: 3_000_000n,
        debt: 300_000n,
        burnRate: 90_000n,
        receivables: 500_000n,
        cash: 1_300_000n,
        businessAge: 32,
      });
      await registry.connect(borrower).submitProfile(
        encrypted.revenue,
        encrypted.debt,
        encrypted.burnRate,
        encrypted.receivables,
        encrypted.cash,
        encrypted.businessAge,
        2
      );
      await underwriting.runUnderwriting(borrower.address);
      await expect(vault.connect(borrower).requestLoan(200_000, 12)).to.emit(vault, "LoanRequested");
    });

    it("Should reject loan exceeding maxLoanSize", async function () {
      const { borrower, registry, underwriting, vault } = await deployFixture();
      const encrypted = await encryptProfile({
        revenue: 1_000_000n,
        debt: 400_000n,
        burnRate: 120_000n,
        receivables: 200_000n,
        cash: 300_000n,
        businessAge: 20,
      });
      await registry.connect(borrower).submitProfile(
        encrypted.revenue,
        encrypted.debt,
        encrypted.burnRate,
        encrypted.receivables,
        encrypted.cash,
        encrypted.businessAge,
        1
      );
      await underwriting.runUnderwriting(borrower.address);
      await expect(vault.connect(borrower).requestLoan(10_000_000_000, 12)).to.be.revertedWith("EXCEEDS_MAX_LOAN");
    });

    it("Should fund loan and transfer principal", async function () {
      const { borrower, lender, registry, underwriting, vault } = await deployFixture();
      const encrypted = await encryptProfile({
        revenue: 2_800_000n,
        debt: 300_000n,
        burnRate: 95_000n,
        receivables: 400_000n,
        cash: 1_100_000n,
        businessAge: 30,
      });
      await registry.connect(borrower).submitProfile(
        encrypted.revenue,
        encrypted.debt,
        encrypted.burnRate,
        encrypted.receivables,
        encrypted.cash,
        encrypted.businessAge,
        2
      );
      await underwriting.runUnderwriting(borrower.address);
      await vault.connect(borrower).requestLoan(100_000, 12);

      await expect(vault.connect(lender).fundLoan(1, { value: 100_000 })).to.emit(vault, "LoanFunded");
      const loan = await vault.loans(1);
      expect(Number(loan.status)).to.equal(1);
      expect(loan.lender).to.equal(lender.address);
    });

    it("Should accept repayment and update balance", async function () {
      const { borrower, lender, registry, underwriting, vault } = await deployFixture();
      const encrypted = await encryptProfile({
        revenue: 2_600_000n,
        debt: 280_000n,
        burnRate: 85_000n,
        receivables: 350_000n,
        cash: 1_000_000n,
        businessAge: 29,
      });
      await registry.connect(borrower).submitProfile(
        encrypted.revenue,
        encrypted.debt,
        encrypted.burnRate,
        encrypted.receivables,
        encrypted.cash,
        encrypted.businessAge,
        2
      );
      await underwriting.runUnderwriting(borrower.address);
      await vault.connect(borrower).requestLoan(100_000, 12);
      await vault.connect(lender).fundLoan(1, { value: 100_000 });

      await expect(vault.connect(borrower).makePayment(1, { value: 25_000 })).to.emit(vault, "PaymentMade");
      const loan = await vault.loans(1);
      expect(loan.remainingBalance).to.equal(75_000);
    });

    it("Should mark loan overdue after payment date passes", async function () {
      const { borrower, lender, registry, underwriting, vault } = await deployFixture();
      const encrypted = await encryptProfile({
        revenue: 2_200_000n,
        debt: 270_000n,
        burnRate: 80_000n,
        receivables: 320_000n,
        cash: 900_000n,
        businessAge: 24,
      });
      await registry.connect(borrower).submitProfile(
        encrypted.revenue,
        encrypted.debt,
        encrypted.burnRate,
        encrypted.receivables,
        encrypted.cash,
        encrypted.businessAge,
        3
      );
      await underwriting.runUnderwriting(borrower.address);
      await vault.connect(borrower).requestLoan(100_000, 12);
      await vault.connect(lender).fundLoan(1, { value: 100_000 });
      await time.increase(31 * 24 * 60 * 60);
      await expect(vault.markOverdue(1)).to.emit(vault, "LoanOverdue");
      const loan = await vault.loans(1);
      expect(Number(loan.status)).to.equal(2);
    });

    it("Should detect covenant breach on re-underwriting", async function () {
      const { borrower, lender, registry, underwriting, vault } = await deployFixture();
      const good = await encryptProfile({
        revenue: 3_000_000n,
        debt: 200_000n,
        burnRate: 70_000n,
        receivables: 500_000n,
        cash: 1_300_000n,
        businessAge: 35,
      });
      await registry.connect(borrower).submitProfile(
        good.revenue,
        good.debt,
        good.burnRate,
        good.receivables,
        good.cash,
        good.businessAge,
        1
      );
      await underwriting.runUnderwriting(borrower.address);
      await vault.connect(borrower).requestLoan(120_000, 12);
      await vault.connect(lender).fundLoan(1, { value: 120_000 });

      const bad = await encryptProfile({
        revenue: 200_000n,
        debt: 2_000_000n,
        burnRate: 400_000n,
        receivables: 10_000n,
        cash: 20_000n,
        businessAge: 35,
      });
      await registry.connect(borrower).updateProfile(
        bad.revenue,
        bad.debt,
        bad.burnRate,
        bad.receivables,
        bad.cash,
        bad.businessAge,
        1
      );

      await expect(vault.checkCovenants(1)).to.emit(vault, "CovenantBreach");
    });
  });

  describe("PermitRegistry", function () {
    it("Should grant permit and return permitId", async function () {
      const { borrower, lender, permitRegistry } = await deployFixture();
      const tx = await permitRegistry.connect(borrower).grantPermit(lender.address, 0, 3600);
      const receipt = await tx.wait();
      expect(receipt?.logs.length).to.be.greaterThan(0);
    });

    it("Should return valid=true for unexpired permit", async function () {
      const { borrower, lender, permitRegistry } = await deployFixture();
      const tx = await permitRegistry.connect(borrower).grantPermit(lender.address, 1, 3600);
      const receipt = await tx.wait();
      const permitId = receipt?.logs[0].topics[1];
      expect(await permitRegistry.verifyPermit(permitId, lender.address, 1)).to.equal(true);
    });

    it("Should return valid=false after expiry", async function () {
      const { borrower, lender, permitRegistry } = await deployFixture();
      const tx = await permitRegistry.connect(borrower).grantPermit(lender.address, 1, 10);
      const receipt = await tx.wait();
      const permitId = receipt?.logs[0].topics[1];
      await time.increase(11);
      expect(await permitRegistry.verifyPermit(permitId, lender.address, 1)).to.equal(false);
    });

    it("Should revoke permit", async function () {
      const { borrower, lender, permitRegistry } = await deployFixture();
      const tx = await permitRegistry.connect(borrower).grantPermit(lender.address, 2, 3600);
      const receipt = await tx.wait();
      const permitId = receipt?.logs[0].topics[1];
      await permitRegistry.connect(borrower).revokePermit(permitId);
      expect(await permitRegistry.verifyPermit(permitId, lender.address, 2)).to.equal(false);
    });
  });
});
