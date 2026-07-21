"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  ArrowLeftRight,
  Crown,
  Droplets,
  Coins,
  Code2,
  Flame,
  Landmark,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";

type RouteKey =
  | "creator"
  | "treasury"
  | "liquidity"
  | "rewards"
  | "buybacks"
  | "manual";

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

const NETWORK_OPTIONS: Array<{
  key: NetworkKey;
  label: string;
  maxTotalFee: number;
}> = [
  { key: "evm", label: "EVM", maxTotalFee: 10 },
  { key: "solana", label: "SOL", maxTotalFee: 6 },
];

const ZERO_FEES: FeeState = {
  creator: 0,
  treasury: 0,
  liquidity: 0,
  rewards: 0,
  buybacks: 0,
  manual: 0,
};

const PRESET_FEES: Record<PresetKey, FeeState> = {
  mixed: {
    creator: 3.1,
    treasury: 1.3,
    liquidity: 0.3,
    rewards: 1.7,
    buybacks: 1.2,
    manual: 0.1,
  },
  creator: {
    creator: 3,
    treasury: 0,
    liquidity: 0,
    rewards: 0,
    buybacks: 0,
    manual: 0,
  },
  balanced: {
    creator: 1,
    treasury: 0,
    liquidity: 0,
    rewards: 1,
    buybacks: 1,
    manual: 0,
  },
  rewards: {
    creator: 1,
    treasury: 0,
    liquidity: 0,
    rewards: 4,
    buybacks: 0,
    manual: 0,
  },
  cto: {
    creator: 0,
    treasury: 0,
    liquidity: 0,
    rewards: 1,
    buybacks: 3,
    manual: 0,
  },
};

const PRESET_OPTIONS: Array<{ key: PresetKey; label: string }> = [
  { key: "mixed", label: "Mixed" },
  { key: "creator", label: "Creator‑led" },
  { key: "balanced", label: "Balanced" },
  { key: "rewards", label: "Rewards" },
  { key: "cto", label: "CTO" },
];

const VOLUME_PRESETS = [
  { label: "$100K", value: 100_000 },
  { label: "$1M", value: 1_000_000 },
  { label: "$10M", value: 10_000_000 },
  { label: "$100M", value: 100_000_000 },
  { label: "$1B", value: 1_000_000_000 },
];

const ROUTES: RouteDefinition[] = [
  {
    key: "creator",
    label: "Creator Revenue",
    previewLabel: "Creator Wallet",
    description: "Direct revenue for the token creator.",
    icon: Crown,
  },
  {
    key: "treasury",
    label: "Treasury",
    description: "Funds ongoing growth and operations.",
    icon: Landmark,
  },
  {
    key: "liquidity",
    label: "Liquidity",
    description: "Adds depth to the trading market.",
    icon: Droplets,
  },
  {
    key: "rewards",
    label: "Holder Rewards",
    previewLabel: "Rewards",
    description: "Distributes value back to holders.",
    icon: Coins,
  },
  {
    key: "buybacks",
    label: "Buybacks & Burns",
    description: "Supports automated buyback mechanics.",
    icon: Flame,
  },
  {
    key: "manual",
    label: "Custom Routes",
    description: "Sent to any custom wallet.",
    icon: Code2,
    emptyValue: "Not set",
  },
];

const FEATURE_CARDS = [
  ["Auto Routing", "Routes fees automatically from every swap."],
  ["No Token Sales", "Fees are collected directly from swaps, not token sales."],
  ["Dynamic Control", "Adjust fee and wallets at any time without redeploying."],
] as const;

const cloneFees = (fees: FeeState): FeeState => ({ ...fees });
const sumFees = (fees: FeeState) =>
  Object.values(fees).reduce((sum, value) => sum + value, 0);
const formatPercent = (value: number) => `${value.toFixed(2)}%`;
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

