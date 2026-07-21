"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Check, ChevronDown, Coins, HandCoins, Hash, Wallet, X } from "lucide-react";
import React from "react";

type Network = "eth" | "bsc" | "base" | "sol" | "robinhood" | "megaeth";

export type FeeCollectBoard = {
  id: string;
  name: string;
};

export type FeeCollectTarget = {
  id: string;
  boardId: string;
  project: string;
  symbol: string;
  network: Network;
  contract: string;
  usdValue: number;
  nativeAmount: string;
  tokenAmount: string;
  avatar: string;
  accent: string;
};

const DEFAULT_OWNED_BOARDS: FeeCollectBoard[] = [
  { id: "based", name: "Based" },
  { id: "uaecalls", name: "UAECalls" },
];

const COLLAPSED_POOL_LIMIT = 2;

const FEE_COLLECT_TARGETS: FeeCollectTarget[] = [
  {
    id: "aero-pool",
    boardId: "based",
    project: "Aero Pool",
    symbol: "AERO",
    network: "base",
    contract: "0x09d4...af12",
    usdValue: 763.04,
    nativeAmount: "0.182 ETH",
    tokenAmount: "1,540.88 AERO",
    avatar: "A",
    accent: "#18c98e",
  },
  {
    id: "morpho-vault",
    boardId: "based",
    project: "Morpho Vault",
    symbol: "MORPHO",
    network: "base",
    contract: "0x87a2...91be",
    usdValue: 428.36,
    nativeAmount: "0.071 ETH",
    tokenAmount: "184.22 MORPHO",
    avatar: "M",
    accent: "#74a7ff",
  },
  {
    id: "coin-reserve",
    boardId: "based",
    project: "Coin Reserve",
    symbol: "COIN",
    network: "base",
    contract: "0x71c8...20ad",
    usdValue: 184.62,
    nativeAmount: "0.044 ETH",
    tokenAmount: "28.40 COIN",
    avatar: "C",
    accent: "#3b82f6",
  },
  {
    id: "based-pepe",
    boardId: "uaecalls",
    project: "Based Pepe",
    symbol: "BPEPE",
    network: "eth",
    contract: "0x4fa1...77ce",
    usdValue: 92.17,
    nativeAmount: "0.019 ETH",
    tokenAmount: "12,402 BPEPE",
    avatar: "BP",
    accent: "#d8f36c",
  },
  {
    id: "chain-reaction",
    boardId: "uaecalls",
    project: "Chain Reaction",
    symbol: "REACT",
    network: "bsc",
    contract: "0x216e...93b1",
    usdValue: 241.8,
    nativeAmount: "0.138 BNB",
    tokenAmount: "8,420 REACT",
    avatar: "CR",
    accent: "#facc15",
  },
  {
    id: "desert-alpha",
    boardId: "uaecalls",
    project: "Desert Alpha",
    symbol: "DALPHA",
    network: "base",
    contract: "0x94b2...e108",
    usdValue: 68.44,
    nativeAmount: "0.016 ETH",
    tokenAmount: "942 DALPHA",
    avatar: "DA",
    accent: "#f59e0b",
  },
];

const NETWORK_ICONS: Record<Exclude<Network, "megaeth">, string> = {
  eth: "/networks/ethereum.png",
  bsc: "/networks/bsc.png",
  base: "/networks/base.png",
  sol: "/networks/sol.png",
  robinhood: "/networks/robinhood.png",
};

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");
const shortAddr = (address: string) => address.length <= 10 ? address : `${address.slice(0, 6)}...${address.slice(-4)}`;
const networkName = (network: Network) => network === "eth" ? "Ethereum" : network === "megaeth" ? "MegaETH" : network === "base" ? "Base" : network === "bsc" ? "BNB" : network === "robinhood" ? "Robinhood" : "Solana";
const formatUsd = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
const tokenTint = (accent: string, strength: number) => `color-mix(in srgb, ${accent} ${strength}%, transparent)`;

function NetworkIcon({ network }: { network: Network }) {
  if (network === "megaeth") return <span aria-hidden className="grid h-3 w-3 shrink-0 place-items-center rounded-full bg-[#151515] text-[6px] font-bold text-white/88 ring-1 ring-white/20">M</span>;
  return <Image unoptimized src={NETWORK_ICONS[network]} alt="" width={12} height={12} className="h-3 w-3 shrink-0 rounded-full object-cover" />;
}

