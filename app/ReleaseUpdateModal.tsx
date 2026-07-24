"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChartNoAxesCombined,
  Check,
  Gift,
  List,
  MousePointer2,
  Play,
  SlidersHorizontal,
  WalletCards,
  X,
} from "lucide-react";
import React from "react";
import { createPortal } from "react-dom";
import { RELEASE_UPDATES_EVENT } from "./releaseUpdates";
import { FeeStructureBuilder, RewardBasketSelector, type FeeWallet } from "./FeeBuilderPanel";
import { DexSettingsPanel } from "./CreatePanelPage";

const RELEASE_ID = "2026-07-22-rwa-rollout-v2";
const RELEASE_VIEWER_KEY = "based-bid:release-viewer-id";
const RELEASE_SEEN_PREFIX = "based-bid:release-seen";

type ReleaseWalletWindow = Window & {
  ethereum?: { selectedAddress?: string | null };
  solana?: { publicKey?: { toString: () => string } | null };
};

function releaseViewerId() {
  const walletWindow = window as ReleaseWalletWindow;
  const evmAddress = walletWindow.ethereum?.selectedAddress?.trim().toLowerCase();
  if (evmAddress) return `wallet:${evmAddress}`;
  const solAddress = walletWindow.solana?.publicKey?.toString().trim();
  if (solAddress) return `wallet:${solAddress}`;
  try {
    const existing = window.localStorage.getItem(RELEASE_VIEWER_KEY);
    if (existing) return `browser:${existing}`;
    const generated = window.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(RELEASE_VIEWER_KEY, generated);
    return `browser:${generated}`;
  } catch {
    return "browser:storage-unavailable";
  }
}

function releaseSeenKey() {
  return `${RELEASE_SEEN_PREFIX}:${RELEASE_ID}:${releaseViewerId()}`;
}

type View = "visual" | "changelog";

const releaseSlides = [
  {
    eyebrow: "",
    title: "RWA support, fully rolled out",
    description: "Choose a single payout asset or build a basket from 45+ supported assets, with more being added.",
    accent: "#18c98e",
    visual: "pairs" as const,
  },
] as const;

const changelogSections = [
  {
    title: "RWA rollout",
    label: "Latest",
    items: [
      {
        icon: SlidersHorizontal,
        title: "RWA quote assets",
        copy: "Launch token and LBP liquidity against native assets, stables, stocks, or ETFs with network-aware presets.",
        tag: "Create",
      },
      {
        icon: ChartNoAxesCombined,
        title: "Configured DEX pairing",
        copy: "The launch walkthrough now uses an NVDA pair on Uniswap v4 with the real active 4% DEX fee control.",
        tag: "DEX",
      },
      {
        icon: Gift,
        title: "Multi-asset reward baskets",
        copy: "Choose one payout asset or build rotating and all-at-once baskets from 45+ supported assets, with more being added.",
        tag: "Rewards",
      },
    ],
  },
  {
    title: "Fee Builder and payouts",
    label: "Archive",
    items: [
      {
        icon: Gift,
        title: "Clearer fee routing",
        copy: "Payout order, route percentages, recipient addresses, ratios, wallet eligibility, and distribution progress are easier to scan.",
        tag: "Fees",
      },
      {
        icon: WalletCards,
        title: "Reward and wallet actions",
        copy: "Review personal reward payments, add individual assets or a complete basket to your wallet, and revisit imports whenever needed.",
        tag: "Wallet",
      },
      {
        icon: SlidersHorizontal,
        title: "Safer recipient setup",
        copy: "Treasury and custom routes include wallet shortcuts, compact explorer links, copy feedback, and network-aware address validation.",
        tag: "Routes",
      },
    ],
  },
  {
    title: "Pool terminal",
    label: "Archive",
    items: [
      {
        icon: ChartNoAxesCombined,
        title: "Complete market workspace",
        copy: "LBP pages bring together live market data, responsive charts, trades, holders, comments, and streamlined order controls.",
        tag: "Trade",
      },
      {
        icon: ChartNoAxesCombined,
        title: "Expandable charts and discussions",
        copy: "Resize the chart, expand long comment threads, retain voting state, and keep market context available in a movable chart view.",
        tag: "Terminal",
      },
      {
        icon: WalletCards,
        title: "Holder context",
        copy: "Connected wallets are highlighted with their holder rank, balance, and position while creator activity remains clearly identified.",
        tag: "Holders",
      },
    ],
  },
  {
    title: "Discovery and collections",
    label: "Archive",
    items: [
      {
        icon: WalletCards,
        title: "Chain-aware fee collection",
        copy: "Select multiple pools on the same network, switch chains when needed, and collect pending fees without leaving the current page.",
        tag: "Collect",
      },
      {
        icon: SlidersHorizontal,
        title: "Cleaner discovery hierarchy",
        copy: "Improved card spacing, responsive widths, centered filters, navigation behavior, and sidebar collapse across screen sizes.",
        tag: "Browse",
      },
      {
        icon: List,
        title: "Persistent update archive",
        copy: "Visual highlights stay focused while every shipped change remains available here for later reference.",
        tag: "Updates",
      },
    ],
  },
] as const;

