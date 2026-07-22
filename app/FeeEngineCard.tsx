'use client';

import Image from 'next/image';
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Activity,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleHelp,
  Code2,
  Coins,
  Copy,
  Crown,
  Droplets,
  Flame,
  Gauge,
  Info,
  Landmark,
  Plus,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react';
import { featheredFeeGradient } from './feeGradient';

export type FeeEngineRouteKind =
  | 'creator'
  | 'rewards'
  | 'basket'
  | 'treasury'
  | 'liquidity'
  | 'buybacks'
  | 'custom';

export type FeeEngineAsset = {
  id: string;
  symbol: string;
  name: string;
  icon?: string;
  weight?: number;
  address?: string;
  decimals?: number;
};

export type FeeEngineRewardPayment = {
  assetId: string;
  amount: number;
  usdValue?: number;
};

export type FeeEngineRoute = {
  id: string;
  label: string;
  percent: number;
  color: string;
  kind: FeeEngineRouteKind;
  detail?: string;
  metadata?: string;
  recipientAddress?: string;
  recipientExplorerUrl?: string;
  distributionMode?: 'rotating' | 'all';
  currentAssetId?: string | null;
  nextAssetId?: string | null;
  assets?: FeeEngineAsset[];
  minimumWalletShare?: number;
};

type FeeEngineCardProps = {
  routes: FeeEngineRoute[];
  maxTotal?: number;
  accruedAmount?: number;
  distributionThreshold?: number;
  settlementAsset?: string;
  totalPaidOut?: number;
  lastPayoutAt?: string | null;
  payoutCount?: number;
  viewerRewardPayments?: FeeEngineRewardPayment[];
  viewerWalletShare?: number;
  className?: string;
  hideHeader?: boolean;
  headerInfo?: ReactNode;
  headerAction?: ReactNode;
  compact?: boolean;
};

const KIND_META: Record<FeeEngineRouteKind, { icon: LucideIcon; fallback: string }> = {
  creator: { icon: Crown, fallback: '#00E38C' },
  rewards: { icon: Coins, fallback: '#FBBF24' },
  basket: { icon: BriefcaseBusiness, fallback: '#B7F34A' },
  treasury: { icon: Landmark, fallback: '#60A5FA' },
  liquidity: { icon: Droplets, fallback: '#22D3EE' },
  buybacks: { icon: Flame, fallback: '#8B7CF6' },
  custom: { icon: Code2, fallback: '#94A3B8' },
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const formatPercent = (value: number) => `${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)}%`;
const formatWalletShare = (value: number) => `${value < 0.01 ? value.toFixed(3) : value < 0.1 ? value.toFixed(2) : Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)}%`;
const formatAmount = (value: number) => {
  if (value === 0) return '0';
  if (value < 0.01) return value.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
  return value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
};
const formatRewardAmount = (value: number) => {
  if (value === 0) return '0';
  if (value < 0.001) return value.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
  if (value < 1) return value.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
  return value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
};
const formatUsd = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

function colorWithAlpha(hex: string, alpha: number) {
  const value = hex.replace('#', '');
  if (!/^[\da-f]{6}$/i.test(value)) return `rgba(255,255,255,${alpha})`;
  return `rgba(${parseInt(value.slice(0, 2), 16)},${parseInt(value.slice(2, 4), 16)},${parseInt(value.slice(4, 6), 16)},${alpha})`;
}

function HelperTip({ text, label = 'More information', align = 'center', compact = false, icon = 'help', placement = 'top', wide = false, panel = false }: { text: ReactNode; label?: string; align?: 'left' | 'center' | 'right'; compact?: boolean; icon?: 'help' | 'info'; placement?: 'top' | 'bottom'; wide?: boolean; panel?: boolean }) {
  const tooltipId = useId();
  const [open, setOpen] = useState(false);
  const position = align === 'left' ? 'left-0' : align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2';

  return (
    <span className={`group/help inline-flex shrink-0 ${panel ? 'static' : 'relative'}`} onMouseLeave={() => setOpen(false)}>
      <button
        type='button'
        aria-label={label}
        aria-describedby={tooltipId}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => { if (event.key === 'Escape') setOpen(false); }}
        className={`grid place-items-center rounded-full text-white/28 outline-none transition-colors hover:bg-white/[0.035] hover:text-white/62 focus-visible:bg-white/[0.045] focus-visible:text-white/72 focus-visible:ring-1 focus-visible:ring-white/15 ${compact ? 'h-4 w-4' : 'h-7 w-7'}`}
      >
        {icon === 'info' ? <Info size={compact ? 10 : 12} strokeWidth={1.9} aria-hidden /> : <CircleHelp size={compact ? 9.5 : 11.5} strokeWidth={1.8} aria-hidden />}
      </button>
      <span
        id={tooltipId}
        role='tooltip'
        className={`pointer-events-none absolute ${panel ? 'left-4 right-4 top-[62px] w-auto' : `${placement === 'bottom' ? 'top-[calc(100%+7px)]' : 'bottom-[calc(100%+7px)]'} ${position} ${wide ? 'w-[min(318px,calc(100vw-32px))]' : 'w-[min(248px,calc(100vw-32px))]'}`} z-50 rounded-[11px] border border-white/[0.095] bg-[#111312]/[0.98] px-3 py-2.5 text-left text-[10.5px] font-light leading-[1.62] tracking-[0.012em] text-white/56 opacity-0 shadow-[0_14px_34px_rgba(0,0,0,0.52)] backdrop-blur-xl transition-[opacity,transform] duration-150 group-hover/help:opacity-100 group-focus-within/help:opacity-100 ${open ? '!opacity-100' : ''}`}
      >
        {text}
      </span>
    </span>
  );
}

