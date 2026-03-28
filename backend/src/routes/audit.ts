import { Router } from "express";
import { getLoanVault, getPermitRegistry, getUnderwritingEngine } from "../lib/contracts";

type PermissionPayload = {
  publicKey: string;
  signature: string;
};

const router = Router();

router.get("/verify", async (req, res) => {
  try {
    const { loanId, permitId, auditorAddress } = req.query as {
      loanId?: string;
      permitId?: string;
      auditorAddress?: string;
    };

    if (!loanId || !permitId || !auditorAddress) {
      return res.status(400).json({ error: "loanId, permitId and auditorAddress are required" });
    }

    const permissionHeader = req.header("permit");
    if (!permissionHeader) {
      return res.status(400).json({ error: "permit header is required" });
    }
    const permission = JSON.parse(permissionHeader) as PermissionPayload;

    const permitRegistry = getPermitRegistry();
    const permitValid = await permitRegistry.verifyPermit(permitId, auditorAddress, 1);
    if (!permitValid) {
      return res.status(403).json({ error: "Permit is not valid for this auditor" });
    }

    const loanVault = getLoanVault();
    const loan = await loanVault.loans(Number(loanId));
    const borrower = loan.borrower;

    const underwriting = getUnderwritingEngine();
    const audit = await underwriting.sealAuditView(borrower, permission);
    const score = await underwriting.creditScores(borrower);

    return res.json({
      band: Number(audit[0]),
      revenueBucket: audit[1],
      dscrAboveThreshold: Boolean(audit[2]),
      leverageWithinPolicy: Boolean(audit[3]),
      covenantCompliant: Boolean(audit[4]),
      proofHash: score[5],
      computedAt: Number(score[4]),
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to verify audit",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
