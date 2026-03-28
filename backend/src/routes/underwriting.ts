import { Router } from "express";
import { getUnderwritingEngine } from "../lib/contracts";

type PermissionPayload = {
  publicKey: string;
  signature: string;
};

const parsePermission = (raw: string | undefined): PermissionPayload => {
  if (!raw) {
    throw new Error("Missing permit header");
  }
  const parsed = JSON.parse(raw) as PermissionPayload;
  if (!parsed.publicKey || !parsed.signature) {
    throw new Error("Invalid permit payload");
  }
  return parsed;
};

const router = Router();

router.post("/run", async (req, res) => {
  try {
    const { borrowerAddress } = req.body as { borrowerAddress?: string };
    if (!borrowerAddress) {
      return res.status(400).json({ error: "borrowerAddress is required" });
    }
    const underwriting = getUnderwritingEngine();
    const tx = await underwriting.runUnderwriting(borrowerAddress);
    const receipt = await tx.wait();
    const scoreId = receipt.logs?.[0]?.topics?.[1] ?? null;

    return res.json({
      scoreId,
      txHash: receipt.hash,
      computedAt: Math.floor(Date.now() / 1000),
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to run underwriting",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

router.get("/terms/:address", async (req, res) => {
  try {
    const underwriting = getUnderwritingEngine();
    const borrowerAddress = req.params.address;
    const permission = parsePermission(req.header("permit"));
    const terms = await underwriting.sealTermsForBorrower(borrowerAddress, permission);
    const band = await underwriting.sealBandForLender(borrowerAddress, permission);
    return res.json({
      maxLoan: terms[0].toString(),
      rateBps: terms[1].toString(),
      ltvBps: terms[2].toString(),
      band: Number(band),
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch underwriting terms",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