function EligibilityThreshold({ value, color, viewerWalletShare }: { value: number; color: string; viewerWalletShare?: number }) {
  const tooltipId = useId();
  const [open, setOpen] = useState(false);
  const hasWalletShare = viewerWalletShare !== undefined;
  const eligible = hasWalletShare && viewerWalletShare >= value;
  const statusLabel = !hasWalletShare ? `Hold at least ${formatPercent(value)} of supply` : eligible ? `Eligible. Your wallet holds ${formatWalletShare(viewerWalletShare)} of supply` : `Not eligible. Your wallet holds ${formatWalletShare(viewerWalletShare)} of supply`;

  return (
    <span className='group/eligibility relative inline-flex shrink-0 align-middle' onMouseLeave={() => setOpen(false)}>
      <button
        type='button'
        aria-label={`Rewards eligibility: ${statusLabel}`}
        aria-describedby={tooltipId}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => { if (event.key === 'Escape') setOpen(false); }}
        className='inline-flex items-center gap-1 text-[9.5px] font-semibold tabular-nums text-white/34 outline-none transition-colors hover:text-white/60 focus-visible:text-white/68'
      >
        <Wallet size={9.5} strokeWidth={1.8} className='text-white/30' aria-hidden />
        <span style={{ color }}>{formatPercent(value)}</span>
        {hasWalletShare ? (
          eligible ? <Check size={10} strokeWidth={2.25} className='text-[#5ee9b3]/78' aria-hidden /> : <X size={9.5} strokeWidth={2.15} className='text-[#ff6b93]/72' aria-hidden />
        ) : null}
      </button>
      <span
        id={tooltipId}
        role='tooltip'
        className={`pointer-events-none absolute bottom-[calc(100%+7px)] left-1/2 z-50 w-[min(238px,calc(100vw-32px))] -translate-x-1/2 rounded-[11px] border border-white/[0.11] bg-[#111312]/[0.98] px-3 py-2.5 text-left text-[11px] font-normal leading-[1.5] tracking-normal text-white/72 opacity-0 shadow-[0_14px_34px_rgba(0,0,0,0.52)] backdrop-blur-xl transition-opacity duration-150 group-hover/eligibility:opacity-100 group-focus-within/eligibility:opacity-100 ${open ? '!opacity-100' : ''}`}
      >
        {hasWalletShare ? eligible ? (
          <>Your wallet holds <strong className='font-semibold text-[#5ee9b3]'>{formatWalletShare(viewerWalletShare)}</strong> of supply. You meet the <strong className='font-semibold text-white/84'>{formatPercent(value)}</strong> minimum and are eligible for rewards.</>
        ) : (
          <>Your wallet holds <strong className='font-semibold text-[#ff789c]'>{formatWalletShare(viewerWalletShare)}</strong> of supply. Hold at least <strong className='font-semibold text-white/84'>{formatPercent(value)}</strong> to receive rewards.</>
        ) : <>Hold at least <strong className='font-semibold text-white/84'>{formatPercent(value)}</strong> of the token supply to receive rewards.</>}
      </span>
    </span>
  );
}

function AssetIcon({ asset, size = 28 }: { asset: FeeEngineAsset; size?: number }) {
  return (
    <span
      className='relative grid shrink-0 place-items-center overflow-hidden rounded-full border border-white/[0.13] bg-[#171918] text-[9px] font-bold uppercase text-white/78 shadow-[0_4px_12px_rgba(0,0,0,0.26)]'
      style={{ width: size, height: size }}
      title={asset.name}
    >
      {asset.icon ? <Image src={asset.icon} alt='' fill sizes={`${size}px`} className='object-cover' /> : asset.symbol.slice(0, 2)}
    </span>
  );
}

function RecipientAddress({ address, explorerUrl }: { address: string; explorerUrl?: string }) {
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef<number | null>(null);
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  useEffect(() => () => {
    if (copiedTimeoutRef.current !== null) window.clearTimeout(copiedTimeoutRef.current);
  }, []);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      if (copiedTimeoutRef.current !== null) window.clearTimeout(copiedTimeoutRef.current);
      copiedTimeoutRef.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <span className='inline-flex h-4 shrink-0 translate-y-px items-center gap-1'>
      {explorerUrl ? (
        <a
          href={explorerUrl}
          target='_blank'
          rel='noreferrer'
          aria-label={`View recipient ${shortAddress} on explorer`}
          className='inline-flex items-center gap-1 text-[10px] font-medium tabular-nums text-white/46 outline-none transition-colors hover:text-white/72 focus-visible:text-white/76'
        >
          {shortAddress}
        </a>
      ) : <span className='text-[10px] font-medium tabular-nums text-white/46'>{shortAddress}</span>}
      <button
        type='button'
        onClick={() => void copyAddress()}
        aria-label={`Copy recipient address ${shortAddress}`}
        className='grid h-4 w-4 place-items-center text-white/28 outline-none transition-colors hover:text-white/68 focus-visible:text-white/76'
      >
        {copied ? <Check size={10.5} strokeWidth={2.2} className='text-[#5FF3A6]' aria-hidden /> : <Copy size={10.5} strokeWidth={1.9} aria-hidden />}
      </button>
    </span>
  );
}

type WalletAssetState = 'idle' | 'adding';
type InjectedWalletProvider = { request: (args: { method: string; params?: unknown }) => Promise<unknown> };

