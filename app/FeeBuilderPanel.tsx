'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import FeeEngineCard, {
  type FeeEngineAsset,
  type FeeEngineRewardPayment,
  type FeeEngineRoute,
  type FeeEngineRouteKind,
} from './FeeEngineCard';
import { featheredFeeGradient } from './feeGradient';
import {
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Code2,
  Coins,
  Crown,
  Droplets,
  GripVertical,
  Flame,
  Landmark,
  Minus,
  Plus,
  TriangleAlert,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';

const T = {
  border: 'rgba(244,249,246,0.10)',
  text: 'rgba(244,249,246,0.94)',
  muted: 'rgba(244,249,246,0.62)',
} as const;

const S = {
  chip: 'rgba(244,249,246,0.045)',
  row: '#0A0F0D',
  bar: 'rgba(244,249,246,0.105)',
} as const;

export type ChainId = 'eth' | 'base' | 'bsc' | 'sol' | 'robinhood' | 'megaeth';
export type RewardAsset = 'ETH' | 'BNB' | 'SOL' | 'USDC' | 'USDT' | 'USD1' | 'USDG';

const ADDRESS_EXPLORERS: Record<ChainId, string> = {
  eth: 'https://etherscan.io/address/',
  base: 'https://basescan.org/address/',
  bsc: 'https://bscscan.com/address/',
  sol: 'https://solscan.io/account/',
  robinhood: 'https://robinhoodchain.blockscout.com/address/',
  megaeth: 'https://mega.etherscan.io/address/',
};

export type FeeWallet = {
  id: string;
  name: string;
  pct: number;
  address?: string;
  rewardAsset?: RewardAsset;
  rewardAddress?: string;
  rewardThresholdPct?: number;
  rwaAssets?: string[];
  rwaDistributionMode?: RwaDistributionMode;
  rewardGasPayer?: RewardGasPayer;
  routeRewardMode?: RouteRewardMode;
  rwaAssetWeights?: Record<string, number>;
  rwaPinnedAssets?: string[];
};

type FeeType = 'creator' | 'rewards' | 'rwa' | 'buybacks' | 'liq' | 'ops' | 'custom';
type Drag = { id: string; pid: number; y: number; off: number; h: number; baseTop: number };
type CssVarStyle = React.CSSProperties & Record<`--${string}`, string | number>;
type ProtectionOption = { label: string; sublabel?: string; value: string };
type PresetKey = 'mixed' | 'creator' | 'balanced' | 'rewards' | 'cto';
type RwaCategory = 'token' | 'stock' | 'etf';
type RwaDistributionMode = 'rotating' | 'all';
type RewardGasPayer = 'project' | 'user';
type RouteRewardMode = 'single' | 'basket';
type RewardBasketAsset = { id?: string; symbol: string; name: string; category: RwaCategory; address: string; icon?: string };

type ChipsProps<T extends string | number> = {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  format?: (v: T) => React.ReactNode;
  disabled?: boolean;
  className?: string;
  compact?: boolean;
};

type RowProps = {
  fee: FeeWallet;
  chain: ChainId;
  walletAddress?: string | null;
  max: number;
  disabled: boolean;
  dragging: boolean;
  ghost?: boolean;
  patch: (id: string, p: Partial<FeeWallet>) => void;
  setPct: (id: string, v: number) => void;
  remove: (id: string) => void;
  onDrag?: (e: React.PointerEvent) => void;
  bind?: (el: HTMLDivElement | null) => void;
  attention?: boolean;
  onExpand?: (id: string) => void;
};

const LOCKED = new Set(['creator', 'rewards', 'rwa', 'buybacks', 'liq', 'ops']);
const ADDRESS_REQUIRED = new Set(['ops']);
const ADD: FeeType[] = ['creator', 'rwa', 'ops', 'buybacks', 'liq', 'custom'];
const RP = [0.01, 0.1, 1, 5] as const;
const RWA_DISTRIBUTION_MODES = ['rotating', 'all'] as const;
const REWARD_GAS_PAYERS = ['project', 'user'] as const;
const ROUTE_REWARD_MODES = ['single', 'basket'] as const;
const TRIGGER_PRESETS = [0.01, 0.05, 0.1, 0.25] as const;
const CONTROL_REVEAL_TRANSITION = { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const };
const PRESETS: Array<{ key: PresetKey; label: string; mobileLabel: string; hint: string }> = [
  { key: 'rewards', label: 'Rewards', mobileLabel: 'Rewards', hint: 'Prioritize holder rewards.' },
  { key: 'creator', label: 'Creator-led', mobileLabel: 'Creator', hint: 'Maximize creator revenue.' },
  { key: 'balanced', label: 'Balanced', mobileLabel: 'Balanced', hint: 'Evenly spread revenue streams.' },
  { key: 'mixed', label: 'Mixed', mobileLabel: 'Mixed', hint: 'Creator, treasury, rewards and burns.' },
  { key: 'cto', label: 'CTO', mobileLabel: 'CTO', hint: 'Community takeover routing.' },
];

const RW: Record<ChainId, readonly RewardAsset[]> = {
  eth: ['ETH', 'USDC', 'USDT', 'USD1', 'USDG'],
  base: ['ETH', 'USDC', 'USDT'],
  bsc: ['BNB', 'USDC', 'USDT', 'USD1'],
  sol: ['SOL', 'USDC', 'USDT', 'USD1'],
  robinhood: ['ETH', 'USDG'],
  megaeth: ['ETH', 'USDC', 'USDT'],
};

const RWA_ASSETS: ReadonlyArray<RewardBasketAsset> = [
  { symbol: 'AAPL', name: 'Apple', category: 'stock', address: '0xaF3D76f1834A1d425780943C99Ea8A608f8a93f9' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', category: 'stock', address: '0x86923f96303D656E4aa86D9d42D1e57ad2023fdC' },
  { symbol: 'AMZN', name: 'Amazon', category: 'stock', address: '0x12f190a9F9d7D37a250758b26824B97CE941bF54' },
  { symbol: 'BABA', name: 'Alibaba', category: 'stock', address: '0xad25Ac6C84D497db898fa1E8387bf6Af3532a1c4' },
  { symbol: 'BE', name: 'Bloom Energy', category: 'stock', address: '0x822CC93fFD030293E9842c30BBD678F530701867' },
  { symbol: 'COIN', name: 'Coinbase', category: 'stock', address: '0x6330D8C3178a418788dF01a47479c0ce7CCF450b' },
  { symbol: 'CRCL', name: 'Circle', category: 'stock', address: '0xdF0992E440dD0be65BD8439b609d6D4366bf1CB5' },
  { symbol: 'CRWV', name: 'CoreWeave', category: 'stock', address: '0x5f10A1C971B69e47e059e1dC91901B59b3fB49C3' },
  { symbol: 'GOOGL', name: 'Alphabet', category: 'stock', address: '0x2e0847E8910a9732eB3fb1bb4b70a580ADAD4FE3' },
  { symbol: 'INTC', name: 'Intel', category: 'stock', address: '0xc72b96e0E48ecd4DC75E1e45396e26300BC39681' },
  { symbol: 'META', name: 'Meta Platforms', category: 'stock', address: '0xc0D6457C16Cc70d6790Dd43521C899C87ce02f35' },
  { symbol: 'MSFT', name: 'Microsoft', category: 'stock', address: '0xe93237C50D904957Cf27E7B1133b510C669c2e74' },
  { symbol: 'MU', name: 'Micron', category: 'stock', address: '0xfF080c8ce2E5feadaCa0Da81314Ae59D232d4afD' },
  { symbol: 'NVDA', name: 'NVIDIA', category: 'stock', address: '0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC' },
  { symbol: 'ORCL', name: 'Oracle', category: 'stock', address: '0xb0992820E760d836549ba69BC7598b4af75dEE03' },
  { symbol: 'PLTR', name: 'Palantir', category: 'stock', address: '0x894E1EC2D74FFE5AEF8Dc8A9e84686acCB964F2A' },
  { symbol: 'SNDK', name: 'Sandisk', category: 'stock', address: '0xB90A19fF0Af67f7779afF50A882A9CfF42446400' },
  { symbol: 'SPCX', name: 'SpaceX', category: 'stock', address: '0x4a0E65A3EcceC6dBe60AE065F2e7bb85Fae35eEa' },
  { symbol: 'TSLA', name: 'Tesla', category: 'stock', address: '0x322F0929c4625eD5bAd873c95208D54E1c003b2d' },
  { symbol: 'USAR', name: 'USA Rare Earth', category: 'stock', address: '0xd917B029C761D264c6A312BBbcDA868658eF86a6' },
  { symbol: 'QQQ', name: 'Nasdaq-100 ETF', category: 'etf', address: '0xD5f3879160bc7c32ebb4dC785F8a4F505888de68' },
  { symbol: 'SGOV', name: 'Treasury Bond ETF', category: 'etf', address: '0x92FD66527192E3e61d4DDd13322Aa222DE86F9B5' },
  { symbol: 'SLV', name: 'Silver Trust ETF', category: 'etf', address: '0x411eFb0E7f985935DAec3D4C3ebaEa0d0AD7D89f' },
  { symbol: 'SPY', name: 'S&P 500 ETF', category: 'etf', address: '0x117cc2133c37B721F49dE2A7a74833232B3B4C0C' },
  { symbol: 'CUSO', name: 'CUSO ETF', category: 'etf', address: '0xa30FA36Db767ad9eD3f7a60fC79526fB4d56D344' },
];
const RWA_PRESET_ASSETS = ['AAPL', 'NVDA', 'TSLA', 'AMD', 'SPCX'] as const;

const TOKEN_NAMES: Record<RewardAsset, string> = {
  ETH: 'Ethereum',
  BNB: 'BNB',
  SOL: 'Solana',
  USDC: 'USD Coin',
  USDT: 'Tether USD',
  USD1: 'World Liberty USD',
  USDG: 'Global Dollar',
};

const token = (symbol: string, name: string, address: string, icon: string): RewardBasketAsset => ({
  id: `TOKEN:${symbol}`,
  symbol,
  name,
  category: 'token',
  address,
  icon,
});

const TOKEN_CATALOG: readonly RewardBasketAsset[] = [
  token('BTC', 'Bitcoin', '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', '/tokens/bitcoin.png'),
  token('ETH', TOKEN_NAMES.ETH, '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73', '/tokens/ethereum.png'),
  token('BNB', TOKEN_NAMES.BNB, '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', '/tokens/bnb.png'),
  token('SOL', TOKEN_NAMES.SOL, 'So11111111111111111111111111111111111111112', '/tokens/solana.png'),
  token('USDC', TOKEN_NAMES.USDC, '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', '/tokens/usdc.png'),
  token('USDT', TOKEN_NAMES.USDT, '0x55d398326f99059fF775485246999027B3197955', '/tokens/usdt.png'),
  token('USDG', TOKEN_NAMES.USDG, '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168', '/tokens/usdg.png'),
  token('USD1', TOKEN_NAMES.USD1, '0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d', '/tokens/usd1.png'),
  token('HYPE', 'Hyperliquid', '0x15d0e0c55a3e7ee67152ad7e89acf164253ff68d', '/tokens/hype.jpg'),
  token('ASTER', 'Aster', '0x000Ae314E2A2172a039B26378814C252734f556A', '/tokens/aster.jpg'),
  token('INDEX', 'The Index', '0x56910D4409F3a0C78C64DD8D0545FF0705389870', '/tokens/index.jpg'),
  token('SHIB', 'Shiba Inu', '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', '/tokens/shib.png'),
  token('PEPE', 'Pepe', '0x6982508145454Ce325dDbE47a25d4ec3d2311933', '/tokens/pepe.jpg'),
  token('BONK', 'Bonk', 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6uEpgpZ6zV6vC4P', '/tokens/bonk.jpg'),
  token('CASHCAT', 'Cash Cat', '0x020bfC650A365f8BB26819deAAbF3E21291018b4', '/tokens/cashcat.png'),
  token('BRIAN', 'Coinbase Man', '0xB2000000000000000000007BF6D5cBb0E24cB301', '/tokens/brian.jpg'),
  token('JESSE', 'jesse', '0x50F88fe97f72CD3E75b9Eb4f747F59BcEBA80d59', '/tokens/jesse.jpg'),
  token('ANSEM', 'The Black Bull', '9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump', '/tokens/ansem.jpg'),
  token('TOSHI', 'Toshi', '0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4', '/tokens/toshi.png'),
  token('SIREN', 'Siren', '0x997a58129890bbda032231a52ed1ddc845fc18e1', '/tokens/siren.png'),
];

const tokenAssets = (): RewardBasketAsset[] => [...TOKEN_CATALOG];

const assetId = (asset: RewardBasketAsset) => asset.id ?? asset.symbol;
const nativeRewardAssetId = (chain: ChainId) => `TOKEN:${rewardOf(chain)}`;

const tokenPresetAssets = () => ['TOKEN:CASHCAT', 'TOKEN:ETH', 'TOKEN:USDC'];

const rewardBaskets = () => {
  const tokens = tokenPresetAssets();
  return [
    { key: 'core', label: 'Stonks', assets: [...RWA_PRESET_ASSETS] },
    { key: 'tokens', label: 'Tokens', assets: tokens },
    { key: 'blend', label: 'Combo', assets: ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'SPY', 'QQQ', 'SGOV', ...tokens] },
    { key: 'index', label: 'Index', assets: ['QQQ', 'SPY'] },
    { key: 'mega', label: 'Mega Cap', assets: ['AAPL', 'AMZN', 'GOOGL', 'META', 'MSFT', 'NVDA'] },
    { key: 'ai', label: 'AI & Tech', assets: ['AMD', 'CRWV', 'GOOGL', 'META', 'MSFT', 'MU', 'NVDA', 'ORCL', 'PLTR'] },
    { key: 'etfs', label: 'ETFs', assets: ['QQQ', 'SGOV', 'SLV', 'SPY', 'CUSO'] },
  ];
};

const routeRewardBaskets = (chain: ChainId) => [
  { key: 'tokens', label: 'Tokens', assets: [nativeRewardAssetId(chain)] },
  ...rewardBaskets().filter((basket) => basket.key !== 'tokens'),
];

const matchesAssetBasket = (value: readonly string[], basket: readonly string[]) =>
  value.length === basket.length && basket.every((symbol) => value.includes(symbol));

const META = {
  creator: { c: '#00E38C', d: 'Direct revenue for the token creator.', i: Crown },
  ops: { c: '#60A5FA', d: 'Routes fees to your treasury wallet.', i: Landmark },
  liq: { c: '#22D3EE', d: 'Strengthens the liquidity pool and market depth.', i: Droplets },
  rewards: { c: '#FBBF24', d: 'Distributes value back to holders.', i: Coins },
  rwa: { c: '#B7F34A', d: 'Rewards holders with your selected tokens, stocks, and ETFs.', i: BriefcaseBusiness },
  buybacks: { c: '#8B7CF6', d: 'Automatically buys & burns your token.', i: Flame },
  custom: { c: '#94A3B8', d: 'Sent to any custom wallet.', i: Code2 },
} as const;

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const round1 = (n: number) => Math.round(n * 10) / 10;
const fmtPct = (n: number) => (round1(n) % 1 === 0 ? `${round1(n).toFixed(0)}%` : `${round1(n).toFixed(1)}%`);
const fillPct = (v: number, min: number, max: number) => `${(clamp((v - min) / Math.max(max - min, 0.0001), 0, 1) * 100).toFixed(3)}%`;
const rewardOf = (c: ChainId): RewardAsset => (c === 'bsc' ? 'BNB' : c === 'sol' ? 'SOL' : 'ETH');
const normalizeChain = (value?: string): ChainId => {
  const candidate = value?.toLowerCase();
  return candidate === 'base' || candidate === 'bsc' || candidate === 'sol' || candidate === 'robinhood' || candidate === 'megaeth'
    ? candidate
    : 'eth';
};
const canAdd = (t: FeeType, ids: Set<string>) => t === 'custom' || (t === 'rwa' ? !ids.has('rwa') && !ids.has('rewards') : !ids.has(t));
const label = (t: FeeType) => ({ creator: 'Creator Revenue', rewards: 'Holder Rewards', rwa: 'Rewards Basket', buybacks: 'Buybacks & Burns', liq: 'Liquidity', ops: 'Treasury', custom: 'Custom Routes' }[t]);

function classify(id: string, name: string): FeeType {
  const k = `${id} ${name}`.toLowerCase();
  if (id === 'rwa') return 'rwa';
  if (k.includes('creator')) return 'creator';
  if (k.includes('reward')) return 'rewards';
  if (k.includes('buyback') || k.includes('burn')) return 'buybacks';
  if (k.includes('liquid') || k.includes('lp')) return 'liq';
  if (k.includes('treasury') || k.includes('marketing') || k.includes('ops') || k.includes('operation')) return 'ops';
  return 'custom';
}

const tint = (id: string, name: string) => META[classify(id, name)].c;
const desc = (f: FeeWallet) => META[classify(f.id, f.name)].d;

const rgba = (hex: string, a: number) => {
  const raw = hex.startsWith('#') ? hex.slice(1) : hex;
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
  return full.length !== 6
    ? `rgba(255,255,255,${a})`
    : `rgba(${parseInt(full.slice(0, 2), 16)},${parseInt(full.slice(2, 4), 16)},${parseInt(full.slice(4, 6), 16)},${a})`;
};

const noDragTarget = (t: EventTarget | null) =>
  !!(t as HTMLElement | null)?.closest('input,button,textarea,select,a,[data-no-drag]') &&
  !(t as HTMLElement | null)?.closest('[data-drag-handle]');

const shortLabel = (t: FeeType) => ({ creator: 'Creator', rewards: 'Rewards', rwa: 'Rewards Basket', buybacks: 'Buybacks', liq: 'Liquidity', ops: 'Treasury', custom: 'Custom' }[t]);

const feeEngineKind = (fee: FeeWallet): FeeEngineRouteKind => {
  const type = classify(fee.id, fee.name);
  return type === 'rwa' ? 'basket' : type === 'ops' ? 'treasury' : type === 'liq' ? 'liquidity' : type;
};

const feeEngineAsset = (id: string, weight?: number): FeeEngineAsset => {
  const asset = [...TOKEN_CATALOG, ...RWA_ASSETS].find((candidate) => assetId(candidate) === id);
  const symbol = asset?.symbol ?? id.replace(/^TOKEN:/, '');
  return {
    id,
    symbol,
    name: asset?.name ?? symbol,
    icon: asset?.icon ?? (asset?.category === 'stock' || asset?.category === 'etf' ? `/rwa/${symbol.toLowerCase()}.png` : undefined),
    weight,
    address: asset?.address,
    decimals: symbol === 'BTC' ? 8 : symbol === 'USDC' || symbol === 'USDT' ? 6 : 18,
  };
};

const feeEngineDetail = (fee: FeeWallet, chain: ChainId) => {
  const type = classify(fee.id, fee.name);
  if (type === 'creator') return 'Trading fees paid directly to the creator.';
  if (type === 'rewards') return `Pays eligible holders in ${fee.rewardAsset ?? rewardOf(chain)}.`;
  if (type === 'rwa') return 'Pays eligible holders in the configured asset basket.';
  if (type === 'buybacks') return 'Automatically buys & burns your token.';
  if (type === 'liq') return 'Adds trading fees back to liquidity and market depth.';
  if (type === 'ops') return 'Routes trading fees to the treasury wallet.';
  return 'Routes trading fees to the custom recipient.';
};

const needsAddress = (f: FeeWallet) =>
  !(f.pct <= 0) && (ADDRESS_REQUIRED.has(f.id) || !LOCKED.has(f.id));

const isEvmAddress = (value: string) => /^0x[\da-f]{40}$/i.test(value.trim());
const isSolanaAddress = (value: string) => {
  const address = value.trim();
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  if (address.length < 32 || address.length > 44 || !/^[1-9A-HJ-NP-Za-km-z]+$/.test(address)) return false;
  let decoded = 0n;
  for (const character of address) {
    const index = alphabet.indexOf(character);
    if (index < 0) return false;
    decoded = decoded * 58n + BigInt(index);
  }
  let byteLength = 0;
  for (let current = decoded; current > 0n; current >>= 8n) byteLength += 1;
  const leadingZeroBytes = address.match(/^1*/)?.[0].length ?? 0;
  return byteLength + leadingZeroBytes === 32;
};
const isRecipientAddressValid = (value: string, chain: ChainId) => chain === 'sol' ? isSolanaAddress(value) : isEvmAddress(value);

export const isMissingAddr = (f: FeeWallet, chain: ChainId = 'eth') =>
  f.id === 'rwa' && f.pct > 0
    ? !(f.rwaAssets?.length)
    : (f.routeRewardMode && f.pct > 0 && !(f.rwaAssets?.length))
      || (!needsAddress(f) ? false : !isRecipientAddressValid(f.address ?? '', chain));

export const totalWarnLevel = (n: number): 'danger' | 'warn' | null => (n > 6.9 ? 'danger' : n >= 4.1 ? 'warn' : null);

function totalBar(fees: FeeWallet[]) {
  const active = fees.filter((f) => (f.pct ?? 0) > 0);
  const t = active.reduce((s, f) => s + (f.pct ?? 0), 0);
  return !active.length || t <= 0
    ? { t, bg: 'rgba(0,0,0,0)' }
    : { t, bg: featheredFeeGradient(active.map((f) => ({ weight: clamp(((f.pct ?? 0) / t) * 100, 0, 100), color: tint(f.id, f.name) }))) };
}

function equalize(list: FeeWallet[], id: string, nextPct: number, max: number) {
  const cap = clamp(max, 0.0001, 100);
  const next = list.map((f) => ({ ...f }));
  const i = next.findIndex((f) => f.id === id);
  if (i < 0) return next;
  next[i].pct = clamp(round1(nextPct), 0, cap);
  let over = next.reduce((s, f) => s + (f.pct ?? 0), 0) - cap;
  if (over <= 1e-9) return next;
  next
    .map((f, i) => ({ i, id: f.id, p: f.pct }))
    .filter((x) => x.id !== id && x.p > 0)
    .sort((a, b) => b.p - a.p)
    .forEach((r) => {
      if (over <= 1e-9) return;
      const d = Math.min(Math.max(0, next[r.i].pct), over);
      next[r.i].pct = round1(next[r.i].pct - d);
      over -= d;
    });
  if (over > 1e-9) next[i].pct = clamp(round1(next[i].pct - over), 0, cap);
  return next;
}

function reorder<T>(arr: T[], from: number, to: number) {
  const c = [...arr];
  const [it] = c.splice(from, 1);
  c.splice(clamp(to, 0, c.length), 0, it);
  return c;
}

const BASKET_WEIGHT_UNITS = 1000;

function distributeAssetWeights(ids: readonly string[], totalUnits: number, source?: Record<string, number>) {
  if (!ids.length) return {};
  const safeTotal = Math.max(0, Math.round(totalUnits));
  const sourceWeights = ids.map((id) => Math.max(0, Number.isFinite(source?.[id]) ? source?.[id] ?? 0 : 0));
  const sourceTotal = sourceWeights.reduce((sum, weight) => sum + weight, 0);
  const rawUnits = sourceTotal > 0
    ? sourceWeights.map((weight) => safeTotal * weight / sourceTotal)
    : ids.map(() => safeTotal / ids.length);
  const units = rawUnits.map(Math.floor);
  let remaining = safeTotal - units.reduce((sum, value) => sum + value, 0);

  rawUnits
    .map((value, index) => ({ index, remainder: value - units[index] }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index)
    .forEach(({ index }) => {
      if (remaining <= 0) return;
      units[index] += 1;
      remaining -= 1;
    });

  return Object.fromEntries(ids.map((id, index) => [id, units[index] / 10]));
}

function equalAssetWeights(ids: readonly string[]) {
  return distributeAssetWeights(ids, BASKET_WEIGHT_UNITS);
}

function normalizeAssetWeights(ids: readonly string[], current?: Record<string, number>) {
  if (!current || ids.some((id) => !Number.isFinite(current[id]))) return equalAssetWeights(ids);
  return distributeAssetWeights(ids, BASKET_WEIGHT_UNITS, current);
}

function distributeAssetWeightsWithMinimum(ids: readonly string[], totalUnits: number, source?: Record<string, number>) {
  if (!ids.length) return {};
  const minimumUnits = ids.length;
  const extraUnits = Math.max(0, Math.round(totalUnits) - minimumUnits);
  const sourceAboveMinimum = Object.fromEntries(ids.map((id) => [id, Math.max(0, (source?.[id] ?? 0) - 0.1)]));
  const extra = distributeAssetWeights(ids, extraUnits, sourceAboveMinimum);
  return Object.fromEntries(ids.map((id) => [id, round1(0.1 + (extra[id] ?? 0))]));
}

function updateAssetWeight(ids: readonly string[], current: Record<string, number>, id: string, nextValue: number, pinnedIds: readonly string[] = []) {
  if (ids.length <= 1) return ids.length ? { [ids[0]]: 100 } : {};
  const pinned = new Set(pinnedIds);
  const protectedIds = ids.filter((assetId) => assetId !== id && pinned.has(assetId));
  const adjustableIds = ids.filter((assetId) => assetId !== id && !pinned.has(assetId));
  const protectedUnits = protectedIds.reduce((sum, assetId) => sum + Math.round((current[assetId] ?? 0.1) * 10), 0);
  const maxValue = (BASKET_WEIGHT_UNITS - protectedUnits - adjustableIds.length) / 10;
  const targetUnits = Math.round(clamp(round1(nextValue), 0.1, maxValue) * 10);
  return {
    ...Object.fromEntries(protectedIds.map((assetId) => [assetId, current[assetId]])),
    ...distributeAssetWeightsWithMinimum(adjustableIds, BASKET_WEIGHT_UNITS - protectedUnits - targetUnits),
    [id]: targetUnits / 10,
  };
}

function reconcileAssetWeights(ids: readonly string[], current: Record<string, number>, pinnedIds: readonly string[]) {
  if (!ids.length) return { weights: {}, pinnedIds: [] as string[] };
  const selected = new Set(ids);
  const pinned = pinnedIds.filter((id) => selected.has(id));
  const adjustable = ids.filter((id) => !pinned.includes(id));

  if (!adjustable.length) {
    const released = pinned.pop();
    if (released) adjustable.push(released);
  }

  const fixedUnits = () => pinned.reduce((sum, id) => sum + Math.round((current[id] ?? 0.1) * 10), 0);
  while (pinned.length && fixedUnits() > BASKET_WEIGHT_UNITS - adjustable.length) {
    const released = pinned.pop();
    if (released) adjustable.push(released);
  }

  const pinnedUnits = fixedUnits();
  return {
    weights: {
      ...Object.fromEntries(pinned.map((id) => [id, current[id]])),
      ...distributeAssetWeightsWithMinimum(adjustable, BASKET_WEIGHT_UNITS - pinnedUnits),
    },
    pinnedIds: pinned,
  };
}

const make = (chain: ChainId, t: Exclude<FeeType, 'custom'>): FeeWallet =>
  t === 'creator'
    ? { id: 'creator', name: 'Creator Revenue', pct: 1 }
    : t === 'rewards'
      ? { id: 'rewards', name: 'Holder Rewards', pct: 1, rewardAsset: rewardOf(chain), rewardThresholdPct: 0.1 }
      : t === 'rwa'
        ? { id: 'rwa', name: 'Rewards Basket', pct: 1, rwaAssets: [...RWA_PRESET_ASSETS], rwaAssetWeights: equalAssetWeights(RWA_PRESET_ASSETS), rewardThresholdPct: 0.1, rwaDistributionMode: 'rotating', rewardGasPayer: 'user' }
      : t === 'buybacks'
        ? { id: 'buybacks', name: 'Buybacks & Burns', pct: 1 }
        : t === 'liq'
          ? { id: 'liq', name: 'Liquidity', pct: 1 }
          : { id: 'ops', name: 'Treasury', pct: 1, address: '', routeRewardMode: 'single', rwaAssets: [nativeRewardAssetId(chain)], rwaAssetWeights: { [nativeRewardAssetId(chain)]: 100 }, rwaDistributionMode: 'rotating' };

const presetFees = (chain: ChainId, preset: PresetKey): FeeWallet[] => {
  const map: Record<PresetKey, Array<{ type: FeeType; pct: number }>> = {
    mixed: [{ type: 'creator', pct: 3.1 }, { type: 'buybacks', pct: 1.2 }, { type: 'rwa', pct: 1.7 }, { type: 'liq', pct: 0.4 }, { type: 'ops', pct: 1.3 }],
    creator: [{ type: 'creator', pct: 3 }],
    balanced: [{ type: 'creator', pct: 1 }, { type: 'buybacks', pct: 1 }, { type: 'rwa', pct: 1 }],
    rewards: [{ type: 'rwa', pct: 4 }],
    cto: [{ type: 'buybacks', pct: 3 }, { type: 'rwa', pct: 1 }],
  };

  return map[preset].map(({ type, pct }) => {
    if (type === 'custom') return { id: 'custom-routes', name: 'Custom Routes', pct, address: '', routeRewardMode: 'single', rwaAssets: [nativeRewardAssetId(chain)], rwaAssetWeights: { [nativeRewardAssetId(chain)]: 100 }, rwaDistributionMode: 'rotating' };
    const fee = { ...make(chain, type), pct };
    if (type !== 'rwa') return fee;
    const rwaAssets = preset === 'rewards' ? [...RWA_PRESET_ASSETS] : [nativeRewardAssetId(chain)];
    return { ...fee, rwaAssets, rwaAssetWeights: equalAssetWeights(rwaAssets) };
  });
};

const Icon = ({ t, size = 12.5, y = -0.1, color = T.text }: { t: FeeType; size?: number; y?: number; color?: string }) => {
  const C = META[t].i;
  return <C size={size} strokeWidth={1.9} style={{ display: 'block', color, transform: `translateY(${t === 'creator' ? -0.15 : y}px)` }} aria-hidden />;
};

function TextField({ value, onChange, placeholder, label, className = '', disabled, accent = '#94A3B8', invalid = false, invalidLabel = 'Required', focusTarget = false }: { value: string; onChange: (v: string) => void; placeholder?: string; label?: string; className?: string; disabled?: boolean; accent?: string; invalid?: boolean; invalidLabel?: string; focusTarget?: boolean }) {
  const fieldAccent = invalid ? '#FF7184' : accent;
  return (
    <div
      data-no-drag
      className={`bbField flex h-7 min-w-0 items-center gap-1.5 rounded-[10px] border px-2.5 sm:h-8 sm:gap-2 sm:rounded-xl sm:px-3 ${className}`}
      style={{
        '--fieldAccent': fieldAccent,
        borderColor: invalid ? rgba(fieldAccent, 0.36) : rgba(fieldAccent, 0.14),
        background: invalid
          ? `linear-gradient(180deg, ${rgba(fieldAccent, 0.048)}, rgba(244,249,246,0.018))`
          : 'linear-gradient(180deg, rgba(244,249,246,0.036), rgba(244,249,246,0.016))',
        boxShadow: invalid
          ? `0 0 0 1px ${rgba(fieldAccent, 0.06)} inset, 0 8px 18px rgba(0,0,0,0.12), 0 0 16px ${rgba(fieldAccent, 0.030)}`
          : `0 0 0 1px ${rgba(fieldAccent, 0.026)} inset, 0 8px 18px rgba(0,0,0,0.10)`,
      } as CssVarStyle}
    >
      {label ? (
        <>
          <span className='shrink-0 text-[8px] font-semibold uppercase tracking-[0.10em] sm:text-[9px] sm:tracking-[0.12em]' style={{ color: invalid ? rgba(fieldAccent, 0.86) : rgba(fieldAccent, 0.68) }}>{label}</span>
          <span className='h-3.5 w-px shrink-0' style={{ background: invalid ? rgba(fieldAccent, 0.18) : 'rgba(244,249,246,0.09)' }} aria-hidden />
        </>
      ) : null}
      <input
        data-focus-target={focusTarget || undefined}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        className='bbFieldInput min-w-0 flex-1 bg-transparent text-[11.5px] font-medium leading-none outline-none sm:text-[12.5px]'
        style={{ color: T.text }}
      />
      {invalid ? <span className='hidden shrink-0 rounded-full border px-1.5 py-[1px] text-[7.5px] font-semibold uppercase tracking-[0.09em] sm:inline-flex sm:text-[8.5px] sm:tracking-[0.10em]' style={{ color: rgba(fieldAccent, 0.90), background: rgba(fieldAccent, 0.075), borderColor: rgba(fieldAccent, 0.20) }}>{invalidLabel}</span> : null}
    </div>
  );
}

function UseWalletPill({ chain, walletAddress, value, disabled, accent, className = '', onUse }: { chain: ChainId; walletAddress?: string | null; value: string; disabled?: boolean; accent: string; className?: string; onUse: (address: string) => void }) {
  const [requestedAddress, setRequestedAddress] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
  const activeAddress = walletAddress?.trim() || requestedAddress;
  const available = Boolean(activeAddress);
  const selected = available && value.trim().toLowerCase() === activeAddress?.toLowerCase();

  const useWallet = async () => {
    if (selected || disabled || requesting) return;
    if (activeAddress) {
      onUse(activeAddress);
      return;
    }
    setRequesting(true);
    try {
      if (chain === 'sol') {
        const walletWindow = window as unknown as { solana?: { connect: () => Promise<{ publicKey?: { toString: () => string } }> }; phantom?: { solana?: { connect: () => Promise<{ publicKey?: { toString: () => string } }> } } };
        const provider = walletWindow.solana ?? walletWindow.phantom?.solana;
        if (!provider) return;
        const connection = await provider.connect();
        const address = connection.publicKey?.toString() ?? null;
        if (address) {
          setRequestedAddress(address);
          onUse(address);
        }
        return;
      }
      const provider = (window as unknown as { ethereum?: { request: (args: { method: string }) => Promise<unknown> } }).ethereum;
      if (!provider) return;
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      const address = Array.isArray(accounts) && typeof accounts[0] === 'string' ? accounts[0] : null;
      if (address) {
        setRequestedAddress(address);
        onUse(address);
      }
    } catch {
      // The wallet keeps control when the connection request is rejected.
    } finally {
      setRequesting(false);
    }
  };

  return (
    <button
      type='button'
      data-no-drag
      disabled={disabled || selected || requesting}
      onClick={() => void useWallet()}
      aria-pressed={selected}
      aria-label={selected ? 'My wallet is the recipient' : available ? 'Use my connected wallet as recipient' : 'Connect and use my wallet as recipient'}
      className={`bbPill inline-flex h-6 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full border px-2 text-[9px] font-semibold outline-none disabled:cursor-default disabled:opacity-60 sm:h-6 sm:rounded-full sm:px-2 sm:text-[9.5px] ${className}`}
      style={{
        color: selected ? rgba(accent, 0.96) : 'rgba(244,249,246,0.60)',
        background: selected ? rgba(accent, 0.085) : 'rgba(244,249,246,0.025)',
        borderColor: selected ? rgba(accent, 0.30) : rgba(accent, 0.14),
        boxShadow: `0 0 0 1px ${rgba(accent, 0.025)} inset`,
      }}
    >
      {requesting ? <span className='h-2.5 w-2.5 animate-spin rounded-full border border-current border-r-transparent' aria-hidden /> : selected ? <Check size={10.5} strokeWidth={2.2} aria-hidden /> : null}
      {requesting ? 'Connecting…' : selected ? 'Added' : 'My wallet'}
    </button>
  );
}

function Pills<T extends string | number>({ options, value, onChange, format, disabled, className, compact = false }: ChipsProps<T>) {
  return (
    <div className={`bbNoScroll inline-flex max-w-full flex-nowrap gap-0.5 overflow-x-auto overflow-y-visible rounded-[13px] border ${compact ? 'h-[18px] items-center p-[1px] sm:h-[24px]' : 'p-0.5'} ${className ?? ''}`} data-no-drag style={{ scrollbarWidth: 'none', background: 'rgba(244,249,246,0.018)', borderColor: 'rgba(244,249,246,0.085)' } as React.CSSProperties}>
      {options.map((o) => {
        const active = o === value;
        return (
          <button key={String(o)} type='button' disabled={disabled} onClick={() => onChange(o)} className={`bbPill bbPresetPill shrink-0 rounded-[8px] border px-1 text-[7.5px] font-semibold leading-none outline-none sm:rounded-[10px] sm:px-2 sm:text-[9.5px] ${compact ? 'h-[14px] py-0 sm:h-[20px]' : 'py-0.5 sm:py-1'}`} style={{ color: active ? T.text : 'rgba(244,249,246,0.46)', background: active ? 'rgba(244,249,246,0.095)' : 'transparent', borderColor: active ? 'rgba(244,249,246,0.14)' : 'transparent', boxShadow: active ? 'inset 0 1px 0 rgba(255,255,255,0.030)' : 'none' }}>
            {format ? format(o) : String(o)}
          </button>
        );
      })}
    </div>
  );
}

function DistributionTriggerControl({ value, onChange, disabled }: { value: number; onChange: (value: number) => void; disabled: boolean }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const customValue = !TRIGGER_PRESETS.some((preset) => preset === value);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commit = () => {
    const parsed = Number(draft.replace(',', '.'));
    if (Number.isFinite(parsed) && parsed > 0) {
      onChange(Math.min(1000, Math.max(0.001, Math.round(parsed * 1_000_000) / 1_000_000)));
    }
    setEditing(false);
  };

  return (
    <div className='bbNoScroll inline-flex max-w-full flex-nowrap gap-0.5 overflow-x-auto overflow-y-visible rounded-[13px] border p-0.5' data-no-drag style={{ scrollbarWidth: 'none', background: 'rgba(244,249,246,0.018)', borderColor: 'rgba(244,249,246,0.085)' } as React.CSSProperties}>
      {TRIGGER_PRESETS.map((preset) => {
        const active = preset === value;
        return (
          <button key={preset} type='button' disabled={disabled} onClick={() => { onChange(preset); setEditing(false); }} className='bbPill bbPresetPill shrink-0 rounded-[8px] border px-1 py-0.5 text-[7.5px] font-semibold leading-none outline-none sm:rounded-[10px] sm:px-2 sm:py-1 sm:text-[9.5px]' style={{ color: active ? T.text : 'rgba(244,249,246,0.46)', background: active ? 'rgba(244,249,246,0.095)' : 'transparent', borderColor: active ? 'rgba(244,249,246,0.14)' : 'transparent', boxShadow: active ? 'inset 0 1px 0 rgba(255,255,255,0.030)' : 'none' }}>
            {preset}
          </button>
        );
      })}
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          inputMode='decimal'
          aria-label='Custom distribution trigger in ETH'
          disabled={disabled}
          onChange={(event) => setDraft(event.target.value.replace(/[^0-9.,]/g, ''))}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur();
            if (event.key === 'Escape') setEditing(false);
          }}
          className='h-[14px] w-[38px] shrink-0 rounded-[8px] border bg-white/[0.08] px-1 text-center text-[7.5px] font-semibold leading-none text-white outline-none sm:h-[20px] sm:w-[50px] sm:rounded-[10px] sm:px-1.5 sm:text-[9.5px]'
          style={{ borderColor: 'rgba(244,249,246,0.16)' }}
        />
      ) : (
        <button type='button' disabled={disabled} onClick={() => { setDraft(customValue ? String(value) : ''); setEditing(true); }} className='bbPill bbPresetPill h-[14px] w-[38px] shrink-0 rounded-[8px] border px-1 text-[7.5px] font-semibold leading-none outline-none sm:h-[20px] sm:w-[50px] sm:rounded-[10px] sm:px-1.5 sm:text-[9.5px]' style={{ color: customValue ? T.text : 'rgba(244,249,246,0.46)', background: customValue ? 'rgba(244,249,246,0.095)' : 'transparent', borderColor: customValue ? 'rgba(244,249,246,0.14)' : 'transparent', boxShadow: customValue ? 'inset 0 1px 0 rgba(255,255,255,0.030)' : 'none' }}>
          {customValue ? value : <><span className='sm:hidden'>Set</span><span className='hidden sm:inline'>Custom</span></>}
        </button>
      )}
    </div>
  );
}

