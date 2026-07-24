"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownAZ,
  ArrowUpDown,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  DollarSign,
  ExternalLink,
  Gift,
  History,
  Layers3,
  Network,
  Plus,
  Search,
  Trophy,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppToast } from "./AppToast";

type AssetKind = "native" | "stable" | "stock" | "etf" | "token";
type NetworkKey = "robinhood" | "base" | "solana" | "ethereum" | "bsc";
type AssetFilter = "received" | "all" | AssetKind;
type AssetSort = "value" | "earned" | "name";

type RewardAsset = {
  symbol: string;
  name: string;
  icon: string;
  kind: AssetKind;
  network: NetworkKey;
  amount: number;
  currentValue: number;
  lifetimeValue: number;
  sourceProjects: number;
  lastReceived?: string;
};

type RewardProject = {
  id: string;
  title: string;
  ticker: string;
  network: NetworkKey;
  accent: string;
  balance: number;
  bagValue: number;
  walletShare: number;
  minimumShare: number;
  rewardsValue: number;
  lastPaid: string;
  basketStatus: "active" | "last";
  basketAssets: Array<{ symbol: string; icon: string }>;
};

type Distribution = {
  id: string;
  projectId: string;
  project: string;
  ticker: string;
  route: string;
  network: NetworkKey;
  received: string;
  value: number;
  tx: string;
  assets: Array<{ symbol: string; name: string; icon: string; amount: number; value: number }>;
};

const NETWORKS: Record<NetworkKey, { label: string; icon: string }> = {
  robinhood: { label: "Robinhood", icon: "/networks/robinhood.png" },
  base: { label: "Base", icon: "/networks/base.png" },
  solana: { label: "Solana", icon: "/networks/sol.png" },
  ethereum: { label: "Ethereum", icon: "/networks/ethereum.png" },
  bsc: { label: "BNB Chain", icon: "/networks/bsc.png" },
};

