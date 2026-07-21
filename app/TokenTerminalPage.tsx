"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowDownUp,
  ArrowLeft,
  ArrowUp,
  ArrowUpRight,
  Bold,
  CandlestickChart,
  Check,
  Code2,
  Copy,
  Crown,
  EyeOff,
  Italic,
  LineChart,
  Link2,
  List,
  Maximize2,
  Minimize2,
  Minus,
  Pencil,
  Pin,
  Plus,
  Quote,
  Reply,
  Smile,
  Star,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import type { LbpTokenDetail } from "./lbpTokenData";

type ChartMode = "candles" | "line";
type ChartBasis = "marketCap" | "price";
type TradeSide = "buy" | "sell";
type ActivityTab = "live" | "mine" | "comments" | "holders";
type TradeFilter = "all" | "buy" | "sell";
type SlippageMode = "auto" | "fixed-50" | "fixed-100" | "fixed-500" | "custom";

type Candle = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type TradeRow = {
  id?: string;
  age: string;
  side: TradeSide;
  price: number;
  usd: number;
  amount: number;
  nativeAmount?: number;
  trader: string;
};

type HolderRow = {
  address: string;
  balance: number;
  supply: number;
  rank?: number;
  creator?: boolean;
  own?: boolean;
};

type CommentNode = {
  id: string;
  user: string;
  age: string;
  body: string;
  votes: number;
  edited?: boolean;
  own?: boolean;
  replies?: CommentNode[];
};

const NETWORK_ICONS: Record<LbpTokenDetail["network"], string> = {
  base: "/networks/base.png",
  bsc: "/networks/bsc.png",
  eth: "/networks/ethereum.png",
  robinhood: "/networks/robinhood.png",
  sol: "/networks/sol.png",
};

const EXPLORERS: Record<LbpTokenDetail["network"], string> = {
  base: "https://basescan.org/token/",
  bsc: "https://bscscan.com/token/",
  eth: "https://etherscan.io/token/",
  robinhood: "https://robinhoodchain.blockscout.com/token/",
  sol: "https://solscan.io/token/",
};

const DEX_CONFIG: Record<LbpTokenDetail["network"], { name: string; version: string; color: string; icon?: string }> = {
  base: { name: "Uniswap", version: "v3", color: "#fc74fe", icon: "/dex/uniswap.svg" },
  bsc: { name: "PancakeSwap", version: "v3", color: "#d1884f", icon: "/dex/pancakeswap.svg" },
  eth: { name: "Uniswap", version: "v3", color: "#fc74fe", icon: "/dex/uniswap.svg" },
  robinhood: { name: "Uniswap", version: "v3", color: "#fc74fe", icon: "/dex/uniswap.svg" },
  sol: { name: "Raydium", version: "CLMM", color: "#8b5cf6" },
};