function InfoHint({ label, children, maxWidth = 290, desktopAlign = 'center', portal = false }: { label: string; children: React.ReactNode; maxWidth?: number; desktopAlign?: 'center' | 'start'; portal?: boolean }) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [mobilePosition, setMobilePosition] = useState<React.CSSProperties | undefined>();

  const positionTooltip = useCallback(() => {
    if (typeof window === 'undefined' || (window.innerWidth >= 640 && !portal)) {
      setMobilePosition(undefined);
      return;
    }

    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const gutter = 12;
    const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
    const width = Math.min(maxWidth, viewportWidth - gutter * 2);
    const left = clamp(rect.left + rect.width / 2 - width / 2, gutter, viewportWidth - width - gutter);
    const tooltipHeight = tooltipRef.current?.getBoundingClientRect().height ?? 0;
    const below = rect.bottom + 6;
    const top = below + tooltipHeight <= window.innerHeight - gutter
      ? below
      : Math.max(gutter, rect.top - tooltipHeight - 6);
    setMobilePosition({ left, top, width, bottom: 'auto' });
  }, [maxWidth, portal]);

  useEffect(() => {
    const update = () => {
      setMobile(window.innerWidth < 640);
      positionTooltip();
    };
    const frame = window.requestAnimationFrame(update);
    window.addEventListener('resize', update);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', update);
    };
  }, [positionTooltip]);

  useEffect(() => {
    if (!open && !hovered) return;
    const frame = window.requestAnimationFrame(positionTooltip);
    const close = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!buttonRef.current?.contains(target) && !tooltipRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('pointerdown', close);
    };
  }, [hovered, open, positionTooltip]);

  const tooltipContent = (
    <div className='rounded-xl border border-white/16 bg-[#171719] px-3.5 py-3 text-[12px] font-normal leading-5 tracking-[0.01em] text-white/82 shadow-[0_22px_56px_rgba(0,0,0,0.64),0_0_0_1px_rgba(255,255,255,0.045)_inset] ring-1 ring-inset ring-white/8 backdrop-blur-xl'>
      {children}
    </div>
  );

  const usePortal = mobile || portal;
  const tooltipVisible = open || hovered;
  const mobileTooltip = usePortal && typeof document !== 'undefined'
    ? createPortal(
      <div ref={tooltipRef} role='tooltip' style={{ width: `min(${maxWidth}px, calc(100vw - 24px))`, ...mobilePosition, pointerEvents: open ? 'auto' : 'none', opacity: tooltipVisible ? 1 : 0 }} className='fixed z-[100] text-left transition-opacity duration-150'>
        {tooltipContent}
      </div>,
      document.body,
    )
    : null;

  return (
    <div className='group relative inline-flex shrink-0 items-center'>
      <button ref={buttonRef} type='button' aria-label={label} aria-expanded={open} onMouseEnter={() => { setHovered(true); positionTooltip(); }} onMouseLeave={() => setHovered(false)} onFocus={positionTooltip} onClick={(event) => { event.stopPropagation(); positionTooltip(); setOpen((current) => !current); }} className='inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/12 bg-white/[0.035] text-[10px] font-semibold leading-none text-white/44 transition hover:border-white/18 hover:text-white/78 focus:border-white/22 focus:text-white focus:outline-none'>
        i
      </button>
      {usePortal ? mobileTooltip : (
        <div ref={tooltipRef} role='tooltip' style={{ width: `min(${maxWidth}px, calc(100vw - 32px))` }} className={`pointer-events-none absolute top-[calc(100%-2px)] z-40 pt-2 text-left opacity-0 transition duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 ${desktopAlign === 'start' ? 'left-0' : 'left-1/2 -translate-x-1/2'}`}>
          {tooltipContent}
        </div>
      )}
    </div>
  );
}