const REWARD_ASSETS: RewardAsset[] = [
  { symbol: "AAPL", name: "Apple", icon: "/rwa/aapl.png", kind: "stock", network: "robinhood", amount: 1.842, currentValue: 615.23, lifetimeValue: 648.4, sourceProjects: 3, lastReceived: "18m ago" },
  { symbol: "NVDA", name: "NVIDIA", icon: "/rwa/nvda.png", kind: "stock", network: "robinhood", amount: 2.118, currentValue: 429.95, lifetimeValue: 461.72, sourceProjects: 4, lastReceived: "18m ago" },
  { symbol: "ETH", name: "Ethereum", icon: "/tokens/ethereum.png", kind: "native", network: "base", amount: 0.1684, currentValue: 293.02, lifetimeValue: 311.84, sourceProjects: 2, lastReceived: "3h ago" },
  { symbol: "SPY", name: "S&P 500 ETF", icon: "/rwa/spy.png", kind: "etf", network: "robinhood", amount: 0.232, currentValue: 172.61, lifetimeValue: 181.25, sourceProjects: 3, lastReceived: "18m ago" },
  { symbol: "USDC", name: "USD Coin", icon: "/tokens/usdc.png", kind: "stable", network: "base", amount: 108.42, currentValue: 108.42, lifetimeValue: 108.42, sourceProjects: 2, lastReceived: "3h ago" },
  { symbol: "TSLA", name: "Tesla", icon: "/rwa/tsla.png", kind: "stock", network: "robinhood", amount: 0.212, currentValue: 71.23, lifetimeValue: 77.68, sourceProjects: 2, lastReceived: "1d ago" },
  { symbol: "MSFT", name: "Microsoft", icon: "/rwa/msft.png", kind: "stock", network: "robinhood", amount: 0.14, currentValue: 58.24, lifetimeValue: 60.37, sourceProjects: 2, lastReceived: "1d ago" },
  { symbol: "AMZN", name: "Amazon", icon: "/rwa/amzn.png", kind: "stock", network: "robinhood", amount: 0.18, currentValue: 44.1, lifetimeValue: 47.25, sourceProjects: 1, lastReceived: "2d ago" },
  { symbol: "SOL", name: "Solana", icon: "/tokens/solana.png", kind: "native", network: "solana", amount: 0.21, currentValue: 31.5, lifetimeValue: 34.18, sourceProjects: 1, lastReceived: "2d ago" },
  { symbol: "QQQ", name: "Nasdaq-100 ETF", icon: "/rwa/qqq.png", kind: "etf", network: "robinhood", amount: 0.036, currentValue: 25.16, lifetimeValue: 26.4, sourceProjects: 1, lastReceived: "4d ago" },
  { symbol: "USDT", name: "Tether USD", icon: "/tokens/usdt.png", kind: "stable", network: "solana", amount: 17.6, currentValue: 17.6, lifetimeValue: 17.6, sourceProjects: 1, lastReceived: "2d ago" },
  { symbol: "COIN", name: "Coinbase", icon: "/rwa/coin.png", kind: "stock", network: "robinhood", amount: 0.042, currentValue: 17.22, lifetimeValue: 18.12, sourceProjects: 1, lastReceived: "4d ago" },
  { symbol: "GOOGL", name: "Alphabet", icon: "/rwa/googl.png", kind: "stock", network: "robinhood", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "META", name: "Meta", icon: "/rwa/meta.png", kind: "stock", network: "robinhood", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "AMD", name: "Advanced Micro Devices", icon: "/rwa/amd.png", kind: "stock", network: "robinhood", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "ORCL", name: "Oracle", icon: "/rwa/orcl.png", kind: "stock", network: "robinhood", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "PLTR", name: "Palantir", icon: "/rwa/pltr.png", kind: "stock", network: "robinhood", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "CRCL", name: "Circle", icon: "/rwa/crcl.png", kind: "stock", network: "robinhood", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "SGOV", name: "Treasury Bond ETF", icon: "/rwa/sgov.png", kind: "etf", network: "robinhood", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "BABA", name: "Alibaba", icon: "/rwa/baba.png", kind: "stock", network: "robinhood", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "BE", name: "Bloom Energy", icon: "/rwa/be.png", kind: "stock", network: "robinhood", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "CRWV", name: "CoreWeave", icon: "/rwa/crwv.png", kind: "stock", network: "robinhood", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "CUSO", name: "CUSO ETF", icon: "/rwa/cuso.png", kind: "etf", network: "robinhood", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "INTC", name: "Intel", icon: "/rwa/intc.png", kind: "stock", network: "robinhood", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "MU", name: "Micron Technology", icon: "/rwa/mu.png", kind: "stock", network: "robinhood", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "SLV", name: "Silver Trust ETF", icon: "/rwa/slv.png", kind: "etf", network: "robinhood", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "SNDK", name: "Sandisk", icon: "/rwa/sndk.png", kind: "stock", network: "robinhood", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "SPCX", name: "SpaceX", icon: "/rwa/spcx.png", kind: "stock", network: "robinhood", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "USAR", name: "USA Rare Earth", icon: "/rwa/usar.png", kind: "stock", network: "robinhood", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "BNB", name: "BNB", icon: "/tokens/bnb.png", kind: "native", network: "bsc", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "BTC", name: "Bitcoin", icon: "/tokens/bitcoin.png", kind: "token", network: "ethereum", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "WBTC", name: "Wrapped Bitcoin", icon: "/tokens/wbtc.png", kind: "token", network: "ethereum", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "LINK", name: "Chainlink", icon: "/tokens/link.png", kind: "token", network: "ethereum", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "SHIB", name: "Shiba Inu", icon: "/tokens/shib.png", kind: "token", network: "ethereum", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "PEPE", name: "Pepe", icon: "/tokens/pepe.png", kind: "token", network: "ethereum", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "BONK", name: "Bonk", icon: "/tokens/bonk.jpg", kind: "token", network: "solana", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "SIREN", name: "Siren", icon: "/tokens/siren.png", kind: "token", network: "solana", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "USD1", name: "World Liberty USD", icon: "/tokens/usd1.png", kind: "stable", network: "bsc", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "USDG", name: "Global Dollar", icon: "/tokens/usdg.png", kind: "stable", network: "ethereum", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "ASTER", name: "Aster", icon: "/tokens/aster.jpg", kind: "token", network: "bsc", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "HYPE", name: "Hyperliquid", icon: "/tokens/hype.jpg", kind: "token", network: "base", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "INDEX", name: "The Index", icon: "/tokens/index.jpg", kind: "token", network: "base", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "TOSHI", name: "Toshi", icon: "/tokens/toshi.jpg", kind: "token", network: "base", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "CASHCAT", name: "Cash Cat", icon: "/tokens/cashcat.png", kind: "token", network: "robinhood", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "ANSEM", name: "The Black Bull", icon: "/tokens/ansem.jpg", kind: "token", network: "base", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "BRIAN", name: "Brian", icon: "/tokens/brian.jpg", kind: "token", network: "base", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "JESSE", name: "Jesse", icon: "/tokens/jesse.jpg", kind: "token", network: "base", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
  { symbol: "REPE", name: "Repe", icon: "/tokens/repe.jpg", kind: "token", network: "base", amount: 0, currentValue: 0, lifetimeValue: 0, sourceProjects: 0 },
];

const REWARD_PROJECTS: RewardProject[] = [
  { id: "gradient", title: "Gradient", ticker: "GRAD", network: "base", accent: "#52dfb2", balance: 72350, bagValue: 612.4, walletShare: 0.14, minimumShare: 0.1, rewardsValue: 432.18, lastPaid: "3h ago", basketStatus: "active", basketAssets: [{ symbol: "ETH", icon: "/tokens/ethereum.png" }, { symbol: "USDC", icon: "/tokens/usdc.png" }] },
  { id: "cashcat", title: "Cashcat", ticker: "CASHCAT", network: "robinhood", accent: "#b6ff35", balance: 91020, bagValue: 388.2, walletShare: 0.09, minimumShare: 0.1, rewardsValue: 96.44, lastPaid: "4d ago", basketStatus: "last", basketAssets: [{ symbol: "AAPL", icon: "/rwa/aapl.png" }, { symbol: "NVDA", icon: "/rwa/nvda.png" }] },
  { id: "robin-index", title: "Robin Index", ticker: "RDX", network: "robinhood", accent: "#b6ff35", balance: 18420, bagValue: 243.14, walletShare: 0.18, minimumShare: 0.1, rewardsValue: 824.12, lastPaid: "18m ago", basketStatus: "active", basketAssets: [{ symbol: "AAPL", icon: "/rwa/aapl.png" }, { symbol: "NVDA", icon: "/rwa/nvda.png" }, { symbol: "SPY", icon: "/rwa/spy.png" }] },
  { id: "solstice", title: "Solstice", ticker: "SOLST", network: "solana", accent: "#3ee5d3", balance: 4250, bagValue: 206.5, walletShare: 0.32, minimumShare: 0.1, rewardsValue: 241.03, lastPaid: "2d ago", basketStatus: "active", basketAssets: [{ symbol: "SOL", icon: "/tokens/solana.png" }, { symbol: "USDT", icon: "/tokens/usdt.png" }] },
  { id: "based-builders", title: "Based Builders", ticker: "BUILD", network: "base", accent: "#4e7fff", balance: 12800, bagValue: 149.76, walletShare: 0.06, minimumShare: 0.05, rewardsValue: 188.84, lastPaid: "1d ago", basketStatus: "last", basketAssets: [{ symbol: "NVDA", icon: "/rwa/nvda.png" }, { symbol: "MSFT", icon: "/rwa/msft.png" }] },
];

const DISTRIBUTIONS: Distribution[] = [
  { id: "dist-1", projectId: "robin-index", project: "Robin Index", ticker: "RDX", route: "Combo Rewards", network: "robinhood", received: "18m ago", value: 158.44, tx: "0x57a8...91c2", assets: [
    { symbol: "AAPL", name: "Apple", icon: "/rwa/aapl.png", amount: 0.22, value: 73.48 },
    { symbol: "NVDA", name: "NVIDIA", icon: "/rwa/nvda.png", amount: 0.31, value: 62.93 },
    { symbol: "SPY", name: "S&P 500 ETF", icon: "/rwa/spy.png", amount: 0.0296, value: 22.03 },
  ] },
  { id: "dist-2", projectId: "gradient", project: "Gradient", ticker: "GRAD", route: "Rewards Basket", network: "base", received: "3h ago", value: 126.81, tx: "0x19cd...d841", assets: [
    { symbol: "ETH", name: "Ethereum", icon: "/tokens/ethereum.png", amount: 0.0513, value: 89.26 },
    { symbol: "USDC", name: "USD Coin", icon: "/tokens/usdc.png", amount: 37.55, value: 37.55 },
  ] },
  { id: "dist-3", projectId: "based-builders", project: "Based Builders", ticker: "BUILD", route: "Creator Community", network: "base", received: "1d ago", value: 91.25, tx: "0xb41e...21ac", assets: [
    { symbol: "NVDA", name: "NVIDIA", icon: "/rwa/nvda.png", amount: 0.24, value: 48.71 },
    { symbol: "MSFT", name: "Microsoft", icon: "/rwa/msft.png", amount: 0.102, value: 42.54 },
  ] },
  { id: "dist-4", projectId: "solstice", project: "Solstice", ticker: "SOLST", route: "Holder Rewards", network: "solana", received: "2d ago", value: 49.1, tx: "5fL8...K91s", assets: [
    { symbol: "SOL", name: "Solana", icon: "/tokens/solana.png", amount: 0.21, value: 31.5 },
    { symbol: "USDT", name: "Tether USD", icon: "/tokens/usdt.png", amount: 17.6, value: 17.6 },
  ] },
  { id: "dist-5", projectId: "robin-index", project: "Robin Index", ticker: "RDX", route: "Combo Rewards", network: "robinhood", received: "4d ago", value: 118.09, tx: "0x6ae4...12e9", assets: [
    { symbol: "QQQ", name: "Nasdaq-100 ETF", icon: "/rwa/qqq.png", amount: 0.036, value: 25.16 },
    { symbol: "COIN", name: "Coinbase", icon: "/rwa/coin.png", amount: 0.042, value: 17.22 },
    { symbol: "AAPL", name: "Apple", icon: "/rwa/aapl.png", amount: 0.141, value: 47.09 },
    { symbol: "AMZN", name: "Amazon", icon: "/rwa/amzn.png", amount: 0.117, value: 28.62 },
  ] },
];

const FILTERS: Array<{ key: AssetFilter; label: string }> = [
  { key: "received", label: "Received" },
  { key: "all", label: "All" },
  { key: "stock", label: "Stocks" },
  { key: "etf", label: "ETFs" },
  { key: "native", label: "Native" },
  { key: "stable", label: "Stables" },
  { key: "token", label: "Tokens" },
];

const NETWORK_OPTIONS: Array<{ value: "all" | NetworkKey; label: string; image?: string }> = [
  { value: "all", label: "All networks" },
  ...Object.entries(NETWORKS).map(([value, item]) => ({ value: value as NetworkKey, label: item.label, image: item.icon })),
];

const SORT_OPTIONS: Array<{ value: AssetSort; label: string; icon: LucideIcon }> = [
  { value: "value", label: "Current value", icon: DollarSign },
  { value: "earned", label: "Lifetime earned", icon: Trophy },
  { value: "name", label: "Asset name", icon: ArrowDownAZ },
];

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

function formatUsd(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: value >= 1000 ? 0 : 2, maximumFractionDigits: 2 });
}

