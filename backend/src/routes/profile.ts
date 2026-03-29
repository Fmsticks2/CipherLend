import { Router } from "express";
import { getBorrowerRegistry } from "../lib/contracts";

const router = Router();

router.post("/submit", async (req, res) => {
  try {
    const { revenue, debt, burnRate, receivables, cash, businessAge, sector } = req.body;
    if (
      revenue === undefined ||
      debt === undefined ||
      burnRate === undefined ||
      receivables === undefined ||
      cash === undefined ||
      businessAge === undefined ||
      sector === undefined
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const registry = getBorrowerRegistry();
    const tx = await registry.submitProfile(
      BigInt(revenue),
      BigInt(debt),
      BigInt(burnRate),
      BigInt(receivables),
      BigInt(cash),
      Number(businessAge),
      Number(sector)
    );
    const receipt = await tx.wait();
    const signerAddress = await (registry.runner as any).getAddress();
    const metadata = await registry.getProfileMetadata(signerAddress);

    return res.json({
      txHash: receipt.hash,
      profileVersion: Number(metadata[2]),
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to submit profile",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
