import { Router } from "express";
import { encryptFinancialInputs } from "../lib/fhenix";
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

    const encrypted = await encryptFinancialInputs({
      revenue: BigInt(revenue),
      debt: BigInt(debt),
      burnRate: BigInt(burnRate),
      receivables: BigInt(receivables),
      cash: BigInt(cash),
      businessAge: Number(businessAge),
    });

    const registry = getBorrowerRegistry();
    const tx = await registry.submitProfile(
      encrypted.revenue,
      encrypted.debt,
      encrypted.burnRate,
      encrypted.receivables,
      encrypted.cash,
      encrypted.businessAge,
      Number(sector)
    );
    const receipt = await tx.wait();
    const signerAddress = await registry.runner!.getAddress();
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
