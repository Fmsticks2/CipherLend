import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

const fhenixHelium = defineChain({
  id: 8008135,
  name: 'Fhenix Helium',
  nativeCurrency: {
    name: 'tFHE',
    symbol: 'tFHE',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://api.helium.fhenix.zone'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Fhenix Helium Explorer',
      url: 'https://explorer.helium.fhenix.zone',
    },
  },
  testnet: true,
});

const hardhatLocal = defineChain({
  id: 31337,
  name: 'Hardhat Local',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Localhost',
      url: 'http://127.0.0.1:8545',
    },
  },
  testnet: true,
});

const projectId =
  (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_WALLETCONNECT_PROJECT_ID ??
  'WALLETCONNECT_PROJECT_ID';

export const wagmiConfig = getDefaultConfig({
  appName: 'CipherLend',
  projectId,
  chains: [fhenixHelium, hardhatLocal],
  ssr: false,
});