function rebalanceFees(
  previous: FeeState,
  activeKey: RouteKey,
  requestedValue: number,
  maxTotalFee: number,
): FeeState {
  const next = cloneFees(previous);
  next[activeKey] = Math.max(0, Math.min(requestedValue, maxTotalFee));

  let overflow = sumFees(next) - maxTotalFee;
  let adjustableKeys = (Object.keys(next) as RouteKey[]).filter(
    (key) => key !== activeKey && next[key] > 0,
  );

  while (overflow > 0.0001 && adjustableKeys.length > 0) {
    const adjustableTotal = adjustableKeys.reduce(
      (sum, key) => sum + next[key],
      0,
    );
    if (adjustableTotal <= 0) break;

    adjustableKeys.forEach((key) => {
      const reduction = Math.min(
        next[key],
        (next[key] / adjustableTotal) * overflow,
      );
      next[key] -= reduction;
    });

    overflow = sumFees(next) - maxTotalFee;
    adjustableKeys = adjustableKeys.filter((key) => next[key] > 0.0001);
  }

  return next;
}

function capFeesToTotal(fees: FeeState, maxTotalFee: number): FeeState {
  const total = sumFees(fees);
  if (total <= maxTotalFee || total === 0) return cloneFees(fees);

  const keys = Object.keys(fees) as RouteKey[];
  const maxUnits = Math.round(maxTotalFee * 10);
  const scaledUnits = keys.map((key) => {
    const exact = (fees[key] / total) * maxUnits;
    return { key, units: Math.floor(exact), remainder: exact - Math.floor(exact) };
  });
  let remainingUnits =
    maxUnits - scaledUnits.reduce((sum, item) => sum + item.units, 0);

  [...scaledUnits]
    .sort((a, b) => b.remainder - a.remainder)
    .forEach((item) => {
      if (remainingUnits <= 0) return;
      item.units += 1;
      remainingUnits -= 1;
    });

  return scaledUnits.reduce((next, item) => {
    next[item.key] = item.units / 10;
    return next;
  }, cloneFees(ZERO_FEES));
}