const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1d"] as const;
const SNAP_POINTS = [0, 25, 50, 75, 100] as const;
const SLIPPAGE_OPTIONS: Array<{ value: Exclude<SlippageMode, "custom">; label: string }> = [
  { value: "auto", label: "Auto" },
  { value: "fixed-50", label: "0.5%" },
  { value: "fixed-100", label: "1%" },
  { value: "fixed-500", label: "5%" },
];

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");
const shortAddress = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`;

const TERMINAL_CONTROL_CSS = `
.bb-size-slider::before,
.bb-size-fill {
  position: absolute;
  top: 11px;
  left: 7px;
  height: 3px;
  border-radius: 3px;
  content: "";
  pointer-events: none;
}
.bb-size-slider::before {
  right: 7px;
  background: #303835;
  box-shadow: inset 0 1px 1px rgba(0,0,0,0.34);
}
.bb-size-fill {
  width: calc((100% - 14px) * var(--size-ratio));
  background: linear-gradient(90deg, #2f9f58, #18c98e);
  box-shadow: 0 0 10px rgba(24,201,142,0.13);
}
.bb-size-halo {
  top: 12px;
  left: calc(7px + (100% - 14px) * var(--size-ratio));
  width: 20px;
  height: 20px;
  border: 1px solid rgba(24,201,142,0.15);
  border-radius: 50%;
  opacity: calc(0.25 + var(--size-ratio) * 0.55);
  transform: translate(-50%,-50%) scale(0.72);
  transition: transform 140ms ease, opacity 140ms ease;
}
.bb-size-control:hover .bb-size-halo,
.bb-size-control:focus-within .bb-size-halo { transform: translate(-50%,-50%) scale(1); }
.bb-size-range::-webkit-slider-runnable-track { height: 3px; border-radius: 3px; background: transparent; }
.bb-size-range::-webkit-slider-thumb {
  box-sizing: border-box;
  width: 14px;
  height: 14px;
  margin-top: -5.5px;
  appearance: none;
  border: 1px solid rgba(122,235,157,0.9);
  border-radius: 50%;
  background: radial-gradient(circle,#c7ffd8 0 2px,#142319 2.5px 5px,#18c98e 5.5px 7px);
  box-shadow: 0 3px 9px rgba(0,0,0,0.42),0 0 12px rgba(24,201,142,0.12);
  transition: transform 130ms ease,box-shadow 130ms ease;
}
.bb-size-range::-moz-range-track { height: 3px; border: 0; border-radius: 3px; background: transparent; }
.bb-size-range::-moz-range-thumb {
  box-sizing: border-box;
  width: 14px;
  height: 14px;
  border: 1px solid rgba(122,235,157,0.9);
  border-radius: 50%;
  background: radial-gradient(circle,#c7ffd8 0 2px,#142319 2.5px 5px,#18c98e 5.5px 7px);
  box-shadow: 0 3px 9px rgba(0,0,0,0.42),0 0 12px rgba(24,201,142,0.12);
}
.bb-size-range:hover::-webkit-slider-thumb { transform: scale(1.1); }
.bb-size-range:active::-webkit-slider-thumb { transform: scale(0.94); box-shadow: 0 0 0 5px rgba(24,201,142,0.13),0 2px 6px rgba(0,0,0,0.46); }
.bb-size-range:focus-visible { outline: 0; }
.bb-swap-flip-motion { transition: transform 240ms cubic-bezier(0.2,0.8,0.2,1); }
.bb-swap-flip:hover .bb-swap-flip-motion { transform: rotate(180deg); }
.bb-ticket-surface {
  background: #0f1111;
}
.bb-chart-surface {
  background: linear-gradient(180deg,#0e1110 0%,#0b0d0c 100%);
}
.bb-trade-total {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  font-weight: 520;
}
.bb-trade-total::before {
  position: absolute;
  z-index: 0;
  top: 0;
  right: 0;
  bottom: -1px;
  width: var(--trade-fill, 0%);
  background: linear-gradient(90deg, rgba(var(--trade-rgb),0) 0%, rgba(var(--trade-rgb),0.07) 32%, rgba(var(--trade-rgb),0.14) 66%, rgba(var(--trade-rgb),0.19) 100%);
  content: "";
  pointer-events: none;
}
.bb-trades-row:nth-child(odd) {
  background: rgba(255,255,255,0.012);
}
.bb-trades-row:hover {
  background: rgba(255,255,255,0.018);
}
.bb-trade-arrival-pulse {
  position: absolute;
  z-index: 12;
  top: 32px;
  right: 0;
  left: 0;
  height: 36px;
  pointer-events: none;
  border-left: 2px solid transparent;
  animation: bbTradeArrivalPulse 1.36s linear both;
}
.bb-trade-arrival-pulse[data-side="buy"] {
  border-left-color: #18c98e;
  background: linear-gradient(90deg,rgba(24,201,142,0.12),rgba(24,201,142,0.043) 48%,transparent 88%);
  box-shadow: inset 5px 0 12px -10px rgba(24,201,142,0.72),-2px 0 10px -5px rgba(24,201,142,0.56);
}
.bb-trade-arrival-pulse[data-side="sell"] {
  border-left-color: #ff3771;
  background: linear-gradient(90deg,rgba(255,55,113,0.114),rgba(255,55,113,0.043) 48%,transparent 88%);
  box-shadow: inset 5px 0 12px -10px rgba(255,55,113,0.72),-2px 0 10px -5px rgba(255,55,113,0.52);
}
@keyframes bbTradeArrivalPulse {
  0% { opacity: 0; }
  16% { opacity: 0.88; }
  36% { opacity: 0.61; }
  61% { opacity: 0.32; }
  82% { opacity: 0.12; }
  100% { opacity: 0; }
}
`;

function inputAmount(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "";
  return value.toLocaleString("en-US", { useGrouping: false, maximumFractionDigits: 8 });
}

function snapSizePercent(value: number) {
  const bounded = Math.min(100, Math.max(0, value));
  const closest = SNAP_POINTS.reduce((current, preset) => Math.abs(preset - bounded) < Math.abs(current - bounded) ? preset : current);
  return Math.abs(closest - bounded) <= 2 ? closest : bounded;
}

function sizePercentLabel(value: number) {
  if (value >= 99.95) return "100%";
  if (value <= 0) return "0%";
  return `${value.toFixed(value < 10 ? 1 : 0)}%`;
}

function formatUsd(value: number) {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(value >= 10_000_000 ? 1 : 2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(value >= 100_000 ? 0 : 1)}K`;
  return `$${value.toFixed(value < 10 ? 2 : 0)}`;
}

function formatQuoteUsd(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPrice(value: number) {
  if (value === 0) return "$0";
  if (value >= 1) return `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  if (value >= 0.01) return `$${value.toFixed(4)}`;
  return `$${value.toFixed(6)}`;
}

function seeded(seed: number, index: number) {
  const value = Math.sin(seed * 91.17 + index * 18.73) * 43758.5453;
  return value - Math.floor(value);
}

function createCandles(token: LbpTokenDetail, count = 78): Candle[] {
  if (token.upcoming) {
    return Array.from({ length: count }, (_, index) => {
      const movement = 1 + (seeded(token.seed, index) - 0.5) * 0.003;
      return { open: token.price, high: token.price * movement, low: token.price / movement, close: token.price, volume: 0 };
    });
  }

  const start = token.price / Math.max(1.015, 1 + token.change24h / 100);
  const candles: Candle[] = [];
  let previous = start;
  for (let index = 0; index < count; index += 1) {
    const progress = index / (count - 1);
    const trend = start + (token.price - start) * progress;
    const wave = Math.sin(progress * 13.4 + token.seed) * token.price * 0.012;
    const noise = (seeded(token.seed, index) - 0.5) * token.price * 0.018;
    const close = index === count - 1 ? token.price : Math.max(token.price * 0.08, trend + wave + noise);
    const open = previous;
    const wick = token.price * (0.006 + seeded(token.seed + 4, index) * 0.014);
    candles.push({
      open,
      close,
      high: Math.max(open, close) + wick,
      low: Math.max(token.price * 0.02, Math.min(open, close) - wick * 0.82),
      volume: 0.22 + seeded(token.seed + 9, index) * 0.78,
    });
    previous = close;
  }
  return candles;
}

function createTrades(token: LbpTokenDetail): TradeRow[] {
  if (token.upcoming) return [];
  const ages = ["now", "6s", "11s", "19s", "31s", "44s", "1m", "1m", "2m", "3m", "4m", "5m"];
  return ages.map((age, index) => {
    const side: TradeSide = seeded(token.seed + 2, index) > 0.44 ? "buy" : "sell";
    const price = token.price * (1 + (seeded(token.seed + 7, index) - 0.5) * 0.013);
    const usd = 180 + seeded(token.seed + 12, index) * 5800;
    const addressTail = Math.floor(seeded(token.seed + 22, index) * 0xffff).toString(16).padStart(4, "0");
    return { age, side, price, usd, amount: usd / Math.max(price, 0.000001), trader: `0x${Math.floor(seeded(token.seed + 16, index) * 0xffff).toString(16).padStart(4, "0")}…${addressTail}` };
  });
}

function createTradeHistory(token: LbpTokenDetail, count = 72, start = 0): TradeRow[] {
  const base = createTrades(token);
  if (!base.length) return [];
  return Array.from({ length: count }, (_, offset) => {
    const index = start + offset;
    const source = base[index % base.length];
    const price = source.price * (1 + (seeded(token.seed + 71, index) - 0.5) * 0.009);
    const usd = Math.max(90, source.usd * (0.62 + seeded(token.seed + 83, index) * 0.76));
    const age = index < 12 ? source.age : `${Math.max(1, index - 9)}m`;
    return { ...source, id: `history-${index}`, age, price, usd, nativeAmount: usd / initialQuoteUsd(token.quoteSymbol) };
  });
}

function createHolders(token: LbpTokenDetail): HolderRow[] {
  if (token.holders <= 0) return [];
  const supply = token.price > 0 ? token.marketCap / token.price : 100_000_000;
  const shares = [9.83, 4.99, 4.99, 4.99, 4.99, 4.99, 4.99, 4.99, 4.06, 3.82, 2.5, 2.27];
  const ownBalance = 18_420;
  const wallet: HolderRow = { address: "0xA17C9e42B6D8f3057C24aE91B5d7630F8C2e4A69", balance: ownBalance, supply: (ownBalance / supply) * 100, own: true };
  const leaderboard: HolderRow[] = Array.from({ length: Math.max(0, token.holders - 1) }, (_, index) => {
    const share = shares[index] ?? Math.max(0.002, 2.08 / (1 + (index - shares.length + 1) * 0.19) + seeded(token.seed + 91, index) * 0.025);
    const address = `0x${Array.from({ length: 40 }, (_, digit) => Math.floor(seeded(token.seed + index * 31, digit + 71) * 16).toString(16)).join("")}`;
    return { address, balance: supply * (share / 100), supply: share, creator: index === 0 };
  });
  const ranks = new Map<string, number>(
    [wallet, ...leaderboard]
      .sort((left, right) => right.balance - left.balance)
      .map((holder, index) => [holder.address, index + 1] as const),
  );
  return [{ ...wallet, rank: ranks.get(wallet.address) }, ...leaderboard.map((holder) => ({ ...holder, rank: ranks.get(holder.address) }))];
}

function createComments(token: LbpTokenDetail): CommentNode[] {
  const comments: CommentNode[] = [
    {
      id: "launch-note",
      user: token.creator,
      age: "6d",
      body: `${token.title} is built around a transparent LBP with live pricing and an onchain graduation target. Follow the market here as liquidity forms.`,
      votes: 12,
    },
    { id: "conviction", user: "0x71A4f9", age: "4d", body: "Strong launch structure. Watching the target from here.", votes: 8 },
    { id: "builders", user: "0x901051aa", age: "4d", body: "the builders keep building", votes: 6, edited: true },
    { id: "liquidity", user: "0xMorp", age: "3d", body: "Clean pool mechanics and a fair entry window.", votes: 5 },
    {
      id: "community",
      user: "0x464acE79",
      age: "2d",
      body: "The community is getting stronger every day.",
      votes: 7,
      replies: [
        { id: "community-reply", user: "0xA17C9e42", age: "1d", body: "Here for it.", votes: 3, own: true },
      ],
    },
  ];
  if (token.comments > 6) comments.push(...createMoreComments(token, comments.length, token.comments - 6));
  return comments;
}

function createMoreComments(token: LbpTokenDetail, start: number, count = 10): CommentNode[] {
  const messages = [
    "Watching the curve build from here.",
    "The distribution looks clean so far.",
    "Good liquidity forming around this level.",
    "This is the kind of launch data I want to see.",
    "Keeping an eye on the target and holder growth.",
    "The market is finding its range nicely.",
  ];
  return Array.from({ length: count }, (_, offset) => {
    const index = start + offset;
    const suffix = Math.floor(seeded(token.seed + 109, index) * 0xffffffff).toString(16).padStart(8, "0");
    const replies = index % 5 === 0 ? [{ id: `generated-reply-${index}`, user: `0x${suffix.slice(2, 8)}`, age: `${(index % 9) + 1}h`, body: "Agreed. The live data makes it easy to follow.", votes: 2 + (index % 6) }] : undefined;
    return { id: `generated-${index}`, user: `0x${suffix}`, age: `${(index % 6) + 1}d`, body: messages[index % messages.length], votes: 1 + (index % 11), replies };
  });
}

function countComments(comments: CommentNode[]): number {
  return comments.reduce((total, comment) => total + 1 + countComments(comment.replies ?? []), 0);
}

function initialQuoteUsd(symbol: string) {
  if (symbol === "ETH") return 3724.18;
  if (symbol === "BNB") return 621.42;
  if (symbol === "SOL") return 168.36;
  return 1;
}

function NetworkMark({ token, className = "h-4 w-4" }: { token: LbpTokenDetail; className?: string }) {
  return <Image unoptimized src={NETWORK_ICONS[token.network]} alt="" width={20} height={20} className={cx("shrink-0 rounded-full object-cover", className)} />;
}

function TokenMark({ token, size = "h-10 w-10" }: { token: LbpTokenDetail; size?: string }) {
  return (
    <span className={cx("relative grid shrink-0 place-items-center rounded-full border border-white/12 bg-[#111514] text-[12px] font-bold", size)} style={{ color: token.accent, boxShadow: `inset 0 0 20px color-mix(in srgb, ${token.accent} 10%, transparent)` }}>
      {token.ticker.slice(0, 2)}
      <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-[#090a0a] p-[1px]"><NetworkMark token={token} className="h-3.5 w-3.5" /></span>
    </span>
  );
}

function QuoteMark({ symbol }: { symbol: string }) {
  const color = symbol === "ETH" ? "#9aa8dc" : symbol === "BNB" ? "#f3ba2f" : symbol === "SOL" ? "#43e7c4" : "#8b91ae";
  return <span className="grid h-[25px] w-[25px] shrink-0 place-items-center rounded-full border border-white/20 bg-[#181c22] text-[8px] font-semibold" style={{ color }}>{symbol.slice(0, 1)}</span>;
}

function CopyAddress({ value }: { value: string }) {
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };
  return (
    <button type="button" onClick={() => void copy()} aria-label="Copy token address" className="grid h-6 w-6 cursor-pointer place-items-center text-white/28 transition hover:text-[#18c98e]">
      {copied ? <Check className="h-3 w-3 text-[#18c98e]" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

function Metric({ label, value, accent = false, className }: { label: string; value: string; accent?: boolean; className?: string }) {
  return (
    <div className={cx("flex min-w-[104px] flex-1 flex-col justify-center border-l border-[#1d2220] px-[18px] first:border-l-0 max-[1400px]:min-w-[90px] max-[1400px]:px-3", className)}>
      <dt className={cx("text-[9.5px] font-bold uppercase tracking-[0.105em] text-[#73807a]", accent ? "whitespace-normal leading-[1.05] max-[1400px]:text-[7.5px] max-[1400px]:tracking-[0.035em]" : "truncate")}>{label}</dt>
      <dd className={cx("mt-[5px] truncate font-mono text-[12.5px] font-semibold tracking-[-0.018em] tabular-nums", accent ? "text-[#52dfb2]" : "text-[#edf2f0]")}>{value}</dd>
    </div>
  );
}

function InstrumentHeader({ token }: { token: LbpTokenDetail }) {
  const progress = Math.min(100, token.target ? (token.marketCap / token.target) * 100 : 0);
  const dex = DEX_CONFIG[token.network];
  return (
    <section className="shrink-0 bg-[#0f1111]">
      <div className="flex min-h-[76px] min-w-0 items-stretch">
        <div className="flex min-w-[250px] items-center gap-3 px-4 max-[1400px]:min-w-[210px] max-[1400px]:gap-2 max-[1400px]:px-3">
          <Link href="/" aria-label="Back to tokens" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white/38 transition hover:bg-white/[0.045] hover:text-white/78"><ArrowLeft className="h-4 w-4" /></Link>
          <TokenMark token={token} />
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <h1 className="truncate text-[16px] font-semibold tracking-[-0.025em] text-[#f1f5f3]">{token.ticker}</h1>
              <span className="text-[15px] font-medium text-[#a6b0ac]">/ {token.quoteSymbol}</span>
            </div>
            <div className="mt-1 truncate text-[11.5px] font-medium text-[#77827d]">{token.title}</div>
          </div>
          <button type="button" aria-label="Add to watchlist" className="ml-auto grid h-7 w-7 shrink-0 place-items-center text-white/25 transition hover:text-[#dfb858]"><Star className="h-3.5 w-3.5" /></button>
        </div>

        <div className="flex min-w-[150px] flex-col justify-center border-l border-[#222826] px-5 max-[1400px]:min-w-[130px] max-[1400px]:px-3">
          <strong className="font-mono text-[20px] font-semibold tracking-[-0.04em] text-[#edf2ef]">{formatPrice(token.price)}</strong>
          <span className={cx("mt-[3px] font-mono text-[11.5px] font-semibold", token.change24h >= 0 ? "text-[#18c98e]" : "text-[#ff3771]")}>{token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(2)}% <i className="font-mono text-[9.5px] not-italic uppercase tracking-[0.05em] text-[#626d68]">24H</i></span>
        </div>

        <dl className="flex min-w-0 flex-1 overflow-hidden border-l border-[#222826]">
          <Metric label="24h volume" value={formatUsd(token.volume24h)} />
          <Metric label="Raised" value={formatUsd(token.raised)} className="max-[1400px]:hidden" />
          <Metric label="Market cap" value={formatUsd(token.marketCap)} />
          <Metric label="Target market cap" value={formatUsd(token.target)} accent />
        </dl>
      </div>

      <div className="flex min-h-[36px] items-center gap-7 bg-[#151918] px-3 text-[9.5px] text-[#aeb8b4] max-[1400px]:gap-5">
        <div className="flex items-center gap-2"><span className="uppercase tracking-[0.1em] text-[#515b57]">Network</span><NetworkMark token={token} className="h-3.5 w-3.5" /><strong className="font-medium text-[#aeb8b4] max-[1400px]:hidden">{token.networkLabel}</strong></div>
        <div className="flex items-center gap-2"><span className="uppercase tracking-[0.1em] text-[#515b57]">DEX</span><span className="hidden" aria-hidden="true">◆</span>{dex.icon ? <Image unoptimized src={dex.icon} alt="" width={16} height={16} className="h-4 w-4 shrink-0 object-contain" /> : null}<strong className="-ml-1 font-medium text-[#aeb8b4]">{dex.name}</strong><span className="font-mono text-[#66716c]">{dex.version}</span><span className="font-mono text-[#78847e]">{token.poolFee.toFixed(2)}%</span></div>
        <div className="flex items-center gap-2"><span className="uppercase tracking-[0.1em] text-[#515b57]">Contract</span><a href={`${EXPLORERS[token.network]}${token.contract}`} target="_blank" rel="noreferrer" className="font-mono text-[#aeb8b4] transition hover:text-white/88">{shortAddress(token.contract)}</a><CopyAddress value={token.contract} /></div>
        <div className="hidden items-center gap-2 min-[1500px]:flex"><span className="uppercase tracking-[0.1em] text-[#515b57]">Created by</span><Link href={`/u/${token.creator}`} className="font-medium text-[#aeb8b4] hover:text-white/90">{token.creator}</Link><span className="text-[#515b57]">on</span><a href={`/?board=${token.board}`} className="font-medium text-[#aeb8b4] hover:text-white/90">b/{token.board}</a></div>
        <div className="ml-auto flex min-w-[220px] items-center gap-3 max-[1400px]:min-w-[150px] max-[1400px]:gap-2">
          <div className="h-[3px] min-w-[90px] flex-1 overflow-hidden rounded-full bg-white/[0.08]"><span className="block h-full rounded-full bg-[#18c98e] shadow-[0_0_10px_rgba(24,201,142,0.3)]" style={{ width: `${progress}%` }} /></div>
          <strong className="w-10 font-mono text-[10px] text-[#18c98e]">{progress.toFixed(0)}%</strong>
        </div>
      </div>
    </section>
  );
}

function PriceChart({ token, focusHidden = false }: { token: LbpTokenDetail; focusHidden?: boolean }) {
  const [timeframe, setTimeframe] = React.useState<(typeof TIMEFRAMES)[number]>("15m");
  const [mode, setMode] = React.useState<ChartMode>("candles");
  const [basis, setBasis] = React.useState<ChartBasis>("marketCap");
  const [visibleCount, setVisibleCount] = React.useState(78);
  const [fullscreen, setFullscreen] = React.useState(false);
  const [creatorTradesVisible, setCreatorTradesVisible] = React.useState(true);
  const allCandles = React.useMemo(() => createCandles(token), [token]);
  const candles = allCandles.slice(-visibleCount);
  const supply = token.marketCap > 0 ? token.marketCap / token.price : 100_000_000;
  const factor = basis === "marketCap" ? supply : 1;
  const width = 1000;
  const height = 356;
  const left = 16;
  const right = 926;
  const top = 34;
  const bottom = 302;
  const values = candles.flatMap((candle) => [candle.high * factor, candle.low * factor]);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const padding = Math.max((rawMax - rawMin) * 0.16, rawMax * 0.008);
  const min = rawMin - padding;
  const max = rawMax + padding;
  const x = (index: number) => left + (index / Math.max(candles.length - 1, 1)) * (right - left);
  const y = (value: number) => top + ((max - value) / Math.max(max - min, 0.0000001)) * (bottom - top);
  const candleWidth = Math.max(2.4, Math.min(7.5, (right - left) / candles.length * 0.48));
  const closePath = candles.map((candle, index) => `${index ? "L" : "M"}${x(index).toFixed(1)} ${y(candle.close * factor).toFixed(1)}`).join(" ");
  const areaPath = `${closePath} L${right} ${bottom} L${left} ${bottom} Z`;
  const formatAxis = (value: number) => basis === "marketCap" ? formatUsd(value) : formatPrice(value);
  const latestCandle = candles[candles.length - 1];
  const creatorTrades: Array<{ index: number; side: TradeSide }> = [
    { index: Math.max(4, Math.floor(candles.length * 0.3)), side: "buy" },
    { index: Math.max(8, Math.floor(candles.length * 0.68)), side: "sell" },
  ];

  return (
    <section
      className={cx("relative flex basis-0 flex-col overflow-hidden bg-[#0d100f] transition-[flex-grow,min-height,opacity] duration-[360ms] ease-[cubic-bezier(0.22,1,0.36,1)]", focusHidden && "pointer-events-none opacity-0", fullscreen && "fixed inset-0 z-[300] min-h-0 opacity-100")}
      style={fullscreen ? undefined : { flexGrow: focusHidden ? 0 : 1, minHeight: focusHidden ? 0 : 150 }}
      aria-label={`${token.ticker} price chart`}
      aria-hidden={focusHidden || undefined}
    >
      <div className="flex h-[40px] shrink-0 items-center border-b border-white/[0.07] px-3">
        <div className="flex items-center gap-0.5">
          {TIMEFRAMES.map((item) => <button key={item} type="button" onClick={() => setTimeframe(item)} className={cx("h-7 min-w-8 cursor-pointer rounded px-2 text-[9.5px] transition", item === timeframe ? "bg-[#18c98e]/10 text-[#69e492]" : "text-white/40 hover:bg-white/[0.04] hover:text-white/72")}>{item}</button>)}
        </div>
        <span className="mx-2 h-4 w-px bg-white/[0.07]" />
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setMode("candles")} aria-label="Candlestick chart" className={cx("grid h-7 w-7 place-items-center rounded transition", mode === "candles" ? "bg-white/[0.07] text-white/80" : "text-white/35 hover:text-white/70")}><CandlestickChart className="h-3.5 w-3.5" /></button>
          <button type="button" onClick={() => setMode("line")} aria-label="Line chart" className={cx("grid h-7 w-7 place-items-center rounded transition", mode === "line" ? "bg-white/[0.07] text-white/80" : "text-white/35 hover:text-white/70")}><LineChart className="h-3.5 w-3.5" /></button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={() => setCreatorTradesVisible((current) => !current)} aria-pressed={creatorTradesVisible} className={cx("inline-flex h-7 items-center gap-1.5 rounded-md border px-2 text-[9px] font-semibold transition", creatorTradesVisible ? "border-[#d8b75f]/45 bg-[#d8b75f]/[0.07] text-[#ecd78f]" : "border-white/[0.07] text-white/34 hover:text-white/64")}><Crown className="h-3 w-3" /><span>Creator</span><span className="ml-0.5 flex items-center gap-0.5" aria-label="Creator buys and sells"><i className="h-1 w-1 rounded-full bg-[#18c98e]" /><i className="h-1 w-1 rounded-full bg-[#ff3771]" /></span></button>
          <div className="flex rounded-full bg-white/[0.035] p-0.5 ring-1 ring-white/[0.07]">
            <button type="button" onClick={() => setBasis("marketCap")} className={cx("h-6 rounded-full px-2.5 text-[9.5px] transition", basis === "marketCap" ? "bg-white/[0.09] text-white/82" : "text-white/38")}>Market cap</button>
            <button type="button" onClick={() => setBasis("price")} className={cx("h-6 rounded-full px-2.5 text-[9.5px] transition", basis === "price" ? "bg-white/[0.09] text-white/82" : "text-white/38")}>Price</button>
          </div>
          <div className="flex items-center rounded-md border border-white/[0.07] bg-[#0b0d0c]">
            <button type="button" onClick={() => setVisibleCount((value) => Math.min(78, value + 9))} aria-label="Zoom out" className="grid h-7 w-7 place-items-center text-white/34 transition hover:text-white/72"><Minus className="h-3 w-3" /></button>
            <button type="button" onClick={() => setVisibleCount((value) => Math.max(42, value - 9))} aria-label="Zoom in" className="grid h-7 w-7 place-items-center text-white/34 transition hover:text-white/72"><Plus className="h-3 w-3" /></button>
            <button type="button" onClick={() => setFullscreen((value) => !value)} aria-label={fullscreen ? "Exit full screen" : "Expand chart"} className="grid h-7 w-7 place-items-center text-white/34 transition hover:text-white/72">{fullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}</button>
          </div>
        </div>
      </div>

      <div className="bb-chart-surface relative min-h-[320px] flex-1">
        <div className="pointer-events-none absolute left-4 top-2 z-10 flex items-center gap-2 font-mono text-[9.5px] text-white/46"><strong className="font-sans text-white/82">{token.ticker}</strong><span>·</span><span>{timeframe}</span><span>{basis === "marketCap" ? "Market cap" : "Price"}</span><span>O {formatAxis(candles[0].open * factor)}</span><span>H {formatAxis(Math.max(...candles.map((c) => c.high * factor)))}</span><span>L {formatAxis(Math.min(...candles.map((c) => c.low * factor)))}</span><span>C {formatAxis(latestCandle.close * factor)}</span></div>
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" role="img" aria-label={`${basis === "marketCap" ? "Market cap" : "Price"} ${timeframe} chart for ${token.ticker}`}>
          <defs>
            <linearGradient id={`terminal-fill-${token.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={token.accent} stopOpacity="0.2" /><stop offset="1" stopColor={token.accent} stopOpacity="0" /></linearGradient>
            <filter id={`terminal-glow-${token.id}`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" /></filter>
          </defs>
          {Array.from({ length: 6 }, (_, index) => {
            const gy = top + (index / 5) * (bottom - top);
            const value = max - (index / 5) * (max - min);
            return <g key={`h-${index}`}><line x1={left} x2={right} y1={gy} y2={gy} stroke="rgba(255,255,255,0.075)" strokeWidth="1" /><text x={940} y={gy + 3} fill="rgba(255,255,255,0.36)" fontSize="9" fontFamily="monospace">{formatAxis(value)}</text></g>;
          })}
          {Array.from({ length: 5 }, (_, index) => {
            const gx = left + (index / 4) * (right - left);
            return <g key={`v-${index}`}><line x1={gx} x2={gx} y1={top} y2={bottom} stroke="rgba(255,255,255,0.06)" strokeWidth="1" /><text x={gx} y={342} textAnchor={index === 0 ? "start" : index === 4 ? "end" : "middle"} fill="rgba(255,255,255,0.36)" fontSize="9" fontFamily="monospace">{["10:00", "11:15", "12:30", "13:45", "15:00"][index]}</text></g>;
          })}
          {mode === "line" ? <><path d={areaPath} fill={`url(#terminal-fill-${token.id})`} /><path d={closePath} fill="none" stroke={token.accent} strokeWidth="2" vectorEffect="non-scaling-stroke" /></> : candles.map((candle, index) => {
            const up = candle.close >= candle.open;
            const color = up ? "#18c98e" : "#ff3771";
            const cxValue = x(index);
            const bodyTop = y(Math.max(candle.open, candle.close) * factor);
            const bodyBottom = y(Math.min(candle.open, candle.close) * factor);
            return <g key={index}><line x1={cxValue} x2={cxValue} y1={y(candle.high * factor)} y2={y(candle.low * factor)} stroke={color} strokeWidth="1" vectorEffect="non-scaling-stroke" /><rect x={cxValue - candleWidth / 2} y={bodyTop} width={candleWidth} height={Math.max(1.5, bodyBottom - bodyTop)} fill={color} /></g>;
          })}
          {creatorTradesVisible ? creatorTrades.map((trade) => {
            const candle = candles[Math.min(trade.index, candles.length - 1)];
            const markerX = x(Math.min(trade.index, candles.length - 1));
            const markerY = Math.max(top + 13, y(candle.high * factor) - 20);
            const sideColor = trade.side === "buy" ? "#18c98e" : "#ff3771";
            return <g key={`creator-${trade.index}`}><line x1={markerX} x2={markerX} y1={markerY + 9} y2={y(candle.high * factor) - 2} stroke="#d8b75f" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" /><circle cx={markerX} cy={markerY} r="9" fill="#111513" stroke="#d8b75f" strokeWidth="1.2" /><text x={markerX} y={markerY + 3.6} textAnchor="middle" fill="#ecd78f" fontSize="10">♛</text><circle cx={markerX + 7} cy={markerY + 7} r="2.7" fill={sideColor} stroke="#111513" strokeWidth="1" /></g>;
          }) : null}
          {candles.map((candle, index) => <rect key={`volume-${index}`} x={x(index) - candleWidth / 2} y={bottom + 8 + (1 - candle.volume) * 25} width={candleWidth} height={candle.volume * 25} fill={candle.close >= candle.open ? "#18c98e" : "#ff3771"} opacity="0.8" />)}
          <line x1={left} x2={right} y1={y(latestCandle.close * factor)} y2={y(latestCandle.close * factor)} stroke={token.accent} strokeDasharray="3 4" opacity="0.52" />
          <rect x={right} y={y(latestCandle.close * factor) - 9} width="74" height="18" fill={token.accent} /><text x={right + 7} y={y(latestCandle.close * factor) + 3.5} fill="#07100b" fontSize="9.5" fontWeight="700" fontFamily="monospace">{formatAxis(latestCandle.close * factor)}</text>
        </svg>
      </div>
    </section>
  );
}

function FloatingChart({ token, onRestore }: { token: LbpTokenDetail; onRestore: () => void }) {
  const candles = React.useMemo(() => createCandles(token, 42), [token]);
  const [position, setPosition] = React.useState<{ x: number; y: number } | null>(null);
  const [size, setSize] = React.useState({ width: 318, height: 188 });
  const [dragging, setDragging] = React.useState(false);
  const [resizing, setResizing] = React.useState(false);
  const dragState = React.useRef({ pointerX: 0, pointerY: 0, x: 0, y: 0 });
  const resizeState = React.useRef({ pointerX: 0, pointerY: 0, width: 318, height: 188, right: 0, bottom: 0, chartRatio: 318 / 156 });
  const chartWidth = 320;
  const chartHeight = 132;
  const chartLeft = 8;
  const chartRight = 312;
  const chartTop = 8;
  const chartBottom = 122;
  const values = candles.flatMap((candle) => [candle.high, candle.low]);
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const padding = Math.max((maximum - minimum) * 0.12, maximum * 0.006);
  const min = minimum - padding;
  const max = maximum + padding;
  const x = (index: number) => chartLeft + (index / Math.max(candles.length - 1, 1)) * (chartRight - chartLeft);
  const y = (value: number) => chartTop + ((max - value) / Math.max(max - min, 0.0000001)) * (chartBottom - chartTop);
  const candleWidth = Math.max(2, (chartRight - chartLeft) / candles.length * 0.48);

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
    const panel = event.currentTarget.parentElement;
    if (!panel) return;
    const bounds = panel.getBoundingClientRect();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = { pointerX: event.clientX, pointerY: event.clientY, x: bounds.left, y: bounds.top };
    setPosition({ x: bounds.left, y: bounds.top });
    setDragging(true);
  };
  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const nextX = dragState.current.x + event.clientX - dragState.current.pointerX;
    const nextY = dragState.current.y + event.clientY - dragState.current.pointerY;
    setPosition({ x: Math.max(6, Math.min(window.innerWidth - size.width - 6, nextX)), y: Math.max(58, Math.min(window.innerHeight - size.height - 48, nextY)) });
  };
  const finishDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);
  };
  const startResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const panel = event.currentTarget.parentElement;
    if (!panel) return;
    const bounds = panel.getBoundingClientRect();
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeState.current = { pointerX: event.clientX, pointerY: event.clientY, width: bounds.width, height: bounds.height, right: bounds.right, bottom: bounds.bottom, chartRatio: bounds.width / Math.max(1, bounds.height - 32) };
    setPosition({ x: bounds.left, y: bounds.top });
    setResizing(true);
  };
  const moveResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!resizing) return;
    const maximumHeight = Math.min(340, resizeState.current.bottom - 58);
    const maximumWidth = Math.min(520, resizeState.current.right - 6, Math.max(260, (maximumHeight - 32) * resizeState.current.chartRatio));
    const horizontalChange = resizeState.current.pointerX - event.clientX;
    const verticalChange = resizeState.current.pointerY - event.clientY;
    const widthFromHorizontal = resizeState.current.width + horizontalChange;
    const widthFromVertical = (resizeState.current.height - 32 + verticalChange) * resizeState.current.chartRatio;
    const requestedWidth = Math.abs(horizontalChange) >= Math.abs(verticalChange) * resizeState.current.chartRatio ? widthFromHorizontal : widthFromVertical;
    const width = Math.max(260, Math.min(maximumWidth, requestedWidth));
    const height = 32 + width / resizeState.current.chartRatio;
    setSize({ width, height });
    setPosition({ x: resizeState.current.right - width, y: resizeState.current.bottom - height });
  };
  const finishResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setResizing(false);
  };

  return (
    <motion.aside
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="fixed z-[260] overflow-hidden rounded-xl border border-[#2a3330] bg-[#0d100f]/[0.98] shadow-[0_20px_55px_rgba(0,0,0,0.58),0_0_0_1px_rgba(24,201,142,0.035)] backdrop-blur-xl"
      style={position ? { left: position.x, top: position.y, width: size.width, height: size.height } : { right: 14, bottom: 54, width: size.width, height: size.height }}
      aria-label="Floating price chart"
    >
      <div onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={finishDrag} onPointerCancel={finishDrag} className={cx("flex h-8 touch-none items-center border-b border-white/[0.07] px-2.5", dragging ? "cursor-grabbing" : "cursor-grab")}>
        <strong className="text-[10px] font-semibold text-white/82">{token.ticker} / {token.quoteSymbol}</strong>
        <span className="ml-2 font-mono text-[8.5px] text-[#52dfb2]">{formatUsd(token.marketCap)}</span>
        <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={onRestore} aria-label="Restore full chart" className="ml-auto grid h-6 w-6 place-items-center rounded text-white/38 transition hover:bg-white/[0.05] hover:text-[#52dfb2]"><Maximize2 className="h-3 w-3" /></button>
      </div>
      <div className="bb-chart-surface relative h-[calc(100%-32px)]">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" className="h-full w-full" role="img" aria-label={`${token.ticker} compact price chart`}>
          {Array.from({ length: 4 }, (_, index) => { const gridY = chartTop + (index / 3) * (chartBottom - chartTop); return <line key={index} x1={chartLeft} x2={chartRight} y1={gridY} y2={gridY} stroke="rgba(255,255,255,0.055)" />; })}
          {candles.map((candle, index) => { const up = candle.close >= candle.open; const color = up ? "#18c98e" : "#ff3771"; const candleX = x(index); const bodyTop = y(Math.max(candle.open, candle.close)); const bodyBottom = y(Math.min(candle.open, candle.close)); return <g key={index}><line x1={candleX} x2={candleX} y1={y(candle.high)} y2={y(candle.low)} stroke={color} strokeWidth="1" vectorEffect="non-scaling-stroke" /><rect x={candleX - candleWidth / 2} y={bodyTop} width={candleWidth} height={Math.max(1.2, bodyBottom - bodyTop)} fill={color} /></g>; })}
        </svg>
      </div>
      <button type="button" onPointerDown={startResize} onPointerMove={moveResize} onPointerUp={finishResize} onPointerCancel={finishResize} aria-label="Resize chart window" className={cx("absolute left-0 top-0 z-10 h-6 w-6 touch-none cursor-nwse-resize border-l-2 border-t-2 outline-none transition-colors", resizing ? "border-[#52dfb2]" : "border-white/18 hover:border-[#52dfb2]/75")} />
    </motion.aside>
  );
}

