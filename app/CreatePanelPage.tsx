"use client";

import Image from "next/image";
import {
  ArrowLeftRight,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Globe,
  Send,
  TriangleAlert,
  TrendingUp,
  Upload,
  X,
  Zap,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import CreateBackLink from "./create/CreateBackLink";
import FeeBuilderPanel from "./FeeBuilderPanel";
import {
  useWalletFundingStatus,
  type WalletFundingStatus,
} from "./useWalletFundingStatus";
import {
  getWalletFundingWarning,
  type WalletFundingWarningData,
} from "./walletFunding";

type Sec = "descriptions" | "dex" | "feeBuilder" | "initialBuy" | "lbp";
type RowItem = {
  key: Sec;
  label: string;
  value: ReactNode;
  ok: boolean;
  checkClass?: string;
  valueClass?: string;
  badge?: "Signature";
  onClick?: () => void;
};
type SliderProps = {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  suffix?: string;
  controls?: boolean;
  thumbClassName?: string;
  fmt?: (v: number) => string;
  disabled?: boolean;
};
type ExpandableProps = {
  title: string;
  description: string;
  summary: string;
  open: boolean;
  onClick: () => void;
  children: ReactNode;
  tag?: string;
};
type Plan = {
  name: string;
  price: string;
  perk: string;
  bar: string;
  border: string;
};
type DexOpt = { name: string; logo: string };
type ChainOpt = { short: string };
type SocialKind = "website" | "x" | "telegram" | "discord";
type SocialLink = { kind: SocialKind; href: string; label: string };
type DescriptionPreview =
  | false
  | { description: string; socialLinks: SocialLink[] };
type DistributionMode = "equal" | "random" | "custom";
type WalletDemoMode = "live" | "low" | "funded" | "gasless";
type DistributionEntry = { address: string; amount: number };
type CustomLine = {
  address: string;
  amountText: string;
  amount: number | null;
  valid: boolean;
};
type Toggles = {
  saleStartTime: boolean;
  feeConfiguration: boolean;
  singleBuyerLimit: boolean;
  delayTradeTime: boolean;
  softCapProtection: boolean;
  whitelistAccess: boolean;
};
type Sliders = {
  buyPoolCreatorFee: number;
  sellPoolCreatorFee: number;
  buyReferralFee: number;
  graduationFee: number;
  singleBuyerLimit: number;
  delayTradeTime: number;
  softCapProtection: number;
  whitelistBuyLimit: number;
};

const UI = {
  panel: "rounded-2xl border border-white/10 bg-[#101010]",
  input:
    "rounded-xl border border-white/12 bg-[#131313] ring-1 ring-inset ring-white/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]",
  focus:
    "outline-none transition placeholder:text-white/42 focus:border-white/22 focus:ring-white/10",
  shadow: "shadow-[0_14px_30px_rgba(0,0,0,0.28)]",
} as const;

const OPEN0: Record<Sec, boolean> = {
  descriptions: false,
  dex: false,
  feeBuilder: false,
  initialBuy: false,
  lbp: false,
};
const LBP_TOGGLES0: Toggles = {
  saleStartTime: false,
  feeConfiguration: false,
  singleBuyerLimit: false,
  delayTradeTime: false,
  softCapProtection: false,
  whitelistAccess: false,
};
const LBP_SLIDERS0: Sliders = {
  buyPoolCreatorFee: 0.5,
  sellPoolCreatorFee: 0.5,
  buyReferralFee: 0,
  graduationFee: 1,
  singleBuyerLimit: 1,
  delayTradeTime: 10,
  softCapProtection: 10,
  whitelistBuyLimit: 5,
};
const MAX_BUY = 80.4;
const BASE_MARKET_CAP = 9000;
const MAX_CUSTOM_MARKET_CAP = 10_000_000;
const STARTING_MC = "$9K";
const CAPS = [
  1000, 9000, 49000, 69000, 99000, 420000, 777000, 999000,
] as const;
const marketCapAtPosition = (position: number) => {
  const clamped = Math.min(CAPS.length - 1, Math.max(0, position));
  const lowerIndex = Math.floor(clamped);
  const upperIndex = Math.min(CAPS.length - 1, Math.ceil(clamped));
  const lower = CAPS[lowerIndex];
  const upper = CAPS[upperIndex];
  return Math.round(lower + (upper - lower) * (clamped - lowerIndex));
};
const marketCapPositionForValue = (value: number) => {
  const clamped = Math.min(CAPS[CAPS.length - 1], Math.max(CAPS[0], value));
  const upperIndex = CAPS.findIndex((cap) => cap >= clamped);
  if (upperIndex <= 0) return 0;
  const lowerIndex = upperIndex - 1;
  const lower = CAPS[lowerIndex];
  const upper = CAPS[upperIndex];
  return lowerIndex + (clamped - lower) / (upper - lower);
};
const formatMarketCapInput = (value: number) =>
  Math.round(value).toLocaleString("en-US");
const DEX_LIQUIDITY_STOPS = [2.5, 5, 7.5, 10, 12.5, 15, 17.5, 20] as const;
const DEX_LIQUIDITY_LEVELS = [
  { value: 2.5, label: "High volatility", color: "#FB7185" },
  { value: 5, label: "Volatile", color: "#FB923C" },
  { value: 7.5, label: "Balanced", color: "#FBBF24" },
  { value: 10, label: "Healthy", color: "#34D399" },
  { value: 12.5, label: "Deep", color: "#2DD4BF" },
  { value: 15, label: "Very deep", color: "#22D3EE" },
  { value: 17.5, label: "Thick", color: "#38BDF8" },
  { value: 20, label: "Very thick", color: "#60A5FA" },
] as const;
const CHAIN_ASSET_REFERENCE: Record<
  string,
  { symbol: string; usdPrice: number }
> = {
  BASE: { symbol: "ETH", usdPrice: 1740 },
  ROBINHOOD: { symbol: "ETH", usdPrice: 1740 },
  SOL: { symbol: "SOL", usdPrice: 150 },
  BSC: { symbol: "BNB", usdPrice: 600 },
  ETH: { symbol: "ETH", usdPrice: 1740 },
  MEGAETH: { symbol: "ETH", usdPrice: 1740 },
};
const WALLET_DEMO_OPTIONS: {
  value: WalletDemoMode;
  label: string;
  status?: WalletFundingStatus;
}[] = [
  { value: "live", label: "Live wallet" },
  {
    value: "low",
    label: "Low gas",
    status: {
      connected: true,
      address: "0xDemoLowGas",
      balanceEth: 0.0001,
      isCdpGaslessSmartWallet: false,
    },
  },
  {
    value: "funded",
    label: "Funded",
    status: {
      connected: true,
      address: "0xDemoFunded",
      balanceEth: 1,
      isCdpGaslessSmartWallet: false,
    },
  },
  {
    value: "gasless",
    label: "CDP gasless",
    status: {
      connected: true,
      address: "0xDemoCdpGasless",
      balanceEth: 0,
      isCdpGaslessSmartWallet: true,
    },
  },
];
const SUPPLY_OPTIONS = [
  { label: "100K", value: 100_000, display: "100,000" },
  { label: "1M", value: 1_000_000, display: "1,000,000" },
  { label: "21M", value: 21_000_000, display: "21,000,000" },
  { label: "100M", value: 100_000_000, display: "100,000,000" },
  { label: "420M", value: 420_000_000, display: "420,000,000" },
  { label: "1B", value: 1_000_000_000, display: "1,000,000,000" },
] as const;
const DEFAULT_SUPPLY_TEXT = SUPPLY_OPTIONS[3].display;
const FEE_STOPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
const BUY_STOPS = [1, 25, 50, 75] as const;
const FEE_SHIFT: Record<number, number> = {
  1: 7,
  2: 5,
  3: 3,
  4: 2,
  5: 0,
  6: 0,
  7: -2,
  8: -3,
  9: -5,
  10: -7,
};
const BUY_SHIFT: Record<number, number> = { 1: 7, 25: 2, 50: -2, 75: -7 };
const SOCIALS = [
  { kind: "website", label: "Website", placeholder: "https://..." },
  { kind: "x", label: "Twitter (X)", placeholder: "https://x.com/..." },
  { kind: "telegram", label: "Telegram", placeholder: "https://t.me/..." },
  { kind: "discord", label: "Discord", placeholder: "https://discord.gg/..." },
] as const;
const DEX: DexOpt[] = [
  { name: "Uniswap v4", logo: "/dex/uniswap.svg" },
  { name: "Uniswap v3", logo: "/dex/uniswap.svg" },
  { name: "PancakeSwap v4", logo: "/dex/pancakeswap.svg" },
  { name: "PancakeSwap v3", logo: "/dex/pancakeswap.svg" },
];
const CHAINS: { primary: ChainOpt[]; more: ChainOpt[] } = {
  primary: [{ short: "BASE" }, { short: "ROBINHOOD" }, { short: "SOL" }],
  more: [{ short: "BSC" }, { short: "ETH" }, { short: "MEGAETH" }],
};
const PLANS: Plan[] = [
  {
    name: "based",
    price: "Launch at no cost",
    perk: "Standard launch",
    bar: "bg-[#10B981]",
    border: "launch-plan-active launch-plan-based border-[#10B981]/70",
  },
  {
    name: "super based",
    price: "0.00018 ETH",
    perk: "Sale alert on socials",
    bar: "bg-fuchsia-500",
    border: "launch-plan-active launch-plan-super border-fuchsia-400/70",
  },
  {
    name: "ultra based",
    price: "0.00036 ETH",
    perk: "Sale alert & buy alerts on socials",
    bar: "bg-amber-400",
    border: "launch-plan-active launch-plan-ultra border-amber-300/75",
  },
];
const getDexOption = (name: string) =>
  DEX.find((x) => x.name === name) ?? DEX[0];
const CSS = `.range-slider{height:24px}.range-slider::-webkit-slider-runnable-track{height:8px;background:transparent}.range-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:14px;height:14px;border:2px solid #0A0A0A;background:#10B981;box-shadow:0 0 0 2px rgba(16,185,129,.18);margin-top:-1px;transform:rotate(45deg);transform-origin:center}.range-slider::-moz-range-track{height:8px;background:transparent}.range-slider::-moz-range-thumb{width:14px;height:14px;border:2px solid #0A0A0A;background:#10B981;box-shadow:0 0 0 2px rgba(16,185,129,.18);border-radius:0;transform:rotate(45deg);transform-origin:center}.diamond-thumb::-webkit-slider-thumb,.diamond-thumb::-moz-range-thumb{border-radius:0}.diamond-thumb-gold::-webkit-slider-thumb,.diamond-thumb-gold::-moz-range-thumb{background:#F5C451;box-shadow:0 0 0 2px rgba(245,196,81,.2)}.dark-scrollbar{scrollbar-width:thin;scrollbar-color:#2B2B31 #0C0C0E}.dark-scrollbar::-webkit-scrollbar{width:10px}.dark-scrollbar::-webkit-scrollbar-track{background:#0C0C0E;border-left:1px solid rgba(255,255,255,.04)}.dark-scrollbar::-webkit-scrollbar-thumb{background:#2B2B31;border-radius:999px;border:2px solid #0C0C0E}.dark-scrollbar::-webkit-scrollbar-thumb:hover{background:#3A3A42}.fee-builder-trigger{position:relative;overflow:hidden}.fee-builder-trigger::after{content:"";position:absolute;inset:0;background:linear-gradient(135deg,rgba(245,217,122,.075),rgba(255,255,255,.035) 42%,rgba(16,185,129,.035));opacity:0;transition:opacity .28s ease;pointer-events:none}.fee-builder-trigger:hover::after{opacity:1}.fee-builder-trigger>*{position:relative;z-index:1}.smooth-reveal{display:grid;grid-template-rows:0fr;opacity:0;transform:translateY(-6px);transition:grid-template-rows .3s cubic-bezier(.22,1,.36,1),opacity .2s ease,transform .3s cubic-bezier(.22,1,.36,1);will-change:grid-template-rows,opacity,transform}.smooth-reveal[data-open="true"]{grid-template-rows:1fr;opacity:1;transform:translateY(0)}.smooth-reveal-inner{min-height:0;overflow:hidden}.smooth-pop{animation:smoothPop .22s cubic-bezier(.22,1,.36,1) both;transform-origin:top right}.smooth-pop-left{transform-origin:top left}.smooth-modal-bg{animation:smoothFade .18s ease-out both}.smooth-modal-panel{animation:smoothModal .28s cubic-bezier(.22,1,.36,1) both}@keyframes smoothPop{from{opacity:0;transform:translateY(-7px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes smoothFade{from{opacity:0}to{opacity:1}}@keyframes smoothModal{from{opacity:0;transform:translateY(10px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes milestonePulse{0%,100%{box-shadow:0 0 8px rgba(16,185,129,.20)}50%{box-shadow:0 0 14px rgba(16,185,129,.34)}}@keyframes launchGradientFlow{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}@keyframes launchSheen{0%,12%{opacity:0;transform:translateX(-145%) skewX(-18deg)}34%{opacity:.34}62%,100%{opacity:0;transform:translateX(310%) skewX(-18deg)}}.launchButtonReady .launchButtonGradient{animation:launchGradientFlow 5.8s ease-in-out infinite}.launchButtonReady .launchButtonSheen{animation:launchSheen 3.25s cubic-bezier(.22,1,.36,1) infinite}@media (max-width:640px){.smooth-modal-bg{align-items:stretch!important;padding:0!important}.smooth-modal-panel{display:flex!important;height:100dvh!important;max-height:100dvh!important;flex-direction:column!important;border-left:0!important;border-right:0!important;border-radius:0!important}.smooth-modal-panel>div:first-child{padding:16px!important}.smooth-modal-panel>div:first-child>div>div:first-child{font-size:23px!important;line-height:1.1!important}.smooth-modal-panel>div:first-child>div>div:nth-child(2){white-space:normal!important;overflow:hidden!important;text-overflow:clip!important;display:-webkit-box!important;-webkit-line-clamp:2;-webkit-box-orient:vertical}.smooth-modal-panel>div:first-child button{height:34px!important;width:34px!important}.smooth-modal-panel>div:nth-child(2){flex:1 1 auto!important;overflow:auto!important;padding:16px!important}.smooth-modal-panel>div:nth-child(2)>div:first-child button{height:32px!important;border-radius:11px!important;font-size:12px!important}.smooth-modal-panel textarea{min-height:42dvh!important;border-radius:14px!important;padding:12px!important;font-size:13px!important;line-height:1.6!important}.smooth-modal-panel>div:last-child{padding:12px 16px calc(12px + env(safe-area-inset-bottom))!important;gap:8px!important;flex-wrap:wrap!important}.smooth-modal-panel>div:last-child button{height:36px!important;border-radius:12px!important;font-size:13px!important}.smooth-modal-panel>div:last-child button:last-child{order:3;flex:1 0 100%!important}}@media (prefers-reduced-motion:reduce){.smooth-reveal,.smooth-pop,.smooth-pop-left,.smooth-modal-bg,.smooth-modal-panel,.launchButtonReady .launchButtonGradient,.launchButtonReady .launchButtonSheen{animation:none;transition:none;transform:none}}`;
const WALLET_MODAL_CSS = `@media (max-width:900px){.wallet-modal-bg.wallet-modal-bg{align-items:stretch!important;background:#080809!important;padding:0!important;backdrop-filter:none!important}.wallet-modal-panel.wallet-modal-panel{display:flex!important;width:100vw!important;max-width:none!important;height:100dvh!important;max-height:100dvh!important;flex-direction:column!important;overflow:hidden!important;border:0!important;border-radius:0!important;background:#080809!important;box-shadow:none!important}.wallet-modal-panel .wallet-modal-header{border-bottom:1px solid rgba(255,255,255,.07)!important;padding:18px 16px 14px!important}.wallet-modal-panel .wallet-modal-title{font-size:24px!important;line-height:1.02!important;letter-spacing:-.03em}.wallet-modal-panel .wallet-modal-helper{white-space:normal!important;display:-webkit-box!important;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden!important;text-overflow:clip!important;font-size:11.5px!important;line-height:17px!important}.wallet-modal-panel .wallet-modal-close{height:34px!important;width:34px!important}.wallet-modal-panel .wallet-modal-body{display:flex!important;min-height:0!important;flex:1 1 auto!important;flex-direction:column!important;overflow:hidden!important;padding:14px 12px 8px!important}.wallet-modal-panel .wallet-modal-modes{margin-bottom:12px!important}.wallet-modal-panel .wallet-modal-modes button{height:31px!important;border-radius:10px!important;font-size:11px!important}.wallet-modal-panel .wallet-modal-textarea{min-height:0!important;flex:1 1 auto!important;border-radius:14px!important;padding:11px 12px!important;font-size:10px!important;line-height:18px!important;white-space:pre!important;overflow:auto!important}.wallet-modal-panel .wallet-modal-meta{margin-top:10px!important;gap:8px!important;font-size:11px!important}.wallet-modal-panel .wallet-modal-footer{border-top:1px solid rgba(255,255,255,.07)!important;background:#080809!important;padding:10px 12px calc(12px + env(safe-area-inset-bottom))!important;gap:8px!important;flex-wrap:wrap!important}.wallet-modal-panel .wallet-modal-footer button{height:34px!important;border-radius:12px!important;font-size:12px!important}.wallet-modal-panel .wallet-modal-footer .wallet-modal-primary{order:3;flex:1 0 100%!important}}`;

const compactCapFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const fmtCap = (v: number) => `$${compactCapFormatter.format(v)}`;
const fmtFeePct = (v: number) => {
  const rounded = Math.round(v * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)}%`;
};
const fmtEth = (value: number) => {
  const decimals = value < 0.001 ? 6 : 4;
  return value.toFixed(decimals).replace(/\.?0+$/, "");
};
const fmtAssetAmount = (value: number) =>
  Number(value.toFixed(value >= 0.01 ? 3 : 5)).toString();
const getEstimatedMarketCapValue = (
  initialBuy: number,
  baseMarketCap = BASE_MARKET_CAP,
) =>
  initialBuy > 0
    ? Math.round(baseMarketCap * (1 + Math.min(initialBuy, MAX_BUY) / MAX_BUY))
    : null;
const getEstimatedMarketCap = (initialBuy: number) => {
  const value = getEstimatedMarketCapValue(initialBuy);
  return value === null ? null : fmtCap(value);
};
const formatSupply = (value: number) =>
  Math.round(value).toLocaleString("en-US");
const parseSupply = (value: string) => {
  const clean = value.replace(/[^\d]/g, "");
  return clean ? Number(clean) : 0;
};
const compactTinyPrice = (explicit: string) => {
  const decimals = explicit.split(".")[1] ?? "";
  const zeroCount = decimals.match(/^0*/)?.[0].length ?? 0;
  const significant =
    decimals.slice(zeroCount, zeroCount + 3).replace(/0+$/, "") || "0";
  return `$0.0(${zeroCount})${significant}`;
};
const formatStartingPrice = (value: number, compact = false): ReactNode => {
  if (!Number.isFinite(value) || value <= 0) return "$0";
  const decimals = value >= 0.01 ? 4 : 12;
  const explicit = value.toFixed(decimals).replace(/\.?0+$/, "");
  if (!compact || explicit.length <= 11 || !explicit.startsWith("0.0"))
    return `$${explicit}`;
  return compactTinyPrice(explicit);
};
const chainBtn = (on: boolean) =>
  `inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${on ? "border-[#10B981] bg-[#10B981]/16 text-white hover:bg-[#0EA875]/18" : "border-white/10 bg-[#101010] text-white/68 hover:border-white/16 hover:bg-[#131313]"}`;
const liquidityMarker = (selected: boolean, done: boolean) =>
  selected
    ? "h-4 w-4 border border-[#10B981] bg-[#10B981] shadow-[0_0_0_4px_rgba(16,185,129,0.16)]"
    : done
      ? "h-2.5 w-2.5 border border-[#10B981]/80 bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.22)]"
      : "h-2.5 w-2.5 border border-white/20 bg-[#161616]";
const conic = (parts: { color: string; value: number }[]) => {
  let start = 0;
  return `conic-gradient(${parts
    .map(({ color, value }) => {
      const end = start + value;
      const out = `${color} ${start}% ${end}%`;
      start = end;
      return out;
    })
    .join(",")})`;
};
const roundTo = (value: number, decimals = 4) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};
const parseAddressLines = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(",")[0]?.trim() ?? "")
    .filter(Boolean);
const parseCustomLines = (value: string): CustomLine[] =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [addressPart, ...amountParts] = line.split(",");
      const address = (addressPart ?? "").trim();
      const amountText = amountParts.join(",").trim();
      if (!address || !amountText)
        return { address, amountText, amount: null, valid: false };
      const amount = Number(amountText);
      const valid = Number.isFinite(amount) && amount >= 0;
      return { address, amountText, amount: valid ? amount : null, valid };
    });
const withProtocol = (value: string) =>
  /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`;
const hostMatches = (host: string, domains: readonly string[]) =>
  domains.some((domain) => host === domain || host.endsWith(`.${domain}`));
const cleanUrl = (value: string, kind: SocialKind) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if ((kind === "x" || kind === "telegram") && trimmed.startsWith("@"))
    return kind === "x"
      ? `https://x.com/${trimmed.slice(1)}`
      : `https://t.me/${trimmed.slice(1)}`;
  if (kind === "discord" && /^[a-z0-9-]{3,64}$/i.test(trimmed))
    return `https://discord.gg/${trimmed}`;
  return withProtocol(trimmed);
};
const socialRule: Record<
  SocialKind,
  { domains: readonly string[]; hint: string; needsPath?: boolean }