function PairPreview() {
  const [phase, setPhase] = React.useState(0);
  const [basketCount, setBasketCount] = React.useState(0);
  const quoteDropdownOpen = phase === 1 || phase === 2;
  const nvdaSelected = phase >= 2;
  const feeBuilderVisible = phase >= 4;
  const selectingBasket = phase === 7;
  const basketAdded = phase >= 8;
  const treasuryAdded = phase >= 10;

  React.useEffect(() => {
    const durations = [1450, 1800, 1050, 1450, 1700, 1250, 1400, 4700, 1550, 1400, 2800];
    const timer = window.setTimeout(() => setPhase((value) => (value + 1) % durations.length), durations[phase]);
    return () => window.clearTimeout(timer);
  }, [phase]);

  React.useEffect(() => {
    if (phase === 7) {
      setBasketCount(0);
      const timers = Array.from({ length: 6 }, (_, index) => window.setTimeout(() => setBasketCount(index + 1), 520 + index * 590));
      return () => timers.forEach((timer) => window.clearTimeout(timer));
    }
    setBasketCount(phase >= 8 ? 6 : 0);
  }, [phase]);

  const basketAssets = [
    { symbol: "AAPL", name: "Apple", image: "/rwa/aapl.png" },
    { symbol: "NVDA", name: "NVIDIA", image: "/rwa/nvda.png" },
    { symbol: "TSLA", name: "Tesla", image: "/rwa/tsla.png" },
    { symbol: "MSFT", name: "Microsoft", image: "/rwa/msft.png" },
    { symbol: "AMZN", name: "Amazon", image: "/rwa/amzn.png" },
    { symbol: "SPY", name: "S&P 500 ETF", image: "/rwa/spy.png" },
  ];

  return (
    <div className="relative h-full w-full">
      <div className="relative h-full w-full overflow-hidden bg-[#090b0a]">
        <motion.div animate={{ y: feeBuilderVisible ? -226 : 0 }} transition={{ duration: 1.18, ease: [0.33, 1, 0.68, 1] }} className="absolute inset-x-0 top-0 px-4 py-4">
          <section className="relative h-[178px] rounded-[13px] border border-white/[0.075] bg-[#0d0f0e] p-4">
            <div className="mb-2.5 text-[8px] font-semibold uppercase tracking-[0.15em] text-white/25">DEX settings</div>
            <div className="grid grid-cols-[1fr_190px] items-end gap-3 sm:grid-cols-[1fr_238px]">
              <div className="min-w-0">
                <div className="text-[8px] font-semibold uppercase tracking-[0.14em] text-white/25">Select DEX</div>
                <div className="mt-1.5 flex h-10 items-center gap-2.5 rounded-[9px] border border-white/[0.075] bg-white/[0.015] px-3 text-[11px] font-semibold text-white/78">
                  <img src="/dex/uniswap.svg" alt="" className="h-4 w-4" /> Uniswap <span className="text-[8px] font-normal text-white/25">v3</span>
                </div>
              </div>
              <div className="relative">
                <div className="text-[8px] font-semibold uppercase tracking-[0.14em] text-white/25">Quote asset</div>
                <motion.div animate={{ borderColor: quoteDropdownOpen ? "rgba(24,201,142,.44)" : "rgba(255,255,255,.07)" }} transition={{ duration: 0.32 }} className="mt-1.5 flex h-10 items-center gap-2.5 rounded-[9px] border bg-white/[0.015] px-3">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.img key={nvdaSelected ? "nvda" : "eth"} src={nvdaSelected ? "/rwa/nvda.png" : "/tokens/ethereum.png"} alt="" initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.82 }} transition={{ duration: 0.38 }} className="h-5 w-5 rounded-full object-cover" />
                  </AnimatePresence>
                  <span className="min-w-0 flex-1 truncate text-[10.5px] font-semibold text-white/76">{nvdaSelected ? "NVDA" : "ETH"}</span>
                  <span className="text-[8px] text-white/25">{nvdaSelected ? "Stock" : "Native"}</span>
                  <motion.span animate={{ rotate: quoteDropdownOpen ? 180 : 0 }} transition={{ duration: 0.36 }} className="text-[8px] text-white/22">⌄</motion.span>
                </motion.div>
              </div>
            </div>

            <AnimatePresence>
              {quoteDropdownOpen ? (
                <motion.div initial={{ opacity: 0, y: -7, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.99 }} transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }} className="absolute right-4 top-[94px] z-20 w-[320px] rounded-[11px] border border-white/[0.09] bg-[#111312] p-2.5 shadow-[0_18px_48px_rgba(0,0,0,.5)]">
                  <div className="mb-2 flex items-center gap-1 text-[7.5px] font-semibold uppercase tracking-[0.08em]"><span className="rounded-[6px] bg-[#18c98e]/[0.08] px-2 py-1 text-[#79dfb7]">Stocks</span><span className="px-2 text-white/22">Native</span><span className="px-2 text-white/22">Stables</span></div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[{ symbol: "AAPL", image: "/rwa/aapl.png" }, { symbol: "NVDA", image: "/rwa/nvda.png" }, { symbol: "TSLA", image: "/rwa/tsla.png" }, { symbol: "MSFT", image: "/rwa/msft.png" }].map((asset) => {
                      const active = asset.symbol === "NVDA" && phase === 2;
                      return <motion.div key={asset.symbol} animate={{ borderColor: active ? "rgba(24,201,142,.55)" : "rgba(255,255,255,.055)", backgroundColor: active ? "rgba(24,201,142,.07)" : "rgba(255,255,255,.012)" }} transition={{ duration: 0.38 }} className="relative flex h-8 items-center gap-2 rounded-[8px] border px-2.5 text-[8.5px] font-semibold text-white/62"><img src={asset.image} alt="" className="h-[18px] w-[18px] rounded-full object-cover" />{asset.symbol}{asset.symbol === "NVDA" ? <motion.span animate={{ x: phase === 1 ? 18 : 1, y: phase === 1 ? 12 : 2, scale: active ? 0.84 : 1 }} transition={{ duration: 0.82, ease: [0.22, 1, 0.36, 1] }} className="absolute right-1 top-0 text-white"><MousePointer2 className="h-3.5 w-3.5 fill-[#0a0b0b]" /></motion.span> : null}</motion.div>;
                    })}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div className="mt-3 flex items-center gap-2 rounded-[9px] border border-white/[0.055] bg-white/[0.01] px-3 py-2.5 text-[8.5px] text-white/28"><Check className={`h-3 w-3 ${nvdaSelected ? "text-[#18c98e]" : "text-white/18"}`} /><span className="text-white/52">DEX</span><span className="ml-auto flex items-center gap-1.5"><img src="/dex/uniswap.svg" alt="" className="h-3.5 w-3.5" />Uniswap <span className="text-white/25">{nvdaSelected ? "NVDA" : "ETH"}</span> <span className="text-white/20">1%</span></span></div>
          </section>

          <div className="flex h-[48px] items-center justify-center"><motion.div animate={{ opacity: feeBuilderVisible ? 1 : 0.2 }} transition={{ duration: 0.7 }} className="h-6 w-px bg-gradient-to-b from-transparent via-white/12 to-transparent" /></div>

          <section className="relative min-h-[320px] overflow-hidden rounded-[13px] border border-white/[0.075] bg-[#0d0f0e] p-4">
            <div className="flex items-start justify-between">
              <div><div className="text-[12px] font-semibold text-white/80">Fee Builder</div><div className="mt-0.5 text-[8px] text-white/26">Configured fee routes and trading mechanics</div></div>
              <div className="text-right"><div className="text-[7px] uppercase tracking-[0.12em] text-white/22">Total fee</div><div className="mt-0.5 text-[11px] font-semibold text-[#f3c969]">{treasuryAdded ? "5%" : basketAdded ? "4%" : "0%"}</div></div>
            </div>

            <div className="mt-3.5 h-[5px] overflow-hidden rounded-full bg-white/[0.055]"><motion.div animate={{ width: treasuryAdded ? "50%" : basketAdded ? "40%" : "0%" }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="h-full rounded-full bg-gradient-to-r from-[#f3c969] to-[#18c98e]" /></div>

            <AnimatePresence mode="wait">
              {selectingBasket ? (
                <motion.div key="basket-picker" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.42 }} className="mt-3.5">
                  <div className="flex items-center justify-between"><div className="flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[0.08em]"><span className="text-white/22">All</span><span className="rounded-[6px] bg-[#18c98e]/[0.08] px-2 py-1 text-[#7be1b9]">Stocks</span><span className="text-white/22">ETFs</span></div><span className="text-[8.5px] font-semibold text-[#f3c969]">{basketCount}/6 selected</span></div>
                  <div className="mt-2 grid grid-cols-3 gap-1.5">
                    {basketAssets.map((asset, index) => {
                      const selected = index < basketCount;
                      return <motion.div key={asset.symbol} animate={{ borderColor: selected ? "rgba(243,201,105,.38)" : "rgba(255,255,255,.055)", backgroundColor: selected ? "rgba(243,201,105,.045)" : "rgba(255,255,255,.012)" }} transition={{ duration: 0.42 }} className="relative flex h-[46px] items-center gap-2 rounded-[9px] border px-2.5"><img src={asset.image} alt="" className="h-6 w-6 rounded-full object-cover" /><div className="min-w-0"><div className="truncate text-[9px] font-semibold text-white/67">{asset.symbol}</div><div className="truncate text-[6.5px] text-white/22">{asset.name}</div></div>{selected ? <motion.span initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }} className="absolute right-1.5 top-1.5 grid h-3.5 w-3.5 place-items-center rounded-full bg-[#f3c969] text-[#161308]"><Check className="h-2.5 w-2.5" /></motion.span> : null}</motion.div>;
                    })}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="routes" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="mt-3 space-y-1.5">
                  {basketAdded ? <div className="flex h-11 items-center gap-2 rounded-[9px] border border-[#f3c969]/16 bg-[#f3c969]/[0.025] px-2.5"><span className="grid h-6 w-6 place-items-center rounded-[7px] border border-[#f3c969]/22 text-[#f3c969]"><Gift className="h-3 w-3" /></span><div className="min-w-0"><div className="text-[8px] font-semibold text-white/68">Rewards Basket</div><div className="mt-0.5 flex -space-x-1">{basketAssets.map((asset) => <img key={asset.symbol} src={asset.image} alt="" className="h-3.5 w-3.5 rounded-full border border-[#0e100f] object-cover" />)}</div></div><span className="ml-auto text-[8px] font-semibold text-[#f3c969]">4%</span></div> : null}
                  {treasuryAdded ? <motion.div initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} className="flex h-10 items-center gap-2 rounded-[9px] border border-[#18c98e]/14 bg-[#18c98e]/[0.02] px-2.5"><span className="grid h-6 w-6 place-items-center rounded-[7px] border border-[#18c98e]/18 text-[#18c98e]"><WalletCards className="h-3 w-3" /></span><div><div className="text-[8px] font-semibold text-white/64">Treasury</div><div className="text-[6px] text-white/23">Routes fees to your treasury wallet</div></div><span className="ml-auto text-[8px] font-semibold text-[#18c98e]">1%</span></motion.div> : null}

                  {!basketAdded ? <div className="pt-1"><div className="mb-1.5 text-[6.5px] font-semibold uppercase tracking-[0.11em] text-white/22">Add fee routes</div><div className="grid grid-cols-2 gap-1.5"><motion.div animate={{ borderColor: phase === 6 ? "rgba(243,201,105,.52)" : "rgba(255,255,255,.06)", backgroundColor: phase === 6 ? "rgba(243,201,105,.055)" : "rgba(255,255,255,.012)" }} className="relative flex h-9 items-center gap-2 rounded-[8px] border px-2 text-[7.5px] font-semibold text-white/56"><Gift className="h-3 w-3 text-[#f3c969]" />Rewards Basket{phase === 6 ? <motion.span initial={{ x: 12, y: 8 }} animate={{ x: 0, y: 0 }} className="absolute right-2 top-1 text-white"><MousePointer2 className="h-3 w-3 fill-[#0a0b0b]" /></motion.span> : null}</motion.div><div className="flex h-9 items-center gap-2 rounded-[8px] border border-white/[0.06] px-2 text-[7.5px] font-semibold text-white/34"><WalletCards className="h-3 w-3" />Treasury</div></div></div> : null}

                  {basketAdded && !treasuryAdded ? <motion.div animate={{ borderColor: phase === 9 ? "rgba(24,201,142,.46)" : "rgba(255,255,255,.06)", backgroundColor: phase === 9 ? "rgba(24,201,142,.045)" : "rgba(255,255,255,.01)" }} className="relative flex h-9 items-center gap-2 rounded-[8px] border px-2.5 text-[7.5px] font-semibold text-white/42"><span className="text-[#18c98e]">+</span>Add Treasury{phase === 9 ? <motion.span initial={{ x: 13, y: 7 }} animate={{ x: 0, y: 0 }} className="absolute right-2 top-1 text-white"><MousePointer2 className="h-3 w-3 fill-[#0a0b0b]" /></motion.span> : null}</motion.div> : null}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </motion.div>

      </div>
    </div>
  );
}