function formatAmount(value: number) {
  if (value === 0) return "0";
  if (value >= 1000) return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (value >= 1) return value.toLocaleString("en-US", { maximumFractionDigits: 3 });
  return value.toLocaleString("en-US", { maximumFractionDigits: 5 });
}

function NetworkMark({ network }: { network: NetworkKey }) {
  const item = NETWORKS[network];
  return <Image unoptimized src={item.icon} alt={item.label} title={item.label} width={14} height={14} className="h-3.5 w-3.5 rounded-full object-contain" />;
}

function AppDropdown<T extends string>({
  value,
  options,
  onChange,
  triggerIcon: TriggerIcon,
  className,
}: {
  value: T;
  options: Array<{ value: T; label: string; image?: string; icon?: LucideIcon }>;
  onChange: (value: T) => void;
  triggerIcon: LucideIcon;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const active = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div ref={rootRef} className={cx("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cx(
          "flex h-10 w-full items-center gap-2 rounded-[10px] border bg-[#0b0e0d] px-3 text-left text-[10.5px] font-medium transition",
          open ? "border-[#18c98e]/32 text-white/88 shadow-[0_0_0_3px_rgba(24,201,142,0.045)]" : "border-white/[0.12] text-white/70 hover:border-white/[0.2] hover:text-white/86",
        )}
      >
        <TriggerIcon className={cx("h-3.5 w-3.5 shrink-0", open ? "text-[#70deb0]" : "text-white/42")} strokeWidth={1.8} />
        <span className="min-w-0 flex-1 truncate">{active.label}</span>
        <ChevronDown className={cx("h-3.5 w-3.5 shrink-0 text-white/38 transition-transform duration-200", open && "rotate-180 text-white/62")} />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: -5, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-[46px] z-40 min-w-full overflow-hidden rounded-[13px] border border-white/[0.12] bg-[#121514]/[0.985] p-1.5 shadow-[0_20px_55px_rgba(0,0,0,0.58)] backdrop-blur-xl"
          >
            {options.map((option) => {
              const OptionIcon = option.icon;
              const selected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cx(
                    "flex h-9 w-full items-center gap-2.5 rounded-[9px] px-2.5 text-left text-[10.5px] transition",
                    selected ? "bg-[#18c98e]/[0.09] text-white/90" : "text-white/58 hover:bg-white/[0.045] hover:text-white/82",
                  )}
                >
                  {option.image ? <Image unoptimized src={option.image} alt="" width={15} height={15} className="h-[15px] w-[15px] rounded-full object-contain" /> : OptionIcon ? <OptionIcon className={cx("h-3.5 w-3.5", selected ? "text-[#70deb0]" : "text-white/42")} strokeWidth={1.8} /> : <Network className={cx("h-3.5 w-3.5", selected ? "text-[#70deb0]" : "text-white/42")} strokeWidth={1.8} />}
                  <span className="whitespace-nowrap">{option.label}</span>
                  {selected ? <Check className="ml-auto h-3.5 w-3.5 text-[#18c98e]" strokeWidth={2} /> : null}
                </button>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function WalletImportButton({ asset, onImport }: { asset: RewardAsset; onImport: (asset: RewardAsset) => void }) {
  return (
    <button type="button" onClick={() => onImport(asset)} aria-label={`Import ${asset.symbol} to wallet`} className="group relative grid h-8 w-8 shrink-0 place-items-center text-white/48 transition hover:text-[#f0dc91]">
      <WalletCards className="h-4 w-4" strokeWidth={1.7} />
      <Plus className="absolute right-[2px] top-[2px] h-2 w-2 rounded-full bg-[#0d100f]" strokeWidth={2.2} />
    </button>
  );
}

function Eligibility({ project }: { project: RewardProject }) {
  const eligible = project.walletShare >= project.minimumShare;
  return (
    <span className="group relative inline-flex items-center gap-1.5">
      {eligible ? <CheckCircle2 className="h-4 w-4 text-[#18c98e]" /> : <span className="grid h-4 w-4 place-items-center text-[14px] leading-none text-white/48">×</span>}
      <span className={cx("font-mono text-[11px]", eligible ? "text-white/76" : "text-white/58")}>{project.walletShare.toFixed(2)}%</span>
      <span className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-20 w-[210px] -translate-x-1/2 rounded-[10px] border border-white/[0.14] bg-[#151918] px-3 py-2.5 text-[10px] font-normal leading-[1.55] text-white/76 opacity-0 shadow-[0_14px_38px_rgba(0,0,0,0.58)] transition-opacity group-hover:opacity-100">
        {eligible ? `Eligible. This wallet holds at least ${project.minimumShare}% of supply.` : `Not currently eligible. Hold at least ${project.minimumShare}% of supply.`}
      </span>
    </span>
  );
}

export default function ProfileRewardsDashboard() {
  const { pushToast } = useAppToast();
  const [filter, setFilter] = useState<AssetFilter>("received");
  const [network, setNetwork] = useState<"all" | NetworkKey>("all");
  const [sort, setSort] = useState<AssetSort>("value");
  const [query, setQuery] = useState("");
  const [expandedDistribution, setExpandedDistribution] = useState<string | null>(DISTRIBUTIONS[0]?.id ?? null);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const rewardAssetsRef = useRef<HTMLElement>(null);

  const earnedAssets = REWARD_ASSETS.filter((asset) => asset.amount > 0);
  const currentValue = earnedAssets.reduce((total, asset) => total + asset.currentValue, 0);
  const lifetimeValue = earnedAssets.reduce((total, asset) => total + asset.lifetimeValue, 0);
  const eligibleProjects = REWARD_PROJECTS.filter((project) => project.walletShare >= project.minimumShare).length;

  const filteredAssets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return REWARD_ASSETS
      .filter((asset) => filter === "received" ? asset.amount > 0 : filter === "all" || asset.kind === filter)
      .filter((asset) => network === "all" || asset.network === network)
      .filter((asset) => !normalizedQuery || asset.symbol.toLowerCase().includes(normalizedQuery) || asset.name.toLowerCase().includes(normalizedQuery))
      .sort((a, b) => {
        if (sort === "name") return a.symbol.localeCompare(b.symbol);
        if (sort === "earned") return b.lifetimeValue - a.lifetimeValue;
        return b.currentValue - a.currentValue;
      });
  }, [filter, network, query, sort]);

  const importAsset = (asset: RewardAsset) => {
    pushToast({ tone: "success", title: `${asset.symbol} sent to wallet`, message: `Approve the ${NETWORKS[asset.network].label} asset import in your wallet.` });
  };

  const importAll = () => {
    const importable = earnedAssets.filter((asset) => network === "all" || asset.network === network);
    pushToast({ tone: "success", title: `${importable.length} assets queued`, message: network === "all" ? "Wallet requests are grouped by network." : `Approve each ${NETWORKS[network].label} asset import in your wallet.` });
  };

  const focusReceivedAssets = () => {
    setFilter("received");
    setNetwork("all");
    setQuery("");
    window.requestAnimationFrame(() => rewardAssetsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };

  const visibleHistory = showAllHistory ? DISTRIBUTIONS : DISTRIBUTIONS.slice(0, 4);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[22px] border border-[#d7c57f]/28 bg-[linear-gradient(115deg,rgba(215,197,127,0.075),rgba(16,19,18,0.98)_34%,#101312)] shadow-[0_20px_55px_rgba(0,0,0,0.24),inset_0_1px_rgba(255,255,255,0.035)]">
        <header className="flex flex-col gap-5 border-b border-white/[0.10] px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.17em] text-[#ead68d]">Trades that keep paying</div>
            <h2 className="mt-2.5 text-[29px] font-semibold tracking-[-0.04em] text-white/96">Your rewards</h2>
            <p className="mt-2 text-[14px] font-light text-white/62">Every asset this wallet earned through Fee Builder.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button type="button" onClick={focusReceivedAssets} className="group flex h-11 items-center px-1 transition" aria-label={`View ${earnedAssets.length} received reward assets`}>
              <span className="flex items-center">
                {earnedAssets.slice(0, 9).map((asset, index) => (
                  <span key={`${asset.network}-${asset.symbol}`} className={cx("relative grid h-9 w-9 place-items-center rounded-full border-2 border-[#101312] bg-[#151918] shadow-[0_4px_12px_rgba(0,0,0,0.34)] transition-transform group-hover:-translate-y-0.5", index > 0 && "-ml-2.5")} style={{ zIndex: index + 1 }}>
                    <Image unoptimized src={asset.icon} alt={asset.symbol} width={24} height={24} className={cx("h-6 w-6 rounded-full object-contain", asset.symbol === "AAPL" && "invert")} />
                  </span>
                ))}
                {earnedAssets.length > 9 ? <span className="relative z-10 -ml-2.5 grid h-9 w-9 place-items-center rounded-full border-2 border-[#101312] bg-[#262317] font-mono text-[9.5px] font-semibold text-[#f0d77f] shadow-[0_4px_12px_rgba(0,0,0,0.34)] transition-transform group-hover:-translate-y-0.5">+{earnedAssets.length - 9}</span> : null}
              </span>
              <span className="ml-3 whitespace-nowrap text-[11.5px] font-medium text-white/56 transition-colors group-hover:text-[#ead68d]">{earnedAssets.length} received</span>
            </button>
            <button type="button" onClick={importAll} className="inline-flex h-9 w-fit items-center gap-1.5 rounded-[9px] border border-[#d7c57f]/22 bg-[#d7c57f]/[0.045] px-3 text-[10.5px] font-semibold text-[#ead68d] transition hover:border-[#f0dc91]/40 hover:bg-[#d7c57f]/[0.09] hover:text-[#f7e6a4]">
              <span className="relative grid h-5 w-5 place-items-center"><WalletCards className="h-3.5 w-3.5" /><Plus className="absolute right-0 top-0 h-2 w-2" /></span>
              Add all
            </button>
          </div>
        </header>
        <div className="grid divide-y divide-white/[0.10] sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
          {[
            { label: "Lifetime earned", value: formatUsd(lifetimeValue), detail: "Value when distributed", accent: true },
            { label: "Current reward value", value: formatUsd(currentValue), detail: `${earnedAssets.length} assets received` },
            { label: "Reward projects held", value: REWARD_PROJECTS.length.toString(), detail: `${eligibleProjects} eligible for rewards` },
            { label: "Last distribution", value: "18m ago", detail: "Robin Index · 3 assets" },
          ].map((metric, index) => (
            <div key={metric.label} className={cx("px-5 py-6 sm:px-7", index > 1 && "sm:border-t sm:border-white/[0.10] xl:border-t-0")}>
              <div className="text-[11px] font-semibold uppercase tracking-[0.11em] text-white/50">{metric.label}</div>
              <div className={cx("mt-3 font-mono text-[24px] font-semibold tracking-[-0.035em]", metric.accent ? "text-[#f0d77f]" : "text-white/92")}>{metric.value}</div>
              <div className="mt-2 text-[11.5px] font-light text-white/52">{metric.detail}</div>
            </div>
          ))}
        </div>
      </section>

      <section ref={rewardAssetsRef} className="scroll-mt-24 rounded-[22px] border border-white/[0.12] bg-[#101312] shadow-[inset_0_1px_rgba(255,255,255,0.025)]">
        <header className="flex flex-col gap-5 border-b border-white/[0.10] px-5 py-6 sm:px-7">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-2.5">
              <span className="grid h-11 w-11 place-items-center rounded-[12px] border border-[#d7c57f]/25 bg-[#d7c57f]/[0.055] text-[#ead68d]"><Gift className="h-5 w-5" /></span>
              <div><h3 className="text-[19px] font-semibold text-white/93">Reward assets</h3><p className="mt-1.5 text-[12.5px] text-white/56">Lifetime receipts remain visible after assets leave the wallet.</p></div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <AppDropdown value={network} options={NETWORK_OPTIONS} onChange={setNetwork} triggerIcon={Network} className="w-[154px]" />
              <AppDropdown value={sort} options={SORT_OPTIONS} onChange={setSort} triggerIcon={ArrowUpDown} className="w-[152px]" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <label className="mr-1 flex h-9 min-w-[230px] shrink-0 items-center gap-2 rounded-[9px] border border-white/[0.11] bg-[#0a0d0c] px-3">
              <Search className="h-3.5 w-3.5 text-white/42" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search reward assets" className="min-w-0 flex-1 bg-transparent text-[11px] text-white/82 outline-none placeholder:text-white/40" />
            </label>
            {FILTERS.map((item) => {
              const active = filter === item.key;
              const received = item.key === "received";

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  className={cx(
                    "h-9 shrink-0 rounded-[9px] border px-3.5 text-[11px] font-medium transition",
                    active && received && "border-[#d7c57f]/38 bg-[#d7c57f]/[0.105] text-[#f0d77f] shadow-[0_0_18px_rgba(215,197,127,0.08)]",
                    active && !received && "border-[#18c98e]/34 bg-[#18c98e]/[0.09] text-[#83e7bd]",
                    !active && received && "border-transparent text-[#d7c57f]/68 hover:bg-[#d7c57f]/[0.06] hover:text-[#f0d77f]",
                    !active && !received && "border-transparent text-white/48 hover:bg-white/[0.045] hover:text-white/76"
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </header>

        <div className="grid overflow-hidden sm:grid-cols-2 xl:grid-cols-3 min-[1780px]:grid-cols-4">
          <AnimatePresence initial={false}>
            {filteredAssets.map((asset) => (
              <motion.article key={`${asset.network}-${asset.symbol}`} layout initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.18 }} className="group min-w-0 border-b border-r border-white/[0.10] bg-[#101312] px-5 py-5 transition-colors hover:bg-[#141817]">
                <div className="flex items-start gap-3">
                  <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-[13px] border border-white/[0.13] bg-[#151918]">
                    <Image unoptimized src={asset.icon} alt="" width={30} height={30} className={cx("h-[30px] w-[30px] rounded-full object-contain", asset.symbol === "AAPL" && "invert")} />
                    <span className="absolute -bottom-1 -right-1 rounded-full border-2 border-[#101312] bg-[#090b0a]"><NetworkMark network={asset.network} /></span>
                  </span>
                  <div className="min-w-0 flex-1"><div className="flex items-baseline gap-1.5"><strong className="text-[14px] font-semibold text-white/92">{asset.symbol}</strong><span className="truncate text-[11px] text-white/56">{asset.name}</span></div><div className="mt-1.5 text-[10.5px] font-light text-white/50">{asset.sourceProjects ? `${asset.sourceProjects} source ${asset.sourceProjects === 1 ? "project" : "projects"}` : "Supported asset"}</div></div>
                  {asset.amount > 0 ? <WalletImportButton asset={asset} onImport={importAsset} /> : null}
                </div>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <div><div className={cx("font-mono text-[15px] font-semibold", asset.amount > 0 ? "text-[#f0d77f]" : "text-white/42")}>{formatAmount(asset.amount)} {asset.symbol}</div><div className="mt-1.5 font-mono text-[11.5px] text-white/56">{asset.currentValue ? formatUsd(asset.currentValue) : "No rewards yet"}</div></div>
                  {asset.lastReceived ? <span className="text-[10.5px] text-white/46">{asset.lastReceived}</span> : null}
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
        {!filteredAssets.length ? <div className="grid min-h-[150px] place-items-center px-4 text-center text-[12px] text-white/52">No reward assets match these filters.</div> : null}
      </section>

      <section className="rounded-[20px] border border-white/[0.12] bg-[#101312] shadow-[inset_0_1px_rgba(255,255,255,0.025)]">
        <header className="flex items-center justify-between gap-3 border-b border-white/[0.10] px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-[11px] border border-white/[0.12] bg-white/[0.025] text-white/58"><Layers3 className="h-4.5 w-4.5" /></span><div><h3 className="text-[17px] font-semibold text-white/91">Project holdings</h3><p className="mt-1 text-[11px] text-white/52">Fee Builder projects ordered by the current value of your project token bag.</p></div></div>
          <span className="hidden text-[9.5px] font-medium uppercase tracking-[0.1em] text-white/44 sm:block">Highest bag value first</span>
        </header>
        <div className="overflow-x-auto">
          <div className="min-w-[920px]">
            <div className="grid grid-cols-[minmax(180px,1.2fr)_minmax(145px,.9fr)_minmax(135px,.85fr)_105px_118px_100px] border-b border-white/[0.08] bg-black/[0.08] px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.1em] text-white/45 sm:px-6">
              <span>Project</span><span>Reward basket</span><span>Your bag</span><span>Wallet share</span><span>Lifetime rewards</span><span>Last paid</span>
            </div>
            {[...REWARD_PROJECTS].sort((a, b) => b.bagValue - a.bagValue).map((project) => (
              <Link key={project.id} href={`/token/${project.id}`} className="grid grid-cols-[minmax(180px,1.2fr)_minmax(145px,.9fr)_minmax(135px,.85fr)_105px_118px_100px] items-center border-b border-white/[0.075] px-5 py-4 transition hover:bg-white/[0.035] last:border-b-0 sm:px-6">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/[0.13] bg-[#151918] text-[10px] font-bold" style={{ color: project.accent }}>
                    {project.ticker.slice(0, 2)}
                    <span className="absolute -bottom-0.5 -right-0.5 grid h-[17px] w-[17px] place-items-center rounded-full border-2 border-[#101312] bg-[#090b0a]">
                      <NetworkMark network={project.network} />
                    </span>
                  </span>
                  <span className="min-w-0">
                    <strong className="block truncate text-[12.5px] font-semibold text-white/88">{project.title}</strong>
                    <span className="mt-1 block text-[9.5px] text-white/48">{project.ticker}</span>
                  </span>
                </span>
                <span className="flex min-w-0 items-center">
                  <span className="flex items-center">
                    {project.basketAssets.slice(0, 4).map((asset, index) => <span key={asset.symbol} title={asset.symbol} className={cx("grid h-7 w-7 place-items-center rounded-full border-2 border-[#101312] bg-[#151918]", index > 0 && "-ml-1.5")}><Image unoptimized src={asset.icon} alt={asset.symbol} width={19} height={19} className={cx("h-[19px] w-[19px] rounded-full object-contain", asset.symbol === "AAPL" && "invert")} /></span>)}
                  </span>
                  <span className="ml-2.5 min-w-0">
                    <span className={cx("block truncate text-[9.5px] font-medium", project.basketStatus === "active" ? "text-[#79deb4]" : "text-white/52")}>{project.basketStatus === "active" ? "Current basket" : "Last basket"}</span>
                    <span className="mt-0.5 block text-[8.5px] text-white/38">{project.basketAssets.length} assets</span>
                  </span>
                </span>
                <span><strong className="block font-mono text-[11.5px] font-semibold text-white/82">{project.balance.toLocaleString("en-US")} {project.ticker}</strong><span className="mt-1 block font-mono text-[9.5px] text-white/48">{formatUsd(project.bagValue)}</span></span>
                <Eligibility project={project} />
                <span className="font-mono text-[11.5px] font-semibold text-[#f0d77f]">{formatUsd(project.rewardsValue)}</span>
                <span className="flex items-center gap-1.5 text-[10px] text-white/52"><Clock3 className="h-3.5 w-3.5" />{project.lastPaid}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[20px] border border-white/[0.13] bg-[#101312] shadow-[0_16px_45px_rgba(0,0,0,0.18),inset_0_1px_rgba(255,255,255,0.03)]">
        <header className="flex items-center justify-between gap-3 border-b border-white/[0.11] px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-[11px] border border-[#18c98e]/22 bg-[#18c98e]/[0.045] text-[#70deb0]"><History className="h-4.5 w-4.5" /></span><div><h3 className="text-[17px] font-semibold text-white/93">Distribution history</h3><p className="mt-1 text-[11px] text-white/55">Every payout grouped by project and transaction.</p></div></div>
          <span className="rounded-full border border-white/[0.10] bg-white/[0.025] px-2.5 py-1 font-mono text-[10px] text-white/58">{DISTRIBUTIONS.length} payouts</span>
        </header>
        <div>
          {visibleHistory.map((distribution) => {
            const open = expandedDistribution === distribution.id;
            return (
              <div key={distribution.id} className="border-b border-white/[0.085] last:border-b-0">
                <button type="button" onClick={() => setExpandedDistribution(open ? null : distribution.id)} aria-expanded={open} className={cx("grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4.5 text-left transition sm:grid-cols-[minmax(210px,1fr)_minmax(140px,.65fr)_minmax(170px,.8fr)_110px_20px] sm:px-6", open ? "bg-white/[0.035]" : "hover:bg-white/[0.03]")}>
                  <span className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/[0.13] bg-[#151918] text-[10px] font-bold text-[#b6ff35]">{distribution.ticker.slice(0, 2)}</span><span className="min-w-0"><strong className="block truncate text-[12.5px] font-semibold text-white/90">{distribution.project}</strong><span className="mt-1 block truncate text-[9.5px] text-white/50">{distribution.route}</span></span></span>
                  <span className="hidden items-center sm:flex">
                    {distribution.assets.slice(0, 4).map((asset, index) => <span key={asset.symbol} className={cx("grid h-7 w-7 place-items-center rounded-full border-2 border-[#101312] bg-[#151918]", index > 0 && "-ml-1.5")}><Image unoptimized src={asset.icon} alt="" width={19} height={19} className={cx("h-[19px] w-[19px] rounded-full object-contain", asset.symbol === "AAPL" && "invert")} /></span>)}
                    <span className="ml-2.5 text-[9.5px] text-white/52">{distribution.assets.length} assets</span>
                  </span>
                  <span className="hidden sm:block"><strong className="font-mono text-[12.5px] font-semibold text-[#f0d77f]">{formatUsd(distribution.value)}</strong><span className="mt-1 flex items-center gap-1.5 text-[9.5px] text-white/52"><NetworkMark network={distribution.network} />{distribution.received}</span></span>
                  <span className="hidden items-center gap-1.5 text-[9px] font-mono text-white/48 sm:flex">{distribution.tx}<ExternalLink className="h-3.5 w-3.5" /></span>
                  <ChevronDown className={cx("h-4 w-4 text-white/52 transition-transform", open && "rotate-180 text-[#70deb0]")} />
                </button>
                <AnimatePresence initial={false}>
                  {open ? (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                      <div className="grid gap-px border-t border-white/[0.08] bg-white/[0.10] sm:grid-cols-2 lg:grid-cols-3">
                        {distribution.assets.map((asset) => (
                          <div key={asset.symbol} className="flex items-center gap-3 bg-[#0c0f0e] px-5 py-4 sm:px-6">
                            <Image unoptimized src={asset.icon} alt="" width={32} height={32} className={cx("h-8 w-8 rounded-full object-contain", asset.symbol === "AAPL" && "invert")} />
                            <div className="min-w-0 flex-1"><strong className="block text-[11.5px] font-semibold text-white/84">{asset.symbol}<span className="ml-1.5 font-normal text-white/52">{asset.name}</span></strong><span className="mt-1 block font-mono text-[10px] text-white/48">{formatUsd(asset.value)}</span></div>
                            <span className="font-mono text-[11px] font-semibold text-white/78">{formatAmount(asset.amount)} {asset.symbol}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
        {DISTRIBUTIONS.length > 4 ? <button type="button" onClick={() => setShowAllHistory((value) => !value)} className="flex h-12 w-full items-center justify-center gap-2 border-t border-white/[0.10] text-[10.5px] font-medium text-white/52 transition hover:bg-white/[0.025] hover:text-white/82">{showAllHistory ? "Show recent distributions" : "Show earlier distributions"}<ChevronDown className={cx("h-3.5 w-3.5 transition-transform", showAllHistory && "rotate-180")} /></button> : null}
      </section>
    </div>
  );
}