> = {
  website: { domains: [], hint: "Enter a valid website URL." },
  x: {
    domains: ["x.com", "twitter.com"],
    hint: "Use an X/Twitter profile link, like x.com/name.",
    needsPath: true,
  },
  telegram: {
    domains: ["t.me", "telegram.me", "telegram.dog", "telegram.org"],
    hint: "Use a Telegram link, like t.me/channel.",
    needsPath: true,
  },
  discord: {
    domains: ["discord.gg", "discord.com", "discordapp.com"],
    hint: "Use a Discord invite, like discord.gg/code.",
    needsPath: true,
  },
};
const parseSocialLink = (
  kind: SocialKind,
  value: string,
): { kind: SocialKind; href: string; valid: boolean; reason: string } => {
  if (!value.trim()) return { kind, href: "", valid: true, reason: "" };
  const normalized = cleanUrl(value, kind);
  try {
    const url = new URL(normalized);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const path = url.pathname.replace(/\/+$/, "");
    if (url.protocol !== "http:" && url.protocol !== "https:")
      return {
        kind,
        href: "",
        valid: false,
        reason: "Use an http or https link.",
      };
    if (kind === "website") {
      const okHost =
        host.includes(".") && !host.startsWith(".") && !host.endsWith(".");
      return okHost
        ? { kind, href: url.href, valid: true, reason: "" }
        : { kind, href: "", valid: false, reason: socialRule.website.hint };
    }
    const rule = socialRule[kind];
    const okDomain = hostMatches(host, rule.domains);
    const okPath = !rule.needsPath || path.length > 1;
    return okDomain && okPath
      ? { kind, href: url.href, valid: true, reason: "" }
      : { kind, href: "", valid: false, reason: rule.hint };
  } catch {
    return { kind, href: "", valid: false, reason: socialRule[kind].hint };
  }
};
const allocateFromWeights = (
  addresses: string[],
  total: number,
  weights: number[],
) => {
  if (!addresses.length) return [] as DistributionEntry[];
  const weightSum = weights.reduce((sum, value) => sum + value, 0) || 1;
  const entries: DistributionEntry[] = [];
  let assigned = 0;
  addresses.forEach((address, index) => {
    const isLast = index === addresses.length - 1;
    const nextAmount = isLast
      ? roundTo(total - assigned)
      : roundTo((total * weights[index]) / weightSum);
    entries.push({ address, amount: nextAmount });
    assigned = roundTo(assigned + nextAmount);
  });
  return entries;
};
const buildEqualDistribution = (addresses: string[], total: number) =>
  allocateFromWeights(
    addresses,
    total,
    addresses.map(() => 1),
  );
const buildRandomDistribution = (addresses: string[], total: number) =>
  allocateFromWeights(
    addresses,
    total,
    addresses.map(() => Math.random() + 0.05),
  );

const Label = ({ children }: { children: ReactNode }) => (
  <label className="mb-2 block text-sm font-medium text-white">
    {children}
  </label>
);
const Pill = ({ children = "Optional" }: { children?: ReactNode }) => (
  <span className="rounded-full border border-white/10 bg-[#0E0E0F] px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-white/52">
    {children}
  </span>
);

const TinyLabel = ({ children }: { children: ReactNode }) => (
  <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/42">
    {children}
  </div>
);

function DateTimeRow({ value, helper }: { value: string; helper: string }) {
  return (
    <div
      className={`flex min-h-11 items-center justify-between gap-4 rounded-[14px] px-4 py-2.5 text-[13px] ${UI.input}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Calendar className="h-3.5 w-3.5 shrink-0 text-white/38" />
        <span className="font-medium tracking-[0.01em] text-white/88 tabular-nums">
          {value}
        </span>
      </div>
      <div className="shrink-0 text-[12px] font-normal tracking-[0.01em] text-white/48">
        {helper}
      </div>
    </div>
  );
}

function SliderValueRow({
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <Slider
      value={value}
      min={min}
      max={max}
      step={step}
      suffix={suffix}
      controls
      thumbClassName="diamond-thumb"
      onChange={onChange}
    />
  );
}

const DELAY_PRESETS = [
  { label: "1m", value: 60 },
  { label: "5m", value: 300 },
  { label: "15m", value: 900 },
  { label: "1h", value: 3600 },
  { label: "6h", value: 21600 },
  { label: "1d", value: 86400 },
  { label: "1w", value: 604800 },
  { label: "1mo", value: 2592000 },
] as const;
const MAX_DELAY_SECONDS = 2592000;
const DELAY_UNITS = [
  { label: "Seconds", value: "seconds", seconds: 1 },
  { label: "Minutes", value: "minutes", seconds: 60 },
  { label: "Hours", value: "hours", seconds: 3600 },
  { label: "Days", value: "days", seconds: 86400 },
  { label: "Weeks", value: "weeks", seconds: 604800 },
  { label: "Months", value: "months", seconds: 2592000 },
] as const;
type DelayUnit = (typeof DELAY_UNITS)[number]["value"];
const delayUnit = (unit: DelayUnit) =>
  DELAY_UNITS.find((item) => item.value === unit) ?? DELAY_UNITS[1];
const clampDelaySeconds = (seconds: number) =>
  Math.min(
    MAX_DELAY_SECONDS,
    Math.max(1, Math.round(Number.isFinite(seconds) ? seconds : 1)),
  );
const compactDelayUnit = (seconds: number): DelayUnit => {
  if (seconds >= 2592000 && seconds % 2592000 === 0) return "months";
  if (seconds >= 604800 && seconds % 604800 === 0) return "weeks";
  if (seconds >= 86400 && seconds % 86400 === 0) return "days";
  if (seconds >= 3600 && seconds % 3600 === 0) return "hours";
  if (seconds >= 60 && seconds % 60 === 0) return "minutes";
  return "seconds";
};
const durationText = (seconds: number) => {
  const boundedSeconds = clampDelaySeconds(seconds);
  const unit = delayUnit(compactDelayUnit(boundedSeconds));
  const amount = Math.max(1, Math.round(boundedSeconds / unit.seconds));
  const label =
    amount === 1
      ? unit.label.slice(0, -1).toLowerCase()
      : unit.label.toLowerCase();
  return `${amount} ${label}`;
};

function DelayTradeTimeControl({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [unit, setUnit] = useState<DelayUnit>(compactDelayUnit(value));
  const [unitOpen, setUnitOpen] = useState(false);
  const unitMenuRef = useRef<HTMLDivElement>(null);
  const unitMenuId = useId();
  const boundedValue = clampDelaySeconds(value);
  const selectedUnit = delayUnit(unit);
  const amount = Math.max(1, Math.round(boundedValue / selectedUnit.seconds));
  const maxAmount = Math.max(
    1,
    Math.floor(MAX_DELAY_SECONDS / selectedUnit.seconds),
  );
  const setDuration = (nextAmount: number, nextUnit = selectedUnit) =>
    onChange(clampDelaySeconds(nextAmount * nextUnit.seconds));

  useEffect(() => {
    if (value !== boundedValue) onChange(boundedValue);
  }, [boundedValue, onChange, value]);

  useEffect(() => {
    if (!unitOpen) return;
    const close = (event: PointerEvent) => {
      if (!unitMenuRef.current?.contains(event.target as Node))
        setUnitOpen(false);
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [unitOpen]);

  return (
    <div className="space-y-4">
      <div>
        <TinyLabel>Quick presets</TinyLabel>
        <div
          className="mt-2 grid w-full gap-1"
          style={{
            gridTemplateColumns: `repeat(${DELAY_PRESETS.length}, minmax(0, 1fr))`,
          }}
        >
          {DELAY_PRESETS.map((preset) => {
            const active = boundedValue === preset.value;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setUnit(compactDelayUnit(preset.value));
                  onChange(preset.value);
                }}
                className={`inline-flex h-6 min-w-0 items-center justify-center rounded-full border px-1.5 text-[9.5px] font-semibold leading-none transition-[border-color,background-color,color] ${active ? "border-[#10B981]/50 bg-[#10B981]/15 text-[#7CFFC0]" : "border-white/10 bg-white/[0.025] text-white/50 hover:border-[#10B981]/30 hover:bg-[#10B981]/[0.075] hover:text-[#D8FFEA]"}`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <TinyLabel>Custom duration</TinyLabel>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={maxAmount}
            value={amount}
            onChange={(event) => setDuration(Number(event.target.value || 1))}
            className="h-8 w-[58px] rounded-lg border border-white/10 bg-[#151515] px-2.5 text-[13px] text-white/86 outline-none transition focus:border-[#10B981]/38"
          />
          <div className="relative" ref={unitMenuRef}>
            <button
              type="button"
              aria-expanded={unitOpen}
              aria-controls={unitMenuId}
              onClick={() => setUnitOpen((open) => !open)}
              className="inline-flex h-8 min-w-[106px] items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#151515] px-3 text-[13px] font-medium text-white/74 outline-none transition hover:border-white/16 hover:bg-[#181818] focus:border-[#10B981]/38"
            >
              <span>{selectedUnit.label}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-white/42 transition ${unitOpen ? "rotate-180" : ""}`}
                strokeWidth={1.9}
              />
            </button>
            {unitOpen ? (
              <div
                id={unitMenuId}
                className="smooth-pop absolute left-0 top-full z-30 mt-1 w-full min-w-[126px] overflow-hidden rounded-xl border border-white/10 bg-[#141414] p-1 shadow-[0_16px_36px_rgba(0,0,0,0.36)]"
              >
                {DELAY_UNITS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      const nextUnit = delayUnit(option.value);
                      setUnit(nextUnit.value);
                      setDuration(
                        Math.min(
                          amount,
                          Math.floor(MAX_DELAY_SECONDS / nextUnit.seconds),
                        ),
                        nextUnit,
                      );
                      setUnitOpen(false);
                    }}
                    className={`block h-8 w-full rounded-lg px-2.5 text-left text-[12px] font-medium transition ${option.value === unit ? "bg-[#10B981]/14 text-[#7CFFC0]" : "text-white/58 hover:bg-white/[0.045] hover:text-white/82"}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="text-[13px] font-semibold text-[#10B981]">
        {durationText(boundedValue)} between buy and sell
      </div>
    </div>
  );
}

function SliderFieldRow({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <TinyLabel>{label}</TinyLabel>
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        suffix={suffix}
        controls
        thumbClassName="diamond-thumb"
        onChange={onChange}
      />
    </div>
  );
}

function SettingSurface({
  title,
  description,
  enabled,
  onToggle,
  children,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <>
      <style>{`.smooth-reveal[data-open="true"]>.smooth-reveal-inner{overflow:visible}`}</style>
      <div className="rounded-[18px] border border-white/10 bg-[#101010] shadow-[inset_0_1px_0_rgba(255,255,255,0.018)] transition-[border-color,background-color,box-shadow] duration-300">
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-start gap-3 px-4 py-4 text-left"
        >
          <span
            className={`mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full border p-0.5 transition ${enabled ? "border-[#10B981]/55 bg-[#10B981]/35" : "border-white/12 bg-white/[0.04]"}`}
            aria-hidden="true"
          >
            <span
              className={`h-[18px] w-[18px] rounded-full bg-white transition-transform duration-300 ${enabled ? "translate-x-5" : "translate-x-0"}`}
            />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white">{title}</div>
            <div className="mt-1 text-xs leading-5 text-white/52">
              {description}
            </div>
          </div>
        </button>
        <div
          className="smooth-reveal"
          data-open={enabled}
          aria-hidden={!enabled}
          inert={!enabled}
        >
          <div className="smooth-reveal-inner">
            <div className="px-4 pb-5 pt-0">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}

function LbpSettingsPanel({
  toggles,
  sliders,
  toggle,
  setSlider,
  whitelistText,
  whitelistCount,
  openWhitelist,
}: {
  toggles: Toggles;
  sliders: Sliders;
  toggle: (k: keyof Toggles) => void;
  setSlider: (k: keyof Sliders, v: number) => void;
  whitelistText: string;
  whitelistCount: number;
  openWhitelist: () => void;
}) {
  const s = (
    title: string,
    description: string,
    key: keyof Toggles,
    children: ReactNode,
  ) => (
    <SettingSurface
      title={title}
      description={description}
      enabled={toggles[key]}
      onToggle={() => toggle(key)}
    >
      {children}
    </SettingSurface>
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {s(
        "Sale Start Time",
        "Choose when the sale starts. Participants cannot buy before this time.",
        "saleStartTime",
        <div className="space-y-3">
          <TinyLabel>Sale Start Time</TinyLabel>
          <DateTimeRow value="03/11 17:43:00" helper="in 1 minute" />
        </div>,
      )}
      {s(
        "Fee Configuration",
        "Set custom buy, sell and referral fees for the pool.",
        "feeConfiguration",
        <div className="space-y-3">
          <SliderFieldRow
            label="Buy Pool Creator Fee"
            value={sliders.buyPoolCreatorFee}
            min={0}
            max={1}
            step={0.1}
            suffix="%"
            onChange={(v) => setSlider("buyPoolCreatorFee", v)}
          />
          <SliderFieldRow
            label="Sell Pool Creator Fee"
            value={sliders.sellPoolCreatorFee}
            min={0}
            max={1}
            step={0.1}
            suffix="%"
            onChange={(v) => setSlider("sellPoolCreatorFee", v)}
          />
          <SliderFieldRow
            label="Buy Referral Fee"
            value={sliders.buyReferralFee}
            min={0}
            max={1}
            step={0.1}
            suffix="%"
            onChange={(v) => setSlider("buyReferralFee", v)}
          />
          <SliderFieldRow
            label="Graduation Fee"
            value={sliders.graduationFee}
            min={0}
            max={2.5}
            step={0.1}
            suffix="%"
            onChange={(v) => setSlider("graduationFee", v)}
          />
        </div>,
      )}
      {s(
        "Single Buyer Limit",
        "Limit how much of the total supply a single buyer can purchase.",
        "singleBuyerLimit",
        <SliderValueRow
          value={sliders.singleBuyerLimit}
          min={0}
          max={10}
          step={0.1}
          suffix="%"
          onChange={(v) => setSlider("singleBuyerLimit", v)}
        />,
      )}
      {s(
        "Delay Trade Time",
        "Add a delay between buys and sells for a wallet to prevent instant dumping.",
        "delayTradeTime",
        <DelayTradeTimeControl
          value={sliders.delayTradeTime}
          onChange={(v) => setSlider("delayTradeTime", v)}
        />,
      )}
      {s(
        "Soft Cap Protection",
        "Set the minimum funding target for the sale.",
        "softCapProtection",
        <div className="space-y-4">
          <div>
            <TinyLabel>Soft Cap (0.062 ETH)</TinyLabel>
            <SliderValueRow
              value={sliders.softCapProtection}
              min={1}
              max={100}
              step={1}
              suffix="%"
              onChange={(v) => setSlider("softCapProtection", v)}
            />
          </div>
          <div>
            <TinyLabel>Sale End Time</TinyLabel>
            <DateTimeRow value="03/13 18:00:00" helper="in 2 days" />
          </div>
        </div>,
      )}
      {s(
        "Whitelist Access",
        "Allow only whitelisted addresses to participate in the sale.",
        "whitelistAccess",
        <div className="space-y-4">
          <div>
            <TinyLabel>Buy Limit Per Whitelisted User</TinyLabel>
            <SliderValueRow
              value={sliders.whitelistBuyLimit}
              min={0}
              max={100}
              step={0.1}
              suffix="%"
              onChange={(v) => setSlider("whitelistBuyLimit", v)}
            />
          </div>
          <div>
            <TinyLabel>Whitelist Addresses</TinyLabel>
            <button
              type="button"
              onClick={openWhitelist}
              className="inline-flex h-9 w-full items-center justify-center rounded-xl border border-white/10 bg-[#131313] px-3 text-[13px] font-medium text-white/78 transition hover:border-white/16 hover:bg-[#151515] hover:text-white"
            >
              {whitelistText.trim() ? "Edit Whitelists" : "+ Add Whitelists"}
            </button>
            <div className="mt-2 text-xs font-normal tracking-[0.01em] text-white/42">
              {whitelistText.trim()
                ? `${whitelistCount} addresses added`
                : "No addresses added yet"}
            </div>
          </div>
        </div>,
      )}
    </div>
  );
}

function Field({
  label,
  placeholder,
  compact,
  required,
  value,
  onChange,
  inputRef,
  invalid,
  helper,
}: {
  label: string;
  placeholder: string;
  compact?: boolean;
  required?: boolean;
  value?: string;
  onChange?: (v: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  invalid?: boolean;
  helper?: ReactNode;
}) {
  return (
    <div>
      <div
        className={`${compact ? "mb-1 flex min-h-[14px] items-center justify-between gap-2" : ""}`}
      >
        <label
          className={`flex items-center gap-2 font-medium ${compact ? "text-[11px] text-white/70" : "mb-2 text-sm text-white"}`}
        >
          <span>{label}</span>
          {required ? (
            <span className="inline-flex h-[17px] items-center rounded-full border border-white/10 bg-white/[0.035] px-1.5 text-[7px] font-semibold uppercase tracking-[0.14em] text-white/42">
              Required
            </span>
          ) : null}
        </label>
        {compact && helper ? (
          <div
            className={`max-w-[68%] truncate text-right text-[9.5px] leading-3 ${invalid ? "text-[#F6C56A]/82" : "text-white/38"}`}
          >
            {helper}
          </div>
        ) : null}
      </div>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        className={`w-full px-4 text-sm ${UI.input} ${UI.focus} ${compact ? "h-9" : "h-[34px]"} ${invalid ? "border-[#F6C56A]/45 bg-[#15120A] text-[#FFF4D6] focus:border-[#F6C56A]/65" : ""}`}
      />
      {!compact && helper ? (
        <div
          className={`mt-1 text-[10px] leading-4 ${invalid ? "text-[#F6C56A]/82" : "text-white/38"}`}
        >
          {helper}
        </div>
      ) : null}
    </div>
  );
}

function DexLogo({
  option,
  size = 16,
  className = "",
}: {
  option: DexOpt;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={option.logo}
        alt=""
        width={size}
        height={size}
        className="h-full w-full object-contain"
      />
    </span>
  );
}

function ChainIcon({ chain, size = 16 }: { chain: string; size?: number }) {
  const base =
    "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full";
  const src = (
    {
      BASE: "/networks/base.png",
      ROBINHOOD: "/networks/robinhood.png",
      SOL: "/networks/sol.png",
      BSC: "/networks/bsc.png",
      ETH: "/networks/ethereum.png",
    } as Record<string, string>
  )[chain];
  if (src)
    return (
      <span className={base} style={{ width: size, height: size }}>
        <Image
          src={src}
          alt=""
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
      </span>
    );
  return (
    <span
      className={`${base} bg-[#151515] text-[10px] font-bold text-white ring-1 ring-white/18`}
      style={{ width: size, height: size }}
    >
      M
    </span>
  );
}

function MiniGlowChart({ active }: { active: boolean }) {
  const id = useId().replace(/:/g, "");
  const fillId = `mini-fill-${id}`;
  const glowId = `mini-glow-${id}`;
  const wideGlowId = `mini-wide-glow-${id}`;
  const d = active
    ? "M 0 84 C 28 84, 46 84, 66 84 C 86 84, 102 76, 120 66 C 138 56, 156 54, 174 56 C 192 58, 210 54, 228 46 C 246 38, 264 34, 282 34 C 300 34, 318 36, 336 28 C 354 20, 372 14, 392 8 C 402 6, 412 5, 420 4"
    : "M 0 84 C 36 84, 62 84, 90 84 C 118 84, 146 82, 174 79 C 202 76, 228 78, 254 75 C 280 72, 306 74, 332 70 C 358 66, 384 63, 420 62";
  const fillTopY = active ? 4 : 62;
  const dotTop = active ? 1 : 42;

  return (
    <div className="relative -mx-3.5 -mb-3.5 mt-0 h-[58px] overflow-visible">
      <svg
        viewBox="0 0 420 104"
        className="h-full w-full overflow-visible"
        aria-hidden
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={fillId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(52,211,153,0.22)" />
            <stop offset="42%" stopColor="rgba(52,211,153,0.11)" />
            <stop offset="72%" stopColor="rgba(52,211,153,0.04)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </linearGradient>
          <filter id={glowId} x="-12%" y="-80%" width="124%" height="220%">
            <feGaussianBlur stdDeviation="2.8" />
          </filter>
          <filter id={wideGlowId} x="-16%" y="-110%" width="132%" height="260%">
            <feGaussianBlur stdDeviation="5.2" />
          </filter>
        </defs>
        <path
          d={`${d} L 420 ${fillTopY} L 420 104 L 0 104 Z`}
          fill={`url(#${fillId})`}
        />
        <path
          d={d}
          fill="none"
          stroke="rgba(52,211,153,0.10)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="11"
          filter={`url(#${wideGlowId})`}
        />
        <path
          d={d}
          fill="none"
          stroke="rgba(52,211,153,0.22)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="6"
          filter={`url(#${glowId})`}
        />
        <path
          d={d}
          fill="none"
          stroke="rgba(74,222,128,0.98)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.4"
          style={{ filter: "drop-shadow(0 0 4px rgba(52,211,153,0.22))" }}
        />
      </svg>
      <span
        className="pointer-events-none absolute right-0 block h-1 w-1 rounded-full bg-[#4ADE80]"
        style={{
          top: dotTop,
          filter: "drop-shadow(0 0 5px rgba(52,211,153,0.35))",
        }}
        aria-hidden
      />
    </div>
  );
}

function XBrandIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="currentColor"
    >
      <path d="M18.9 2H22l-6.77 7.74L23 22h-6.1l-4.78-6.8L6.17 22H3.05l7.24-8.28L1 2h6.25l4.32 6.15L18.9 2Zm-1.07 18h1.69L6.33 3.9H4.52L17.83 20Z" />
    </svg>
  );
}

function DiscordMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="currentColor"
    >
      <path d="M19.54 5.33A16.9 16.9 0 0 0 15.39 4c-.18.32-.39.75-.53 1.1a15.75 15.75 0 0 0-4.72 0c-.14-.35-.36-.78-.54-1.1a16.8 16.8 0 0 0-4.15 1.33C2.83 9.21 2.12 13 2.47 16.74A16.7 16.7 0 0 0 7.55 19.3c.41-.56.77-1.15 1.08-1.77-.59-.22-1.15-.49-1.68-.8.14-.1.28-.21.41-.32a12 12 0 0 0 10.28 0l.41.32c-.53.31-1.09.58-1.68.8.31.62.67 1.21 1.08 1.77a16.65 16.65 0 0 0 5.08-2.56c.42-4.34-.72-8.09-2.99-11.41ZM9.25 14.43c-.99 0-1.8-.9-1.8-2.01s.79-2.01 1.8-2.01c1 0 1.82.9 1.8 2.01 0 1.11-.8 2.01-1.8 2.01Zm5.5 0c-.99 0-1.8-.9-1.8-2.01s.79-2.01 1.8-2.01c1 0 1.82.9 1.8 2.01 0 1.11-.8 2.01-1.8 2.01Z" />
    </svg>
  );
}