function ActivityMetric({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <div className="grid min-w-0 content-center gap-[3px] border-r border-white/[0.07] px-[18px] last:border-r-0 max-[1400px]:px-2"><dt className="truncate text-[9px] font-semibold uppercase tracking-[0.085em] text-[#75817c]">{label}</dt><dd className={cx("truncate font-mono text-[12px] font-semibold tracking-[-0.025em]", accent ? "text-[#18c98e]" : "text-[#d8e4e0]")}>{value}</dd></div>;
}

function CommentThread({ comment, token }: { comment: CommentNode; token: LbpTokenDetail }) {
  const [voteChoice, setVoteChoice] = React.useState<"up" | "down" | null>(null);
  const [replying, setReplying] = React.useState(false);
  const [replyDraft, setReplyDraft] = React.useState("");
  const voteStorageKey = `bb-comment-vote:${token.id}:${comment.id}`;
  const voteScore = comment.votes + (voteChoice === "up" ? 1 : voteChoice === "down" ? -1 : 0);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = window.localStorage.getItem(voteStorageKey);
      if (stored === "up" || stored === "down") setVoteChoice(stored);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [voteStorageKey]);

  const chooseVote = (next: "up" | "down") => {
    const resolved = voteChoice === next ? null : next;
    setVoteChoice(resolved);
    if (resolved) window.localStorage.setItem(voteStorageKey, resolved);
    else window.localStorage.removeItem(voteStorageKey);
  };

  return (
    <article className="relative py-[13px]">
      <div className="flex items-start gap-[10px]">
        <div className="mt-0.5 grid h-[28px] w-[28px] shrink-0 place-items-center overflow-hidden rounded-full border border-[#2c3532] bg-[#111514] shadow-[0_3px_10px_rgba(0,0,0,0.22)]">
          {comment.own ? <Image src="/brand-icon.png" width={24} height={24} alt="" className="h-6 w-6 object-contain" /> : <span className="font-mono text-[8px] font-bold" style={{ color: token.accent }}>{comment.user.slice(2, 4).toUpperCase()}</span>}
        </div>
        <div className="min-w-0 flex-1">
          <header className="flex items-center gap-1.5 text-[10.5px]"><strong className="font-mono font-semibold text-[#cbd5d1]">{comment.user}</strong><span className="text-[#56615c]">•</span><span className="text-[#7a8580]">{comment.age}</span>{comment.edited ? <><span className="text-[#56615c]">•</span><span className="text-[#7a8580]">edited</span></> : null}</header>
          <p className="mt-[6px] max-w-[870px] text-[12.5px] leading-[1.55] text-[#d3d9d6]">{comment.body}</p>
          <div className="mt-[7px] flex items-center gap-[9px] text-[#7a8580]">
            <button type="button" onClick={() => chooseVote("up")} aria-label="Upvote" aria-pressed={voteChoice === "up"} className={cx("grid h-5 w-5 place-items-center transition", voteChoice === "up" ? "text-[#52dfb2]" : "hover:text-[#52dfb2]")}><ArrowUp className="h-[13px] w-[13px]" /></button>
            <span className="-mx-1 font-mono text-[10px] text-[#949f9a]">{voteScore}</span>
            <button type="button" onClick={() => chooseVote("down")} aria-label="Downvote" aria-pressed={voteChoice === "down"} className={cx("grid h-5 w-5 place-items-center transition", voteChoice === "down" ? "text-[#ff3771]" : "hover:text-[#ff5c89]")}><ArrowDown className="h-[13px] w-[13px]" /></button>
            <button type="button" onClick={() => setReplying((value) => !value)} className="inline-flex items-center gap-1 text-[10px] transition hover:text-[#cdd5d1]"><Reply className="h-[12px] w-[12px]" />Reply</button>
            {comment.own ? <><button type="button" className="inline-flex items-center gap-1 text-[10px] transition hover:text-[#cdd5d1]"><Pencil className="h-[11px] w-[11px]" />Edit</button><button type="button" className="inline-flex items-center gap-1 text-[10px] transition hover:text-[#cdd5d1]"><Pin className="h-[11px] w-[11px]" />Pin</button><button type="button" className="inline-flex items-center gap-1 text-[10px] text-[#a36979] transition hover:text-[#ff5c89]"><Trash2 className="h-[11px] w-[11px]" />Delete</button></> : null}
          </div>
          <AnimatePresence initial={false}>{replying ? <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-2 flex max-w-[600px] overflow-hidden" onSubmit={(event) => { event.preventDefault(); setReplyDraft(""); setReplying(false); }}><input value={replyDraft} onChange={(event) => setReplyDraft(event.target.value)} autoFocus placeholder={`Reply to ${comment.user}`} className="h-8 min-w-0 flex-1 rounded-l-md border border-r-0 border-[#2b3531] bg-[#101312] px-3 text-[10.5px] text-[#dce3e0] outline-none placeholder:text-[#5e6964] focus:border-[#18c98e]/45" /><button type="submit" disabled={!replyDraft.trim()} className="h-8 rounded-r-md border border-[#18c98e]/30 bg-[#18c98e]/10 px-3 text-[10px] font-semibold text-[#78e99d] disabled:opacity-35">Reply</button></motion.form> : null}</AnimatePresence>
        </div>
      </div>
      {comment.replies?.length ? <div className="relative ml-[14px] mt-0.5 border-l border-white/[0.15] pl-[30px]">{comment.replies.map((child) => <div key={child.id} className="relative before:absolute before:-left-[30px] before:top-[18px] before:h-px before:w-[21px] before:bg-white/[0.15]"><CommentThread comment={child} token={token} /></div>)}</div> : null}
    </article>
  );
}

function ActivityPanel({ token, height, focusMode, onHeightChange, onToggleCollapsed, onCommentsFocusChange }: { token: LbpTokenDetail; height: number; focusMode: boolean; onHeightChange: (height: number) => void; onToggleCollapsed: () => void; onCommentsFocusChange: (focused: boolean) => void }) {
  const [tab, setTab] = React.useState<ActivityTab>("live");
  const [filter, setFilter] = React.useState<TradeFilter>("all");
  const [windowSize, setWindowSize] = React.useState("5m");
  const [commentDraft, setCommentDraft] = React.useState("");
  const [comments, setComments] = React.useState<CommentNode[]>(() => createComments(token));
  const [rows, setRows] = React.useState<TradeRow[]>(() => createTradeHistory(token));
  const [visibleTradeCount, setVisibleTradeCount] = React.useState(18);
  const [visibleHolderCount, setVisibleHolderCount] = React.useState(18);
  const [arrival, setArrival] = React.useState<TradeRow | null>(null);
  const [resizing, setResizing] = React.useState(false);
  const tradeSequence = React.useRef(20);
  const resizeState = React.useRef({ startY: 0, startHeight: height, moved: false });
  const holders = React.useMemo(() => createHolders(token), [token]);
  const filteredRows = rows.filter((row) => filter === "all" || row.side === filter);
  const visibleRows = filteredRows.slice(0, visibleTradeCount);
  const visibleHolders = holders.slice(0, visibleHolderCount);
  const buys = rows.filter((row) => row.side === "buy");
  const volume = rows.reduce((sum, row) => sum + row.usd, 0);
  const buyRatio = rows.length ? Math.round((buys.length / rows.length) * 100) : 0;
  const maxTradeUsd = Math.max(1, ...filteredRows.map((row) => row.usd));
  const commentCount = countComments(comments);
  const collapsed = !focusMode && height <= 42;

  React.useEffect(() => {
    if (token.upcoming) return;
    const interval = window.setInterval(() => {
      tradeSequence.current += 1;
      const index = tradeSequence.current;
      const base = createTrades(token)[index % 12];
      if (!base) return;
      const next = { ...base, id: `live-${Date.now()}`, age: "now" };
      setRows((current) => [next, ...current.map((row, rowIndex) => ({ ...row, age: rowIndex < 5 ? `${[6, 12, 18, 27, 39][rowIndex]}s` : row.age }))].slice(0, 180));
      setArrival(next);
    }, 4600);
    return () => window.clearInterval(interval);
  }, [token]);

  const submitComment = (event: React.FormEvent) => {
    event.preventDefault();
    const body = commentDraft.trim();
    if (!body) return;
    setComments((current) => {
      const next = [{ id: `comment-${Date.now()}`, user: "You", age: "now", body, votes: 1, own: true }, ...current];
      if (tab === "comments" && countComments(next) >= 9) onCommentsFocusChange(true);
      return next;
    });
    setCommentDraft("");
  };

  const tabClass = (item: ActivityTab) => cx("relative inline-flex h-full items-center gap-1.5 px-[11px] text-[11px] font-semibold outline-none transition focus-visible:outline-none", tab === item ? "text-[#edf2ef] after:absolute after:inset-x-[10px] after:bottom-[-1px] after:h-[2px] after:bg-[#18c98e] after:shadow-[0_-4px_12px_rgba(24,201,142,0.16)]" : "text-[#7f8a85] hover:text-[#edf2ef]");
  const selectTab = (item: ActivityTab) => {
    setTab(item);
    const shouldFocusComments = item === "comments" && commentCount >= 9;
    onCommentsFocusChange(shouldFocusComments);
    if (shouldFocusComments) return;
    if (item === "comments" && height < 460) onHeightChange(460);
  };
  const loadMoreComments = () => setComments((current) => {
    const next = [...current, ...createMoreComments(token, current.length, 10)];
    if (tab === "comments" && countComments(next) >= 9) onCommentsFocusChange(true);
    return next;
  });
  const loadMoreTrades = () => {
    if (visibleTradeCount + 20 >= filteredRows.length) setRows((current) => [...current, ...createTradeHistory(token, 36, current.length)]);
    setVisibleTradeCount((current) => current + 18);
  };
  const nearEnd = (event: React.UIEvent<HTMLDivElement>, load: () => void) => {
    const element = event.currentTarget;
    if (element.scrollHeight - element.scrollTop - element.clientHeight < 84) load();
  };
  const startResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeState.current = { startY: event.clientY, startHeight: height, moved: false };
    setResizing(true);
  };
  const moveResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!resizing) return;
    const delta = resizeState.current.startY - event.clientY;
    if (Math.abs(delta) > 3) resizeState.current.moved = true;
    const maximum = Math.max(360, window.innerHeight - 355);
    onHeightChange(Math.min(maximum, Math.max(42, resizeState.current.startHeight + delta)));
  };
  const finishResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!resizing) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setResizing(false);
    if (!resizeState.current.moved) onToggleCollapsed();
  };

  return (
    <section
      className={cx("relative flex min-h-0 shrink-0 flex-col overflow-visible border-t border-white/[0.08] bg-[#0f1111]", !resizing && "transition-[flex-grow,flex-basis] duration-[360ms] ease-[cubic-bezier(0.22,1,0.36,1)]")}
      style={{ flexGrow: focusMode ? 1 : 0, flexBasis: focusMode ? 0 : height }}
    >
      <button type="button" disabled={focusMode} onPointerDown={startResize} onPointerMove={moveResize} onPointerUp={finishResize} onPointerCancel={finishResize} aria-label={collapsed ? "Expand market activity" : "Resize market activity"} aria-hidden={focusMode || undefined} className={cx("group absolute left-1/2 top-0 z-30 grid h-5 w-12 -translate-x-1/2 -translate-y-1/2 touch-none place-items-center outline-none transition-[opacity,transform] duration-300", focusMode && "pointer-events-none scale-90 opacity-0", resizing ? "cursor-grabbing" : "cursor-ns-resize")}>
        <span className={cx("h-[4px] w-7 rounded-full border shadow-[0_3px_10px_rgba(0,0,0,0.42),inset_0_1px_rgba(255,255,255,0.045)] transition-[width,background-color,border-color,box-shadow] duration-200", resizing ? "w-8 border-[#52dfb2]/[0.55] bg-[#52dfb2]/[0.55] shadow-[0_0_14px_rgba(82,223,178,0.2)]" : "border-white/[0.13] bg-[#59635f]/[0.42] group-hover:w-8 group-hover:border-[#52dfb2]/[0.38] group-hover:bg-[#52dfb2]/[0.42] group-focus-visible:w-8 group-focus-visible:border-[#52dfb2]/[0.45] group-focus-visible:bg-[#52dfb2]/[0.48]")} />
      </button>
      <div className="flex h-[42px] shrink-0 items-center border-b border-[#202522] px-[10px] pl-[17px]">
        <div className="flex h-full items-center gap-[5px]">
          <button type="button" onClick={() => selectTab("live")} className={tabClass("live")}>All trades{rows.length ? <span className="font-mono text-[9px] font-medium text-white/32">{rows.length}</span> : null}</button>
          <button type="button" onClick={() => selectTab("mine")} className={tabClass("mine")}>My trades</button>
          <button type="button" onClick={() => selectTab("comments")} className={tabClass("comments")}>Comments{commentCount ? <span className="font-mono text-[9px] font-medium text-white/32">{commentCount}</span> : null}</button>
          <button type="button" onClick={() => selectTab("holders")} className={tabClass("holders")}>Holders{token.holders ? <span className="font-mono text-[9px] font-medium text-white/32">{token.holders.toLocaleString("en-US")}</span> : null}</button>
        </div>
        {tab === "live" ? <div className="ml-auto flex items-center gap-0.5">{(["all", "buy", "sell"] as TradeFilter[]).map((item) => <button key={item} type="button" onClick={() => { setFilter(item); setVisibleTradeCount(18); }} className={cx("h-7 rounded px-2.5 text-[11px] font-semibold capitalize transition", filter === item ? "bg-[#171b1a] text-[#cbd3d0]" : "text-[#7f8a85] hover:bg-[#171b1a] hover:text-[#cbd3d0]")}>{item === "buy" ? "Buys" : item === "sell" ? "Sells" : "All"}</button>)}</div> : null}
      </div>

      {!collapsed && (tab === "live" || tab === "mine") ? <div className="grid h-[50px] shrink-0 grid-cols-[minmax(190px,212px)_minmax(232px,248px)_minmax(0,1fr)] border-y border-white/[0.055] bg-[#111313] shadow-[inset_2px_0_rgba(24,201,142,0.82)] max-[1400px]:grid-cols-[140px_160px_minmax(0,1fr)]">
        <div className="flex flex-col justify-center border-r border-white/[0.07] px-[18px] max-[1400px]:px-3"><strong className="font-mono text-[11.5px] font-semibold tracking-[-0.025em] text-[#d7dfdc]">{token.ticker}/{token.quoteSymbol}</strong><span className="mt-0.5 text-[8.5px] font-bold uppercase tracking-[0.095em] text-[#18c98e]">{token.upcoming ? "Scheduled market" : "Realtime market"}</span></div>
        <div className="flex items-center gap-[10px] border-r border-white/[0.07] px-3"><span className="text-[9px] font-semibold uppercase tracking-[0.09em] text-[#75817c]">Window</span><div className="grid min-w-0 flex-1 grid-cols-4 gap-0.5 rounded-md border border-white/[0.08] bg-[#0c0f0e] p-0.5">{["5m", "1h", "4h", "24h"].map((item) => <button key={item} type="button" onClick={() => setWindowSize(item)} className={cx("h-[26px] rounded text-[10px] font-medium transition", windowSize === item ? "bg-[#18c98e]/[0.10] text-[#78e99d] shadow-[inset_0_0_0_1px_rgba(24,201,142,0.24)]" : "text-[#7d8984] hover:bg-[#171d1b] hover:text-[#c4ceca]")}>{item}</button>)}</div></div>
        <dl className="grid min-w-0 grid-cols-4">
          <ActivityMetric label="Price change" value={`${token.change24h >= 0 ? "+" : ""}${token.change24h.toFixed(2)}%`} accent />
          <ActivityMetric label="Trades" value={rows.length.toString()} />
          <ActivityMetric label="Volume" value={formatUsd(volume)} />
          <ActivityMetric label="Buy ratio" value={`${buyRatio}%`} accent />
        </dl>
      </div> : null}

      {!collapsed ? tab === "comments" ? (
        <div onScroll={(event) => nearEnd(event, loadMoreComments)} className="min-h-0 flex-1 overflow-y-auto [scrollbar-color:#303936_transparent] [scrollbar-width:thin]">
          <form onSubmit={submitComment} className="px-5 pb-[10px] pt-[15px]">
            <div className="flex h-8 items-center gap-1.5">
              {[{ label: "Bold", icon: Bold }, { label: "Italic", icon: Italic }, { label: "Code", icon: Code2 }, { label: "Quote", icon: Quote }, { label: "List", icon: List }, { label: "Hide preview", icon: EyeOff }, { label: "Emoji", icon: Smile }, { label: "Add link", icon: Link2 }].map(({ label, icon: Icon }) => <button key={label} type="button" aria-label={label} className="grid h-7 w-7 place-items-center rounded-[6px] border border-[#2a3330] bg-[#121514] text-[#818c87] transition hover:border-[#3b4742] hover:bg-[#181c1b] hover:text-[#d3dcd8]"><Icon className="h-[13px] w-[13px]" /></button>)}
              <button type="button" onClick={() => setCommentDraft("")} className="ml-auto px-2 text-[10px] font-semibold text-[#8c9792] transition hover:text-[#d5dcd9]">Cancel</button>
              <button type="submit" disabled={!commentDraft.trim()} className="h-7 rounded-md bg-[#18c98e] px-3 text-[10px] font-bold text-[#06150f] transition hover:bg-[#65e892] disabled:bg-[#1b201e] disabled:text-[#58625e]">Comment</button>
            </div>
            <textarea value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} placeholder="Join the conversation" rows={3} className="mt-[9px] min-h-[72px] w-full resize-y rounded-lg border border-[#2a3330] bg-[#111514] px-3 py-2.5 text-[12px] leading-relaxed text-[#d9e0dd] outline-none placeholder:text-[#626c68] focus:border-[#18c98e]/45 focus:shadow-[0_0_0_2px_rgba(24,201,142,0.04)]" />
          </form>
          <div className="px-5 pb-7">{comments.map((comment) => <CommentThread key={comment.id} comment={comment} token={token} />)}<div className="flex h-10 items-center justify-center text-[9.5px] text-white/25"><span className="mr-2 h-1.5 w-1.5 animate-pulse rounded-full bg-[#18c98e]/55" />Scroll for more comments</div></div>
        </div>
      ) : tab === "holders" ? (
        <div onScroll={(event) => nearEnd(event, () => setVisibleHolderCount((current) => Math.min(holders.length, current + 20)))} className="min-h-0 flex-1 overflow-auto [scrollbar-color:#303936_transparent] [scrollbar-width:thin]">
          <table className="w-full table-fixed border-collapse font-mono text-[11px] font-normal">
            <thead className="sticky top-0 z-10 bg-[#101312]"><tr className="h-8 border-b border-[#282f2c] text-left uppercase tracking-[0.06em] text-[#707b76]"><th className="w-[7%] px-4 font-medium">#</th><th className="w-[43%] px-3 font-medium">Holder</th><th className="w-[30%] px-3 text-right font-medium">{token.ticker}</th><th className="px-4 text-right font-medium">Supply</th></tr></thead>
            <tbody>{visibleHolders.map((holder, index) => <tr key={holder.address} className={cx("h-9 border-b border-[#242b28] text-[#c0cac5] transition hover:bg-white/[0.018]", holder.own && "bg-[linear-gradient(90deg,rgba(24,201,142,0.10),rgba(24,201,142,0.035)_62%,transparent)] shadow-[inset_2px_0_rgba(24,201,142,0.74)] hover:bg-[#18c98e]/[0.07]")}><td className={cx("px-4", holder.own ? "font-semibold text-[#52dfb2]" : "text-[#7b8781]")}>{holder.rank ?? index + 1}</td><td className="px-3"><span className={holder.own ? "text-[#b8d7cc]" : "text-[#9db6ad]"}>{shortAddress(holder.address)}</span>{holder.own ? <span className="ml-2 rounded-sm bg-[#18c98e]/10 px-1.5 py-0.5 font-sans text-[8px] font-bold uppercase tracking-[0.07em] text-[#52dfb2]">You</span> : null}{holder.creator ? <span className="ml-2 rounded-sm bg-[#d8b75f]/10 px-1.5 py-0.5 font-sans text-[8px] font-bold uppercase tracking-[0.07em] text-[#e5c96f] ring-1 ring-inset ring-[#d8b75f]/18">Creator</span> : null}</td><td className="px-3 text-right text-[#e1e7e4]">{holder.balance.toLocaleString("en-US", { maximumFractionDigits: holder.balance >= 1_000_000 ? 0 : 3 })}</td><td className="px-4 text-right font-semibold text-[#18c98e]">{holder.supply.toFixed(holder.own && holder.supply < 0.01 ? 4 : 2)}%</td></tr>)}</tbody>
          </table>
          <div className="flex h-10 items-center justify-between px-4 text-[9.5px] text-[#707b76]"><span>Showing {visibleHolders.length.toLocaleString("en-US")} of {token.holders.toLocaleString("en-US")} holders</span>{visibleHolders.length < holders.length ? <span>Scroll to load more</span> : null}</div>
        </div>
      ) : <div onScroll={tab === "live" ? (event) => nearEnd(event, loadMoreTrades) : undefined} className="min-h-0 flex-1 overflow-auto [scrollbar-color:#303936_transparent] [scrollbar-width:thin]">
        {tab === "mine" ? (
          <div className="grid h-full place-items-center text-center"><div><Wallet className="mx-auto h-5 w-5 text-white/20" /><div className="mt-2 text-[11px] font-medium text-white/58">Connect your wallet to see your trades</div><div className="mt-1 text-[9.5px] text-white/28">Your LBP activity will appear here.</div></div></div>
        ) : visibleRows.length ? (
          <div className="relative">
            {arrival && (filter === "all" || arrival.side === filter) ? <span key={arrival.id} className="bb-trade-arrival-pulse" data-side={arrival.side} /> : null}
            <table className="w-full table-fixed border-collapse font-mono text-[11px] font-normal">
              <thead className="sticky top-0 z-10 bg-[#0d0f0e]"><tr className="h-8 border-b border-[#282f2c] text-left uppercase tracking-[0.06em] text-[#707b76]"><th className="w-[9%] px-4 font-medium">Time</th><th className="w-[10%] px-3 font-medium">Side</th><th className="w-[19%] px-3 text-right font-medium">Total USD</th><th className="w-[17%] px-3 text-right font-medium">{token.quoteSymbol}</th><th className="w-[20%] px-3 text-right font-medium">{token.ticker}</th><th className="px-3 text-right font-medium">Trader</th><th className="w-12 px-3 text-center font-medium">Txn</th></tr></thead>
              <tbody>{visibleRows.map((row, index) => {
                const tradeFillRatio = maxTradeUsd > 0 ? Math.sqrt(Math.min(1, Math.max(0, row.usd / maxTradeUsd))) : 0;
                const tradeFillStyle = { "--trade-fill": `${14 + tradeFillRatio * 78}%`, "--trade-rgb": row.side === "buy" ? "32,201,151" : "255,55,113" } as React.CSSProperties;
                const nativeAmount = row.nativeAmount ?? row.usd / initialQuoteUsd(token.quoteSymbol);
                const tokenAmount = row.usd / Math.max(row.price * initialQuoteUsd(token.quoteSymbol), 0.000001);
                return <tr key={row.id ?? `${row.age}-${index}`} className="bb-trades-row h-9 border-b border-[rgba(32,40,47,0.48)] text-[#c0cac5] transition-colors"><td className="px-4">{row.age}</td><td className="px-3"><span className={cx("inline-flex rounded-sm px-2 py-1 font-sans text-[9px] font-bold uppercase", row.side === "buy" ? "bg-[#20c997]/10 text-[#48dba9]" : "bg-[#ff3771]/10 text-[#ff4d80]")}>{row.side}</span></td><td className={cx("bb-trade-total px-3 text-right", row.side === "buy" ? "text-[#48dba9]" : "text-[#ff4d80]")} style={tradeFillStyle}><span className="relative z-[1]">{formatUsd(row.usd)}</span></td><td className="px-3 text-right text-[#d6dcda]">{nativeAmount.toLocaleString("en-US", { maximumFractionDigits: 5 })}</td><td className="px-3 text-right text-[#e1e7e4]">{tokenAmount.toLocaleString("en-US", { maximumFractionDigits: 4 })}</td><td className="px-3 text-right text-[#8eaaa1]">{row.trader}</td><td className="px-3 text-center"><ArrowUpRight className="mx-auto h-3 w-3 text-[#59635f]" /></td></tr>;
              })}</tbody>
            </table>
          </div>
        ) : (
          <div className="grid h-full place-items-center text-center"><div><div className="mx-auto h-2 w-2 animate-pulse rounded-full bg-amber-200/60 shadow-[0_0_12px_rgba(253,230,138,0.2)]" /><div className="mt-3 text-[11px] font-medium text-white/58">Trading opens with the LBP</div><div className="mt-1 text-[9.5px] text-white/28">Live transactions will appear here.</div></div></div>
        )}
      </div> : null}
    </section>
  );
}