export default function FeeBuilderPage() {
  const [network, setNetwork] = useState<NetworkKey>("evm");
  const [fees, setFees] = useState<FeeState>(cloneFees(PRESET_FEES.mixed));
  const [selectedPreset, setSelectedPreset] =
    useState<PresetKey | null>("mixed");
  const [selectedVolumePreset, setSelectedVolumePreset] =
    useState(1_000_000);

  const maxTotalFee =
    NETWORK_OPTIONS.find((option) => option.key === network)?.maxTotalFee ?? 10;
  const totalFee = useMemo(() => sumFees(fees), [fees]);
  const cappedTotal = Math.min(totalFee, maxTotalFee);
  const remainingFee = Math.max(0, maxTotalFee - cappedTotal);
  const sampleRevenueGenerated =
    (selectedVolumePreset * cappedTotal) / 100;

  const updateFee = (key: RouteKey, requestedValue: number) => {
    setSelectedPreset(null);
    setFees((previous) =>
      rebalanceFees(previous, key, requestedValue, maxTotalFee),
    );
  };

  const applyPreset = (preset: PresetKey) => {
    setSelectedPreset(preset);
    setFees(capFeesToTotal(PRESET_FEES[preset], maxTotalFee));
  };

  const selectNetwork = (nextNetwork: NetworkKey) => {
    if (nextNetwork === network) return;

    const nextMaxTotalFee =
      NETWORK_OPTIONS.find((option) => option.key === nextNetwork)?.maxTotalFee ?? 10;
    setNetwork(nextNetwork);
    if (selectedPreset) {
      setFees(capFeesToTotal(PRESET_FEES[selectedPreset], nextMaxTotalFee));
    } else if (totalFee > nextMaxTotalFee) {
      setFees((previous) => capFeesToTotal(previous, nextMaxTotalFee));
    }
  };

  const resetCalculator = () => {
    setSelectedPreset(null);
    setFees(cloneFees(ZERO_FEES));
  };

  return (
    <div className="mx-auto grid w-full max-w-[1420px] items-stretch gap-4 sm:gap-5 lg:grid-cols-[0.86fr_1.14fr]">
      <section className="relative flex min-h-0 flex-col rounded-[1.5rem] border border-white/10 bg-[#0b0f0f]/95 p-4 shadow-2xl shadow-black/35 backdrop-blur-xl sm:rounded-[2rem] lg:min-h-[700px]">
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_20%_15%,rgba(24,201,142,0.075),transparent_28%),radial-gradient(circle_at_78%_76%,rgba(103,232,249,0.04),transparent_28%)]" />
        <div className="relative flex h-full flex-col">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-wrap items-center gap-2.5 sm:gap-3">
              <h1 className="max-w-[720px] bg-[linear-gradient(180deg,#FFE082_0%,#D4AF37_100%)] bg-clip-text text-[1.34rem] font-semibold tracking-[-0.04em] text-transparent drop-shadow-[0_0_18px_rgba(212,175,55,0.12)] sm:text-[1.7rem] lg:text-[1.82rem]">
                Fee Builder
              </h1>
              <div
                className="inline-grid grid-cols-2 rounded-full border border-white/10 bg-black/20 p-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]"
                aria-label="Fee network"
              >
                {NETWORK_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    aria-pressed={network === option.key}
                    onClick={() => selectNetwork(option.key)}
                    className={`min-w-[3.15rem] rounded-full px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.13em] transition-colors duration-300 sm:text-[10px] ${
                      network === option.key
                        ? "bg-white/[0.11] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                        : "text-white/38 hover:text-white/70"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <span className="mt-1 shrink-0 rounded-full border border-[rgba(212,175,55,0.26)] bg-[rgba(212,175,55,0.055)] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-[#FFE082]/72">
              Up to {maxTotalFee}%
            </span>
          </div>
          <p className="mt-1.5 max-w-[680px] text-xs leading-5 text-white/55 sm:text-[12px] sm:leading-[1.1rem]">
            Configure how every swap fee is split across creator revenue,
            treasury, rewards, liquidity, buybacks and custom routes.
          </p>

          <div className="mt-4 flex min-h-0 flex-1 flex-col border-t border-white/8 pt-4">
            <div className="mb-3 flex flex-col gap-3">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[0.82rem] font-semibold">Fee Builder</p>
                  <p className="mt-0.5 text-[0.68rem] text-white/45">
                    Adjust how swap fees are split across each destination.
                  </p>
                </div>
                <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-start">
                  <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[10px] font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                    <span className="uppercase tracking-[0.14em] text-white/35">
                      Configured
                    </span>
                    <span className="tabular-nums text-[#52dfb2]">
                      {formatPercent(cappedTotal)}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={resetCalculator}
                    className="inline-flex h-[32px] min-w-[5.75rem] items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[0.025] px-3 text-[10px] font-medium text-white/45 transition hover:bg-white/[0.04] hover:text-white/75 sm:hidden"
                  >
                    <RotateCcw size={11} strokeWidth={2} />
                    Reset
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="grid min-h-[42px] w-full grid-cols-[0.82fr_1.28fr_1.08fr_0.98fr_0.72fr] items-center gap-1 rounded-[1.05rem] border border-white/10 bg-white/[0.03] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] sm:w-[22rem] lg:w-[21.75rem] xl:w-[22rem]">
                  {PRESET_OPTIONS.map((preset) => (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() => applyPreset(preset.key)}
                      className={`h-[32px] w-full whitespace-nowrap rounded-[0.82rem] border px-2 text-[9px] font-medium leading-none transition sm:text-[10px] ${
                        selectedPreset === preset.key
                          ? "border-white/10 bg-white/[0.12] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                          : "border-transparent text-white/50 hover:text-white/80"
                      }`}
                    >
                      {preset.key === "creator" ? "Creator-led" : preset.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={resetCalculator}
                  className="hidden h-[34px] items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[0.025] px-3 text-[10px] font-medium text-white/45 transition hover:bg-white/[0.04] hover:text-white/75 sm:inline-flex sm:w-[5.25rem]"
                >
                  <RotateCcw size={11} strokeWidth={2} />
                  Reset
                </button>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between text-[10px] font-medium text-white/55">
                  <span>Total {formatPercent(cappedTotal)}</span>
                  <span>{formatPercent(remainingFee)} available</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#18c98e] via-lime-300 to-cyan-300 transition-all duration-500"
                    style={{ width: `${(cappedTotal / maxTotalFee) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid flex-1 content-between gap-2.5">
              {ROUTES.map((route) => {
                const Icon = route.icon;
                const routeValue = fees[route.key];
                const sliderStyle = {
                  "--fill": `${(routeValue / maxTotalFee) * 100}%`,
                } as CSSProperties;

                return (
                  <div key={route.key} className="min-h-[42px] sm:min-h-[46px]">
                    <div className="mb-1 flex items-start justify-between text-sm">
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-7 w-7 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-[#52dfb2]">
                          <Icon size={14} strokeWidth={2} />
                        </span>
                        <div>
                          <p className="text-[12px] font-medium text-white/80 sm:text-[13px]">
                            {route.label}
                          </p>
                          <p className="mt-0.5 text-[9px] leading-3 text-white/35 sm:text-[10px] sm:leading-3">
                            {route.description}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium tabular-nums text-white/80 sm:text-[11px]">
                        {formatPercent(routeValue)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={maxTotalFee}
                      step="0.1"
                      value={routeValue}
                      onChange={(event) =>
                        updateFee(route.key, Number(event.target.value))
                      }
                      className="route-slider"
                      style={sliderStyle}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="relative flex min-h-0 flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#090b0b]/95 p-4 shadow-2xl shadow-black/35 backdrop-blur-xl sm:rounded-[2rem] lg:min-h-[700px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_40%,rgba(24,201,142,0.15),transparent_30%),radial-gradient(circle_at_80%_55%,rgba(103,232,249,0.08),transparent_28%)]" />

        <header className="relative z-10 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.35em] text-white/35">
              Fee distribution
            </p>
            <h2 className="mt-2 text-[1.06rem] font-semibold leading-[1.02] tracking-[-0.05em] text-white/95 sm:text-[1.24rem] lg:whitespace-nowrap lg:text-[1.2rem] xl:text-[1.34rem]">
              Turn every trade into a programmable economy.
            </h2>
          </div>
          <span className="shrink-0 rounded-full border border-[rgba(212,175,55,0.42)] bg-[rgba(212,175,55,0.04)] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-[rgba(212,175,55,0.88)]">
            Signature
          </span>
        </header>

        <div className="relative z-10 order-2 mt-3 min-h-0 flex-1 max-lg:flex max-lg:flex-col max-lg:gap-3 sm:mt-4 lg:order-1 lg:mt-5 lg:min-h-[430px] xl:mt-6">
          <div className="absolute left-0 top-1/2 z-20 w-[152px] -translate-y-1/2 rounded-[20px] border border-white/10 bg-[#08100d]/85 p-3.5 shadow-xl backdrop-blur-md max-lg:relative max-lg:top-auto max-lg:w-full max-lg:translate-y-0">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-[19px] font-semibold tracking-[-0.04em] text-white/90">
                Swap Fee
              </h3>
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-[#52dfb2]">
                <ArrowLeftRight size={16} strokeWidth={2} />
              </div>
            </div>
            <p className="mt-2.5 text-[11px] leading-5 text-white/45">
              Fee applied on each swap, then routed to selected destinations.
            </p>
            <div className="mt-4 border-t border-white/10 pt-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
                Total generated
              </p>
              <span className="mt-1 block text-[20px] font-semibold tracking-[-0.04em] text-[rgba(212,175,55,0.96)]">
                {formatCurrency(sampleRevenueGenerated)}
              </span>
            </div>
          </div>

          <FeeFlow />

          <div className="absolute right-0 top-1/2 z-20 flex w-[300px] -translate-y-1/2 flex-col gap-2.5 max-lg:relative max-lg:top-auto max-lg:w-full max-lg:translate-y-0">
            {ROUTES.map((route) => {
              const routeFee = fees[route.key];
              const displayValue =
                routeFee > 0
                  ? formatCurrency(
                      (selectedVolumePreset * routeFee) / 100,
                    )
                  : (route.emptyValue ?? "Not set");

              return (
                <FeeRouteRow
                  key={route.key}
                  icon={route.icon}
                  label={route.previewLabel ?? route.label}
                  value={displayValue}
                  percent={formatPercent(routeFee)}
                />
              );
            })}
          </div>
        </div>

        <div className="relative z-10 order-1 mt-4 overflow-hidden rounded-[1.5rem] border border-[rgba(212,175,55,0.16)] bg-[linear-gradient(135deg,rgba(212,175,55,0.09),rgba(255,255,255,0.03))] p-3.5 lg:order-2 lg:mt-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
                Sample trading volume
              </p>
              <p className="mt-1 text-lg font-semibold text-white/90">
                {formatCurrency(selectedVolumePreset)}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
                Volume presets
              </p>
              <div className="mt-2 flex flex-wrap gap-2 sm:justify-end">
                {VOLUME_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setSelectedVolumePreset(preset.value)}
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] transition ${
                      selectedVolumePreset === preset.value
                        ? "border-[rgba(212,175,55,0.35)] bg-[rgba(212,175,55,0.12)] text-[rgba(212,175,55,0.96)]"
                        : "border-white/10 bg-white/[0.03] text-white/50"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 order-3 mt-3 grid grid-cols-3 gap-1.5 sm:gap-2.5">
          {FEATURE_CARDS.map(([title, description]) => (
            <div
              key={title}
              className="rounded-xl border border-white/10 bg-white/[0.04] p-2 sm:rounded-2xl sm:p-3.5"
            >
              <p className="text-[0.62rem] font-semibold leading-[0.78rem] sm:text-sm sm:leading-tight">{title}</p>
              <p className="mt-1 text-[0.52rem] leading-[0.68rem] text-white/45 sm:text-xs sm:leading-4">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <style jsx global>{`
        .fee-flow-line {
          stroke-dasharray: 10 14;
          animation: feeFlowMove 2s linear infinite;
        }

        .fee-route-row {
          position: relative;
          overflow: hidden;
        }

        @media (min-width: 1024px) {
          .fee-route-row {
            background:
              linear-gradient(
                90deg,
                rgba(11, 15, 15, 0.62) 0,
                rgba(11, 15, 15, 0.9) 1.55rem,
                rgba(11, 15, 15, 0.95) 1.95rem,
                rgba(11, 15, 15, 0.95) 100%
              );
          }
        }

        @keyframes feeFlowMove {
          from {
            stroke-dashoffset: 72;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        .route-slider {
          appearance: none;
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            #18c98e 0%,
            #52dfb2 calc(var(--fill) * 0.58),
            #67e8f9 var(--fill),
            rgba(255, 255, 255, 0.12) var(--fill),
            rgba(255, 255, 255, 0.12) 100%
          );
          cursor: pointer;
        }

        .route-slider::-webkit-slider-runnable-track {
          height: 6px;
          background: transparent;
          border-radius: 999px;
        }

        .route-slider::-moz-range-track {
          height: 6px;
          background: transparent;
          border-radius: 999px;
        }

        .route-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          margin-top: -5px;
          width: 16px;
          height: 16px;
          border-radius: 999px;
          background: #6ee7b7;
          border: 3px solid #0b0f0e;
          box-shadow: 0 0 24px rgba(82, 223, 178, 0.45);
        }

        .route-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 999px;
          background: #6ee7b7;
          border: 3px solid #0b0f0e;
          box-shadow: 0 0 24px rgba(82, 223, 178, 0.45);
        }

        @media (max-width: 1023px) {
          .fee-flow-svg {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

function FeeFlow() {
  const lines = [
    ["M162 225 C252 225, 300 50, 505 50 L586 50", "feeFlowGreen", "0s", 50, "#86efac"],
    ["M162 240 C262 240, 320 138, 505 138 L586 138", "feeFlowCyan", "0.2s", 138, "#67e8f9"],
    ["M162 255 C278 255, 340 226, 505 226 L586 226", "feeFlowGreen", "0.35s", 226, "#86efac"],
    ["M162 270 C278 270, 340 314, 505 314 L586 314", "feeFlowCyan", "0.5s", 314, "#67e8f9"],
    ["M162 285 C262 285, 320 402, 505 402 L586 402", "feeFlowGreen", "0.7s", 402, "#86efac"],
    ["M162 300 C252 300, 300 490, 505 490 L586 490", "feeFlowCyan", "0.85s", 490, "#67e8f9"],
  ] as const;

  return (
    <svg
      className="fee-flow-svg pointer-events-none absolute inset-0 z-0 h-full w-full"
      viewBox="0 0 900 540"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="feeFlowGreen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#18c98e" stopOpacity="0.12" />
          <stop offset="42%" stopColor="#52dfb2" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#bef264" />
        </linearGradient>
        <linearGradient id="feeFlowCyan" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.12" />
          <stop offset="45%" stopColor="#2dd4bf" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#67e8f9" />
        </linearGradient>
        <filter id="feeFlowGlow">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {lines.map(([path, gradient, delay]) => (
        <path
          key={path}
          d={path}
          stroke={`url(#${gradient})`}
          strokeWidth="4"
          strokeLinecap="round"
          filter="url(#feeFlowGlow)"
          className="fee-flow-line"
          style={{ animationDelay: delay }}
        />
      ))}

      {lines.map(([path, , , y, fill]) => (
        <circle
          key={`${path}-endpoint`}
          cx="586"
          cy={y}
          r="6"
          fill={fill}
          filter="url(#feeFlowGlow)"
        />
      ))}
    </svg>
  );
}

function FeeRouteRow({
  icon: Icon,
  label,
  value,
  percent,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  percent: string;
}) {
  const valueClass =
    value === "Not set"
      ? "min-w-[64px] text-right text-[11px] font-medium text-white/50 sm:min-w-[84px] sm:text-[12px]"
      : "min-w-[64px] text-right text-[12px] font-semibold tabular-nums text-[#52dfb2] sm:min-w-[84px] sm:text-[15px]";

  return (
    <div className="fee-route-row flex min-h-[54px] items-center justify-between rounded-[17px] border border-[#52dfb2]/10 bg-[#0b0f0f]/95 px-3 py-2.5 shadow-[0_0_25px_rgba(24,201,142,0.04)] sm:min-h-[60px] sm:rounded-[18px] sm:px-3.5">
      <div className="relative z-10 flex items-center gap-2.5 sm:gap-3">
        <div className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-[#0d1211]/80 text-[#52dfb2] sm:h-9 sm:w-9">
          <Icon size={15} strokeWidth={2} />
        </div>
        <div>
          <p className="text-[12px] font-medium text-white/75 sm:text-[13px]">
            {label}
          </p>
          <p className="mt-0.5 text-[9px] font-medium tracking-[0.08em] text-white/30">
            {percent}
          </p>
        </div>
      </div>
      <span className={`relative z-10 ${valueClass}`}>{value}</span>
    </div>
  );
}