function SocialIcon({ kind }: { kind: SocialKind }) {
  if (kind === "x") return <XBrandIcon className="h-[11px] w-[11px]" />;
  if (kind === "telegram") return <Send className="h-[11px] w-[11px]" />;
  if (kind === "discord") return <DiscordMark className="h-[12px] w-[12px]" />;
  return <Globe className="h-[11px] w-[11px]" />;
}

function SocialLinksPreview({ links }: { links: SocialLink[] }) {
  if (!links.length) return null;
  const primary = links.find((link) => link.kind === "x") ?? links[0];
  const secondary = links.filter((link) => link !== primary);
  return (
    <div className="relative inline-flex min-w-[62px] items-center justify-end pl-[44px] text-white/45">
      {secondary.length > 0 ? (
        <span className="pointer-events-none absolute right-[18px] top-1/2 inline-flex -translate-y-1/2 translate-x-1 items-center gap-1.5 whitespace-nowrap opacity-0 transition-all duration-200 ease-[cubic-bezier(.22,1,.36,1)] group-hover/card:pointer-events-auto group-hover/card:translate-x-0 group-hover/card:opacity-100">
          {secondary.map((link) => (
            <a
              key={`${link.kind}-${link.href}`}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              aria-label={link.label}
              title={link.label}
              onClick={(event) => event.stopPropagation()}
              className="inline-flex h-4 w-4 shrink-0 items-center justify-center transition-colors duration-200 hover:text-white"
            >
              <SocialIcon kind={link.kind} />
            </a>
          ))}
        </span>
      ) : null}
      <a
        href={primary.href}
        target="_blank"
        rel="noreferrer"
        aria-label={primary.label}
        title={primary.label}
        onClick={(event) => event.stopPropagation()}
        className="relative z-10 inline-flex h-4 w-4 items-center justify-center transition-colors duration-200 hover:text-white"
      >
        <SocialIcon kind={primary.kind} />
      </a>
    </div>
  );
}

