"use client";

import Image from "next/image";
import { Check, WalletCards, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./WalletNetworkModal.module.css";

export type WalletNetwork = "evm" | "base" | "solana";

type WalletNetworkModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (network: WalletNetwork) => void;
};

const evmNetworks = [
  { name: "Base", src: "/networks/base.png" },
  { name: "Robinhood", src: "/networks/robinhood.png" },
  { name: "BNB Chain", src: "/networks/bsc.png" },
  { name: "Ethereum", src: "/networks/ethereum.png" },
] as const;

function EvmNetworkCycle() {
  return (
    <span className={styles.evmCycle} aria-hidden="true">
      <span className={styles.evmGlow} />
      {evmNetworks.map((network, index) => (
        <span key={network.name} className={styles.evmCycleItem} style={{ animationDelay: `${index * 1.2}s` }}>
          <Image src={network.src} alt="" width={42} height={42} sizes="42px" priority={index === 0} />
        </span>
      ))}
    </span>
  );
}

function NetworkTrail() {
  return (
    <span className={styles.networkTrail} aria-label="Base, Robinhood, BNB Chain and Ethereum supported">
      {evmNetworks.map((network) => (
        <span key={network.name} className={styles.trailIcon} title={network.name}>
          <Image src={network.src} alt="" width={20} height={20} sizes="20px" />
        </span>
      ))}
    </span>
  );
}

function BaseIcon() {
  return (
    <span className={`${styles.iconShell} ${styles.baseShell}`} aria-hidden="true">
      <Image src="/networks/base.png" alt="" width={42} height={42} sizes="42px" />
    </span>
  );
}

function SolanaIcon() {
  return (
    <span className={`${styles.iconShell} ${styles.solanaShell}`} aria-hidden="true">
      <Image src="/networks/sol.png" alt="" width={42} height={42} sizes="42px" />
    </span>
  );
}

export default function WalletNetworkModal({ open, onClose, onSelect }: WalletNetworkModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeButton = panelRef.current?.querySelector<HTMLButtonElement>("[data-close]");
    closeButton?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>("button, [href], [tabindex]:not([tabindex='-1'])"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (typeof document === "undefined" || !open) return null;

  return createPortal(
    <div className={styles.backdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={panelRef} className={styles.panel} role="dialog" aria-modal="true" aria-labelledby="wallet-network-title" aria-describedby="wallet-network-description">
        <span className={styles.topGlow} aria-hidden="true" />

        <header className={styles.header}>
          <div className={styles.walletGlyph} aria-hidden="true"><WalletCards size={18} strokeWidth={1.8} /></div>
          <div className={styles.headingCopy}>
            <h2 id="wallet-network-title">Choose your network</h2>
            <p id="wallet-network-description">Select a network to connect your wallet.</p>
          </div>
          <button data-close type="button" className={styles.closeButton} onClick={onClose} aria-label="Close network selection">
            <X size={18} strokeWidth={1.8} />
          </button>
        </header>

        <div className={styles.options}>
          <button type="button" className={`${styles.option} ${styles.primaryOption}`} onClick={() => onSelect("evm")}>
            <EvmNetworkCycle />
            <span className={styles.optionContent}>
              <span className={styles.optionTitleRow}>
                <strong>EVM Networks</strong>
                <span className={styles.recommended}><Check size={10} strokeWidth={2.6} /> Recommended</span>
              </span>
              <span className={styles.optionDescription}>Connect with Base, Robinhood, BNB Chain and Ethereum</span>
              <NetworkTrail />
            </span>
          </button>

          <button type="button" className={styles.option} onClick={() => onSelect("base")}>
            <BaseIcon />
            <span className={styles.optionContent}>
              <span className={styles.optionTitleRow}>
                <strong>Base · Gasless</strong>
                <span className={styles.gasless}>No gas needed</span>
              </span>
              <span className={styles.optionDescription}>The easiest start with Coinbase Smart Wallet</span>
            </span>
          </button>

          <button type="button" className={styles.option} onClick={() => onSelect("solana")}>
            <SolanaIcon />
            <span className={styles.optionContent}>
              <span className={styles.optionTitleRow}><strong>Solana Network</strong></span>
              <span className={styles.optionDescription}>Connect using your Solana wallet</span>
            </span>
          </button>
        </div>

        <footer className={styles.footer}>
          <span className={styles.statusDot} aria-hidden="true" />
          You can switch networks at any time
        </footer>
      </div>
    </div>,
    document.body,
  );
}