const DEMO_REWARD_ASSETS = ["AAPL", "NVDA", "TSLA", "MSFT", "AMZN", "SPY"] as const;
const DEMO_PHASE_DURATIONS = [1700, 1350, 1550, 1800, 900, 1250, 1150, 1150, 1150, 1150, 1150, 1250, 2600, 650] as const;
const DEMO_TOTAL_DURATION = DEMO_PHASE_DURATIONS.reduce((sum, duration) => sum + duration, 0);

function equalDemoWeights(assets: readonly string[]) {
  if (!assets.length) return {};
  const base = Math.floor((1000 / assets.length)) / 10;
  return Object.fromEntries(assets.map((asset, index) => [asset, index === 0 ? Math.round((100 - base * (assets.length - 1)) * 10) / 10 : base]));
}

function RealPairPreview() {
  const [phase, setPhase] = React.useState(0);
  const [fees, setFees] = React.useState<FeeWallet[]>([]);
  const [rewardCount, setRewardCount] = React.useState(0);
  const [clickPulse, setClickPulse] = React.useState(false);
  const previewRef = React.useRef<HTMLDivElement>(null);
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const builderRef = React.useRef<HTMLDivElement>(null);
  const quoteTriggerRef = React.useRef<HTMLDivElement>(null);
  const quoteNvdaRef = React.useRef<HTMLDivElement>(null);
  const cursorRef = React.useRef<HTMLDivElement>(null);
  const phaseRef = React.useRef(phase);
  const clickPulseRef = React.useRef(clickPulse);
  phaseRef.current = phase;
  clickPulseRef.current = clickPulse;
  const feeBuilderVisible = phase >= 4;
  const quoteOpen = phase === 1 || phase === 2;
  const quoteSelected = phase >= 2;
  const progressStart = DEMO_PHASE_DURATIONS.slice(0, phase).reduce((sum, duration) => sum + duration, 0) / DEMO_TOTAL_DURATION * 100;
  const progressEnd = DEMO_PHASE_DURATIONS.slice(0, phase + 1).reduce((sum, duration) => sum + duration, 0) / DEMO_TOTAL_DURATION * 100;
  const inlinePointerRoute = phase >= 4 ? "rwa" : undefined;
  const inlinePointerAsset = phase >= 4
    ? (phase <= 5 ? DEMO_REWARD_ASSETS[0] : DEMO_REWARD_ASSETS[Math.min(5, phase - 5)])
    : undefined;

  React.useEffect(() => {
    const timer = window.setTimeout(() => setPhase((current) => (current + 1) % DEMO_PHASE_DURATIONS.length), DEMO_PHASE_DURATIONS[phase]);
    return () => window.clearTimeout(timer);
  }, [phase]);

  React.useEffect(() => {
    let clickTimer: number | undefined;
    let releaseTimer: number | undefined;
    setClickPulse(false);
    if (phase === 0) {
      setRewardCount(0);
    } else if (phase >= 5 && phase <= 10) {
      clickTimer = window.setTimeout(() => {
        setRewardCount(phase - 4);
        setClickPulse(true);
        releaseTimer = window.setTimeout(() => setClickPulse(false), 360);
      }, 1080);
    }
    return () => {
      if (clickTimer) window.clearTimeout(clickTimer);
      if (releaseTimer) window.clearTimeout(releaseTimer);
    };
  }, [phase]);

  React.useEffect(() => {
    if (phase < 4) {
      setFees([]);
      return;
    }

    const rewardAssets = DEMO_REWARD_ASSETS.slice(0, rewardCount);
    const next: FeeWallet[] = [{
      id: "rwa",
      name: "Rewards Basket",
      pct: 4,
      rewardThresholdPct: 0.1,
      rwaAssets: [...rewardAssets],
      rwaAssetWeights: equalDemoWeights(rewardAssets),
      rwaDistributionMode: "rotating",
      rewardGasPayer: "project",
    }];

    setFees(next);
  }, [phase, rewardCount]);

  const findTarget = React.useCallback((currentPhase: number) => {
    const root = builderRef.current;
    if (!root) return null;
    if (currentPhase >= 4 && currentPhase <= 10) {
      const symbol = currentPhase <= 5 ? DEMO_REWARD_ASSETS[0] : DEMO_REWARD_ASSETS[currentPhase - 5];
      return root.querySelector<HTMLElement>(`[data-reward-asset="${symbol}"]`);
    }
    if (currentPhase === 11) return root.querySelector<HTMLElement>('[data-reward-asset="SPY"]');
    return null;
  }, []);

  React.useEffect(() => {
    let frame = 0;
    let lastScrolledPhase = -1;
    const followTarget = () => {
      const root = previewRef.current;
      const cursorElement = cursorRef.current;
      const currentPhase = phaseRef.current;
      if (root && cursorElement) {
        const showingFeeBuilder = currentPhase >= 4;
        const target = showingFeeBuilder
          ? findTarget(currentPhase)
          : currentPhase === 0 ? quoteTriggerRef.current : quoteNvdaRef.current;
        const viewport = viewportRef.current;
        if (target) {
          if (showingFeeBuilder && viewport && currentPhase !== lastScrolledPhase) {
            const targetRect = target.getBoundingClientRect();
            const builderRect = builderRef.current?.getBoundingClientRect();
            const wantedTop = 205;
            const nextTop = Math.max(0, builderRect ? targetRect.top - builderRect.top - wantedTop + 12 : viewport.scrollTop);
            viewport.scrollTo({ top: nextTop, behavior: "smooth" });
            lastScrolledPhase = currentPhase;
          }
          const rootRect = root.getBoundingClientRect();
          const targetRect = target.getBoundingClientRect();
          const x = Math.max(8, Math.min(rootRect.width - 26, targetRect.left - rootRect.left + targetRect.width * 0.5));
          const y = Math.max(8, Math.min(rootRect.height - 26, targetRect.top - rootRect.top + targetRect.height * 0.5));
          const pressed = clickPulseRef.current || currentPhase === 2;
          cursorElement.style.opacity = "1";
          cursorElement.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${pressed ? 0.82 : 1})`;
        }
      }
      frame = window.requestAnimationFrame(followTarget);
    };
    frame = window.requestAnimationFrame(followTarget);
    return () => window.cancelAnimationFrame(frame);
  }, [findTarget]);

  return (
    <div ref={previewRef} data-demo-phase={phase} data-reward-count={rewardCount} className="relative h-full w-full overflow-hidden bg-transparent">
      <AnimatePresence mode="wait">
        {!feeBuilderVisible ? (
          <motion.div key="pairing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -170 }} transition={{ duration: 0.82, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0 overflow-hidden px-6 py-5">
            <div className="mx-auto w-full max-w-[690px] rounded-[18px] border border-white/[0.085] bg-[#0d100f]/95 p-5 shadow-[0_24px_70px_rgba(0,0,0,.36)]">
              <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] pb-3">
                <div><div className="text-[11px] font-semibold text-white/82">Launch configuration</div><div className="mt-0.5 text-[8px] text-white/30">Pool, liquidity and fee routing in one flow</div></div>
                <span className="rounded-full border border-[#18c98e]/18 bg-[#18c98e]/[0.045] px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#82dfbc]">Base</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[{ label: "Launch type", value: "LBP pool" }, { label: "Sale asset", value: "New token" }, { label: "Liquidity", value: "DEX graduation" }].map((item) => <div key={item.label} className="rounded-[10px] border border-white/[0.065] bg-white/[0.014] px-3 py-2"><div className="text-[7px] font-semibold uppercase tracking-[0.12em] text-white/24">{item.label}</div><div className="mt-1 text-[9.5px] font-semibold text-white/62">{item.value}</div></div>)}
              </div>
              <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/[0.09] to-transparent" />
              <div className="mb-2 text-[8px] font-semibold uppercase tracking-[0.15em] text-white/28">DEX liquidity</div>
              <div className="grid grid-cols-[1fr_245px] items-end gap-3">
                <div>
                  <div className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/34">Select DEX</div>
                  <div className="mt-2 flex h-12 items-center gap-3 rounded-[11px] border border-white/[0.09] bg-white/[0.018] px-3.5 text-[12px] font-semibold text-white/82"><img src="/dex/uniswap.svg" alt="" className="h-5 w-5" />Uniswap <span className="text-[9px] font-normal text-white/32">v3</span></div>
                </div>
                <div className="relative">
                  <div className="flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.15em] text-white/34"><span>Quote asset</span><span className="text-white/22">Liquidity token</span></div>
                  <motion.div ref={quoteTriggerRef} animate={{ borderColor: quoteOpen ? "rgba(24,201,142,.48)" : "rgba(255,255,255,.09)" }} className="mt-2 flex h-12 items-center gap-3 rounded-[11px] border bg-white/[0.018] px-3.5">
                    <img src={quoteSelected ? "/rwa/nvda.png" : "/tokens/ethereum.png"} alt="" className="h-6 w-6 rounded-full object-cover" />
                    <div className="flex-1"><div className="text-[11px] font-semibold text-white/82">{quoteSelected ? "NVDA" : "ETH"}</div><div className="text-[8px] text-white/30">{quoteSelected ? "NVIDIA" : "Ethereum"}</div></div>
                    <span className="text-[8px] uppercase tracking-[0.12em] text-white/28">{quoteSelected ? "Stock" : "Native"}</span>
                    <motion.span animate={{ rotate: quoteOpen ? 180 : 0 }} className="text-[10px] text-white/30">⌄</motion.span>
                  </motion.div>
                  <AnimatePresence>
                    {quoteOpen ? (
                      <motion.div data-demo-quote-menu initial={{ opacity: 0, y: -8, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.4 }} className="absolute right-0 top-[72px] z-20 w-[330px] rounded-[13px] border border-white/[0.10] bg-[#111412] p-3 shadow-[0_24px_70px_rgba(0,0,0,.62)]">
                        <div className="mb-2.5 flex gap-1.5 text-[8px] font-semibold"><span className="rounded-[7px] border border-[#18c98e]/20 bg-[#18c98e]/[0.08] px-2.5 py-1 text-[#80dfbb]">Stocks</span><span className="px-2.5 py-1 text-white/30">Native</span><span className="px-2.5 py-1 text-white/30">Stables</span><span className="px-2.5 py-1 text-white/30">ETFs</span></div>
                        <div className="grid grid-cols-2 gap-2">
                          {["AAPL", "NVDA", "TSLA", "MSFT"].map((symbol) => <div ref={symbol === "NVDA" ? quoteNvdaRef : undefined} key={symbol} className={`flex h-10 items-center gap-2.5 rounded-[9px] border px-2.5 ${symbol === "NVDA" && phase === 2 ? "border-[#18c98e]/45 bg-[#18c98e]/[0.07]" : "border-white/[0.065] bg-white/[0.012]"}`}><img src={`/rwa/${symbol.toLowerCase()}.png`} alt="" className="h-5 w-5 rounded-full object-cover" /><span className="text-[9.5px] font-semibold text-white/68">{symbol}</span></div>)}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4">
                <div><div className="text-[11px] font-semibold text-white/72">Fee Builder</div><div className="mt-0.5 text-[8px] text-white/28">Rewards and payout routes continue below</div></div>
                <div className="text-right"><div className="text-[7px] uppercase tracking-[0.12em] text-white/22">Configured</div><div className="mt-0.5 text-[10px] font-semibold text-white/52">0%</div></div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="fee-builder" initial={{ opacity: 0, y: 150 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0">
            <div ref={viewportRef} className="absolute inset-0 overflow-hidden px-3 py-3 [scrollbar-width:none]">
              <div ref={builderRef} className="mx-auto w-full origin-top-left rounded-[18px] border border-white/[0.075] bg-[#0b0e0c] p-4 shadow-[0_24px_80px_rgba(0,0,0,.44)] [&_[data-fee-builder-route-dock]]:invisible" style={{ zoom: 0.72 }}>
                <div className="mb-4 flex items-start justify-between gap-4 px-1">
                  <div><div className="text-[15px] font-semibold text-white/92">Fee Builder</div><div className="mt-0.5 text-[11px] text-white/48">Configured fee routes and trading mechanics</div></div>
                </div>
                <FeeStructureBuilder chain="base" fees={fees} onChange={setFees} walletAddress="0x4F72C8A19D36E05B7A8C14F260D93E51B6C482A0" demoPointerRouteId={inlinePointerRoute} demoPointerAssetId={inlinePointerAsset} demoPointerPressed={clickPulse} demoSuppressValidation />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={cursorRef} data-demo-cursor style={{ display: inlinePointerAsset ? "none" : undefined }} className="pointer-events-none absolute left-0 top-0 z-50 opacity-0 drop-shadow-[0_3px_8px_rgba(0,0,0,.85)] transition-[transform,opacity] duration-500 ease-[cubic-bezier(.22,1,.36,1)]">
        <MousePointer2 className="h-[18px] w-[18px] fill-[#0b0d0c] text-white" strokeWidth={1.6} />
        <AnimatePresence>{clickPulse || phase === 2 ? <motion.span initial={{ opacity: 0.8, scale: 0.45 }} animate={{ opacity: 0, scale: 1.75 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="absolute left-[-5px] top-[-5px] h-7 w-7 rounded-full border border-[#f3c969]/70" /> : null}</AnimatePresence>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[70] h-px overflow-hidden bg-white/[0.055]">
        <motion.div key={phase} initial={{ width: `${progressStart}%` }} animate={{ width: `${progressEnd}%` }} transition={{ duration: DEMO_PHASE_DURATIONS[phase] / 1000, ease: "linear" }} className="h-full bg-[#18c98e]/65" />
      </div>
    </div>
  );
}

function RealPairPreviewV2() {
  const [phase, setPhase] = React.useState(0);
  const [rewardCount, setRewardCount] = React.useState(0);
  const [clickPulse, setClickPulse] = React.useState(false);
  const [liquidityToken, setLiquidityToken] = React.useState("ETH");
  const [quoteOpen, setQuoteOpen] = React.useState(false);
  const feeBuilderVisible = phase >= 4;
  const pairConfigured = phase === 3;
  const completed = phase === 12;
  const outro = phase === 13;
  const progressStart = DEMO_PHASE_DURATIONS.slice(0, phase).reduce((sum, duration) => sum + duration, 0) / DEMO_TOTAL_DURATION * 100;
  const progressEnd = DEMO_PHASE_DURATIONS.slice(0, phase + 1).reduce((sum, duration) => sum + duration, 0) / DEMO_TOTAL_DURATION * 100;
  const inlinePointerAsset = phase >= 5 && phase <= 11
    ? DEMO_REWARD_ASSETS[Math.max(0, phase - 6)]
    : undefined;
  const dexPointerTarget = phase === 1 ? "quote-trigger" : phase === 2 ? "NVDA" : undefined;
  const rewardAssets = DEMO_REWARD_ASSETS.slice(0, rewardCount);
  const rewardWeights = equalDemoWeights(rewardAssets);

  React.useEffect(() => {
    const timer = window.setTimeout(
      () => setPhase((current) => (current + 1) % DEMO_PHASE_DURATIONS.length),
      DEMO_PHASE_DURATIONS[phase],
    );
    return () => window.clearTimeout(timer);
  }, [phase]);

  React.useEffect(() => {
    const timers: number[] = [];
    setClickPulse(false);
    if (phase === 0) {
      setLiquidityToken("ETH");
      setQuoteOpen(false);
      setRewardCount(0);
    } else if (phase === 1) {
      timers.push(window.setTimeout(() => {
        setClickPulse(true);
        setQuoteOpen(true);
        timers.push(window.setTimeout(() => setClickPulse(false), 260));
      }, 520));
    } else if (phase === 2) {
      setQuoteOpen(true);
      timers.push(window.setTimeout(() => {
        setClickPulse(true);
        timers.push(window.setTimeout(() => setLiquidityToken("NVDA"), 100));
        timers.push(window.setTimeout(() => setClickPulse(false), 320));
      }, 720));
    } else if (phase === 3) {
      setQuoteOpen(false);
    } else if (phase >= 6 && phase <= 11) {
      timers.push(window.setTimeout(() => {
        setClickPulse(true);
        setRewardCount(phase - 5);
        timers.push(window.setTimeout(() => setClickPulse(false), 300));
      }, 620));
    }
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [phase]);

  return (
    <motion.div
      data-demo-phase={phase}
      data-reward-count={rewardCount}
      animate={{ opacity: outro ? 0 : 1, scale: outro ? 0.988 : 1, y: outro ? -8 : 0 }}
      transition={{ duration: outro ? 0.5 : 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="release-update-preview relative h-full w-full overflow-hidden bg-transparent"
    >
      <style>{`.release-update-preview .range-slider{height:24px}.release-update-preview .range-slider::-webkit-slider-runnable-track{height:8px;background:transparent}.release-update-preview .range-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:14px;height:14px;border:2px solid #0A0A0A;background:#18C98E;box-shadow:0 0 0 2px rgba(24,201,142,.18);margin-top:-1px;transform:rotate(45deg);transform-origin:center;border-radius:0}.release-update-preview .range-slider::-moz-range-track{height:8px;background:transparent}.release-update-preview .range-slider::-moz-range-thumb{width:14px;height:14px;border:2px solid #0A0A0A;background:#18C98E;box-shadow:0 0 0 2px rgba(24,201,142,.18);border-radius:0;transform:rotate(45deg);transform-origin:center}`}</style>
      <AnimatePresence mode="wait">
        {!feeBuilderVisible ? (
          <motion.div
            key="pairing-real"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -48 }}
            transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 overflow-hidden p-3 sm:p-4"
          >
            <div className="relative h-full overflow-hidden rounded-[18px] border border-white/[0.075] bg-[#0b0d0c] px-4 py-4 shadow-[0_24px_70px_rgba(0,0,0,.36)]">
              <motion.div animate={{ opacity: pairConfigured ? 0.16 : 1, scale: pairConfigured ? 0.99 : 1 }} transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}>
              <div className="mb-4 flex items-start justify-between gap-4 border-b border-white/[0.07] pb-3">
                <div>
                  <div className="text-[14px] font-semibold text-white/92">DEX settings</div>
                  <div className="mt-0.5 text-[10px] text-white/45">Configure graduation liquidity and the quote asset.</div>
                </div>
                <span className="rounded-full border border-[#18c98e]/18 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#82dfbc]">Base</span>
              </div>
              <div className="origin-top-left" style={{ zoom: 0.72, width: "94%", marginLeft: "3%" }}>
                <DexSettingsPanel
                  dexFee={4}
                  setDexFee={() => undefined}
                  marketCap={1_000_000}
                  setMarketCap={() => undefined}
                  dexLiquidity={10}
                  setDexLiquidity={() => undefined}
                  dexSel="Uniswap v4"
                  setDexSel={() => undefined}
                  dexOpen={false}
                  setDexOpen={() => undefined}
                  liquidityToken={liquidityToken}
                  setLiquidityToken={setLiquidityToken}
                  supplyText="1,000,000,000"
                  setSupplyText={() => undefined}
                  chain="BASE"
                  onOpenFeeBuilder={() => undefined}
                  demoLiquidityTokenOpen={quoteOpen}
                  demoPointerTarget={dexPointerTarget}
                  demoPointerPressed={clickPulse}
                  demoHideSupply
                />
              </div>
              </motion.div>
              <AnimatePresence>
                {pairConfigured ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.015 }}
                    transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                    className="pointer-events-none absolute inset-0 z-30 grid place-items-center"
                  >
                    <div className="flex flex-col items-center text-center">
                      <motion.span initial={{ scale: 0.55, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.08, duration: 0.46, ease: [0.22, 1, 0.36, 1] }} className="grid h-10 w-10 place-items-center rounded-full border border-[#18c98e]/38 bg-[#18c98e]/10 text-[#18c98e] shadow-[0_0_34px_rgba(24,201,142,.12)]">
                        <Check className="h-5 w-5" strokeWidth={2.2} />
                      </motion.span>
                      <div className="mt-3 text-[16px] font-semibold tracking-[-0.02em] text-white/92">DEX pair configured</div>
                      <div className="mt-1 text-[9.5px] text-white/40">Your graduation pair and fee tier are ready.</div>
                      <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold text-white/72">
                        <img src="/dex/uniswap.svg" alt="" className="h-5 w-5" />
                        <span>Uniswap v4</span>
                        <span className="text-white/20">{"\u2022"}</span>
                        <img src="/rwa/nvda.png" alt="" className="h-5 w-5 rounded-full object-cover" />
                        <span>NVDA</span>
                        <span className="text-[#18c98e]">4%</span>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="rewards-basket-real"
            initial={{ opacity: 0, y: 38 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.64, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 overflow-hidden p-3 sm:p-4"
          >
            <div className="relative h-full overflow-hidden rounded-[18px] border border-white/[0.075] bg-[#0b0d0c] px-4 py-4 shadow-[0_24px_70px_rgba(0,0,0,.36)]">
              <motion.div animate={{ opacity: completed ? 0.16 : 1, scale: completed ? 0.99 : 1 }} transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}>
              <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] pb-3">
                <div>
                  <div className="text-[14px] font-semibold text-white/92">Rewards Basket</div>
                  <div className="mt-0.5 text-[10px] text-white/45">Select the assets delivered to eligible holders.</div>
                </div>
                <span className="text-[11px] font-semibold text-[#f3c969]">4%</span>
              </div>
              <div className="pointer-events-none origin-top-left" style={{ zoom: 0.72, width: "94%", marginLeft: "3%" }}>
                <RewardBasketSelector
                  chain="base"
                  value={[...rewardAssets]}
                  onChange={() => undefined}
                  distributionMode="rotating"
                  weights={rewardWeights}
                  pinnedAssets={[]}
                  onWeightsChange={() => undefined}
                  disabled={false}
                  invalid={false}
                  accent="#9DFF64"
                  demoPointerAssetId={inlinePointerAsset}
                  demoPointerPressed={clickPulse}
                />
              </div>
              </motion.div>
              <AnimatePresence>
                {completed ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.015 }}
                    transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                    className="pointer-events-none absolute inset-0 z-30 grid place-items-center"
                  >
                    <div className="flex flex-col items-center text-center">
                      <motion.span initial={{ scale: 0.55, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.08, duration: 0.46, ease: [0.22, 1, 0.36, 1] }} className="grid h-10 w-10 place-items-center rounded-full border border-[#f3c969]/38 bg-[#f3c969]/10 text-[#f3c969] shadow-[0_0_34px_rgba(243,201,105,.12)]">
                        <Check className="h-5 w-5" strokeWidth={2.2} />
                      </motion.span>
                      <div className="mt-3 text-[16px] font-semibold tracking-[-0.02em] text-white/92">Rewards basket configured</div>
                      <div className="mt-1 text-[9.5px] text-white/40">Six assets selected for rotating payouts.</div>
                      <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold text-white/72">
                        <div className="flex -space-x-1.5">
                          {DEMO_REWARD_ASSETS.map((asset, index) => (
                            <motion.img key={asset} src={`/rwa/${asset.toLowerCase()}.png`} alt="" initial={{ opacity: 0, y: 5, scale: 0.84 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.08 + index * 0.035, duration: 0.28 }} className="h-5 w-5 rounded-full border-2 border-[#0b0d0c] object-cover" />
                          ))}
                        </div>
                        <span>6 assets</span>
                        <span className="text-white/20">{"\u2022"}</span>
                        <span>Rotating</span>
                        <span className="text-[#f3c969]">4%</span>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[70] h-px overflow-hidden bg-white/[0.055]">
        <motion.div key={phase} initial={{ width: `${progressStart}%` }} animate={{ width: `${progressEnd}%` }} transition={{ duration: DEMO_PHASE_DURATIONS[phase] / 1000, ease: "linear" }} className="h-full bg-[#18c98e]/65" />
      </div>
    </motion.div>
  );
}