function smoothCenterPreviewElement(element: HTMLElement, duration = 720) {
  let scrollParent: HTMLElement | null = element.parentElement;
  while (scrollParent) {
    const overflowY = window.getComputedStyle(scrollParent).overflowY;
    if (/(auto|scroll|overlay)/.test(overflowY) && scrollParent.scrollHeight > scrollParent.clientHeight + 1) break;
    scrollParent = scrollParent.parentElement;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    element.scrollIntoView({ behavior: 'auto', block: 'center' });
    return () => {};
  }

  const startTop = scrollParent ? scrollParent.scrollTop : window.scrollY;
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

  const targetTop = () => {
    const rect = element.getBoundingClientRect();
    if (scrollParent) {
      const parentRect = scrollParent.getBoundingClientRect();
      const maxTop = Math.max(0, scrollParent.scrollHeight - scrollParent.clientHeight);
      const top = scrollParent.scrollTop + rect.top - parentRect.top + rect.height / 2 - scrollParent.clientHeight / 2;
      return Math.min(maxTop, Math.max(0, top));
    }
    const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const top = window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2;
    return Math.min(maxTop, Math.max(0, top));
  };

  const animate = (now: number) => {
    if (cancelled) return;
    startedAt ??= now;
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    const nextTop = startTop + (targetTop() - startTop) * eased;
    if (scrollParent) scrollParent.scrollTop = nextTop;
    else window.scrollTo(0, nextTop);
    if (progress < 1) frame = window.requestAnimationFrame(animate);
    else stop();
  };

  window.addEventListener('wheel', stop, { passive: true });
  window.addEventListener('touchstart', stop, { passive: true });
  window.addEventListener('pointerdown', stop, { passive: true });
  window.addEventListener('keydown', stop);
  frame = window.requestAnimationFrame(animate);
  return stop;
}

