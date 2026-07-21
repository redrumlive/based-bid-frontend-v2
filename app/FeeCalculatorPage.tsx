"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  ArrowLeftRight,
  Code2,
  Coins,
  Crown,
  Droplets,
  Flame,
  Landmark,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import CreateBackLink from "./create/CreateBackLink";

type RouteKey = "creator" | "treasury" | "liquidity" | "rewards" | "buybacks" | "custom";
type PresetKey = "mixed" | "creator" | "balanced" | "rewards" | "cto";
type NetworkKey = "evm" | "solana";
type FeeState = Record<RouteKey, number>;

type RouteDefinition = {
  key: RouteKey;
  label: string;
  previewLabel?: string;
  description: string;
  icon: LucideIcon;
  emptyValue?: string;
};

const NETWORKS: Array<{ key: NetworkKey; label: string; maxFee: number }> = [
  { key: "evm", label: "EVM", maxFee: 10 },
  { key: "solana", label: "SOL", maxFee: 6 },
];

const ZERO_FEES: FeeState = { creator: 0, treasury: 0, liquidity: 0, rewards: 0, buybacks: 0, custom: 0 };

const PRESET_FEES: Record<PresetKey, FeeState> = {
  mixed: { creator: 3.1, treasury: 1.3, liquidity: 0.3, rewards: 1.7, buybacks: 1.2, custom: 0.1 },
  creator: { ...ZERO_FEES, creator: 3 },
  balanced: { ...ZERO_FEES, creator: 1, rewards: 1, buybacks: 1 },
  rewards: { ...ZERO_FEES, creator: 1, rewards: 4 },
  cto: { ...ZERO_FEES, rewards: 1, buybacks: 3 },
};

const PRESETS: Array<{ key: PresetKey; label: string }> = [
  { key: "mixed", label: "Mixed" },
  { key: "creator", label: "Creator-led" },
  { key: "balanced", label: "Balanced" },
  { key: "rewards", label: "Rewards" },
  { key: "cto", label: "CTO" },
];

const VOLUMES = [
  { label: "$100K", value: 100_000 },
  { label: "$1M", value: 1_000_000 },
  { label: "$10M", value: 10_000_000 },
  { label: "$100M", value: 100_000_000 },
  { label: "$1B", value: 1_000_000_000 },
] as const;

const ROUTES: RouteDefinition[] = [
  { key: "creator", label: "Creator Revenue", previewLabel: "Creator Wallet", description: "Direct revenue for the creator.", icon: Crown },
  { key: "treasury", label: "Treasury", description: "Funds growth and operations.", icon: Landmark },
  { key: "liquidity", label: "Liquidity", description: "Adds depth to the market.", icon: Droplets },
  { key: "rewards", label: "Holder Rewards", previewLabel: "Rewards", description: "Returns value to holders.", icon: Coins },
  { key: "buybacks", label: "Buybacks & Burns", description: "Automates buyback mechanics.", icon: Flame },
  { key: "custom", label: "Custom Routes", description: "Routes to any wallet.", icon: Code2, emptyValue: "Not set" },
];

const cloneFees = (fees: FeeState): FeeState => ({ ...fees });
const sumFees = (fees: FeeState) => Object.values(fees).reduce((sum, value) => sum + value, 0);
const formatPercent = (value: number) => `${value.toFixed(2)}%`;
const formatCurrency = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

function rebalanceFees(previous: FeeState, activeKey: RouteKey, requestedValue: number, maxTotal: number): FeeState {
  const next = cloneFees(previous);
  next[activeKey] = Math.max(0, Math.min(requestedValue, maxTotal));
  let overflow = sumFees(next) - maxTotal;
  let adjustable = (Object.keys(next) as RouteKey[]).filter((key) => key !== activeKey && next[key] > 0);

  while (overflow > 0.0001 && adjustable.length > 0) {
    const adjustableTotal = adjustable.reduce((sum, key) => sum + next[key], 0);
    if (adjustableTotal <= 0) break;
    adjustable.forEach((key) => {
      next[key] -= Math.min(next[key], (next[key] / adjustableTotal) * overflow);
    });
    overflow = sumFees(next) - maxTotal;
    adjustable = adjustable.filter((key) => next[key] > 0.0001);
  }

  return next;
}

function capFees(fees: FeeState, maxTotal: number): FeeState {
  const total = sumFees(fees);
  if (total <= maxTotal || total === 0) return cloneFees(fees);
  const scale = maxTotal / total;
  return (Object.keys(fees) as RouteKey[]).reduce((next, key) => {
    next[key] = Math.round(fees[key] * scale * 10) / 10;
    return next;
  }, cloneFees(ZERO_FEES));
}