function MomentumPreviewCard({
  name,
  symbol,
  chain,
  logo,
  description,
  socialLinks,
}: {
  name: string;
  symbol: string;
  chain: string;
  logo: boolean;
  description: string;
  socialLinks: SocialLink[];
}) {
  const title = name.trim() || "Token Name";
  const ticker = symbol.trim().replace(/^\$/, "").toUpperCase() || "SYMBOL";
  const avatarText =
    (ticker || title)
      .replace(/[^a-z0-9]/gi, "")
      .slice(0, 2)
      .toUpperCase() || "T";
  const hasDescription = Boolean(description.trim());
  const body = hasDescription
    ? description.trim()
    : "Add a short description to bring your launch card to life.";
  const openDescription = () => {
    if (hasDescription) return;
    window.dispatchEvent(new CustomEvent("bb-open-description"));
  };

  return (
    <div
      className={`relative w-full ${hasDescription ? "" : "cursor-pointer"}`}
      onClick={hasDescription ? undefined : openDescription}
      onKeyDown={(event) => {
        if (hasDescription || (event.key !== "Enter" && event.key !== " "))
          return;
        event.preventDefault();
        openDescription();
      }}
      role={hasDescription ? undefined : "button"}
      tabIndex={hasDescription ? undefined : 0}
      title={hasDescription ? undefined : "Add description"}
    >
      <div className="group/card relative flex h-[178px] flex-col overflow-visible rounded-[22px] border border-white/[0.08] bg-[#0F1111] p-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-[border-color,box-shadow,background-color] duration-200 hover:border-white/[0.115] hover:shadow-[0_13px_32px_rgba(0,0,0,0.40)]">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-200 group-hover/card:opacity-100"
          style={{
            background:
              "radial-gradient(120% 90% at 18% 14%, rgba(255,255,255,0.048) 0%, rgba(255,255,255,0.020) 30%, rgba(255,255,255,0.00) 64%)",
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-200 group-hover/card:opacity-100"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}
        />
        <div className="absolute right-3.5 top-2.5">
          <span className="inline-flex rounded-full border border-white/[0.06] px-[7px] py-[1px] text-[10px] font-semibold tabular-nums tracking-[0.01em] text-[#34D399]/90">
            ATH 789%
          </span>
        </div>

        <div className="relative grid grid-cols-[44px_1fr] items-center gap-2.5">
          <div className="relative h-10 w-10 overflow-visible">
            <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-white/[0.08] bg-[#141717]">
              {logo ? (
                <span className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_32%_24%,rgba(245,217,122,0.34),transparent_30%),linear-gradient(135deg,rgba(16,185,129,0.36),rgba(20,23,23,0.92)_62%)] text-sm font-semibold tracking-wide text-white/92">
                  {avatarText}
                </span>
              ) : (
                <Upload className="h-4 w-4 text-white/42" />
              )}
            </div>
            <span
              className="absolute left-1/2 top-1/2 z-10 grid h-[17px] w-[17px] place-items-center rounded-full border border-white/[0.08] bg-[#141717]"
              title={chain}
              aria-label={chain}
              style={{
                transform: "translate(-50%, -50%) translate(13px, 13px)",
              }}
            >
              <ChainIcon chain={chain} size={13} />
            </span>
          </div>

          <div className="min-w-0 leading-tight">
            <div className="flex min-w-0 items-center gap-1.5 pr-16">
              <h3 className="truncate text-[16px] font-bold leading-[1.1] text-white/92">
                {title}
              </h3>
              <span className="shrink-0 text-[11px] leading-none text-white/62">
                {ticker}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[12px] text-white/62">
              <span className="inline-flex items-center gap-1">
                <Zap className="h-[11px] w-[11px] shrink-0 opacity-80" /> Token
              </span>
              <span className="text-white/45">by</span>
              <span className="text-white/92">you</span>
              <span className="text-white/45">on</span>
              <span className="text-white/92">b/{chain.toLowerCase()}</span>
            </div>
          </div>
        </div>

        <div className="relative mt-2 min-h-[32px]">
          <p className="overflow-hidden text-[12.5px] leading-4 text-white/62 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
            {body}
          </p>
        </div>

        <MiniGlowChart active />

        <div className="relative mt-auto flex translate-y-1.5 items-center justify-between text-[11px] text-white/45">
          <div className="flex gap-3">
            <div className="flex items-center gap-1">
              <ArrowLeftRight className="h-3 w-3" /> 1.1K
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> $310K
            </div>
          </div>
          <SocialLinksPreview links={socialLinks} />
        </div>
      </div>
    </div>
  );
}

function Row({ item, onJump }: { item: RowItem; onJump: (k: Sec) => void }) {
  const signature = item.badge === "Signature";
  const valueMin = item.label === "DEX" ? "132px" : signature ? "68px" : "88px";
  return (
    <button
      type="button"
      onClick={item.onClick ?? (() => onJump(item.key))}
      className="grid w-full items-center gap-2 rounded-xl border border-white/10 bg-[#101010] px-3 py-2.5 text-left transition hover:border-white/16 hover:bg-[#131313]"
      style={{
        gridTemplateColumns: `minmax(0,1fr) minmax(${valueMin},auto) 14px`,
      }}
    >
      <div className="flex min-w-0 items-center gap-2 text-sm text-white/80">
        {item.ok ? (
          <Check
            className={`h-3.5 w-3.5 shrink-0 ${item.checkClass ?? "text-[#10B981]"}`}
          />
        ) : (
          <span
            className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.12em] ${signature ? "border-[#F5D97A]/18 bg-[#F5D97A]/[0.055] text-[#F5D97A]/78" : "border-white/10 bg-white/[0.045] text-white/40"}`}
          >
            {signature ? "Signature" : "Optional"}
          </span>
        )}
        <span className="min-w-0 truncate">{item.label}</span>
      </div>
      <div
        className={`flex min-w-0 items-center justify-end overflow-hidden text-right text-xs tabular-nums leading-none ${item.valueClass ?? (item.ok ? "text-white/72" : "text-white/52")}`}
      >
        {item.value}
      </div>
      <ChevronRight className="h-3.5 w-3.5 justify-self-end text-white/24" />
    </button>
  );
}

function Slider({
  value,
  min,
  max,
  step,
  onChange,
  suffix = "",
  controls = true,
  thumbClassName = "",
  fmt,
  disabled = false,
}: SliderProps) {
  const pct = ((value - min) / (max - min || 1)) * 100;
  const display = fmt
    ? fmt(value)
    : Number.isInteger(value)
      ? `${value}`
      : value.toFixed(1);
  const clamp = (n: number) =>
    Math.min(max, Math.max(min, Number(n.toFixed(3))));
  return (
    <div
      className={`flex w-full items-center ${controls ? "gap-3 pt-1" : "pt-0"}`}
    >
      <div className="relative flex-1">
        <div
          className={`pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full ${disabled ? "bg-white/[0.06]" : "bg-white/10"}`}
        />
        <div
          className={`pointer-events-none absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full ${disabled ? "bg-white/[0.16]" : "bg-[#10B981]"}`}
          style={{ width: `${pct}%` }}
        />
        <input
          disabled={disabled}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`range-slider relative z-10 h-6 w-full appearance-none bg-transparent ${disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer"} ${thumbClassName}`}
        />
      </div>
      {controls ? (
        <div
          className={`flex items-center overflow-hidden rounded-lg ${UI.input} ${disabled ? "opacity-45" : ""}`}
        >
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(clamp(value - step))}
            className="px-2 text-white/55 hover:text-white disabled:cursor-not-allowed disabled:hover:text-white/55"
          >
            ▾
          </button>
          <div
            className={`min-w-[68px] px-2 text-center text-sm font-medium ${disabled ? "text-white/38" : "text-[#10B981]"}`}
          >
            {display}
            {suffix}
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(clamp(value + step))}
            className="px-2 text-white/55 hover:text-white disabled:cursor-not-allowed disabled:hover:text-white/55"
          >
            ▴
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Expandable({
  title,
  description,
  summary,
  open,
  onClick,
  children,
  tag,
}: ExpandableProps) {
  const featured = title === "Fee Builder";
  const wrap = featured
    ? "relative overflow-visible rounded-[22px] border border-[#F5D97A]/24 bg-[#101010] shadow-[0_18px_40px_rgba(0,0,0,0.30),0_0_0_1px_rgba(245,196,81,0.055)]"
    : "overflow-visible rounded-[22px] border border-white/10 bg-[#101010] shadow-[0_14px_30px_rgba(0,0,0,0.26)] hover:border-white/14";

  return (
    <div
      className={`${wrap} min-w-0 max-w-full transition-[border-color,box-shadow,background-color] duration-300 ease-out`}
    >
      {featured ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[22px]">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#F5D97A] via-[#F7D46B] to-[#10B981]" />
        </div>
      ) : null}
      <button
        type="button"
        aria-expanded={open}
        onClick={onClick}
        className={`${featured ? "fee-builder-trigger focus-visible:ring-[#F5D97A]/28" : "focus-visible:ring-white/14"} group flex w-full items-center justify-between gap-4 rounded-[22px] px-4 py-4 text-left outline-none transition focus-visible:ring-1 focus-visible:ring-inset sm:px-6 sm:py-5`}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="text-[15px] font-semibold text-white">{title}</div>
            {featured ? (
              <span className="inline-flex h-5 items-center rounded-lg border border-[#F5D97A]/18 bg-[#F5D97A]/[0.055] px-2 text-[8.5px] font-semibold uppercase tracking-[0.16em] text-[#F5D97A]/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
                Signature
              </span>
            ) : tag ? (
              <Pill>{tag}</Pill>
            ) : null}
          </div>
          <div
            className={`mt-1 text-[12px] leading-5 ${featured ? "text-white/68" : "text-white/62"}`}
          >
            {description}
          </div>
          <div
            className={`overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-out md:hidden ${open ? "max-h-0 -translate-y-1 opacity-0" : "max-h-8 translate-y-0 opacity-100"}`}
          >
            <div className="mt-1.5 text-xs font-medium text-white/68">
              {summary}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 pl-3">
          {featured ? (
            <div
              className={`flex h-7 w-[74px] items-center overflow-hidden rounded-xl border bg-[#19191A] text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition-[border-color,background-color,box-shadow] duration-300 ${open ? "border-[#F5D97A]/26" : "border-white/12 group-hover:border-white/18"}`}
            >
              <div
                className={`flex h-full flex-1 items-center justify-center text-[8.5px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 ${open ? "text-[#F5D97A]/72" : "text-white/46"}`}
              >
                {open ? "On" : "Off"}
              </div>
              <div
                className={`relative flex h-7 w-7 shrink-0 items-center justify-center transition-colors duration-300 ${open ? "text-[#F5D97A]/68" : "text-white/42 group-hover:text-white/62"}`}
              >
                <span
                  className="pointer-events-none absolute left-0 top-1/2 h-5 w-px -translate-y-1/2"
                  style={{ background: "rgba(255,255,255,0.12)" }}
                  aria-hidden
                />
                <span
                  className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                >
                  {"\u25BE"}
                </span>
              </div>
            </div>
          ) : (
            <>
              <div
                className={`hidden max-w-[260px] whitespace-nowrap text-right text-xs font-medium text-white/68 transition-[opacity,transform] duration-300 ease-out md:block ${open ? "translate-x-1 opacity-0" : "translate-x-0 opacity-100"}`}
              >
                {summary}
              </div>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/55 transition duration-300 ${open ? "rotate-180" : "group-hover:border-white/14 group-hover:text-white/75"}`}
              >
                {"\u25BE"}
              </div>
            </>
          )}
        </div>
      </button>
      <div
        className="smooth-reveal min-w-0 max-w-full"
        data-open={open}
        aria-hidden={!open}
        inert={!open}
      >
        <div className="smooth-reveal-inner w-full min-w-0 max-w-full">
          <div
            className={`min-w-0 max-w-full border-t px-2.5 py-4 sm:px-5 sm:py-5 md:px-6 ${featured ? "border-[#F5D97A]/12 bg-transparent" : "border-white/8"}`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function DescriptionSocialsPanel({
  descriptionText,
  setDescriptionText,
  socialValues,
  setSocialValue,
}: {
  descriptionText: string;
  setDescriptionText: (value: string) => void;
  socialValues: string[];
  setSocialValue: (index: number, value: string) => void;
}) {
  return (
    <div className="grid gap-x-6 gap-y-5 lg:grid-cols-[1.15fr_0.85fr]">
      <div>
        <Label>Description</Label>
        <div
          className={`flex min-h-[280px] flex-col overflow-hidden ${UI.input} ${UI.shadow}`}
        >
          <div className="flex items-center gap-4 border-b border-white/10 px-4 py-2 text-sm text-white/70">
            <span className="font-semibold">B</span>
            <span className="italic">I</span>
            <span className="underline">U</span>
          </div>
          <textarea
            value={descriptionText}
            onChange={(e) => setDescriptionText(e.target.value)}
            placeholder="Tell your story..."
            className="h-[238px] min-h-[180px] resize-y bg-transparent px-4 py-3 text-sm outline-none placeholder:text-white/45"
            maxLength={789}
          />
        </div>
        <div className="mt-2 text-right text-xs text-white/45">
          {descriptionText.length} / 789 characters
        </div>
      </div>
      <div>
        <div className="mb-2 text-sm font-medium">Social Media</div>
        <div
          className={`h-[280px] p-3 ${UI.panel} ${UI.shadow} ring-1 ring-inset ring-white/5`}
        >
          <div className="grid gap-1.5">
            {SOCIALS.map((item, index) => {
              const result = parseSocialLink(
                item.kind,
                socialValues[index] ?? "",
              );
              const touched = Boolean((socialValues[index] ?? "").trim());
              return (
                <Field
                  key={item.kind}
                  label={item.label}
                  placeholder={item.placeholder}
                  compact
                  value={socialValues[index] ?? ""}
                  onChange={(value) => setSocialValue(index, value)}
                  invalid={touched && !result.valid}
                  helper={touched && !result.valid ? result.reason : undefined}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function DexSettingsPanel({
  dexFee,
  setDexFee,
  marketCap,
  setMarketCap,
  dexLiquidity,
  setDexLiquidity,
  dexSel,
  setDexSel,
  dexOpen,
  setDexOpen,
  supplyText,
  setSupplyText,
  chain,
  graduationFee,
  onOpenFeeBuilder,
}: {
  dexFee: number;
  setDexFee: (v: number) => void;
  marketCap: number;
  setMarketCap: (v: number) => void;
  dexLiquidity: number;
  setDexLiquidity: (v: number) => void;
  dexSel: string;
  setDexSel: (v: string) => void;
  dexOpen: boolean;
  setDexOpen: (v: boolean) => void;
  supplyText: string;
  setSupplyText: (v: string) => void;
  chain: string;
  graduationFee: number;
  onOpenFeeBuilder: () => void;
}) {
  const [burnTokenFees, setBurnTokenFees] = useState(false);
  const [capEditing, setCapEditing] = useState(false);
  const [capDraft, setCapDraft] = useState(() =>
    formatMarketCapInput(marketCap),
  );
  const supplyValue = parseSupply(supplyText);
  const cap = marketCap;
  const capPosition = marketCapPositionForValue(cap);
  const capProgress = (capPosition / (CAPS.length - 1)) * 100;
  const liquidityIndex = Math.max(
    0,
    DEX_LIQUIDITY_STOPS.indexOf(
      dexLiquidity as (typeof DEX_LIQUIDITY_STOPS)[number],
    ),
  );
  const liquidityProgress =
    liquidityIndex === DEX_LIQUIDITY_STOPS.length - 1
      ? 100
      : ((liquidityIndex + 0.5) / DEX_LIQUIDITY_STOPS.length) * 100;
  const liquidityShare = dexLiquidity / 100;
  const liquidityTokenAmount = supplyValue * liquidityShare;
  const liquidityMarketValue = cap * liquidityShare;
  const chainAsset = CHAIN_ASSET_REFERENCE[chain] ?? CHAIN_ASSET_REFERENCE.BASE;
  const liquidityAssetAmount = liquidityMarketValue / chainAsset.usdPrice;
  const graduationFeeAmount =
    liquidityAssetAmount * (Math.max(0, graduationFee) / 100);
  const liquidityLevel =
    DEX_LIQUIDITY_LEVELS.find((level) => level.value === dexLiquidity) ??
    DEX_LIQUIDITY_LEVELS[3];
  const selected = getDexOption(dexSel);
  const groups = [
    {
      label: "Uniswap",
      items: DEX.filter((x) => x.name.startsWith("Uniswap")),
    },
    {
      label: "PancakeSwap",
      items: DEX.filter((x) => x.name.startsWith("PancakeSwap")),
    },
  ];
  const startingPrice =
    liquidityTokenAmount > 0 ? liquidityMarketValue / liquidityTokenAmount : 0;
  const priceNode = formatStartingPrice(startingPrice);
  const isV3Dex = /\bv3\b/i.test(dexSel);
  const updateCapPosition = (position: number) => {
    const nextPosition = Math.min(CAPS.length - 1, Math.max(0, position));
    const nextMarketCap = marketCapAtPosition(nextPosition);
    setMarketCap(nextMarketCap);
    setCapDraft(formatMarketCapInput(nextMarketCap));
  };
  const updateCapDraft = (value: string) => {
    const digits = value.replace(/[^\d]/g, "");
    if (!digits) {
      setCapDraft("");
      return;
    }
    const normalized = digits.replace(/^0+(?=\d)/, "");
    const numericValue = Number(normalized);
    if (!Number.isFinite(numericValue) || numericValue <= 0) return;
    const cappedValue = Math.min(numericValue, MAX_CUSTOM_MARKET_CAP);
    setCapDraft(formatMarketCapInput(cappedValue));
    setMarketCap(cappedValue);
  };
  const finishCapEditing = () => {
    setCapDraft(formatMarketCapInput(cap));
    setCapEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr] lg:items-start">
        <div className={`relative ${dexOpen ? "z-30" : "z-10"}`}>
          <div className="mb-2 h-5">
            <Label>Select DEX</Label>
          </div>
          <button
            type="button"
            onClick={() => setDexOpen(!dexOpen)}
            className={`flex h-11 w-full items-center justify-between px-4 text-sm text-white/80 ${UI.input} hover:border-white/16`}
          >
            <span className="inline-flex items-center gap-3">
              <DexLogo option={selected} size={18} />
              <span>{dexSel}</span>
            </span>
            <span
              className={`text-white/45 transition ${dexOpen ? "rotate-180" : ""}`}
            >
              {"\u25BE"}
            </span>
          </button>
          {dexOpen ? (
            <div className="smooth-pop smooth-pop-left absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-white/10 bg-[#101010] shadow-[0_18px_50px_rgba(0,0,0,0.38)]">
              {groups.map((group) => (
                <div key={group.label}>
                  <div className="px-4 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/38">
                    {group.label}
                  </div>
                  {group.items.map((option) => (
                    <button
                      key={option.name}
                      type="button"
                      onClick={() => {
                        setDexSel(option.name);
                        if (/\bv3\b/i.test(option.name))
                          setBurnTokenFees(false);
                        setDexOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition ${option.name === dexSel ? "bg-white/[0.07] text-white" : "text-white/72 hover:bg-[#131313] hover:text-white"}`}
                    >
                      <span className="inline-flex items-center gap-3">
                        <DexLogo option={option} size={18} />
                        <span>{option.name}</span>
                      </span>
                      {option.name === dexSel ? (
                        <span className="text-white/70">{"\u2713"}</span>
                      ) : null}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div>
          <div className="mb-2 flex h-5 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <div
                className={`text-sm font-medium transition ${isV3Dex ? "text-white/42" : "text-white"}`}
              >
                DEX Tier
              </div>
              <div className="group relative inline-flex items-center">
                <button
                  type="button"
                  aria-label="DEX tier helper"
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/12 bg-white/[0.035] text-[10px] font-semibold leading-none text-white/44 transition hover:border-white/18 hover:text-white/78 focus:border-white/22 focus:text-white focus:outline-none"
                >
                  i
                </button>
                <div
                  role="tooltip"
                  className="pointer-events-none absolute left-0 top-[calc(100%-2px)] z-40 w-[min(330px,calc(100vw-32px))] pt-2 text-left opacity-0 transition duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 max-sm:fixed max-sm:inset-x-4 max-sm:bottom-[11rem] max-sm:top-auto max-sm:w-auto max-sm:pt-0"
                >
                  <div className="rounded-xl border border-white/10 bg-[#101011] px-3.5 py-3 text-[12px] font-normal leading-5 tracking-[0.01em] text-white/68 shadow-[0_18px_42px_rgba(0,0,0,0.38)] ring-1 ring-inset ring-white/5">
                    <div>
                      Native DEX fees are generated by trading. Users are not
                      charged a transaction tax. Fees are split 50% in ETH and
                      50% in the token.
                    </div>
                    <div className="mt-2">
                      Turn Burn on to burn the token portion when fees are
                      collected. By default, you receive both portions.
                    </div>
                    <div className="mt-3 text-white/58">
                      Do not confuse the DEX Tier with{" "}
                      <button
                        type="button"
                        onClick={onOpenFeeBuilder}
                        className="font-medium text-[#EFD48A]/95 underline decoration-transparent underline-offset-4 transition hover:text-[#F5D97A] hover:decoration-[#F5D97A]/70"
                      >
                        Fee Builder
                      </button>{" "}
                      fees.
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                disabled={isV3Dex}
                aria-disabled={isV3Dex}
                aria-pressed={!isV3Dex && burnTokenFees}
                onClick={() => {
                  if (!isV3Dex) setBurnTokenFees((value) => !value);
                }}
                className={`inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full border py-0 pl-2 pr-1.5 text-[11px] font-medium tracking-[0.01em] transition ${isV3Dex ? "cursor-not-allowed border-white/8 bg-white/[0.015] text-white/28" : burnTokenFees ? "border-[#F5C451]/34 bg-[#F5C451]/10 text-[#F5D97A]" : "border-white/10 bg-white/[0.025] text-white/46 hover:border-white/16 hover:text-white/72"}`}
              >
                <span>Burn</span>
                <span
                  className={`relative h-3 w-5 rounded-full transition ${isV3Dex ? "bg-white/[0.05]" : burnTokenFees ? "bg-[#F5C451]/35" : "bg-white/12"}`}
                >
                  <span
                    className={`absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full transition ${burnTokenFees && !isV3Dex ? "left-[11px] bg-[#F5D97A]" : isV3Dex ? "left-0.5 bg-white/28" : "left-0.5 bg-white/62"}`}
                  />
                </span>
              </button>
            </div>
            <span
              className={`text-lg font-semibold transition ${isV3Dex ? "text-white/38" : "text-white"}`}
            >
              {dexFee}%
            </span>
          </div>
          <div
            className={`flex h-11 items-center transition ${isV3Dex ? "opacity-55" : ""}`}
          >
            <div className="w-full">
              <Slider
                value={dexFee}
                min={1}
                max={10}
                step={1}
                suffix="%"
                controls={false}
                thumbClassName="diamond-thumb"
                fmt={(v) => `${Math.round(v)}`}
                disabled={isV3Dex}
                onChange={setDexFee}
              />
            </div>
          </div>
          <div className="relative mt-0.5 h-4 text-[11px] font-medium">
            {FEE_STOPS.map((n) => (
              <button
                key={n}
                type="button"
                disabled={isV3Dex}
                onClick={() => setDexFee(n)}
                className={`absolute top-0 min-w-[26px] -translate-x-1/2 transition ${isV3Dex ? "cursor-not-allowed text-white/20" : dexFee === n ? "text-[#F5D97A]" : "text-white/40 hover:text-white"}`}
                style={{
                  left: `calc(${((n - 1) / 9) * 100}% + ${FEE_SHIFT[n]}px)`,
                }}
              >
                {n}%
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="pt-1">
        <div className="mb-3 flex items-end justify-between gap-4 max-sm:grid max-sm:grid-cols-[minmax(0,1fr)_auto] max-sm:items-start max-sm:gap-x-3 max-sm:gap-y-1">
          <div className="max-sm:contents">
            <div className="text-sm font-semibold text-white max-sm:col-start-1 max-sm:row-start-1">
              Market Cap
            </div>
            <div className="mt-1 text-xs text-white/55 max-sm:col-span-2 max-sm:row-start-2 max-sm:mt-0 max-sm:max-w-[28rem] max-sm:leading-[1.45]">
              Set the market cap target your token must reach before it
              graduates to the selected DEX.
            </div>
          </div>
          <div className="flex h-11 min-w-[132px] shrink-0 items-center justify-end text-right max-sm:col-start-2 max-sm:row-start-1">
            {capEditing ? (
              <label className="flex h-11 w-[132px] items-center rounded-xl border border-[#10B981]/30 bg-[#10B981]/[0.055] px-3 text-[#34D399] shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] transition focus-within:border-[#34D399]/55 focus-within:bg-[#10B981]/[0.08]">
                <span className="mr-1 text-sm font-medium">$</span>
                <input
                  autoFocus
                  aria-label="Custom market cap"
                  inputMode="numeric"
                  value={capDraft}
                  onChange={(event) => updateCapDraft(event.target.value)}
                  onBlur={finishCapEditing}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") event.currentTarget.blur();
                    if (event.key === "Escape") {
                      setCapDraft(formatMarketCapInput(cap));
                      event.currentTarget.blur();
                    }
                  }}
                  className="min-w-0 flex-1 bg-transparent text-right text-sm font-semibold text-[#34D399] outline-none"
                />
              </label>
            ) : (
              <button
                type="button"
                aria-label="Edit market cap"
                onClick={() => {
                  setCapDraft(formatMarketCapInput(cap));
                  setCapEditing(true);
                }}
                className="group inline-flex h-11 flex-col items-end justify-center rounded-lg px-1 transition hover:bg-white/[0.025]"
              >
                <span className="text-lg font-semibold text-[#10B981] transition group-hover:text-[#34D399]">
                  {fmtCap(cap)}
                </span>
                <span className="text-[11px] text-[#10B981]/72">
                  {fmtAssetAmount(liquidityAssetAmount)} {chainAsset.symbol}
                </span>
              </button>
            )}
          </div>
        </div>
        <div className="relative w-full min-w-0 pt-1">
          <div className="relative mx-2">
            <div className="pointer-events-none absolute inset-x-0 top-[9px] h-2 rounded-full bg-zinc-800" />
            <div
              className="pointer-events-none absolute left-0 top-[9px] h-2 max-w-full rounded-full bg-gradient-to-r from-[#34D399] to-[#86EFAC]"
              style={{ width: `${capProgress}%` }}
            />
            <div className="relative z-10 h-8 w-full">
              {CAPS.map((step, index) => (
                <div
                  key={step}
                  className="absolute top-0 h-6 w-0"
                  style={{ left: `${(index / (CAPS.length - 1)) * 100}%` }}
                >
                  <button
                    type="button"
                    onClick={() => updateCapPosition(index)}
                    aria-label={`Set market cap to ${fmtCap(step)}`}
                    className="absolute left-1/2 top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center transition hover:opacity-90"
                  >
                    <span
                      className={`h-2.5 w-2.5 rotate-45 rounded-[1px] ${index < capPosition ? "border border-[#10B981]/80 bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.25)] [animation:milestonePulse_1.8s_ease-in-out_infinite]" : "border border-[rgb(30_30_30)] bg-[#121212]"}`}
                    />
                  </button>
                </div>
              ))}
            </div>
            <div
              className="pointer-events-none absolute top-[5px] z-20 -translate-x-1/2"
              style={{ left: `${capProgress}%` }}
            >
              <div className="h-4 w-4 rotate-45 border border-[#F5C451] bg-[#F5C451] shadow-[0_0_0_4px_rgba(245,196,81,0.18)]" />
            </div>
            <input
              type="range"
              min={0}
              max={CAPS.length - 1}
              step={0.01}
              value={capPosition}
              onChange={(e) => updateCapPosition(Number(e.target.value))}
              aria-label="Market cap slider"
              className="absolute inset-x-0 top-0 z-30 h-10 w-full cursor-pointer appearance-none bg-transparent opacity-0"
            />
          </div>
          <div className="relative mt-2 h-4 w-full">
            {CAPS.map((step, index) => {
              const edgeClass =
                index === 0
                  ? "left-0 text-left"
                  : index === CAPS.length - 1
                    ? "right-0 text-right"
                    : "left-1/2 -translate-x-1/2 text-center";
              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => updateCapPosition(index)}
                  className={`absolute top-0 px-0.5 text-[11px] font-medium tabular-nums transition focus:outline-none max-sm:text-[9px] max-sm:tracking-[-0.035em] ${edgeClass} ${cap === step ? "text-[#34D399]" : "text-white/40 hover:text-white"}`}
                  style={
                    index > 0 && index < CAPS.length - 1
                      ? { left: `${(index / (CAPS.length - 1)) * 100}%` }
                      : undefined
                  }
                >
                  <span className="sm:hidden">{fmtCap(step).slice(1)}</span>
                  <span className="max-sm:hidden">{fmtCap(step)}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div
          data-testid="dex-liquidity-control"
          className="mt-5 border-t border-white/[0.07] pt-4"
        >
          <div className="mb-3 flex items-end justify-between gap-4 max-sm:grid max-sm:grid-cols-[minmax(0,1fr)_auto] max-sm:items-start max-sm:gap-x-3 max-sm:gap-y-1">
            <div className="max-sm:contents">
              <div className="flex items-center gap-2 max-sm:col-start-1 max-sm:row-start-1">
                <div className="text-sm font-semibold text-white">
                  DEX Liquidity
                </div>
                <div className="group relative inline-flex items-center">
                  <button
                    type="button"
                    aria-label="DEX liquidity helper"
                    className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/12 bg-white/[0.035] text-[10px] font-semibold leading-none text-white/44 transition hover:border-white/18 hover:text-white/78 focus:border-white/22 focus:text-white focus:outline-none"
                  >
                    i
                  </button>
                  <div
                    role="tooltip"
                    className="pointer-events-none absolute left-0 top-[calc(100%-2px)] z-40 w-[min(340px,calc(100vw-32px))] pt-2 text-left opacity-0 transition duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 max-sm:fixed max-sm:inset-x-4 max-sm:bottom-[11rem] max-sm:top-auto max-sm:w-auto max-sm:pt-0"
                  >
                    <div className="rounded-xl border border-white/10 bg-[#101011] px-3.5 py-3 text-[12px] font-normal leading-5 tracking-[0.01em] text-white/68 shadow-[0_18px_42px_rgba(0,0,0,0.38)] ring-1 ring-inset ring-white/5">
                      Lower liquidity amplifies price movement in either
                      direction, allowing faster upside but increasing
                      volatility and downside risk. It often suits
                      meme-focused launches. Higher liquidity reduces price
                      impact for steadier trading, which may better suit
                      utility and long-term projects.
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-1 text-xs text-white/55 max-sm:col-span-2 max-sm:row-start-2 max-sm:mt-0 max-sm:leading-[1.45]">
                Choose the share of token supply committed to DEX liquidity.
              </div>
            </div>
            <div className="shrink-0 text-right max-sm:col-start-2 max-sm:row-start-1">
              <div className="text-lg font-semibold text-[#10B981]">
                {dexLiquidity}%
              </div>
              <div className="mt-0.5 flex flex-wrap items-center justify-end gap-x-2 gap-y-0.5 text-[11px] sm:text-xs">
                <span
                  className="font-medium"
                  style={{ color: liquidityLevel.color }}
                >
                  {liquidityLevel.label}
                </span>
                <span className="text-white/42 max-sm:hidden">
                  {formatSupply(liquidityTokenAmount)} tokens
                </span>
              </div>
            </div>
          </div>
          <div className="relative pt-1">
            <div className="pointer-events-none absolute inset-x-0 top-[15px] h-2 rounded-full bg-white/10" />
            <div
              className="pointer-events-none absolute left-0 top-[15px] h-2 rounded-full bg-gradient-to-r from-[#10B981] to-[#6EE7B7]"
              style={{ width: `${liquidityProgress}%` }}
            />
            <div
              className="pointer-events-none absolute inset-x-0 top-[11px] z-20 grid"
              style={{
                gridTemplateColumns: `repeat(${DEX_LIQUIDITY_STOPS.length},minmax(0,1fr))`,
              }}
            >
              {DEX_LIQUIDITY_STOPS.map((step, index) => (
                <div key={step} className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setDexLiquidity(step)}
                    aria-label={`Set DEX liquidity to ${step}%`}
                  >
                    <span
                      className={`block rotate-45 ${liquidityMarker(index === liquidityIndex, index < liquidityIndex)}`}
                    />
                  </button>
                </div>
              ))}
            </div>
            <input
              aria-label="DEX liquidity percentage"
              type="range"
              min={0}
              max={DEX_LIQUIDITY_STOPS.length - 1}
              step={1}
              value={liquidityIndex}
              onChange={(e) =>
                setDexLiquidity(
                  DEX_LIQUIDITY_STOPS[Number(e.target.value)] ?? 10,
                )
              }
              className="range-slider relative z-10 h-8 w-full cursor-pointer appearance-none bg-transparent opacity-0"
            />
            <div
              className="mt-5 grid text-[11px] font-medium text-white/40"
              style={{
                gridTemplateColumns: `repeat(${DEX_LIQUIDITY_STOPS.length},minmax(0,1fr))`,
              }}
            >
              {DEX_LIQUIDITY_STOPS.map((step, index) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => setDexLiquidity(step)}
                  className={`text-center transition focus:outline-none max-sm:text-[9px] max-sm:tracking-[-0.035em] ${liquidityIndex === index ? "text-[#34D399]" : "text-white/40 hover:text-white"}`}
                >
                  {step}%
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 grid gap-5 border-t border-white/[0.07] pt-4 md:grid-cols-[minmax(0,1.05fr)_minmax(180px,0.65fr)] md:items-start">
          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/38">
                Total Supply
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SUPPLY_OPTIONS.map((option) => {
                  const active = supplyValue === option.value;
                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setSupplyText(option.display)}
                      className={`inline-flex h-6 items-center justify-center rounded-full border px-2.5 text-[10px] font-semibold tracking-[0.01em] transition ${active ? "border-[#10B981]/55 bg-[#10B981]/16 text-[#BFF7D7]" : "border-white/10 bg-white/[0.025] text-white/45 hover:border-white/16 hover:bg-white/[0.04] hover:text-white/74"}`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <input
              inputMode="numeric"
              value={supplyText}
              onChange={(e) =>
                setSupplyText(e.target.value.replace(/[^\d,]/g, ""))
              }
              onBlur={() =>
                supplyValue > 0
                  ? setSupplyText(formatSupply(supplyValue))
                  : setSupplyText("")
              }
              className={`h-10 w-full rounded-xl px-3.5 text-sm font-medium tracking-[0.01em] text-white/88 outline-none placeholder:text-white/35 ${UI.input}`}
              placeholder="Custom supply"
            />
          </div>
          <div className="md:text-right">
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/38">
              Token starting price
            </div>
            <div className="mt-2 flex min-h-10 flex-col md:items-end">
              <div className="text-[19px] font-semibold leading-none tracking-[-0.03em] text-[#10B981]">
                {priceNode}
              </div>
              <div className="mt-1.5 text-[10.5px] leading-4 text-white/36">
                You will receive {fmtAssetAmount(graduationFeeAmount)}{" "}
                {chainAsset.symbol} upon graduation.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddressModal({
  open,
  value,
  mode,
  total,
  error,
  onChange,
  onModeChange,
  onClose,
  onSave,
}: {
  open: boolean;
  value: string;
  mode: DistributionMode;
  total: number;
  error: string;
  onChange: (next: string) => void;
  onModeChange: (next: DistributionMode) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const addressCount = useMemo(() => parseAddressLines(value).length, [value]);
  if (!open) return null;
  const helperText =
    mode === "equal"
      ? "Split the selected amount evenly across all wallets."
      : mode === "random"
        ? "Randomize wallet amounts while keeping the same total distribution."
        : "Use one wallet per line in the format address, amount. At least 2 wallets are required.";
  const placeholder =
    mode === "custom"
      ? "0x742d35Cc6634C0532925a3b844Bc454e4438f44e, 25\n0x8ba1f109551bD432803012645Ac136ddd64DBA72, 35.4\n0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48, 20"
      : "0x742d35Cc6634C0532925a3b844Bc454e4438f44e\n0x8ba1f109551bD432803012645Ac136ddd64DBA72\n0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

  const modal = (
    <div className="wallet-modal-bg smooth-modal-bg fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-[3px]">
      <style>{WALLET_MODAL_CSS}</style>
      <div className="wallet-modal-panel smooth-modal-panel w-full max-w-[690px] overflow-hidden rounded-[22px] border border-white/10 bg-[#080809] shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
        <div className="wallet-modal-header flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div className="min-w-0 flex-1">
            <div className="wallet-modal-title text-[31px] font-semibold text-white sm:text-[32px]">
              Multi-Wallet Distributor
            </div>
            <div className="wallet-modal-helper mt-1 truncate text-[12px] leading-5 text-white/52">
              {helperText}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="wallet-modal-close mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#101113] text-white/55 transition hover:border-white/16 hover:bg-[#141518] hover:text-white"
            aria-label="Close"
          >
            <X className="h-[14px] w-[14px]" />
          </button>
        </div>
        <div className="wallet-modal-body px-6 py-6">
          <div className="wallet-modal-modes mb-4 flex flex-wrap items-center gap-2">
            {(
              [
                ["equal", "Equal"],
                ["random", "Random"],
                ["custom", "Custom"],
              ] as const
            ).map(([option, label]) => {
              const active = mode === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onModeChange(option)}
                  className={`inline-flex h-9 items-center justify-center rounded-xl border px-3 text-[13px] font-medium transition ${active ? "border-[#10B981]/40 bg-[#10B981]/12 text-[#D9FBEA]" : "border-white/10 bg-[#111112] text-white/66 hover:border-white/16 hover:text-white"}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <textarea
            wrap="off"
            spellCheck={false}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="wallet-modal-textarea dark-scrollbar min-h-[224px] w-full resize-none overflow-auto rounded-[16px] border border-white/12 bg-[#0C0C0E] px-4 py-4 font-mono text-[13px] leading-6 text-white outline-none placeholder:text-white/28 focus:border-white/16"
          />
          <div className="wallet-modal-meta mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-white/42">
            <div>
              {mode === "custom"
                ? "Address, amount on each line"
                : "One address per line"}
            </div>
            <div className="flex items-center gap-4">
              <div>
                {addressCount} {addressCount === 1 ? "wallet" : "wallets"}
              </div>
              <div>Total {`${roundTo(total)}%`}</div>
            </div>
          </div>
          {error ? (
            <div className="mt-3 rounded-xl border border-[#FF6B81]/22 bg-[#FF6B81]/10 px-3 py-2 text-[12px] text-[#FFC2CC]">
              {error}
            </div>
          ) : null}
        </div>
        <div className="wallet-modal-footer flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex h-10 items-center justify-center rounded-xl px-3 text-[15px] font-medium text-white/55 transition hover:text-white"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-xl px-3 text-[15px] font-medium text-white/72 transition hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="wallet-modal-primary inline-flex h-10 items-center justify-center rounded-xl border border-[#10B981]/60 bg-[#063e2e] px-4 text-[15px] font-semibold text-[#EAFBF4] transition hover:border-[#10B981]/80 hover:bg-[#08543d]"
          >
            Apply Distribution
          </button>
        </div>
      </div>
    </div>
  );
  return typeof document === "undefined"
    ? null
    : createPortal(modal, document.body);
}

function WhitelistModal({
  open,
  value,
  onChange,
  onClose,
  onSave,
}: {
  open: boolean;
  value: string;
  onChange: (next: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const addressCount = useMemo(() => parseAddressLines(value).length, [value]);
  if (!open) return null;

  const modal = (
    <div className="wallet-modal-bg smooth-modal-bg fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-[3px]">
      <style>{WALLET_MODAL_CSS}</style>
      <div className="wallet-modal-panel smooth-modal-panel w-full max-w-[690px] overflow-hidden rounded-[22px] border border-white/10 bg-[#080809] shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
        <div className="wallet-modal-header flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div className="min-w-0 flex-1">
            <div className="wallet-modal-title text-[31px] font-semibold text-white sm:text-[32px]">
              Whitelist Addresses
            </div>
            <div className="wallet-modal-helper mt-1 truncate text-[12px] leading-5 text-white/52">
              Add one wallet address per line for whitelist access.
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="wallet-modal-close mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#101113] text-white/55 transition hover:border-white/16 hover:bg-[#141518] hover:text-white"
            aria-label="Close"
          >
            <X className="h-[14px] w-[14px]" />
          </button>
        </div>
        <div className="wallet-modal-body px-6 py-6">
          <textarea
            wrap="off"
            spellCheck={false}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0x742d35Cc6634C0532925a3b844Bc454e4438f44e&#10;0x8ba1f109551bD432803012645Ac136ddd64DBA72"
            className="wallet-modal-textarea dark-scrollbar min-h-[224px] w-full resize-none overflow-auto rounded-[16px] border border-white/12 bg-[#0C0C0E] px-4 py-4 font-mono text-[13px] leading-6 text-white outline-none placeholder:text-white/28 focus:border-white/16"
          />
          <div className="wallet-modal-meta mt-4 flex items-center justify-between gap-3 text-sm text-white/42">
            <div>One address per line</div>
            <div>
              {addressCount} {addressCount === 1 ? "address" : "addresses"}
            </div>
          </div>
        </div>
        <div className="wallet-modal-footer flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex h-10 items-center justify-center rounded-xl px-3 text-[15px] font-medium text-white/55 transition hover:text-white"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-xl px-3 text-[15px] font-medium text-white/72 transition hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="wallet-modal-primary inline-flex h-10 items-center justify-center rounded-xl border border-[#10B981]/60 bg-[#063e2e] px-4 text-[15px] font-semibold text-[#EAFBF4] transition hover:border-[#10B981]/80 hover:bg-[#08543d]"
          >
            Save Whitelist
          </button>
        </div>
      </div>
    </div>
  );
  return typeof document === "undefined"
    ? null
    : createPortal(modal, document.body);
}

function InitialBuyPanel({
  initialBuy,
  setInitialBuy,
  preset,
  setPreset,
}: {
  initialBuy: number;
  setInitialBuy: (v: number) => void;
  preset: number | null;
  setPreset: (v: number | null) => void;
}) {
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [draftAddresses, setDraftAddresses] = useState("");
  const [distributionMode, setDistributionMode] =
    useState<DistributionMode>("equal");
  const [savedDistribution, setSavedDistribution] = useState<
    DistributionEntry[]
  >([]);
  const [distributionError, setDistributionError] = useState("");
  const [percentDraft, setPercentDraftRaw] = useState(initialBuy.toFixed(1));
  const buyNow = Math.min(initialBuy, MAX_BUY);
  const lp = 19.6;
  const lbp = Number(Math.max(0, 100 - buyNow - lp).toFixed(1));
  const instant = buyNow >= MAX_BUY;
  const estimatedMarketCap = getEstimatedMarketCap(buyNow);
  const legend = [
    { label: "Creator", value: buyNow, color: "#10B981" },
    { label: "Uniswap", value: lp, color: "#3B82F6" },
    { label: "LBP", value: lbp, color: "#A855F7" },
  ];
  const distributionLabel =
    savedDistribution.length > 0
      ? `${savedDistribution.length} ${savedDistribution.length === 1 ? "wallet" : "wallets"}`
      : "Creator";
  const isDistributionDisabled = buyNow <= 0;

  const setPercentDraft = (value: string) => {
    setPercentDraftRaw(value);
    const nextValue = Number(value);
    if (!value.trim() || !Number.isFinite(nextValue)) return;
    setInitialBuy(Math.min(MAX_BUY, Math.max(0, Number(nextValue.toFixed(1)))));
    setPreset(null);
  };
  const setBuyAmount = (value: number, nextPreset: number | null = null) => {
    const nextValue = Math.min(MAX_BUY, Math.max(0, Number(value.toFixed(1))));
    setInitialBuy(nextValue);
    setPercentDraftRaw(nextValue.toFixed(1));
    setPreset(nextPreset);
  };
  const commitPercentDraft = () => {
    const nextValue = Number(percentDraft);
    if (!Number.isFinite(nextValue)) {
      setPercentDraftRaw(buyNow.toFixed(1));
      return;
    }
    setBuyAmount(nextValue, null);
  };
  const handleSaveDistribution = () => {
    const total = roundTo(buyNow);
    if (distributionMode === "custom") {
      const customLines = parseCustomLines(draftAddresses);
      if (customLines.length < 2) {
        setDistributionError("Custom mode requires at least 2 wallets.");
        return;
      }
      if (customLines.some((line) => !line.valid || line.amount === null)) {
        setDistributionError(
          "Each custom line must be in the format address, amount.",
        );
        return;
      }
      const customEntries = customLines.map((line) => ({
        address: line.address,
        amount: roundTo(line.amount ?? 0),
      }));
      const customTotal = roundTo(
        customEntries.reduce((sum, line) => sum + line.amount, 0),
      );
      if (Math.abs(customTotal - total) > 0.0001) {
        setDistributionError(`Custom amounts must add up to ${total}%.`);
        return;
      }
      setSavedDistribution(customEntries);
      setDistributionError("");
      setIsAddressModalOpen(false);
      return;
    }
    const addresses = parseAddressLines(draftAddresses);
    if (!addresses.length) {
      setDistributionError("Add at least 1 wallet address.");
      return;
    }
    setSavedDistribution(
      distributionMode === "equal"
        ? buildEqualDistribution(addresses, total)
        : buildRandomDistribution(addresses, total),
    );
    setDistributionError("");
    setIsAddressModalOpen(false);
  };
  const openDistributionModal = () => {
    const nextDraft =
      savedDistribution.length > 0
        ? savedDistribution
            .map((entry) =>
              distributionMode === "custom"
                ? `${entry.address}, ${entry.amount}`
                : entry.address,
            )
            .join("\n")
        : "";
    setDraftAddresses(nextDraft);
    setDistributionError("");
    setIsAddressModalOpen(true);
  };

  return (
    <>
      <div className="initialBuyPanel px-1 py-1">
        <div className="initialBuyIntroBlock mb-5 max-w-3xl">
          <div className="initialBuyTitle text-lg font-semibold text-white">
            Initial Buy
          </div>
          <div className="initialBuyIntro mt-1 text-sm leading-6 text-white/62">
            Secure a portion of supply at launch. Buying the full available
            amount skips the bonding curve and graduates instantly.
          </div>
        </div>
        <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)] xl:items-end">
          <div className="order-2 mx-auto w-full max-w-[260px] pt-0 xl:order-1 xl:mx-0 xl:self-end">
            <div className="relative mx-auto h-[176px] w-[176px]">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: conic([
                    { color: "#10B981", value: buyNow },
                    { color: "#3B82F6", value: lp },
                    { color: "#A855F7", value: lbp },
                  ]),
                }}
              />
              <div className="absolute inset-[42px] flex items-center justify-center rounded-full bg-[#0A0A0A] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
                <div className="text-center">
                  <div className="text-[22px] font-semibold leading-none text-white">
                    1B
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/36">
                    Supply
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-1.5 xl:mt-7">
              {legend.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-white/10 bg-[#101010] px-1.5 py-1.5 text-center"
                >
                  <div className="mb-0.5 flex items-center justify-center gap-1.5">
                    <span
                      className="block h-2 w-2 shrink-0 rounded-full"
                      style={{ background: item.color }}
                    />
                    <span className="text-[9px] uppercase tracking-[0.14em] text-white/45">
                      {item.label}
                    </span>
                  </div>
                  <div className="text-[12px] font-semibold text-white">
                    {item.value.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 min-w-0 space-y-4 xl:order-2">
            <div className="initialBuyPercentRow flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div className="initialBuyPercentCopy">
                <div className="initialBuyPercentTitle text-xs font-medium uppercase tracking-[0.14em] text-white/58">
                  Percentage of total supply to buy
                </div>
                <div className="initialBuyPercentHelp mt-1 text-xs text-white/42">
                  Max initial buy size is 80.4% of total supply.
                </div>
              </div>
              <label className="initialBuyPercentLabel flex items-center gap-1 rounded-xl border border-transparent px-2 py-1 text-[28px] font-semibold leading-none text-white transition focus-within:border-[#10B981]/40 focus-within:bg-white/[0.03] hover:bg-white/[0.02]">
                <input
                  type="number"
                  min={0}
                  max={MAX_BUY}
                  step={0.1}
                  value={percentDraft}
                  onChange={(e) => setPercentDraft(e.target.value)}
                  onBlur={commitPercentDraft}
                  onFocus={(e) => e.currentTarget.select()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                    if (e.key === "Escape") {
                      setPercentDraft(buyNow.toFixed(1));
                      e.currentTarget.blur();
                    }
                  }}
                  className="w-[82px] bg-transparent text-right outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  aria-label="Initial buy percentage"
                />
                <span>%</span>
              </label>
            </div>
            <div className="initialBuySliderGrid grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
              <div className="relative pt-1">
                <Slider
                  value={initialBuy}
                  min={0}
                  max={MAX_BUY}
                  step={0.1}
                  suffix="%"
                  controls={false}
                  thumbClassName={
                    preset !== null
                      ? "diamond-thumb diamond-thumb-gold"
                      : "diamond-thumb"
                  }
                  onChange={(n) => setBuyAmount(n, null)}
                />
                {BUY_STOPS.map((s) => (
                  <div
                    key={s}
                    className="pointer-events-auto absolute top-[10px] -translate-x-1/2"
                    style={{ left: `${(s / MAX_BUY) * 100}%` }}
                  >
                    <button
                      type="button"
                      onClick={() => setBuyAmount(s, s)}
                      className={`buyStopLabel absolute top-[18px] min-w-[34px] -translate-x-1/2 text-center text-[11px] font-medium transition hover:text-white ${preset === s ? "text-[#F5D97A]" : "text-white/40"}`}
                      style={{ left: `calc(50% + ${BUY_SHIFT[s]}px)` }}
                    >
                      {s}%
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setBuyAmount(MAX_BUY, null)}
                className={`initialBuyDexButton flex h-11 w-11 items-center justify-center rounded-xl border transition ${instant ? "border-[#F5D97A]/55 bg-[#F5D97A]/16 text-[#F5D97A]" : "border-white/10 bg-[#101010] text-white/66 hover:border-white/16 hover:bg-[#131313] hover:text-white"}`}
              >
                <DexLogo option={DEX[0]} size={18} />
              </button>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#101010] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.018)]">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-white/45">
                    Token purchased
                  </div>
                  <div className="text-right text-sm font-semibold text-white">
                    281,983,146.345
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-white/45">
                    Buy size
                  </div>
                  <div className="text-right text-sm font-semibold text-[#86EFAC]">
                    0.072 ETH
                  </div>
                </div>
                <div
                  className={`overflow-hidden transition-[max-height,opacity,transform] duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${estimatedMarketCap ? "max-h-6 translate-y-0 opacity-100" : "max-h-0 -translate-y-1 opacity-0"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/45">
                      Estimated Market Cap
                    </div>
                    <div className="text-right text-sm font-semibold text-white/86">
                      {estimatedMarketCap ?? STARTING_MC}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-col items-stretch justify-between gap-2 border-t border-white/8 pt-3 sm:flex-row sm:items-center sm:gap-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/36">
                    Distribution To:
                  </div>
                  <div
                    className={`text-[10px] uppercase tracking-[0.18em] ${savedDistribution.length > 0 ? "text-white/72" : "text-white/62"}`}
                  >
                    {distributionLabel}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={openDistributionModal}
                  disabled={isDistributionDisabled}
                  className={`inline-flex h-8 w-full items-center justify-center rounded-xl border px-3 text-[12px] font-medium transition sm:h-9 sm:w-auto sm:text-[13px] ${isDistributionDisabled ? "cursor-not-allowed border-white/8 bg-[#131313] text-white/28" : "border-white/10 bg-[#131313] text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] hover:border-white/16 hover:bg-[#151515] hover:text-white"}`}
                >
                  + Distribute
                </button>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`mt-4 rounded-xl border px-4 py-3 text-sm font-medium ${instant ? "border-[#F5D97A]/35 bg-[#F5D97A]/8 text-[#F7D46B]" : "border-white/10 bg-[#101010] text-white/88"}`}
        >
          <div className="flex flex-col gap-0.5 leading-[1.45]">
            <div>
              {instant
                ? "Instant Graduation: This token will skip the bonding curve mechanic and instantly graduate to Uniswap."
                : "You can be the first to buy the token and secure a portion of the supply."}
            </div>
            <div className="pt-0.5 text-[11px] text-white/42">
              *Additional transaction fees may apply
            </div>
          </div>
        </div>
      </div>
      <AddressModal
        open={isAddressModalOpen}
        value={draftAddresses}
        mode={distributionMode}
        total={buyNow}
        error={distributionError}
        onChange={setDraftAddresses}
        onModeChange={(next) => {
          setDistributionMode(next);
          setDistributionError("");
        }}
        onClose={() => {
          setDistributionError("");
          setIsAddressModalOpen(false);
        }}
        onSave={handleSaveDistribution}
      />
    </>
  );
}

function MobileLaunchDock({
  ready,
  missing,
  dexFee,
  dexSel,
  marketCap,
  feeBuilderValue,
  feeBuilderIssues,
  initialBuy,
  supplyValue,
  plan,
  descriptionAdded,
  lbpEnabledCount,
  advancedProtectionCount,
  walletFundingWarning,
  onOpenFeeBuilder,
  onOpenFeeBuilderIssue,
  onJump,
  onLaunch,
}: {
  ready: boolean;
  missing: string[];
  dexFee: number;
  dexSel: string;
  marketCap: number;
  feeBuilderValue: string | null;
  feeBuilderIssues: number;
  initialBuy: number;
  supplyValue: number;
  plan: string;
  descriptionAdded: DescriptionPreview;
  lbpEnabledCount: number;
  advancedProtectionCount: number;
  walletFundingWarning: WalletFundingWarningData | null;
  onOpenFeeBuilder: () => void;
  onOpenFeeBuilderIssue: () => void;
  onJump: (k: Sec) => void;
  onLaunch: () => void;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const filled = 3 - missing.length;
  const canLaunch = ready && !walletFundingWarning;
  const marketCapNumber =
    getEstimatedMarketCapValue(initialBuy, marketCap) ?? marketCap;
  const marketCapValue = fmtCap(marketCapNumber);
  const tokenStartingPrice = formatStartingPrice(
    supplyValue > 0 ? marketCapNumber / supplyValue : 0,
    true,
  );
  const planColor =
    plan === "super based"
      ? "text-fuchsia-400"
      : plan === "ultra based"
        ? "text-amber-400"
        : "text-[#10B981]";
  const dexOption = getDexOption(dexSel);
  const dexName = dexSel.replace(/\s+v\d+$/, "");
  const feeBuilderDisplay = feeBuilderValue ? (
    feeBuilderIssues > 0 ? (
      <span className="inline-flex items-center justify-end gap-1.5 whitespace-nowrap">
        <span>{feeBuilderValue}</span>
        <span className="text-[#FF7184]">
          {feeBuilderIssues} {feeBuilderIssues === 1 ? "issue" : "issues"}
        </span>
      </span>
    ) : (
      feeBuilderValue
    )
  ) : (
    "Not set"
  );
  const items: RowItem[] = [
    {
      key: "dex",
      label: "DEX",
      value: (
        <span className="inline-flex min-w-0 items-center justify-end gap-1.5 whitespace-nowrap leading-none">
          <DexLogo option={dexOption} size={14} />
          <span className="truncate">{dexName}</span>
          <span className="shrink-0 text-white/38">{dexFee}%</span>
        </span>
      ),
      ok: true,
    },
    {
      key: "dex",
      label: "Starting Market Cap",
      value: marketCapValue,
      ok: true,
      valueClass: "text-[#10B981]",
    },
    {
      key: "dex",
      label: "Token Starting Price",
      value: tokenStartingPrice,
      ok: true,
    },
    {
      key: "initialBuy",
      label: "Initial Buy",
      value: initialBuy > 0 ? `${initialBuy.toFixed(1)}% of supply` : "Not set",
      ok: initialBuy > 0,
    },
    {
      key: "descriptions",
      label: "Description & Socials",
      value: descriptionAdded ? "Added" : "Not added",
      ok: Boolean(descriptionAdded),
    },
    {
      key: "lbp",
      label: "LBP Settings",
      value: lbpEnabledCount > 0 ? "Custom" : "Default",
      ok: lbpEnabledCount > 0,
    },
    {
      key: "feeBuilder",
      label: "Advanced Protection",
      value:
        advancedProtectionCount > 0
          ? `${advancedProtectionCount} enabled`
          : "Not added",
      ok: advancedProtectionCount > 0,
    },
    {
      key: "feeBuilder",
      label: "Fee Builder Fees",
      value: feeBuilderDisplay,
      ok: !!feeBuilderValue,
      checkClass: feeBuilderIssues > 0 ? "text-[#FF7184]" : undefined,
      badge: "Signature",
      onClick: feeBuilderIssues > 0 ? onOpenFeeBuilderIssue : undefined,
    },
    {
      key: "lbp",
      label: "Launch Plan",
      value: plan,
      ok: true,
      checkClass: planColor,
      valueClass: planColor,
    },
  ];
  const mobileRows = items.filter(
    (item) => item.ok || item.label === "Fee Builder Fees",
  );
  const launchNote = walletFundingWarning ? (
    <div className="mt-1.5 text-center text-[10px] font-normal leading-4 text-[#F5D97A]/72">
      Requires {fmtEth(walletFundingWarning.requiredEth)} ETH
      <span className="px-1 text-white/24">·</span>
      {fmtEth(walletFundingWarning.availableEth)} ETH available
    </div>
  ) : ready ? (
    feeBuilderValue ? null : (
      <div className="mt-1.5 text-center text-[10px] font-normal leading-4 text-white/48">
        Want to stand out?{" "}
        <button
          type="button"
          onClick={onOpenFeeBuilder}
          className="font-normal text-[#EFD48A]/90 underline decoration-transparent underline-offset-4 transition hover:text-[#F5D97A] hover:decoration-[#F5D97A]/60"
        >
          Configure Fee Builder
        </button>
        .
      </div>
    )
  ) : (
    <div className="mt-1.5 text-center text-[10px] font-normal leading-4 text-white/44">
      Add <span className="text-white/62">{missing.join(", ")}</span> to unlock
      launch.
    </div>
  );
  const mobileCompactCss = `@media (max-width: 639px){section.mt-8{margin-top:1.5rem}section.mt-8>.mb-4{margin-bottom:.75rem}section.mt-8 h2{font-size:15px;line-height:1.15}section.mt-8 h2+div{margin-top:3px;font-size:12px;line-height:16px;color:rgba(255,255,255,.48)}section.mt-8 .grid.gap-3{gap:8px}section.mt-8 button.rounded-2xl{border-radius:14px}section.mt-8 button.rounded-2xl>div.relative{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;column-gap:12px;padding:12px}section.mt-8 button.rounded-2xl>div.relative>.mb-2{grid-column:1;margin-bottom:0}section.mt-8 button.rounded-2xl [class*="text-[17px]"]{font-size:14px;line-height:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}section.mt-8 button.rounded-2xl>div.relative>div:nth-child(2){grid-column:1;font-size:11px;line-height:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:rgba(255,255,255,.52)}section.mt-8 button.rounded-2xl .mt-3.border-t{grid-column:2;grid-row:1/span 2;align-self:center;margin-top:0;border-top:0;padding-top:0}section.mt-8 button.rounded-2xl .mt-3.border-t .text-sm{font-size:11px;line-height:14px;text-align:right;white-space:nowrap}.initialBuyPanel .initialBuyPercentLabel{font-size:22px!important;padding:3px 6px!important}.initialBuyPanel .initialBuyPercentLabel input{width:64px!important}.initialBuyPanel .initialBuySliderGrid{grid-template-columns:minmax(0,1fr) 36px!important;gap:10px!important;align-items:center!important}.initialBuyPanel .initialBuyDexButton{height:36px!important;width:36px!important;border-radius:11px!important}.initialBuyPanel .range-slider{height:20px!important}.initialBuyPanel .buyStopLabel{top:16px!important;min-width:24px!important;font-size:9.5px!important;line-height:11px!important;letter-spacing:-.02em}}`;
  const initialBuyMobileCss = `@media (max-width:639px){.initialBuyPanel .initialBuyIntroBlock{margin-bottom:14px!important}.initialBuyPanel .initialBuyTitle{font-size:16px!important;line-height:20px!important;font-weight:650!important}.initialBuyPanel .initialBuyIntro{margin-top:4px!important;font-size:11.5px!important;line-height:17px!important;color:rgba(255,255,255,.54)!important;display:-webkit-box!important;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden!important}.initialBuyPanel .initialBuyPercentRow{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;align-items:center!important;column-gap:10px!important;row-gap:4px!important}.initialBuyPanel .initialBuyPercentCopy{display:contents!important}.initialBuyPanel .initialBuyPercentTitle{grid-column:1!important;grid-row:1!important;font-size:9.5px!important;line-height:12px!important;letter-spacing:.12em!important;color:rgba(255,255,255,.50)!important}.initialBuyPanel .initialBuyPercentHelp{grid-column:1/-1!important;grid-row:2!important;margin-top:0!important;font-size:10.5px!important;line-height:14px!important;color:rgba(255,255,255,.36)!important}.initialBuyPanel .initialBuyPercentLabel{grid-column:2!important;grid-row:1!important;width:auto!important;justify-self:end!important;border-color:rgba(255,255,255,.09)!important;background:linear-gradient(180deg,rgba(255,255,255,.040),rgba(255,255,255,.020))!important;border-radius:12px!important;padding:4px 7px!important;font-size:20px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.025)!important}.initialBuyPanel .initialBuyPercentLabel:focus-within{border-color:rgba(16,185,129,.24)!important;background:rgba(16,185,129,.028)!important;box-shadow:0 0 0 1px rgba(16,185,129,.055) inset!important}.initialBuyPanel .initialBuyPercentLabel input{width:54px!important}}`;
  const launchPlanCss = `.launch-plan-active::before{content:"Selected";position:absolute;right:12px;top:12px;z-index:2;border:1px solid rgba(255,255,255,.12);border-radius:999px;background:rgba(255,255,255,.055);padding:4px 8px;font-size:9px;font-weight:700;letter-spacing:.12em;line-height:1;text-transform:uppercase;box-shadow:inset 0 1px 0 rgba(255,255,255,.04)}.launch-plan-based::before{border-color:rgba(16,185,129,.42);background:rgba(16,185,129,.13);color:#10B981}.launch-plan-super::before{border-color:rgba(217,70,239,.42);background:rgba(217,70,239,.13);color:#D946EF}.launch-plan-ultra::before{border-color:rgba(251,191,36,.45);background:rgba(251,191,36,.14);color:#FBBF24}.launch-plan-active>div.relative>div:first-of-type{padding-right:90px}@media(max-width:639px){.launch-plan-active::before{content:"✓";right:10px;top:50%;display:grid;height:20px;width:20px;place-items:center;padding:0;transform:translateY(-50%);font-size:11px;letter-spacing:0}.launch-plan-active>div.relative>div:first-of-type{padding-right:28px}}`;
  const launchPlanMobileFixCss = `@media(max-width:639px){.launch-plan-active::before{content:"Selected";right:10px;top:7px;display:block;height:auto;width:auto;padding:3px 6px;transform:none;font-size:7px;line-height:1;letter-spacing:.1em}.launch-plan-active>div.relative>div:first-of-type{padding-right:58px}.launch-plan-active>div.relative .mt-3.border-t{transform:translateY(5px)}}`;

  return (
    <>
      <style
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: `${mobileCompactCss}${initialBuyMobileCss}${launchPlanCss}${launchPlanMobileFixCss}`,
        }}
      />
      <button
        type="button"
        aria-label="Close applied settings"
        onClick={() => setSettingsOpen(false)}
        className={`fixed inset-0 z-40 bg-black/58 backdrop-blur-[2px] transition-[opacity,backdrop-filter] duration-400 ease-[cubic-bezier(.22,1,.36,1)] lg:hidden ${settingsOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <div className="fixed inset-x-0 bottom-0 z-50 lg:hidden">
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-full will-change-transform transition-[opacity,transform,filter] duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${settingsOpen ? "translate-y-0 scale-100 opacity-100 blur-0" : "translate-y-[calc(100%+10px)] scale-[0.985] opacity-0 blur-[1px]"}`}
          aria-hidden={!settingsOpen}
          inert={!settingsOpen}
        >
          <div className="mx-auto max-w-[88rem] px-3 pb-2">
            <div
              className={`pointer-events-auto max-h-[68dvh] overflow-hidden rounded-t-[24px] border border-white/10 bg-[#0B0B0C]/96 shadow-[0_-24px_70px_rgba(0,0,0,0.45)] ring-1 ring-inset ring-white/5 backdrop-blur-xl transition-[box-shadow,border-color] duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${settingsOpen ? "border-white/12 shadow-[0_-28px_82px_rgba(0,0,0,0.50)]" : ""}`}
            >
              <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/38">
                    Applied settings
                  </div>
                  <div className="mt-0.5 text-xs text-white/50">
                    Review launch configuration before opening the pool.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.035] px-3 text-[11px] font-medium text-white/58 transition hover:border-white/16 hover:text-white"
                >
                  <span>Back down</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="dark-scrollbar max-h-[calc(68dvh-72px)] overflow-y-auto px-3 py-3">
                {walletFundingWarning ? (
                  <div className="mb-2.5">
                    <WalletFundingWarning warning={walletFundingWarning} />
                  </div>
                ) : null}
                <div className="grid gap-2">
                  {mobileRows.map((item) => (
                    <Row
                      key={`${item.label}-${item.key}`}
                      item={item}
                      onJump={(key) => {
                        setSettingsOpen(false);
                        onJump(key);
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="pointer-events-auto border-t border-white/10 bg-[#0A0A0A]/94 shadow-[0_-18px_48px_rgba(0,0,0,0.38)] backdrop-blur-xl">
          <div className="mx-auto max-w-[88rem] px-3 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/34">
                  Launch status
                </div>
                <div className="mt-0.5 text-[12.5px] font-semibold text-white">
                  {walletFundingWarning ? "Wallet needs ETH" : "Ready to launch?"}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <div
                  className={`inline-flex h-[17px] items-center rounded-full border px-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${walletFundingWarning ? "border-[#F5C451]/28 bg-[#F5C451]/[0.07] text-[#F5D97A]" : ready ? "border-[#F5D97A]/24 bg-[#F5D97A]/[0.055] text-[#F5D97A]/88" : "border-white/8 bg-white/[0.025] text-white/48"}`}
                >
                  {walletFundingWarning ? "Low gas" : ready ? "Ready" : `${filled}/3`}
                </div>
                <button
                  type="button"
                  onClick={() => setSettingsOpen((value) => !value)}
                  className={`inline-flex h-7 items-center gap-1 rounded-full border px-2.5 text-[10px] font-medium transition ${settingsOpen ? "border-[#F5D97A]/26 bg-[#F5D97A]/[0.06] text-[#F5D97A]/82" : "border-white/10 bg-white/[0.035] text-white/58 hover:border-white/16 hover:text-white"}`}
                >
                  <span>Settings</span>
                  <ChevronDown
                    className={`h-3 w-3 transition duration-300 ${settingsOpen ? "" : "rotate-180"}`}
                  />
                </button>
              </div>
            </div>
            <div className="mt-2">
              <div className="relative h-1 overflow-hidden rounded-full bg-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
                <div
                  className={`h-full rounded-full transition-[width,background] duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${walletFundingWarning ? "bg-gradient-to-r from-[#C58C32] to-[#F5D97A]" : ready ? "bg-gradient-to-r from-[#10B981] via-[#34D399] to-[#F5D97A]" : "bg-gradient-to-r from-[#10B981] to-[#34D399]"}`}
                  style={{ width: `${ready ? 100 : (filled / 3) * 100}%` }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                walletFundingWarning ? setSettingsOpen(true) : onLaunch()
              }
              className={`group relative mt-2 w-full overflow-hidden rounded-full border px-4 py-2.5 text-sm font-semibold transition-[border-color,box-shadow,color,transform] duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${walletFundingWarning ? "border-[#F5C451]/28 bg-[#F5C451]/[0.035] text-[#F5D97A] active:scale-[0.99]" : canLaunch ? "launchButtonReady border-[#10B981]/70 text-[#07331F] shadow-[0_14px_30px_rgba(16,185,129,0.20)] active:scale-[0.99]" : "border-white/12 text-white/58 active:scale-[0.99]"}`}
            >
              <span
                aria-hidden
                className={`absolute inset-0 bg-[linear-gradient(180deg,rgba(24,27,26,0.98),rgba(14,16,15,0.96))] transition-opacity duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${canLaunch ? "opacity-0" : "opacity-100"}`}
              />
              <span
                aria-hidden
                className={`launchButtonGradient absolute inset-0 bg-[linear-gradient(110deg,#0EDB86_0%,#36EBA6_38%,#F5D97A_78%,#10B981_100%)] bg-[length:220%_100%] transition-opacity duration-700 ease-[cubic-bezier(.22,1,.36,1)] ${canLaunch ? "opacity-100" : "opacity-0"}`}
              />
              <span
                aria-hidden
                className={`launchButtonSheen absolute inset-y-[-30%] left-0 w-1/3 bg-white/30 blur-lg ${canLaunch ? "" : "opacity-0"}`}
              />
              <span className="relative inline-flex items-center justify-center gap-2">
                <span
                  style={{
                    textShadow: canLaunch
                      ? "0 1px 0 rgba(255,255,255,0.28)"
                      : undefined,
                  }}
                  className={`transition-[color,letter-spacing,filter] duration-500 ${walletFundingWarning ? "text-[12.5px] font-medium tracking-[0.004em] text-[#F5D97A]" : canLaunch ? "text-[13px] font-semibold tracking-[-0.006em] text-[#07331F]" : "text-[12.5px] font-medium tracking-[0.004em] text-white/62"}`}
                >
                  {walletFundingWarning
                    ? "Review Wallet Balance"
                    : ready
                      ? "Launch Pool"
                      : "Complete Core Fields"}
                </span>
                <ChevronRight
                  className={`h-3.5 w-3.5 transition duration-500 ${walletFundingWarning ? "translate-x-0 text-[#F5D97A] opacity-70" : canLaunch ? "translate-x-0 text-[#07331F] opacity-70" : "-translate-x-1 opacity-0"}`}
                  strokeWidth={2.35}
                />
              </span>
            </button>
            {launchNote}
          </div>
        </div>
      </div>
    </>
  );
}

function WalletFundingWarning({
  warning,
}: {
  warning: WalletFundingWarningData;
}) {
  return (
    <div
      data-testid="wallet-funding-warning"
      role="status"
      className="rounded-xl border border-[#F5C451]/22 bg-[#F5C451]/[0.055] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]"
    >
      <div className="flex items-start gap-2.5">
        <TriangleAlert
          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#F5D97A]/88"
          strokeWidth={1.8}
        />
        <div className="min-w-0">
          <div className="text-[11.5px] font-medium text-[#F5E3AA]/92">
            Insufficient ETH
          </div>
          <div className="mt-1 text-[10.5px] leading-[1.45] text-white/48">
            {warning.cdpUnavailableOnChain ? (
              <>
                CDP gasless creation only covers Base. This launch requires{" "}
                {fmtEth(warning.requiredEth)} ETH for creation
                {warning.includesInitialBuy ? ", initial buy" : ""} and
                network gas.
              </>
            ) : warning.creationSponsored ? (
              <>
                Base creation gas is sponsored. You still need{" "}
                {fmtEth(warning.requiredEth)} ETH
                {warning.includesInitialBuy
                  ? " for the initial buy and network gas"
                  : " for the selected launch plan"}
                .
              </>
            ) : (
              <>
                Your wallet needs {fmtEth(warning.requiredEth)} ETH to cover
                token creation
                {warning.includesInitialBuy ? ", the initial buy" : ""} and
                network gas.
              </>
            )}{" "}
            Available balance: {fmtEth(warning.availableEth)} ETH.
          </div>
        </div>
      </div>
    </div>
  );
}

function Sidebar({
  name,
  symbol,
  chain,
  ready,
  missing,
  dexFee,
  dexSel,
  marketCap,
  feeBuilderValue,
  feeBuilderIssues,
  initialBuy,
  supplyValue,
  plan,
  descriptionAdded,
  lbpEnabledCount,
  advancedProtectionCount,
  walletFundingWarning,
  walletDemoMode,
  setWalletDemoMode,
  onOpenFeeBuilder,
  onOpenFeeBuilderIssue,
  onJump,
}: {
  name: string;
  symbol: string;
  chain: string;
  ready: boolean;
  missing: string[];
  dexFee: number;
  dexSel: string;
  marketCap: number;
  feeBuilderValue: string | null;
  feeBuilderIssues: number;
  initialBuy: number;
  supplyValue: number;
  plan: string;
  descriptionAdded: DescriptionPreview;
  lbpEnabledCount: number;
  advancedProtectionCount: number;
  walletFundingWarning: WalletFundingWarningData | null;
  walletDemoMode: WalletDemoMode;
  setWalletDemoMode: (mode: WalletDemoMode) => void;
  onOpenFeeBuilder: () => void;
  onOpenFeeBuilderIssue: () => void;
  onJump: (k: Sec) => void;
}) {
  const [sideOpen, setSideOpen] = useState(false);
  const [walletDemoOpen, setWalletDemoOpen] = useState(false);
  const filled = 3 - missing.length;
  const logoUploaded = !missing.includes("logo");
  const previewDescription = descriptionAdded
    ? descriptionAdded.description
    : "";
  const previewSocialLinks = descriptionAdded
    ? descriptionAdded.socialLinks
    : [];
  const marketCapNumber =
    getEstimatedMarketCapValue(initialBuy, marketCap) ?? marketCap;
  const marketCapValue = fmtCap(marketCapNumber);
  const tokenStartingPrice = formatStartingPrice(
    supplyValue > 0 ? marketCapNumber / supplyValue : 0,
    true,
  );
  const planColor =
    plan === "super based"
      ? "text-fuchsia-400"
      : plan === "ultra based"
        ? "text-amber-400"
        : "text-[#10B981]";
  const dexOption = getDexOption(dexSel);
  const dexName = dexSel.replace(/\s+v\d+$/, "");
  const feeBuilderDisplay = feeBuilderValue ? (
    feeBuilderIssues > 0 ? (
      <span className="inline-flex items-center justify-end gap-1.5 whitespace-nowrap">
        <span>{feeBuilderValue}</span>
        <span className="text-[#FF7184]">
          {feeBuilderIssues} {feeBuilderIssues === 1 ? "issue" : "issues"}
        </span>
      </span>
    ) : (
      feeBuilderValue
    )
  ) : (
    "Not set"
  );
  const mainItems: RowItem[] = [
    {
      key: "dex",
      label: "DEX",
      value: (
        <span className="inline-flex min-w-0 items-center justify-end gap-1.5 whitespace-nowrap leading-none">
          <DexLogo option={dexOption} size={14} />
          <span className="truncate">{dexName}</span>
          <span className="shrink-0 text-white/38">{dexFee}%</span>
        </span>
      ),
      ok: true,
    },
    {
      key: "dex",
      label: "Starting Market Cap",
      value: marketCapValue,
      ok: true,
      valueClass: "text-[#10B981]",
    },
    {
      key: "dex",
      label: "Token Starting Price",
      value: tokenStartingPrice,
      ok: true,
    },
    {
      key: "feeBuilder",
      label: "Fee Builder Fees",
      value: feeBuilderDisplay,
      ok: !!feeBuilderValue,
      checkClass: feeBuilderIssues > 0 ? "text-[#FF7184]" : undefined,
      badge: "Signature",
      onClick: feeBuilderIssues > 0 ? onOpenFeeBuilderIssue : undefined,
    },
  ];
  const hiddenItems: RowItem[] = [
    {
      key: "descriptions",
      label: "Description & Socials",
      value: descriptionAdded ? "Added" : "Not added",
      ok: Boolean(descriptionAdded),
    },
    {
      key: "feeBuilder",
      label: "Advanced Protection",
      value:
        advancedProtectionCount > 0
          ? `${advancedProtectionCount} enabled`
          : "Not added",
      ok: advancedProtectionCount > 0,
    },
    {
      key: "initialBuy",
      label: "Initial Buy",
      value: initialBuy > 0 ? `${initialBuy.toFixed(1)}% of supply` : "Not set",
      ok: initialBuy > 0,
    },
    {
      key: "lbp",
      label: "LBP Settings",
      value: lbpEnabledCount > 0 ? "Custom" : "Default",
      ok: lbpEnabledCount > 0,
    },
  ];
  const planItem: RowItem = {
    key: "lbp",
    label: "Launch Plan",
    value: plan,
    ok: true,
    checkClass: planColor,
    valueClass: planColor,
  };
  const visibleItems = [
    ...mainItems,
    ...hiddenItems.filter((item) => item.ok),
  ];
  const shownMainItems = visibleItems.map((item) => ({
    item,
    open:
      item.ok ||
      item.label.includes("DEX") ||
      item.label.includes("Market") ||
      item.key === "feeBuilder",
  }));
  const shownLabels = new Set(
    shownMainItems.filter((row) => row.open).map((row) => row.item.label),
  );
  const hidden = hiddenItems.filter((item) => !shownLabels.has(item.label));
  const launchNote = ready ? (
    feeBuilderValue ? null : (
      <div className="mt-3 text-center text-[11.5px] font-normal leading-5 text-white/50">
        Core launch details are ready. Want to stand out?{" "}
        <button
          type="button"
          onClick={onOpenFeeBuilder}
          className="font-normal text-[#EFD48A]/90 underline decoration-transparent underline-offset-4 transition hover:text-[#F5D97A] hover:decoration-[#F5D97A]/60"
        >
          Configure Fee Builder
        </button>
      </div>
    )
  ) : (
    <div className="mt-3 text-center text-[11.5px] font-normal leading-5 text-white/44">
      Add <span className="text-white/62">{missing.join(", ")}</span> to unlock
      launch.
    </div>
  );
  const revealRow = (item: RowItem, isOpen: boolean) => (
    <div
      key={item.label}
      className="smooth-reveal"
      data-open={isOpen}
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      <div className="smooth-reveal-inner">
        <div className="pt-2">
          <Row item={item} onJump={onJump} />
        </div>
      </div>
    </div>
  );
  const walletDemoLabel =
    WALLET_DEMO_OPTIONS.find((option) => option.value === walletDemoMode)
      ?.label ?? "Live wallet";

  return (
    <aside className="max-h-[calc(100vh-4rem)] space-y-4 overflow-y-auto overscroll-contain pr-1 [scrollbar-color:rgba(255,255,255,0.12)_transparent] [scrollbar-width:thin]">
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/46">
          Live Preview
        </div>
        <div className="relative">
          <button
            type="button"
            data-testid="wallet-demo-control"
            aria-expanded={walletDemoOpen}
            onClick={() => setWalletDemoOpen((value) => !value)}
            className={`inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[10px] font-medium transition ${walletDemoMode === "low" ? "border-[#F5C451]/28 bg-[#F5C451]/[0.07] text-[#F5D97A]" : "border-white/10 bg-white/[0.025] text-white/48 hover:border-white/16 hover:text-white/76"}`}
          >
            <span className="text-white/38">Demo</span>
            <span>{walletDemoLabel}</span>
            <ChevronDown
              className={`h-3 w-3 transition duration-200 ${walletDemoOpen ? "rotate-180" : ""}`}
            />
          </button>
          {walletDemoOpen ? (
            <div className="smooth-pop absolute right-0 top-full z-50 mt-2 w-36 overflow-hidden rounded-xl border border-white/10 bg-[#101011] p-1.5 shadow-[0_18px_42px_rgba(0,0,0,0.42)]">
              {WALLET_DEMO_OPTIONS.map((option) => {
                const active = option.value === walletDemoMode;
                return (
                  <button
                    key={option.value}
                    type="button"
                    data-testid={`wallet-demo-${option.value}`}
                    onClick={() => {
                      setWalletDemoMode(option.value);
                      setWalletDemoOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[11px] transition ${active ? "bg-white/[0.07] text-white" : "text-white/55 hover:bg-white/[0.045] hover:text-white/86"}`}
                  >
                    <span>{option.label}</span>
                    {active ? (
                      <Check className="h-3 w-3 text-[#34D399]" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
      <MomentumPreviewCard
        name={name}
        symbol={symbol}
        chain={chain}
        logo={logoUploaded}
        description={previewDescription}
        socialLinks={previewSocialLinks}
      />
      <div className="px-1 pt-0.5">
        <div className="flex min-h-5 items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/46">
            Launch status
          </div>
          <div
            className={`inline-flex h-[18px] items-center rounded-full border px-2 text-[9px] font-semibold uppercase tracking-[0.13em] transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${ready ? "border-[#F5D97A]/24 bg-[#F5D97A]/[0.055] text-[#F5D97A]/88" : "border-transparent bg-transparent text-white/48"}`}
          >
            {ready ? "Ready" : `${filled}/3 core fields`}
          </div>
        </div>
        <div className="mt-3">
          <div className="relative h-1.5 overflow-hidden rounded-full bg-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
            <div
              className={`h-full rounded-full transition-[width,background] duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${ready ? "bg-gradient-to-r from-[#10B981] via-[#34D399] to-[#F5D97A]" : "bg-gradient-to-r from-[#10B981] to-[#34D399]"}`}
              style={{ width: `${ready ? 100 : (filled / 3) * 100}%` }}
            />
          </div>
        </div>
        <button
          type="button"
          className={`group relative mt-4 w-full overflow-hidden rounded-full border px-4 py-3.5 text-sm font-semibold transition-[border-color,box-shadow,color,transform] duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${ready ? "launchButtonReady border-[#10B981]/70 text-[#07331F] shadow-[0_18px_38px_rgba(16,185,129,0.24)] hover:shadow-[0_20px_44px_rgba(16,185,129,0.30)]" : "border-white/12 text-white/58 hover:border-white/18 hover:text-white"}`}
        >
          <span
            aria-hidden
            className={`absolute inset-0 bg-[linear-gradient(180deg,rgba(24,27,26,0.98),rgba(14,16,15,0.96))] transition-opacity duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${ready ? "opacity-0" : "opacity-100"}`}
          />
          <span
            aria-hidden
            className={`launchButtonGradient absolute inset-0 bg-[linear-gradient(110deg,#0EDB86_0%,#36EBA6_38%,#F5D97A_78%,#10B981_100%)] bg-[length:220%_100%] transition-opacity duration-700 ease-[cubic-bezier(.22,1,.36,1)] ${ready ? "opacity-100" : "opacity-0"}`}
          />
          <span
            aria-hidden
            className={`launchButtonSheen absolute inset-y-[-30%] left-0 w-1/3 bg-white/30 blur-lg ${ready ? "" : "opacity-0"}`}
          />
          <span className="relative inline-flex items-center justify-center gap-2">
            <span
              style={{
                textShadow: ready
                  ? "0 1px 0 rgba(255,255,255,0.28)"
                  : undefined,
              }}
              className={`transition-[color,letter-spacing,filter] duration-500 ${ready ? "text-[14px] font-semibold tracking-[-0.006em] text-[#07331F]" : "text-[13px] font-medium tracking-[0.004em] text-white/62"}`}
            >
              {ready ? "Launch Pool" : "Complete Core Fields"}
            </span>
            <ChevronRight
              className={`h-4 w-4 transition duration-500 ${ready ? "translate-x-0 text-[#07331F] opacity-70" : "-translate-x-1 opacity-0"}`}
              strokeWidth={2.35}
            />
          </span>
        </button>
        {launchNote}
        {walletFundingWarning ? (
          <div className="mt-3">
            <WalletFundingWarning warning={walletFundingWarning} />
          </div>
        ) : null}
      </div>
      <div className="mx-1 border-t border-white/8" />
      <div className="px-1 pt-1">
        <button
          type="button"
          onClick={() => setSideOpen((value) => !value)}
          className="mb-0.5 flex w-full items-center justify-between text-left"
        >
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/46">
            Applied settings
          </div>
          <ChevronDown
            className={`h-4 w-4 text-white/35 transition duration-300 ${sideOpen ? "rotate-180" : ""}`}
          />
        </button>
        <div>
          {shownMainItems.map(({ item, open: rowOpen }) =>
            revealRow(item, rowOpen),
          )}
          <div
            className="smooth-reveal"
            data-open={sideOpen}
            aria-hidden={!sideOpen}
            inert={!sideOpen}
          >
            <div className="smooth-reveal-inner">
              <div className="grid gap-2 pt-2">
                {hidden.map((item) => (
                  <Row key={item.label} item={item} onJump={onJump} />
                ))}
              </div>
            </div>
          </div>
          {revealRow(planItem, true)}
        </div>
      </div>
    </aside>
  );
}

export default function BBLbpCreationReworkPreview() {
  const [plan, setPlan] = useState("based"),
    [name, setName] = useState(""),
    [symbol, setSymbol] = useState(""),
    [logo, setLogo] = useState(false),
    [chain, setChain] = useState("BASE"),
    [moreOpen, setMoreOpen] = useState(false),
    [open, setOpen] = useState(OPEN0),
    [dexFee, setDexFee] = useState(1),
    [marketCap, setMarketCap] = useState(BASE_MARKET_CAP),
    [dexLiquidity, setDexLiquidity] = useState(10),
    [initialBuy, setInitialBuy] = useState(0),
    [dexSel, setDexSel] = useState("Uniswap v4"),
    [dexOpen, setDexOpen] = useState(false),
    [preset, setPreset] = useState<number | null>(null),
    [supplyText, setSupplyText] = useState<string>(DEFAULT_SUPPLY_TEXT);
  const moreRef = useRef<HTMLDivElement | null>(null),
    nameRef = useRef<HTMLInputElement | null>(null),
    symbolRef = useRef<HTMLInputElement | null>(null),
    logoRef = useRef<HTMLButtonElement | null>(null);
  const centerTimeoutRef = useRef<number | null>(null),
    centerFrameRef = useRef<number | null>(null);
  const [lbpToggles, setLbpToggles] = useState<Toggles>(LBP_TOGGLES0);
  const [lbpSliders, setLbpSliders] = useState<Sliders>(LBP_SLIDERS0);
  const [whitelistText, setWhitelistText] = useState("");
  const [whitelistDraft, setWhitelistDraft] = useState("");
  const [whitelistOpen, setWhitelistOpen] = useState(false);
  const [feeBuilderTotal, setFeeBuilderTotal] = useState(0);
  const [feeBuilderIssues, setFeeBuilderIssues] = useState(0);
  const [feeBuilderIssueFocusRequest, setFeeBuilderIssueFocusRequest] =
    useState(0);
  const [advancedProtectionCount, setAdvancedProtectionCount] = useState(0);
  const [walletDemoMode, setWalletDemoMode] =
    useState<WalletDemoMode>("live");
  const [descriptionText, setDescriptionText] = useState("");
  const [socialValues, setSocialValues] = useState<string[]>(() =>
    SOCIALS.map(() => ""),
  );
  const walletStatus = useWalletFundingStatus();
  const walletDemoStatus = WALLET_DEMO_OPTIONS.find(
    (option) => option.value === walletDemoMode,
  )?.status;
  const walletFundingWarning = getWalletFundingWarning(
    walletDemoStatus ?? walletStatus,
    plan,
    initialBuy,
    chain,
  );

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node))
        setMoreOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      if (centerTimeoutRef.current !== null)
        window.clearTimeout(centerTimeoutRef.current);
      if (centerFrameRef.current !== null)
        window.cancelAnimationFrame(centerFrameRef.current);
    };
  }, []);

  const required = [
    { key: "name", ok: !!name.trim() },
    { key: "symbol", ok: !!symbol.trim() },
    { key: "logo", ok: logo },
  ] as const;
  const missing = required.filter((x) => !x.ok).map((x) => x.key),
    firstMissing = required.find((x) => !x.ok)?.key,
    ready = required.every((x) => x.ok),
    feeBuilderValue =
      open.feeBuilder && feeBuilderTotal > 0
        ? fmtFeePct(feeBuilderTotal)
        : null;
  const selectedMarketCap = marketCap;
  const marketCapSummary = fmtCap(selectedMarketCap);
  const requiredPillText = ready ? (
    <Check
      className="-mx-1.5 -my-0.5 inline-block h-3 w-3 align-[-1px]"
      strokeWidth={2.2}
    />
  ) : (
    `${missing.length} required ${missing.length === 1 ? "field" : "fields"}`
  );
  const supplyValue = useMemo(() => parseSupply(supplyText), [supplyText]);
  const validSocialLinks = useMemo(
    () =>
      SOCIALS.map((item, index) => {
        const result = parseSocialLink(item.kind, socialValues[index] ?? "");
        return result.valid && result.href
          ? { kind: item.kind, href: result.href, label: item.label }
          : null;
      }).filter(Boolean) as SocialLink[],
    [socialValues],
  );
  const socialCount = validSocialLinks.length;
  const descriptionAdded: DescriptionPreview =
    descriptionText.trim() || socialCount > 0
      ? { description: descriptionText.trim(), socialLinks: validSocialLinks }
      : false;
  const descriptionSummary = descriptionAdded
    ? `${descriptionText.trim() ? "Description added" : "No description"} - ${socialCount} ${socialCount === 1 ? "social" : "socials"} added`
    : "No description - No socials added";
  const lbpEnabledCount = Object.values(lbpToggles).filter(Boolean).length;
  const whitelistCount = useMemo(
    () => parseAddressLines(whitelistText).length,
    [whitelistText],
  );
  const setSocialValue = (index: number, value: string) =>
    setSocialValues((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? value : item)),
    );
  const toggleLbp = (key: keyof Toggles) =>
    setLbpToggles((current) => ({ ...current, [key]: !current[key] }));
  const setLbpSlider = (key: keyof Sliders, value: number) =>
    setLbpSliders((current) => ({ ...current, [key]: value }));
  const openWhitelistEditor = () => {
    setWhitelistDraft(whitelistText);
    setWhitelistOpen(true);
  };
  const saveWhitelist = () => {
    setWhitelistText(whitelistDraft);
    setWhitelistOpen(false);
  };
  const focus = useCallback((k: Sec, delay = 110) => {
    if (centerTimeoutRef.current !== null)
      window.clearTimeout(centerTimeoutRef.current);
    if (centerFrameRef.current !== null)
      window.cancelAnimationFrame(centerFrameRef.current);

    centerTimeoutRef.current = window.setTimeout(() => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const startTop = window.scrollY;
      const duration = prefersReducedMotion ? 0 : 780;
      let startedAt: number | null = null;

      const targetTop = () => {
        const target = document.getElementById(`section-${k}`);
        if (!target) return window.scrollY;
        const rect = target.getBoundingClientRect();
        const maxTop = Math.max(
          0,
          document.documentElement.scrollHeight - window.innerHeight,
        );
        const top =
          k === "feeBuilder"
            ? window.scrollY + rect.top - 88
            : window.scrollY +
              rect.top +
              rect.height / 2 -
              window.innerHeight / 2;
        return Math.min(maxTop, Math.max(0, top));
      };

      if (prefersReducedMotion) {
        window.scrollTo(0, targetTop());
        return;
      }

      const animate = (now: number) => {
        startedAt ??= now;
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased =
          progress < 0.5
            ? 4 * progress ** 3
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        const nextTop = startTop + (targetTop() - startTop) * eased;
        window.scrollTo(0, nextTop);
        if (progress < 1)
          centerFrameRef.current = window.requestAnimationFrame(animate);
        else centerFrameRef.current = null;
      };

      centerFrameRef.current = window.requestAnimationFrame(animate);
    }, delay);
  }, []);
  const jump = (k: Sec) => {
    if (open[k]) {
      setOpen((v) => ({ ...v, [k]: false }));
      return;
    }
    setOpen((v) => ({ ...v, [k]: true }));
    focus(k);
  };
  const openFeeBuilder = () => {
    setOpen((v) => ({ ...v, feeBuilder: true }));
    focus("feeBuilder");
  };
  const openFeeBuilderIssue = () => {
    setOpen((v) => ({ ...v, feeBuilder: true }));
    focus("feeBuilder");
    setFeeBuilderIssueFocusRequest((value) => value + 1);
  };
  const toggleSection = (k: Sec) => {
    const willOpen = !open[k];
    setOpen((v) => ({ ...v, [k]: willOpen }));
    if (willOpen) focus(k);
  };
  const jumpMissing = () => {
    if (ready) return;
    const target =
      firstMissing === "name"
        ? nameRef.current
        : firstMissing === "symbol"
          ? symbolRef.current
          : logoRef.current;
    if (!target) return;
    if (centerTimeoutRef.current !== null)
      window.clearTimeout(centerTimeoutRef.current);
    if (centerFrameRef.current !== null)
      window.cancelAnimationFrame(centerFrameRef.current);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const startTop = window.scrollY;
    const duration = prefersReducedMotion ? 0 : 760;
    let startedAt: number | null = null;
    const targetTop = () => {
      const rect = target.getBoundingClientRect();
      const maxTop = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      return Math.min(
        maxTop,
        Math.max(
          0,
          window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2,
        ),
      );
    };

    if (prefersReducedMotion) {
      window.scrollTo(0, targetTop());
      if (target instanceof HTMLInputElement) target.focus();
      return;
    }

    const animate = (now: number) => {
      startedAt ??= now;
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased =
        progress < 0.5
          ? 4 * progress ** 3
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      window.scrollTo(0, startTop + (targetTop() - startTop) * eased);
      if (progress < 1)
        centerFrameRef.current = window.requestAnimationFrame(animate);
      else {
        centerFrameRef.current = null;
        if (target instanceof HTMLInputElement) target.focus();
      }
    };

    centerFrameRef.current = window.requestAnimationFrame(animate);
  };

  useEffect(() => {
    const openDescription = () => {
      setOpen((value) => ({ ...value, descriptions: true }));
      focus("descriptions", 130);
    };
    window.addEventListener("bb-open-description", openDescription);
    return () =>
      window.removeEventListener("bb-open-description", openDescription);
  }, [focus]);

  const sections = [
    {
      key: "dex" as Sec,
      title: "DEX Settings",
      description:
        "Choose your launch DEX, tier, define market cap and token supply.",
      summary: `${dexSel} • ${dexFee}% • ${marketCapSummary}`,
      content: (
        <DexSettingsPanel
          dexFee={dexFee}
          setDexFee={setDexFee}
          marketCap={marketCap}
          setMarketCap={setMarketCap}
          dexLiquidity={dexLiquidity}
          setDexLiquidity={setDexLiquidity}
          dexSel={dexSel}
          setDexSel={setDexSel}
          dexOpen={dexOpen}
          setDexOpen={setDexOpen}
          supplyText={supplyText}
          setSupplyText={setSupplyText}
          chain={chain}
          graduationFee={lbpSliders.graduationFee}
          onOpenFeeBuilder={openFeeBuilder}
        />
      ),
    },
    {
      key: "feeBuilder" as Sec,
      title: "Fee Builder",
      description: "Configure and route Fee Builder trading fees & mechanics.",
      summary:
        open.feeBuilder && feeBuilderTotal > 0 ? "Configured" : "Not set",
      tag: "optional",
      content: (
        <FeeBuilderPanel
          chain={chain}
          onTotalChange={setFeeBuilderTotal}
          onAdvancedProtectionChange={setAdvancedProtectionCount}
          onIssuesChange={setFeeBuilderIssues}
          focusIssueRequest={feeBuilderIssueFocusRequest}
        />
      ),
    },
    {
      key: "initialBuy" as Sec,
      title: "Initial Buy",
      description:
        "Buy and distribute your token supply immediately on launch.",
      summary:
        initialBuy > 0
          ? `${initialBuy.toFixed(1)}% selected`
          : "No initial buy selected",
      content: (
        <InitialBuyPanel
          initialBuy={initialBuy}
          setInitialBuy={setInitialBuy}
          preset={preset}
          setPreset={setPreset}
        />
      ),
    },
    {
      key: "lbp" as Sec,
      title: "LBP Settings",
      description:
        "Adjust settings and rules for your liquidity bootstrapping pool before graduation.",
      summary:
        lbpEnabledCount > 0
          ? `${lbpEnabledCount} settings enabled`
          : "No additional settings enabled",
      content: (
        <LbpSettingsPanel
          toggles={lbpToggles}
          sliders={lbpSliders}
          toggle={toggleLbp}
          setSlider={setLbpSlider}
          whitelistText={whitelistText}
          whitelistCount={whitelistCount}
          openWhitelist={openWhitelistEditor}
        />
      ),
    },
  ];

  const chainPills = (
    <div className="flex flex-wrap justify-center gap-2 md:justify-end">
      {CHAINS.primary.map((c) => {
        const active = chain === c.short;
        return (
          <button
            key={c.short}
            type="button"
            onClick={() => {
              setChain(c.short);
              setMoreOpen(false);
            }}
            className={chainBtn(active)}
          >
            <ChainIcon chain={c.short} size={16} />
            <span>{c.short}</span>
          </button>
        );
      })}
      <div className="relative" ref={moreRef}>
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          className={chainBtn(CHAINS.more.some((c) => c.short === chain))}
        >
          <span>
            {CHAINS.more.some((c) => c.short === chain) ? chain : "MORE"}
          </span>
          <span
            className={`text-[10px] transition duration-300 ${moreOpen ? "rotate-180" : ""}`}
          >
            ▾
          </span>
        </button>
        {moreOpen ? (
          <div className="smooth-pop absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-2xl border border-white/10 bg-[#101010] p-2 shadow-[0_18px_50px_rgba(0,0,0,0.38)]">
            <div className="space-y-1">
              {CHAINS.more.map((c) => {
                const active = chain === c.short;
                return (
                  <button
                    key={c.short}
                    type="button"
                    onClick={() => {
                      setChain(c.short);
                      setMoreOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${active ? "bg-white/[0.07] text-white" : "text-white/72 hover:bg-[#131313] hover:text-white"}`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <ChainIcon chain={c.short} size={16} />
                      <span>{c.short}</span>
                    </span>
                    {active ? <span className="text-[#10B981]">✓</span> : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <>
      <div className="min-h-[calc(100vh-56px)] bg-[#0A0A0A] text-white">
        <style>{CSS}</style>
        <main className="mx-auto max-w-[88rem] px-6 py-8 pb-44 md:px-10 lg:px-12 lg:pb-32">
          <div className="mb-5">
            <CreateBackLink href="/create" />
          </div>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
            <div className="min-w-0">
              <section
                className={`${UI.panel} ${UI.shadow} mb-6 overflow-visible rounded-[22px] bg-[#101010] p-4`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white">
                        Select chain
                      </div>
                      <div className="mt-1 text-xs text-white/58">
                        Choose where you want to launch your pool.
                      </div>
                    </div>
                    <div className="hidden md:block">{chainPills}</div>
                  </div>
                  <div className="md:hidden">{chainPills}</div>
                </div>
              </section>
              <section
                className={`${UI.panel} ${UI.shadow} relative overflow-hidden rounded-[22px] bg-[#101010] px-5 pb-2 pt-5`}
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="text-sm text-white/58">
                    Launch instantly with name, symbol and logo.
                  </div>
                  <div
                    className={`hidden rounded-full border px-3 py-1 text-xs font-medium transition-colors sm:block ${ready ? "border-[#F5D97A]/28 bg-[#F5D97A]/[0.07] text-[#F5D97A]/90" : "border-white/10 bg-[#0C0C0D] text-white/42"}`}
                  >
                    {requiredPillText}
                  </div>
                </div>
                <div className="grid gap-5">
                  <div className="grid w-full gap-5 sm:grid-cols-2">
                    <Field
                      label="Name"
                      placeholder="Name your token..."
                      value={name}
                      onChange={setName}
                      inputRef={nameRef}
                      required
                    />
                    <Field
                      label="Symbol"
                      placeholder="$SYMBOL"
                      value={symbol}
                      onChange={setSymbol}
                      inputRef={symbolRef}
                      required
                    />
                  </div>
                  <div className="w-full">
                    <button
                      type="button"
                      ref={logoRef}
                      onClick={() => setLogo(true)}
                      className="flex h-[156px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-white/12 bg-[#111111] px-4 text-center shadow-[0_10px_26px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.02)] transition hover:border-white/22 hover:bg-[#141414] md:h-[180px]"
                    >
                      <div className="mb-2.5 flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-[#151515] text-white/68">
                        <Upload className="h-[18px] w-[18px]" />
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-white">
                        <span>{logo ? "Logo uploaded" : "Upload logo"}</span>
                        <span className="inline-flex h-[17px] items-center rounded-full border border-white/10 bg-white/[0.035] px-1.5 text-[7px] font-semibold uppercase tracking-[0.14em] text-white/42">
                          Required
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-white/50">
                        {logo ? (
                          "Click to replace"
                        ) : (
                          <>
                            <span className="sm:hidden">Tap to upload</span>
                            <span className="hidden sm:inline">
                              Drag &amp; drop or click
                            </span>
                          </>
                        )}
                      </p>
                    </button>
                  </div>
                </div>
                <div
                  id="section-descriptions"
                  className="mt-4 border-t border-white/8 scroll-mt-24"
                >
                  <button
                    type="button"
                    aria-expanded={open.descriptions}
                    onClick={() => toggleSection("descriptions")}
                    className="group flex w-full items-center justify-between gap-4 py-3.5 text-left"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[14px] font-semibold text-white">
                        <span>Description &amp; Socials</span>
                        <span className="text-[10px] font-medium text-white/34">
                          (Optional)
                        </span>
                      </div>
                      <div className="mt-0.5 text-[12px] leading-5 text-white/54">
                        Add token description and social links.
                      </div>
                    </div>
                    <div className="flex min-w-0 shrink-0 items-center gap-3">
                      <span
                        className={`hidden max-w-[250px] truncate text-right text-xs font-medium text-white/52 transition-[opacity,transform] duration-300 sm:block ${open.descriptions ? "translate-x-1 opacity-0" : "translate-x-0 opacity-100"}`}
                      >
                        {descriptionSummary}
                      </span>
                      <span
                        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center text-white/46 transition-[color,transform] duration-300 group-hover:text-white/76 ${open.descriptions ? "rotate-180" : ""}`}
                        aria-hidden
                      >
                        {"\u25BE"}
                      </span>
                    </div>
                  </button>
                  <div
                    className="smooth-reveal min-w-0 max-w-full"
                    data-open={open.descriptions}
                    aria-hidden={!open.descriptions}
                    inert={!open.descriptions}
                  >
                    <div className="smooth-reveal-inner w-full min-w-0 max-w-full">
                      <div className="pb-3 pt-1">
                        <DescriptionSocialsPanel
                          descriptionText={descriptionText}
                          setDescriptionText={setDescriptionText}
                          socialValues={socialValues}
                          setSocialValue={setSocialValue}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <div className="mt-6">
                <div className="mb-3.5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/42">
                    Optional settings
                  </div>
                  <div className="mt-1 text-sm text-white/60">
                    Add unique features &amp; trading mechanics.
                  </div>
                </div>
                <div className="-mx-3 space-y-4 sm:mx-0">
                  {sections.map((s) => (
                    <div
                      key={s.key}
                      id={`section-${s.key}`}
                      className="scroll-mt-24"
                    >
                      <Expandable
                        title={s.title}
                        description={s.description}
                        summary={s.summary}
                        tag={s.tag}
                        open={open[s.key]}
                        onClick={() => toggleSection(s.key)}
                      >
                        {s.content}
                      </Expandable>
                    </div>
                  ))}
                </div>
              </div>
              <section className="mt-8">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">Launch plans</h2>
                    <div className="mt-1 text-sm text-white/54">
                      Choose the launch path and visibility level that fits your
                      token best.
                    </div>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {PLANS.map((p) => {
                    const active = plan === p.name;
                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => setPlan(p.name)}
                        className={`group relative overflow-hidden rounded-2xl border text-left transition-[border-color,background-color,box-shadow] duration-150 ease-out ${active ? `${p.border} bg-[#101010] shadow-[0_14px_28px_rgba(0,0,0,0.26)]` : "border-white/10 bg-[#101010] hover:border-white/16 hover:bg-[#131313]"}`}
                      >
                        <div
                          className={`absolute inset-x-0 top-0 h-[2px] ${p.bar}`}
                        />
                        <div className="relative p-[16px]">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div
                                className={`text-[17px] font-semibold leading-none ${active ? "text-white" : "text-white/96"}`}
                              >
                                {p.name}
                              </div>
                            </div>
                          </div>
                          <div className="text-[13px] leading-5 text-white/60">
                            {p.perk}
                          </div>
                          <div className="mt-3 border-t border-white/8 pt-2">
                            <div
                              className={`text-sm font-semibold ${active ? "text-white" : "text-white/92"}`}
                            >
                              {p.price}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
            <div className="hidden lg:block xl:hidden sticky top-8 self-start">
              <Sidebar
                name={name}
                symbol={symbol}
                chain={chain}
                ready={ready}
                missing={missing}
                dexFee={dexFee}
                dexSel={dexSel}
                marketCap={selectedMarketCap}
                feeBuilderValue={feeBuilderValue}
                feeBuilderIssues={feeBuilderIssues}
                initialBuy={initialBuy}
                supplyValue={supplyValue}
                plan={plan}
                descriptionAdded={descriptionAdded}
                lbpEnabledCount={lbpEnabledCount}
                advancedProtectionCount={advancedProtectionCount}
                walletFundingWarning={walletFundingWarning}
                walletDemoMode={walletDemoMode}
                setWalletDemoMode={setWalletDemoMode}
                onOpenFeeBuilder={openFeeBuilder}
                onOpenFeeBuilderIssue={openFeeBuilderIssue}
                onJump={jump}
              />
            </div>
            <div className="hidden xl:block">
              <div className="fixed top-8 right-[max(2rem,calc((100vw-88rem)/2+1.5rem))] z-30 w-[360px]">
                <Sidebar
                  name={name}
                  symbol={symbol}
                  chain={chain}
                  ready={ready}
                  missing={missing}
                  dexFee={dexFee}
                  dexSel={dexSel}
                  marketCap={selectedMarketCap}
                  feeBuilderValue={feeBuilderValue}
                  feeBuilderIssues={feeBuilderIssues}
                  initialBuy={initialBuy}
                  supplyValue={supplyValue}
                  plan={plan}
                  descriptionAdded={descriptionAdded}
                  lbpEnabledCount={lbpEnabledCount}
                  advancedProtectionCount={advancedProtectionCount}
                  walletFundingWarning={walletFundingWarning}
                  walletDemoMode={walletDemoMode}
                  setWalletDemoMode={setWalletDemoMode}
                  onOpenFeeBuilder={openFeeBuilder}
                  onOpenFeeBuilderIssue={openFeeBuilderIssue}
                  onJump={jump}
                />
              </div>
            </div>
          </div>
        </main>
        <MobileLaunchDock
          ready={ready}
          missing={missing}
          dexFee={dexFee}
          dexSel={dexSel}
          marketCap={selectedMarketCap}
          feeBuilderValue={feeBuilderValue}
          feeBuilderIssues={feeBuilderIssues}
          initialBuy={initialBuy}
          supplyValue={supplyValue}
          plan={plan}
          descriptionAdded={descriptionAdded}
          lbpEnabledCount={lbpEnabledCount}
          advancedProtectionCount={advancedProtectionCount}
          walletFundingWarning={walletFundingWarning}
          onOpenFeeBuilder={openFeeBuilder}
          onOpenFeeBuilderIssue={openFeeBuilderIssue}
          onJump={jump}
          onLaunch={jumpMissing}
        />
      </div>
      <WhitelistModal
        open={whitelistOpen}
        value={whitelistDraft}
        onChange={setWhitelistDraft}
        onClose={() => setWhitelistOpen(false)}
        onSave={saveWhitelist}
      />
    </>
  );
}
