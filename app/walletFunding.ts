import type { WalletFundingStatus } from "./useWalletFundingStatus";

export type WalletFundingWarningData = {
  availableEth: number;
  requiredEth: number;
  includesInitialBuy: boolean;
  creationSponsored: boolean;
  cdpUnavailableOnChain: boolean;
};

const PLAN_COST_ETH: Record<string, number> = {
  based: 0,
  "super based": 0.00018,
  "ultra based": 0.00036,
};

const INITIAL_BUY_ESTIMATE_ETH = 0.072;
const CREATION_GAS_RESERVE_ETH = 0.00045;
const INITIAL_BUY_GAS_RESERVE_ETH = 0.00025;

export const getRequiredWalletBalanceEth = (
  plan: string,
  initialBuy: number,
  creationSponsored = false,
) =>
  (PLAN_COST_ETH[plan] ?? 0) +
  (creationSponsored ? 0 : CREATION_GAS_RESERVE_ETH) +
  (initialBuy > 0
    ? INITIAL_BUY_ESTIMATE_ETH + INITIAL_BUY_GAS_RESERVE_ETH
    : 0);

export const getWalletFundingWarning = (
  wallet: WalletFundingStatus,
  plan: string,
  initialBuy: number,
  chain: string,
): WalletFundingWarningData | null => {
  const isBaseChain = chain.trim().toUpperCase() === "BASE";
  const creationSponsored =
    wallet.isCdpGaslessSmartWallet && isBaseChain;
  const requiredEth = getRequiredWalletBalanceEth(
    plan,
    initialBuy,
    creationSponsored,
  );

  if (
    !wallet.connected ||
    wallet.balanceEth === null ||
    wallet.balanceEth + Number.EPSILON >= requiredEth
  ) {
    return null;
  }

  return {
    availableEth: wallet.balanceEth,
    requiredEth,
    includesInitialBuy: initialBuy > 0,
    creationSponsored,
    cdpUnavailableOnChain:
      wallet.isCdpGaslessSmartWallet && !isBaseChain,
  };
};