export default function FeeCalculatorPage() {
  const [network, setNetwork] = useState<NetworkKey>("evm");
  const [fees, setFees] = useState<FeeState>(() => cloneFees(PRESET_FEES.mixed));
  const [preset, setPreset] = useState<PresetKey | null>("mixed");
  const [volume, setVolume] = useState(1_000_000);

  const maxFee = NETWORKS.find((item) => item.key === network)?.maxFee ?? 10;
  const total = useMemo(() => Math.min(sumFees(fees), maxFee), [fees, maxFee]);
  const available = Math.max(0, maxFee - total);
  const generated = volume * (total / 100);

  const updateFee = (key: RouteKey, value: number) => {
    setPreset(null);
    setFees((current) => rebalanceFees(current, key, value, maxFee));
  };

  const applyPreset = (key: PresetKey) => {
    setPreset(key);
    setFees(capFees(PRESET_FEES[key], maxFee));
  };

  const changeNetwork = (key: NetworkKey) => {
    const nextMax = NETWORKS.find((item) => item.key === key)?.maxFee ?? 10;
    setNetwork(key);
    setFees((current) => capFees(preset ? PRESET_FEES[preset] : current, nextMax));
  };

  return (
    <main className="min-h-[calc(100vh-100px)] bg-[#090a0a] px-4 pb-20 pt-5 text-white sm:px-6 lg:px-8 min-[1180px]:pb-4">
      <div className="mx-auto w-full max-w-[1280px]">
        <CreateBackLink href="/" />

        <section className="relative mt-3 overflow-hidden rounded-[26px] border border-white/10 bg-[#0c0e0d] shadow-[0_28px_90px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.025)] sm:mt-4 sm:rounded-[30px]">
          <header className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.075] px-4 py-4 sm:px-5 lg:px-6">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <h1 className="text-[19px] font-semibold tracking-[-0.035em] text-white/92 sm:text-[22px]">Fee calculator</h1>
                <span className="rounded-full border border-[rgba(212,175,55,0.34)] bg-[rgba(212,175,55,0.045)] px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.16em] text-[rgba(255,224,130,0.78)]">Signature</span>
              </div>
              <p className="mt-1 text-[10px] text-white/40 sm:text-[11px]">Configure routes and project earnings from the trading volume you generate.</p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="inline-grid grid-cols-2 rounded-full border border-white/10 bg-black/20 p-0.5" aria-label="Fee network">
                {NETWORKS.map((item) => (
                  <button key={item.key} type="button" aria-pressed={network === item.key} onClick={() => changeNetwork(item.key)} className={`min-w-[48px] rounded-full px-2.5 py-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] transition-colors ${network === item.key ? "bg-white/[0.11] text-white" : "text-white/38 hover:text-white/70"}`}>
                    {item.label}
                  </button>
                ))}
              </div>
              <span className="inline-flex h-8 w-[92px] shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-[rgba(212,175,55,0.26)] bg-[rgba(212,175,55,0.055)] text-[10px] font-medium uppercase tracking-[0.16em] text-[#FFE082]/72">Up to {maxFee}%</span>
            </div>
          </header>

          <div className="relative z-10 grid min-[1180px]:grid-cols-[0.82fr_1.18fr]">
            <div className="border-b border-white/[0.075] p-4 sm:p-5 min-[1180px]:border-b-0 min-[1180px]:border-r min-[1180px]:border-white/[0.075] lg:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[9px] font-medium">
                  <span className="uppercase tracking-[0.13em] text-white/34">Configured</span>
                  <span className="tabular-nums text-[#52dfb2]">{formatPercent(total)}</span>
                </div>
                <button type="button" onClick={() => { setPreset(null); setFees(cloneFees(ZERO_FEES)); }} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.025] px-3 text-[9px] font-medium text-white/42 transition hover:bg-white/[0.045] hover:text-white/72">
                  <RotateCcw size={11} strokeWidth={2} /> Reset
                </button>
              </div>

              <div className="mt-3 grid min-h-[40px] grid-cols-[0.82fr_1.28fr_1.08fr_0.98fr_0.72fr] items-center gap-1 rounded-[16px] border border-white/10 bg-white/[0.03] p-1">
                {PRESETS.map((item) => (
                  <button key={item.key} type="button" onClick={() => applyPreset(item.key)} className={`h-[30px] whitespace-nowrap rounded-[12px] border px-1 text-[8px] font-medium transition sm:text-[9px] ${preset === item.key ? "border-white/10 bg-white/[0.12] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]" : "border-transparent text-white/46 hover:text-white/78"}`}>
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="mt-3">
                <div className="mb-1.5 flex items-center justify-between text-[9px] font-medium text-white/48">
                  <span>Total {formatPercent(total)}</span>
                  <span>{formatPercent(available)} available</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#18c98e] via-lime-300 to-cyan-300 transition-all duration-500" style={{ width: `${(total / maxFee) * 100}%` }} />
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {ROUTES.map((route) => {
                  const Icon = route.icon;
                  const value = fees[route.key];
                  const sliderStyle = { "--fill": `${(value / maxFee) * 100}%` } as CSSProperties;
                  return (
                    <div key={route.key}>
                      <div className="mb-1 flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-[#52dfb2]"><Icon size={14} strokeWidth={2} /></span>
                          <span className="min-w-0">
                            <span className="block truncate text-[11px] font-medium text-white/78 sm:text-[12px]">{route.label}</span>
                            <span className="mt-0.5 block truncate text-[9px] text-white/32">{route.description}</span>
                          </span>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-medium tabular-nums text-white/78">{formatPercent(value)}</span>
                      </div>
                      <input type="range" min={0} max={maxFee} step={0.1} value={value} onChange={(event) => updateFee(route.key, Number(event.target.value))} className="deck-fee-slider" style={sliderStyle} aria-label={`${route.label} fee`} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative p-4 sm:p-5 lg:p-6">
              <div className="flex flex-col gap-3 border-b border-white/[0.075] pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-white/32">Trading volume</p>
                  <p className="mt-1 text-[20px] font-semibold tracking-[-0.035em] text-white/90">{formatCurrency(volume)}</p>
                </div>
                <div className="grid grid-cols-5 gap-1.5 sm:flex">
                  {VOLUMES.map((item) => (
                    <button key={item.value} type="button" onClick={() => setVolume(item.value)} className={`h-7 rounded-full border px-2 text-[8px] font-semibold uppercase tracking-[0.08em] transition sm:min-w-[48px] ${volume === item.value ? "border-[rgba(212,175,55,0.34)] bg-[rgba(212,175,55,0.10)] text-[rgba(255,224,130,0.88)]" : "border-white/10 bg-white/[0.025] text-white/42 hover:bg-white/[0.045] hover:text-white/70"}`}>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative mt-4 min-[1180px]:min-h-[476px]">
                <div className="relative z-20 w-full rounded-[21px] border border-white/10 bg-[#0b0d0c]/98 p-4 shadow-[0_18px_46px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.03)] min-[1180px]:absolute min-[1180px]:left-0 min-[1180px]:top-1/2 min-[1180px]:flex min-[1180px]:h-[236px] min-[1180px]:w-[212px] min-[1180px]:-translate-y-1/2 min-[1180px]:flex-col min-[1180px]:justify-between min-[1180px]:p-[18px]">
                  <div className="flex items-center justify-between gap-3 min-[1180px]:items-start">
                    <div>
                      <p className="text-[16px] font-semibold tracking-[-0.035em] text-white/90">Swap Fee</p>
                    </div>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-[#52dfb2]"><ArrowLeftRight size={14} strokeWidth={2} /></span>
                  </div>
                  <p className="mt-2 text-[10px] leading-[1.5] text-white/36">Applied on every swap and routed automatically. Fees accrue natively with no token sell-offs.</p>
                  <div className="mt-3 border-t border-white/[0.085] pt-3">
                    <p className="text-[8px] uppercase tracking-[0.14em] text-white/30">Generated</p>
                    <span className="mt-0.5 block text-[19px] font-semibold tracking-[-0.04em] text-[rgba(255,224,130,0.94)]">{formatCurrency(generated)}</span>
                  </div>
                </div>

                <FeeFlow />

                <div className="relative z-20 mt-3 grid gap-2 sm:grid-cols-2 min-[1180px]:absolute min-[1180px]:right-0 min-[1180px]:top-1/2 min-[1180px]:mt-0 min-[1180px]:w-[264px] min-[1180px]:-translate-y-1/2 min-[1180px]:!grid-cols-1 min-[1180px]:gap-2.5">
                  {ROUTES.map((route) => {
                    const value = fees[route.key];
                    const payout = value > 0 ? formatCurrency(volume * (value / 100)) : (route.emptyValue ?? "Not set");
                    return <PayoutRow key={route.key} route={route} percent={formatPercent(value)} payout={payout} />;
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style jsx global>{`
        .deck-fee-slider { appearance: none; -webkit-appearance: none; width: 100%; height: 6px; border-radius: 999px; background: linear-gradient(90deg,#18c98e 0%,#52dfb2 calc(var(--fill) * .58),#67e8f9 var(--fill),rgba(255,255,255,.12) var(--fill),rgba(255,255,255,.12) 100%); cursor: pointer; }
        .deck-fee-slider::-webkit-slider-runnable-track { height: 6px; background: transparent; border-radius: 999px; }
        .deck-fee-slider::-moz-range-track { height: 6px; background: transparent; border-radius: 999px; }
        .deck-fee-slider::-webkit-slider-thumb { appearance: none; -webkit-appearance: none; margin-top: -5px; width: 16px; height: 16px; border-radius: 999px; background: #6ee7b7; border: 3px solid #0b0f0e; box-shadow: 0 0 24px rgba(82,223,178,.45); }
        .deck-fee-slider::-moz-range-thumb { width: 16px; height: 16px; border-radius: 999px; background: #6ee7b7; border: 3px solid #0b0f0e; box-shadow: 0 0 24px rgba(82,223,178,.45); }
        .calculator-fee-flow-line { stroke-dasharray: 10 14; animation: calculatorFeeFlow 2s linear infinite; }
        @keyframes calculatorFeeFlow { from { stroke-dashoffset: 72; } to { stroke-dashoffset: 0; } }
        @media (max-width: 1179px) { .calculator-fee-flow { display: none; } }
      `}</style>
    </main>
  );
}

function FeeFlow() {
  const lines = [
    ["M184 225 C284 225,318 60,510 60 L600 60", "calculatorFlowGreen", "0s", 60, "#86efac"],
    ["M184 245 C294 245,336 156,510 156 L600 156", "calculatorFlowCyan", ".2s", 156, "#67e8f9"],
    ["M184 265 C312 265,360 252,510 252 L600 252", "calculatorFlowGreen", ".35s", 252, "#86efac"],
    ["M184 285 C326 285,390 348,600 348", "calculatorFlowCyan", ".5s", 348, "#67e8f9"],
    ["M184 305 C304 305,354 444,510 444 L600 444", "calculatorFlowGreen", ".7s", 444, "#86efac"],
    ["M184 325 C286 325,320 540,510 540 L600 540", "calculatorFlowCyan", ".85s", 540, "#67e8f9"],
  ] as const;

  return (
    <svg className="calculator-fee-flow pointer-events-none absolute inset-0 z-0 h-full w-full" viewBox="0 0 900 600" preserveAspectRatio="none" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="calculatorFlowGreen" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#18c98e" stopOpacity=".12" /><stop offset="42%" stopColor="#52dfb2" stopOpacity=".95" /><stop offset="100%" stopColor="#bef264" /></linearGradient>
        <linearGradient id="calculatorFlowCyan" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#14b8a6" stopOpacity=".12" /><stop offset="45%" stopColor="#2dd4bf" stopOpacity=".95" /><stop offset="100%" stopColor="#67e8f9" /></linearGradient>
        <filter id="calculatorFlowGlow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      {lines.map(([path, gradient, delay]) => <path key={path} d={path} stroke={`url(#${gradient})`} strokeWidth="4" strokeLinecap="round" filter="url(#calculatorFlowGlow)" className="calculator-fee-flow-line" style={{ animationDelay: delay }} />)}
      {lines.map(([path, , , y, fill]) => <circle key={`${path}-end`} cx="600" cy={y} r="5" fill={fill} filter="url(#calculatorFlowGlow)" />)}
    </svg>
  );
}

function PayoutRow({ route, percent, payout }: { route: RouteDefinition; percent: string; payout: string }) {
  const Icon = route.icon;
  const active = payout !== "Not set";
  return (
    <div className="flex min-h-[58px] items-center justify-between rounded-[17px] border border-white/[0.085] bg-[#0c0e0d]/96 px-3 py-2.5 shadow-[0_12px_28px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.02)] min-[1180px]:min-h-[66px] min-[1180px]:px-3.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 bg-[#0d1211]/80 text-[#52dfb2]"><Icon size={14} strokeWidth={2} /></span>
        <span className="min-w-0">
          <span className="block truncate text-[11px] font-medium text-white/72">{route.previewLabel ?? route.label}</span>
          <span className="mt-0.5 block text-[8px] font-medium tracking-[0.08em] text-white/28">{percent}</span>
        </span>
      </div>
      <span className={`ml-2 shrink-0 text-right font-semibold tabular-nums ${active ? "text-[12px] text-[#52dfb2]" : "text-[10px] text-white/40"}`}>{payout}</span>
    </div>
  );
}