const Threshold = <T extends string | number,>({ labelText, mobileLabelText, suffix, options, value, onChange, format, disabled, helperText, className = 'mt-2' }: { labelText: string; mobileLabelText?: string; suffix: string; options: readonly T[]; value: T; onChange: (v: T) => void; format?: (v: T) => string; disabled?: boolean; helperText?: React.ReactNode; className?: string }) => (
  <div className={`${className} flex flex-nowrap items-center gap-1 sm:gap-1.5`} data-no-drag>
    <div className='flex shrink-0 items-center gap-1'>
      <span className='text-[8px] font-medium uppercase tracking-[0.10em] sm:text-[9px] sm:tracking-[0.13em]' style={{ color: T.muted }}>
        {mobileLabelText ? <><span className='sm:hidden'>{mobileLabelText}</span><span className='hidden sm:inline'>{labelText}</span></> : labelText}
      </span>
      {helperText ? <InfoHint label={`${labelText} helper`}>{helperText}</InfoHint> : null}
    </div>
    <div className='flex min-w-0 flex-1 flex-nowrap items-center gap-1 sm:gap-1.5'>
      <Pills compact options={options} value={value} onChange={onChange} format={format} disabled={disabled} />
      {suffix ? <span className='hidden shrink-0 text-[8px] font-medium uppercase tracking-[0.10em] sm:inline sm:text-[9px] sm:tracking-[0.13em]' style={{ color: T.muted }}>{suffix}</span> : null}
    </div>
  </div>
);

function RwaDistributionModeControl({ value, onChange, disabled, portalHint = false }: { value: RwaDistributionMode; onChange: (value: RwaDistributionMode) => void; disabled: boolean; portalHint?: boolean }) {
  return (
    <div className='flex min-w-0 flex-wrap items-center gap-1 sm:flex-nowrap sm:gap-1.5' data-no-drag>
      <div className='flex shrink-0 items-center gap-1'>
        <span className='text-[8px] font-medium uppercase tracking-[0.10em] sm:text-[9px] sm:tracking-[0.13em]' style={{ color: T.muted }}><span className='sm:hidden'>Mode</span><span className='hidden sm:inline'>Basket mode</span></span>
        <InfoHint label='Basket mode helper' maxWidth={340} portal={portalHint}>
          <div className='space-y-2'>
            <div>
              <div className='text-[9.5px] font-semibold uppercase leading-4 tracking-[0.12em] text-white/88'>Rotating</div>
              <p className='mt-0.5 text-[11.5px] leading-[17px] text-white/62'>One selected asset per cycle, advancing to the next. Lowest gas cost.</p>
            </div>
            <div className='border-t border-white/8 pt-2'>
              <div className='text-[9.5px] font-semibold uppercase leading-4 tracking-[0.12em] text-white/88'>All at once</div>
              <p className='mt-0.5 text-[11.5px] leading-[17px] text-white/62'>Every selected asset is distributed each cycle. Higher gas cost.</p>
            </div>
            <div className='rounded-lg border px-2.5 py-1.5' style={{ color: '#B7F34A', background: 'rgba(183,243,74,0.045)', borderColor: 'rgba(183,243,74,0.15)' }}>
              <div className='text-[9px] font-semibold uppercase leading-4 tracking-[0.12em]'>Ratio allocation</div>
              <p className='mt-0.5 text-[11.5px] leading-[17px] text-white/68'>Starts evenly split and always totals 100%. Editing one asset automatically rebalances the rest.</p>
            </div>
          </div>
        </InfoHint>
      </div>
      <Pills
        compact
        disabled={disabled}
        options={RWA_DISTRIBUTION_MODES}
        value={value}
        onChange={onChange}
        format={(mode) => mode === 'rotating' ? 'Rotating' : 'All at once'}
      />
    </div>
  );
}

function RewardGasPayerControl({ value, onChange, disabled }: { value: RewardGasPayer; onChange: (value: RewardGasPayer) => void; disabled: boolean }) {
  return (
    <div className='flex min-w-0 flex-nowrap items-center gap-1 sm:gap-1.5' data-no-drag>
      <div className='flex shrink-0 items-center gap-1'>
        <span className='text-[8px] font-medium uppercase tracking-[0.10em] sm:text-[9px] sm:tracking-[0.13em]' style={{ color: T.muted }}><span className='sm:hidden'>Gas</span><span className='hidden sm:inline'>Gas paid by</span></span>
        <InfoHint label='Reward gas payment helper' maxWidth={330}>
          Project-sponsored gas is charged to the project, keeping holder transaction fees minimal. User-paid gas can reach about $1 as the basket grows.
        </InfoHint>
      </div>
      <Pills
        compact
        disabled={disabled}
        options={REWARD_GAS_PAYERS}
        value={value}
        onChange={onChange}
        format={(payer) => payer === 'project' ? 'Project' : 'User'}
      />
    </div>
  );
}

function RouteRewardModeControl({ value, onChange, disabled }: { value: RouteRewardMode; onChange: (value: RouteRewardMode) => void; disabled: boolean }) {
  return (
    <div className='flex min-w-0 items-center gap-1.5' data-no-drag>
      <div className='flex shrink-0 items-center gap-1'>
        <span className='text-[8px] font-medium uppercase tracking-[0.10em] sm:text-[9px] sm:tracking-[0.13em]' style={{ color: T.muted }}>Format</span>
        <InfoHint label='Asset payout format helper' maxWidth={230} desktopAlign='start'>
          <span className='font-semibold text-white/88'>Single</span><span className='text-white/58'> distributes one selected asset. </span><span className='font-semibold text-white/88'>Basket</span><span className='text-white/58'> distributes multiple selected assets each cycle.</span>
        </InfoHint>
      </div>
      <Pills
        compact
        disabled={disabled}
        options={ROUTE_REWARD_MODES}
        value={value}
        onChange={onChange}
        format={(mode) => mode === 'single' ? 'Single' : 'Basket'}
      />
    </div>
  );
}

function RewardAssetLogo({ asset, active, accent }: { asset: RewardBasketAsset; active: boolean; accent: string }) {
  return (
    <span
      className='relative inline-flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-[8px] border p-[2px] sm:h-8 sm:w-8 sm:rounded-[9px]'
      style={{
        background: asset.category === 'token' ? 'linear-gradient(180deg, rgba(24,27,26,0.98), rgba(12,14,13,0.96))' : '#F2F4F1',
        borderColor: active ? rgba(accent, 0.36) : 'rgba(244,249,246,0.13)',
        boxShadow: active ? `0 0 15px ${rgba(accent, 0.10)}` : '0 1px 8px rgba(0,0,0,0.18)',
      }}
      aria-hidden
    >
      {asset.category === 'token' && !asset.icon
        ? <Coins size={14} strokeWidth={1.8} style={{ color: active ? accent : rgba(accent, 0.70) }} />
        : <Image src={asset.icon ?? `/rwa/${asset.symbol.toLowerCase()}.png`} alt='' width={64} height={64} className='h-full w-full rounded-[5px] object-contain' unoptimized />}
    </span>
  );
}

