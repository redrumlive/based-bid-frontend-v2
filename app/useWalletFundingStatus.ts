"use client";

import { useEffect, useState } from "react";

export const BB_WALLET_STATUS_EVENT = "bb-wallet-status";

export type WalletFundingStatus = {
  connected: boolean;
  address: string | null;
  balanceEth: number | null;
  isCdpGaslessSmartWallet: boolean;
};

export type WalletStatusEventDetail = Partial<WalletFundingStatus> & {
  walletType?: string;
};

type EthereumProvider = {
  isCoinbaseWallet?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
};

const DISCONNECTED: WalletFundingStatus = {
  connected: false,
  address: null,
  balanceEth: null,
  isCdpGaslessSmartWallet: false,
};

let lastKnownWalletStatus: WalletFundingStatus = DISCONNECTED;

const getProvider = () =>
  (window as Window & { ethereum?: EthereumProvider }).ethereum;

const hasPaymasterCapability = (capabilities: unknown) => {
  if (!capabilities || typeof capabilities !== "object") return false;

  return Object.values(capabilities).some((chainCapabilities) => {
    if (!chainCapabilities || typeof chainCapabilities !== "object") return false;
    const paymaster = (chainCapabilities as Record<string, unknown>)
      .paymasterService;
    if (!paymaster || typeof paymaster !== "object") return false;
    return (paymaster as Record<string, unknown>).supported === true;
  });
};

const weiHexToEth = (value: unknown) => {
  if (typeof value !== "string" || !/^0x[\da-f]+$/i.test(value)) return null;
  try {
    return Number(BigInt(value)) / 1e18;
  } catch {
    return null;
  }
};

const readInjectedWallet = async (
  provider: EthereumProvider,
): Promise<WalletFundingStatus> => {
  const accountsResult = await provider.request({ method: "eth_accounts" });
  const accounts = Array.isArray(accountsResult)
    ? accountsResult.filter((item): item is string => typeof item === "string")
    : [];
  const address = accounts[0] ?? null;
  if (!address) return DISCONNECTED;

  const balanceResult = await provider.request({
    method: "eth_getBalance",
    params: [address, "latest"],
  });

  let capabilities: unknown = null;
  try {
    capabilities = await provider.request({
      method: "wallet_getCapabilities",
      params: [address],
    });
  } catch {
    // Standard injected wallets are not required to support EIP-5792.
  }

  return {
    connected: true,
    address,
    balanceEth: weiHexToEth(balanceResult),
    isCdpGaslessSmartWallet:
      provider.isCoinbaseWallet === true && hasPaymasterCapability(capabilities),
  };
};

const normalizeEventDetail = (
  detail: WalletStatusEventDetail,
): WalletFundingStatus => ({
  connected: detail.connected === true,
  address: typeof detail.address === "string" ? detail.address : null,
  balanceEth:
    typeof detail.balanceEth === "number" && Number.isFinite(detail.balanceEth)
      ? Math.max(0, detail.balanceEth)
      : null,
  isCdpGaslessSmartWallet:
    detail.isCdpGaslessSmartWallet === true ||
    detail.walletType === "coinbase-cdp-smart-wallet",
});

export function publishWalletStatus(detail: WalletStatusEventDetail) {
  const next = normalizeEventDetail(detail);
  lastKnownWalletStatus = next;
  window.dispatchEvent(new CustomEvent(BB_WALLET_STATUS_EVENT, { detail: next }));
}

export function useWalletFundingStatus() {
  const [status, setStatus] = useState<WalletFundingStatus>(() => lastKnownWalletStatus);

  useEffect(() => {
    let active = true;
    const provider = getProvider();

    const refresh = async () => {
      if (!provider) return;
      try {
        const nextStatus = await readInjectedWallet(provider);
        if (active) {
          lastKnownWalletStatus = nextStatus;
          setStatus(nextStatus);
        }
      } catch {
        if (active) {
          lastKnownWalletStatus = DISCONNECTED;
          setStatus(DISCONNECTED);
        }
      }
    };

    const handleWalletStatus = (event: Event) => {
      const detail = (event as CustomEvent<WalletStatusEventDetail>).detail;
      const next = normalizeEventDetail(detail ?? {});
      lastKnownWalletStatus = next;
      setStatus(next);
    };
    const handleProviderChange = () => void refresh();

    window.addEventListener(BB_WALLET_STATUS_EVENT, handleWalletStatus);
    provider?.on?.("accountsChanged", handleProviderChange);
    provider?.on?.("chainChanged", handleProviderChange);
    void refresh();

    return () => {
      active = false;
      window.removeEventListener(BB_WALLET_STATUS_EVENT, handleWalletStatus);
      provider?.removeListener?.("accountsChanged", handleProviderChange);
      provider?.removeListener?.("chainChanged", handleProviderChange);
    };
  }, []);

  return status;
}
