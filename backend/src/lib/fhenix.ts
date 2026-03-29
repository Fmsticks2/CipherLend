import { JsonRpcProvider, Wallet } from "ethers";
import { FhenixClient } from "fhenixjs";
import { createCofheClient, createCofheConfig } from "@cofhe/sdk/node";

const rpcUrl = process.env.FHENIX_RPC_URL ?? "https://api.helium.fhenix.zone";
const provider = new JsonRpcProvider(rpcUrl);
const signer = process.env.PRIVATE_KEY ? new Wallet(process.env.PRIVATE_KEY, provider) : undefined;

let fhenixClient: FhenixClient | null = null;
let cofheInitialized = false;

export const getProvider = () => provider;
export const getSigner = () => signer;

export const getFhenixClient = async (): Promise<FhenixClient> => {
  if (!fhenixClient) {
    fhenixClient = new FhenixClient({ provider: provider as any });
  }
  return fhenixClient;
};

export const initCofhe = async () => {
  if (cofheInitialized) return;
  const config = createCofheConfig({} as any);
  createCofheClient(config);
  cofheInitialized = true;
};

export type FinancialInput = {
  revenue: string | bigint;
  debt: string | bigint;
  burnRate: string | bigint;
  receivables: string | bigint;
  cash: string | bigint;
  businessAge: number;
};

export const encryptFinancialInputs = async (input: FinancialInput) => {
  await initCofhe();
  const client = await getFhenixClient();

  return {
    revenue: await client.encrypt_uint32(Number(input.revenue)),
    debt: await client.encrypt_uint32(Number(input.debt)),
    burnRate: await client.encrypt_uint32(Number(input.burnRate)),
    receivables: await client.encrypt_uint32(Number(input.receivables)),
    cash: await client.encrypt_uint32(Number(input.cash)),
    businessAge: await client.encrypt_uint32(input.businessAge),
  };
};