function RewardBasketSelector({ chain, context = 'holders', selectionMode = 'basket', value, onChange, distributionMode, weights, pinnedAssets, onWeightsChange, disabled, invalid, accent }: { chain: ChainId; context?: 'holders' | 'route'; selectionMode?: RouteRewardMode; value: string[]; onChange: (next: string[], preserveCustom?: boolean) => void; distributionMode: RwaDistributionMode; weights: Record<string, number>; pinnedAssets: string[]; onWeightsChange: (next: Record<string, number>, nextPinned?: string[]) => void; disabled: boolean; invalid: boolean; accent: string }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | RwaCategory>('all');
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [draggedAssetId, setDraggedAssetId] = useState<string | null>(null);
  const [weightDrafts, setWeightDrafts] = useState<Record<string, string>>({});
  const assets = useMemo(() => [...RWA_ASSETS, ...tokenAssets()], []);
  const assetById = useMemo(() => new Map(assets.map((asset) => [assetId(asset), asset])), [assets]);
  const baskets = useMemo(() => context === 'route' ? routeRewardBaskets(chain) : rewardBaskets(), [chain, context]);
  const selected = useMemo(() => new Set(value), [value]);
  const categoryAssetIds = useMemo(
    () => assets.filter((asset) => category === 'all' || asset.category === category).map(assetId),
    [assets, category],
  );
  const effectiveWeights = useMemo(() => normalizeAssetWeights(value, weights), [value, weights]);
  const showWeights = distributionMode === 'all' && value.length >= 2;
  const activeBasket = useMemo(
    () => baskets.find((basket) => matchesAssetBasket(value, basket.assets))?.key ?? null,
    [baskets, value],
  );
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const source = showSelectedOnly
      ? value.map((id) => assetById.get(id)).filter((asset): asset is RewardBasketAsset => Boolean(asset))
      : assets;
    return source.filter((asset) =>
      (category === 'all' || asset.category === category)
      && (!normalized || asset.symbol.toLowerCase().includes(normalized) || asset.name.toLowerCase().includes(normalized)));
  }, [assetById, assets, category, query, showSelectedOnly, value]);

  const toggleAsset = (id: string) => {
    if (disabled) return;
    if (selectionMode === 'single') {
      onChange(selected.has(id) ? [] : [id]);
      return;
    }
    onChange(selected.has(id) ? value.filter((item) => item !== id) : [...value, id]);
  };

  const moveSelectedAsset = (id: string, targetIndex: number) => {
    const from = value.indexOf(id);
    if (from < 0) return;
    const to = clamp(targetIndex, 0, value.length - 1);
    if (from === to) return;
    onChange(reorder(value, from, to));
  };

  const withPinnedAsset = (id: string) => pinnedAssets.includes(id) ? pinnedAssets : [...pinnedAssets, id];

  const clearWeightDraft = (id: string) => {
    setWeightDrafts((current) => {
      if (!(id in current)) return current;
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  return (
    <div
      className='-mx-1.5 mt-3 min-w-0 w-[calc(100%+0.75rem)] max-w-none border-t pt-2.5 sm:mx-0 sm:mt-3.5 sm:w-auto sm:max-w-full sm:pt-3'
      data-no-drag
      style={{ borderColor: invalid ? rgba('#FF7184', 0.34) : rgba(accent, 0.13) }}
    >
      <div className='flex min-w-0 max-w-full flex-col gap-2 2xl:flex-row 2xl:items-center 2xl:justify-between'>
        <label className='flex h-9 min-w-0 w-full items-center gap-2 rounded-[10px] border px-2.5 sm:h-8 2xl:w-[clamp(220px,38%,340px)] 2xl:flex-none' style={{ background: 'rgba(244,249,246,0.025)', borderColor: 'rgba(244,249,246,0.10)' }}>
          <Search size={13.5} className='sm:h-[12.5px] sm:w-[12.5px]' style={{ color: 'rgba(244,249,246,0.46)' }} />
          <input data-focus-target value={query} onChange={(event) => setQuery(event.target.value)} placeholder='Search token, ticker or company' className='min-w-0 flex-1 bg-transparent text-[11.5px] font-medium outline-none placeholder:text-white/38 sm:text-[11.5px]' style={{ color: T.text }} />
        </label>
        <div className='grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1 sm:gap-2'>
          <button
            type='button'
            aria-label={category === 'all' ? 'Select all reward assets' : `Select all ${category} reward assets`}
            title={category === 'all' ? 'Select every reward asset' : `Select every ${category === 'etf' ? 'ETF' : category} reward asset`}
            disabled={disabled || (value.length === categoryAssetIds.length && categoryAssetIds.every((id) => selected.has(id)))}
            onClick={() => onChange(categoryAssetIds, false)}
            className='whitespace-nowrap rounded-full border px-1.5 py-1 text-[8px] font-semibold transition hover:brightness-125 disabled:opacity-35 sm:px-2.5 sm:text-[9.5px]'
            style={{ color: rgba(accent, 0.86), background: rgba(accent, 0.035), borderColor: rgba(accent, 0.14) }}
          >
            Select all
          </button>
          <div className='inline-flex min-w-0 rounded-[10px] border p-0.5' style={{ background: 'rgba(244,249,246,0.018)', borderColor: 'rgba(244,249,246,0.085)' }}>
            {(['all', 'stock', 'etf', 'token'] as const).map((item) => {
              const active = !showSelectedOnly && category === item;
              return <button key={item} type='button' onClick={() => { setShowSelectedOnly(false); setCategory(item); }} className='rounded-[7px] border px-1.5 py-1 text-[8px] font-semibold capitalize transition hover:text-white sm:px-2 sm:text-[9.5px]' style={{ color: active ? T.text : T.muted, background: active ? rgba(accent, 0.10) : 'transparent', borderColor: active ? rgba(accent, 0.20) : 'transparent' }}>{item === 'all' ? 'All' : item === 'etf' ? 'ETFs' : item === 'token' ? 'Tokens' : 'Stocks'}</button>;
            })}
            <button
              type='button'
              aria-pressed={showSelectedOnly}
              aria-label={showSelectedOnly ? 'Show all reward assets' : `Show ${value.length} selected reward assets`}
              title={showSelectedOnly ? 'Show all assets' : 'Show selected assets'}
              disabled={disabled || value.length === 0}
              onClick={() => {
                if (showSelectedOnly) setShowSelectedOnly(false);
                else {
                  setCategory('all');
                  setShowSelectedOnly(true);
                }
              }}
              className='inline-flex items-center gap-1 rounded-[7px] border px-1.5 py-1 text-[8px] font-semibold outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-white/15 disabled:opacity-35 sm:px-2 sm:text-[9.5px]'
              style={{ color: showSelectedOnly ? T.text : T.muted, background: showSelectedOnly ? rgba(accent, 0.11) : 'transparent', borderColor: showSelectedOnly ? rgba(accent, 0.22) : 'transparent' }}
            >
              <span>Selected</span>
              <span className='inline-flex h-[13px] min-w-[14px] items-center justify-center rounded-full px-1 text-[7px] leading-none sm:h-[15px] sm:min-w-[16px] sm:text-[8px]' style={{ color: rgba(accent, 0.96), background: rgba(accent, showSelectedOnly ? 0.20 : 0.10) }}>{value.length}</span>
            </button>
          </div>
          <button type='button' aria-label='Reset rewards basket' title='Reset rewards basket' disabled={disabled || value.length === 0} onClick={() => { setShowSelectedOnly(false); onChange([]); }} className='inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center text-white/38 outline-none transition-[color,transform] duration-200 hover:-rotate-12 hover:text-white/72 focus-visible:text-white focus-visible:ring-2 focus-visible:ring-white/15 active:rotate-[-35deg] disabled:opacity-25 sm:h-6 sm:w-6'>
            <RotateCcw size={12.5} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <div className='mt-2.5 min-w-0 max-w-full'>
        <div className='flex min-w-0 items-center gap-2'>
          <span className='text-[8px] font-semibold uppercase tracking-[0.14em] sm:text-[8.5px]' style={{ color: 'rgba(244,249,246,0.46)' }}>Quick picks</span>
        </div>
        <div className='mt-1.5 grid grid-cols-3 gap-1.5 sm:flex sm:flex-wrap'>
          {baskets.map((basket) => {
            const active = activeBasket === basket.key;
            return (
              <button
                key={basket.key}
                type='button'
                disabled={disabled}
                aria-pressed={active}
                onClick={() => onChange([...basket.assets], false)}
                className='min-w-0 rounded-full border px-1.5 py-1 text-[8.5px] font-semibold leading-none transition-[background-color,border-color,color,box-shadow] hover:border-white/20 disabled:opacity-40 sm:w-auto sm:px-2.5 sm:text-[9.5px]'
                style={{
                  color: active ? rgba(accent, 0.98) : T.muted,
                  background: active ? rgba(accent, 0.10) : 'rgba(244,249,246,0.018)',
                  borderColor: active ? rgba(accent, 0.32) : T.border,
                  boxShadow: active ? `inset 0 0 0 1px ${rgba(accent, 0.035)}` : 'none',
                }}
              >
                <span className='block truncate'>{basket.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={`mt-2.5 grid min-w-0 max-w-full grid-cols-2 border-y sm:grid-cols-4 ${showSelectedOnly ? 'lg:grid-cols-4' : 'lg:grid-cols-5'}`} style={{ background: 'rgba(8,11,10,0.98)', borderColor: 'rgba(244,249,246,0.085)' }}>
        {filtered.map((asset) => {
          const id = assetId(asset);
          const active = selected.has(id);
          const weight = effectiveWeights[id] ?? 0;
          const maxWeight = round1(100 - (value.length - 1) * 0.1);
          const selectedIndex = value.indexOf(id);
          const draggingThisAsset = draggedAssetId === id;
          return (
            <div
              key={id}
              onDragEnter={(event) => {
                if (!showSelectedOnly || !draggedAssetId || draggedAssetId === id) return;
                event.preventDefault();
                moveSelectedAsset(draggedAssetId, selectedIndex);
              }}
              onDragOver={(event) => {
                if (!showSelectedOnly || !draggedAssetId) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(event) => {
                if (!showSelectedOnly) return;
                event.preventDefault();
                setDraggedAssetId(null);
              }}
              className={`group relative flex min-w-0 items-center justify-between gap-2 border-b border-r px-2.5 py-2 text-left transition-[background-color,box-shadow,opacity,transform] duration-180 ${draggingThisAsset ? 'scale-[0.985] opacity-55' : ''}`}
              style={{ color: active ? T.text : 'rgba(244,249,246,0.68)', background: active ? `linear-gradient(110deg, ${rgba(accent, 0.105)}, rgba(8,12,10,0.98) 78%)` : 'rgba(8,11,10,0.98)', borderColor: 'rgba(244,249,246,0.075)', boxShadow: draggingThisAsset ? `inset 2px 0 0 ${accent}, 0 0 20px ${rgba(accent, 0.12)}` : active ? `inset 2px 0 0 ${rgba(accent, 0.72)}` : 'none' }}
            >
              <button type='button' aria-pressed={active} aria-label={`${active ? 'Remove' : 'Add'} ${asset.name} ${active ? 'from' : 'to'} rewards basket`} onClick={() => toggleAsset(id)} className='absolute inset-0 z-0 bg-transparent outline-none transition-colors duration-180 hover:bg-white/[0.045] focus-visible:bg-white/[0.055]' />
              <span className='pointer-events-none relative z-[1] flex min-w-0 items-center gap-2'>
                <RewardAssetLogo asset={asset} active={active} accent={accent} />
                <span className='min-w-0'>
                  <span className='block text-[10px] font-bold leading-4 tracking-[0.02em] sm:text-[11px]'>{asset.symbol}</span>
                  <span className='block truncate text-[8.5px] leading-3.5 sm:text-[9.5px]' style={{ color: active ? rgba(accent, 0.76) : 'rgba(244,249,246,0.48)' }}>{asset.name}</span>
                </span>
              </span>
              <AnimatePresence initial={false} mode='popLayout'>
              {active && showWeights ? (
                <motion.div
                  key='allocation'
                  layout
                  initial={{ opacity: 0, x: 5, scale: 0.96, filter: 'blur(2px)' }}
                  animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: 3, scale: 0.97, filter: 'blur(2px)' }}
                  transition={CONTROL_REVEAL_TRANSITION}
                  className='relative z-10 inline-flex shrink-0 items-center gap-0.5'
                  onClick={(event) => event.stopPropagation()}
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  <button
                    type='button'
                    disabled={disabled || weight <= 0.1}
                    aria-label={`Decrease ${asset.symbol} reward allocation`}
                    className='relative inline-flex h-5 w-2.5 items-center justify-center text-white/52 outline-none transition-[color,filter] after:absolute after:-inset-x-1 after:-inset-y-0.5 hover:text-white hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.24)] focus-visible:text-white disabled:pointer-events-none disabled:opacity-20 sm:w-3'
                    onClick={() => {
                      onWeightsChange(updateAssetWeight(value, effectiveWeights, id, round1(weight - 0.1), pinnedAssets), withPinnedAsset(id));
                    }}
                  >
                    <Minus size={10.5} strokeWidth={2.4} />
                  </button>
                  <label className='inline-flex min-w-[29px] items-center justify-center' style={{ color: rgba(accent, 0.96) }}>
                    <input
                      className='bbAssetWeight w-[22px] bg-transparent text-right text-[8.5px] font-bold leading-none tabular-nums outline-none sm:w-[25px] sm:text-[9.5px]'
                      type='text'
                      inputMode='decimal'
                      value={weightDrafts[id] ?? String(weight)}
                      disabled={disabled}
                      aria-label={`${asset.symbol} reward allocation`}
                      title={`${asset.symbol} reward allocation`}
                      onFocus={(event) => {
                        setWeightDrafts((current) => ({ ...current, [id]: String(weight) }));
                        event.currentTarget.select();
                      }}
                      onChange={(event) => {
                        const draft = event.target.value.replace(',', '.');
                        if (!/^\d{0,3}(?:\.\d?)?$/.test(draft)) return;
                        setWeightDrafts((current) => ({ ...current, [id]: draft }));
                        if (!draft.trim()) return;
                        const next = Number(draft);
                        if (Number.isFinite(next)) {
                          onWeightsChange(updateAssetWeight(value, effectiveWeights, id, next, pinnedAssets), withPinnedAsset(id));
                        }
                      }}
                      onBlur={() => clearWeightDraft(id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') event.currentTarget.blur();
                        if (event.key === 'Escape') {
                          clearWeightDraft(id);
                          event.currentTarget.blur();
                        }
                      }}
                    />
                    <span className='ml-px text-[8px] font-bold leading-none sm:text-[9px]'>%</span>
                  </label>
                  <button
                    type='button'
                    disabled={disabled || weight >= maxWeight}
                    aria-label={`Increase ${asset.symbol} reward allocation`}
                    className='relative inline-flex h-5 w-2.5 items-center justify-center text-white/52 outline-none transition-[color,filter] after:absolute after:-inset-x-1 after:-inset-y-0.5 hover:text-white hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.24)] focus-visible:text-white disabled:pointer-events-none disabled:opacity-20 sm:w-3'
                    onClick={() => {
                      onWeightsChange(updateAssetWeight(value, effectiveWeights, id, round1(weight + 0.1), pinnedAssets), withPinnedAsset(id));
                    }}
                  >
                    <Plus size={10.5} strokeWidth={2.4} />
                  </button>
                </motion.div>
              ) : !showSelectedOnly ? (
                <motion.span
                  key='selection'
                  layout
                  initial={{ opacity: 0, scale: 0.82 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.82 }}
                  transition={CONTROL_REVEAL_TRANSITION}
                  className='pointer-events-none relative z-[1] inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition'
                  style={{ color: active ? '#07100C' : 'transparent', background: active ? accent : 'rgba(244,249,246,0.025)', borderColor: active ? accent : 'rgba(244,249,246,0.10)' }}
                >
                  <Check size={9.5} strokeWidth={2.5} />
                </motion.span>
              ) : null}
              </AnimatePresence>
              {showSelectedOnly && selectionMode === 'basket' && value.length > 1 ? (
                <button
                  type='button'
                  draggable={!disabled}
                  disabled={disabled}
                  aria-label={`Drag ${asset.name} to change payout order. Position ${selectedIndex + 1} of ${value.length}`}
                  onClick={(event) => event.stopPropagation()}
                  onPointerDown={(event) => event.stopPropagation()}
                  onDragStart={(event) => {
                    event.stopPropagation();
                    event.dataTransfer.effectAllowed = 'move';
                    event.dataTransfer.setData('text/plain', id);
                    setDraggedAssetId(id);
                  }}
                  onDragEnd={() => setDraggedAssetId(null)}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowLeft') {
                      event.preventDefault();
                      moveSelectedAsset(id, selectedIndex - 1);
                    }
                    if (event.key === 'ArrowRight') {
                      event.preventDefault();
                      moveSelectedAsset(id, selectedIndex + 1);
                    }
                    if (event.key === 'Home') {
                      event.preventDefault();
                      moveSelectedAsset(id, 0);
                    }
                    if (event.key === 'End') {
                      event.preventDefault();
                      moveSelectedAsset(id, value.length - 1);
                    }
                  }}
                  className='relative z-10 inline-flex h-7 w-5 shrink-0 cursor-grab items-center justify-center overflow-hidden rounded-[7px] border outline-none transition-[border-color,background-color,color,box-shadow,transform] active:cursor-grabbing active:scale-95 disabled:cursor-default disabled:opacity-35'
                  style={{ color: rgba(accent, draggingThisAsset ? 0.98 : 0.64), background: `linear-gradient(180deg, ${rgba(accent, draggingThisAsset ? 0.14 : 0.065)}, rgba(244,249,246,0.018))`, borderColor: rgba(accent, draggingThisAsset ? 0.42 : 0.18), boxShadow: draggingThisAsset ? `0 0 16px ${rgba(accent, 0.16)}, inset 0 1px 0 rgba(255,255,255,0.06)` : 'inset 0 1px 0 rgba(255,255,255,0.035)' }}
                >
                  <span className='absolute inset-y-1 left-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent' aria-hidden />
                  <GripVertical size={11.5} strokeWidth={2} aria-hidden />
                </button>
              ) : null}
            </div>
          );
        })}
        {!filtered.length ? <div className='col-span-full py-6 text-center text-[10.5px]' style={{ color: T.muted }}>No supported assets match your search.</div> : null}
      </div>
    </div>
  );
}

function ProtectionSwitch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type='button'
      role='switch'
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className='relative mt-0.5 h-4 w-9 shrink-0 rounded-full border transition'
      style={{ background: checked ? 'rgba(24,201,142,0.20)' : '#151515', borderColor: checked ? 'rgba(24,201,142,0.50)' : 'rgba(255,255,255,0.15)' }}
    >
      <span className='absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.25)] transition' style={{ left: checked ? 18 : 2 }} />
    </button>
  );
}

function ProtectionOptionPills({ options, value, onChange }: { options: ProtectionOption[]; value: string; onChange: (value: string) => void }) {
  return (
    <div className='grid grid-cols-2 gap-1.5'>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type='button'
            onClick={() => onChange(option.value)}
            data-active={active}
            className='bbProtectionPill group min-h-[52px] rounded-lg border px-2 py-1.5 text-left transition'
            style={{
              color: active ? '#7CFFC0' : T.text,
              background: active ? 'rgba(24,201,142,0.14)' : '#151515',
              borderColor: active ? 'rgba(24,201,142,0.48)' : 'rgba(255,255,255,0.15)',
              boxShadow: active ? '0 0 0 1px rgba(24,201,142,0.12) inset' : 'none',
            }}
          >
            <div className='text-[11px] font-semibold leading-4'>{option.label}</div>
            {option.sublabel ? <div className='mt-0.5 text-[9px] leading-3' style={{ color: active ? 'rgba(219,255,235,0.76)' : 'rgba(255,255,255,0.45)' }}>{option.sublabel}</div> : null}
          </button>
        );
      })}
    </div>
  );
}

