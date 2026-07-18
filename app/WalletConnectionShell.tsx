"use client";

import { useState, type ReactNode } from "react";
import WalletNetworkModal, { type WalletNetwork } from "./WalletNetworkModal";

const networkLabels: Record<WalletNetwork, string> = {
  evm: "EVM",
  base: "Base",
  solana: "Solana",
};

export default function WalletConnectionShell({ children }: { children: ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [network, setNetwork] = useState<WalletNetwork | null>(null);

  return (
    <>
      {children}
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="fixed right-5 top-5 z-40 inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-[#151717]/95 px-4 text-xs font-semibold text-white/82 shadow-[0_14px_36px_rgba(0,0,0,0.34)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-[#54D99A]/35 hover:bg-[#191C1B] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54D99A]/50"
        aria-haspopup="dialog"
      >
        <span className={`h-2 w-2 rounded-full ${network ? "bg-[#54D99A] shadow-[0_0_9px_rgba(84,217,154,0.7)]" : "bg-white/30"}`} aria-hidden="true" />
        <span>{network ? `${networkLabels[network]} connected` : "Connect wallet"}</span>
      </button>
      <WalletNetworkModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={(selectedNetwork) => {
          setNetwork(selectedNetwork);
          setModalOpen(false);
        }}
      />
    </>
  );
}