function CollectFeeTargetRow({ target, selected, onSelect }: { target: FeeCollectTarget; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cx(
        "group relative flex w-full min-w-0 flex-wrap items-center gap-3 px-4 py-4 text-left transition-[background-color,box-shadow] duration-200 sm:flex-nowrap sm:px-5",
        selected ? "bg-[#18c98e]/[0.045] shadow-[inset_2px_0_0_rgba(24,201,142,0.78)]" : "hover:bg-white/[0.028]",
      )}
    >
      <span
        aria-hidden
        className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] border bg-[#101212] text-[10px] font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]"
        style={{ borderColor: tokenTint(target.accent, selected ? 38 : 20), color: target.accent }}
      >
        {target.avatar}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-baseline gap-2">
          <span className="truncate text-[13px] font-semibold tracking-[-0.015em] text-white/88">{target.project}</span>
          <span className="shrink-0 text-[8px] font-semibold uppercase tracking-[0.11em] text-white/30">{target.symbol}</span>
        </span>
        <span className="mt-1 flex min-w-0 items-center gap-1.5 text-[10px] text-white/34">
          <NetworkIcon network={target.network} />
          <span className="shrink-0">{networkName(target.network)}</span>
          <span className="text-white/16">·</span>
          <span className="truncate tabular-nums">{target.contract}</span>
        </span>
      </span>

      <span className="ml-auto flex min-w-0 basis-full items-center justify-between gap-2.5 pl-[52px] sm:basis-auto sm:min-w-[260px] sm:justify-end sm:pl-0">
        <span className="text-right">
          <span className="block text-[13.5px] font-semibold tabular-nums tracking-[-0.02em] text-[#18c98e]/90">{formatUsd(target.usdValue)}</span>
          <span className="mt-0.5 block max-w-[204px] truncate text-[9.5px] tabular-nums text-white/38">
            {target.nativeAmount} <span className="px-0.5 text-white/18">+</span> {target.tokenAmount}
          </span>
        </span>
      </span>
    </button>
  );
}