function TradeTicket({ token }: { token: LbpTokenDetail }) {
  const [side, setSide] = React.useState<TradeSide>("buy");
  const [amount, setAmount] = React.useState("");
  const [slippageMode, setSlippageMode] = React.useState<SlippageMode>("auto");
  const [customSlippage, setCustomSlippage] = React.useState("0.5");
  const [slippageOpen, setSlippageOpen] = React.useState(false);
  const [connected, setConnected] = React.useState(false);
  const [quoteUsd, setQuoteUsd] = React.useState(() => initialQuoteUsd(token.quoteSymbol));
  const [quotedTokenPrice, setQuotedTokenPrice] = React.useState(token.price);
  const [quoteCountdown, setQuoteCountdown] = React.useState(10);
  const quoteBalance = 12_481.22;
  const tokenBalance = 18420;
  const balance = side === "buy" ? quoteBalance : tokenBalance;
  const numericAmount = Number(amount) || 0;
  const validAmount = numericAmount > 0;
  const receive = side === "buy" ? numericAmount / quotedTokenPrice : numericAmount * quotedTokenPrice;
  const paySymbol = side === "buy" ? token.quoteSymbol : token.ticker;
  const receiveSymbol = side === "buy" ? token.ticker : token.quoteSymbol;
  const sizePercent = Math.min(100, Math.max(0, validAmount ? (numericAmount / balance) * 100 : 0));
  const numericCustomSlippage = Number(customSlippage);
  const validCustomSlippage = customSlippage !== "" && Number.isFinite(numericCustomSlippage) && numericCustomSlippage > 0 && numericCustomSlippage <= 999;
  const slippage = slippageMode === "fixed-50" ? 0.5 : slippageMode === "fixed-100" ? 1 : slippageMode === "fixed-500" ? 5 : slippageMode === "custom" && validCustomSlippage ? numericCustomSlippage : 0.5;
  const sizeStyle = { "--size-ratio": `${sizePercent / 100}`, "--size-percent": `${sizePercent}%` } as React.CSSProperties;
  const maxBuyNative = token.maxBuyTokens ? token.maxBuyTokens * quotedTokenPrice : 0;

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setQuoteCountdown((current) => {
        if (current <= 1) {
          setQuoteUsd((value) => Number((value * (1 + (Math.random() - 0.5) * 0.0014)).toFixed(2)));
          setQuotedTokenPrice((value) => Number((value * (1 + (Math.random() - 0.5) * 0.0016)).toFixed(8)));
          return 10;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [token.id]);

  const setPercent = (percent: number, magnetic = false) => {
    const nextPercent = magnetic ? snapSizePercent(percent) : Math.min(100, Math.max(0, percent));
    setAmount(nextPercent <= 0 ? "" : inputAmount(balance * (nextPercent / 100)));
  };

  const updateAmount = (value: string) => {
    if (!/^\d*\.?\d*$/.test(value)) return;
    setAmount(value);
  };

  const changeSide = (nextSide: TradeSide) => {
    if (nextSide === side) return;
    setSide(nextSide);
    setAmount(validAmount ? inputAmount(receive) : "");
  };

  const flip = () => changeSide(side === "buy" ? "sell" : "buy");

  return (
    <aside className={cx("relative isolate min-h-0 overflow-hidden border-l border-[#242a28] bg-[#0f1111]", side === "buy" ? "shadow-[inset_12px_0_36px_rgba(24,201,142,0.015)]" : "shadow-[inset_12px_0_36px_rgba(255,55,113,0.012)]")}>
      <div className="bb-ticket-surface flex h-full min-h-0 flex-col overflow-y-auto px-5 pb-[14px] pt-4 [scrollbar-color:#303936_transparent] [scrollbar-width:thin]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(24,201,142,0.68)_48%,transparent)]" />
      <div>
        <div className="text-[8.5px] font-semibold uppercase tracking-[0.11em] text-[#68736e]">LBP order</div><h2 className="mt-0.5 text-[16px] font-bold tracking-[-0.03em] text-[#edf2ef]">Trade {token.ticker}</h2>
      </div>

      <div className="mt-2.5 grid h-9 grid-cols-2 gap-1 rounded-[9px] border border-[#28312e] bg-black/25 p-1">
        <button type="button" onClick={() => changeSide("buy")} className={cx("rounded-md text-[11px] font-semibold transition", side === "buy" ? "bg-[linear-gradient(180deg,rgba(24,201,142,0.16),rgba(24,201,142,0.09))] text-[#18c98e] shadow-[inset_0_0_0_1px_rgba(24,201,142,0.08)]" : "text-[#7f8a85] hover:text-[#cbd3d0]")}>Buy</button>
        <button type="button" onClick={() => changeSide("sell")} className={cx("rounded-md text-[11px] font-semibold transition", side === "sell" ? "bg-[linear-gradient(180deg,rgba(255,55,113,0.16),rgba(255,55,113,0.09))] text-[#ff3771] shadow-[inset_0_0_0_1px_rgba(255,55,113,0.08)]" : "text-[#7f8a85] hover:text-[#cbd3d0]")}>Sell</button>
      </div>

      <div className="relative mt-[10px] overflow-visible rounded-xl border border-[#2a3330] bg-[linear-gradient(145deg,rgba(20,23,23,0.99),rgba(15,17,17,0.99))] shadow-[0_14px_34px_rgba(0,0,0,0.16),inset_0_1px_rgba(255,255,255,0.018)]">
        <label className="grid h-[96px] gap-1.5 rounded-t-[11px] p-[11px] transition focus-within:bg-[linear-gradient(90deg,rgba(24,201,142,0.045),rgba(24,201,142,0.008)_48%,transparent_78%)]">
        <span className="flex items-center justify-between text-[10px] text-[#9ba6a1]"><span>You pay</span><span className="font-mono text-[9px] text-[#7b8681]">Balance {balance.toLocaleString("en-US", { maximumFractionDigits: 4 })} {paySymbol}</span></span>
        <span className="flex items-center justify-between gap-3"><input value={amount} onChange={(event) => updateAmount(event.target.value)} inputMode="decimal" placeholder="0" aria-label={`Amount of ${paySymbol} to pay`} className="min-w-0 w-[56%] bg-transparent font-mono text-[24px] font-medium tracking-[-0.05em] text-[#edf2ef] caret-[#18c98e] outline-none placeholder:text-[#56625d] focus:text-[#eef7f3] focus:drop-shadow-[0_0_9px_rgba(24,201,142,0.08)]" /><span className="inline-flex items-center gap-1.5 rounded-full border border-[#354149]/80 bg-black/35 py-0.5 pl-1 pr-1.5 text-[11px] font-semibold text-[#edf2ef]">{side === "buy" ? <QuoteMark symbol={paySymbol} /> : <TokenMark token={token} size="h-[25px] w-[25px]" />}{paySymbol}</span></span>
        <span className="font-mono text-[10px] text-[#7d8984]">{formatUsd(side === "buy" ? numericAmount * quoteUsd : numericAmount * quotedTokenPrice * quoteUsd)}</span>
        </label>
        <button type="button" onClick={flip} aria-label="Switch trade direction" className="bb-swap-flip absolute left-1/2 top-1/2 z-10 grid h-[34px] w-[34px] -translate-x-1/2 -translate-y-1/2 place-items-center overflow-hidden rounded-full border-4 border-[#111414] bg-[#1a201e] text-[#9aa6a1] shadow-[0_6px_14px_rgba(0,0,0,0.34),inset_0_1px_rgba(255,255,255,0.06),0_0_0_1px_rgba(24,201,142,0.1)] transition hover:bg-[#1d2925] hover:text-[#78e99d] hover:shadow-[0_7px_16px_rgba(0,0,0,0.38),inset_0_1px_rgba(255,255,255,0.07),0_0_0_1px_rgba(24,201,142,0.2)]"><span className="bb-swap-flip-motion grid place-items-center"><ArrowDownUp className="h-3.5 w-3.5" /></span></button>
        <div className="grid h-[96px] gap-1.5 rounded-b-[11px] border-t border-[#2a3330] bg-black/[0.18] p-[11px]">
        <span className="flex items-center justify-between text-[10px] text-[#9ba6a1]"><span>You receive</span><span className="text-[9px] text-[#7b8681]">Estimated</span></span>
        <span className="flex items-center justify-between gap-3"><output className="min-w-0 w-[56%] truncate font-mono text-[24px] font-medium tracking-[-0.05em] text-[#edf2ef]">{receive ? receive.toLocaleString("en-US", { maximumFractionDigits: side === "buy" ? 2 : 5 }) : "0"}</output><span className="inline-flex items-center gap-1.5 rounded-full border border-[#354149]/80 bg-black/35 py-0.5 pl-1 pr-1.5 text-[11px] font-semibold text-[#edf2ef]">{side === "buy" ? <TokenMark token={token} size="h-[25px] w-[25px]" /> : <QuoteMark symbol={receiveSymbol} />}{receiveSymbol}</span></span>
        <span className="font-mono text-[10px] text-[#7d8984]">{formatUsd(side === "buy" ? receive * quotedTokenPrice * quoteUsd : receive * quoteUsd)}</span>
        </div>
      </div>

      <div className="bb-size-control mt-2 rounded-[9px] border border-[#27302d] bg-[linear-gradient(180deg,rgba(20,23,23,0.92),rgba(10,11,11,0.82))] px-[10px] pb-1 pt-1.5 shadow-[inset_0_1px_rgba(255,255,255,0.018)] focus-within:border-[#18c98e]/30" style={sizeStyle}>
        <div className="flex min-h-[15px] items-center justify-between text-[9.5px] text-[#899590]"><label htmlFor="lbp-order-size" className="font-semibold">Order size</label><output htmlFor="lbp-order-size" className="font-mono text-[10px] font-semibold text-[#c8d4d1]">{sizePercentLabel(sizePercent)}</output></div>
        <div className="bb-size-slider relative mx-2 h-[21px]">
          <input id="lbp-order-size" type="range" min="0" max="100" step="0.1" value={sizePercent} onChange={(event) => setPercent(Number(event.currentTarget.value), true)} aria-label="Order size" aria-valuetext={`${sizePercentLabel(sizePercent)} of available ${paySymbol} balance`} className="bb-size-range absolute inset-0 z-[3] h-[21px] w-full cursor-pointer appearance-none bg-transparent" />
          <span className="bb-size-fill pointer-events-none absolute z-[1]" aria-hidden="true" />
          <span className="bb-size-halo pointer-events-none absolute z-[1]" aria-hidden="true" />
        </div>
        <div className="flex h-5 items-start justify-between">{SNAP_POINTS.map((point) => { const selected = Math.abs(sizePercent - point) < 0.05; return <button key={point} type="button" onClick={() => setPercent(point)} className={cx("grid h-5 w-7 justify-items-center gap-0.5 font-mono text-[9px] leading-none transition", selected ? "text-[#18c98e]" : "text-[#75817c] hover:text-[#18c98e]")}><i className={cx("h-1 w-0.5 rounded-full bg-[#4b5551] transition", selected ? "translate-y-[-2px] scale-50 opacity-0" : "group-hover:bg-[#18c98e]")} /><span>{point}%</span></button>; })}</div>
      </div>

      <button type="button" disabled={token.upcoming} onClick={() => setConnected(true)} className={cx("relative mt-2 grid min-h-[46px] shrink-0 place-items-center overflow-hidden rounded-lg border px-4 text-[12px] font-bold transition", token.upcoming ? "cursor-not-allowed border-[#25312d] bg-[#17221f] text-[#52615c] shadow-[inset_0_1px_rgba(255,255,255,0.025)]" : side === "buy" ? "border-[#6be991] bg-[#18c98e] text-[#04140f] shadow-[0_8px_18px_rgba(0,0,0,0.28),inset_0_1px_rgba(235,255,241,0.22),inset_0_-1px_rgba(20,89,45,0.22)] hover:border-[#8df0aa] hover:bg-[#65e892] hover:shadow-[0_10px_22px_rgba(0,0,0,0.32),0_0_16px_rgba(24,201,142,0.13),inset_0_1px_rgba(243,255,247,0.24)]" : "border-[#ff5f8d] bg-[#ff3771] text-[#19050c] shadow-[0_8px_18px_rgba(0,0,0,0.28)] hover:bg-[#ff4d7d]")}>{token.upcoming ? "Trading opens soon" : connected ? `Review ${side}` : "Connect wallet"}</button>

      <dl className="mt-3 space-y-2 border-t border-[#28302e] pt-3 text-[10.5px]">
        {token.maxBuyTokens ? <div className="flex min-h-[27px] items-start justify-between gap-3"><dt className="pt-0.5 text-[#7f8a85]">Max buy</dt><dd className="grid justify-items-end font-mono font-semibold leading-tight text-[#d1d8da]"><span>{token.maxBuyTokens.toLocaleString("en-US", { maximumFractionDigits: 4 })} {token.ticker} <span className="text-[#78e99d]">({maxBuyNative.toLocaleString("en-US", { maximumFractionDigits: 2 })} {token.quoteSymbol})</span></span><span className="mt-1 text-[8.5px] font-normal text-[#68736e]">refresh in {quoteCountdown}s</span></dd></div> : null}
        <div className="flex min-h-[19px] items-center justify-between gap-3"><dt className="text-[#7f8a85]">{token.quoteSymbol} value</dt><dd className="inline-flex items-center gap-1.5 font-mono font-semibold text-[#d1d8da]"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#18c98e] shadow-[0_0_8px_rgba(24,201,142,0.45)]" /><span>{formatQuoteUsd(quoteUsd)}</span><span className="text-[8.5px] font-normal text-[#68736e]">quote in {quoteCountdown}s</span></dd></div>
        <div className="flex min-h-[19px] items-center justify-between gap-3"><dt className="text-[#7f8a85]">Rate</dt><dd className="font-mono font-semibold text-[#d1d8da]">1 {token.ticker} = {quotedTokenPrice.toFixed(6)} {token.quoteSymbol}</dd></div>
        <div className="flex min-h-[19px] items-center justify-between gap-3"><dt className="text-[#7f8a85]">Minimum received</dt><dd className="font-mono font-semibold text-[#d1d8da]">{receive ? (receive * (1 - slippage / 100)).toLocaleString("en-US", { maximumFractionDigits: 4 }) : "0"} {receiveSymbol}</dd></div>
        <div className="flex min-h-[19px] items-center justify-between gap-3"><dt className="text-[#7f8a85]">Slippage tolerance</dt><dd><button type="button" onClick={() => setSlippageOpen(true)} className="inline-flex min-h-5 items-center rounded-[5px] border border-[#18c98e]/25 bg-[#18c98e]/[0.08] px-1.5 font-mono text-[10px] font-semibold text-[#78e99d]">{slippageMode === "auto" ? "Auto · " : ""}{slippage.toFixed(2)}%</button></dd></div>
      </dl>

      </div>
      <AnimatePresence>
        {slippageOpen ? (
          <motion.div className="absolute inset-0 z-40 overflow-hidden bg-[#0f1111]" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 14 }} transition={{ duration: 0.24, ease: [0.22, 0.78, 0.24, 1] }}>
            <section className="bb-ticket-surface h-full overflow-y-auto px-5 pb-5 [scrollbar-color:#303a36_transparent] [scrollbar-width:thin]" role="dialog" aria-label="Slippage settings" aria-modal="true">
              <header className="sticky top-0 z-10 -mx-5 flex h-[76px] items-center justify-between border-b border-white/[0.035] bg-[#0f1111] px-5 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-[linear-gradient(90deg,transparent,rgba(24,201,142,0.68)_48%,transparent)]">
                <div><div className="text-[9px] font-semibold uppercase tracking-[0.11em] text-[#68736e]">Quote controls</div><h3 className="mt-1 text-[17px] font-bold tracking-[-0.025em] text-[#edf2ef]">Slippage settings</h3></div>
                <button type="button" onClick={() => setSlippageOpen(false)} aria-label="Close slippage settings" className="grid h-8 w-8 place-items-center rounded-md text-[#68736f] transition hover:bg-white/[0.04] hover:text-[#cbd3d0]"><X className="h-4 w-4" /></button>
              </header>

              <div className="border-b border-[#242d2a] py-[18px]">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="grid min-w-0 gap-1"><strong className="text-[13.5px] font-semibold tracking-[-0.01em] text-[#f0f4f2]">Slippage tolerance</strong><span className="text-[11.5px] leading-[1.45] text-[#b0bab5]">Maximum accepted movement while executing.</span></div>
                  {slippageMode === "custom" ? (
                    <label className={cx("flex h-8 w-[100px] items-center gap-1 rounded-md border bg-[#18c98e]/10 px-[7px]", validCustomSlippage ? "border-[#18c98e]/50" : "border-[#ff3771]/55")}><input value={customSlippage} onChange={(event) => { const value = event.target.value.replace(/[^0-9.]/g, ""); const [whole = "", ...parts] = value.split("."); setCustomSlippage(parts.length ? `${whole || "0"}.${parts.join("")}` : whole); }} inputMode="decimal" autoFocus aria-label="Custom slippage percentage" className="min-w-0 flex-1 bg-transparent text-right font-mono text-[11px] font-semibold text-[#78e99d] outline-none" /><strong className="font-mono text-[11px] text-[#78e99d]">%</strong><Pencil className="h-3.5 w-3.5 text-[#78e99d]" /></label>
                  ) : (
                    <button type="button" onClick={() => { setCustomSlippage(slippage.toString()); setSlippageMode("custom"); }} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#18c98e]/20 bg-[#18c98e]/[0.07] px-2.5 font-mono text-[11px] font-semibold text-[#78e99d]"><span>{slippage.toFixed(2)}%</span><Pencil className="h-3.5 w-3.5" /></button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="Slippage tolerance">{SLIPPAGE_OPTIONS.map((option) => <button key={option.value} type="button" role="radio" aria-checked={slippageMode === option.value} onClick={() => setSlippageMode(option.value)} className={cx("h-[38px] rounded-[7px] border text-[11px] font-semibold transition", slippageMode === option.value ? "border-[#18c98e]/60 bg-[#18c98e]/10 text-[#78e99d]" : "border-[#2b3531] bg-[#171b1a] text-[#c3cbc8] hover:border-[#3c4a45]")}>{option.label}</button>)}</div>
              </div>

              <button type="button" disabled={slippageMode === "custom" && !validCustomSlippage} onClick={() => setSlippageOpen(false)} className="mt-[18px] flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#6be991] bg-[#18c98e] text-[12px] font-bold text-[#04140f] transition hover:bg-[#65e892] disabled:cursor-not-allowed disabled:border-[#25312d] disabled:bg-[#17221f] disabled:text-[#52615c]"><span>Apply settings</span><Check className="h-3.5 w-3.5" /></button>
            </section>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </aside>
  );
}

export default function TokenTerminalPage({ token }: { token: LbpTokenDetail }) {
  const [activityHeight, setActivityHeight] = React.useState(292);
  const [commentsFocus, setCommentsFocus] = React.useState(false);
  const lastExpandedHeight = React.useRef(292);
  const updateActivityHeight = (nextHeight: number) => {
    const resolved = Math.round(nextHeight);
    if (resolved > 42) lastExpandedHeight.current = resolved;
    setActivityHeight(resolved);
  };
  const toggleActivity = () => {
    setActivityHeight((current) => {
      if (current <= 42) return lastExpandedHeight.current;
      lastExpandedHeight.current = current;
      return 42;
    });
  };
  const restoreChartFromComments = () => {
    setCommentsFocus(false);
  };
  return (
    <main className="relative grid h-[calc(100vh-100px)] min-h-[680px] min-w-0 grid-cols-[minmax(0,1fr)_350px] overflow-hidden bg-[#090a0a] text-white max-[1040px]:h-auto max-[1040px]:min-h-0 max-[1040px]:grid-cols-1 max-[1040px]:overflow-visible">
      <style jsx global>{TERMINAL_CONTROL_CSS}</style>
      <div className="flex min-h-0 min-w-0 flex-col overflow-hidden max-[1040px]:overflow-visible">
        <InstrumentHeader token={token} />
        <PriceChart token={token} focusHidden={commentsFocus} />
        <ActivityPanel token={token} height={activityHeight} focusMode={commentsFocus} onHeightChange={updateActivityHeight} onToggleCollapsed={toggleActivity} onCommentsFocusChange={setCommentsFocus} />
      </div>
      <TradeTicket token={token} />
      <AnimatePresence>{commentsFocus ? <FloatingChart token={token} onRestore={restoreChartFromComments} /> : null}</AnimatePresence>
    </main>
  );
}
