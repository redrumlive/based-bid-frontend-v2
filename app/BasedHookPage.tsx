"use client";

import Image from "next/image";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  CircleDot,
  Info,
  Layers3,
  Link2,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import FeeBuilderPanel, { type FeeWallet } from "./FeeBuilderPanel";
import SmartBackButton from "./SmartBackButton";
import { useAppToast } from "./AppToast";
import { BASE_LIQUIDITY_GROUPS, LIQUIDITY_ASSETS, type LiquidityAsset } from "./liquidityAssets";

const DEMO_WALLET = "0xA17C9e42B6D8f3057C24aE91B5d7630F8C2e4A69";
const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/;

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");
const shortAddress = (value: string) => value ? `${value.slice(0, 8)}…${value.slice(-6)}` : "Not added";

function AssetIcon({ asset, size = 22 }: { asset: LiquidityAsset; size?: number }) {
  return <Image unoptimized src={asset.icon} alt="" width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />;
}

function QuoteAssetSelector({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const selected = LIQUIDITY_ASSETS[value] ?? LIQUIDITY_ASSETS.ETH;

  React.useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40">
        Base token
        <span className="group relative">
          <button type="button" aria-label="Base token help" className="grid h-4 w-4 place-items-center rounded-full border border-white/10 text-[9px] text-white/38 transition hover:text-white/74">i</button>
          <span role="tooltip" className="pointer-events-none absolute right-0 top-6 z-50 w-[260px] rounded-[11px] border border-white/[0.09] bg-[#111513]/98 px-3 py-2.5 text-[10.5px] font-normal normal-case leading-4 tracking-normal text-white/58 opacity-0 shadow-[0_18px_48px_rgba(0,0,0,0.58)] backdrop-blur-xl transition group-hover:opacity-100">
            The asset paired with your project token in the new Uniswap v4 pool.
          </span>
        </span>
      </div>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className={cx(
          "flex h-[58px] w-full items-center gap-3 rounded-[14px] border bg-[#101312] px-3.5 text-left transition",
          open ? "border-[#18c98e]/28" : "border-white/[0.09] hover:border-white/[0.16]",
        )}
      >
        <AssetIcon asset={selected} size={28} />
        <span className="min-w-0 flex-1">
          <strong className="block text-[13px] font-semibold text-white/88">{selected.symbol}</strong>
          <span className="mt-0.5 block text-[10px] text-white/38">{selected.name}</span>
        </span>
        <ChevronDown className={cx("h-4 w-4 text-white/32 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-[88px] z-[90] w-[min(560px,calc(100vw-32px))] overflow-hidden rounded-[16px] border border-white/[0.1] bg-[#101312]/98 p-3 shadow-[0_24px_72px_rgba(0,0,0,0.72)] backdrop-blur-xl"
          >
            <div className="dark-scrollbar max-h-[440px] overflow-y-auto pr-1">
              {BASE_LIQUIDITY_GROUPS.map((group) => (
                <section key={group.label} className="pb-3 last:pb-0">
                  <div className="mb-2 px-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/32">{group.label}</div>
                  <div className={cx("grid gap-2", group.items.length <= 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3")}>
                    {group.items.map((asset) => {
                      const active = asset.id === value;
                      return (
                        <button
                          key={asset.id}
                          type="button"
                          onClick={() => {
                            onChange(asset.id);
                            setOpen(false);
                          }}
                          className={cx(
                            "flex min-w-0 items-center gap-2.5 rounded-[11px] border px-3 py-2.5 text-left transition",
                            active
                              ? "border-[#18c98e]/30 bg-[#18c98e]/[0.075]"
                              : "border-white/[0.07] bg-white/[0.014] hover:border-white/[0.13] hover:bg-white/[0.035]",
                          )}
                        >
                          <AssetIcon asset={asset} size={22} />
                          <span className="min-w-0 flex-1">
                            <strong className="block truncate text-[11px] font-semibold text-white/78">{asset.symbol}</strong>
                            <span className="mt-0.5 block truncate text-[9px] text-white/34">{asset.name}</span>
                          </span>
                          {active ? <Check className="h-3.5 w-3.5 shrink-0 text-[#18c98e]" /> : null}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function SummaryRow({ label, value, ready = true }: { label: string; value: React.ReactNode; ready?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.055] py-3 last:border-b-0">
      <span className="text-[10.5px] text-white/38">{label}</span>
      <span className={cx("min-w-0 truncate text-right text-[11px] font-semibold", ready ? "text-white/76" : "text-white/27")}>{value}</span>
    </div>
  );
}

export default function BasedHookPage() {
  const { pushToast } = useAppToast();
  const [projectAddress, setProjectAddress] = React.useState("");
  const [quoteAsset, setQuoteAsset] = React.useState("ETH");
  const [feeTotal, setFeeTotal] = React.useState(0);
  const [protectionCount, setProtectionCount] = React.useState(0);
  const [feeIssues, setFeeIssues] = React.useState(0);
  const [feeRoutes, setFeeRoutes] = React.useState<FeeWallet[]>([]);
  const validAddress = EVM_ADDRESS.test(projectAddress.trim());
  const invalidAddress = projectAddress.trim().length > 0 && !validAddress;
  const selectedAsset = LIQUIDITY_ASSETS[quoteAsset] ?? LIQUIDITY_ASSETS.ETH;
  const activeRoutes = feeRoutes.filter((route) => route.pct > 0).length || (feeTotal > 0 ? 1 : 0);

  const reviewHook = () => {
    if (!validAddress || feeIssues > 0) return;
    pushToast({
      title: "Based Hook configuration ready",
      message: `${shortAddress(projectAddress)} / ${selectedAsset.symbol} is ready for wallet approval with ${feeTotal.toFixed(2)}% configured fees.`,
      tone: "success",
    });
  };

  return (
    <main className="min-h-[calc(100vh-6.25rem)] bg-[radial-gradient(900px_420px_at_72%_-10%,rgba(255,0,122,0.055),transparent_62%),linear-gradient(180deg,#0b0d0c_0%,#090a0a_52%,#090a0a_100%)] px-4 pb-24 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1360px]">
        <div className="mb-5">
          <SmartBackButton fallbackHref="/" ariaLabel="Go back" className="group inline-flex h-8 items-center gap-2 text-[10.5px] font-medium text-white/38 transition hover:text-white/75">
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back</span>
          </SmartBackButton>
        </div>

        <header className="relative overflow-hidden rounded-[24px] border border-white/[0.085] bg-[#101312] px-6 py-7 shadow-[inset_0_1px_rgba(255,255,255,0.025)] sm:px-8 sm:py-8">
          <div aria-hidden className="absolute inset-y-0 right-0 w-[44%] bg-[radial-gradient(circle_at_60%_20%,rgba(255,0,122,0.085),transparent_62%)]" />
          <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div className="max-w-[780px]">
              <div className="inline-flex items-center gap-2 text-[9.5px] font-semibold uppercase tracking-[0.17em] text-[#ff5aa5]">
                <Link2 className="h-3.5 w-3.5" />
                Based Hook
              </div>
              <h1 className="mt-3 text-[31px] font-semibold leading-[1.08] tracking-[-0.045em] text-white/94 sm:text-[40px]">
                Bring Fee Builder to any new v4 pool.
              </h1>
              <p className="mt-3 max-w-[700px] text-[12.5px] font-light leading-[1.65] text-white/48 sm:text-[13.5px]">
                Pair an existing ERC-20 with any supported base asset, then configure rewards, programmable fee routes and trading protection before deployment.
              </p>
            </div>
            <div className="flex w-full max-w-[360px] items-center gap-3 border-l border-[#ff4aa0]/24 bg-[#ff007a]/[0.025] py-2.5 pl-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#ff4aa0]/18 bg-[#ff007a]/[0.06]">
                <Image unoptimized src="/dex/uniswap.svg" alt="" width={24} height={24} className="h-6 w-6 object-contain" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-white/82">Uniswap whitelisted <ShieldCheck className="h-3.5 w-3.5 text-[#ff5aa5]" /></span>
                <span className="mt-0.5 block text-[9.5px] leading-4 text-white/38">Verified hook permissions for Uniswap v4 pool creation.</span>
              </span>
            </div>
          </div>
        </header>

        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-6">
            <section className="rounded-[22px] border border-white/[0.085] bg-[#0f1211] p-5 shadow-[inset_0_1px_rgba(255,255,255,0.022)] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#18c98e]/78"><CircleDot className="h-3.5 w-3.5" />Step 1</div>
                  <h2 className="mt-2 text-[20px] font-semibold tracking-[-0.03em] text-white/90">Configure the pool pair</h2>
                  <p className="mt-1 text-[11px] font-light leading-5 text-white/40">A new Uniswap v4 pool is created with Based Hook attached from the first block.</p>
                </div>
                <span className="inline-flex h-7 items-center gap-2 rounded-full border border-white/[0.08] px-2.5 text-[9.5px] font-medium text-white/48">
                  <Image unoptimized src="/networks/base.png" alt="" width={15} height={15} className="h-[15px] w-[15px] rounded-full" />
                  Base
                </span>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(250px,0.75fr)]">
                <label className="block min-w-0">
                  <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40">Project token address</span>
                  <span className={cx(
                    "flex h-[58px] items-center gap-3 rounded-[14px] border bg-[#101312] px-3.5 transition",
                    invalidAddress ? "border-[#ff5d89]/35" : validAddress ? "border-[#18c98e]/28" : "border-white/[0.09] focus-within:border-white/[0.17]",
                  )}>
                    <span className={cx("grid h-8 w-8 shrink-0 place-items-center rounded-[10px] border", validAddress ? "border-[#18c98e]/18 bg-[#18c98e]/[0.06] text-[#18c98e]" : "border-white/[0.07] bg-white/[0.02] text-white/28")}>
                      {validAddress ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                    </span>
                    <input
                      value={projectAddress}
                      onChange={(event) => setProjectAddress(event.target.value)}
                      placeholder="0x…"
                      spellCheck={false}
                      aria-invalid={invalidAddress}
                      className="min-w-0 flex-1 bg-transparent font-mono text-[12px] text-white/80 outline-none placeholder:text-white/22"
                    />
                    {projectAddress ? <button type="button" onClick={() => setProjectAddress("")} aria-label="Clear token address" className="grid h-7 w-7 place-items-center rounded-md text-white/25 transition hover:bg-white/[0.04] hover:text-white/66"><X className="h-3.5 w-3.5" /></button> : null}
                  </span>
                  <span className={cx("mt-2 block min-h-4 text-[9.5px]", invalidAddress ? "text-[#ff6f96]" : validAddress ? "text-[#62ddb1]" : "text-white/28")}>
                    {invalidAddress ? "Enter a valid EVM contract address." : validAddress ? "Contract format valid. Token metadata will load from Base." : "Paste the ERC-20 contract you want to launch a pool for."}
                  </span>
                </label>
                <QuoteAssetSelector value={quoteAsset} onChange={setQuoteAsset} />
              </div>

              <div className="mt-5 grid gap-3 border-t border-white/[0.06] pt-5 sm:grid-cols-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-[9px] border border-white/[0.07] bg-white/[0.018] text-white/32"><Layers3 className="h-4 w-4" /></span>
                  <span><span className="block text-[9px] uppercase tracking-[0.12em] text-white/25">Pool</span><strong className="mt-0.5 block text-[11px] font-semibold text-white/68">Uniswap v4</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-[9px] border border-[#18c98e]/13 bg-[#18c98e]/[0.045] text-[#18c98e]"><ShieldCheck className="h-4 w-4" /></span>
                  <span><span className="block text-[9px] uppercase tracking-[0.12em] text-white/25">Hook</span><strong className="mt-0.5 block text-[11px] font-semibold text-white/68">Based Hook</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-[9px] border border-[#ff4aa0]/14 bg-[#ff007a]/[0.04] text-[#ff5aa5]"><Sparkles className="h-4 w-4" /></span>
                  <span><span className="block text-[9px] uppercase tracking-[0.12em] text-white/25">Pair</span><strong className="mt-0.5 block text-[11px] font-semibold text-white/68">TOKEN / {selectedAsset.symbol}</strong></span>
                </div>
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-end justify-between gap-4 px-1">
                <div>
                  <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#d9bd63]/84"><Sparkles className="h-3.5 w-3.5" />Step 2</div>
                  <h2 className="mt-2 text-[20px] font-semibold tracking-[-0.03em] text-white/90">Configure Based Hook</h2>
                  <p className="mt-1 text-[11px] font-light leading-5 text-white/40">Fee Builder and protection settings are deployed with the pool.</p>
                </div>
                <span className="hidden text-[9.5px] text-white/30 sm:inline">Changes remain editable until wallet approval</span>
              </div>
              <div className="overflow-hidden rounded-[22px] border border-white/[0.085] bg-[#0e1110] p-3 sm:p-4">
                <FeeBuilderPanel
                  chain="BASE"
                  walletAddress={DEMO_WALLET}
                  onTotalChange={setFeeTotal}
                  onAdvancedProtectionChange={setProtectionCount}
                  onIssuesChange={setFeeIssues}
                  onChange={setFeeRoutes}
                />
              </div>
            </section>
          </div>

          <aside className="sticky top-[78px] rounded-[22px] border border-white/[0.09] bg-[#101312] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.28),inset_0_1px_rgba(255,255,255,0.025)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/31">Deployment summary</div>
                <h2 className="mt-2 text-[18px] font-semibold tracking-[-0.025em] text-white/90">Your v4 hook setup</h2>
              </div>
              <span className={cx("grid h-9 w-9 place-items-center rounded-[11px] border", validAddress ? "border-[#18c98e]/18 bg-[#18c98e]/[0.055] text-[#18c98e]" : "border-white/[0.07] bg-white/[0.018] text-white/28")}>
                <ShieldCheck className="h-[18px] w-[18px]" />
              </span>
            </div>

            <div className="mt-5 rounded-[14px] border border-white/[0.065] bg-black/[0.08] px-3.5">
              <SummaryRow label="Project contract" value={validAddress ? shortAddress(projectAddress) : "Waiting"} ready={validAddress} />
              <SummaryRow label="Base token" value={<span className="inline-flex items-center gap-1.5"><AssetIcon asset={selectedAsset} size={16} />{selectedAsset.symbol}</span>} />
              <SummaryRow label="Pool engine" value="Uniswap v4" />
              <SummaryRow label="Fee routes" value={activeRoutes ? `${activeRoutes} active` : "Not configured"} ready={activeRoutes > 0} />
              <SummaryRow label="Total fee" value={`${feeTotal.toFixed(2)}%`} ready={feeTotal > 0} />
              <SummaryRow label="Protections" value={protectionCount ? `${protectionCount} enabled` : "Optional"} ready />
            </div>

            <div className="mt-4 flex items-start gap-2.5 border-l border-[#ff4aa0]/25 bg-[#ff007a]/[0.018] py-2.5 pl-3 pr-2">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ff5aa5]" />
              <p className="text-[9.5px] font-light leading-[1.55] text-white/40">The hook is bound when the new pool is initialized. Your token contract stays unchanged.</p>
            </div>

            <button
              type="button"
              disabled={!validAddress || feeIssues > 0}
              onClick={reviewHook}
              className={cx(
                "mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-[13px] text-[11.5px] font-semibold transition",
                validAddress && feeIssues === 0
                  ? "bg-[linear-gradient(110deg,#d8c46f,#aee348_48%,#27c994)] text-[#0b100c] shadow-[0_14px_36px_rgba(60,190,126,0.14)] hover:brightness-105"
                  : "cursor-not-allowed border border-white/[0.07] bg-white/[0.025] text-white/25",
              )}
            >
              Review pool & hook
              <ArrowRight className="h-4 w-4" />
            </button>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[9px] text-white/25"><Wallet className="h-3.5 w-3.5" />Wallet approval required</div>
          </aside>
        </div>
      </div>
    </main>
  );
}