function FeePreview() {
  return (
    <div className="relative mx-auto flex h-full w-full max-w-[570px] items-center justify-center px-4 sm:px-8">
      <div className="w-full rounded-[16px] border border-white/[0.09] bg-[#0c0e0d]/96 p-4 shadow-[0_28px_80px_rgba(0,0,0,0.42)]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[12px] font-semibold text-white/90">Fee Builder</div>
            <div className="mt-0.5 text-[9px] text-white/38">Configured fee routes and trading mechanics</div>
          </div>
          <div className="rounded-full border border-[#f3c969]/35 px-2.5 py-1 text-[11px] font-semibold text-[#f3c969]">5%</div>
        </div>
        <div className="mt-4 h-[6px] overflow-hidden rounded-full bg-white/[0.07]">
          <motion.div initial={{ width: 0 }} animate={{ width: "50%" }} transition={{ delay: 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="h-full rounded-full bg-gradient-to-r from-[#f3c969] via-[#f5df79] to-[#18c98e]" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {[{ title: "Basket rewards", value: "4%", color: "#f3c969" }, { title: "Treasury", value: "1%", color: "#18c98e" }].map((route, index) => (
            <motion.div key={route.title} initial={{ opacity: 0, x: index ? 12 : -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.28, duration: 0.45 }} className="rounded-[12px] border border-white/[0.075] bg-white/[0.018] p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[10px] font-semibold text-white/70">{route.title}</span>
                <span className="text-[10px] font-semibold" style={{ color: route.color }}>{route.value}</span>
              </div>
              <div className="mt-3 h-1 rounded-full bg-white/[0.06]"><div className="h-full rounded-full" style={{ width: index ? "20%" : "80%", background: route.color }} /></div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TerminalPreview() {
  return (
    <div className="relative mx-auto flex h-full w-full max-w-[570px] items-center justify-center px-4 sm:px-8">
      <div className="grid w-full grid-cols-[1fr_112px] overflow-hidden rounded-[16px] border border-white/[0.09] bg-[#0c0e0d]/96 shadow-[0_28px_80px_rgba(0,0,0,0.42)] sm:grid-cols-[1fr_145px]">
        <div className="min-w-0 border-r border-white/[0.065]">
          <div className="flex items-center gap-3 border-b border-white/[0.065] px-3 py-2.5">
            <img src="/tokens/index.jpg" alt="" className="h-7 w-7 rounded-full object-cover" />
            <div className="min-w-0"><div className="truncate text-[11px] font-semibold text-white/88">RDX / ETH</div><div className="text-[8px] text-white/34">Robin Index</div></div>
            <div className="ml-auto text-right"><div className="text-[11px] font-semibold text-white">$863.41</div><div className="text-[8px] text-[#18c98e]">+12.4%</div></div>
          </div>
          <div className="relative h-[122px] overflow-hidden bg-[#090b0a] sm:h-[142px]">
            <div className="absolute inset-0 opacity-35" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px)", backgroundSize: "42px 32px" }} />
            <svg viewBox="0 0 420 150" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[90%] w-full">
              <defs><linearGradient id="release-chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#18c98e" stopOpacity=".26" /><stop offset="1" stopColor="#18c98e" stopOpacity="0" /></linearGradient></defs>
              <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.45, ease: "easeInOut" }} d="M0 124 C45 123 62 111 92 116 S145 88 177 94 S225 73 258 78 S305 43 337 53 S382 25 420 29 L420 150 L0 150 Z" fill="url(#release-chart-fill)" stroke="none" />
              <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.45, ease: "easeInOut" }} d="M0 124 C45 123 62 111 92 116 S145 88 177 94 S225 73 258 78 S305 43 337 53 S382 25 420 29" fill="none" stroke="#18c98e" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <div className="flex flex-col p-2.5">
          <div className="text-[9px] font-semibold text-white/75">Buy RDX</div>
          <div className="mt-2 rounded-[9px] border border-white/[0.08] bg-black/20 p-2">
            <div className="text-[7px] text-white/32">You pay</div><div className="mt-1 text-[13px] font-semibold text-white/88">1.00 <span className="text-[8px] text-white/42">ETH</span></div>
          </div>
          <div className="mt-2 h-1 rounded-full bg-white/[0.08]"><motion.div initial={{ width: "15%" }} animate={{ width: "62%" }} transition={{ delay: 0.3, duration: 1 }} className="h-full rounded-full bg-[#18c98e]" /></div>
          <div className="mt-auto rounded-[8px] bg-[#18c98e] py-2 text-center text-[8px] font-bold text-[#04150f]">Connect wallet</div>
        </div>
      </div>
    </div>
  );
}

function VisualUpdates() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="pointer-events-none relative min-h-[330px] flex-1 select-none overflow-hidden rounded-[18px] border border-white/[0.075] bg-[#080a09] sm:min-h-[440px]">
        <div className="pointer-events-none absolute inset-0 opacity-60" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)", backgroundSize: "42px 42px" }} />
        <AnimatePresence mode="wait">
          <motion.div key="rwa-rollout" initial={{ opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.01 }} transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0">
            <RealPairPreviewV2 />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Changelog() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-color:rgba(255,255,255,.12)_transparent] [scrollbar-width:thin]">
      <div className="mb-4 rounded-[14px] border border-[#18c98e]/14 bg-[#18c98e]/[0.035] px-4 py-3 text-[11px] leading-[1.55] text-white/52">
        <span className="font-semibold text-[#85e4bd]">Permanent archive</span> New entries are added without removing previously shipped updates.
      </div>
      <div className="space-y-5">
        {changelogSections.map((section, sectionIndex) => (
          <section key={section.title}>
            <div className="mb-2.5 flex items-center gap-3 px-1">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/58">{section.title}</h3>
              <div className="h-px flex-1 bg-white/[0.065]" />
              <span className={`text-[8px] font-semibold uppercase tracking-[0.13em] ${sectionIndex === 0 ? "text-[#18c98e]" : "text-white/25"}`}>{section.label}</span>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <motion.div key={item.title} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (sectionIndex * 0.04) + (itemIndex * 0.035), duration: 0.28 }} className="rounded-[14px] border border-white/[0.075] bg-white/[0.018] p-3.5">
                    <div className="flex items-start gap-3">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[9px] border border-white/[0.075] bg-[#0c0e0d] text-[#18c98e]"><Icon className="h-3.5 w-3.5" /></span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2"><h4 className="text-[11px] font-semibold text-white/84">{item.title}</h4><span className="text-[7.5px] font-semibold uppercase tracking-[0.12em] text-[#f3c969]/68">{item.tag}</span></div>
                        <p className="mt-1 text-[10px] leading-[1.5] text-white/40">{item.copy}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default function ReleaseUpdateModal() {
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState<View>("visual");
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const releaseSeenKeyRef = React.useRef<string | null>(null);
  const currentRelease = releaseSlides[0];
  const modalTitle = view === "visual" ? currentRelease.title : "Complete changelog";
  const modalDescription = view === "visual" ? currentRelease.description : "Every shipped interface change remains available here for later reference.";
  const modalEyebrow = view === "visual" ? "New update" : "Release notes";

  React.useEffect(() => {
    setMounted(true);
    const forcePreview = new URLSearchParams(window.location.search).has("whats-new");
    const viewerSeenKey = releaseSeenKey();
    releaseSeenKeyRef.current = viewerSeenKey;
    try {
      if (!forcePreview && window.localStorage.getItem(viewerSeenKey) === "seen") return;
    } catch {}
    const timer = window.setTimeout(() => setOpen(true), 650);
    return () => window.clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    const openUpdates = () => {
      setView("visual");
      setOpen(true);
    };
    window.addEventListener(RELEASE_UPDATES_EVENT, openUpdates);
    return () => window.removeEventListener(RELEASE_UPDATES_EVENT, openUpdates);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", closeOnEscape);
    window.setTimeout(() => closeRef.current?.focus(), 60);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const dismiss = React.useCallback(() => {
    try {
      window.localStorage.setItem(releaseSeenKeyRef.current ?? releaseSeenKey(), "seen");
    } catch {}
    setOpen(false);
  }, []);

  const next = () => {
    dismiss();
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/72 p-3 backdrop-blur-[7px] sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onMouseDown={(event) => { if (event.currentTarget === event.target) dismiss(); }}>
          <motion.section role="dialog" aria-modal="true" aria-labelledby="release-update-title" initial={{ opacity: 0, y: 16, scale: 0.982 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 9, scale: 0.988 }} transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }} className="relative flex h-[calc(100dvh-24px)] max-h-[820px] w-full max-w-[820px] flex-col overflow-hidden rounded-[22px] border border-white/[0.10] bg-[#101211] shadow-[0_36px_140px_rgba(0,0,0,0.72)] sm:h-[calc(100dvh-48px)]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#18c98e]/70 to-transparent" />
            <header className="flex items-start justify-between gap-4 px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
              <div className="min-w-0">
                <AnimatePresence mode="wait">
                  <motion.div key={`${view}-${modalTitle}`} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.22 }}>
                    <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#18c98e]">{modalEyebrow}</div>
                    <h2 id="release-update-title" className="text-[22px] font-semibold tracking-[-0.035em] text-white sm:text-[28px]">{modalTitle}</h2>
                    <p className="mt-1.5 max-w-[680px] text-[10.5px] leading-[1.5] text-white/42 sm:text-[12px]">{modalDescription}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
              <button ref={closeRef} type="button" aria-label="Close update" onClick={dismiss} className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full text-white/34 transition hover:bg-white/[0.055] hover:text-white/80 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#18c98e]/55"><X className="h-4 w-4" /></button>
            </header>

            <div className="mx-5 mb-4 grid grid-cols-2 rounded-[12px] border border-white/[0.075] bg-black/20 p-1 sm:mx-6">
              {([{ id: "visual", label: "Visual updates", icon: Play }, { id: "changelog", label: "Changelog", icon: List }] as const).map((item) => {
                const Icon = item.icon;
                const active = view === item.id;
                return <button key={item.id} type="button" aria-pressed={active} onClick={() => setView(item.id)} className={`relative flex h-9 cursor-pointer items-center justify-center gap-2 rounded-[9px] text-[11px] font-semibold transition ${active ? "text-white" : "text-white/36 hover:text-white/64"}`}>{active ? <motion.span layoutId="release-view-active" className="absolute inset-0 rounded-[9px] border border-white/[0.08] bg-white/[0.055] shadow-[0_6px_18px_rgba(0,0,0,.22)]" transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }} /> : null}<Icon className={`relative h-3.5 w-3.5 ${active ? "text-[#18c98e]" : ""}`} /><span className="relative">{item.label}</span></button>;
              })}
            </div>

            <main className="flex min-h-0 flex-1 flex-col px-5 sm:px-6">
              <AnimatePresence mode="wait">
                <motion.div key={view} initial={{ opacity: 0, x: view === "visual" ? -7 : 7 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: view === "visual" ? 7 : -7 }} transition={{ duration: 0.22 }} className="flex min-h-0 flex-1 flex-col">
                  {view === "visual" ? <VisualUpdates /> : <Changelog />}
                </motion.div>
              </AnimatePresence>
            </main>

            <footer className="mt-4 flex min-h-[66px] items-center gap-3 border-t border-white/[0.07] px-5 py-3 sm:px-6">
              <div className="hidden min-w-0 items-center gap-2 sm:flex"><img src="/brand-icon.png" alt="" className="h-5 w-5 object-contain" /><div className="truncate text-[9.5px] text-white/34"><span className="font-semibold text-white/58">based bid</span> just updated</div></div>
              <div className="flex-1" />
              <button type="button" onClick={next} className="group inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-1.5 px-1 text-[10.5px] font-semibold text-white/46 transition hover:text-[#8ee6c4]">Close<Check className="h-3.5 w-3.5" /></button>
            </footer>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
