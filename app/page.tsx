"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaXTwitter } from "react-icons/fa6";
import { useAppPreferences, type AmbientPreference, type AnimationPreference } from "./AppPreferences";
import {
  ArrowLeftRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Code2,
  Coins,
  Copy,
  Cookie,
  Flame,
  Globe,
  Hash,
  HandCoins,
  LayoutGrid,
  MessageCircleMore,
  Pin,
  Plus,
  Presentation,
  Network as NetworkGlyph,
  RotateCcw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";

type SortMode = "smart" | "pinned" | "favorites";
type ContentSortMode = "smart" | "hot" | "newest" | "full";
type SmartSpotlightKind = "created" | "graduated";
type Network = "eth" | "bsc" | "base" | "sol" | "robinhood" | "megaeth";
type LayoutTransition = Readonly<{ type: "spring"; stiffness: number; damping: number; mass: number }>;

type Board = {
  id: string;
  name: string;
  icon?: React.ReactNode;
  isPinned?: boolean;
  createdAt: number;
  lastActiveAt: number;
  tokensPublished: number;
};

type NotificationItem = {
  createdAt: number;
  id: string;
  type: "system" | "fees" | "rewards";
  title: string;
  body: string;
  timeLabel: string;
  unread?: boolean;
  token?: { symbol: string; href: string };
  board?: { slug: string; href: string };
};

type TokenCardData = {
  id: string;
  accent: string;
  palette: readonly [string, string, string];
  network: Network;
  kind: "lbp" | "token";
  title: string;
  ticker: string;
  by: string;
  board: string;
  desc: string;
  avatar: string;
  change: number;
  txs: number;
  volume: number;
  comments: number;
  mcCurrent: number;
  mcGoal: number;
  createdAt: number;
  startsAt?: number;
  graduatedAt?: number;
  hasBuys?: boolean;
  chartVariant?: 0 | 1 | 2;
  socials?: Partial<Record<"x" | "telegram" | "website" | "discord", string>>;
};

type FeeCollectTarget = {
  id: string;
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

type AppToast = {
  id: number;
  title: string;
  message: string;
  tone: "success";
};

type ToggleProps = { label: string; value: string; onChange: (v: string) => void; options: string[] };
type SortPillProps = { active: boolean; icon: React.ReactNode; label: string; onClick: () => void };

const now = Date.now();
const LAYOUT_SPRING: LayoutTransition = { type: "spring", stiffness: 280, damping: 38, mass: 1.1 };
const SMART_SPOTLIGHT_MS = 90_000;
const CHAINS: Network[] = ["robinhood", "base", "bsc", "sol", "eth", "megaeth"];
const NETWORK_ICONS: Record<Exclude<Network, "megaeth">, string> = {
  robinhood: "/networks/robinhood.png",
  base: "/networks/base.png",
  bsc: "/networks/bsc.png",
  sol: "/networks/sol.png",
  eth: "/networks/ethereum.png",
};
const NETWORK_EXPLORER_ADDRESS_ROOT: Record<Network, string> = {
  robinhood: "https://robinhoodchain.blockscout.com/address/",
  base: "https://basescan.org/address/",
  bsc: "https://bscscan.com/address/",
  sol: "https://solscan.io/account/",
  eth: "https://etherscan.io/address/",
  megaeth: "https://mega.etherscan.io/address/",
};
const CONTENT_SORTS: ContentSortMode[] = ["smart", "hot", "newest", "full"];

const createAllNetworkSet = () => new Set<Network>(CHAINS);

const GLOBAL_CSS = `
.bb-app {
  --bb-green: #4ade80;
  --bb-green-rgb: 74, 222, 128;
  --bb-red: #ff3771;
  --bb-red-rgb: 255, 55, 113;
}

[data-ui-hint] {
  position: relative;
}

[data-ui-hint]::before,
[data-ui-hint]::after {
  position: absolute;
  left: 50%;
  z-index: 80;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transform: translate(-50%, 4px);
  transition: opacity 150ms ease, transform 150ms ease, visibility 150ms ease;
}

[data-ui-hint]::after {
  content: attr(data-ui-hint);
  bottom: calc(100% + 9px);
  width: max-content;
  max-width: 230px;
  padding: 6px 8px;
  border: 1px solid rgba(255, 255, 255, 0.11);
  border-radius: 8px;
  background: rgba(14, 16, 16, 0.98);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.48), inset 0 1px rgba(255, 255, 255, 0.035);
  color: rgba(255, 255, 255, 0.72);
  font-size: 9px;
  font-weight: 500;
  line-height: 1.35;
  letter-spacing: 0.01em;
  text-align: center;
  white-space: normal;
  backdrop-filter: blur(14px);
}

[data-ui-hint]::before {
  content: "";
  bottom: calc(100% + 5px);
  width: 7px;
  height: 7px;
  border-right: 1px solid rgba(255, 255, 255, 0.11);
  border-bottom: 1px solid rgba(255, 255, 255, 0.11);
  background: #0e1010;
  transform: translate(-50%, 4px) rotate(45deg);
}

[data-ui-hint][data-ui-hint-side="bottom"]::after {
  top: calc(100% + 9px);
  bottom: auto;
  transform: translate(-50%, -4px);
}

[data-ui-hint][data-ui-hint-side="bottom"]::before {
  top: calc(100% + 5px);
  bottom: auto;
  transform: translate(-50%, -4px) rotate(225deg);
}

[data-ui-hint]:hover::before,
[data-ui-hint]:hover::after,
[data-ui-hint]:focus-visible::before,
[data-ui-hint]:focus-visible::after {
  opacity: 1;
  visibility: visible;
}

[data-ui-hint]:hover::after,
[data-ui-hint]:focus-visible::after {
  transform: translate(-50%, 0);
}

[data-ui-hint]:hover::before,
[data-ui-hint]:focus-visible::before {
  transform: translate(-50%, 0) rotate(45deg);
}

[data-ui-hint][data-ui-hint-side="bottom"]:hover::after,
[data-ui-hint][data-ui-hint-side="bottom"]:focus-visible::after {
  transform: translate(-50%, 0);
}

[data-ui-hint][data-ui-hint-side="bottom"]:hover::before,
[data-ui-hint][data-ui-hint-side="bottom"]:focus-visible::before {
  transform: translate(-50%, 0) rotate(225deg);
}

.bb-chain-badge {
  position: absolute;
  display: block;
}

.bb-scroll {
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}
.bb-scroll:hover,
.bb-scroll:focus-within {
  scrollbar-color: rgba(255, 255, 255, 0.28) transparent;
}
.bb-scroll::-webkit-scrollbar { width: 3px; }
.bb-scroll::-webkit-scrollbar-track { background: transparent; }
.bb-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0);
  border-radius: 9999px;
  transition: background-color 160ms ease;
}
.bb-scroll:hover::-webkit-scrollbar-thumb,
.bb-scroll:focus-within::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.28);
}

.bb-network-cycle-icon {
  will-change: opacity, transform, filter;
}

.bb-creator-payout {
  position: relative;
  isolation: isolate;
}

.bb-creator-payout__art {
  position: absolute;
  left: -9px;
  top: -14px;
  z-index: 2;
  width: 76px;
  height: 48px;
  max-width: none;
  pointer-events: none;
  object-fit: contain;
  filter: saturate(1.04);
}

.bb-creator-payout__copy {
  position: relative;
  z-index: 1;
}

.bb-create-launch {
  --bb-create-spectrum: linear-gradient(
    102deg,
    var(--bb-green) 0%,
    #7edb76 22%,
    #dfb858 50%,
    var(--bb-red) 78%,
    var(--bb-green) 100%
  );
  position: relative;
  overflow: visible;
  border: 1px solid rgba(255, 255, 255, 0.105);
  background: linear-gradient(180deg, rgba(24, 26, 25, 0.98) 0%, rgba(13, 15, 14, 0.99) 100%);
  box-shadow:
    inset 0 1px rgba(255, 255, 255, 0.065),
    inset 0 -1px rgba(0, 0, 0, 0.34),
    0 9px 24px rgba(0, 0, 0, 0.32);
  animation: bbCreateIdleShake 8.4s linear infinite;
  will-change: transform;
  transition:
    transform 180ms cubic-bezier(0.22, 1, 0.36, 1),
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.bb-create-launch__glow {
  position: absolute;
  left: 14%;
  right: 14%;
  bottom: -5px;
  height: 6px;
  z-index: -2;
  border-radius: 999px;
  pointer-events: none;
  background: var(--bb-create-spectrum);
  background-position: 50% 50%;
  background-size: 145% 100%;
  box-shadow: none;
  filter: blur(8px) saturate(1.04);
  opacity: 0.28;
  transform: translateZ(0);
  animation: bbCreateColorFlow 6.8s ease-in-out infinite;
  transition: opacity 220ms ease, filter 220ms ease;
}

.bb-create-launch__glow::before {
  content: none;
}

.bb-create-launch__edge {
  position: absolute;
  inset: -2px;
  z-index: 0;
  border-radius: inherit;
  pointer-events: none;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.04) 22%, rgba(0, 0, 0, 0.52) 52%, #000 74%, #000 100%);
  mask-image: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.04) 22%, rgba(0, 0, 0, 0.52) 52%, #000 74%, #000 100%);
  filter: drop-shadow(0 3px 6px rgba(223, 184, 88, 0.1));
  opacity: 0.86;
}

.bb-create-launch__edge::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 2px;
  background: linear-gradient(102deg, var(--bb-green) 0%, #7edb76 22%, #dfb858 50%, var(--bb-red) 78%, var(--bb-green) 100%);
  background-position: 0% 50%;
  background-size: 180% 100%;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: bbCreateColorFlow 6.8s ease-in-out infinite;
  will-change: background-position;
}

.bb-create-launch__wash {
  position: absolute;
  inset: 1px;
  z-index: 0;
  border-radius: inherit;
  pointer-events: none;
  background: radial-gradient(96% 72% at 50% -12%, rgba(255, 255, 255, 0.075), transparent 58%);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.14);
}

.bb-create-launch:hover {
  animation: bbCreateHoverShake 360ms linear infinite;
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow:
    inset 0 1px rgba(255, 255, 255, 0.08),
    inset 0 -1px rgba(0, 0, 0, 0.34),
    0 13px 32px rgba(0, 0, 0, 0.4);
}

.bb-create-launch:hover .bb-create-launch__glow {
  opacity: 0.42;
  filter: blur(9px) saturate(1.08);
}

.bb-create-launch:hover .bb-create-launch__edge { opacity: 0.96; }

.bb-create-launch__plus {
  transform-origin: center;
  shape-rendering: geometricPrecision;
  transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1), color 220ms ease, opacity 220ms ease;
}

.bb-create-launch:hover .bb-create-launch__plus {
  color: rgba(255, 255, 255, 1);
  transform: rotate(90deg) scale(1.14);
}

@keyframes bbCreateColorFlow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes bbCreateIdleShake {
  0%, 68%, 77%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
  69% { transform: translate3d(-1.4px, 0.3px, 0) rotate(-0.35deg); }
  70% { transform: translate3d(2px, -0.5px, 0) rotate(0.5deg); }
  71% { transform: translate3d(-2.4px, 0.5px, 0) rotate(-0.6deg); }
  72% { transform: translate3d(1.8px, -0.25px, 0) rotate(0.42deg); }
  73% { transform: translate3d(-1px, 0.2px, 0) rotate(-0.24deg); }
  74% { transform: translate3d(2.2px, 0, 0) rotate(0.5deg); }
  75% { transform: translate3d(-1.7px, -0.35px, 0) rotate(-0.4deg); }
  76% { transform: translate3d(0.7px, 0.2px, 0) rotate(0.16deg); }
}

@keyframes bbCreateHoverShake {
  0%, 100% { transform: translate3d(0, -1px, 0) scale(1.012) rotate(0deg); }
  20% { transform: translate3d(-1.8px, -1.3px, 0) scale(1.012) rotate(-0.45deg); }
  40% { transform: translate3d(2.1px, -0.7px, 0) scale(1.012) rotate(0.5deg); }
  60% { transform: translate3d(-1.3px, -1.1px, 0) scale(1.012) rotate(-0.32deg); }
  80% { transform: translate3d(1.6px, -0.8px, 0) scale(1.012) rotate(0.38deg); }
}

.bb-lbp-sparks {
  position: absolute;
  top: 50%;
  z-index: 12;
  width: 1px;
  height: 1px;
  pointer-events: none;
  transform: translate(-50%, -50%);
}

.bb-lbp-sparks::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: var(--spark-core-size, 6px);
  height: var(--spark-core-size, 6px);
  border-radius: 999px;
  background: radial-gradient(circle, #fff 0 8%, #d8ffe4 18%, var(--bb-green) 38%, rgba(var(--bb-green-rgb), 0.4) 58%, transparent 74%);
  filter: drop-shadow(0 0 3px rgba(var(--bb-green-rgb), 0.88));
  transform: translate(-50%, -50%);
  animation: bbWeldCore 170ms steps(2, end) infinite;
}

.bb-lbp-sparks::after {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: var(--spark-halo-width, 10px);
  height: var(--spark-halo-height, 4px);
  border-radius: 999px;
  background: radial-gradient(ellipse, rgba(216, 255, 228, 0.62), rgba(var(--bb-green-rgb), 0.2) 48%, transparent 74%);
  filter: blur(1px);
  transform: translate(-50%, -50%);
  animation: bbWeldHalo 240ms ease-in-out -90ms infinite;
}

.bb-lbp-spark {
  position: absolute;
  left: 0;
  top: 0;
  display: block;
  border-radius: 999px;
  background: #a7f3bd;
  box-shadow: 0 0 4px rgba(var(--bb-green-rgb), 0.92);
  mix-blend-mode: screen;
  transform-origin: center;
  will-change: transform, opacity;
  animation: bbWeldSpark var(--spark-duration) cubic-bezier(0.16, 0.72, 0.24, 1) var(--spark-delay) infinite;
}

.bb-lbp-spark:nth-child(4n) {
  background: #f0fff4;
  box-shadow: 0 0 5px rgba(190, 255, 207, 0.94);
}

.bb-progress-dot-pulse::after,
.bb-status-dot-pulse::after {
  content: "";
  position: absolute;
  inset: -4px;
  border: 1px solid currentColor;
  border-radius: 999px;
  opacity: 0;
  pointer-events: none;
  animation: bbCardDotHalo 1.55s cubic-bezier(0.2, 0.7, 0.3, 1) infinite;
}

.bb-progress-dot-pulse {
  color: rgba(var(--bb-green-rgb), 0.72);
}

.bb-status-dot-pulse {
  position: relative;
}

.bb-status-dot-pulse--scheduled {
  color: rgba(253, 230, 138, 0.58);
}

.bb-status-dot-pulse--live {
  color: rgba(var(--bb-green-rgb), 0.72);
}

.bb-chart-endpoint {
  transform-origin: center;
  animation: bbChartEndpointPulse 1.8s ease-in-out infinite;
}

@keyframes bbWeldCore {
  0%, 100% { opacity: 0.72; scale: 0.84; }
  34% { opacity: 1; scale: 1.16; }
  68% { opacity: 0.82; scale: 0.96; }
}

@keyframes bbWeldHalo {
  0%, 100% { opacity: 0.38; scale: 0.82; }
  44% { opacity: 0.82; scale: 1.16; }
}

@keyframes bbWeldSpark {
  0% {
    opacity: 0;
    transform: translate(var(--spark-start-x), 1px) scale(0.2) rotate(0deg);
  }
  14% {
    opacity: var(--spark-peak-opacity);
    transform: translate(var(--spark-mid-x), var(--spark-mid-y)) scale(1.1) rotate(var(--spark-mid-rotate));
  }
  48% {
    opacity: var(--spark-late-opacity);
    transform: translate(var(--spark-late-x), var(--spark-late-y)) scale(0.72) rotate(var(--spark-late-rotate));
  }
  100% {
    opacity: 0;
    transform: translate(var(--spark-end-x), var(--spark-end-y)) scale(0.12) rotate(var(--spark-end-rotate));
  }
}

@keyframes bbCardDotHalo {
  0% { opacity: 0.48; transform: scale(0.58); }
  68%, 100% { opacity: 0; transform: scale(1.82); }
}

@keyframes bbChartEndpointPulse {
  0%, 100% { opacity: 0.9; transform: scale(0.94); }
  50% { opacity: 1; transform: scale(1.06); }
}

.bb-smart-spotlight[data-smart-event="created"] {
  animation: bbSmartCreatedShake 760ms linear 1;
  transform-origin: 50% 50%;
}

.bb-smart-spotlight[data-smart-event="graduated"] {
  animation: bbSmartGraduatedShake 900ms linear 1;
  transform-origin: 50% 50%;
}

@keyframes bbSmartCreatedShake {
  0%, 100% { translate: 0 0; rotate: 0deg; }
  10% { translate: -5px 2px; rotate: -0.8deg; }
  20% { translate: 6px -2px; rotate: 1deg; }
  30% { translate: -6px -1px; rotate: -1deg; }
  40% { translate: 5px 2px; rotate: 0.75deg; }
  50% { translate: -4px 1px; rotate: -0.6deg; }
  62% { translate: 4px -1px; rotate: 0.55deg; }
  74% { translate: -3px 0; rotate: -0.35deg; }
  86% { translate: 2px 0; rotate: 0.2deg; }
}

@keyframes bbSmartGraduatedShake {
  0%, 100% { translate: 0 0; rotate: 0deg; }
  9% { translate: -6px 2px; rotate: -1deg; }
  18% { translate: 7px -2px; rotate: 1.15deg; }
  27% { translate: -7px -1px; rotate: -1.2deg; }
  36% { translate: 6px 2px; rotate: 0.95deg; }
  45% { translate: -5px 1px; rotate: -0.75deg; }
  56% { translate: 5px -2px; rotate: 0.7deg; }
  67% { translate: -4px 0; rotate: -0.5deg; }
  78% { translate: 3px 1px; rotate: 0.3deg; }
  89% { translate: -2px 0; rotate: -0.15deg; }
}

[data-animation="reduced"] .bb-create-launch { animation: none; }
[data-animation="reduced"] .bb-create-launch__glow,
[data-animation="reduced"] .bb-create-launch__edge::before { animation-duration: 5s; }
[data-animation="reduced"] .bb-smart-spotlight { animation: none; }
[data-animation="reduced"] .bb-lbp-sparks { display: none; }
[data-animation="reduced"] .bb-progress-dot-pulse::after,
[data-animation="reduced"] .bb-status-dot-pulse::after,
[data-animation="reduced"] .bb-chart-endpoint { animation: none; }

[data-animation="off"] .bb-create-launch,
[data-animation="off"] .bb-create-launch__glow,
[data-animation="off"] .bb-create-launch__edge::before,
[data-animation="off"] .bb-smart-spotlight { animation: none; }
[data-animation="off"] .bb-lbp-sparks { display: none; }
[data-animation="off"] .bb-progress-dot-pulse::after,
[data-animation="off"] .bb-status-dot-pulse::after,
[data-animation="off"] .bb-chart-endpoint { animation: none; }

[data-animation="off"] .bb-creator-payout__art { visibility: hidden; }

@media (prefers-reduced-motion: reduce) {
  .bb-create-launch,
  .bb-create-launch__glow,
  .bb-create-launch__edge::before,
  .bb-smart-spotlight {
    animation: none;
  }
  .bb-lbp-sparks { display: none; }
  .bb-progress-dot-pulse::after,
  .bb-status-dot-pulse::after,
  .bb-chart-endpoint { animation: none; }
}
`;

const BOARDS: Board[] = [
  { id: "based", name: "Based", icon: <Hash className="h-4 w-4" />, isPinned: true, createdAt: now - 1000 * 60 * 60 * 24 * 30, lastActiveAt: now - 1000 * 60 * 5, tokensPublished: 128 },
  { id: "digital", name: "Digital", createdAt: now - 1000 * 60 * 60 * 24 * 7, lastActiveAt: now - 1000 * 60 * 60, tokensPublished: 42 },
  { id: "abt", name: "ABTCapital", createdAt: now - 1000 * 60 * 60 * 24 * 2, lastActiveAt: now - 1000 * 60 * 30, tokensPublished: 96 },
  { id: "prempad", name: "PremPad", createdAt: now - 1000 * 60 * 60 * 24 * 14, lastActiveAt: now - 1000 * 60 * 60 * 6, tokensPublished: 18 },
  { id: "uaecalls", name: "UAECALLS", createdAt: now - 1000 * 60 * 60 * 24 * 1, lastActiveAt: now - 1000 * 60 * 10, tokensPublished: 73 },
  { id: "tomcruise", name: "Tomcruise", createdAt: now - 1000 * 60 * 60 * 24 * 21, lastActiveAt: now - 1000 * 60 * 60 * 12, tokensPublished: 51 },
  { id: "defimentor", name: "DeFiMentor", createdAt: now - 1000 * 60 * 60 * 24 * 4, lastActiveAt: now - 1000 * 60 * 60 * 2, tokensPublished: 67 },
  { id: "mlmx", name: "MLMX", createdAt: now - 1000 * 60 * 60 * 24 * 10, lastActiveAt: now - 1000 * 60 * 60 * 24, tokensPublished: 12 },
  { id: "alpha", name: "Alpha Calls", createdAt: now - 1000 * 60 * 60 * 24 * 3, lastActiveAt: now - 1000 * 60 * 45, tokensPublished: 38 },
  { id: "beta", name: "Beta Labs", createdAt: now - 1000 * 60 * 60 * 24 * 18, lastActiveAt: now - 1000 * 60 * 60 * 9, tokensPublished: 22 },
  { id: "gamma", name: "Gamma Group", createdAt: now - 1000 * 60 * 60 * 24 * 6, lastActiveAt: now - 1000 * 60 * 60 * 3, tokensPublished: 44 },
  { id: "delta", name: "Delta Syndicate", createdAt: now - 1000 * 60 * 60 * 24 * 12, lastActiveAt: now - 1000 * 60 * 60 * 7, tokensPublished: 15 },
  { id: "omega", name: "Omega DAO", createdAt: now - 1000 * 60 * 60 * 24 * 20, lastActiveAt: now - 1000 * 60 * 60 * 15, tokensPublished: 9 },
  { id: "sigma", name: "Sigma Snipers", createdAt: now - 1000 * 60 * 60 * 24 * 8, lastActiveAt: now - 1000 * 60 * 60 * 4, tokensPublished: 58 },
  { id: "zen", name: "Zen Trades", createdAt: now - 1000 * 60 * 60 * 24 * 5, lastActiveAt: now - 1000 * 60 * 60 * 1, tokensPublished: 33 },
];

const TOKEN_CARDS: TokenCardData[] = [
  {
    id: "gradient", accent: "#4ade80", palette: ["#4ade80", "#22d3ee", "#3975f6"], network: "base", kind: "lbp", title: "Gradient", ticker: "GRAD", by: "milo", board: "based",
    desc: "Experimental social token for builders shipping clean UI and fast loops.", avatar: "G", change: 12.4, txs: 1320, volume: 284000, comments: 84,
    mcCurrent: 780000, mcGoal: 1000000, createdAt: now - 1000 * 60 * 34,
    socials: { x: "https://x.com/basedbid", telegram: "https://t.me/basedbid", website: "https://based.bid" },
  },
  {
    id: "signal-room", accent: "#a78bfa", palette: ["#a78bfa", "#ec4899", "#3975f6"], network: "base", kind: "token", title: "Signal Room", ticker: "ROOM", by: "nora", board: "alpha",
    desc: "Private alpha stream for traders tracking launches and social rotation.", avatar: "S", change: -6.8, txs: 842, volume: 126000, comments: 41,
    mcCurrent: 604000, mcGoal: 0, createdAt: now - 1000 * 60 * 60 * 8, chartVariant: 1,
    socials: { x: "https://x.com/basedbid", telegram: "https://t.me/basedbid" },
  },
  {
    id: "cashcat", accent: "#ccff00", palette: ["#ccff00", "#4ade80", "#f8fafc"], network: "robinhood", kind: "token", title: "Cashcat", ticker: "CASHCAT", by: "robin", board: "digital",
    desc: "A high-tempo community economy built for onchain culture and rewards.", avatar: "C", change: 34.6, txs: 4820, volume: 1180000, comments: 319,
    mcCurrent: 2300000, mcGoal: 0, createdAt: now - 1000 * 60 * 12, graduatedAt: now - 1000 * 5, chartVariant: 2,
    socials: { x: "https://x.com/basedbid", website: "https://based.bid" },
  },
  {
    id: "chain-reaction", accent: "#f3ba2f", palette: ["#f3ba2f", "#f97316", "#ef4444"], network: "bsc", kind: "lbp", title: "Chain Reaction", ticker: "REACT", by: "zain", board: "uaecalls",
    desc: "A liquidity-first launch for builders coordinating across emerging markets.", avatar: "CR", change: 8.2, txs: 0, volume: 0, comments: 28,
    mcCurrent: 0, mcGoal: 900000, createdAt: now - 1000 * 60 * 52, startsAt: now + 1000 * (5 * 60 + 37),
    socials: { telegram: "https://t.me/basedbid", website: "https://based.bid" },
  },
  {
    id: "solstice", accent: "#43e7c4", palette: ["#43e7c4", "#8b5cf6", "#38bdf8"], network: "sol", kind: "token", title: "Solstice", ticker: "SOLST", by: "aria", board: "zen",
    desc: "Fast-moving creator rails for launches, communities, and tokenized media.", avatar: "SO", change: 19.4, txs: 2780, volume: 672000, comments: 156,
    mcCurrent: 1700000, mcGoal: 0, createdAt: now - 1000 * 60 * 18, chartVariant: 0,
    socials: { x: "https://x.com/basedbid", telegram: "https://t.me/basedbid", discord: "https://discord.com" },
  },
  {
    id: "ether-atlas", accent: "#8199ee", palette: ["#8199ee", "#c4b5fd", "#e2e8f0"], network: "eth", kind: "lbp", title: "Ether Atlas", ticker: "ATLAS", by: "rune", board: "defimentor",
    desc: "An open research economy mapping the next generation of Ethereum protocols.", avatar: "EA", change: 4.8, txs: 466, volume: 215000, comments: 73,
    mcCurrent: 4800000, mcGoal: 5000000, createdAt: now - 1000 * 60 * 60 * 2,
    socials: { x: "https://x.com/basedbid", website: "https://based.bid" },
  },
  {
    id: "mega-mode", accent: "#e5e7eb", palette: ["#e5e7eb", "#94a3b8", "#4ade80"], network: "megaeth", kind: "token", title: "Mega Mode", ticker: "MODE", by: "nova", board: "prempad",
    desc: "Realtime coordination for teams operating at the edge of high-speed execution.", avatar: "M", change: 27.1, txs: 6310, volume: 940000, comments: 204,
    mcCurrent: 3100000, mcGoal: 0, createdAt: now - 1000 * 12, chartVariant: 2,
    socials: { x: "https://x.com/basedbid", telegram: "https://t.me/basedbid" },
  },
  {
    id: "robin-index", accent: "#b8f33d", palette: ["#b8f33d", "#4ade80", "#facc15"], network: "robinhood", kind: "lbp", title: "Robin Index", ticker: "RDX", by: "cass", board: "sigma",
    desc: "A community-curated basket tracking the strongest tokenized market themes.", avatar: "RI", change: 6.5, txs: 958, volume: 338000, comments: 91,
    mcCurrent: 1320000, mcGoal: 1500000, createdAt: now - 1000 * 60 * 60 * 3,
    socials: { website: "https://based.bid", discord: "https://discord.com" },
  },
  {
    id: "based-builders", accent: "#3975f6", palette: ["#3975f6", "#22d3ee", "#f8fafc"], network: "base", kind: "token", title: "Based Builders", ticker: "BUILD", by: "soren", board: "based",
    desc: "An ownership layer for products, experiments, and the people who ship them.", avatar: "B", change: 15.7, txs: 3460, volume: 526000, comments: 187,
    mcCurrent: 1440000, mcGoal: 0, createdAt: now - 1000 * 60 * 27, chartVariant: 1,
    socials: { x: "https://x.com/basedbid", website: "https://based.bid" },
  },
  {
    id: "liquid-gold", accent: "#f2c94c", palette: ["#f2c94c", "#f59e0b", "#fde68a"], network: "bsc", kind: "token", title: "Liquid Gold", ticker: "GLD", by: "mina", board: "beta",
    desc: "A programmable treasury network designed around transparent market liquidity.", avatar: "LG", change: -3.2, txs: 1180, volume: 403000, comments: 62,
    mcCurrent: 980000, mcGoal: 0, createdAt: now - 1000 * 60 * 60 * 11, chartVariant: 0,
    socials: { telegram: "https://t.me/basedbid", website: "https://based.bid" },
  },
  {
    id: "neon-relay", accent: "#35d8f2", palette: ["#35d8f2", "#d946ef", "#8b5cf6"], network: "sol", kind: "lbp", title: "Neon Relay", ticker: "RELAY", by: "kai", board: "gamma",
    desc: "Community-owned routing infrastructure for fast, social-first token launches.", avatar: "NR", change: 10.9, txs: 726, volume: 184000, comments: 54,
    mcCurrent: 490000, mcGoal: 777000, createdAt: now - 1000 * 60 * 44,
    socials: { x: "https://x.com/basedbid", telegram: "https://t.me/basedbid" },
  },
  {
    id: "mainnet-signals", accent: "#7689e8", palette: ["#7689e8", "#a78bfa", "#22d3ee"], network: "eth", kind: "token", title: "Mainnet Signals", ticker: "MSIG", by: "theo", board: "omega",
    desc: "Curated market intelligence for teams navigating serious onchain liquidity.", avatar: "MS", change: 7.4, txs: 1540, volume: 890000, comments: 112,
    mcCurrent: 4200000, mcGoal: 0, createdAt: now - 1000 * 60 * 60 * 5, chartVariant: 2,
    socials: { x: "https://x.com/basedbid", website: "https://based.bid", discord: "https://discord.com" },
  },
];

const FEE_COLLECT_TARGETS: FeeCollectTarget[] = [
  {
    id: "aero-pool",
    project: "Aero Pool",
    symbol: "AERO",
    network: "base",
    contract: "0x09d4...af12",
    usdValue: 763.04,
    nativeAmount: "0.182 ETH",
    tokenAmount: "1,540.88 AERO",
    avatar: "A",
    accent: "#4ade80",
  },
  {
    id: "morpho-vault",
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
    id: "based-pepe",
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
];

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");
const shortAddr = (addr: string) => (addr.length <= 10 ? addr : `${addr.slice(0, 6)}...${addr.slice(-4)}`);
const networkName = (n: Network) => (n === "eth" ? "Ethereum" : n === "megaeth" ? "MegaETH" : n === "base" ? "Base" : n === "bsc" ? "BNB" : n === "robinhood" ? "Robinhood" : "Solana");

function getSortedBoards(input: Board[], query: string, sortMode: SortMode) {
  const q = query.trim().toLowerCase();
  const filtered = q ? input.filter((b) => b.name.toLowerCase().includes(q)) : [...input];
  const based = filtered.find((b) => b.id === "based");
  const others = filtered.filter((b) => b.id !== "based");
  const pinned = others.filter((b) => b.isPinned);
  const rest = others.filter((b) => !b.isPinned);
  const byProductivity = (a: Board, b: Board) => b.tokensPublished - a.tokensPublished || b.lastActiveAt - a.lastActiveAt || a.name.localeCompare(b.name);

  if (sortMode === "smart") {
    const activityRank = new Map(
      [...others]
        .sort((a, b) => b.lastActiveAt - a.lastActiveAt)
        .map((board, index) => [board.id, others.length - index]),
    );
    const sorted = [...others].sort((a, b) => {
      const aScore = a.tokensPublished * 0.7 + (activityRank.get(a.id) ?? 0) * 8 + (a.isPinned ? 6 : 0);
      const bScore = b.tokensPublished * 0.7 + (activityRank.get(b.id) ?? 0) * 8 + (b.isPinned ? 6 : 0);
      return bScore - aScore || byProductivity(a, b);
    });
    return based ? [based, ...sorted] : sorted;
  }
  if (sortMode === "favorites") {
    const favPinned = [...pinned].sort((a, b) => a.name.localeCompare(b.name));
    const favRest = [...rest].sort((a, b) => a.name.localeCompare(b.name));
    return based ? [based, ...favPinned, ...favRest] : [...favPinned, ...favRest];
  }
  return based ? [based, ...[...pinned].sort(byProductivity), ...[...rest].sort(byProductivity)] : [...pinned, ...rest].sort(byProductivity);
}

const markAllAsRead = (items: NotificationItem[]) => items.map((n) => ({ ...n, unread: false }));

function runSelfTests() {
  const base: Board[] = [
    { id: "based", name: "Based", isPinned: true, createdAt: 10, lastActiveAt: 10, tokensPublished: 999 },
    { id: "a", name: "A", isPinned: true, createdAt: 1, lastActiveAt: 2, tokensPublished: 5 },
    { id: "c", name: "C", isPinned: true, createdAt: 3, lastActiveAt: 9, tokensPublished: 50 },
    { id: "b", name: "B", isPinned: false, createdAt: 2, lastActiveAt: 1, tokensPublished: 40 },
    { id: "d", name: "D", isPinned: false, createdAt: 3, lastActiveAt: 9, tokensPublished: 80 },
  ];
  const pinned = getSortedBoards(base, "", "pinned");
  console.assert(pinned[0]?.id === "based", "based should stay first");
  console.assert(pinned[1]?.id === "c" && pinned[2]?.id === "a", "pinned bucket sorts by productivity desc");
  console.assert(pinned[3]?.id === "d" && pinned[4]?.id === "b", "pinned rest bucket sorts by productivity desc");
  console.assert(getSortedBoards(base, "b", "pinned").length === 2, "query filter should work");
  console.assert(getSortedBoards(base, "", "smart")[0]?.id === "based", "based should stay first in smart");
  console.assert(getSortedBoards(base, "", "favorites")[0]?.id === "based", "based should stay first in favorites");
  console.assert(markAllAsRead([{ id: "1", createdAt: 1, type: "system", title: "t", body: "b", timeLabel: "now", unread: true }])[0].unread === false, "markAllAsRead should clear unread");
  console.assert((({ token: { href: "/tokens/T" }, board: { href: "/b/x" } } as NotificationItem).token?.href ?? "/b/x") === "/tokens/T", "notification should navigate to token href first");
  console.assert(CONTENT_SORTS.includes("full"), "content sort modes should exist");
  console.assert("/trade" === "/trade", "based trade button should point to /trade");
}

function GitHubMark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 .5C5.65.5.5 5.66.5 12.02c0 5.09 3.29 9.41 7.86 10.94.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.34-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.17 1.18a10.9 10.9 0 0 1 5.78 0c2.2-1.5 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.44-2.68 5.41-5.24 5.69.41.35.78 1.05.78 2.11 0 1.52-.01 2.74-.01 3.12 0 .31.21.68.8.56A11.52 11.52 0 0 0 23.5 12C23.5 5.66 18.35.5 12 .5Z" />
    </svg>
  );
}

function NetworkIcon({ network, className = "h-5 w-5" }: { network: Network; className?: string }) {
  if (network === "megaeth") {
    return <span aria-hidden="true" className={cx("grid shrink-0 place-items-center rounded-full bg-[#151515] text-[9px] font-bold text-white/88 ring-1 ring-white/20", className)}>M</span>;
  }
  return <Image unoptimized src={NETWORK_ICONS[network]} alt="" width={24} height={24} className={cx("shrink-0 rounded-full object-cover", className)} />;
}

function NetworkCycleMark({ selected }: { selected: ReadonlySet<Network> }) {
  const selectedNetworks = CHAINS.filter((chain) => selected.has(chain));
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (selectedNetworks.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % selectedNetworks.length);
    }, 2200);
    return () => window.clearInterval(timer);
  }, [selectedNetworks.length]);

  const current = selectedNetworks[index % Math.max(selectedNetworks.length, 1)];
  return (
    <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center overflow-visible" aria-hidden="true">
      <AnimatePresence initial={false}>
        {current ? (
          <motion.span
            key={current}
            className="bb-network-cycle-icon absolute inset-0 inline-flex items-center justify-center"
            initial={{ opacity: 0, y: 3, scale: 0.82, filter: "blur(2px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -3, scale: 0.88, filter: "blur(2px)" }}
            transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
          >
            <NetworkIcon network={current} className="h-4 w-4" />
          </motion.span>
        ) : (
          <motion.span key="empty-network" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 inline-flex items-center justify-center">
            <NetworkGlyph className="h-4 w-4 text-white/32" strokeWidth={1.8} />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

function NetworkFilter({ selected, onToggle, onSelectAll }: { selected: ReadonlySet<Network>; onToggle: (network: Network) => void; onSelectAll: () => void }) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const allSelected = selected.size === CHAINS.length;
  const selectedNetworks = CHAINS.filter((chain) => selected.has(chain));
  const label = allSelected ? "All networks" : selectedNetworks.length === 0 ? "No networks" : selectedNetworks.length === 1 ? networkName(selectedNetworks[0]) : `${selectedNetworks.length} networks`;

  React.useEffect(() => {
    if (!open) return;
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
  }, [open]);

  return (
    <div ref={rootRef} className="relative z-40 shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
        className={cx(
          "group inline-flex h-[30px] w-[138px] cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-[11px] font-medium tracking-[0.01em] ring-1 ring-inset transition-[background-color,color,box-shadow] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80]/45",
          allSelected ? "bg-white/[0.018] text-white/58 ring-white/[0.075] hover:bg-white/[0.045] hover:text-white/86 hover:ring-white/[0.13]" : "bg-[#4ade80]/[0.045] text-white/88 ring-[#4ade80]/25 hover:bg-[#4ade80]/[0.075] hover:ring-[#4ade80]/38",
        )}
      >
        <NetworkCycleMark selected={selected} />
        <span className="min-w-0 flex-1 truncate text-left">{label}</span>
        <ChevronDown className={cx("h-3 w-3 shrink-0 text-white/32 transition-transform duration-300", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="dialog"
            aria-label="Network filters"
            initial={{ opacity: 0, y: -7, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.99 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-[calc(100%+8px)] w-[304px] overflow-hidden rounded-[13px] border border-white/[0.095] bg-[#0c0e0e]/98 shadow-[0_24px_70px_rgba(0,0,0,0.58)] backdrop-blur-2xl"
          >
            <div className="flex h-[52px] items-center justify-between border-b border-white/[0.065] px-3.5">
              <div>
                <div className="text-[11px] font-semibold text-white/84">Networks</div>
                <div className="mt-0.5 text-[9px] text-white/34">{selected.size} of {CHAINS.length} selected</div>
              </div>
              <button type="button" onClick={onSelectAll} disabled={allSelected} className={cx("text-[10px] font-medium transition", allSelected ? "cursor-default text-white/22" : "cursor-pointer text-[#4ade80]/72 hover:text-[#4ade80]")}>Select all</button>
            </div>
            <div className="grid grid-cols-2 gap-1 p-2">
              {CHAINS.map((chain) => {
                const active = selected.has(chain);
                return (
                  <button
                    key={chain}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onToggle(chain)}
                    className={cx(
                      "flex h-10 min-w-0 cursor-pointer items-center gap-2 rounded-[8px] px-2.5 text-left text-[10.5px] font-medium ring-1 ring-inset transition-[background-color,color,box-shadow]",
                      active ? "bg-[#4ade80]/[0.045] text-white/88 ring-[#4ade80]/10 hover:bg-[#4ade80]/[0.075]" : "text-white/38 ring-transparent hover:bg-white/[0.035] hover:text-white/70",
                    )}
                  >
                    <span className={cx("transition-[filter,opacity]", !active && "grayscale opacity-40")}><NetworkIcon network={chain} className="h-[19px] w-[19px]" /></span>
                    <span className="min-w-0 flex-1 truncate">{networkName(chain)}</span>
                    <Check className={cx("h-3 w-3 shrink-0 text-[#4ade80] transition-opacity", active ? "opacity-100" : "opacity-0")} />
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

const formatCompact = (value: number, currency = false) => {
  const prefix = currency ? "$" : "";
  if (value >= 1_000_000_000) return `${prefix}${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${prefix}${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  if (value >= 1_000) return `${prefix}${(value / 1_000).toFixed(value >= 100_000 ? 0 : 1)}K`;
  return `${prefix}${value}`;
};

const formatUsd = (value: number) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(value);

const formatCountdown = (remainingMs: number) => {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const clock = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  return hours > 0 ? `${hours}:${clock}` : clock;
};

const tokenTint = (accent: string, strength: number) => `color-mix(in srgb, ${accent} ${strength}%, transparent)`;

const tokenAmbient = ([primary, secondary, tertiary]: TokenCardData["palette"]) => [
  `radial-gradient(76% 112% at 4% 2%, ${tokenTint(primary, 20)}, transparent 70%)`,
  `radial-gradient(72% 104% at 54% -2%, ${tokenTint(secondary, 15)}, transparent 72%)`,
  `radial-gradient(68% 96% at 102% 12%, ${tokenTint(tertiary, 12)}, transparent 74%)`,
].join(", ");

const getTokenAddress = (id: string) => {
  let hash = 2166136261;
  let hex = "";
  for (let index = 0; index < 40; index += 1) {
    hash ^= id.charCodeAt(index % id.length) + index;
    hash = Math.imul(hash, 16777619);
    hex += ((hash >>> 0) & 15).toString(16);
  }
  return `0x${hex}`;
};

const getTokenExplorerUrl = (network: Network, address: string) => `${NETWORK_EXPLORER_ADDRESS_ROOT[network]}${address}`;

function CardSocialLinks({ card }: { card: TokenCardData }) {
  const entries = [
    card.socials?.x ? { key: "x", href: card.socials.x, label: "X", icon: <FaXTwitter className="h-3 w-3" /> } : null,
    card.socials?.telegram ? { key: "telegram", href: card.socials.telegram, label: "Telegram", icon: <Send className="h-3 w-3" /> } : null,
    card.socials?.website ? { key: "website", href: card.socials.website, label: "Website", icon: <Globe className="h-3 w-3" /> } : null,
    card.socials?.discord ? { key: "discord", href: card.socials.discord, label: "Discord", icon: <MessageCircleMore className="h-3 w-3" /> } : null,
  ].filter(Boolean) as Array<{ key: string; href: string; label: string; icon: React.ReactNode }>;

  if (!entries.length) return null;
  const [primary, ...secondary] = entries;

  return (
    <div className="group/socials relative grid h-4 w-4 shrink-0 place-items-center text-white/30">
      {secondary.length ? (
        <span className="absolute right-[18px] flex max-w-0 translate-x-1 flex-row-reverse items-center justify-end gap-1.5 overflow-hidden opacity-0 transition-[max-width,opacity,transform] duration-200 group-hover:max-w-[72px] group-hover:translate-x-0 group-hover:opacity-100 group-hover/socials:max-w-[72px] group-hover/socials:translate-x-0 group-hover/socials:opacity-100">
          {secondary.map((entry) => (
            <a key={entry.key} href={entry.href} target="_blank" rel="noreferrer" aria-label={entry.label} data-ui-hint={entry.label} className="inline-flex shrink-0 transition-colors hover:text-white/76">
              {entry.icon}
            </a>
          ))}
        </span>
      ) : null}
      <a href={primary.href} target="_blank" rel="noreferrer" aria-label={primary.label} data-ui-hint={primary.label} className="relative z-10 inline-flex transition-colors hover:text-white/76">
        {primary.icon}
      </a>
    </div>
  );
}

function TokenAvatar({ card }: { card: TokenCardData }) {
  return (
    <div className="relative h-10 w-10 shrink-0 overflow-visible">
      <div className="grid h-10 w-10 place-items-center text-[13px] font-semibold tracking-[-0.02em]" style={{ color: card.accent, textShadow: `0 0 14px ${tokenTint(card.accent, 38)}` }}>
        {card.avatar}
      </div>
      <span className="bb-chain-badge -bottom-px -right-px z-20 h-[14px] w-[14px] drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]" data-ui-hint={networkName(card.network)}>
        <NetworkIcon network={card.network} className="h-[14px] w-[14px]" />
      </span>
    </div>
  );
}

function ContractAddress({ card }: { card: TokenCardData }) {
  const [copied, setCopied] = React.useState(false);
  const address = getTokenAddress(card.id);
  const short = `${address.slice(0, 6)}...${address.slice(-4)}`;

  const copy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <span className="inline-flex shrink-0 items-center gap-1 text-[10px] leading-none tabular-nums text-white/38">
      <a
        href={getTokenExplorerUrl(card.network, address)}
        target="_blank"
        rel="noreferrer"
        data-ui-hint={`View on ${networkName(card.network)} explorer`}
        className="transition-colors hover:text-white/68"
      >
        {short}
      </a>
      <button type="button" onClick={copy} aria-label={`Copy ${card.title} contract address`} data-ui-hint={copied ? "Copied" : "Copy address"} className="inline-flex h-3.5 w-3.5 cursor-pointer items-center justify-center text-white/25 transition-colors hover:text-white/68">
        {copied ? <Check className="h-2.5 w-2.5 text-[#4ade80]" /> : <Copy className="h-2.5 w-2.5" />}
      </button>
    </span>
  );
}

function CardStat({ kind, value }: { kind: "txs" | "volume"; value: string }) {
  const icon = kind === "txs" ? <ArrowLeftRight className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />;
  return <span className="inline-flex items-center gap-1 text-[10.5px] text-white/34">{icon}<span className="tabular-nums">{value}</span></span>;
}

const LBP_SPARK_PATTERN = [
  { x: -1, drift: -7, lift: -12, size: 1.6, delay: 0.02, rotate: -42 },
  { x: 1, drift: 6, lift: -16, size: 1.4, delay: 0.19, rotate: 34 },
  { x: -3, drift: -3, lift: -20, size: 1.2, delay: 0.36, rotate: -18 },
  { x: 3, drift: 10, lift: -11, size: 1.7, delay: 0.53, rotate: 58 },
  { x: 0, drift: 1, lift: -24, size: 1.25, delay: 0.68, rotate: 12 },
  { x: -2, drift: -11, lift: -17, size: 1.45, delay: 0.82, rotate: -64 },
  { x: 2, drift: 8, lift: -23, size: 1.2, delay: 0.11, rotate: 48 },
  { x: -4, drift: -6, lift: -28, size: 1.1, delay: 0.29, rotate: -30 },
  { x: 4, drift: 12, lift: -20, size: 1.35, delay: 0.47, rotate: 72 },
  { x: -1, drift: -2, lift: -32, size: 1, delay: 0.61, rotate: -8 },
  { x: 2, drift: 5, lift: -29, size: 1.15, delay: 0.75, rotate: 27 },
  { x: -3, drift: -13, lift: -23, size: 1.25, delay: 0.9, rotate: -78 },
  { x: 1, drift: 13, lift: -27, size: 1.05, delay: 0.08, rotate: 84 },
  { x: 0, drift: -5, lift: -36, size: 0.95, delay: 0.41, rotate: -24 },
  { x: 3, drift: 7, lift: -34, size: 1, delay: 0.57, rotate: 38 },
  { x: -2, drift: -9, lift: -31, size: 1.1, delay: 0.72, rotate: -52 },
  { x: 2, drift: 18, lift: -8, size: 1.15, delay: 0.04, rotate: 88 },
  { x: -2, drift: -18, lift: -10, size: 1.25, delay: 0.13, rotate: -92 },
  { x: 1, drift: 15, lift: 7, size: 1, delay: 0.22, rotate: 104 },
  { x: -1, drift: -14, lift: 5, size: 1.05, delay: 0.31, rotate: -108 },
  { x: 3, drift: 11, lift: -39, size: 0.9, delay: 0.4, rotate: 44 },
  { x: -3, drift: -12, lift: -41, size: 0.95, delay: 0.49, rotate: -48 },
  { x: 0, drift: 4, lift: -46, size: 0.85, delay: 0.58, rotate: 18 },
  { x: 2, drift: 20, lift: -18, size: 1.05, delay: 0.67, rotate: 76 },
  { x: -2, drift: -21, lift: -16, size: 1.1, delay: 0.76, rotate: -80 },
  { x: 1, drift: 9, lift: 10, size: 0.95, delay: 0.85, rotate: 116 },
  { x: -1, drift: -8, lift: 9, size: 0.9, delay: 0.94, rotate: -120 },
  { x: 0, drift: 14, lift: -30, size: 1, delay: 0.97, rotate: 56 },
] as const;

function LbpSparks({ progress }: { progress: number }) {
  if (progress < 77) return null;
  const energy = Math.min(1, (progress - 77) / 23);
  const terminalEnergy = Math.max(0, Math.min(1, (progress - 92) / 8));
  const count = Math.min(LBP_SPARK_PATTERN.length, 18 + Math.round(energy * 6 + terminalEnergy * 4));
  const baseDuration = 0.32 - energy * 0.055 - terminalEnergy * 0.045;

  return (
    <span
      aria-hidden="true"
      className="bb-lbp-sparks"
      style={{
        left: `clamp(9px, ${progress}%, calc(100% - 9px))`,
        opacity: 0.86 + energy * 0.14,
        "--spark-core-size": `${5.5 + terminalEnergy * 1.5}px`,
        "--spark-halo-width": `${9 + terminalEnergy * 3}px`,
        "--spark-halo-height": `${3.5 + terminalEnergy * 1.5}px`,
      } as React.CSSProperties}
    >
      {LBP_SPARK_PATTERN.slice(0, count).map((spark, index) => {
        const size = spark.size * 0.65 + 0.32 + energy * 0.16 + terminalEnergy * 0.2;
        const isDot = index % 3 === 0;
        const duration = baseDuration + (index % 4) * 0.018;
        const endX = spark.x + spark.drift * (1 + terminalEnergy * 0.2);
        const endY = spark.lift * (1 + energy * 0.12 + terminalEnergy * 0.18);
        return (
          <i
            key={index}
            className="bb-lbp-spark"
            style={{
              width: isDot ? size : Math.max(1.25, size * 0.58),
              height: isDot ? size : size * 2.05,
              "--spark-duration": `${duration}s`,
              "--spark-delay": `-${(index / count) * duration}s`,
              "--spark-start-x": `${spark.x}px`,
              "--spark-mid-x": `${spark.x + spark.drift * 0.24}px`,
              "--spark-mid-y": `${spark.lift * 0.32}px`,
              "--spark-late-x": `${spark.x + spark.drift * 0.66}px`,
              "--spark-late-y": `${spark.lift * 0.72}px`,
              "--spark-end-x": `${endX}px`,
              "--spark-end-y": `${endY}px`,
              "--spark-mid-rotate": `${spark.rotate * 0.35}deg`,
              "--spark-late-rotate": `${spark.rotate * 0.72}deg`,
              "--spark-end-rotate": `${spark.rotate}deg`,
              "--spark-peak-opacity": 0.82 + energy * 0.18,
              "--spark-late-opacity": 0.58 + energy * 0.16,
            } as React.CSSProperties}
          />
        );
      })}
    </span>
  );
}

function MarketProgress({ card, upcoming = false }: { card: TokenCardData; upcoming?: boolean }) {
  const progress = Math.max(0, Math.min(100, card.mcGoal > 0 ? (card.mcCurrent / card.mcGoal) * 100 : 0));
  const liveEmpty = !upcoming && progress <= 0;
  return (
    <div className="mt-2.5">
      <div className="flex items-end gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-[8px] font-semibold uppercase tracking-[0.16em] text-white/28">{upcoming ? "MC" : "Market cap"}</div>
          <div className="mt-1 text-[12px] font-semibold tabular-nums text-white/82">{formatCompact(card.mcCurrent, true)}</div>
        </div>
        <div className="w-12 shrink-0 text-center">
          <div className="text-[8px] font-semibold uppercase tracking-[0.16em] text-white/28">Target</div>
          <div className="mt-1 text-[12px] font-semibold tabular-nums text-white/72">{formatCompact(card.mcGoal, true)}</div>
        </div>
      </div>
      <div className="mt-2.5 flex items-center gap-2.5">
        <div className="relative h-[3px] flex-1 overflow-visible rounded-full bg-white/[0.075]">
          <span className="absolute inset-y-0 left-0 rounded-full bg-[#4ade80] shadow-[0_0_12px_rgba(74,222,128,0.24)]" style={{ width: `${progress}%` }} />
          {progress > 0 ? (
            <span
              aria-hidden="true"
              className={cx(
                "absolute top-1/2 z-[11] h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4ade80] shadow-[0_0_9px_rgba(74,222,128,0.54)]",
                progress < 77 && "bb-progress-dot-pulse",
              )}
              style={{ left: `clamp(5px, ${progress}%, calc(100% - 5px))` }}
            />
          ) : null}
          <LbpSparks progress={progress} />
        </div>
        <span className="flex w-12 shrink-0 items-center justify-center font-semibold tabular-nums text-white/48">
          {upcoming ? (
            <span
              aria-label="Scheduled"
              data-ui-hint="Scheduled"
              className="bb-status-dot-pulse bb-status-dot-pulse--scheduled h-2 w-2 rounded-full border border-amber-100/40 bg-amber-100/[0.08] shadow-[0_0_7px_rgba(253,230,138,0.16)]"
            />
          ) : liveEmpty ? (
            <span className="text-[8px] uppercase tracking-[0.12em] text-[#4ade80]/72">Live</span>
          ) : (
            <span className="text-[10px]">{Math.min(99, Math.floor(progress))}%</span>
          )}
        </span>
      </div>
    </div>
  );
}

function MiniTokenChart({ card, idle = false }: { card: TokenCardData; idle?: boolean }) {
  const id = React.useId().replace(/:/g, "");
  const isUp = card.change >= 0;
  const variant = card.chartVariant ?? 0;
  const chartEndX = 410.25;
  const variants = isUp
    ? [
        `M0 62 C42 62 54 61 78 54 C104 46 122 48 146 41 C172 33 190 35 216 28 C250 19 274 25 302 17 C338 7 376 12 ${chartEndX} 4`,
        `M0 60 C38 60 54 58 82 59 C112 60 134 49 164 43 C192 37 218 42 246 34 C278 25 306 28 338 17 C370 8 399 9 ${chartEndX} 5`,
        `M0 62 C44 62 65 61 92 54 C120 47 146 40 172 43 C202 46 224 34 252 29 C282 24 306 22 334 14 C366 6 394 10 ${chartEndX} 4`,
      ]
    : [
        `M0 13 C46 16 72 21 104 29 C138 38 168 45 198 42 C230 39 252 49 282 54 C320 60 368 60 ${chartEndX} 64`,
        `M0 10 C38 13 72 25 104 28 C138 31 164 43 198 46 C230 49 256 46 286 56 C324 66 370 62 ${chartEndX} 65`,
        `M0 15 C44 18 74 20 108 34 C142 48 170 44 204 50 C240 57 264 53 298 60 C340 67 380 64 ${chartEndX} 66`,
      ];
  const d = idle ? `M0 52 C92 52 148 52 214 52 C286 52 356 52 ${chartEndX} 52` : variants[variant];
  const line = idle ? "rgba(74,222,128,0.38)" : isUp ? "#4ade80" : "#ff3771";
  const fillStrong = idle ? "rgba(52,211,153,0.06)" : isUp ? "rgba(52,211,153,0.19)" : "rgba(255,55,113,0.16)";
  const fillMid = idle ? "rgba(52,211,153,0.025)" : isUp ? "rgba(52,211,153,0.085)" : "rgba(255,55,113,0.07)";
  const fillSoft = idle ? "rgba(52,211,153,0.01)" : isUp ? "rgba(52,211,153,0.025)" : "rgba(255,55,113,0.022)";
  const endY = isUp ? [4, 5, 4][variant] : [64, 65, 66][variant];
  const areaEndY = idle ? 52 : endY;
  const chartHeight = 128;
  const areaD = `${d} L424 ${areaEndY} L424 ${chartHeight} L-4 ${chartHeight} Z`;

  return (
    <div className="relative -mx-5 mt-1 h-[84px] w-[calc(100%+40px)]">
      <div className="absolute inset-0">
        <svg viewBox={`0 0 420 ${chartHeight}`} preserveAspectRatio="none" className="block h-full w-full shrink-0" aria-hidden="true">
          <defs>
            <linearGradient id={`card-fill-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={fillStrong} />
              <stop offset="42%" stopColor={fillMid} />
              <stop offset="70%" stopColor={fillSoft} />
              <stop offset="90%" stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </linearGradient>
            <linearGradient id={`card-vertical-fade-${id}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={chartHeight}>
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="12%" stopColor="white" stopOpacity="1" />
              <stop offset="82%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <mask id={`card-vertical-mask-${id}`} maskUnits="userSpaceOnUse" x="-12" y="0" width="444" height={chartHeight}>
              <rect x="-12" y="0" width="444" height={chartHeight} fill={`url(#card-vertical-fade-${id})`} />
            </mask>
            <filter id={`card-glow-wide-${id}`} x="-8%" y="-70%" width="116%" height="190%"><feGaussianBlur stdDeviation="4" /></filter>
            <filter id={`card-glow-${id}`} x="-5%" y="-50%" width="110%" height="160%"><feGaussianBlur stdDeviation="2.4" /></filter>
          </defs>
          <path d={areaD} fill={`url(#card-fill-${id})`} />
          <g mask={`url(#card-vertical-mask-${id})`}>
            <path d={d} fill="none" stroke={line} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" opacity="0.1" filter={`url(#card-glow-wide-${id})`} />
            <path d={d} fill="none" stroke={line} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.22" filter={`url(#card-glow-${id})`} />
          </g>
          <path d={d} fill="none" stroke={line} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {!idle ? (
        <span
          aria-hidden="true"
          className="bb-chart-endpoint pointer-events-none absolute z-[2] h-[6px] w-[6px] rounded-full"
          style={{
            right: "6.75px",
            top: `calc(${(endY / chartHeight) * 100}% - 3px)`,
            backgroundColor: line,
            boxShadow: `0 0 8px ${isUp ? "rgba(52,211,153,0.46)" : "rgba(255,55,113,0.4)"}`,
          }}
        />
      ) : null}
    </div>
  );
}

function TokenFeedCard({ card, spotlight, currentTime }: { card: TokenCardData; spotlight?: SmartSpotlightKind; currentTime: number }) {
  const isUp = card.change >= 0;
  const upcoming = typeof card.startsAt === "number" && card.startsAt > currentTime;
  const liveEmpty = card.kind === "lbp" && !upcoming && card.mcCurrent <= 0;
  const upcomingCountdown = card.startsAt ? formatCountdown(card.startsAt - currentTime) : "";
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 7, scale: 0.985 }}
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      data-smart-event={spotlight}
      className={cx("group relative h-[210px] min-w-0 overflow-hidden rounded-[22px] border border-white/[0.055] bg-[#0f1111] p-3.5 shadow-[0_12px_34px_rgba(0,0,0,0.25)] transition-[border-color,box-shadow] duration-300 hover:border-white/[0.11] hover:shadow-[0_18px_44px_rgba(0,0,0,0.34)]", spotlight && "bb-smart-spotlight")}
    >
      <span
        aria-hidden="true"
        className="bb-ambient-effect pointer-events-none absolute -inset-x-[4%] -top-5 h-[138px] scale-[1.04] opacity-0 blur-[16px] transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: tokenAmbient(card.palette),
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 54%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, black 0%, black 54%, transparent 100%)",
        }}
      />
      <div className="relative z-10 flex items-center gap-2.5">
        <TokenAvatar card={card} />
        <div className="min-w-0 flex-1">
          <div className={cx("flex min-w-0 items-baseline gap-1.5", upcoming ? "pr-[132px]" : "pr-[66px]")}>
            <h3 className="truncate text-[14px] font-semibold tracking-[-0.02em] text-white/90">{card.title}</h3>
            <span className="shrink-0 text-[9px] font-medium text-white/38">{card.ticker}</span>
          </div>
          <div className="mt-1 flex min-w-0 items-center gap-1.5 text-[10px] text-white/38">
            <ContractAddress card={card} />
            <span className="shrink-0 text-white/20">by</span><a href={`/u/${card.by}`} className="shrink-0 whitespace-nowrap text-white/60 hover:text-white/84">{card.by}</a>
            <span className="shrink-0 text-white/20">on</span><a href={`/b/${card.board}`} className="min-w-0 truncate text-white/60 hover:text-white/84">b/{card.board}</a>
          </div>
        </div>
      </div>

      {upcoming ? (
        <span className="absolute right-3.5 top-2 z-10 inline-flex h-5 items-center gap-1 rounded-full border border-amber-200/15 bg-amber-200/[0.045] px-1.5 text-[8px] font-semibold uppercase tracking-[0.07em] text-amber-100/78">
          <Clock3 className="h-2.5 w-2.5" strokeWidth={1.8} />
          <span>Upcoming</span>
          <span className="h-2.5 w-px bg-amber-100/14" aria-hidden="true" />
          <span className="tabular-nums tracking-normal text-white/68">{upcomingCountdown}</span>
        </span>
      ) : liveEmpty ? (
        <span className="absolute right-3.5 top-3.5 z-10 inline-flex items-center gap-1.5 rounded-full border border-[#4ade80]/12 bg-[#4ade80]/[0.045] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.08em] text-[#4ade80]/82">
          <span aria-hidden="true" className="bb-status-dot-pulse bb-status-dot-pulse--live h-1.5 w-1.5 rounded-full bg-[#4ade80]/80" />
          Live
        </span>
      ) : (
        <span className={cx("absolute right-3.5 top-3.5 z-10 rounded-full border px-2 py-0.5 text-[9px] font-semibold tabular-nums", isUp ? "border-[#4ade80]/10 bg-[#4ade80]/[0.045] text-[#4ade80]" : "border-[#ff3771]/10 bg-[#ff3771]/[0.04] text-[#ff3771]/88")}>{isUp ? "ATH " : ""}{Math.abs(card.change).toFixed(1)}%</span>
      )}

      <p className="relative z-10 mt-2 line-clamp-2 min-h-[32px] text-[11.5px] leading-[1.42] text-white/48">{card.desc}</p>
      <div className="relative z-10">{card.kind === "lbp" ? <MarketProgress card={card} upcoming={upcoming} /> : <MiniTokenChart card={card} />}</div>

      <div className="absolute bottom-2.5 left-3.5 right-3.5 z-10 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {card.txs > 0 ? <CardStat kind="txs" value={formatCompact(card.txs)} /> : null}
          {card.volume > 0 ? <CardStat kind="volume" value={formatCompact(card.volume, true)} /> : null}
        </div>
        <CardSocialLinks card={card} />
      </div>
    </motion.article>
  );
}

function getSmartSpotlight(card: TokenCardData, currentTime: number): SmartSpotlightKind | undefined {
  if (card.graduatedAt) {
    const graduatedAge = currentTime - card.graduatedAt;
    if (graduatedAge >= 0 && graduatedAge < SMART_SPOTLIGHT_MS) return "graduated";
  }
  const createdAge = currentTime - card.createdAt;
  return createdAge >= 0 && createdAge < SMART_SPOTLIGHT_MS ? "created" : undefined;
}

function getSmartSpotlightTime(card: TokenCardData, kind: SmartSpotlightKind) {
  return kind === "graduated" ? card.graduatedAt ?? card.createdAt : card.createdAt;
}

function getVisibleTokenCards(selectedNetworks: ReadonlySet<Network>, contentSort: ContentSortMode, currentTime: number) {
  const cards = TOKEN_CARDS.filter((card) => selectedNetworks.has(card.network));
  if (contentSort === "newest") return cards.sort((a, b) => b.createdAt - a.createdAt);
  if (contentSort === "hot") return cards.sort((a, b) => b.change - a.change || b.volume - a.volume);
  if (contentSort === "full") return cards.sort((a, b) => b.mcCurrent - a.mcCurrent);
  return cards.sort((a, b) => {
    const aSpotlight = getSmartSpotlight(a, currentTime);
    const bSpotlight = getSmartSpotlight(b, currentTime);
    if (aSpotlight || bSpotlight) {
      if (!aSpotlight) return 1;
      if (!bSpotlight) return -1;
      return getSmartSpotlightTime(b, bSpotlight) - getSmartSpotlightTime(a, aSpotlight);
    }
    const score = (card: TokenCardData) => Math.max(0, card.change) * 2.4 + Math.log10(card.volume + 1) * 8 + (card.kind === "lbp" ? (card.mcCurrent / Math.max(card.mcGoal, 1)) * 12 : 5);
    return score(b) - score(a);
  });
}

function TokenCardGrid({ cards, currentTime }: { cards: TokenCardData[]; currentTime: number }) {
  return (
    <div className="bb-scroll min-h-0 flex-1 overflow-y-auto">
      {cards.length ? (
        <motion.div layout className="grid grid-cols-1 gap-5 px-8 py-5 lg:grid-cols-2 2xl:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {cards.map((card) => <TokenFeedCard key={card.id} card={card} currentTime={currentTime} spotlight={getSmartSpotlight(card, currentTime)} />)}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="grid h-full min-h-[260px] place-items-center px-6 text-center">
          <div>
            <NetworkGlyph className="mx-auto h-5 w-5 text-white/24" />
            <div className="mt-3 text-[13px] font-medium text-white/58">No networks selected</div>
            <div className="mt-1 text-[11px] text-white/30">Choose at least one network to populate the feed.</div>
          </div>
        </div>
      )}
    </div>
  );
}

function BoardAvatar({ name }: { name: string }) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase() ?? "").join("");
  return (
    <div className="grid h-7 w-7 place-items-center rounded-full bg-white/5 ring-1 ring-white/10">
      <span className="text-[11px] font-semibold text-white/80">{initials || "B"}</span>
    </div>
  );
}

function PrefToggle({ label, value, onChange, options }: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-white/80">{label}</span>
      <div className="flex items-center gap-1 rounded-full bg-white/5 p-0.5 ring-1 ring-white/10">
        {options.map((o) => (
          <button key={o} type="button" onClick={() => onChange(o)} className={cx("rounded-full px-2 py-0.5 text-[11px] transition", o === value ? "bg-white/15 text-white" : "text-white/60 hover:text-white")}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function NavItem({ icon, label, href, tone = "emerald", onClick, activeOverride }: { icon: React.ReactNode; label: string; href: string; tone?: "emerald" | "gold" | "violet"; onClick?: React.MouseEventHandler<HTMLAnchorElement>; activeOverride?: boolean }) {
  const ref = React.useRef<HTMLAnchorElement | null>(null);
  const pathname = usePathname();
  const active = activeOverride ?? (pathname === href || pathname.startsWith(`${href}/`));
  const spotlight = tone === "gold"
    ? "radial-gradient(140px circle at var(--sx) var(--sy), rgba(234,179,8,0.22), transparent 55%)"
    : tone === "violet"
      ? "radial-gradient(150px circle at var(--sx) var(--sy), rgba(139,92,246,0.25), transparent 58%)"
      : "radial-gradient(140px circle at var(--sx) var(--sy), rgba(74,222,128,0.18), transparent 55%)";
  const hoverTone = tone === "violet"
    ? "hover:bg-violet-500/[0.055] hover:text-white"
    : tone === "gold"
      ? "hover:bg-amber-400/[0.045] hover:text-white"
      : "hover:bg-[#4ade80]/[0.045] hover:text-white";
  const activeTone = tone === "violet"
    ? "bg-violet-500/[0.11] text-violet-100 ring-1 ring-violet-400/24 shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_8px_20px_rgba(76,29,149,0.12)]"
    : tone === "gold"
      ? "bg-amber-400/[0.09] text-amber-50 ring-1 ring-amber-300/22 shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_8px_20px_rgba(120,80,0,0.10)]"
      : "bg-[#4ade80]/[0.09] text-[#dcffe7] ring-1 ring-[#4ade80]/22 shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_8px_20px_rgba(0,100,70,0.10)]";
  const iconTone = tone === "violet"
    ? active
      ? "bg-violet-500/[0.18] text-violet-200 ring-violet-400/30"
      : "bg-white/[0.035] text-white/38 ring-white/10 group-hover:bg-violet-500/[0.14] group-hover:text-violet-200 group-hover:ring-violet-400/24"
    : tone === "gold"
      ? active
        ? "bg-amber-400/[0.16] text-amber-100 ring-amber-300/28"
        : "bg-white/[0.035] text-white/38 ring-white/10 group-hover:bg-amber-400/[0.12] group-hover:text-amber-100 group-hover:ring-amber-300/22"
      : active
        ? "bg-[#4ade80]/[0.15] text-[#dcffe7] ring-[#4ade80]/28"
        : "bg-white/[0.035] text-white/38 ring-white/10 group-hover:bg-[#4ade80]/[0.12] group-hover:text-[#dcffe7] group-hover:ring-[#4ade80]/22";

  const updateSpot = React.useCallback((x: string, y: string) => {
    const element = ref.current;
    if (!element) return;
    element.style.setProperty("--sx", x);
    element.style.setProperty("--sy", y);
  }, []);

  return (
    <Link
      ref={ref}
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      onMouseMove={(event) => {
        const bounds = ref.current?.getBoundingClientRect();
        if (!bounds) return;
        updateSpot(`${event.clientX - bounds.left}px`, `${event.clientY - bounds.top}px`);
      }}
      onMouseLeave={() => updateSpot("-999px", "-999px")}
      className={cx("group relative isolate flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm text-white/68 transition-[background-color,color,box-shadow] duration-300", active ? activeTone : hoverTone)}
      style={{ "--sx": "-999px", "--sy": "-999px" } as React.CSSProperties}
    >
      <span aria-hidden="true" className={cx("pointer-events-none absolute inset-0 -z-10 rounded-lg transition-opacity duration-300", active ? "opacity-55" : "opacity-0 group-hover:opacity-100")} style={{ background: spotlight }} />
      <span className={cx("grid h-8 w-8 place-items-center rounded-lg ring-1 transition-colors duration-300", iconTone)}>{icon}</span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

function CollectFeeTargetRow({ target, selected, onSelect }: { target: FeeCollectTarget; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cx(
        "group relative flex w-full min-w-0 flex-wrap items-center gap-3 px-4 py-3 text-left transition-[background-color,box-shadow] duration-200 sm:flex-nowrap sm:px-5",
        selected ? "bg-[#4ade80]/[0.045] shadow-[inset_2px_0_0_rgba(74,222,128,0.78)]" : "hover:bg-white/[0.028]",
      )}
    >
      <span
        aria-hidden="true"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] border bg-[#101212] text-[10px] font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]"
        style={{ borderColor: tokenTint(target.accent, selected ? 38 : 20), color: target.accent }}
      >
        {target.avatar}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-baseline gap-2">
          <span className="truncate text-[12.5px] font-semibold tracking-[-0.015em] text-white/88">{target.project}</span>
          <span className="shrink-0 text-[8px] font-semibold uppercase tracking-[0.11em] text-white/30">{target.symbol}</span>
        </span>
        <span className="mt-1 flex min-w-0 items-center gap-1.5 text-[9.5px] text-white/34">
          <NetworkIcon network={target.network} className="h-3 w-3" />
          <span className="shrink-0">{networkName(target.network)}</span>
          <span className="text-white/16">·</span>
          <span className="truncate tabular-nums">{target.contract}</span>
        </span>
      </span>

      <span className="ml-auto flex min-w-0 basis-full items-center justify-between gap-2.5 pl-12 sm:basis-auto sm:min-w-[244px] sm:justify-end sm:pl-0">
        <span className="text-right">
          <span className="block text-[13px] font-semibold tabular-nums tracking-[-0.02em] text-[#4ade80]/90">{formatUsd(target.usdValue)}</span>
          <span className="mt-0.5 block max-w-[188px] truncate text-[9.5px] tabular-nums text-white/38">
            {target.nativeAmount} <span className="px-0.5 text-white/18">+</span> {target.tokenAmount}
          </span>
        </span>
        <span className={cx("grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors", selected ? "border-[#4ade80]/28 bg-[#4ade80]/[0.11] text-[#4ade80]" : "border-white/[0.08] text-transparent group-hover:border-white/16")}>
          <Check className="h-3 w-3" strokeWidth={2.2} />
        </span>
      </span>
    </button>
  );
}

function CollectFeesModal({ open, walletAddress, onClose, onCollected }: { open: boolean; walletAddress: string; onClose: () => void; onCollected: (target: FeeCollectTarget) => void }) {
  const [selectedId, setSelectedId] = React.useState(FEE_COLLECT_TARGETS[0].id);
  const [collectionState, setCollectionState] = React.useState<"idle" | "collecting" | "success">("idle");
  const collectionTimerRef = React.useRef<number | null>(null);
  const selectedTarget = FEE_COLLECT_TARGETS.find((target) => target.id === selectedId) ?? FEE_COLLECT_TARGETS[0];

  const clearCollectionTimer = React.useCallback(() => {
    if (collectionTimerRef.current !== null) {
      window.clearTimeout(collectionTimerRef.current);
      collectionTimerRef.current = null;
    }
  }, []);

  const closeModal = React.useCallback(() => {
    clearCollectionTimer();
    setCollectionState("idle");
    onClose();
  }, [clearCollectionTimer, onClose]);

  React.useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [closeModal, open]);

  React.useEffect(() => () => clearCollectionTimer(), [clearCollectionTimer]);

  const selectTarget = (targetId: string) => {
    clearCollectionTimer();
    setSelectedId(targetId);
    setCollectionState("idle");
  };

  const collectSelectedFees = () => {
    clearCollectionTimer();
    setCollectionState("collecting");
    const collectedTarget = selectedTarget;
    collectionTimerRef.current = window.setTimeout(() => {
      setCollectionState("success");
      onCollected(collectedTarget);
      collectionTimerRef.current = null;
    }, 720);
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/72 p-3 backdrop-blur-[6px] sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="collect-fees-title"
            initial={{ opacity: 0, y: 14, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.99 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="flex max-h-[calc(100vh-24px)] w-full max-w-[680px] flex-col overflow-hidden rounded-[22px] border border-white/[0.095] bg-[linear-gradient(180deg,#101212_0%,#0a0c0b_100%)] shadow-[0_34px_110px_rgba(0,0,0,0.68),inset_0_1px_0_rgba(255,255,255,0.03)] sm:max-h-[calc(100vh-48px)]"
          >
            <header className="flex items-start gap-3.5 border-b border-white/[0.065] px-4 py-4 sm:px-5 sm:py-5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] border border-white/[0.095] bg-white/[0.028] text-[#4ade80]/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                <HandCoins className="h-4 w-4" strokeWidth={1.7} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[8px] font-semibold uppercase tracking-[0.17em] text-white/30">Creator earnings</div>
                <h2 id="collect-fees-title" className="mt-1 text-[19px] font-semibold tracking-[-0.035em] text-white/92">Collect fees</h2>
                <p className="mt-1 text-[10.5px] leading-relaxed text-white/40">Choose an eligible pool and claim its accrued DEX fees.</p>
              </div>
              <button type="button" onClick={closeModal} aria-label="Close fee collection" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/34 ring-1 ring-white/[0.08] transition hover:bg-white/[0.045] hover:text-white/72 hover:ring-white/[0.14]">
                <X className="h-3.5 w-3.5" />
              </button>
            </header>

            <div className="bb-scroll min-h-0 overflow-y-auto px-4 py-4 sm:px-5">
              <div className="mb-2.5 flex items-center justify-between gap-3 px-0.5">
                <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.13em] text-white/30">
                  <span>Eligible pools</span>
                  <span className="rounded-full bg-[#4ade80]/[0.06] px-1.5 py-0.5 text-[8px] font-semibold tracking-normal text-[#4ade80]/66 ring-1 ring-[#4ade80]/12">{FEE_COLLECT_TARGETS.length} ready</span>
                </div>
                <div className="flex min-w-0 items-center gap-1.5 text-[9px] text-white/28">
                  <Wallet className="h-3 w-3 shrink-0" />
                  <span className="truncate tabular-nums">{shortAddr(walletAddress)}</span>
                </div>
              </div>

              <div className="overflow-hidden rounded-[15px] border border-white/[0.075] bg-black/10 divide-y divide-white/[0.055]">
                {FEE_COLLECT_TARGETS.map((target) => (
                  <CollectFeeTargetRow key={target.id} target={target} selected={target.id === selectedId} onSelect={() => selectTarget(target.id)} />
                ))}
              </div>

            </div>

            <footer className="flex flex-col gap-3 border-t border-white/[0.065] bg-black/10 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
              <div className="min-w-0">
                <div className="text-[8px] font-semibold uppercase tracking-[0.16em] text-white/28">Ready to collect</div>
                <div className="mt-1 flex min-w-0 flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                  <span className="text-[20px] font-semibold tabular-nums tracking-[-0.04em] text-[#4ade80]/92">{formatUsd(selectedTarget.usdValue)}</span>
                  <span className="truncate text-[10px] tabular-nums text-white/42">
                    {selectedTarget.nativeAmount} <span className="px-0.5 text-white/18">+</span> {selectedTarget.tokenAmount}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={collectSelectedFees}
                disabled={collectionState !== "idle"}
                className={cx(
                  "group inline-flex h-10 w-[124px] shrink-0 items-center justify-center gap-2 rounded-[13px] border text-[11px] font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-200",
                  collectionState === "success"
                    ? "border-[#4ade80]/14 bg-[#4ade80]/[0.055] text-[#4ade80]/68"
                    : collectionState === "collecting"
                      ? "border-white/[0.08] bg-white/[0.025] text-white/42"
                      : "border-[#4ade80]/24 bg-[#4ade80]/[0.065] text-[#b7f7ca] shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_10px_28px_rgba(0,0,0,0.18)] hover:-translate-y-px hover:border-[#4ade80]/38 hover:bg-[#4ade80]/[0.1] hover:text-[#d9ffe4]",
                )}
              >
                {collectionState === "success" ? <Check className="h-3.5 w-3.5" /> : <Coins className="h-3.5 w-3.5" />}
                {collectionState === "collecting" ? "Collecting…" : collectionState === "success" ? "Collected" : "Collect fees"}
              </button>
            </footer>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function ToastViewport({ toast, onDismiss }: { toast: AppToast | null; onDismiss: () => void }) {
  React.useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(onDismiss, 3600);
    return () => window.clearTimeout(timer);
  }, [onDismiss, toast]);

  return (
    <div className="pointer-events-none fixed bottom-[62px] left-1/2 z-[160] flex w-[min(336px,calc(100vw-32px))] -translate-x-1/2 justify-center">
      <AnimatePresence mode="wait">
        {toast ? (
          <motion.div
            key={toast.id}
            role="status"
            initial={{ opacity: 0, y: 12, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.985 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto relative w-full overflow-hidden rounded-[14px] border border-white/[0.105] bg-[#0c0f0d]/96 px-3.5 py-3 shadow-[0_20px_54px_rgba(0,0,0,0.56),inset_0_1px_0_rgba(255,255,255,0.035)] backdrop-blur-xl"
          >
            <div className="flex items-start gap-3">
              <span className="mt-px grid h-7 w-7 shrink-0 place-items-center rounded-[9px] bg-[#4ade80]/[0.085] text-[#4ade80] ring-1 ring-[#4ade80]/18">
                <Check className="h-3.5 w-3.5" strokeWidth={2.1} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11.5px] font-semibold tracking-[-0.012em] text-white/88">{toast.title}</span>
                <span className="mt-0.5 block text-[10px] leading-[1.45] text-white/44">{toast.message}</span>
              </span>
              <button type="button" onClick={onDismiss} aria-label="Dismiss notification" className="grid h-6 w-6 shrink-0 cursor-pointer place-items-center rounded-md text-white/28 transition hover:bg-white/[0.045] hover:text-white/68">
                <X className="h-3 w-3" />
              </button>
            </div>
            <motion.span aria-hidden="true" className="absolute bottom-0 left-0 h-px w-full origin-left bg-[#4ade80]/55" initial={{ scaleX: 1 }} animate={{ scaleX: 0 }} transition={{ duration: 3.6, ease: "linear" }} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function DropdownMotion({ children, direction, className, id }: { children: React.ReactNode; direction: "down" | "up"; className: string; id?: string }) {
  const y = direction === "down" ? -10 : 10;
  return (
    <motion.div id={id} initial={{ opacity: 0, y, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y, scale: 0.97 }} transition={{ duration: 0.22, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
}

function CreatorPayoutStat() {
  return (
    <div className="bb-creator-payout grid h-9 w-[188px] grid-cols-[30px_1fr] items-center gap-1.5">
      <span className="relative h-9 w-[30px] shrink-0 overflow-visible" aria-hidden="true">
        <Image unoptimized src="/based-bid-coin-payout-animated.svg" alt="" width={76} height={48} className="bb-creator-payout__art" />
      </span>
      <span className="bb-creator-payout__copy inline-flex items-baseline gap-1.5 whitespace-nowrap">
        <span className="text-[14px] font-semibold tabular-nums tracking-[-0.025em] text-[#4ade80]">$2.84M+</span>
        <span className="text-[11px] font-medium tracking-[-0.01em] text-white/48">paid to creators</span>
      </span>
    </div>
  );
}

const LIVE_CHAT_CONTACTS = [
  { name: "Michael", handle: "@BasedBidMichael", href: "https://t.me/BasedBidMichael", avatar: "/team/michael.jpg" },
  { name: "Lumi", handle: "@BasedLumi", href: "https://t.me/BasedLumi", avatar: "/team/lumi.jpg" },
  { name: "Dante", handle: "@BasedDante", href: "https://t.me/BasedDante", avatar: "/team/dante.jpg" },
] as const;

function LiveChatMenu() {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="live-chat-menu"
        className={cx("group inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-[10px] font-medium transition-[background-color,border-color,color]", open ? "border-white/[0.14] bg-white/[0.045] text-white/82" : "border-white/[0.08] bg-white/[0.018] text-white/46 hover:border-white/[0.14] hover:bg-white/[0.04] hover:text-white/78")}
      >
        <MessageCircleMore className="h-3 w-3 text-[#4ade80]/62 transition-colors group-hover:text-[#4ade80]" />
        <span>Live chat</span>
        <ChevronDown className={cx("h-3 w-3 text-white/28 transition-transform duration-200", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open ? (
          <DropdownMotion id="live-chat-menu" direction="up" className="absolute bottom-[36px] right-0 z-50 w-[224px] overflow-hidden rounded-xl border border-white/[0.10] bg-[#0b0c0c]/98 shadow-[0_18px_48px_rgba(0,0,0,0.64)] backdrop-blur-xl">
            <div className="px-3 py-2.5">
              <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/34">Live chat</div>
              <p className="mt-1 text-[10px] leading-snug text-white/46">Message a Based Bid team member on Telegram.</p>
            </div>
            <div className="border-t border-white/[0.08] p-1.5">
              {LIVE_CHAT_CONTACTS.map((contact) => (
                <a key={contact.handle} href={contact.href} target="_blank" rel="noreferrer" onClick={() => setOpen(false)} className="group/contact flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.045]">
                  <Image unoptimized src={contact.avatar} alt="" width={28} height={28} className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-white/[0.12] transition-[filter,box-shadow] group-hover/contact:brightness-110 group-hover/contact:shadow-[0_0_12px_rgba(74,222,128,0.12)]" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-medium text-white/76 group-hover/contact:text-white/92">{contact.name}</span>
                    <span className="block truncate text-[9px] text-white/34">{contact.handle}</span>
                  </span>
                  <ArrowUpRight className="h-3 w-3 text-white/22 transition-colors group-hover/contact:text-white/52" />
                </a>
              ))}
            </div>
          </DropdownMotion>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function SidebarPanel({ query, onQuery, searchRef, sortLabel, onCycleSort, boards, activeBoard, onSelectBoard, onTogglePin, onOpenCollectFees, collectFeesOpen }: { query: string; onQuery: (v: string) => void; searchRef: React.RefObject<HTMLInputElement | null>; sortLabel: string; onCycleSort: () => void; boards: Board[]; activeBoard: string; onSelectBoard: (id: string) => void; onTogglePin: (id: string) => void; onOpenCollectFees: () => void; collectFeesOpen: boolean }) {
  return (
    <aside className="relative flex h-full w-[272px] flex-col border-r border-white/[0.08] bg-[linear-gradient(180deg,#0b0c0c_0%,#090a0a_100%)] shadow-[8px_0_32px_rgba(0,0,0,0.12)]">
      <div className="bb-scroll min-h-0 flex-1 overflow-y-auto px-3 pr-[6px] pb-6 pt-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-white/50 ring-1 ring-white/10">/</kbd>
          <input ref={searchRef} value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Search tokens, boards..." className="w-full rounded-2xl bg-white/5 py-2.5 pl-10 pr-10 text-sm ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/15" />
        </div>
        <div className="mt-3 space-y-2">
          <NavItem icon={<Plus className="h-4 w-4" />} label="Create" href="/create" tone="emerald" />
          <NavItem icon={<Coins className="h-4 w-4" />} label="Collect Fees" href="#collect-fees" tone="gold" activeOverride={collectFeesOpen} onClick={(event) => { event.preventDefault(); onOpenCollectFees(); }} />
          <NavItem icon={<Code2 className="h-4 w-4" />} label="OpenBid" href="/openbid" tone="violet" />
        </div>
        <div className="mt-5 flex items-center justify-between px-1">
          <div className="text-xs font-semibold uppercase text-white/45">Boards</div>
          <button onClick={onCycleSort} className="flex items-center gap-2 rounded-xl px-2 py-1 text-xs text-white/60 hover:bg-white/5" aria-label="Change board sort"><span>{sortLabel}</span><ChevronDown className="h-3.5 w-3.5" /></button>
        </div>
        <div className="mt-2">
          <motion.div layout className="space-y-0.5" transition={LAYOUT_SPRING}>
            {boards.map((b) => {
              const active = activeBoard === b.id;
              const pinned = !!b.isPinned;
              const isBased = b.id === "based";
              return (
              <motion.div layout key={b.id} transition={LAYOUT_SPRING} className={cx("group relative flex w-full items-center rounded-xl text-sm transition-[background-color,box-shadow] duration-300 focus-within:ring-1 focus-within:ring-white/15", active && "before:absolute before:bottom-2 before:left-0 before:top-2 before:w-[2px] before:rounded-full before:bg-[#4ade80]/85 before:shadow-[0_0_12px_rgba(74,222,128,0.34)] before:content-['']", active ? "bg-gradient-to-r from-white/[0.075] to-white/[0.035] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]" : "text-white/72 hover:bg-white/[0.045] hover:text-white/92")}>
                  <button type="button" onClick={() => onSelectBoard(b.id)} className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-1.5 text-left outline-none">
                    <span className={cx("flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-1 transition-colors duration-300", active ? "bg-white/10 ring-white/15" : "bg-white/[0.035] ring-white/10 group-hover:bg-white/[0.07]")}>{b.icon ?? <BoardAvatar name={b.name} />}</span>
                    <span className="truncate font-normal">{b.name}</span>
                  </button>
                  {!isBased ? (
                    <button type="button" onClick={() => onTogglePin(b.id)} className={cx("mr-1 grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-lg outline-none transition-all duration-300 hover:bg-white/[0.06]", pinned ? "text-[#4ade80]/85" : "text-white/28 opacity-0 group-hover:opacity-100 hover:text-white/75 focus:opacity-100")} aria-label={pinned ? "Unpin board" : "Pin board"} data-ui-hint={pinned ? "Unpin" : "Pin"}>
                      <Pin className={cx("h-3.5 w-3.5 transition-transform", pinned && "rotate-45")} />
                    </button>
                  ) : null}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </aside>
  );
}

function SettingsDropdown({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const { animation, ambient, setAnimation, setAmbient } = useAppPreferences();
  const animationLabel = animation === "on" ? "On" : animation === "reduced" ? "Reduced" : "Off";
  const ambientLabel = ambient === "on" ? "On" : "Off";
  return (
    <div className="relative" data-settings>
      <button type="button" onClick={onToggle} className="grid h-8 w-8 cursor-pointer place-items-center rounded-xl bg-transparent text-white/60 transition hover:bg-white/5" aria-label="Preferences" data-ui-hint="Preferences"><Settings className="h-3.5 w-3.5" /></button>
      <AnimatePresence>
        {open ? (
          <DropdownMotion direction="up" className="absolute bottom-[46px] left-0 w-64 overflow-hidden rounded-2xl bg-[#0A0A0A] ring-1 ring-white/12 shadow-[0_16px_40px_rgba(0,0,0,0.55)]">
            <div className="px-3 py-2 text-[11px] font-medium text-white/60">Preferences</div>
            <div className="border-t border-white/10" />
            <div className="space-y-2 px-3 py-2">
              <PrefToggle label="Animations" value={animationLabel} onChange={(value) => setAnimation(value.toLowerCase() as AnimationPreference)} options={["On", "Reduced", "Off"]} />
              <PrefToggle label="Ambient effects" value={ambientLabel} onChange={(value) => setAmbient(value.toLowerCase() as AmbientPreference)} options={["On", "Off"]} />
            </div>
          </DropdownMotion>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function SocialLinks() {
  const baseClass = "grid h-8 w-8 place-items-center text-white/38 outline-none transition-[color,transform] duration-200 hover:-translate-y-px hover:text-white/82 focus-visible:text-white focus-visible:ring-1 focus-visible:ring-white/18";
  return (
    <>
      <a href="https://t.me/basedbid" target="_blank" rel="noreferrer" className={baseClass} aria-label="Telegram" data-ui-hint="Telegram"><Send className="h-[15px] w-[15px]" /></a>
      <a href="https://x.com/basedbid" target="_blank" rel="noreferrer" className={baseClass} aria-label="X" data-ui-hint="X"><FaXTwitter className="h-[14px] w-[14px]" /></a>
      <a href="https://github.com/basedbid" target="_blank" rel="noreferrer" className={baseClass} aria-label="GitHub" data-ui-hint="GitHub"><GitHubMark className="h-[15px] w-[15px]" /></a>
    </>
  );
}

function CookieControl({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <div className="group/cookies relative">
      <div id="cookie-help" role="tooltip" className="pointer-events-none invisible absolute bottom-[36px] left-0 z-50 w-[286px] translate-y-1 rounded-xl border border-white/[0.10] bg-[#0c0d0d]/98 px-3.5 py-3 opacity-0 shadow-[0_18px_46px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.035)] backdrop-blur-xl transition-[opacity,transform,visibility] duration-200 group-hover/cookies:visible group-hover/cookies:translate-y-0 group-hover/cookies:opacity-100 group-focus-within/cookies:visible group-focus-within/cookies:translate-y-0 group-focus-within/cookies:opacity-100">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-white/86">
          <ShieldCheck className="h-3.5 w-3.5 text-white/42" />
          <span>Your preferences stay private</span>
        </div>
        <p className="mt-1.5 text-[10px] leading-[1.55] text-white/48">
          Cookies remember preferred networks, filters, and sorting. Anonymous usage data helps improve Based Bid. Nothing else is stored or shared.
        </p>
        <span aria-hidden="true" className="absolute -bottom-[5px] left-5 h-2.5 w-2.5 rotate-45 border-b border-r border-white/[0.10] bg-[#0c0d0d]" />
      </div>
      <button type="button" onClick={onToggle} aria-pressed={enabled} aria-describedby="cookie-help" className="inline-flex h-7 cursor-pointer items-center gap-2 rounded-lg bg-white/[0.018] px-2 text-[10px] font-medium text-white/44 ring-1 ring-white/[0.075] transition-[background-color,color,box-shadow] hover:bg-white/[0.045] hover:text-white/72 hover:ring-white/[0.14] focus-visible:bg-white/[0.045] focus-visible:text-white/72 focus-visible:outline-none focus-visible:ring-white/[0.18]">
        <Cookie className={cx("h-3 w-3 transition-colors", enabled ? "text-[#4ade80]/68 group-hover/cookies:text-[#4ade80]" : "text-white/30 group-hover/cookies:text-white/62 group-focus-within/cookies:text-white/62")} />
        <span>Cookies</span>
        <span className={cx("relative h-[16px] w-[29px] rounded-full border transition-colors duration-300", enabled ? "border-[#4ade80]/25 bg-[#4ade80]/20" : "border-white/10 bg-white/[0.035]")}>
          <span className={cx("absolute top-[2px] h-[10px] w-[10px] rounded-full transition-[left,background-color,box-shadow] duration-300", enabled ? "left-[15px] bg-[#4ade80] shadow-[0_0_8px_rgba(74,222,128,0.52)]" : "left-[2px] bg-white/38")} />
        </span>
      </button>
    </div>
  );
}

function PlatformLinks() {
  const linkClass = "inline-flex h-6 items-center justify-center gap-1.5 rounded-md px-2.5 text-[10px] font-medium text-white/48 transition hover:bg-white/[0.055] hover:text-white/82";
  return (
    <div className="inline-flex h-7 items-center rounded-lg bg-black/15 p-0.5 ring-1 ring-white/[0.09] shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
      <a href="/how-it-works" className={linkClass}><CircleHelp className="h-3 w-3" />How it works</a>
      <span className="h-3.5 w-px bg-white/[0.08]" aria-hidden="true" />
      <a href="/deck" className={linkClass}><Presentation className="h-3 w-3" />Pitch deck</a>
    </div>
  );
}

function BottomBar({ settings, cookiesEnabled, onToggleCookies }: { settings: React.ReactNode; cookiesEnabled: boolean; onToggleCookies: () => void }) {
  return (
    <div className="relative z-40 flex h-[44px] w-full items-center border-t border-white/[0.08] bg-[#090a0a]/96 backdrop-blur-xl">
      <div className="h-full w-[272px] border-r border-white/[0.08]">
        <div className="relative flex h-full items-center px-3 pr-[6px]">
          {settings}
          <div className="absolute left-[55%] top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2"><SocialLinks /></div>
        </div>
      </div>
      <div className="relative flex h-full min-w-0 flex-1 items-center px-4">
        <CookieControl enabled={cookiesEnabled} onToggle={onToggleCookies} />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"><PlatformLinks /></div>
        <div className="ml-auto flex items-center gap-4">
          <LiveChatMenu />
          <div className="hidden items-center gap-3 text-[9px] text-white/30 xl:flex">
            <a href="/privacy" className="transition hover:text-white/62">Privacy</a>
            <a href="/terms" className="transition hover:text-white/62">ToS</a>
            <span className="text-white/20">© 2026 based.bid</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContentSortPill({ active, icon, label, onClick }: SortPillProps) {
  return (
    <motion.button type="button" aria-pressed={active} onClick={onClick} whileHover={{ y: -1 }} whileTap={{ scale: 0.985 }} className={cx("inline-flex h-[30px] items-center gap-1.5 rounded-full px-2.5 text-[11px] font-medium tracking-[0.01em] ring-1 transition-[background-color,color,box-shadow] duration-200", active ? "bg-gradient-to-b from-white/[0.11] to-white/[0.065] text-white ring-white/18 shadow-[0_8px_22px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.06)]" : "bg-black/10 text-white/48 ring-white/9 hover:bg-white/[0.045] hover:text-white/78 hover:ring-white/14")}>
      <span className={cx(active ? "text-[#4ade80]" : "text-white/40")}>{icon}</span>
      <span>{label}</span>
    </motion.button>
  );
}

function MainContentHeader({ contentSort, onSetContentSort, selectedNetworks, onToggleNetwork, onSelectAllNetworks, onReset }: { contentSort: ContentSortMode; onSetContentSort: (mode: ContentSortMode) => void; selectedNetworks: ReadonlySet<Network>; onToggleNetwork: (network: Network) => void; onSelectAllNetworks: () => void; onReset: () => void }) {
  const items = [
    ["smart", <Sparkles key="smart" className="h-3.5 w-3.5" />, "Smart"],
    ["hot", <Flame key="hot" className="h-3.5 w-3.5" />, "Hot"],
    ["newest", <Clock3 key="newest" className="h-3.5 w-3.5" />, "New"],
    ["full", <LayoutGrid key="full" className="h-3.5 w-3.5" />, "Full"],
  ] as const;
  const dirty = contentSort !== "smart" || selectedNetworks.size !== CHAINS.length;

  return (
    <div className="relative z-20 isolate flex h-[60px] items-center justify-between gap-4 bg-[#090a0a] px-4 md:px-5">
      <div className="relative z-10 flex min-w-0 items-center gap-2 py-1">
        <div className="flex shrink-0 items-center gap-1.5 overflow-visible">
          {items.map(([value, icon, label]) => <ContentSortPill key={value} active={contentSort === value} icon={icon} label={label} onClick={() => onSetContentSort(value)} />)}
        </div>
        <NetworkFilter selected={selectedNetworks} onToggle={onToggleNetwork} onSelectAll={onSelectAllNetworks} />
        <button
          type="button"
          onClick={onReset}
          disabled={!dirty}
          aria-label="Reset sorting and network filters"
          data-ui-hint="Reset filters"
          className={cx(
            "inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full ring-1 ring-inset transition-[background-color,color,box-shadow] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80]/45",
            dirty ? "bg-white/[0.018] text-white/48 ring-white/[0.075] hover:bg-white/[0.05] hover:text-white/86 hover:ring-white/[0.14]" : "cursor-default bg-transparent text-white/16 ring-white/[0.035]",
          )}
        >
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.8} />
        </button>
      </div>
      <div className="hidden min-w-0 flex-1 justify-center px-3 min-[1200px]:flex">
        <CreatorPayoutStat />
      </div>
      <Link
        href="/create"
        aria-label="Create a token"
        className="bb-create-launch group relative z-10 isolate inline-flex h-10 min-w-[132px] shrink-0 items-center justify-center gap-2 rounded-[15px] px-6 text-[13px] font-semibold text-white/90"
      >
        <span aria-hidden="true" className="bb-create-launch__glow bb-ambient-effect" />
        <span aria-hidden="true" className="bb-create-launch__wash" />
        <span aria-hidden="true" className="bb-create-launch__edge" />
        <Plus className="bb-create-launch__plus relative z-10 h-4 w-4 text-white/68" />
        <span className="relative z-10 tracking-[-0.01em]">Create</span>
      </Link>
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-7 left-0 right-0 z-0 h-7 bg-gradient-to-b from-[#090a0a] via-[#090a0a]/80 to-transparent" />
    </div>
  );
}

export default function BBLayout() {
  const [activeBoard, setActiveBoard] = React.useState("based");
  const [query, setQuery] = React.useState("");
  const [sortMode, setSortMode] = React.useState<SortMode>("smart");
  const [contentSort, setContentSort] = React.useState<ContentSortMode>("smart");
  const [selectedNetworks, setSelectedNetworks] = React.useState<Set<Network>>(createAllNetworkSet);
  const [boardsState, setBoardsState] = React.useState<Board[]>(BOARDS);
  const [addr] = React.useState("0x4573A94fF2b711A4EcB9");
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [collectFeesOpen, setCollectFeesOpen] = React.useState(false);
  const [cookiesEnabled, setCookiesEnabled] = React.useState(true);
  const [smartNow, setSmartNow] = React.useState(now);
  const [toast, setToast] = React.useState<AppToast | null>(null);

  const dismissToast = React.useCallback(() => setToast(null), []);
  const showCollectedToast = React.useCallback((target: FeeCollectTarget) => {
    setToast({
      id: Date.now(),
      title: "Fees collected",
      message: `${formatUsd(target.usdValue)} claimed from ${target.project}.`,
      tone: "success",
    });
  }, []);

  const boards = React.useMemo(() => getSortedBoards(boardsState, query, sortMode), [boardsState, query, sortMode]);
  const visibleTokenCards = React.useMemo(() => getVisibleTokenCards(selectedNetworks, contentSort, smartNow), [selectedNetworks, contentSort, smartNow]);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const sortLabel = sortMode === "smart" ? "Smart" : sortMode === "pinned" ? "Pinned" : "Favorites";

  const closeAll = React.useCallback(() => {
    setSettingsOpen(false);
  }, []);

  const openCollectFees = React.useCallback(() => {
    closeAll();
    setCollectFeesOpen(true);
  }, [closeAll]);

  const togglePin = React.useCallback((id: string) => {
    if (id === "based") return;
    setBoardsState((prev) => prev.map((b) => (b.id === id ? { ...b, isPinned: !b.isPinned } : b)));
  }, []);

  const toggleNetworkFilter = React.useCallback((chain: Network) => {
    setSelectedNetworks((current) => {
      const next = new Set(current);
      if (next.has(chain)) next.delete(chain);
      else next.add(chain);
      return next;
    });
  }, []);

  const resetContentFilters = React.useCallback(() => {
    setContentSort("smart");
    setSelectedNetworks(createAllNetworkSet());
  }, []);

  React.useEffect(() => {
    const timer = window.setInterval(() => setSmartNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedBoard = params.get("board");
    const requestedQuery = params.get("q");

    const handoff = window.setTimeout(() => {
      if (requestedBoard && BOARDS.some((board) => board.id === requestedBoard)) {
        setActiveBoard(requestedBoard);
      }
      if (requestedQuery) setQuery(requestedQuery);
      if (params.get("collect") === "1") setCollectFeesOpen(true);
    }, 0);

    return () => window.clearTimeout(handoff);
  }, []);

  React.useEffect(() => {
    runSelfTests();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !(e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") closeAll();
    };
    const onDoc = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t?.closest?.("[data-settings]")) setSettingsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDoc);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDoc);
    };
  }, [closeAll]);

  return (
    <div className="bb-app relative flex h-[calc(100vh-56px)] w-full flex-col overflow-hidden bg-[#090a0a] text-white">
      <style jsx global>{GLOBAL_CSS}</style>

      <div className="flex h-full w-full flex-col">
        <div className="flex min-h-0 flex-1">
          <SidebarPanel
            query={query}
            onQuery={setQuery}
            searchRef={searchRef}
            sortLabel={sortLabel}
            onCycleSort={() => setSortMode((m) => (m === "smart" ? "pinned" : m === "pinned" ? "favorites" : "smart"))}
            boards={boards}
            activeBoard={activeBoard}
            onSelectBoard={setActiveBoard}
            onTogglePin={togglePin}
            onOpenCollectFees={openCollectFees}
            collectFeesOpen={collectFeesOpen}
          />
          <div className="flex min-h-0 flex-1 flex-col bg-[#090a0a]">
            <MainContentHeader contentSort={contentSort} onSetContentSort={setContentSort} selectedNetworks={selectedNetworks} onToggleNetwork={toggleNetworkFilter} onSelectAllNetworks={() => setSelectedNetworks(createAllNetworkSet())} onReset={resetContentFilters} />
            <TokenCardGrid cards={visibleTokenCards} currentTime={smartNow} />
          </div>
        </div>

        <BottomBar
          settings={<SettingsDropdown open={settingsOpen} onToggle={() => setSettingsOpen((v) => !v)} />}
          cookiesEnabled={cookiesEnabled}
          onToggleCookies={() => setCookiesEnabled((value) => !value)}
        />
      </div>

      <CollectFeesModal open={collectFeesOpen} walletAddress={addr} onClose={() => setCollectFeesOpen(false)} onCollected={showCollectedToast} />
      <ToastViewport toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