function ProtectionQuickPills({ options, value, onChange }: { options: Array<{ label: string; value: string }>; value: string; onChange: (value: string) => void }) {
  return (
    <div className='grid max-w-full gap-1 overflow-visible pb-0.5' style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type='button'
            onClick={() => onChange(option.value)}
            data-active={active}
            className='bbProtectionQuickPill min-w-0 rounded-full border px-1.5 py-1 text-[9.5px] font-semibold leading-none transition-[border-color,background-color,color,box-shadow]'
            style={{
              color: active ? '#7CFFC0' : 'rgba(244,249,246,0.50)',
              background: active ? 'rgba(24,201,142,0.14)' : 'rgba(244,249,246,0.025)',
              borderColor: active ? 'rgba(24,201,142,0.48)' : 'rgba(244,249,246,0.10)',
              boxShadow: active ? 'inset 0 1px 0 rgba(255,255,255,0.035)' : 'none',
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function ProtectionRuleGrid({ items }: { items: Array<{ label: string; sublabel: string }> }) {
  return (
    <div className='grid grid-cols-2 gap-1.5'>
      {items.map((item) => (
        <div key={item.label} className='min-h-[52px] rounded-lg border px-2 py-1.5' style={{ background: '#151515', borderColor: 'rgba(255,255,255,0.15)' }}>
          <div className='text-[11px] font-semibold leading-4' style={{ color: T.text }}>{item.label}</div>
          <div className='mt-0.5 text-[9px] leading-3' style={{ color: 'rgba(255,255,255,0.45)' }}>{item.sublabel}</div>
        </div>
      ))}
    </div>
  );
}

function smoothCenterElement(element: HTMLElement, duration = 820, block: 'center' | 'start' = 'center') {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    element.scrollIntoView({ behavior: 'auto', block });
    return () => {};
  }

  const startTop = window.scrollY;
  let startedAt: number | null = null;
  let frame = 0;
  let cancelled = false;

  const stop = () => {
    if (cancelled) return;
    cancelled = true;
    window.cancelAnimationFrame(frame);
    window.removeEventListener('wheel', stop);
    window.removeEventListener('touchstart', stop);
    window.removeEventListener('pointerdown', stop);
    window.removeEventListener('keydown', stop);
  };

  window.addEventListener('wheel', stop, { passive: true });
  window.addEventListener('touchstart', stop, { passive: true });
  window.addEventListener('pointerdown', stop, { passive: true });
  window.addEventListener('keydown', stop);

  const targetTop = () => {
    const rect = element.getBoundingClientRect();
    const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const top = block === 'start'
      ? window.scrollY + rect.top - 88
      : window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2;
    return Math.min(maxTop, Math.max(0, top));
  };

  const animate = (now: number) => {
    if (cancelled) return;
    startedAt ??= now;
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    window.scrollTo(0, startTop + (targetTop() - startTop) * eased);
    if (progress < 1) frame = window.requestAnimationFrame(animate);
    else stop();
  };

  frame = window.requestAnimationFrame(animate);
  return stop;
}

function ProtectionCard({ title, description, enabled, onToggle, children }: { title: string; description: string; enabled: boolean; onToggle: () => void; children?: React.ReactNode }) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const centerTimeoutRef = useRef<number | null>(null);
  const cancelCenterRef = useRef<(() => void) | null>(null);
  const hasChildren = Boolean(children);

  useEffect(() => {
    return () => {
      if (centerTimeoutRef.current !== null) window.clearTimeout(centerTimeoutRef.current);
      cancelCenterRef.current?.();
    };
  }, []);

  const handleToggle = () => {
    const willOpen = !enabled;
    onToggle();
    if (!willOpen || !hasChildren) return;
    if (centerTimeoutRef.current !== null) window.clearTimeout(centerTimeoutRef.current);
    cancelCenterRef.current?.();
    centerTimeoutRef.current = window.setTimeout(() => {
      if (cardRef.current) cancelCenterRef.current = smoothCenterElement(cardRef.current);
    }, 70);
  };

  return (
    <div ref={cardRef} className='rounded-2xl border p-3 shadow-[0_8px_24px_rgba(0,0,0,0.18)]' style={{ background: '#111111', borderColor: 'rgba(255,255,255,0.15)' }}>
      <div className='flex items-start gap-2'>
        <ProtectionSwitch checked={enabled} onChange={handleToggle} label={`${title} protection`} />
        <div className='min-w-0'>
          <div className='text-[14px] font-semibold leading-5' style={{ color: T.text }}>{title}</div>
          <div className='mt-0.5 text-[12px] leading-5' style={{ color: 'rgba(255,255,255,0.60)' }}>{description}</div>
        </div>
      </div>
      {hasChildren ? (
        <div className='grid transition-[grid-template-rows,opacity,transform] duration-500 ease-[cubic-bezier(.22,1,.36,1)]' style={{ gridTemplateRows: enabled ? '1fr' : '0fr', opacity: enabled ? 1 : 0, transform: enabled ? 'translateY(0)' : 'translateY(-4px)' }} aria-hidden={!enabled}>
          <div className='min-h-0 overflow-hidden'>
            <div className='mt-3 space-y-3'>{children}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Row({ fee, chain, walletAddress, max, disabled, dragging, ghost, patch, setPct, remove, onDrag, bind, attention, onExpand }: RowProps) {
  const [hover, setHover] = useState(false);
  const [routeRewardsOpen, setRouteRewardsOpen] = useState(false);
  const [routeRewardsTouched, setRouteRewardsTouched] = useState(false);
  const color = tint(fee.id, fee.name);
  const type = classify(fee.id, fee.name);
  const rewards = fee.id === 'rewards';
  const rwa = fee.id === 'rwa';
  const treasury = fee.id === 'ops';
  const custom = !LOCKED.has(fee.id);
  const rewardRoute = treasury || custom;
  const routeRewardsNeedAttention = rewardRoute && !routeRewardsTouched && !routeRewardsOpen && !disabled && !dragging && !ghost;
  const routeRewardMode = fee.routeRewardMode ?? 'single';
  const rwaAssets = fee.rwaAssets ?? (rewardRoute ? [nativeRewardAssetId(chain)] : []);
  const rwaDistributionMode = fee.rwaDistributionMode ?? 'rotating';
  const rewardGasPayer = fee.rewardGasPayer ?? 'user';
  const rwaAssetWeights = normalizeAssetWeights(rwaAssets, fee.rwaAssetWeights);
  const rwaPinnedAssets = fee.rwaPinnedAssets?.filter((id) => rwaAssets.includes(id)) ?? [];
  const asset = fee.rewardAsset ?? rewardOf(chain);
  const rwaAssetsInvalid = rwa && (fee.pct ?? 0) > 0 && !(fee.rwaAssets?.length);
  const routeAssetsInvalid = Boolean(fee.routeRewardMode) && rewardRoute && (fee.pct ?? 0) > 0 && !(fee.rwaAssets?.length);
  const recipientAddress = (fee.address ?? '').trim();
  const addrInvalid = needsAddress(fee) && !isRecipientAddressValid(recipientAddress, chain);
  const addressErrorLabel = recipientAddress ? `Invalid ${chain === 'sol' ? 'SOL' : 'EVM'}` : 'Required';
  const invalid = addrInvalid || rwaAssetsInvalid || routeAssetsInvalid;
  const routeTitle = rwa ? 'Rewards Basket' : fee.name;
  const routeRewardSummary = routeRewardMode === 'single'
    ? (rwaAssets[0]?.replace(/^TOKEN:/, '') ?? 'Choose asset')
    : `${rwaAssets.length} asset${rwaAssets.length === 1 ? '' : 's'}`;
  const feeSlider = (
    <div className='mt-2 flex items-center gap-2 sm:mt-3'>
      <input data-no-drag disabled={disabled} className='bbRange h-5 flex-1 sm:h-8' type='range' min={0} max={max} step={0.1} value={fee.pct} onChange={(e) => setPct(fee.id, parseFloat(e.target.value))} style={{ '--feeColor': color, '--fillPct': fillPct(fee.pct, 0, max) } as CssVarStyle} />
    </div>
  );

  return (
    <div ref={bind} onMouseEnter={() => !dragging && setHover(true)} onMouseLeave={() => setHover(false)} className='w-full min-w-0 max-w-full rounded-[16px] px-2.5 py-2.5 sm:rounded-[22px] sm:px-4 sm:py-3.5' style={{ background: `linear-gradient(135deg, ${attention ? 'rgba(255,113,132,0.065)' : rgba(color, hover ? 0.078 : 0.038)}, ${S.row} 48%, rgba(255,255,255,0.018))`, border: ghost ? '1px dashed rgba(255,255,255,0.14)' : `1px solid ${attention ? 'rgba(255,113,132,0.58)' : hover && !dragging ? rgba(color, 0.30) : rgba(color, 0.16)}`, opacity: ghost ? 0.45 : 1, userSelect: 'none', transition: 'border-color 180ms ease, box-shadow 180ms ease, background 180ms ease', boxShadow: attention ? '0 0 0 1px rgba(255,113,132,0.14) inset, 0 0 30px rgba(255,113,132,0.12)' : hover && !dragging && !ghost ? `0 14px 30px rgba(0,0,0,0.24), 0 0 28px ${rgba(color, 0.08)}` : `0 0 0 1px ${rgba(color, 0.035)} inset` }}>
      <div className='relative flex items-start justify-between gap-1.5'>
        <div className='min-w-0 flex-1'>
          <div className='flex items-start gap-1.5 sm:gap-3'>
            <div className='flex shrink-0 flex-col items-center gap-0.5 sm:block'>
              <span className='relative inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg sm:h-8 sm:w-8 sm:rounded-xl' style={{ background: 'linear-gradient(180deg, rgba(24,27,26,0.98), rgba(12,14,13,0.96))', border: `1px solid ${rgba(color, 0.28)}`, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.050), 0 0 18px ${rgba(color, hover || attention ? 0.13 : 0.055)}` }} aria-hidden>
                <Icon t={type} color={color} size={14} />
                {invalid ? <span className='absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full border' style={{ background: 'rgba(255,113,132,0.17)', borderColor: 'rgba(255,113,132,0.42)', color: '#FF7184', boxShadow: '0 0 14px rgba(255,113,132,0.22)' }}><TriangleAlert size={9.5} strokeWidth={2} /></span> : null}
              </span>
              <button data-drag-handle disabled={disabled} onPointerDown={onDrag} className='bbGrip inline-flex h-4 w-5 shrink-0 cursor-grab items-center justify-center active:cursor-grabbing sm:hidden' style={{ color: 'rgba(244,249,246,0.34)' }} type='button' aria-label={`Move ${fee.name}`}>
                <GripVertical size={10} />
              </button>
            </div>
            <div className='min-w-0 flex-1'>
              {custom ? (
                <>
                  <div className='min-w-0 pr-[78px] sm:pr-[122px]'>
                    <TextField disabled={disabled} accent={color} label='Route' value={fee.name} onChange={(v) => patch(fee.id, { name: v })} placeholder='Custom fee' className='min-w-0' />
                  </div>
                  <p className='bbRouteDesc mt-1 overflow-hidden text-[9.5px] leading-[13px] sm:text-[11px] sm:leading-5' style={{ color: 'rgba(244,249,246,0.56)' }}>{desc(fee)}</p>
                  <div className='mt-2.5 flex min-w-0 items-center gap-1.5 sm:pr-6'>
                    <TextField disabled={disabled} accent={color} invalid={addrInvalid} invalidLabel={addressErrorLabel} label='Recipient' value={fee.address ?? ''} onChange={(v) => patch(fee.id, { address: v })} placeholder={chain === 'sol' ? 'Paste Solana recipient address' : 'Paste EVM recipient address'} className='min-w-0 flex-1' />
                    <UseWalletPill chain={chain} walletAddress={walletAddress} value={fee.address ?? ''} disabled={disabled} accent={color} className='w-[58px] sm:w-[66px]' onUse={(address) => patch(fee.id, { address })} />
                  </div>
                </>
              ) : (
                <>
                  <div className='flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 sm:gap-x-2'>
                    <p className='min-w-0 truncate pr-[60px] text-[12px] font-semibold leading-4 tracking-[-0.01em] sm:pr-[110px] sm:text-[15px] sm:leading-5' style={{ color: T.text }}>{routeTitle}</p>
                    {rewards ? (
                      <div className='w-full min-w-0 sm:w-auto sm:min-w-[120px] sm:max-w-[285px] sm:flex-none'>
                        <Pills className='bbAssetPills w-full sm:w-auto' disabled={disabled} options={RW[chain]} value={asset} onChange={(v) => patch(fee.id, { rewardAsset: v })} />
                      </div>
                    ) : null}
                  </div>
                  <p className='bbRouteDesc mt-0.5 overflow-hidden text-[9.5px] leading-[13px] sm:text-[11px] sm:leading-5' style={{ color: 'rgba(244,249,246,0.56)' }}>{desc(fee)}</p>
                  {treasury ? (
                    <div className='mt-2.5 flex min-w-0 items-center gap-1.5 sm:pr-6'>
                      <TextField disabled={disabled} accent={color} invalid={addrInvalid} invalidLabel={addressErrorLabel} label='Recipient' value={fee.address ?? ''} onChange={(v) => patch(fee.id, { address: v })} placeholder={chain === 'sol' ? 'Paste Solana treasury address' : 'Paste EVM treasury address'} className='min-w-0 flex-1' />
                      <UseWalletPill chain={chain} walletAddress={walletAddress} value={fee.address ?? ''} disabled={disabled} accent={color} className='w-[58px] sm:w-[66px]' onUse={(address) => patch(fee.id, { address })} />
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>

        <div className='absolute right-0 top-0 flex shrink-0 items-center gap-0.5 sm:gap-1.5' style={{ opacity: hover || !LOCKED.has(fee.id) ? 1 : 0.72, transition: 'opacity 160ms ease' }}>
          <div className='inline-flex h-5 items-center overflow-hidden rounded-full border sm:h-7' style={{ color: 'rgba(244,249,246,0.92)', background: 'rgba(244,249,246,0.04)', borderColor: rgba(color, 0.24), boxShadow: `0 0 0 1px ${rgba(color, 0.05)} inset` }}>
            <div className='flex h-5 w-[34px] items-center justify-center text-[9px] font-semibold leading-none tabular-nums sm:h-7 sm:w-[52px] sm:text-[12px]'>{fmtPct(fee.pct)}</div>
            <button data-no-drag disabled={disabled} onClick={() => remove(fee.id)} className='bbRemoveBtn flex h-5 w-[21px] items-center justify-center border-l sm:h-7 sm:w-[26px]' style={{ borderColor: rgba(color, 0.16), '--removeColor': color } as CssVarStyle} type='button' aria-label={`Remove ${fee.name}`}>
              <X className='-translate-x-[0.5px]' size={10.5} strokeWidth={2} />
            </button>
          </div>
          <button data-drag-handle disabled={disabled} onPointerDown={onDrag} className='bbGrip hidden h-4 w-3 shrink-0 cursor-grab items-center justify-center active:cursor-grabbing sm:inline-flex sm:h-7 sm:w-6' style={{ color: 'rgba(244,249,246,0.34)' }} type='button' aria-label={`Move ${fee.name}`}>
            <GripVertical size={10} />
          </button>
        </div>
      </div>

      {rwa ? feeSlider : null}

      {rwa ? (
        <RewardBasketSelector
          chain={chain}
          disabled={disabled}
          accent={color}
          invalid={rwaAssetsInvalid}
          value={rwaAssets}
          distributionMode={rwaDistributionMode}
          weights={rwaAssetWeights}
          pinnedAssets={rwaPinnedAssets}
          onWeightsChange={(next, nextPinned = rwaPinnedAssets) => patch(fee.id, { rwaAssetWeights: next, rwaPinnedAssets: nextPinned })}
          onChange={(next, preserveCustom = true) => {
            if (!preserveCustom) {
              patch(fee.id, { rwaAssets: next, rwaAssetWeights: equalAssetWeights(next), rwaPinnedAssets: [] });
              return;
            }
            const reconciled = reconcileAssetWeights(next, rwaAssetWeights, rwaPinnedAssets);
            patch(fee.id, { rwaAssets: next, rwaAssetWeights: reconciled.weights, rwaPinnedAssets: reconciled.pinnedIds });
          }}
        />
      ) : null}

      {!rwa ? feeSlider : null}

      {rewardRoute ? (
        <motion.div layout className='mt-2.5 border-t pt-2' data-no-drag transition={CONTROL_REVEAL_TRANSITION} style={{ borderColor: rgba(color, 0.12) }}>
          <button
            type='button'
            disabled={disabled}
            aria-expanded={routeRewardsOpen}
            data-asset-payout-attention={routeRewardsNeedAttention ? 'true' : 'false'}
            onClick={() => {
              setRouteRewardsTouched(true);
              const willOpen = !routeRewardsOpen;
              setRouteRewardsOpen(willOpen);
              if (willOpen) onExpand?.(fee.id);
            }}
            className={`group flex w-full min-w-0 items-center justify-between gap-3 rounded-lg py-1 text-left outline-none transition-colors hover:bg-white/[0.018] disabled:cursor-not-allowed disabled:opacity-45 ${routeRewardsNeedAttention ? 'bbAssetPayoutNotice' : ''}`}
            style={{
              '--assetPayoutTint': rgba(color, 0.055),
            } as CssVarStyle}
          >
            <span className='flex min-w-0 items-center gap-2 px-1'>
              <span className={routeRewardsNeedAttention ? 'bbAssetPayoutCue inline-flex shrink-0' : 'inline-flex shrink-0'}>
                <Coins size={12.5} strokeWidth={1.8} style={{ color: rgba(color, 0.82) }} />
              </span>
              <span className='min-w-0'>
                <span className='block text-[9px] font-semibold uppercase tracking-[0.13em] sm:text-[10px]' style={{ color: rgba(color, 0.82) }}>Asset payout</span>
                <span className='hidden truncate text-[9.5px] leading-4 text-white/42 sm:block'>Choose one asset or build a custom multi-asset basket.</span>
              </span>
            </span>
            <span className='flex shrink-0 items-center gap-2 px-1'>
              <span className='text-[9px] font-medium text-white/62 sm:text-[10.5px]'>{routeRewardMode === 'single' ? `Single / ${routeRewardSummary}` : `Basket / ${routeRewardSummary}`}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${routeRewardsOpen ? 'rotate-180' : ''}`} style={{ color: routeRewardsOpen ? rgba(color, 0.76) : 'rgba(244,249,246,0.38)' }} strokeWidth={1.8} />
            </span>
          </button>

          <div
            className='grid transition-[grid-template-rows,opacity,transform] duration-500 ease-[cubic-bezier(.22,1,.36,1)]'
            style={{ gridTemplateRows: routeRewardsOpen ? '1fr' : '0fr', opacity: routeRewardsOpen ? 1 : 0, transform: routeRewardsOpen ? 'translateY(0)' : 'translateY(-4px)' }}
            aria-hidden={!routeRewardsOpen}
            inert={!routeRewardsOpen}
          >
            <div className='min-h-0 overflow-hidden'>
              <div className='px-1 pb-1 pt-2'>
                <RouteRewardModeControl
                  disabled={disabled}
                  value={routeRewardMode}
                  onChange={(mode) => {
                    const nextAssets = mode === 'single' ? [rwaAssets[0] ?? nativeRewardAssetId(chain)] : rwaAssets;
                    patch(fee.id, {
                      routeRewardMode: mode,
                      rwaAssets: nextAssets,
                      rwaAssetWeights: equalAssetWeights(nextAssets),
                      rwaPinnedAssets: [],
                    });
                  }}
                />
                <RewardBasketSelector
                  chain={chain}
                  context='route'
                  selectionMode={routeRewardMode}
                  disabled={disabled}
                  accent={color}
                  invalid={routeAssetsInvalid}
                  value={rwaAssets}
                  distributionMode={rwaDistributionMode}
                  weights={rwaAssetWeights}
                  pinnedAssets={rwaPinnedAssets}
                  onWeightsChange={(next, nextPinned = rwaPinnedAssets) => patch(fee.id, { rwaAssetWeights: next, rwaPinnedAssets: nextPinned })}
                  onChange={(next, preserveCustom = true) => {
                    const nextMode = preserveCustom ? routeRewardMode : next.length <= 1 ? 'single' : 'basket';
                    if (!preserveCustom) {
                      patch(fee.id, { routeRewardMode: nextMode, rwaAssets: next, rwaAssetWeights: equalAssetWeights(next), rwaPinnedAssets: [] });
                      return;
                    }
                    const reconciled = reconcileAssetWeights(next, rwaAssetWeights, rwaPinnedAssets);
                    patch(fee.id, { routeRewardMode: nextMode, rwaAssets: next, rwaAssetWeights: reconciled.weights, rwaPinnedAssets: reconciled.pinnedIds });
                  }}
                />
                <AnimatePresence initial={false} mode='popLayout'>
                  {routeRewardMode === 'basket' && rwaAssets.length >= 2 ? (
                    <motion.div key='route-basket-mode' layout initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={CONTROL_REVEAL_TRANSITION} className='mt-2 flex justify-end'>
                      <RwaDistributionModeControl
                        disabled={disabled}
                        value={rwaDistributionMode}
                        portalHint
                        onChange={(mode) => patch(fee.id, { rwaDistributionMode: mode, ...(mode === 'all' ? { rwaAssetWeights } : {}) })}
                      />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}

      {rewards ? (
        <Threshold
          disabled={disabled}
          labelText='Wallet threshold'
          suffix=''
          options={RP}
          value={fee.rewardThresholdPct ?? 0.1}
          onChange={(v) => patch(fee.id, { rewardThresholdPct: v })}
          format={(n) => `${n}%`}
          helperText={<>Wallets holding at least <span className='font-semibold text-white/86'>{fee.rewardThresholdPct ?? 0.1}%</span> of total supply are eligible to receive rewards.</>}
        />
      ) : null}
      {rwa ? (
        <motion.div layout className='mt-2 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5 sm:flex-nowrap' data-no-drag transition={CONTROL_REVEAL_TRANSITION}>
          <Threshold
            className='min-w-0'
            disabled={disabled}
            labelText='Wallet threshold'
            mobileLabelText='Wallet'
            suffix=''
            options={RP}
            value={fee.rewardThresholdPct ?? 0.1}
            onChange={(v) => patch(fee.id, { rewardThresholdPct: v })}
            format={(n) => `${n}%`}
            helperText={<>Wallets holding at least <span className='font-semibold text-white/86'>{fee.rewardThresholdPct ?? 0.1}%</span> of total supply receive the selected rewards.</>}
          />
          <motion.div layout className='ml-auto flex min-w-0 flex-wrap items-center justify-end gap-x-3 gap-y-1.5 sm:flex-nowrap' transition={CONTROL_REVEAL_TRANSITION}>
            <AnimatePresence initial={false} mode='popLayout'>
              {rwaAssets.length >= 2 ? (
                <motion.div key='basket-mode' layout initial={{ opacity: 0, x: 6, filter: 'blur(2px)' }} animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, x: 4, filter: 'blur(2px)' }} transition={CONTROL_REVEAL_TRANSITION} className='min-w-0'>
                  <RwaDistributionModeControl
                    disabled={disabled}
                    value={rwaDistributionMode}
                    onChange={(mode) => patch(fee.id, { rwaDistributionMode: mode, ...(mode === 'all' ? { rwaAssetWeights } : {}) })}
                  />
                </motion.div>
              ) : null}
              {rwaAssets.length >= 2 && rwaDistributionMode === 'all' ? (
                <motion.div key='gas-payer' layout initial={{ opacity: 0, x: 8, filter: 'blur(3px)' }} animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, x: 6, filter: 'blur(3px)' }} transition={CONTROL_REVEAL_TRANSITION} className='min-w-0'>
                  <RewardGasPayerControl
                    disabled={disabled}
                    value={rewardGasPayer}
                    onChange={(payer) => patch(fee.id, { rewardGasPayer: payer })}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      ) : null}
    </div>
  );
}

export function FeeStructureBuilder({ chain, fees, onChange, walletAddress, onAdvancedProtectionChange, onIssuesChange, focusIssueRequest = 0, maxTotal = 10, className = '' }: { chain: ChainId; fees: FeeWallet[]; onChange: (next: FeeWallet[]) => void; walletAddress?: string | null; onAdvancedProtectionChange?: (count: number) => void; onIssuesChange?: (count: number) => void; focusIssueRequest?: number; maxTotal?: number; className?: string }) {
  const enabled = true;
  const [selectedPreset, setSelectedPreset] = useState<PresetKey | null>('creator');
  const [distributionTrigger, setDistributionTrigger] = useState<number>(0.05);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [draft, setDraft] = useState<FeeWallet[] | null>(null);
  const [advancedProtectionOpen, setAdvancedProtectionOpen] = useState(false);
  const [tieredFeesEnabled, setTieredFeesEnabled] = useState(false);
  const [dynamicFeesEnabled, setDynamicFeesEnabled] = useState(false);
  const [dynamicFeeMultiplier, setDynamicFeeMultiplier] = useState('25%');
  const [dynamicFeeTrigger, setDynamicFeeTrigger] = useState('per-swap');
  const [dynamicDecayPeriod, setDynamicDecayPeriod] = useState('1min');
  const [maxWalletEnabled, setMaxWalletEnabled] = useState(false);
  const [maxWalletLimit, setMaxWalletLimit] = useState('1%');
  const [cooldownProtectionEnabled, setCooldownProtectionEnabled] = useState(false);
  const [cooldownDuration, setCooldownDuration] = useState('10s');
  const [cooldownPenaltyFee, setCooldownPenaltyFee] = useState('5%');
  const [snipeProtectionEnabled, setSnipeProtectionEnabled] = useState(false);
  const [snipeProtectPeriod, setSnipeProtectPeriod] = useState('1min');
  const [snipeMaxBuy, setSnipeMaxBuy] = useState('Medium (0.1%)');
  const [mevProtectionEnabled, setMevProtectionEnabled] = useState(false);
  const [launchProtectionEnabled, setLaunchProtectionEnabled] = useState(false);
  const [launchMaxTransaction, setLaunchMaxTransaction] = useState('1%');
  const [launchProtectBlocks, setLaunchProtectBlocks] = useState('5');

  const rows = useRef(new Map<string, HTMLDivElement>());
  const listRef = useRef<HTMLDivElement | null>(null);
  const advancedProtectionRef = useRef<HTMLDivElement | null>(null);
  const pendingScrollId = useRef<string | null>(null);
  const routeCenterTimeoutRef = useRef<number | null>(null);
  const routeCenterCancelRef = useRef<(() => void) | null>(null);
  const advancedCenterTimeoutRef = useRef<number | null>(null);
  const advancedCenterCancelRef = useRef<(() => void) | null>(null);
  const [attentionId, setAttentionId] = useState<string | null>(null);

  const list = draft ?? fees;
  const total = useMemo(() => fees.reduce((s, f) => s + (f.pct ?? 0), 0), [fees]);
  const effective = enabled ? total : 0;
  const available = clamp(maxTotal - effective, 0, maxTotal);
  const atCap = available <= 1e-9;
  const nearCap = !atCap && available <= 0.5;
  const ids = useMemo(() => new Set(fees.map((f) => f.id)), [fees]);
  const bar = useMemo(() => (enabled ? totalBar(list) : { t: 0, bg: 'rgba(0,0,0,0)' }), [enabled, list]);
  const feeEngineRoutes = useMemo<FeeEngineRoute[]>(() => list.map((fee) => {
    const selectedAssetIds = [...new Set(fee.id === 'rewards'
      ? [`TOKEN:${fee.rewardAsset ?? rewardOf(chain)}`]
      : (fee.id === 'rwa' || fee.routeRewardMode ? fee.rwaAssets ?? [] : []))];
    const weights = selectedAssetIds.length
      ? normalizeAssetWeights(selectedAssetIds, fee.rwaAssetWeights)
      : {};
    const kind = feeEngineKind(fee);
    const configuredRecipient = (kind === 'treasury' || kind === 'custom') ? fee.address?.trim() ?? '' : '';
    const recipientAddress = configuredRecipient && isRecipientAddressValid(configuredRecipient, chain) ? configuredRecipient : undefined;
    return {
      id: fee.id,
      label: fee.id === 'rwa' ? 'Rewards Basket' : fee.name,
      percent: fee.pct ?? 0,
      color: tint(fee.id, fee.name),
      kind,
      detail: feeEngineDetail(fee, chain),
      recipientAddress,
      recipientExplorerUrl: recipientAddress ? `${ADDRESS_EXPLORERS[chain]}${encodeURIComponent(recipientAddress)}` : undefined,
      distributionMode: fee.rwaDistributionMode ?? 'rotating',
      minimumWalletShare: kind === 'basket' || kind === 'rewards' ? fee.rewardThresholdPct ?? 0.1 : undefined,
      assets: selectedAssetIds.map((id) => feeEngineAsset(id, weights[id])),
    };
  }), [chain, list]);
  const feeEngineRewardPayments = useMemo<FeeEngineRewardPayment[]>(() => {
    const seen = new Set<string>();
    const assets = feeEngineRoutes
      .filter((route) => route.kind === 'basket' || route.kind === 'rewards')
      .flatMap((route) => route.assets ?? [])
      .filter((asset) => {
        if (seen.has(asset.id)) return false;
        seen.add(asset.id);
        return true;
      });
    const sampleAmounts = [0.0184, 0.1126, 0.0382, 0.0841, 0.0067, 0.0248, 0.0513, 0.0096];
    const sampleUsdValues = [31.42, 28.16, 24.83, 22.09, 18.61, 16.48, 14.72, 11.36];
    return assets.map((asset, index) => ({
      assetId: asset.id,
      amount: sampleAmounts[index % sampleAmounts.length],
      usdValue: sampleUsdValues[index % sampleUsdValues.length],
    }));
  }, [feeEngineRoutes]);
  const missing = useMemo(() => fees.filter((fee) => isMissingAddr(fee, chain)), [chain, fees]);
  const addableOptions = useMemo(() => ADD.filter((t) => canAdd(t, ids)), [ids]);
  const routeCount = fees.length;
  const onlyCustomLeft = addableOptions.length === 1 && addableOptions[0] === 'custom';
  const advancedProtectionCount = [tieredFeesEnabled, dynamicFeesEnabled, maxWalletEnabled, cooldownProtectionEnabled, snipeProtectionEnabled, launchProtectionEnabled, mevProtectionEnabled].filter(Boolean).length;

  const warnBadge = useMemo(() => {
    if (!enabled) return null;
    const warn = totalWarnLevel(total);
    if (!warn) return null;
    const danger = warn === 'danger';
    return {
      label: danger ? `High total fee ${fmtPct(total)}` : `Medium total fee ${fmtPct(total)}`,
      danger,
    };
  }, [enabled, total]);
  const issueCount = missing.length;

  const missingSummary = useMemo(() => {
    if (!missing.length) return null;
    const issues = missing.map((fee) => {
      if ((fee.id === 'rwa' || fee.routeRewardMode) && !(fee.rwaAssets?.length)) return 'Select at least one token, stock, or ETF';
      if ((fee.address ?? '').trim()) return `Enter a valid ${chain === 'sol' ? 'Solana' : 'EVM'} recipient for ${fee.name?.trim() || fee.id}`;
      return `Add a recipient for ${fee.name?.trim() || fee.id}`;
    });
    return {
      id: missing[0].id,
      text: issues.length === 1 ? issues[0] : `Complete ${issues.length} route settings`,
      title: issues.join(' | '),
    };
  }, [chain, missing]);
  const hasRouteIssues = enabled && Boolean(missingSummary);
  const hasRouteNotice = enabled && Boolean(warnBadge);
  const showRouteFeedback = enabled && (routeCount === 0 || Boolean(missingSummary) || Boolean(warnBadge));
  const routeIssueColor = '#FF7184';
  const routeNoticeColor = warnBadge?.danger ? '#FB7185' : '#F6C56A';
  const routeDockStyle: React.CSSProperties = {
    background: hasRouteIssues
      ? `linear-gradient(135deg, ${rgba(routeIssueColor, 0.075)}, rgba(13,15,14,0.90) 38%, rgba(9,10,10,0.84))`
      : hasRouteNotice
        ? `linear-gradient(135deg, ${rgba(routeNoticeColor, warnBadge?.danger ? 0.030 : 0.040)}, rgba(13,15,14,0.88) 42%, rgba(9,10,10,0.82))`
      : 'linear-gradient(135deg, rgba(13,15,14,0.86), rgba(9,10,10,0.82))',
    borderColor: hasRouteIssues ? rgba(routeIssueColor, 0.24) : hasRouteNotice ? rgba(routeNoticeColor, warnBadge?.danger ? 0.12 : 0.15) : 'rgba(244,249,246,0.13)',
    borderStyle: 'dashed',
    borderWidth: 1,
    boxShadow: hasRouteIssues
      ? `inset 0 1px 0 rgba(255,255,255,0.014), 0 0 26px ${rgba(routeIssueColor, 0.055)}`
      : hasRouteNotice
        ? `inset 0 1px 0 rgba(255,255,255,0.012), 0 0 22px ${rgba(routeNoticeColor, warnBadge?.danger ? 0.024 : 0.030)}`
      : 'inset 0 1px 0 rgba(255,255,255,0.010)',
    transition: 'background 420ms ease, border-color 420ms ease, box-shadow 420ms ease',
  };

  useEffect(() => {
    onAdvancedProtectionChange?.(advancedProtectionCount);
  }, [advancedProtectionCount, onAdvancedProtectionChange]);

  useEffect(() => {
    onIssuesChange?.(issueCount);
  }, [issueCount, onIssuesChange]);

  useEffect(() => {
    return () => {
      if (routeCenterTimeoutRef.current !== null) window.clearTimeout(routeCenterTimeoutRef.current);
      routeCenterCancelRef.current?.();
      if (advancedCenterTimeoutRef.current !== null) window.clearTimeout(advancedCenterTimeoutRef.current);
      advancedCenterCancelRef.current?.();
    };
  }, []);

  const centerFeeRow = useCallback((id: string, delay = 120, duration = 900) => {
    if (routeCenterTimeoutRef.current !== null) window.clearTimeout(routeCenterTimeoutRef.current);
    routeCenterCancelRef.current?.();
    routeCenterTimeoutRef.current = window.setTimeout(() => {
      const row = rows.current.get(id);
      if (row) {
        const block = row.getBoundingClientRect().height > window.innerHeight * 0.72 ? 'start' : 'center';
        routeCenterCancelRef.current = smoothCenterElement(row, duration, block);
      }
      routeCenterTimeoutRef.current = null;
    }, delay);
  }, []);

  const focusFee = useCallback((id: string) => {
    const row = rows.current.get(id);
    if (!row) return;
    setAttentionId(id);
    centerFeeRow(id, 60, 920);
    window.setTimeout(() => {
      const focusTarget = row.querySelector<HTMLElement>('[data-focus-target]')
        ?? row.querySelector<HTMLInputElement>('input:not([type="range"])');
      focusTarget?.focus();
    }, 360);
    window.setTimeout(() => setAttentionId((current) => current === id ? null : current), 1800);
  }, [centerFeeRow]);

  useEffect(() => {
    if (!focusIssueRequest || !missing.length) return;
    const id = missing[0].id;
    const timeout = window.setTimeout(() => focusFee(id), 360);
    return () => window.clearTimeout(timeout);
  }, [focusIssueRequest, focusFee, missing]);

  const patch = useCallback((id: string, p: Partial<FeeWallet>) => {
    if (!enabled) return;
    setSelectedPreset(null);
    const next = list.map((f) => (f.id === id ? { ...f, ...p } : { ...f }));
    if (draft) setDraft(next);
    onChange(next);
  }, [draft, enabled, list, onChange]);

  const setPct = useCallback((id: string, v: number) => {
    if (!enabled) return;
    setSelectedPreset(null);
    const next = equalize(list.map((f) => ({ ...f })), id, round1(v), maxTotal);
    if (draft) setDraft(next);
    onChange(next);
  }, [draft, enabled, list, maxTotal, onChange]);

  const remove = useCallback((id: string) => {
    if (!enabled) return;
    setSelectedPreset(null);
    const next = list.filter((f) => f.id !== id);
    if (draft) setDraft(next);
    onChange(next);
  }, [draft, enabled, list, onChange]);

  const addFee = useCallback((t: FeeType) => {
    if (!enabled) return;
    setSelectedPreset(null);
    const base = list.map((f) => ({ ...f }));
    const cur = new Set(base.map((f) => f.id));
    if (!canAdd(t, cur)) return;
    const id = t === 'custom' ? `custom-${Date.now().toString(36)}` : make(chain, t as Exclude<FeeType, 'custom'>).id;
    const added = t === 'custom'
      ? { id, name: 'Custom fee', pct: 1, address: '', routeRewardMode: 'single' as const, rwaAssets: [nativeRewardAssetId(chain)], rwaAssetWeights: { [nativeRewardAssetId(chain)]: 100 }, rwaDistributionMode: 'rotating' as const }
      : make(chain, t as Exclude<FeeType, 'custom'>);
    const next = equalize([...base, added], id, 1, maxTotal);
    pendingScrollId.current = id;
    if (draft) setDraft(next);
    onChange(next);
  }, [chain, draft, enabled, list, maxTotal, onChange]);

  const applyPreset = useCallback((preset: PresetKey) => {
    const next = presetFees(chain, preset);
    setSelectedPreset(preset);
    setDraft(null);
    setDrag(null);
    pendingScrollId.current = next.find((fee) => fee.id === 'rwa')?.id ?? next[0]?.id ?? null;
    onChange(next);
  }, [chain, onChange]);

  const resetFees = useCallback(() => {
    setSelectedPreset(null);
    setDraft(null);
    setDrag(null);
    onChange([]);
  }, [onChange]);

  const handleDynamicFeesToggle = useCallback(() => {
    setDynamicFeesEnabled((current) => {
      const next = !current;
      if (next) setTieredFeesEnabled(false);
      return next;
    });
  }, []);

  const handleTieredFeesToggle = useCallback(() => {
    setTieredFeesEnabled((current) => {
      const next = !current;
      if (next) setDynamicFeesEnabled(false);
      return next;
    });
  }, []);

  const centerAdvancedProtection = useCallback(() => {
    if (advancedCenterTimeoutRef.current !== null) window.clearTimeout(advancedCenterTimeoutRef.current);
    advancedCenterCancelRef.current?.();
    advancedCenterTimeoutRef.current = window.setTimeout(() => {
      if (advancedProtectionRef.current) advancedCenterCancelRef.current = smoothCenterElement(advancedProtectionRef.current, 900);
      advancedCenterTimeoutRef.current = null;
    }, 240);
  }, []);

  const toggleAdvancedProtection = useCallback(() => {
    setAdvancedProtectionOpen((current) => {
      const next = !current;
      if (next) centerAdvancedProtection();
      return next;
    });
  }, [centerAdvancedProtection]);

  useEffect(() => {
    if (drag) return;
    const r = list.find((f) => f.id === 'rewards');
    if (!r || (r.pct ?? 0) <= 0) return;
    const desired = r.rewardAsset && RW[chain].includes(r.rewardAsset) ? r.rewardAsset : rewardOf(chain);
    if (desired === r.rewardAsset) return;
    const timeout = window.setTimeout(() => patch('rewards', { rewardAsset: desired }), 0);
    return () => window.clearTimeout(timeout);
  }, [chain, drag, list, patch]);

  useEffect(() => {
    if (drag) return;
    const id = pendingScrollId.current;
    if (!id) return;
    const timeout = window.setTimeout(() => {
      centerFeeRow(id, 0, 940);
      pendingScrollId.current = null;
    }, 170);
    return () => window.clearTimeout(timeout);
  }, [centerFeeRow, drag, list]);

  useEffect(() => {
    if (!drag) return;
    const onMove = (e: PointerEvent) => {
      setDrag((p) => (p && p.pid === e.pointerId ? { ...p, y: e.clientY } : p));
      const from = list.findIndex((f) => f.id === drag.id);
      if (from < 0) return;
      const mid = e.clientY - drag.off + drag.h / 2;
      const others = list.filter((f) => f.id !== drag.id);
      let to = others.length;
      for (let i = 0; i < others.length; i++) {
        const el = rows.current.get(others[i].id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (mid < r.top + r.height / 2) {
          to = i;
          break;
        }
      }
      const next = reorder(list, from, to);
      if (next !== list) setDraft(next);
    };

    const onEnd = (e: PointerEvent) => {
      if (e.pointerId !== drag.pid) return;
      if (draft) onChange(draft);
      setDrag(null);
      setDraft(null);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onEnd);
    window.addEventListener('pointercancel', onEnd);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('pointercancel', onEnd);
    };
  }, [drag, draft, list, onChange]);

  const start = useCallback((id: string) => (e: React.PointerEvent) => {
    if (!enabled || noDragTarget(e.target)) return;
    const card = rows.current.get(id);
    if (!card) return;
    const r = card.getBoundingClientRect();
    const listTop = listRef.current?.getBoundingClientRect().top ?? 0;
    setSelectedPreset(null);
    setDraft((p) => p ?? fees);
    setDrag({ id, pid: e.pointerId, y: e.clientY, off: e.clientY - r.top, h: r.height, baseTop: listTop });
    e.preventDefault();
  }, [enabled, fees]);

  const floating = useMemo(() => {
    if (!drag) return null;
    const fee = list.find((f) => f.id === drag.id);
    if (!fee) return null;
    return { fee, top: drag.y - drag.baseTop - drag.off };
  }, [drag, list]);

  return (
    <section className={`w-full min-w-0 max-w-full ${className}`} aria-label='Fee builder'>
        <style>{`input::placeholder{font-weight:400;color:rgba(244,249,246,0.40)}.bbAssetWeight{-moz-appearance:textfield;appearance:textfield}.bbAssetWeight::-webkit-inner-spin-button,.bbAssetWeight::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}.bbField{transition:border-color .18s ease,background .18s ease,box-shadow .18s ease;outline:none}.bbField:hover{background:linear-gradient(180deg,rgba(244,249,246,0.065),rgba(244,249,246,0.03))!important;border-color:color-mix(in srgb,var(--fieldAccent) 28%,rgba(255,255,255,0.12))!important}.bbField:focus-within{border-color:var(--fieldAccent)!important;box-shadow:0 0 0 1px color-mix(in srgb,var(--fieldAccent) 24%,transparent) inset,0 0 0 3px rgba(244,249,246,0.035),0 16px 32px rgba(0,0,0,0.20)!important}.bbFieldInput:disabled{opacity:.48;cursor:not-allowed}.bbPill{transition:filter .16s ease,background .16s ease,border-color .16s ease;outline:none}.bbPill:focus-visible{box-shadow:0 0 0 2px rgba(95,243,166,0.22)}.bbPill:hover:not(:disabled){filter:brightness(1.06);transform:none}.bbPill:active:not(:disabled){filter:brightness(1.03);transform:none}.bbPresetPill:hover:not(:disabled){filter:none!important;transform:none!important;background:rgba(244,249,246,0.075)!important;border-color:rgba(244,249,246,0.12)!important;color:rgba(244,249,246,0.86)!important}.bbPresetPill:active:not(:disabled){transform:none!important}.bbRouteAdd:hover:not(:disabled),.bbRouteAdd:active:not(:disabled){filter:none!important;transform:none!important}.bbPill:disabled{opacity:.42;cursor:default}.bbGrip{background:transparent;border:0;filter:none;touch-action:none}.bbGrip:hover{color:rgba(244,249,246,0.82)}.bbGrip:active{transform:scale(.96)}.bbRemoveBtn{color:rgba(244,249,246,0.42);background:rgba(244,249,246,0.018);transition:color .16s ease,background .16s ease,box-shadow .16s ease,transform .16s cubic-bezier(.22,1,.36,1)}.bbRemoveBtn:hover:not(:disabled){color:var(--removeColor);background:linear-gradient(135deg,color-mix(in srgb,var(--removeColor) 12%,rgba(244,249,246,0.025)),rgba(244,249,246,0.026));box-shadow:inset 1px 0 0 color-mix(in srgb,var(--removeColor) 10%,transparent)}.bbRemoveBtn:active:not(:disabled){transform:scale(.94)}.bbRouteIssue{transform:none!important;transition:color .18s ease,background .18s ease,border-color .18s ease,box-shadow .18s ease!important}.bbRouteIssue:hover{transform:none!important;border-color:rgba(255,113,132,0.46)!important;background:linear-gradient(135deg,rgba(255,113,132,0.16),rgba(255,113,132,0.055))!important;box-shadow:0 0 20px rgba(255,113,132,0.10)}.bbRouteDesc{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2}.bbAssetPills{justify-content:space-between}.bbAssetPills .bbPresetPill{flex:1 1 0;min-width:0}.bbAssetPayoutNotice{animation:bbAssetPayoutNotice 2.8s ease-in-out infinite}.bbAssetPayoutCue{transform-origin:center;animation:bbAssetPayoutCue 2.8s ease-in-out infinite}@keyframes bbAssetPayoutNotice{0%,100%{background-color:transparent}50%{background-color:var(--assetPayoutTint)}}@keyframes bbAssetPayoutCue{0%,100%{opacity:.70;transform:scale(1)}50%{opacity:1;transform:scale(1.045)}}.bbFirstRouteNotice{background-size:220% 100%;animation:bbFirstRouteNotice 5.8s cubic-bezier(.22,1,.36,1) infinite}@keyframes bbFirstRouteNotice{0%,18%{background-position:0% 50%;box-shadow:0 0 0 rgba(24,201,142,0)}48%{background-position:100% 50%;box-shadow:0 0 22px rgba(24,201,142,0.060)}80%,100%{background-position:0% 50%;box-shadow:0 0 0 rgba(24,201,142,0)}}@media (prefers-reduced-motion:reduce){.bbFirstRouteNotice,.bbAssetPayoutNotice,.bbAssetPayoutCue{animation:none}.bbAssetPayoutNotice{background:var(--assetPayoutTint)}}input.bbRange[type='range']{--feeColor:rgba(244,249,246,0.6);--fillPct:0%;-webkit-appearance:none;appearance:none;background:transparent;height:20px}input.bbRange[type='range']:focus{outline:none}input.bbRange[type='range']::-webkit-slider-runnable-track{height:5px;border-radius:999px;background:linear-gradient(90deg,var(--feeColor) var(--fillPct),rgba(244,249,246,0.12) var(--fillPct))}input.bbRange[type='range']::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:13px;height:13px;border-radius:999px;background:var(--feeColor);border:2px solid #07100C;box-shadow:0 0 0 3px rgba(0,0,0,0.18),0 0 14px rgba(95,243,166,0.18);margin-top:-4px}input.bbRange[type='range']::-moz-range-track{height:5px;border-radius:999px;background:linear-gradient(90deg,var(--feeColor) var(--fillPct),rgba(244,249,246,0.12) var(--fillPct))}input.bbRange[type='range']::-moz-range-thumb{width:13px;height:13px;border-radius:999px;background:var(--feeColor);border:2px solid #07100C;box-shadow:0 0 0 3px rgba(0,0,0,0.18)}@media(min-width:640px){.bbAssetPills{justify-content:flex-start}.bbAssetPills .bbPresetPill{flex:0 0 auto}input.bbRange[type='range']{height:24px}input.bbRange[type='range']::-webkit-slider-runnable-track{height:6px}input.bbRange[type='range']::-webkit-slider-thumb{width:16px;height:16px;box-shadow:0 0 0 4px rgba(0,0,0,0.18),0 0 14px rgba(95,243,166,0.18);margin-top:-5px}input.bbRange[type='range']::-moz-range-track{height:6px}input.bbRange[type='range']::-moz-range-thumb{width:16px;height:16px;box-shadow:0 0 0 4px rgba(0,0,0,0.18)}}`}</style>

        <style>{`.bbProtectionPill,.bbProtectionQuickPill{outline:none}.bbProtectionPill:hover:not(:disabled){color:#D8FFEA!important;background:rgba(24,201,142,0.075)!important;border-color:rgba(24,201,142,0.30)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,0.025),0 0 18px rgba(24,201,142,0.045)!important}.bbProtectionPill[data-active="true"]:hover:not(:disabled){color:#7CFFC0!important;background:rgba(24,201,142,0.17)!important;border-color:rgba(24,201,142,0.58)!important}.bbProtectionQuickPill:hover:not(:disabled){color:#D8FFEA!important;background:rgba(24,201,142,0.075)!important;border-color:rgba(24,201,142,0.30)!important}.bbProtectionQuickPill[data-active="true"]:hover:not(:disabled){color:#7CFFC0!important;background:rgba(24,201,142,0.17)!important;border-color:rgba(24,201,142,0.58)!important}.bbProtectionPill:focus-visible,.bbProtectionQuickPill:focus-visible{box-shadow:0 0 0 2px rgba(24,201,142,0.22)!important}`}</style>

        <div className='min-w-0 max-w-full'>
              <div className='flex min-w-0 max-w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3'>
                <div className='bbNoScroll order-2 flex w-full min-w-0 max-w-full flex-nowrap gap-1 overflow-x-auto rounded-[16px] border p-1 sm:order-1 sm:w-auto sm:rounded-[18px]' style={{ scrollbarWidth: 'none', background: 'rgba(244,249,246,0.025)', borderColor: 'rgba(244,249,246,0.10)' } as React.CSSProperties}>
                  {PRESETS.map((preset) => {
                    const activePreset = selectedPreset === preset.key;
                    return <button key={preset.key} type='button' title={preset.hint} onClick={() => applyPreset(preset.key)} className='bbPill bbPresetPill shrink-0 whitespace-nowrap rounded-[11px] border px-2 py-1 text-[10px] font-semibold sm:rounded-[13px] sm:px-3 sm:py-1.5 sm:text-[11px]' style={{ color: activePreset ? T.text : 'rgba(244,249,246,0.48)', background: activePreset ? 'rgba(244,249,246,0.105)' : 'transparent', borderColor: activePreset ? 'rgba(244,249,246,0.16)' : 'transparent', boxShadow: activePreset ? 'inset 0 1px 0 rgba(255,255,255,0.035)' : 'none' }}><span className='sm:hidden'>{preset.mobileLabel}</span><span className='hidden sm:inline'>{preset.label}</span></button>;
                  })}
                </div>
                <div className='order-1 flex min-w-0 max-w-full items-center justify-between gap-2 sm:order-2 sm:flex-wrap sm:justify-end'>
                <button type='button' onClick={resetFees} className='bbPill inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-semibold sm:gap-2 sm:px-3 sm:text-[11px]' style={{ color: 'rgba(244,249,246,0.58)', background: 'rgba(244,249,246,0.035)', borderColor: 'rgba(244,249,246,0.10)' }}>
                  <RotateCcw size={12} />
                  <span className='hidden min-[360px]:inline'>Reset</span>
                </button>
                <div className='shrink-0 rounded-full border px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] sm:px-3 sm:text-[10px] sm:tracking-[0.18em]' style={{ color: '#9DFFD0', background: 'rgba(244,249,246,0.045)', borderColor: 'rgba(244,249,246,0.12)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.025)' }}>
                  <span style={{ color: 'rgba(244,249,246,0.48)' }}>Configured</span> <span className='ml-1 tabular-nums'>{effective.toFixed(2)}%</span>
                </div>
                </div>
              </div>

              <div className='mt-4 px-2'>
                <div className='flex items-center justify-between gap-3'>
                  <p className='text-[11px] font-semibold' style={{ color: T.muted }}>Total <span className='tabular-nums' style={{ color: warnBadge?.danger ? 'rgba(255,214,220,0.98)' : warnBadge ? 'rgba(255,244,214,0.98)' : T.text }}>{effective.toFixed(2)}%</span></p>
                  <p className='text-[11px] font-semibold' style={{ color: T.muted }}><span className='tabular-nums' style={{ color: atCap ? 'rgba(255,244,214,0.98)' : nearCap ? 'rgba(255,244,214,0.94)' : T.text }}>{available.toFixed(2)}%</span> available</p>
                </div>
                <div className='relative mt-2 h-2 w-full overflow-hidden rounded-full' style={{ background: S.bar }}>
                  <div className='absolute left-0 top-0 h-full rounded-full' style={{ width: `${Math.min(100, Math.max(0, (bar.t / maxTotal) * 100))}%`, background: bar.bg, opacity: 0.98, transition: 'width 180ms ease, opacity 160ms ease', boxShadow: warnBadge?.danger ? '0 0 14px rgba(244,63,94,0.22)' : warnBadge ? '0 0 14px rgba(251,191,36,0.18)' : '0 0 18px rgba(95,243,166,0.10)' }} aria-hidden />
                </div>
              </div>

              <div ref={listRef} className='relative mt-5 min-w-0 max-w-full space-y-3' style={{ opacity: enabled ? 1 : 0.52, transition: 'opacity 160ms ease' }}>
                {list.map((fee) => {
                  const ghost = Boolean(drag && drag.id === fee.id);
                  const bind = (el: HTMLDivElement | null) => {
                    if (el) rows.current.set(fee.id, el);
                    else rows.current.delete(fee.id);
                  };
                  return ghost && drag ? (
                    <div key={fee.id} style={{ height: drag.h }}>
                      <Row fee={fee} chain={chain} walletAddress={walletAddress} max={maxTotal} disabled={!enabled} dragging ghost patch={patch} setPct={setPct} remove={remove} onDrag={start(fee.id)} bind={bind} attention={attentionId === fee.id} onExpand={(id) => centerFeeRow(id, 70, 940)} />
                    </div>
                  ) : (
                    <Row key={fee.id} fee={fee} chain={chain} walletAddress={walletAddress} max={maxTotal} disabled={!enabled} dragging={Boolean(drag)} patch={patch} setPct={setPct} remove={remove} onDrag={start(fee.id)} bind={bind} attention={attentionId === fee.id} onExpand={(id) => centerFeeRow(id, 70, 940)} />
                  );
                })}
                {floating ? (
                  <div style={{ position: 'absolute', left: 0, right: 0, top: floating.top, zIndex: 40, pointerEvents: 'none', transform: 'scale(1.01)', filter: 'drop-shadow(0 22px 42px rgba(0,0,0,0.58))' }} aria-hidden>
                    <Row fee={floating.fee} chain={chain} walletAddress={walletAddress} max={maxTotal} disabled={!enabled} dragging patch={patch} setPct={setPct} remove={remove} attention={attentionId === floating.fee.id} />
                  </div>
                ) : null}
              </div>

              <div className='mt-5' data-no-drag style={{ opacity: enabled ? 1 : 0.52, transition: 'opacity 160ms ease' }}>
                <div className='rounded-[16px] border px-3 py-2.5 sm:rounded-[18px] sm:px-3.5 sm:py-3' style={routeDockStyle}>
                  <div className='flex flex-wrap items-center justify-between gap-2 sm:gap-3'>
                    <div className='min-w-[140px] flex-1 sm:min-w-[190px]'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <p className='text-[9px] font-semibold uppercase tracking-[0.16em] sm:text-[10px] sm:tracking-[0.20em]' style={{ color: 'rgba(157,255,208,0.62)' }}><span className='sm:hidden'>Trigger</span><span className='hidden sm:inline'>Distribution Trigger</span></p>
                        <span className='rounded-full border px-1.5 py-0.5 text-[7.5px] font-semibold uppercase tracking-[0.12em] sm:px-2 sm:text-[8.5px] sm:tracking-[0.14em]' style={{ color: 'rgba(157,255,208,0.58)', background: 'rgba(157,255,208,0.035)', borderColor: 'rgba(157,255,208,0.10)' }}>Auto</span>
                      </div>
                      <p className='mt-1 overflow-hidden text-[10px] leading-4 sm:text-[11px]' style={{ color: 'rgba(244,249,246,0.52)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>Auto-distribute collected ETH across enabled routes.</p>
                    </div>
                    <div className='flex flex-nowrap items-center justify-end gap-1 sm:gap-2'>
                      <span className='text-[8px] font-semibold uppercase tracking-[0.10em] sm:text-[9px] sm:tracking-[0.14em]' style={{ color: T.muted }}>Every</span>
                      <DistributionTriggerControl value={distributionTrigger} onChange={setDistributionTrigger} disabled={!enabled} />
                      <span className='text-[8px] font-semibold uppercase tracking-[0.10em] sm:text-[9px] sm:tracking-[0.14em]' style={{ color: T.muted }}>ETH</span>
                    </div>
                  </div>
                  <div className='my-3 h-px w-full' style={{ background: 'linear-gradient(90deg, rgba(244,249,246,0.02), rgba(244,249,246,0.105), rgba(244,249,246,0.02))' }} aria-hidden />
                  <div className='mb-2.5 flex flex-wrap items-center justify-between gap-2'>
                    <p className='pl-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] sm:text-[10px] sm:tracking-[0.20em]' style={{ color: 'rgba(244,249,246,0.46)', transition: 'color 320ms ease' }}>Add fee routes</p>
                    {routeCount > 0 ? (
                      <span className='rounded-full border px-2 py-0.5 text-[9.5px] font-semibold tabular-nums' style={{ color: 'rgba(244,249,246,0.44)', background: 'rgba(10,15,13,0.58)', borderColor: 'rgba(244,249,246,0.075)' }}>{routeCount} {routeCount === 1 ? 'route' : 'routes'} added</span>
                    ) : null}
                  </div>
                <div className='grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:items-center sm:gap-2'>
                  {addableOptions.map((t) => {
                    const col = META[t].c;
                    const custom = t === 'custom';
                    return (
                        <button key={t} type='button' disabled={!enabled} onClick={() => addFee(t)} className='bbPill bbRouteAdd inline-flex h-8 w-full items-center justify-start gap-1.5 rounded-full px-2.5 text-[10px] font-semibold transition-[border-color,background-color,box-shadow] duration-200 sm:h-auto sm:w-auto sm:gap-2 sm:px-2.5 sm:py-1.5 sm:text-[11px]' style={{ color: enabled ? T.text : T.muted, background: custom ? 'rgba(244,249,246,0.026)' : `linear-gradient(135deg, ${rgba(col, 0.075)}, rgba(244,249,246,0.016))`, border: custom ? `1px solid ${rgba(col, 0.18)}` : `1px solid ${rgba(col, 0.20)}`, boxShadow: custom ? 'none' : `0 0 16px ${rgba(col, 0.028)}` }}>
                        <span className='inline-flex h-4 w-4 items-center justify-center rounded-md sm:h-5 sm:w-5' style={{ background: 'linear-gradient(180deg, rgba(24,27,26,0.96), rgba(12,14,13,0.94))', border: `1px solid ${rgba(col, custom ? 0.18 : 0.24)}`, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.035), 0 0 10px ${rgba(col, 0.042)}` }} aria-hidden>
                          <Plus size={11} strokeWidth={2.1} style={{ color: col }} />
                        </span>
                        <span className='min-w-0 truncate'><span className='sm:hidden'>{shortLabel(t)}</span><span className='hidden sm:inline'>{label(t)}</span></span>
                      </button>
                    );
                  })}
                </div>
                {onlyCustomLeft ? (
                  <p className='mt-2 overflow-hidden text-[10px] leading-4 sm:text-[11px] sm:leading-5' style={{ color: 'rgba(244,249,246,0.43)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>Standard routes are already active. Add custom routes for extra recipients.</p>
                ) : null}

                <div className='grid transition-[grid-template-rows,opacity] duration-400 ease-[cubic-bezier(.22,1,.36,1)]' style={{ gridTemplateRows: showRouteFeedback ? '1fr' : '0fr', opacity: showRouteFeedback ? 1 : 0 }} aria-hidden={!showRouteFeedback} inert={!showRouteFeedback}>
                  <div className='min-h-0 overflow-hidden'>
                    <div className='my-3 h-px w-full' style={{ background: `linear-gradient(90deg, transparent, ${routeCount === 0 ? 'rgba(24,201,142,0.16)' : rgba(missingSummary ? routeIssueColor : routeNoticeColor, missingSummary ? 0.16 : 0.10)}, transparent)` }} aria-hidden />
                    <div className='flex flex-wrap items-center gap-2'>
                      {routeCount === 0 ? (
                        <div className='bbFirstRouteNotice flex w-full flex-wrap items-center gap-x-3 gap-y-1 rounded-xl px-3 py-2 text-[11px] sm:py-2.5 sm:text-[12px]' style={{ color: 'rgba(205,255,231,0.90)', backgroundImage: 'linear-gradient(110deg, rgba(24,201,142,0.050), rgba(24,201,142,0.020) 42%, rgba(144,255,205,0.075) 52%, rgba(24,201,142,0.020) 62%, rgba(24,201,142,0.050))', border: '1px solid rgba(24,201,142,0.12)' }}>
                          <span className='font-medium'>Add your first route</span>
                          <span className='text-white/42'>Choose Creator Revenue to start with the default route.</span>
                        </div>
                      ) : null}
                      {missingSummary ? (
                        <button type='button' onClick={() => focusFee(missingSummary.id)} className='bbRouteIssue inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold' style={{ color: 'rgba(255,224,229,0.96)', background: `linear-gradient(135deg, ${rgba(routeIssueColor, 0.13)}, ${rgba(routeIssueColor, 0.045)})`, border: `1px solid ${rgba(routeIssueColor, 0.28)}` }} title={missingSummary.title}>
                          <span className='h-1.5 w-1.5 rounded-full' style={{ background: routeIssueColor, boxShadow: `0 0 11px ${rgba(routeIssueColor, 0.40)}` }} aria-hidden />
                          <span>{missingSummary.text}</span>
                        </button>
                      ) : null}
                      {warnBadge ? (
                        <div className='inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold' style={{ color: warnBadge.danger ? 'rgba(255,220,225,0.82)' : 'rgba(255,232,184,0.84)', background: warnBadge.danger ? 'linear-gradient(135deg, rgba(244,63,94,0.060), rgba(244,63,94,0.025))' : 'linear-gradient(135deg, rgba(246,197,106,0.075), rgba(246,197,106,0.028))', border: warnBadge.danger ? '1px solid rgba(244,63,94,0.14)' : '1px solid rgba(246,197,106,0.14)' }}>
                          <span className='h-1.5 w-1.5 rounded-full' style={{ background: warnBadge.danger ? '#FB7185' : '#F6C56A', boxShadow: warnBadge.danger ? '0 0 8px rgba(251,113,133,0.22)' : '0 0 8px rgba(246,197,106,0.26)' }} aria-hidden />
                          <span>{warnBadge.label}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </div>

        <div className='mt-5 border-t border-white/[0.075] pt-5' data-no-drag>
          <div className='mb-3 flex items-end justify-between gap-3 px-1'>
            <div className='min-w-0'>
              <p className='text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9dffd0]/62'>Token page preview</p>
              <p className='mt-1 text-[10px] text-white/38 sm:text-[11px]'>Preview how configured routes, basket sequencing, and sample payout activity appear after launch.</p>
            </div>
          </div>
          <FeeEngineCard
            routes={feeEngineRoutes}
            maxTotal={maxTotal}
            accruedAmount={distributionTrigger * 0.64}
            distributionThreshold={distributionTrigger}
            settlementAsset={rewardOf(chain)}
            totalPaidOut={4.82}
            lastPayoutAt='18 min ago'
            lastPayoutExact='Example activity: most recent automatic distribution was 18 minutes ago.'
            payoutCount={27}
            viewerRewardPayments={feeEngineRewardPayments}
            className='mx-auto max-w-[560px]'
          />
        </div>

        <div ref={advancedProtectionRef} className='mt-5 pt-1' data-no-drag>
          <div className={`grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 transition-[margin] duration-300 ease-[cubic-bezier(.22,1,.36,1)] sm:grid-cols-[auto_minmax(24px,1fr)_auto_minmax(24px,1fr)_auto] sm:gap-3 ${advancedProtectionOpen ? 'mb-4' : 'mb-0'}`}>
            <div className='justify-self-start rounded-full border px-2 py-1 text-[8.5px] font-semibold uppercase tracking-[0.10em] sm:px-2.5 sm:text-[10px] sm:tracking-[0.12em]' style={{ color: '#F6C56A', background: 'rgba(245,158,11,0.10)', borderColor: 'rgba(245,158,11,0.28)' }}>Experimental</div>
            <div className='hidden h-px bg-white/10 sm:block' />
            <button
              type='button'
              aria-expanded={advancedProtectionOpen}
              onClick={toggleAdvancedProtection}
              className='group inline-flex items-center justify-self-end gap-1 rounded-xl px-1 py-1 text-[9px] font-semibold uppercase tracking-[0.11em] transition hover:bg-white/[0.025] sm:justify-self-center sm:gap-2 sm:px-2 sm:text-[13px] sm:tracking-[0.18em]'
              style={{ color: advancedProtectionOpen ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.76)' }}
            >
              <span className='whitespace-nowrap'>Advanced Protection</span>
              <ChevronDown className={`h-3 w-3 text-white/42 transition duration-300 group-hover:text-white/62 sm:h-3.5 sm:w-3.5 ${advancedProtectionOpen ? 'rotate-180' : ''}`} strokeWidth={1.8} />
            </button>
            <div className='hidden h-px bg-white/10 sm:block' />
            <a href='https://basedinc.gitbook.io/basedbid' target='_blank' rel='noopener noreferrer' onClick={(event) => { event.preventDefault(); window.open('https://basedinc.gitbook.io/basedbid', '_blank', 'noopener,noreferrer'); }} className='hidden justify-self-end text-[11px] font-medium text-white/52 underline decoration-white/15 underline-offset-4 transition hover:text-white hover:decoration-white/45 sm:block'>Learn more</a>
          </div>

          <div className='grid transition-[grid-template-rows,opacity,transform] duration-500 ease-[cubic-bezier(.22,1,.36,1)]' style={{ gridTemplateRows: advancedProtectionOpen ? '1fr' : '0fr', opacity: advancedProtectionOpen ? 1 : 0, transform: advancedProtectionOpen ? 'translateY(0)' : 'translateY(-4px)' }} aria-hidden={!advancedProtectionOpen} inert={!advancedProtectionOpen}>
            <div className='min-h-0 overflow-hidden'>
              <div className='grid gap-3 lg:grid-cols-2'>
                <ProtectionCard title='Tiered Fees' description='Applies tiered fee multipliers depending on buy size. All four rules apply at the same time when enabled.' enabled={tieredFeesEnabled} onToggle={handleTieredFeesToggle}>
                  <ProtectionRuleGrid items={[{ label: 'Up to 0.5 ETH', sublabel: '25% fee increase' }, { label: 'Up to 1 ETH', sublabel: '50% fee increase' }, { label: 'Up to 2 ETH', sublabel: '100% fee increase' }, { label: 'Above 2 ETH', sublabel: '150% fee increase' }]} />
                </ProtectionCard>

                <ProtectionCard title='Dynamic Fees' description='If enabled, fees increase with project volatility.' enabled={dynamicFeesEnabled} onToggle={handleDynamicFeesToggle}>
                  <div>
                    <label className='mb-1 block text-[9px] font-medium uppercase tracking-[0.08em] text-white/45'>Fee Increase</label>
                    <ProtectionOptionPills options={[{ label: 'Small', sublabel: '25% fee increase', value: '25%' }, { label: 'Medium', sublabel: '50% fee increase', value: '50%' }, { label: 'Large', sublabel: '100% fee increase', value: '100%' }, { label: 'Max', sublabel: '150% fee increase', value: '150%' }]} value={dynamicFeeMultiplier} onChange={setDynamicFeeMultiplier} />
                  </div>
                  <div>
                    <label className='mb-1 block text-[9px] font-medium uppercase tracking-[0.08em] text-white/45'>Trigger</label>
                    <ProtectionOptionPills options={[{ label: 'Per Swap', sublabel: 'Checks every swap', value: 'per-swap' }, { label: 'Per Block', sublabel: 'Checks every block', value: 'per-block' }]} value={dynamicFeeTrigger} onChange={setDynamicFeeTrigger} />
                  </div>
                  <div>
                    <label className='mb-1 block text-[9px] font-medium uppercase tracking-[0.08em] text-white/45'>Volatility Decay Period</label>
                    <ProtectionOptionPills options={[{ label: 'Short', sublabel: '1 min decay', value: '1min' }, { label: 'Medium', sublabel: '5 min decay', value: '5min' }, { label: 'Long', sublabel: '10 min decay', value: '10min' }]} value={dynamicDecayPeriod} onChange={setDynamicDecayPeriod} />
                  </div>
                </ProtectionCard>

                <div className='flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] leading-4 lg:col-span-2' style={{ color: 'rgba(255,255,255,0.52)', background: 'rgba(255,255,255,0.025)', borderColor: 'rgba(255,255,255,0.08)' }}>
                  <TriangleAlert size={12} strokeWidth={1.8} className='shrink-0 text-white/34' aria-hidden />
                  <span>Only one of <span className='text-white/68'>Tiered Fees</span> or <span className='text-white/68'>Dynamic Fees</span> can be enabled at a time.</span>
                </div>

                <ProtectionCard title='Max Wallet' description='Caps the maximum amount a single wallet can hold.' enabled={maxWalletEnabled} onToggle={() => setMaxWalletEnabled((current) => !current)}>
                  <div>
                    <label className='mb-1 block text-[9px] font-medium uppercase tracking-[0.08em] text-white/45'>Max Wallet (%)</label>
                    <ProtectionOptionPills options={[{ label: 'Micro', sublabel: '0.001% max wallet', value: '0.001%' }, { label: 'Tiny', sublabel: '0.01% max wallet', value: '0.01%' }, { label: 'Small', sublabel: '0.1% max wallet', value: '0.1%' }, { label: 'Medium', sublabel: '1% max wallet', value: '1%' }, { label: 'Large', sublabel: '2.5% max wallet', value: '2.5%' }, { label: 'Max', sublabel: '5% max wallet', value: '5%' }]} value={maxWalletLimit} onChange={setMaxWalletLimit} />
                  </div>
                </ProtectionCard>

                <ProtectionCard title='Cooldown Protection' description='Limits how quickly the same wallet origin can trade again.' enabled={cooldownProtectionEnabled} onToggle={() => setCooldownProtectionEnabled((current) => !current)}>
                  <div>
                    <label className='mb-1 block text-[9px] font-medium uppercase tracking-[0.08em] text-white/45'>Cooldown Duration</label>
                    <ProtectionQuickPills options={[{ label: '1s', value: '1s' }, { label: '10s', value: '10s' }, { label: '30s', value: '30s' }, { label: '1m', value: '1m' }, { label: '5m', value: '5m' }, { label: '15m', value: '15m' }, { label: '1h', value: '1h' }, { label: '1d', value: '1d' }, { label: '1w', value: '1w' }, { label: '1mo', value: '1mo' }]} value={cooldownDuration} onChange={setCooldownDuration} />
                  </div>
                  <div>
                    <label className='mb-1 block text-[9px] font-medium uppercase tracking-[0.08em] text-white/45'>Penalty Fee (%)</label>
                    <ProtectionQuickPills options={[{ label: '1%', value: '1%' }, { label: '5%', value: '5%' }, { label: '10%', value: '10%' }, { label: '20%', value: '20%' }, { label: '50%', value: '50%' }, { label: '100%', value: '100%' }]} value={cooldownPenaltyFee} onChange={setCooldownPenaltyFee} />
                  </div>
                </ProtectionCard>

                <ProtectionCard title='Snipe Protection' description='Helps prevent large early buys from a single wallet origin during launch.' enabled={snipeProtectionEnabled} onToggle={() => setSnipeProtectionEnabled((current) => !current)}>
                  <div>
                    <label className='mb-1 block text-[9px] font-medium uppercase tracking-[0.08em] text-white/45'>Protect Period</label>
                    <ProtectionOptionPills options={[{ label: 'Short', sublabel: '1 min window', value: '1min' }, { label: 'Medium', sublabel: '3 min window', value: '3min' }, { label: 'Long', sublabel: '5 min window', value: '5min' }]} value={snipeProtectPeriod} onChange={setSnipeProtectPeriod} />
                  </div>
                  <div>
                    <label className='mb-1 block text-[9px] font-medium uppercase tracking-[0.08em] text-white/45'>Max Buy Per Origin</label>
                    <ProtectionOptionPills options={[{ label: 'Small', sublabel: '0.01% max buy', value: 'Small (0.01%)' }, { label: 'Medium', sublabel: '0.1% max buy', value: 'Medium (0.1%)' }, { label: 'Large', sublabel: '1% max buy', value: 'Large (1%)' }]} value={snipeMaxBuy} onChange={setSnipeMaxBuy} />
                  </div>
                </ProtectionCard>

                <ProtectionCard title='Launch Protection' description='Applies launch transaction and block limits during the opening blocks.' enabled={launchProtectionEnabled} onToggle={() => setLaunchProtectionEnabled((current) => !current)}>
                  <div>
                    <label className='mb-1 block text-[9px] font-medium uppercase tracking-[0.08em] text-white/45'>Max Transaction (%)</label>
                    <ProtectionOptionPills options={[{ label: 'Micro', sublabel: '0.001% max transaction', value: '0.001%' }, { label: 'Tiny', sublabel: '0.01% max transaction', value: '0.01%' }, { label: 'Small', sublabel: '0.1% max transaction', value: '0.1%' }, { label: 'Medium', sublabel: '1% max transaction', value: '1%' }]} value={launchMaxTransaction} onChange={setLaunchMaxTransaction} />
                  </div>
                  <div>
                    <label className='mb-1 block text-[9px] font-medium uppercase tracking-[0.08em] text-white/45'>Protect Blocks</label>
                    <ProtectionOptionPills options={[{ label: '5', sublabel: '5 blocks', value: '5' }, { label: '10', sublabel: '10 blocks', value: '10' }, { label: '20', sublabel: '20 blocks', value: '20' }, { label: '30', sublabel: '30 blocks', value: '30' }]} value={launchProtectBlocks} onChange={setLaunchProtectBlocks} />
                  </div>
                </ProtectionCard>

                <ProtectionCard title='MEV Protection' description='Shields against front-running and sandwich attacks. May cause issues trading on some bots or swap interfaces.' enabled={mevProtectionEnabled} onToggle={() => setMevProtectionEnabled((current) => !current)} />
              </div>
            </div>
          </div>
        </div>
    </section>
  );
}

export default function FeeBuilderPanel({ chain: chainValue, walletAddress, onTotalChange, onAdvancedProtectionChange, onIssuesChange, focusIssueRequest }: { chain?: string; walletAddress?: string | null; onTotalChange?: (total: number) => void; onAdvancedProtectionChange?: (count: number) => void; onIssuesChange?: (count: number) => void; focusIssueRequest?: number }) {
  const chain = normalizeChain(chainValue);
  const previousChain = useRef(chain);
  const [fees, setFees] = useState<FeeWallet[]>(() => presetFees(chain, 'creator'));
  const total = useMemo(() => fees.reduce((sum, fee) => sum + (fee.pct ?? 0), 0), [fees]);

  useEffect(() => {
    if (previousChain.current === chain) return;
    const validTokens = new Set(tokenAssets().map(assetId));
    const previousNative = nativeRewardAssetId(previousChain.current);
    const nextNative = nativeRewardAssetId(chain);
    setFees((current) => current.map((fee) => {
      if (fee.id === 'rewards') {
        const rewardAsset = fee.rewardAsset && RW[chain].includes(fee.rewardAsset) ? fee.rewardAsset : rewardOf(chain);
        return { ...fee, rewardAsset };
      }
      if (fee.id !== 'rwa' && !fee.routeRewardMode) return fee;
      const currentAssets = fee.rwaAssets ?? [];
      const hadToken = currentAssets.some((id) => id.startsWith('TOKEN:'));
      const nextAssets = currentAssets
        .map((id) => id === previousNative ? nextNative : id)
        .filter((id) => !id.startsWith('TOKEN:') || validTokens.has(id));
      if (hadToken && !nextAssets.some((id) => id.startsWith('TOKEN:'))) nextAssets.push(nextNative);
      return {
        ...fee,
        rwaAssets: nextAssets,
        rwaAssetWeights: normalizeAssetWeights(nextAssets, fee.rwaAssetWeights),
        rwaPinnedAssets: fee.rwaPinnedAssets?.filter((id) => nextAssets.includes(id)),
      };
    }));
    previousChain.current = chain;
  }, [chain]);

  useEffect(() => {
    onTotalChange?.(total);
  }, [onTotalChange, total]);

  return <FeeStructureBuilder chain={chain} fees={fees} onChange={setFees} walletAddress={walletAddress} onAdvancedProtectionChange={onAdvancedProtectionChange} onIssuesChange={onIssuesChange} focusIssueRequest={focusIssueRequest} />;
}