export default function CollectFeesModal({
  open,
  walletAddress,
  boards = DEFAULT_OWNED_BOARDS,
  onClose,
  onCollected,
}: {
  open: boolean;
  walletAddress: string;
  boards?: FeeCollectBoard[];
  onClose: () => void;
  onCollected: (target: FeeCollectTarget) => void;
}) {
  const availableBoards = React.useMemo(() => boards.filter((board) => FEE_COLLECT_TARGETS.some((target) => target.boardId === board.id)), [boards]);
  const availableTargets = React.useMemo(() => {
    const availableBoardIds = new Set(availableBoards.map((board) => board.id));
    return FEE_COLLECT_TARGETS.filter((target) => availableBoardIds.has(target.boardId));
  }, [availableBoards]);
  const availableNetworks = React.useMemo(() => Array.from(new Set(availableTargets.map((target) => target.network))), [availableTargets]);
  const [activeNetwork, setActiveNetwork] = React.useState<Network>(availableTargets[0]?.network ?? "base");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(() => new Set(availableTargets[0] ? [availableTargets[0].id] : []));
  const [expandedBoardIds, setExpandedBoardIds] = React.useState<Set<string>>(() => new Set());
  const [networkMenuOpen, setNetworkMenuOpen] = React.useState(false);
  const [collectionState, setCollectionState] = React.useState<"idle" | "collecting" | "success">("idle");
  const [collectionProgress, setCollectionProgress] = React.useState(0);
  const collectionTimerRef = React.useRef<number | null>(null);
  const networkMenuRef = React.useRef<HTMLDivElement | null>(null);
  const chainTargets = React.useMemo(() => availableTargets.filter((target) => target.network === activeNetwork), [activeNetwork, availableTargets]);
  const chainBoards = React.useMemo(() => availableBoards.filter((board) => chainTargets.some((target) => target.boardId === board.id)), [availableBoards, chainTargets]);
  const selectedTargets = chainTargets.filter((target) => selectedIds.has(target.id));
  const selectedTotal = selectedTargets.reduce((total, target) => total + target.usdValue, 0);

  const clearCollectionTimer = React.useCallback(() => {
    if (collectionTimerRef.current !== null) {
      window.clearTimeout(collectionTimerRef.current);
      collectionTimerRef.current = null;
    }
  }, []);

  const closeModal = React.useCallback(() => {
    clearCollectionTimer();
    setCollectionState("idle");
    setCollectionProgress(0);
    setExpandedBoardIds(new Set());
    setNetworkMenuOpen(false);
    onClose();
  }, [clearCollectionTimer, onClose]);

  React.useEffect(() => {
    if (!availableNetworks.includes(activeNetwork)) setActiveNetwork(availableNetworks[0] ?? "base");
  }, [activeNetwork, availableNetworks]);

  React.useEffect(() => {
    const availableIds = new Set(chainTargets.map((target) => target.id));
    setSelectedIds((current) => {
      const next = new Set(Array.from(current).filter((id) => availableIds.has(id)));
      if (current.size > 0 && next.size === 0 && chainTargets[0]) next.add(chainTargets[0].id);
      const unchanged = next.size === current.size && Array.from(next).every((id) => current.has(id));
      return unchanged ? current : next;
    });
  }, [activeNetwork, chainTargets]);

  React.useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") networkMenuOpen ? setNetworkMenuOpen(false) : closeModal();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [closeModal, networkMenuOpen, open]);

  React.useEffect(() => {
    if (!networkMenuOpen) return;
    const closeMenu = (event: PointerEvent) => {
      if (!networkMenuRef.current?.contains(event.target as Node)) setNetworkMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeMenu);
    return () => document.removeEventListener("pointerdown", closeMenu);
  }, [networkMenuOpen]);

  React.useEffect(() => () => clearCollectionTimer(), [clearCollectionTimer]);

  const selectTarget = (targetId: string) => {
    clearCollectionTimer();
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(targetId)) next.delete(targetId);
      else next.add(targetId);
      return next;
    });
    setCollectionState("idle");
    setCollectionProgress(0);
  };

  const switchNetwork = (network: Network) => {
    clearCollectionTimer();
    const firstTarget = availableTargets.find((target) => target.network === network);
    setActiveNetwork(network);
    setSelectedIds(new Set(firstTarget ? [firstTarget.id] : []));
    setExpandedBoardIds(new Set());
    setNetworkMenuOpen(false);
    setCollectionState("idle");
    setCollectionProgress(0);
  };

  const toggleBoardSelection = (boardTargets: FeeCollectTarget[]) => {
    clearCollectionTimer();
    setSelectedIds((current) => {
      const next = new Set(current);
      const allSelected = boardTargets.every((target) => next.has(target.id));
      boardTargets.forEach((target) => allSelected ? next.delete(target.id) : next.add(target.id));
      return next;
    });
    setCollectionState("idle");
    setCollectionProgress(0);
  };

  const toggleBoardExpanded = (boardId: string) => {
    setExpandedBoardIds((current) => {
      const next = new Set(current);
      if (next.has(boardId)) next.delete(boardId);
      else next.add(boardId);
      return next;
    });
  };

  const collectSelectedFees = () => {
    if (!selectedTargets.length) return;
    clearCollectionTimer();
    setCollectionState("collecting");
    setCollectionProgress(0);
    const targetsToCollect = [...selectedTargets];
    let completed = 0;
    const confirmNextTransaction = () => {
      onCollected(targetsToCollect[completed]);
      completed += 1;
      setCollectionProgress(completed);
      if (completed < targetsToCollect.length) {
        collectionTimerRef.current = window.setTimeout(confirmNextTransaction, 620);
      } else {
        setCollectionState("success");
        collectionTimerRef.current = null;
      }
    };
    collectionTimerRef.current = window.setTimeout(confirmNextTransaction, 620);
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[180] flex items-center justify-center bg-black/72 p-3 backdrop-blur-[6px] sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(event) => event.target === event.currentTarget && closeModal()}
        >
          <motion.section
            layout
            role="dialog"
            aria-modal="true"
            aria-labelledby="collect-fees-title"
            initial={{ opacity: 0, y: 14, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.99 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1], layout: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
            className="flex max-h-[calc(100vh-24px)] w-full max-w-[780px] flex-col overflow-hidden rounded-[24px] border border-white/[0.1] bg-[linear-gradient(180deg,#101212_0%,#0a0c0b_100%)] shadow-[0_38px_126px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.035)] sm:max-h-[calc(100vh-48px)]"
          >
            <header className="flex items-start gap-4 border-b border-white/[0.065] px-4 py-4 sm:px-6 sm:py-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] border border-white/[0.095] bg-white/[0.028] text-[#18c98e]/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                <HandCoins className="h-[18px] w-[18px]" strokeWidth={1.7} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[8px] font-semibold uppercase tracking-[0.17em] text-white/30">Creator earnings</div>
                <h2 id="collect-fees-title" className="mt-1 text-[21px] font-semibold tracking-[-0.035em] text-white/92">Collect fees</h2>
                <p className="mt-1 text-[11px] leading-relaxed text-white/40">Select one or more pools on the same chain and claim their accrued DEX fees.</p>
              </div>
              <button type="button" onClick={closeModal} aria-label="Close fee collection" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/34 ring-1 ring-white/[0.08] transition hover:bg-white/[0.045] hover:text-white/72 hover:ring-white/[0.14]">
                <X className="h-3.5 w-3.5" />
              </button>
            </header>

            <div className="bb-scroll min-h-0 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
              <div className="mb-4 flex items-center justify-between gap-3 px-0.5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.13em] text-white/30">
                    <span>Eligible pools</span>
                    <span className="relative inline-flex h-[16px] min-w-[43px] items-center justify-center overflow-hidden rounded-full bg-[#18c98e]/[0.06] px-1.5 text-[8px] font-semibold tracking-normal text-[#18c98e]/66 ring-1 ring-[#18c98e]/12">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={activeNetwork}
                          initial={{ opacity: 0, y: 4, filter: "blur(2px)" }}
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          exit={{ opacity: 0, y: -4, filter: "blur(2px)" }}
                          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        >
                          {chainTargets.length} ready
                        </motion.span>
                      </AnimatePresence>
                    </span>
                  </div>
                  <span className="h-3.5 w-px shrink-0 bg-white/[0.07]" aria-hidden="true" />
                  <div className="flex min-w-0 items-center gap-1.5 text-[9px] text-white/28">
                    <Wallet className="h-3 w-3 shrink-0" />
                    <span className="truncate tabular-nums">{shortAddr(walletAddress)}</span>
                  </div>
                </div>
                <div ref={networkMenuRef} className="relative shrink-0">
                    <motion.button
                      layout
                      type="button"
                      aria-label="Change collection chain"
                      aria-haspopup="listbox"
                      aria-expanded={networkMenuOpen}
                      onClick={() => setNetworkMenuOpen((current) => !current)}
                      className="inline-flex h-8 items-center gap-2 rounded-[10px] border border-white/[0.08] bg-white/[0.018] px-2.5 text-[9px] font-medium text-white/58 outline-none transition hover:border-white/[0.14] hover:text-white/78 focus-visible:border-[#18c98e]/24"
                    >
                      <span className="text-[7px] font-semibold uppercase tracking-[0.12em] text-white/24">Chain</span>
                      <span className="relative inline-flex min-w-[54px] items-center justify-start overflow-hidden">
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.span
                            key={activeNetwork}
                            className="inline-flex items-center gap-2 whitespace-nowrap"
                            initial={{ opacity: 0, y: 4, filter: "blur(2px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: -4, filter: "blur(2px)" }}
                            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                          >
                            <NetworkIcon network={activeNetwork} />
                            <span>{networkName(activeNetwork)}</span>
                          </motion.span>
                        </AnimatePresence>
                      </span>
                      <ChevronDown className={cx("h-3 w-3 text-white/28 transition-transform duration-200", networkMenuOpen && "rotate-180")} strokeWidth={1.8} />
                    </motion.button>

                    <AnimatePresence>
                      {networkMenuOpen ? (
                        <motion.div
                          role="listbox"
                          initial={{ opacity: 0, y: -7, scale: 0.985, filter: "blur(2px)" }}
                          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                          exit={{ opacity: 0, y: -5, scale: 0.99, filter: "blur(2px)" }}
                          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                          className="absolute right-0 top-[calc(100%+7px)] z-30 w-[208px] overflow-hidden rounded-[12px] border border-white/[0.1] bg-[#111312]/98 p-1.5 shadow-[0_18px_48px_rgba(0,0,0,0.56)] backdrop-blur-xl"
                        >
                          <div className="px-2.5 pb-1.5 pt-1 text-[7px] font-semibold uppercase tracking-[0.14em] text-white/24">Switch collection chain</div>
                          {availableNetworks.map((network) => {
                            const active = network === activeNetwork;
                            const networkTargets = availableTargets.filter((target) => target.network === network);
                            return (
                              <button
                                key={network}
                                type="button"
                                role="option"
                                aria-selected={active}
                                onClick={() => switchNetwork(network)}
                                className={cx("flex h-10 w-full items-center gap-2.5 rounded-[9px] px-2.5 text-left transition", active ? "bg-[#18c98e]/[0.07] text-white/84" : "text-white/48 hover:bg-white/[0.04] hover:text-white/72")}
                              >
                                <NetworkIcon network={network} />
                                <span className="min-w-0 flex-1 text-[10px] font-medium">{networkName(network)}</span>
                                <span className="text-[8px] tabular-nums text-white/26">{networkTargets.length} {networkTargets.length === 1 ? "pool" : "pools"}</span>
                                {active ? <Check className="h-3 w-3 text-[#18c98e]/72" strokeWidth={2} /> : null}
                              </button>
                            );
                          })}
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                </div>
              </div>

              <motion.div layout transition={{ layout: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activeNetwork}
                    className="space-y-4"
                    initial={{ opacity: 0, y: 9, filter: "blur(3px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -7, filter: "blur(3px)" }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  >
                  {chainBoards.map((board) => {
                  const boardTargets = chainTargets.filter((target) => target.boardId === board.id);
                  const expanded = expandedBoardIds.has(board.id);
                  const allBoardTargetsSelected = boardTargets.every((target) => selectedIds.has(target.id));
                  const primaryTargets = boardTargets.slice(0, COLLAPSED_POOL_LIMIT);
                  const overflowTargets = boardTargets.slice(COLLAPSED_POOL_LIMIT);
                  const hiddenPoolCount = Math.max(0, boardTargets.length - COLLAPSED_POOL_LIMIT);
                  const boardTotal = boardTargets.reduce((total, target) => total + target.usdValue, 0);

                  return (
                    <motion.section
                      layout="position"
                      key={board.id}
                      className="overflow-hidden rounded-[16px] border border-white/[0.075] bg-black/10"
                      transition={{ layout: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } }}
                    >
                      <div className="flex items-center justify-between gap-4 border-b border-white/[0.055] bg-white/[0.014] px-4 py-3.5 sm:px-5">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[9px] border border-white/[0.075] bg-white/[0.02] text-[#18c98e]/62">
                            <Hash className="h-3.5 w-3.5" strokeWidth={1.8} />
                          </span>
                          <div className="min-w-0">
                            <div className="truncate text-[11.5px] font-semibold text-white/76">{board.name}</div>
                            <div className="mt-0.5 text-[8px] uppercase tracking-[0.11em] text-white/26">{boardTargets.length} {boardTargets.length === 1 ? "pool" : "pools"}</div>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-4">
                          <button
                            type="button"
                            aria-pressed={allBoardTargetsSelected}
                            onClick={() => toggleBoardSelection(boardTargets)}
                            className={cx(
                              "inline-flex w-[64px] items-center justify-start gap-1.5 text-[9px] font-medium outline-none transition",
                              allBoardTargetsSelected ? "text-[#18c98e]/76" : "text-white/36 hover:text-[#18c98e]/78 focus-visible:text-[#18c98e]/78",
                            )}
                          >
                            <Check className="h-3 w-3" strokeWidth={2} />
                            Select all
                          </button>
                          <div className="text-right">
                            <div className="text-[8px] uppercase tracking-[0.12em] text-white/26">Pending fees</div>
                            <div className="mt-0.5 text-[11px] font-semibold tabular-nums text-white/62">{formatUsd(boardTotal)}</div>
                          </div>
                        </div>
                      </div>

                      <div className="divide-y divide-white/[0.055]">
                        {primaryTargets.map((target) => (
                          <CollectFeeTargetRow key={target.id} target={target} selected={selectedIds.has(target.id)} onSelect={() => selectTarget(target.id)} />
                        ))}
                        <AnimatePresence initial={false}>
                          {expanded ? overflowTargets.map((target) => (
                            <motion.div
                              key={target.id}
                              initial={{ height: 0, opacity: 0, filter: "blur(2px)" }}
                              animate={{ height: "auto", opacity: 1, filter: "blur(0px)" }}
                              exit={{ height: 0, opacity: 0, filter: "blur(2px)" }}
                              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                              className="overflow-hidden"
                            >
                              <CollectFeeTargetRow target={target} selected={selectedIds.has(target.id)} onSelect={() => selectTarget(target.id)} />
                            </motion.div>
                          )) : null}
                        </AnimatePresence>
                      </div>

                      {hiddenPoolCount > 0 ? (
                        <button
                          type="button"
                          aria-expanded={expanded}
                          onClick={() => toggleBoardExpanded(board.id)}
                          className="flex h-9 w-full items-center justify-center gap-1.5 border-t border-white/[0.055] text-[9px] font-medium text-white/34 outline-none transition hover:bg-white/[0.022] hover:text-white/58 focus-visible:bg-white/[0.022] focus-visible:text-white/58"
                        >
                          <span>{expanded ? "Show less" : `Show ${hiddenPoolCount} more ${hiddenPoolCount === 1 ? "pool" : "pools"}`}</span>
                          <ChevronDown className={cx("h-3 w-3 transition-transform duration-200", expanded && "rotate-180")} strokeWidth={1.8} />
                        </button>
                      ) : null}
                    </motion.section>
                  );
                  })}
                  {!chainBoards.length ? <div className="rounded-[16px] border border-white/[0.075] px-5 py-8 text-center text-[11px] text-white/38">No pending fees on {networkName(activeNetwork)}.</div> : null}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>

            <footer className="flex flex-col gap-3 border-t border-white/[0.065] bg-black/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="min-w-0">
                <div className="text-[8px] font-semibold uppercase tracking-[0.16em] text-white/28">Selected pending fees</div>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activeNetwork}
                    initial={{ opacity: 0, y: 4, filter: "blur(2px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -4, filter: "blur(2px)" }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {selectedTargets.length ? (
                      <div className="mt-1 flex min-w-0 flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                        <span className="text-[21px] font-semibold tabular-nums tracking-[-0.04em] text-[#18c98e]/92">{formatUsd(selectedTotal)}</span>
                        <span className="truncate text-[10px] text-white/42">{selectedTargets.length} {networkName(activeNetwork)} {selectedTargets.length === 1 ? "pool" : "pools"} selected</span>
                      </div>
                    ) : <div className="mt-1 text-[11px] text-white/34">Select one or more pools to collect.</div>}
                  </motion.div>
                </AnimatePresence>
              </div>
              <button
                type="button"
                onClick={collectSelectedFees}
                disabled={!selectedTargets.length || collectionState !== "idle"}
                className={cx(
                  "group inline-flex h-10 w-[132px] shrink-0 items-center justify-center gap-2 rounded-[13px] border text-[11px] font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-200",
                  collectionState === "success"
                    ? "border-[#18c98e]/14 bg-[#18c98e]/[0.055] text-[#18c98e]/68"
                    : collectionState === "collecting"
                      ? "border-white/[0.08] bg-white/[0.025] text-white/42"
                      : "border-[#18c98e]/24 bg-[#18c98e]/[0.065] text-[#b7f7ca] shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_10px_28px_rgba(0,0,0,0.18)] hover:-translate-y-px hover:border-[#18c98e]/38 hover:bg-[#18c98e]/[0.1] hover:text-[#d9ffe4] disabled:cursor-default disabled:opacity-36 disabled:hover:translate-y-0",
                )}
              >
                {collectionState === "success" ? <Check className="h-3.5 w-3.5" /> : <Coins className="h-3.5 w-3.5" />}
                {collectionState === "collecting"
                  ? `Confirm ${Math.min(collectionProgress + 1, selectedTargets.length)} of ${selectedTargets.length}`
                  : collectionState === "success"
                    ? `${selectedTargets.length} collected`
                    : selectedTargets.length > 1
                      ? `Collect ${selectedTargets.length} pools`
                      : "Collect fees"}
              </button>
            </footer>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
