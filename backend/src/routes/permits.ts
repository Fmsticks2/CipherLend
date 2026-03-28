import { Router } from "express";
import { getPermitRegistry } from "../lib/contracts";

const router = Router();

const parsePermitType = (type: string) => {
  const normalized = type.toUpperCase();
  if (normalized === "LENDER") return 0;
  if (normalized === "AUDITOR") return 1;
  return 2;
};

router.get("/:address", async (req, res) => {
  try {
    const permitRegistry = getPermitRegistry();
    const permits = await permitRegistry.getPermitsForAddress(req.params.address);
    return res.json(
      permits.map((permit: any) => ({
        permitId: permit.permitId,
        grantor: permit.grantor,
        grantee: permit.grantee,
        type: Number(permit.ptype),
        expiresAt: Number(permit.expiresAt),
        revoked: Boolean(permit.revoked),
        valid: Boolean(permit.valid),
      }))
    );
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch permits",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

router.post("/grant", async (req, res) => {
  try {
    const { granteeAddress, type, duration } = req.body as {
      granteeAddress?: string;
      type?: string;
      duration?: number;
    };
    if (!granteeAddress || !type || !duration) {
      return res.status(400).json({ error: "granteeAddress, type and duration are required" });
    }

    const permitRegistry = getPermitRegistry();
    const tx = await permitRegistry.grantPermit(granteeAddress, parsePermitType(type), Number(duration));
    const receipt = await tx.wait();
    const event = receipt.logs?.[0];
    const permitId = event?.topics?.[1] ?? null;

    return res.json({
      permitId,
      expiresAt: Math.floor(Date.now() / 1000) + Number(duration),
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to grant permit",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