function UserRewardsPanel({ assets, payments, compact = false }: { assets: FeeEngineAsset[]; payments: FeeEngineRewardPayment[]; compact?: boolean }) {
  const [assetStates, setAssetStates] = useState<Record<string, WalletAssetState>>({});
  const [addingAll, setAddingAll] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const centerTimeoutRef = useRef<number | null>(null);
  const cancelCenterRef = useRef<(() => void) | null>(null);
  const detailId = useId();
  const assetMap = useMemo(() => new Map(assets.map((asset) => [asset.id, asset])), [assets]);
  const paidAssets = useMemo(() => payments.flatMap((payment) => {
    const asset = assetMap.get(payment.assetId);
    return asset ? [{ asset, payment }] : [];
  }), [assetMap, payments]);
  const importableAssets = paidAssets.filter(({ asset }) => /^0x[\da-f]{40}$/i.test(asset.address ?? ''));
  const totalUsd = paidAssets.reduce((sum, { payment }) => sum + (payment.usdValue ?? 0), 0);
  const previewAssets = paidAssets.length ? paidAssets.map(({ asset }) => asset) : assets;

  const toggleExpanded = () => {
    const willOpen = !expanded;
    setExpanded(willOpen);
    if (!willOpen) return;
    if (centerTimeoutRef.current !== null) window.clearTimeout(centerTimeoutRef.current);
    cancelCenterRef.current?.();
    centerTimeoutRef.current = window.setTimeout(() => {
      if (toggleRef.current) cancelCenterRef.current = smoothCenterPreviewElement(toggleRef.current);
      centerTimeoutRef.current = null;
    }, 60);
  };

  useEffect(() => () => {
    if (centerTimeoutRef.current !== null) window.clearTimeout(centerTimeoutRef.current);
    cancelCenterRef.current?.();
  }, []);

  const addAsset = async (asset: FeeEngineAsset) => {
    const address = asset.address;
    if (!address || !/^0x[\da-f]{40}$/i.test(address)) return false;
    setAssetStates((current) => ({ ...current, [asset.id]: 'adding' }));
    try {
      const provider = (window as unknown as { ethereum?: InjectedWalletProvider }).ethereum;
      if (!provider) throw new Error('No injected wallet available');
      const image = asset.icon ? new URL(asset.icon, window.location.origin).href : undefined;
      const accepted = await provider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address,
            symbol: asset.symbol,
            decimals: asset.decimals ?? 18,
            ...(image ? { image } : {}),
          },
        },
      });
      const added = accepted !== false;
      setAssetStates((current) => ({ ...current, [asset.id]: 'idle' }));
      return added;
    } catch {
      setAssetStates((current) => ({ ...current, [asset.id]: 'idle' }));
      return false;
    }
  };

  const addAllAssets = async () => {
    if (addingAll) return;
    setAddingAll(true);
    for (const { asset } of importableAssets) {
      const added = await addAsset(asset);
      if (!added) break;
    }
    setAddingAll(false);
  };

  return (
    <section className='mt-3.5 rounded-[16px] border border-[#D4AF37]/20 bg-[linear-gradient(135deg,rgba(212,175,55,0.075),rgba(255,255,255,0.012)_46%,rgba(212,175,55,0.025))] p-2.5 shadow-[inset_0_1px_0_rgba(255,231,153,0.035)]' aria-label='Your rewards'>
      <button
        ref={toggleRef}
        type='button'
        aria-expanded={expanded}
        aria-controls={detailId}
        onClick={toggleExpanded}
        className='group flex w-full min-w-0 items-center gap-2 rounded-[11px] px-1 py-0.5 text-left outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37]/35'
      >
        <span className='grid h-8 w-8 shrink-0 place-items-center rounded-[10px] border border-[#D4AF37]/22 bg-[#D4AF37]/[0.075] text-[#FFE28A]/82'>
          <Coins size={14} strokeWidth={1.8} aria-hidden />
        </span>
        <span className={`min-w-0 flex-1 ${compact ? '' : 'sm:flex sm:items-center sm:gap-2'}`}>
          <span className='block shrink-0 text-[13px] font-medium tracking-[-0.005em] text-[#FFF0B7]/88'>Your rewards</span>
          <span className={`mt-1 flex min-w-0 items-center justify-between gap-2 ${compact ? '' : 'sm:mt-0 sm:flex-1'}`}>
            <span className='isolate flex min-w-0 items-center -space-x-2' aria-hidden>
              {previewAssets.slice(0, compact ? 5 : 8).map((asset, index) => (
                <span key={asset.id} className='relative rounded-full ring-2 ring-[#15150f]' style={{ zIndex: 8 - index }}>
                  <AssetIcon asset={asset} size={21} />
                </span>
              ))}
              {previewAssets.length > (compact ? 5 : 8) ? <span className='relative z-[30] grid h-[21px] min-w-[21px] place-items-center rounded-full border border-[#D4AF37]/32 bg-[#211d0d] px-1 text-[8.5px] font-semibold tabular-nums text-[#FFE28A]/92 ring-2 ring-[#15150f]'>+{previewAssets.length - (compact ? 5 : 8)}</span> : null}
            </span>
            <span className='ml-auto inline-flex shrink-0 items-center gap-1.5'>
              {paidAssets.length ? (
                <span className='inline-flex items-baseline gap-1.5 whitespace-nowrap sm:block'>
                  <span className='text-[7.5px] font-semibold uppercase tracking-[0.08em] text-[#FFE082]/42 sm:hidden'>Total paid</span>
                  <span className='text-[10.5px] font-medium tabular-nums text-[#FFE082]/74'>{formatUsd(totalUsd)}<span className='hidden sm:inline'> paid</span></span>
                </span>
              ) : (
                <span className='inline-flex items-center gap-1.5 text-[10px] font-medium text-[#FFE082]/60'>
                  <span className='h-2.5 w-2.5 animate-spin rounded-full border border-[#D4AF37]/50 border-r-transparent' aria-hidden />
                  Pending
                </span>
              )}
              <ChevronDown className={`h-3.5 w-3.5 text-[#FFE082]/46 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} strokeWidth={1.8} aria-hidden />
            </span>
          </span>
        </span>
      </button>

      {expanded ? (
        <div id={detailId} className='mt-2.5 border-t border-[#D4AF37]/14 px-1 pt-2.5'>
          <div className='flex items-center justify-between gap-3'>
            <p className='text-[11px] font-light leading-4 tracking-[0.008em] text-white/48'>{paidAssets.length ? 'Assets delivered to your connected wallet' : 'Your received assets will appear here after the first rewards payout.'}</p>
            {importableAssets.length ? (
              <span className='flex shrink-0 items-center gap-0.5'>
                <HelperTip text='Import assets to your wallet.' label='About wallet imports' align='right' compact />
                <button
                  type='button'
                  onClick={() => void addAllAssets()}
                  disabled={addingAll}
                  aria-label='Add all reward assets to wallet'
                  className='inline-flex h-5 items-center gap-1.5 px-0.5 text-[9.5px] font-semibold text-[#FFE28A]/68 outline-none transition-colors hover:text-[#FFF0B7] focus-visible:rounded-sm focus-visible:ring-1 focus-visible:ring-[#D4AF37]/40 disabled:cursor-wait disabled:opacity-55'
                >
                  {addingAll ? (
                    <span className='h-3 w-3 animate-spin rounded-full border border-current border-r-transparent' aria-hidden />
                  ) : (
                    <span className='relative inline-flex' aria-hidden>
                      <Wallet size={12} strokeWidth={1.8} />
                      <Plus size={7} strokeWidth={2.4} className='absolute -right-1 -top-1' />
                    </span>
                  )}
                  Add all
                </button>
              </span>
            ) : null}
          </div>

          {paidAssets.length ? (
            <div className={`mt-2.5 grid grid-cols-2 gap-1.5 ${compact ? '' : 'sm:grid-cols-4'}`}>
              {paidAssets.map(({ asset, payment }) => {
                const state = assetStates[asset.id] ?? 'idle';
                const importable = /^0x[\da-f]{40}$/i.test(asset.address ?? '');
                return (
                  <button
                    key={asset.id}
                    type='button'
                    disabled={!importable || state === 'adding'}
                    onClick={() => void addAsset(asset)}
                    aria-label={importable ? `Add ${asset.symbol} to wallet` : `${asset.symbol} cannot be added to this wallet`}
                    className='group flex min-w-0 flex-col gap-2 rounded-[11px] border border-white/[0.075] bg-[#0b0d0c]/75 px-2 py-2 text-left outline-none transition-[border-color,background-color] hover:border-[#D4AF37]/22 hover:bg-[#D4AF37]/[0.04] focus-visible:border-[#D4AF37]/32 focus-visible:ring-1 focus-visible:ring-[#D4AF37]/25 disabled:cursor-default disabled:opacity-64'
                  >
                    <span className='flex w-full min-w-0 items-center gap-1.5'>
                      <AssetIcon asset={asset} size={23} />
                      <span className='min-w-0 flex-1'>
                        <span className='block truncate text-[10.5px] font-medium text-white/80'>{asset.symbol}</span>
                        <span className='mt-0.5 block truncate text-[8.5px] text-white/42'>{asset.name}</span>
                      </span>
                    </span>
                    <span className='flex w-full min-w-0 items-end justify-between gap-1.5'>
                      <span className='min-w-0'>
                        <span className='block truncate text-[9.5px] font-medium tabular-nums text-[#FFE28A]/80'>{formatRewardAmount(payment.amount)}</span>
                        {payment.usdValue !== undefined ? <span className='mt-0.5 block text-[8.5px] tabular-nums text-white/44'>{formatUsd(payment.usdValue)}</span> : null}
                      </span>
                      <span className='relative inline-flex h-4 w-4 shrink-0 items-center justify-center text-white/38 group-hover:text-[#FFE28A]/88' aria-hidden>
                        {state === 'adding' ? (
                          <span className='h-3 w-3 animate-spin rounded-full border border-current border-r-transparent' />
                        ) : (
                          <span className='relative inline-flex'>
                            <Wallet size={12} strokeWidth={1.8} />
                            <Plus size={7} strokeWidth={2.4} className='absolute -right-1 -top-1' />
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className='mt-2.5 flex items-center gap-2 rounded-[11px] border border-[#D4AF37]/14 bg-[#D4AF37]/[0.035] px-3 py-2.5'>
              <span className='h-3 w-3 animate-spin rounded-full border border-[#D4AF37]/55 border-r-transparent' aria-hidden />
              <span className='text-[10.5px] font-medium text-[#FFE082]/62'>Pending the first rewards distribution</span>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}

function BasketDetails({ route, color, compact = false, viewerWalletShare }: { route: FeeEngineRoute; color: string; compact?: boolean; viewerWalletShare?: number }) {
  const autoOpenAssetLimit = compact ? 2 : 4;
  const assets = route.assets ?? [];
  const rotating = route.distributionMode !== 'all';
  const activeAssetId = route.currentAssetId ?? route.nextAssetId;
  const cursorIndex = rotating && activeAssetId ? assets.findIndex((asset) => asset.id === activeAssetId) : -1;
  const orderedAssets = cursorIndex > 0 ? [...assets.slice(cursorIndex), ...assets.slice(0, cursorIndex)] : assets;
  const [expanded, setExpanded] = useState(() => assets.length <= autoOpenAssetLimit);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const centerTimeoutRef = useRef<number | null>(null);
  const cancelCenterRef = useRef<(() => void) | null>(null);
  const manuallyToggledRef = useRef(false);
  const detailId = useId();
  const thresholdTipId = useId();
  const threshold = route.minimumWalletShare;
  const displayedWalletShare = viewerWalletShare ?? 0;
  const hasWalletShare = viewerWalletShare !== undefined && threshold !== undefined;
  const eligible = viewerWalletShare !== undefined && threshold !== undefined && viewerWalletShare >= threshold;
  const rawRatios = orderedAssets.map((asset) => Math.max(0, asset.weight ?? 0));
  const ratioTotal = rawRatios.reduce((sum, ratio) => sum + ratio, 0);
  const ratios = rotating
    ? orderedAssets.map(() => 100 / Math.max(orderedAssets.length, 1))
    : rawRatios.map((ratio) => ratioTotal > 0 ? (ratio / ratioTotal) * 100 : 100 / Math.max(orderedAssets.length, 1));
  const modeLabel = rotating ? 'Rotating' : 'All at once';
  const modeCopy = rotating
    ? 'Pays Current first, Next second, then the remaining assets in order.'
    : 'Pays every asset in the same distribution using the percentages shown above.';
  const toggleExpanded = () => {
    const willOpen = !expanded;
    manuallyToggledRef.current = true;
    setExpanded(willOpen);
    if (!willOpen) return;
    if (centerTimeoutRef.current !== null) window.clearTimeout(centerTimeoutRef.current);
    cancelCenterRef.current?.();
    centerTimeoutRef.current = window.setTimeout(() => {
      if (containerRef.current) cancelCenterRef.current = smoothCenterPreviewElement(containerRef.current);
      centerTimeoutRef.current = null;
    }, 60);
  };

  useEffect(() => {
    if (!manuallyToggledRef.current) setExpanded(assets.length <= autoOpenAssetLimit);
  }, [assets.length, autoOpenAssetLimit]);

  useEffect(() => () => {
    if (centerTimeoutRef.current !== null) window.clearTimeout(centerTimeoutRef.current);
    cancelCenterRef.current?.();
  }, []);

  if (!assets.length) {
    return <p className='mt-3 rounded-[12px] border border-dashed border-white/[0.10] px-3 py-2.5 text-[12px] text-white/54'>No payout assets selected.</p>;
  }

  return (
    <div ref={containerRef} className='mt-3 border-t border-white/[0.075] pt-3'>
      <div className='group/basket relative'>
        <button
          type='button'
          aria-expanded={expanded}
          aria-controls={detailId}
          aria-describedby={route.minimumWalletShare !== undefined ? thresholdTipId : undefined}
          aria-label={`${expanded ? 'Collapse' : 'Expand'} basket payouts. ${modeLabel} mode${hasWalletShare ? `. Wallet ${eligible ? 'is eligible' : 'is not eligible'} for rewards` : ''}`}
          onClick={toggleExpanded}
          className='flex w-full min-w-0 items-center gap-2 rounded-[10px] py-0.5 text-left outline-none focus-visible:ring-1 focus-visible:ring-white/15'
        >
          <span className='shrink-0 text-[10.5px] font-medium uppercase tracking-[0.13em] text-white/50'>Basket payouts</span>
          {orderedAssets.length > autoOpenAssetLimit ? (
            <span className='isolate flex min-w-0 items-center -space-x-2' aria-hidden>
              {orderedAssets.slice(0, compact ? 5 : 8).map((asset, index) => (
                <span key={asset.id} className='relative rounded-full ring-2 ring-[#0d0f0e] transition-transform duration-200 group-hover/basket:-translate-y-0.5' style={{ zIndex: 8 - index }}>
                  <AssetIcon asset={asset} size={23} />
                </span>
              ))}
              {orderedAssets.length > (compact ? 5 : 8) ? (
                <span className='relative z-[30] grid h-[23px] min-w-[23px] place-items-center rounded-full border border-[#D4AF37]/32 bg-[#211d0d] px-1 text-[8.5px] font-semibold tabular-nums text-[#FFE28A]/92 ring-2 ring-[#0d0f0e]'>+{orderedAssets.length - (compact ? 5 : 8)}</span>
              ) : null}
            </span>
          ) : null}
          <span className='ml-auto inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold tracking-[-0.01em] text-white/36'>
            {route.minimumWalletShare !== undefined ? (
              <span className='group/threshold relative inline-flex items-center gap-1.5'>
                <span className='inline-flex items-center gap-1'>
                  <Wallet size={10} strokeWidth={1.75} className='text-white/27' aria-hidden />
                  <span className='tabular-nums' style={{ color }}>{formatPercent(route.minimumWalletShare)}</span>
                </span>
                {hasWalletShare ? (
                  eligible ? <Check size={10} strokeWidth={2.25} className='text-[#5ee9b3]/78' aria-hidden /> : <X size={9.5} strokeWidth={2.15} className='text-[#ff6b93]/72' aria-hidden />
                ) : null}
                <span id={thresholdTipId} role='tooltip' className='pointer-events-none absolute bottom-[calc(100%+8px)] right-0 z-50 w-[min(238px,calc(100vw-32px))] rounded-[11px] border border-white/[0.11] bg-[#111312]/[0.98] px-3 py-2.5 text-left text-[11px] font-normal normal-case leading-[1.5] tracking-normal text-white/72 opacity-0 shadow-[0_14px_34px_rgba(0,0,0,0.52)] backdrop-blur-xl transition-opacity duration-150 group-hover/threshold:opacity-100'>
                  {hasWalletShare ? eligible ? (
                    <>Your wallet holds <strong className='font-semibold text-[#5ee9b3]'>{formatWalletShare(displayedWalletShare)}</strong> of supply. You meet the <strong className='font-semibold text-white/84'>{formatPercent(route.minimumWalletShare)}</strong> minimum and will receive basket payouts.</>
                  ) : (
                    <>Your wallet holds <strong className='font-semibold text-[#ff789c]'>{formatWalletShare(displayedWalletShare)}</strong> of supply. Hold at least <strong className='font-semibold text-white/84'>{formatPercent(route.minimumWalletShare)}</strong> to receive basket payouts.</>
                  ) : <>Hold at least <strong className='font-semibold text-white/84'>{formatPercent(route.minimumWalletShare)}</strong> of the token supply to receive basket payouts.</>}
                </span>
              </span>
            ) : null}
            <ChevronDown className={`ml-0.5 h-3.5 w-3.5 text-white/32 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} strokeWidth={1.8} aria-hidden />
          </span>
        </button>
      </div>

      <div id={detailId} className='grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(.22,1,.36,1)]' style={{ gridTemplateRows: expanded ? '1fr' : '0fr', opacity: expanded ? 1 : 0 }} aria-hidden={!expanded} inert={!expanded}>
        <div className='min-h-0 overflow-hidden'>
          <div className={`mt-2 grid grid-cols-2 gap-1.5 ${compact ? '' : 'sm:grid-cols-4'}`}>
            {orderedAssets.map((asset, index) => {
              const ratio = ratios[index] ?? 0;
              const current = rotating && index === 0;
              const next = rotating && index === 1;
              return (
                <div
                  key={asset.id}
                  className={`min-w-0 rounded-[10px] border px-2 py-1.5 transition-[border-color,background-color,box-shadow] ${current ? '' : next ? 'border-white/[0.11] bg-white/[0.018]' : 'border-white/[0.065] bg-[#0a0c0b]'}`}
                  style={current ? { borderColor: colorWithAlpha(color, 0.38), background: `linear-gradient(105deg, ${colorWithAlpha(color, 0.08)}, rgba(10,12,11,0.98) 72%)`, boxShadow: `inset 2px 0 0 ${color}` } : undefined}
                  aria-label={`${asset.name}, ${formatPercent(ratio)} payout ratio${current ? ', current' : next ? ', next' : ''}`}
                >
                  <div className='flex min-w-0 items-center gap-1.5'>
                    <AssetIcon asset={asset} size={22} />
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-[10px] font-medium text-white/82'>{asset.symbol}</p>
                      <p className='truncate text-[9px] leading-3.5 text-white/46'>{asset.name}</p>
                    </div>
                    <div className='shrink-0 text-right'>
                      <p className='text-[9.5px] font-medium tabular-nums text-white/66'>{formatPercent(ratio)}</p>
                      {current ? <p className='text-[8px] font-medium uppercase tracking-[0.09em]' style={{ color }}>Current</p> : next ? <p className='text-[8px] font-medium uppercase tracking-[0.09em] text-white/46'>Next</p> : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className='mt-2 border-t border-white/[0.06] px-0.5 pt-2 text-left'>
            <div className='flex items-baseline gap-2'>
              <span className='text-[9.5px] font-medium uppercase tracking-[0.12em] text-white/38'>Payout mode</span>
              <span className='text-[9.5px] font-medium uppercase tracking-[0.12em]' style={{ color }}>{modeLabel}</span>
            </div>
            <p className={`mt-1 min-w-0 text-[10.5px] font-light leading-4 tracking-[0.008em] text-white/48 ${compact ? '' : 'sm:whitespace-nowrap'}`}>{modeCopy}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeeRouteRow({ route, maxTotal, compact = false, viewerWalletShare }: { route: FeeEngineRoute; maxTotal: number; compact?: boolean; viewerWalletShare?: number }) {
  const meta = KIND_META[route.kind];
  const Icon = meta.icon;
  const color = route.color || meta.fallback;
  const assets = route.assets ?? [];
  const singleAsset = assets.length === 1 ? assets[0] : null;

  return (
    <article className='rounded-[17px] border border-white/[0.085] bg-[#0d0f0e] px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.022)] transition-[border-color,background-color] duration-200 hover:border-white/[0.13] hover:bg-[#0f1110]'>
      <div className='flex min-w-0 items-start justify-between gap-3'>
        <div className='flex min-w-0 items-start gap-2.5'>
          <span className='grid h-8 w-8 shrink-0 place-items-center rounded-[10px] border border-white/[0.095] bg-white/[0.025]' style={{ color }}>
            <Icon size={14} strokeWidth={1.9} aria-hidden />
          </span>
          <div className='min-w-0 pt-px'>
            <div className='flex min-w-0 flex-wrap items-center gap-1.5'>
              <p className='text-[13.5px] font-medium tracking-[-0.005em] text-white/86'>{route.label}</p>
              {route.recipientAddress ? <RecipientAddress address={route.recipientAddress} explorerUrl={route.recipientExplorerUrl} /> : null}
            </div>
            {route.detail ? (
              <div className='mt-1 flex min-w-0 max-w-[410px] items-center gap-1.5'>
                <p className='min-w-0 truncate text-[11px] font-light leading-4 tracking-[0.008em] text-white/48'>{route.detail}</p>
                {route.minimumWalletShare !== undefined && assets.length <= 1 ? <EligibilityThreshold value={route.minimumWalletShare} color={color} viewerWalletShare={viewerWalletShare} /> : null}
              </div>
            ) : null}
            {route.metadata ? <p className='mt-1 text-[10.5px] font-light tabular-nums tracking-[0.008em] text-white/46'>{route.metadata}</p> : null}
          </div>
        </div>
        <span className='shrink-0 px-1 py-1 text-[11.5px] font-medium tabular-nums tracking-[-0.005em]' style={{ color }}>{formatPercent(route.percent)}</span>
      </div>

      <div className='mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.075]' role='progressbar' aria-label={`${route.label} fee`} aria-valuemin={0} aria-valuemax={maxTotal} aria-valuenow={route.percent} aria-valuetext={`${formatPercent(route.percent)} of the ${maxTotal}% maximum fee`}>
        <div className='h-full rounded-full transition-[width] duration-500 ease-out' style={{ width: `${clamp((route.percent / maxTotal) * 100, 0, 100)}%`, background: `linear-gradient(90deg, ${color}, ${colorWithAlpha(color, 0.72)})`, boxShadow: `0 0 10px ${colorWithAlpha(color, 0.14)}` }} />
      </div>

      {singleAsset ? (
        <div className='mt-2.5 flex items-center justify-between gap-3 border-t border-white/[0.065] pt-2.5'>
          <span className='text-[10px] font-medium uppercase tracking-[0.12em] text-white/46'>Payout asset</span>
          <span className='flex items-center gap-1.5 text-[11px] font-medium text-white/72'><AssetIcon asset={singleAsset} size={20} /> {singleAsset.symbol}</span>
        </div>
      ) : null}
      {assets.length > 1 ? <BasketDetails route={route} color={color} compact={compact} viewerWalletShare={viewerWalletShare} /> : null}
      {route.kind === 'basket' && assets.length === 0 ? <BasketDetails route={route} color={color} compact={compact} viewerWalletShare={viewerWalletShare} /> : null}
    </article>
  );
}

export default function FeeEngineCard({
  routes,
  maxTotal = 10,
  accruedAmount = 0,
  distributionThreshold = 0.05,
  settlementAsset = 'ETH',
  totalPaidOut = 0,
  lastPayoutAt = null,
  payoutCount = 0,
  viewerRewardPayments = [],
  viewerWalletShare,
  className = '',
  hideHeader = false,
  headerInfo,
  headerAction,
  compact = false,
}: FeeEngineCardProps) {
  const activeRoutes = useMemo(() => routes.filter((route, index, source) => route.percent > 0 && source.findIndex((candidate) => candidate.id === route.id) === index), [routes]);
  const rewardAssets = useMemo(() => {
    const seen = new Set<string>();
    return activeRoutes
      .filter((route) => route.kind === 'basket' || route.kind === 'rewards')
      .flatMap((route) => route.assets ?? [])
      .filter((asset) => {
        if (seen.has(asset.id)) return false;
        seen.add(asset.id);
        return true;
      });
  }, [activeRoutes]);
  const total = activeRoutes.reduce((sum, route) => sum + route.percent, 0);
  const totalFill = maxTotal > 0 ? clamp((total / maxTotal) * 100, 0, 100) : 0;
  const distributionProgress = distributionThreshold > 0 ? clamp((accruedAmount / distributionThreshold) * 100, 0, 100) : 0;
  const feeGradient = activeRoutes.length
    ? featheredFeeGradient(activeRoutes.map((route) => ({ weight: (route.percent / Math.max(total, 0.0001)) * 100, color: route.color })))
    : 'transparent';
  const distributionReady = distributionThreshold > 0 && accruedAmount >= distributionThreshold;

  return (
    <section className={`relative isolate w-full rounded-[23px] border border-white/[0.105] bg-[#0a0c0b] p-4 shadow-[0_28px_70px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.026)] sm:p-[18px] ${className}`} aria-label='Fee builder preview'>
      <style>{`
        @keyframes feeEngineSheen{0%,58%{transform:translateX(-150%);opacity:0}66%{opacity:.28}84%,100%{transform:translateX(380%);opacity:0}}
        .feeEngineSheen{animation:feeEngineSheen 7.5s cubic-bezier(.22,1,.36,1) infinite}
        @media(prefers-reduced-motion:reduce){.feeEngineSheen{animation:none}}
      `}</style>

      {!hideHeader ? (
        <header className={`flex items-center justify-between ${compact ? 'gap-2.5' : 'gap-4'}`}>
          <div className='flex min-w-0 items-center gap-2.5'>
            <span className={`grid shrink-0 place-items-center border border-white/[0.10] bg-white/[0.025] text-white/58 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] ${compact ? 'h-8 w-8 rounded-[10px]' : 'h-9 w-9 rounded-[11px]'}`}>
              <Gauge size={compact ? 14 : 15} strokeWidth={1.8} aria-hidden />
            </span>
            <div className='min-w-0'>
              <div className='flex min-w-0 items-center gap-1'>
                <h3 className={`truncate font-medium tracking-[-0.008em] text-white/90 ${compact ? 'text-[13.5px]' : 'text-[15.5px]'}`}>Fee Builder</h3>
                {headerInfo ? <HelperTip text={headerInfo} label='About the Fee Builder' align={compact ? 'center' : 'left'} compact icon='info' placement='bottom' wide panel={compact} /> : null}
              </div>
              <p className={`mt-0.5 whitespace-nowrap font-light tracking-[0.012em] text-white/46 ${compact ? 'text-[9.5px] leading-[1.35]' : 'text-[12px] leading-[1.5]'}`}>Configured fee routes and trading mechanics</p>
            </div>
          </div>
          <div className='inline-flex shrink-0 items-center gap-2'>
            <div className={`inline-flex shrink-0 items-baseline border-l border-white/[0.08] pl-3 ${compact ? 'gap-1.5' : 'gap-2'}`}>
              <span className={`font-normal text-white/42 ${compact ? 'text-[9px]' : 'text-[10px]'}`}>Total fee</span>
              <p className={`font-medium tracking-[-0.015em] tabular-nums text-white/82 ${compact ? 'text-[14px]' : 'text-[16px]'}`}>{formatPercent(total)}</p>
            </div>
            {headerAction}
          </div>
        </header>
      ) : null}

      <div className={hideHeader ? '' : 'mt-3.5'}>
        <div className='h-2.5 overflow-hidden rounded-full border border-white/[0.055] bg-white/[0.075]' role='progressbar' aria-label='Total configured fee' aria-valuemin={0} aria-valuemax={maxTotal} aria-valuenow={total} aria-valuetext={`${formatPercent(total)} of ${formatPercent(maxTotal)}`}>
          <div className='relative h-full overflow-hidden rounded-full transition-[width] duration-500 ease-out' style={{ width: `${totalFill}%`, background: feeGradient, boxShadow: '0 0 18px rgba(95,243,166,0.08)' }}>
            <span className='feeEngineSheen absolute -inset-y-1 left-0 w-1/3 rotate-[14deg] bg-gradient-to-r from-transparent via-white/45 to-transparent blur-[1px]' aria-hidden />
          </div>
        </div>
        <div className='mt-1.5 flex justify-between px-px text-[10px] font-medium tabular-nums text-white/46' aria-hidden>
          <span>0</span><span>{maxTotal * 0.25}</span><span>{maxTotal * 0.5}</span><span>{maxTotal * 0.75}</span><span>{maxTotal}</span>
        </div>
      </div>

      <div className='mt-4 border-t border-white/[0.075] pt-4'>
        <div className='mb-2.5 flex items-center justify-between gap-3 px-0.5'>
          <p className='text-[10px] font-medium uppercase tracking-[0.14em] text-white/50'>Fee routes</p>
          <span className='text-[10px] font-normal tabular-nums text-white/42'>{activeRoutes.length} active</span>
        </div>
        <div className='space-y-2'>
          {activeRoutes.length ? activeRoutes.map((route) => <FeeRouteRow key={route.id} route={route} maxTotal={maxTotal} compact={compact} viewerWalletShare={viewerWalletShare} />) : (
            <div className='rounded-[17px] border border-dashed border-white/[0.10] bg-white/[0.012] px-3 py-5 text-center'>
              <p className='text-[12.5px] font-medium text-white/68'>No fee routes configured</p>
              <p className='mt-1 text-[11px] font-light tracking-[0.008em] text-white/46'>Add a route to preview the token-page Fee Builder.</p>
            </div>
          )}
        </div>
      </div>

      <div className='mt-5 border-t border-white/[0.075] pt-4'>
        <div className='flex items-center justify-between gap-3'>
          <div className='flex min-w-0 items-center gap-2.5'>
            <span className='grid h-9 w-9 shrink-0 place-items-center rounded-[11px] border border-white/[0.09] bg-white/[0.02] text-white/50'><Activity size={14.5} strokeWidth={1.8} aria-hidden /></span>
            <div className='min-w-0'>
              <div className='flex items-center gap-0.5'>
                <p className='text-[13.5px] font-medium tracking-[-0.005em] text-white/84'>Distribution progress</p>
                <HelperTip text='Collected settlement assets are distributed automatically when the configured trigger is reached.' label='About distribution progress' compact />
              </div>
              <p className='mt-0.5 text-[11.5px] font-light leading-4 tracking-[0.008em] text-white/50'>Triggers payout across configured routes.</p>
            </div>
          </div>
          <div className='shrink-0 text-right'>
            <p className='text-[12.5px] font-medium tabular-nums text-white/76'>{distributionReady ? 'Ready' : formatPercent(distributionProgress)}</p>
            <p className='mt-0.5 text-[9px] font-medium uppercase tracking-[0.12em] text-white/42'>Automatic</p>
          </div>
        </div>

        <div className='mt-3'>
          <div className='mb-1.5 flex items-center justify-between gap-3 text-[11px] text-white/56'>
            <span>Next payout</span>
            <span className='tabular-nums text-white/52'>{formatAmount(accruedAmount)} / {formatAmount(distributionThreshold)} {settlementAsset}</span>
          </div>
          <div className='h-1.5 overflow-hidden rounded-full bg-white/[0.075]' role='progressbar' aria-label='Distribution trigger progress' aria-valuemin={0} aria-valuemax={distributionThreshold} aria-valuenow={Math.min(accruedAmount, distributionThreshold)} aria-valuetext={`${formatPercent(distributionProgress)} collected toward the next automatic payout`}>
            <div className='h-full rounded-full bg-gradient-to-r from-[#00e38c] via-[#72f5b0] to-[#67e8f9] transition-[width] duration-500 ease-out' style={{ width: `${distributionProgress}%` }} />
          </div>
        </div>

        <dl className={`mt-3 grid items-start divide-x divide-white/[0.07] rounded-[13px] border border-white/[0.075] bg-white/[0.012] py-2.5 ${compact ? 'grid-cols-[1.15fr_1fr_.72fr]' : 'grid-cols-3'}`}>
          <div className='min-w-0 px-2.5'>
            <dt className='flex h-4 items-center text-[9.5px] font-medium uppercase tracking-[0.09em] text-white/42'>Last payout</dt>
            <dd className='mt-1 truncate text-[11.5px] font-medium text-white/72'>{lastPayoutAt ?? 'No payouts yet'}</dd>
          </div>
          <div className='min-w-0 px-2.5'>
            <dt className='flex h-4 items-center text-[9.5px] font-medium uppercase tracking-[0.09em] text-white/42'>Total paid</dt>
            <dd className='mt-1 truncate text-[11.5px] font-medium tabular-nums text-white/72'>{formatAmount(totalPaidOut)} {settlementAsset}</dd>
          </div>
          <div className='min-w-0 px-2.5'>
            <dt className='flex h-4 items-center text-[9.5px] font-medium uppercase tracking-[0.09em] text-white/42'>Payouts</dt>
            <dd className='mt-1 truncate text-[11.5px] font-medium tabular-nums text-white/72'>{payoutCount}</dd>
          </div>
        </dl>

        {rewardAssets.length ? <UserRewardsPanel assets={rewardAssets} payments={viewerRewardPayments} compact={compact} /> : null}
      </div>
    </section>
  );
}
