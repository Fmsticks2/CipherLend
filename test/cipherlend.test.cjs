const { expect } = require("chai");
const hre = require("hardhat");
const { ethers } = hre;
const { time } = require("@nomicfoundation/hardhat-network-helpers");

const permissionTypes = {
  Permissioned: [{ name: "publicKey", type: "bytes32" }],
};

async function buildPermission(signer, contractAddress) {
  const { chainId } = await ethers.provider.getNetwork();
  const publicKey = ethers.hexlify(ethers.randomBytes(32));
  const signature = await signer.signTypedData(
    { name: "Fhenix Permission", version: "1.0", chainId, verifyingContract: contractAddress },
    permissionTypes,
    { publicKey }
  );
  return { publicKey, signature };
}

async function encryptProfile(values) {
  return {
    revenue: Number(values.revenue),
    debt: Number(values.debt),
    burnRate: Number(values.burnRate),
    receivables: Number(values.receivables),
    cash: Number(values.cash),
    businessAge: Number(values.businessAge),
  };
}

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

  async function seedBorrowerAndScore(fixture, overrides = {}) {
    const data = await encryptProfile({
      revenue: overrides.revenue ?? 2_500_000n,
      debt: overrides.debt ?? 300_000n,
      burnRate: overrides.burnRate ?? 90_000n,
      receivables: overrides.receivables ?? 400_000n,
      cash: overrides.cash ?? 1_000_000n,
      businessAge: overrides.businessAge ?? 28,
    });
    await fixture.registry.connect(fixture.borrower).submitProfile(
      data.revenue,
      data.debt,
      data.burnRate,
      data.receivables,
      data.cash,
      data.businessAge,
      overrides.sector ?? 1
    );
    await fixture.underwriting.runUnderwriting(fixture.borrower.address);
  }

  describe("BorrowerRegistry", function () {
    it("Should submit encrypted profile", async function () {
      const f = await deployFixture();
      const data = await encryptProfile({
        revenue: 2_000_000n, debt: 200_000n, burnRate: 80_000n, receivables: 300_000n, cash: 900_000n, businessAge: 24
      });
      await expect(f.registry.connect(f.borrower).submitProfile(data.revenue, data.debt, data.burnRate, data.receivables, data.cash, data.businessAge, 1))
        .to.emit(f.registry, "ProfileSubmitted");
    });

    it("Should return correct metadata (sector, timestamp)", async function () {
      const f = await deployFixture();
      await seedBorrowerAndScore(f, { sector: 3 });
      const m = await f.registry.getProfileMetadata(f.borrower.address);
      expect(Number(m[0])).to.equal(3);
      expect(Number(m[1])).to.be.greaterThan(0);
      expect(Number(m[2])).to.equal(1);
      expect(m[3]).to.equal(true);
    });

    it("Should not expose raw financials to non-permitted callers", async function () {
      const f = await deployFixture();
      await seedBorrowerAndScore(f);
      const badPermission = await buildPermission(f.lender, await f.registry.getAddress());
      await expect(f.registry.connect(f.lender).sealRevenueBucket(f.borrower.address, badPermission))
        .to.be.revertedWithCustomError(f.registry, "SignerNotOwner");
    });

    it("Should update profile and increment version", async function () {
      const f = await deployFixture();
      await seedBorrowerAndScore(f);
      const updated = await encryptProfile({
        revenue: 2_700_000n, debt: 250_000n, burnRate: 85_000n, receivables: 450_000n, cash: 1_050_000n, businessAge: 29
      });
      await expect(f.registry.connect(f.borrower).updateProfile(
        updated.revenue, updated.debt, updated.burnRate, updated.receivables, updated.cash, updated.businessAge, 1
      )).to.emit(f.registry, "ProfileUpdated");
      const m = await f.registry.getProfileMetadata(f.borrower.address);
      expect(Number(m[2])).to.equal(2);
    });

    it("Should return bucketed revenue with valid permit", async function () {
      const f = await deployFixture();
      await seedBorrowerAndScore(f, { revenue: 3_200_000n });
      const permission = await buildPermission(f.borrower, await f.registry.getAddress());
      const bucket = await f.registry.connect(f.lender).sealRevenueBucket(f.borrower.address, permission);
      expect(bucket).to.equal("$1M-$5M");
    });
  });

  describe("UnderwritingEngine", function () {
    it("Should run underwriting and store encrypted score", async function () {
      const f = await deployFixture();
      await seedBorrowerAndScore(f);
      const score = await f.underwriting.creditScores(f.borrower.address);
      expect(score.exists).to.equal(true);
    });

    it("Should return correct band to permitted lender", async function () {
      const f = await deployFixture();
      await seedBorrowerAndScore(f);
      const permission = await buildPermission(f.borrower, await f.underwriting.getAddress());
      const band = await f.underwriting.connect(f.lender).sealBandForLender(f.borrower.address, permission);
      expect(Number(band)).to.be.within(1, 6);
    });

    it("Should return correct terms to borrower", async function () {
      const f = await deployFixture();
      await seedBorrowerAndScore(f);
      const permission = await buildPermission(f.borrower, await f.underwriting.getAddress());
      const terms = await f.underwriting.connect(f.borrower).sealTermsForBorrower(f.borrower.address, permission);
      expect(terms[0]).to.be.greaterThan(0);
    });

    it("Should return boolean audit view to auditor", async function () {
      const f = await deployFixture();
      await seedBorrowerAndScore(f);
      const permission = await buildPermission(f.borrower, await f.underwriting.getAddress());
      const v = await f.underwriting.connect(f.auditor).sealAuditView(f.borrower.address, permission);
      expect(typeof v[2]).to.equal("boolean");
      expect(typeof v[3]).to.equal("boolean");
      expect(typeof v[4]).to.equal("boolean");
    });

    it("Should reject underwriting if profile too old", async function () {
      const f = await deployFixture();
      const data = await encryptProfile({
        revenue: 1_700_000n, debt: 400_000n, burnRate: 100_000n, receivables: 250_000n, cash: 500_000n, businessAge: 20
      });
      await f.registry.connect(f.borrower).submitProfile(data.revenue, data.debt, data.burnRate, data.receivables, data.cash, data.businessAge, 1);
      await time.increase(181 * 24 * 60 * 60);
      await expect(f.underwriting.runUnderwriting(f.borrower.address)).to.be.revertedWith("PROFILE_TOO_OLD");
    });
  });

  describe("LoanVault", function () {
    it("Should create loan request after valid score", async function () {
      const f = await deployFixture();
      await seedBorrowerAndScore(f);
      await expect(f.vault.connect(f.borrower).requestLoan(100_000, 12)).to.emit(f.vault, "LoanRequested");
    });

    it("Should reject loan exceeding maxLoanSize", async function () {
      const f = await deployFixture();
      await seedBorrowerAndScore(f, { revenue: 600_000n, debt: 400_000n, cash: 100_000n });
      await expect(f.vault.connect(f.borrower).requestLoan(10_000_000_000, 12)).to.be.revertedWith("EXCEEDS_MAX_LOAN");
    });

    it("Should fund loan and transfer principal", async function () {
      const f = await deployFixture();
      await seedBorrowerAndScore(f);
      await f.vault.connect(f.borrower).requestLoan(100_000, 12);
      await expect(f.vault.connect(f.lender).fundLoan(1, { value: 100_000 })).to.emit(f.vault, "LoanFunded");
    });

    it("Should accept repayment and update balance", async function () {
      const f = await deployFixture();
      await seedBorrowerAndScore(f);
      await f.vault.connect(f.borrower).requestLoan(100_000, 12);
      await f.vault.connect(f.lender).fundLoan(1, { value: 100_000 });
      await f.vault.connect(f.borrower).makePayment(1, { value: 30_000 });
      const loan = await f.vault.loans(1);
      expect(loan.remainingBalance).to.equal(70_000);
    });

    it("Should mark loan overdue after payment date passes", async function () {
      const f = await deployFixture();
      await seedBorrowerAndScore(f);
      await f.vault.connect(f.borrower).requestLoan(100_000, 12);
      await f.vault.connect(f.lender).fundLoan(1, { value: 100_000 });
      await time.increase(31 * 24 * 60 * 60);
      await expect(f.vault.markOverdue(1)).to.emit(f.vault, "LoanOverdue");
    });

    it("Should detect covenant breach on re-underwriting", async function () {
      const f = await deployFixture();
      await seedBorrowerAndScore(f, { revenue: 3_000_000n, debt: 200_000n, cash: 1_500_000n });
      await f.vault.connect(f.borrower).requestLoan(120_000, 12);
      await f.vault.connect(f.lender).fundLoan(1, { value: 120_000 });

      const bad = await encryptProfile({
        revenue: 150_000n, debt: 2_000_000n, burnRate: 400_000n, receivables: 10_000n, cash: 20_000n, businessAge: 35
      });
      await f.registry.connect(f.borrower).updateProfile(bad.revenue, bad.debt, bad.burnRate, bad.receivables, bad.cash, bad.businessAge, 1);
      await expect(f.vault.checkCovenants(1)).to.emit(f.vault, "CovenantBreach");
    });
  });

  describe("PermitRegistry", function () {
    it("Should grant permit and return permitId", async function () {
      const f = await deployFixture();
      const tx = await f.permitRegistry.connect(f.borrower).grantPermit(f.lender.address, 0, 3600);
      const r = await tx.wait();
      expect(r.logs.length).to.be.greaterThan(0);
    });
    it("Should return valid=true for unexpired permit", async function () {
      const f = await deployFixture();
      const tx = await f.permitRegistry.connect(f.borrower).grantPermit(f.lender.address, 1, 3600);
      const r = await tx.wait();
      const permitId = r.logs[0].topics[1];
      expect(await f.permitRegistry.verifyPermit(permitId, f.lender.address, 1)).to.equal(true);
    });
    it("Should return valid=false after expiry", async function () {
      const f = await deployFixture();
      const tx = await f.permitRegistry.connect(f.borrower).grantPermit(f.lender.address, 1, 5);
      const r = await tx.wait();
      const permitId = r.logs[0].topics[1];
      await time.increase(6);
      expect(await f.permitRegistry.verifyPermit(permitId, f.lender.address, 1)).to.equal(false);
    });
    it("Should revoke permit", async function () {
      const f = await deployFixture();
      const tx = await f.permitRegistry.connect(f.borrower).grantPermit(f.lender.address, 2, 3600);
      const r = await tx.wait();
      const permitId = r.logs[0].topics[1];
      await f.permitRegistry.connect(f.borrower).revokePermit(permitId);
      expect(await f.permitRegistry.verifyPermit(permitId, f.lender.address, 2)).to.equal(false);
    });
  });
});
