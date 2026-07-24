"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  FileImage,
  Info,
  KeyRound,
  Link2,
  Loader2,
  LockKeyhole,
  PencilLine,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Upload,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import FeeBuilderPanel, { type FeeWallet } from "./FeeBuilderPanel";
import type { LbpTokenDetail } from "./lbpTokenData";
import { useWalletFundingStatus } from "./useWalletFundingStatus";
import { useAppToast } from "./AppToast";
import SmartBackButton from "./SmartBackButton";
import { WalletMenu } from "./AppTopBar";

type ManageSection = "profile" | "identity" | "fees" | "permissions";

const NETWORK_ICONS: Record<LbpTokenDetail["network"], string> = {
  base: "/networks/base.png",
  bsc: "/networks/bsc.png",
  eth: "/networks/ethereum.png",
  robinhood: "/networks/robinhood.png",
  sol: "/networks/sol.png",
};

const TOKEN_ASSET_FILES: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
};

const SECTION_META: Array<{ id: ManageSection; label: string; detail: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "profile", label: "Token profile", detail: "Description, logo and links", icon: PencilLine },
  { id: "identity", label: "Token identity", detail: "Name, symbol and metadata", icon: FileImage },
  { id: "fees", label: "Fee Builder", detail: "Routes, rewards and mechanics", icon: SlidersHorizontal },
  { id: "permissions", label: "Permissions", detail: "Authorities and ownership", icon: ShieldCheck },
];

const APPLY_LABELS: Record<ManageSection, string> = {
  profile: "Apply profile",
  identity: "Apply identity",
  fees: "Apply Fee Builder",
  permissions: "Apply permissions",
};

function initialFeeRoutes(token: LbpTokenDetail): FeeWallet[] {
  const native = `TOKEN:${token.quoteSymbol}`;
  const ownerAddress = token.ownerAddress ?? "";
  return [
    { id: "rwa", name: "Combo Rewards", pct: 2, routeRewardMode: "basket", rwaAssets: [native, "TOKEN:USDC", "SPY", "NVDA"], rwaAssetWeights: { [native]: 25, "TOKEN:USDC": 25, SPY: 25, NVDA: 25 }, rwaDistributionMode: "rotating", rewardThresholdPct: 0.1 },
    { id: "ops", name: "Treasury", pct: 1, address: ownerAddress, routeRewardMode: "basket", rwaAssets: ["AAPL", "NVDA", "TSLA"], rwaAssetWeights: { AAPL: 40, NVDA: 35, TSLA: 25 }, rwaDistributionMode: "all" },
    { id: "creator", name: "Creator Revenue", pct: 1 },
    { id: "buybacks", name: "Buybacks & Burns", pct: 1 },
  ];
}

type FeeChangeSummary = {
  label: string;
  previous: string;
  next: string;
  previousAssets?: string[];
  nextAssets?: string[];
};

const cloneFeeRoutes = (routes: FeeWallet[]) => routes.map((route) => ({
  ...route,
  rwaAssets: route.rwaAssets ? [...route.rwaAssets] : undefined,
  rwaAssetWeights: route.rwaAssetWeights ? { ...route.rwaAssetWeights } : undefined,
  rwaPinnedAssets: route.rwaPinnedAssets ? [...route.rwaPinnedAssets] : undefined,
}));

const formatFeePercent = (value: number) => `${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}%`;
const shortWallet = (value?: string) => value ? `${value.slice(0, 6)}...${value.slice(-4)}` : "Not set";
const payoutModeLabel = (value?: FeeWallet["rwaDistributionMode"]) => value === "all" ? "All at once" : "Rotating";
const assetListLabel = (assets: string[] = []) => assets.length <= 3 ? assets.join(", ") || "None" : `${assets.slice(0, 3).join(", ")} +${assets.length - 3}`;
const routeOrderLabel = (routes: FeeWallet[]) => routes.length <= 3 ? routes.map((route) => route.name).join(", ") : `${routes.slice(0, 3).map((route) => route.name).join(", ")} +${routes.length - 3}`;
const allocationLabel = (route: FeeWallet) => (route.rwaAssets ?? []).map((asset) => `${asset.replace("TOKEN:", "")} ${route.rwaAssetWeights?.[asset] ?? 0}%`).join(" · ") || "No allocation";

function summarizeFeeChanges(previousRoutes: FeeWallet[], nextRoutes: FeeWallet[]): FeeChangeSummary[] {
  const previousTotal = previousRoutes.reduce((sum, route) => sum + route.pct, 0);
  const nextTotal = nextRoutes.reduce((sum, route) => sum + route.pct, 0);
  const previousById = new Map(previousRoutes.map((route) => [route.id, route]));
  const nextById = new Map(nextRoutes.map((route) => [route.id, route]));
  const changes: FeeChangeSummary[] = [
    { label: "Total fee", previous: formatFeePercent(previousTotal), next: formatFeePercent(nextTotal) },
    ...nextRoutes.map((nextRoute) => {
      const previousRoute = previousById.get(nextRoute.id);
      return {
        label: `${nextRoute.name} fee`,
        previous: previousRoute ? formatFeePercent(previousRoute.pct) : "Not configured",
        next: formatFeePercent(nextRoute.pct),
      };
    }),
    ...previousRoutes
      .filter((previousRoute) => !nextById.has(previousRoute.id))
      .map((previousRoute) => ({
        label: `${previousRoute.name} fee`,
        previous: formatFeePercent(previousRoute.pct),
        next: "Removed",
      })),
  ];

  const previousOrder = previousRoutes.map((route) => route.id).join("|");
  const nextOrder = nextRoutes.map((route) => route.id).join("|");
  if (previousOrder !== nextOrder) changes.push({ label: "Route order", previous: routeOrderLabel(previousRoutes), next: routeOrderLabel(nextRoutes) });

  nextRoutes.forEach((nextRoute) => {
    const previousRoute = previousById.get(nextRoute.id);
    if (!previousRoute) {
      if (nextRoute.rwaAssets?.length) changes.push({ label: `${nextRoute.name} basket`, previous: "None", next: assetListLabel(nextRoute.rwaAssets), previousAssets: [], nextAssets: nextRoute.rwaAssets });
      if (nextRoute.rwaDistributionMode) changes.push({ label: `${nextRoute.name} payout`, previous: "Not configured", next: payoutModeLabel(nextRoute.rwaDistributionMode) });
      if ((nextRoute.rewardThresholdPct ?? 0) > 0) changes.push({ label: `${nextRoute.name} eligibility`, previous: "Not configured", next: formatFeePercent(nextRoute.rewardThresholdPct ?? 0) });
      if (nextRoute.address) changes.push({ label: `${nextRoute.name} recipient`, previous: "Not configured", next: shortWallet(nextRoute.address) });
      if (nextRoute.rwaAssetWeights && Object.keys(nextRoute.rwaAssetWeights).length) changes.push({ label: `${nextRoute.name} ratios`, previous: "Not configured", next: allocationLabel(nextRoute) });
      return;
    }
    if (previousRoute.name !== nextRoute.name) changes.push({ label: "Route name", previous: previousRoute.name, next: nextRoute.name });
    if (JSON.stringify(previousRoute.rwaAssets ?? []) !== JSON.stringify(nextRoute.rwaAssets ?? [])) changes.push({ label: `${nextRoute.name} basket`, previous: assetListLabel(previousRoute.rwaAssets), next: assetListLabel(nextRoute.rwaAssets), previousAssets: previousRoute.rwaAssets, nextAssets: nextRoute.rwaAssets });
    if (previousRoute.rwaDistributionMode !== nextRoute.rwaDistributionMode) changes.push({ label: `${nextRoute.name} payout`, previous: payoutModeLabel(previousRoute.rwaDistributionMode), next: payoutModeLabel(nextRoute.rwaDistributionMode) });
    if ((previousRoute.rewardThresholdPct ?? 0) !== (nextRoute.rewardThresholdPct ?? 0)) changes.push({ label: `${nextRoute.name} eligibility`, previous: formatFeePercent(previousRoute.rewardThresholdPct ?? 0), next: formatFeePercent(nextRoute.rewardThresholdPct ?? 0) });
    if ((previousRoute.address ?? "") !== (nextRoute.address ?? "")) changes.push({ label: `${nextRoute.name} recipient`, previous: shortWallet(previousRoute.address), next: shortWallet(nextRoute.address) });
    if (JSON.stringify(previousRoute.rwaAssetWeights ?? {}) !== JSON.stringify(nextRoute.rwaAssetWeights ?? {})) changes.push({ label: `${nextRoute.name} ratios`, previous: allocationLabel(previousRoute), next: allocationLabel(nextRoute) });
  });
  return changes;
}

function ReviewAssetStack({ assets = [] }: { assets?: string[] }) {
  if (!assets.length) return <span className="text-[12px] text-white/40">None</span>;
  const visible = assets.slice(0, 4);
  return (
    <span className="isolate flex min-w-0 items-center pl-1" aria-label={assetListLabel(assets)}>
      {visible.map((asset, index) => {
        const symbol = asset.replace("TOKEN:", "");
        const tokenFile = TOKEN_ASSET_FILES[symbol] ?? symbol.toLowerCase();
        const src = asset.startsWith("TOKEN:") ? `/tokens/${tokenFile}.png` : `/rwa/${symbol.toLowerCase()}.png`;
        return (
          <span key={`${asset}-${index}`} title={symbol} className="-ml-1.5 grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full border border-white/[0.16] bg-[#181b1a] ring-2 ring-[#121614]" style={{ zIndex: visible.length - index }}>
            <Image unoptimized src={src} alt="" width={32} height={32} className="h-full w-full object-contain" />
          </span>
        );
      })}
      {assets.length > visible.length ? <span className="relative z-20 -ml-1.5 grid h-8 min-w-8 shrink-0 place-items-center rounded-full border border-[#d9bb65]/28 bg-[#211d11] px-1 text-[10px] font-semibold tabular-nums text-[#ead58b] ring-2 ring-[#121614]">+{assets.length - visible.length}</span> : null}
    </span>
  );
}

function ReviewValue({ value, assets, next = false }: { value: string; assets?: string[]; next?: boolean }) {
  return (
    <div className={`flex min-h-[54px] min-w-0 items-center rounded-[11px] border px-3.5 ${next ? "border-[#d9bb65]/22 bg-[#d9bb65]/[0.045]" : "border-white/[0.075] bg-black/[0.13]"}`}>
      {assets ? <ReviewAssetStack assets={assets} /> : <span className={`min-w-0 text-[12.5px] font-medium leading-5 ${next ? "text-[#ead58b]" : "text-white/58"}`}>{value}</span>}
    </div>
  );
}

function StatusPill({ children, tone = "green" }: { children: React.ReactNode; tone?: "green" | "gold" | "neutral" }) {
  const styles = tone === "green"
    ? "border-[#18c98e]/20 bg-[#18c98e]/[0.06] text-[#8fe3bf]"
    : tone === "gold"
      ? "border-[#d9bb65]/22 bg-[#d9bb65]/[0.055] text-[#dccb91]"
      : "border-white/[0.085] bg-white/[0.025] text-white/46";
  return <span className={`inline-flex h-6 items-center rounded-full border px-2.5 text-[9.5px] font-semibold uppercase tracking-[0.09em] ${styles}`}>{children}</span>;
}

function FieldLabel({ title, detail, optional = false }: { title: string; detail?: string; optional?: boolean }) {
  return (
    <div className="mb-2 flex items-end justify-between gap-3">
      <div>
        <label className="text-[12.5px] font-semibold text-white/88">{title}</label>
        {detail ? <p className="mt-1 text-[10.5px] font-light text-white/48">{detail}</p> : null}
      </div>
      {optional ? <span className="text-[9px] uppercase tracking-[0.11em] text-white/36">Optional</span> : null}
    </div>
  );
}

function TextField({ value, onChange, disabled = false, maxLength, placeholder }: { value: string; onChange: (value: string) => void; disabled?: boolean; maxLength?: number; placeholder?: string }) {
  return (
    <div className={`flex min-h-12 items-center rounded-[11px] border px-3.5 transition ${disabled ? "border-white/[0.075] bg-black/15" : "border-white/[0.12] bg-[#111513] focus-within:border-[#18c98e]/40 focus-within:bg-[#131a17]"}`}>
      <input value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} maxLength={maxLength} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-white/88 outline-none placeholder:text-white/32 disabled:text-white/42" />
      {maxLength ? <span className="ml-3 font-mono text-[9px] tabular-nums text-white/34">{value.length}/{maxLength}</span> : null}
      {disabled ? <LockKeyhole className="ml-3 h-3.5 w-3.5 text-white/22" /> : null}
    </div>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-[18px] border border-white/[0.105] bg-[linear-gradient(145deg,#151918,#111513)] shadow-[inset_0_1px_rgba(255,255,255,0.028),0_18px_50px_rgba(0,0,0,0.12)] ${className}`}>{children}</section>;
}

export default function TokenManagePage({
  token,
  presentation = "page",
  onClose,
}: {
  token: LbpTokenDetail;
  presentation?: "page" | "drawer";
  onClose?: () => void;
}) {
  const wallet = useWalletFundingStatus();
  const { pushToast, updateToast } = useAppToast();
  const [section, setSection] = React.useState<ManageSection>("profile");
  const [title, setTitle] = React.useState(token.title);
  const [ticker, setTicker] = React.useState(token.ticker);
  const [description, setDescription] = React.useState(token.description);
  const [website, setWebsite] = React.useState("https://based.bid");
  const [social, setSocial] = React.useState(`https://x.com/${token.creator}`);
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);
  const [dirtySections, setDirtySections] = React.useState<Set<ManageSection>>(() => new Set());
  const [savingSection, setSavingSection] = React.useState<ManageSection | null>(null);
  const [feeTotal, setFeeTotal] = React.useState(5);
  const [feeIssues, setFeeIssues] = React.useState(0);
  const [appliedFeeRoutes, setAppliedFeeRoutes] = React.useState<FeeWallet[]>(() => cloneFeeRoutes(initialFeeRoutes(token)));
  const [draftFeeRoutes, setDraftFeeRoutes] = React.useState<FeeWallet[]>(() => cloneFeeRoutes(initialFeeRoutes(token)));
  const [feeReviewOpen, setFeeReviewOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const saveTimer = React.useRef<number | null>(null);
  const mountedRef = React.useRef(true);
  const mutableIdentity = token.network === "sol";
  const isDrawer = presentation === "drawer";
  const ownerAddress = token.ownerAddress ?? "";
  const canManage = Boolean(
    wallet.connected
    && wallet.address
    && ownerAddress
    && (ownerAddress.startsWith("0x")
      ? wallet.address.toLowerCase() === ownerAddress.toLowerCase()
      : wallet.address === ownerAddress),
  );
  const activeDirty = dirtySections.has(section);
  const activeSaving = savingSection === section;
  const feeApplyBlocked = section === "fees" && feeIssues > 0;
  const canApply = activeDirty && !savingSection && !feeApplyBlocked;
  const feeChanges = React.useMemo(() => summarizeFeeChanges(appliedFeeRoutes, draftFeeRoutes), [appliedFeeRoutes, draftFeeRoutes]);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  React.useEffect(() => () => {
    if (logoUrl) URL.revokeObjectURL(logoUrl);
  }, [logoUrl]);
  React.useEffect(() => {
    if (!feeReviewOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFeeReviewOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [feeReviewOpen]);

  const markDirty = (target: ManageSection) => {
    setDirtySections((current) => {
      const next = new Set(current);
      next.add(target);
      return next;
    });
  };
  const update = (target: ManageSection, setter: React.Dispatch<React.SetStateAction<string>>) => (value: string) => {
    setter(value);
    markDirty(target);
  };
  const selectLogo = (file?: File) => {
    if (!file) return;
    if (logoUrl) URL.revokeObjectURL(logoUrl);
    setLogoUrl(URL.createObjectURL(file));
    markDirty("profile");
  };
  const applySection = (targetSection: ManageSection = section) => {
    const targetDirty = dirtySections.has(targetSection);
    const targetBlocked = targetSection === "fees" && feeIssues > 0;
    if (!targetDirty || savingSection || targetBlocked) return;
    const targetLabel = SECTION_META.find((item) => item.id === targetSection)?.label ?? "Settings";
    const feeSnapshot = targetSection === "fees" ? cloneFeeRoutes(draftFeeRoutes) : null;
    setSavingSection(targetSection);
    const toastId = pushToast({
      tone: "pending",
      title: `Confirm ${targetLabel} changes`,
      message: `Approve the ${token.title} transaction in your wallet to continue.`,
      duration: 0,
    });
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      if (mountedRef.current) {
        setDirtySections((current) => {
          const next = new Set(current);
          next.delete(targetSection);
          return next;
        });
        if (feeSnapshot) setAppliedFeeRoutes(feeSnapshot);
        setSavingSection(null);
      }
      updateToast(toastId, {
        tone: "success",
        title: `${targetLabel} applied`,
        message: `${token.title} ${targetLabel.toLowerCase()} changes were confirmed onchain.`,
        duration: 4200,
      });
    }, 2200);
  };
  const requestApply = () => {
    if (!canApply) return;
    if (section === "fees") {
      setFeeReviewOpen(true);
      return;
    }
    applySection(section);
  };
  const updateFeeDraft = (nextFees: FeeWallet[]) => {
    const nextDraft = cloneFeeRoutes(nextFees);
    setDraftFeeRoutes(nextDraft);
    const changed = JSON.stringify(nextDraft) !== JSON.stringify(appliedFeeRoutes);
    setDirtySections((current) => {
      const next = new Set(current);
      if (changed) next.add("fees");
      else next.delete("fees");
      return next;
    });
  };

  if (!canManage) {
    return (
      <main className="grid min-h-[calc(100vh-100px)] place-items-center bg-[#090a0a] px-5 text-white">
        <section className="w-full max-w-[500px] rounded-[20px] border border-white/[0.08] bg-[#0c0f0e] p-7 text-center shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-[14px] border border-white/[0.08] bg-white/[0.025] text-white/38"><LockKeyhole className="h-5 w-5" /></span>
          <h1 className="mt-5 text-[18px] font-semibold tracking-[-0.02em] text-white/90">Owner access required</h1>
          <p className="mx-auto mt-2 max-w-[360px] text-[10.5px] font-light leading-5 text-white/38">Connect the creator or pool-owner wallet to manage {token.title}.</p>
          <SmartBackButton fallbackHref={`/token/${token.id}`} ariaLabel="Back to token" className="mt-6 inline-flex h-9 cursor-pointer items-center gap-2 rounded-[9px] border border-white/[0.09] bg-white/[0.025] px-3.5 text-[9.5px] font-semibold text-white/62 transition hover:border-white/[0.15] hover:bg-white/[0.05] hover:text-white/88"><ArrowLeft className="h-3.5 w-3.5" />Back to token</SmartBackButton>
        </section>
      </main>
    );
  }

  return (
    <main className={isDrawer ? "min-h-full bg-[radial-gradient(circle_at_62%_-12%,rgba(24,201,142,0.045),transparent_34%),#0d100f] text-white" : "min-h-[calc(100vh-100px)] bg-[radial-gradient(circle_at_62%_-12%,rgba(24,201,142,0.045),transparent_34%),#0d100f] text-white"}>
      <header className="sticky top-0 z-40 border-b border-white/[0.095] bg-[#101311]/96 backdrop-blur-xl">
        <div className={`mx-auto flex min-h-[78px] items-center gap-4 px-5 lg:px-8 ${isDrawer ? "max-w-none" : "max-w-[1240px]"}`}>
          {isDrawer ? (
            <button type="button" onClick={onClose} aria-label="Close token management" className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] text-white/34 transition hover:bg-white/[0.04] hover:text-white/82"><X className="h-4 w-4" /></button>
          ) : (
            <SmartBackButton fallbackHref={`/token/${token.id}`} ariaLabel="Back to token terminal" className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-[10px] border border-white/[0.07] text-white/42 transition hover:border-white/[0.13] hover:bg-white/[0.035] hover:text-white/82"><ArrowLeft className="h-4 w-4" /></SmartBackButton>
          )}
          <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/[0.14] bg-[#171c1a] text-[14px] font-bold shadow-[inset_0_1px_rgba(255,255,255,0.035)]" style={{ color: token.accent }}>{token.ticker.slice(0, 2)}<Image unoptimized src={NETWORK_ICONS[token.network]} alt="" width={16} height={16} className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#0d100f] object-cover ring-2 ring-[#0d100f]" /></div>
          <div className="min-w-0">
            <div className="flex items-center gap-2"><h1 className="truncate text-[17px] font-semibold tracking-[-0.02em] text-white/94">Manage {token.title}</h1><StatusPill tone="green">Creator</StatusPill></div>
            <p className="mt-1 truncate text-[11px] font-light text-white/52">Update token presentation, Fee Builder routes and authorities</p>
          </div>
          <div className="ml-auto shrink-0"><WalletMenu /></div>
        </div>
      </header>

      <div className={`mx-auto grid grid-cols-1 gap-7 px-5 py-7 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8 lg:py-9 ${isDrawer ? "max-w-none" : "max-w-[1240px]"}`}>
        <aside className="lg:sticky lg:top-[100px] lg:self-start">
          <nav className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1" aria-label="Token management sections">
            {SECTION_META.map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button key={item.id} type="button" onClick={() => setSection(item.id)} className={`group flex min-w-0 items-center gap-3 rounded-[13px] border px-3.5 py-3.5 text-left transition ${active ? "border-[#18c98e]/30 bg-[#18c98e]/[0.075] shadow-[inset_2px_0_#18c98e]" : "border-transparent text-white/58 hover:border-white/[0.10] hover:bg-white/[0.035] hover:text-white/80"}`}>
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border ${active ? "border-[#18c98e]/25 bg-[#18c98e]/[0.09] text-[#72e2b7]" : "border-white/[0.09] bg-white/[0.025] text-white/42"}`}><Icon className="h-4 w-4" /></span>
                  <span className="min-w-0"><strong className={`block truncate text-[12px] font-semibold ${active ? "text-white/92" : ""}`}>{item.label}</strong><span className="mt-1 hidden truncate text-[10px] font-light text-white/42 lg:block">{item.detail}</span></span>
                  {dirtySections.has(item.id) ? <span aria-label={`${item.label} has unapplied changes`} className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#f5d97a] shadow-[0_0_8px_rgba(245,217,122,0.45)]" /> : null}
                  <ChevronRight className={`${dirtySections.has(item.id) ? "ml-0" : "ml-auto"} hidden h-3.5 w-3.5 lg:block ${active ? "text-[#18c98e]/62" : "text-white/13"}`} />
                </button>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={requestApply}
            disabled={!canApply}
            className={`group relative mt-5 flex min-h-[68px] w-full items-center overflow-hidden rounded-[14px] border px-3.5 text-left transition-[border-color,box-shadow,transform] duration-500 ease-[cubic-bezier(.22,1,.36,1)] active:scale-[0.985] ${canApply ? "border-[#18c98e]/62 shadow-[0_14px_34px_rgba(24,201,142,0.16)] hover:shadow-[0_16px_38px_rgba(24,201,142,0.24)]" : "cursor-default border-white/[0.10] bg-white/[0.025]"}`}
          >
            {canApply ? <><motion.span aria-hidden className="absolute inset-0 bg-[linear-gradient(112deg,#0edb86_0%,#3be6a7_48%,#eed67e_86%,#18c98e_100%)] bg-[length:220%_100%]" animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }} transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut" }} /><motion.span aria-hidden className="absolute inset-y-[-35%] left-0 w-1/3 bg-white/28 blur-lg" animate={{ x: ["-160%", "330%"], opacity: [0, 0.28, 0] }} transition={{ duration: 3.4, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }} /></> : null}
            <span className={`relative grid h-8 w-8 shrink-0 place-items-center rounded-[9px] border ${canApply ? "border-black/10 bg-black/[0.08] text-[#07331f]" : activeSaving ? "border-[#d9bb65]/15 bg-[#d9bb65]/[0.04] text-[#d9c47b]" : "border-white/[0.07] bg-white/[0.018] text-white/28"}`}>
              {activeSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            </span>
            <span className="relative ml-3 min-w-0 flex-1">
              <strong className={`block truncate text-[12px] font-semibold ${canApply ? "text-[#07331f]" : activeSaving ? "text-[#d9c47b]" : "text-white/52"}`}>{activeSaving ? "Confirming" : feeApplyBlocked && activeDirty ? "Resolve routes" : APPLY_LABELS[section]}</strong>
              <span className={`mt-1 block truncate text-[10px] font-medium ${canApply ? "text-[#0b5638]/80" : "text-white/34"}`}>{canApply ? section === "fees" ? "Review changes before signing" : "Continue to wallet approval" : activeDirty ? "Complete required settings" : "No unapplied changes"}</span>
            </span>
          </button>
          <div className="mt-4 hidden px-1 lg:block">
            <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.11em] text-white/38"><Wallet className="h-3 w-3" />Wallet approval required</div>
          </div>
        </aside>

        <div className="min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            {section === "profile" ? (
              <motion.div key="profile" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }} className="space-y-5">
                <div><h2 className="text-[22px] font-semibold tracking-[-0.025em] text-white/95">Token profile</h2><p className="mt-2 max-w-2xl text-[12.5px] font-light leading-5 text-white/55">Control how the token appears across based bid, Boards and shared discovery surfaces.</p></div>
                <Panel className="p-5 sm:p-6">
                  <div className="grid items-stretch gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
                    <div className="flex min-h-0 flex-col">
                      <FieldLabel title="Token logo" detail="Square PNG, JPG or WebP" />
                      <button type="button" onClick={() => inputRef.current?.click()} className="group relative grid min-h-[230px] w-full flex-1 place-items-center overflow-hidden rounded-[16px] border border-dashed border-white/[0.16] bg-[#0f1311] transition hover:border-[#18c98e]/42 hover:bg-[#18c98e]/[0.035]">
                        {logoUrl ? <Image unoptimized src={logoUrl} alt="Selected token logo" fill className="object-cover" /> : <><span className="grid h-24 w-24 place-items-center rounded-full border border-white/[0.14] bg-[#181d1b] text-[21px] font-bold shadow-[inset_0_1px_rgba(255,255,255,0.035),0_12px_30px_rgba(0,0,0,0.2)]" style={{ color: token.accent }}>{token.ticker.slice(0, 2)}</span><span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-white/58 group-hover:text-[#8fe3bf]"><Upload className="h-4 w-4" />Replace logo</span></>}
                      </button>
                      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => selectLogo(event.target.files?.[0])} />
                    </div>
                    <div className="space-y-5">
                      <div><FieldLabel title="Description" detail="Keep it concise and useful across token cards and the terminal." /><div className="flex h-[152px] flex-col rounded-[12px] border border-white/[0.12] bg-[#111513] p-3.5 transition focus-within:border-[#18c98e]/40"><textarea value={description} onChange={(event) => update("profile", setDescription)(event.target.value)} maxLength={240} className="min-h-0 w-full flex-1 resize-none bg-transparent text-[13.5px] font-light leading-5 text-white/86 outline-none placeholder:text-white/32" /><div className="mt-2 text-right font-mono text-[9.5px] text-white/34">{description.length}/240</div></div></div>
                      <div className="grid gap-4 sm:grid-cols-2"><div><FieldLabel title="Website" optional /><TextField value={website} onChange={update("profile", setWebsite)} placeholder="https://" /></div><div><FieldLabel title="X profile" optional /><TextField value={social} onChange={update("profile", setSocial)} placeholder="https://x.com/" /></div></div>
                    </div>
                  </div>
                </Panel>
              </motion.div>
            ) : null}

            {section === "identity" ? (
              <motion.div key="identity" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }} className="space-y-5">
                <div><div className="flex flex-wrap items-center gap-2"><h2 className="text-[22px] font-semibold tracking-[-0.025em] text-white/95">Token identity</h2><StatusPill tone={mutableIdentity ? "green" : "neutral"}>{mutableIdentity ? "Mutable metadata" : "Contract locked"}</StatusPill></div><p className="mt-2 max-w-2xl text-[12.5px] font-light leading-5 text-white/55">Identity edits follow the rules of the deployed network and token standard.</p></div>
                <Panel className="overflow-hidden">
                  <div className="flex items-start gap-3 border-b border-white/[0.085] px-5 py-4 sm:px-6"><span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border ${mutableIdentity ? "border-[#18c98e]/24 bg-[#18c98e]/[0.07] text-[#70dcb0]" : "border-white/[0.10] bg-white/[0.03] text-white/40"}`}>{mutableIdentity ? <KeyRound className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}</span><div><strong className="text-[12.5px] font-semibold text-white/86">{mutableIdentity ? "Solana update authority detected" : `${token.networkLabel} token identity is immutable`}</strong><p className="mt-1 text-[11px] font-light leading-5 text-white/48">{mutableIdentity ? "Name, symbol and logo updates require approval from the current metadata authority." : "The token contract permanently defines its name and symbol. Profile presentation remains editable."}</p></div></div>
                  <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6"><div><FieldLabel title="Token name" detail={mutableIdentity ? "Written to token metadata" : "Read from the deployed contract"} /><TextField value={title} onChange={update("identity", setTitle)} disabled={!mutableIdentity} maxLength={32} /></div><div><FieldLabel title="Symbol" detail={mutableIdentity ? "Displayed across wallets and markets" : "Read from the deployed contract"} /><TextField value={ticker} onChange={update("identity", setTicker)} disabled={!mutableIdentity} maxLength={10} /></div></div>
                </Panel>
                <Panel className="p-5 sm:p-6"><div className="flex items-center justify-between gap-4"><div className="flex min-w-0 items-center gap-3"><Image unoptimized src={NETWORK_ICONS[token.network]} alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" /><div className="min-w-0"><strong className="block truncate text-[13px] font-semibold text-white/88">{token.networkLabel}</strong><span className="mt-1 block truncate font-mono text-[10.5px] text-white/46">{token.contract}</span></div></div><a href="#" className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/52 transition hover:text-white/82"><Link2 className="h-4 w-4" />Explorer</a></div></Panel>
              </motion.div>
            ) : null}

            {section === "fees" ? (
              <motion.div key="fees" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }} className="space-y-5">
                <div className="flex flex-wrap items-end justify-between gap-4"><div><div className="flex items-center gap-2"><h2 className="text-[22px] font-semibold tracking-[-0.025em] text-white/95">Fee Builder</h2><StatusPill tone="gold">{feeTotal}% configured</StatusPill></div><p className="mt-2 max-w-2xl text-[12.5px] font-light leading-5 text-white/55">Adjust fee routes, reward baskets, payout order and programmable trading mechanics.</p></div><div className="flex items-center gap-2 text-[10.5px] text-white/48"><Info className="h-4 w-4 text-[#d6bf76]/70" /><span>Changes activate after wallet approval</span></div></div>
                <Panel className="p-4 sm:p-6"><FeeBuilderPanel chain={token.network} walletAddress={ownerAddress} initialFees={appliedFeeRoutes} onTotalChange={setFeeTotal} onIssuesChange={setFeeIssues} onChange={updateFeeDraft} /></Panel>
                <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-[10.5px] text-white/44"><span>Fee engine activates automatically after bonding completes.</span><span className={feeIssues ? "text-[#e5c96f]" : "text-[#77d8ad]"}>{feeIssues ? `${feeIssues} configuration ${feeIssues === 1 ? "item" : "items"} need attention` : "All routes ready"}</span></div>
              </motion.div>
            ) : null}

            {section === "permissions" ? (
              <motion.div key="permissions" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }} className="space-y-5">
                <div><div className="flex items-center gap-2"><h2 className="text-[22px] font-semibold tracking-[-0.025em] text-white/95">Permissions</h2><StatusPill tone="green">Verified</StatusPill></div><p className="mt-2 max-w-2xl text-[12.5px] font-light leading-5 text-white/55">Review the wallets allowed to update this token and its programmable routes.</p></div>
                <Panel className="overflow-hidden">
                  {[{ icon: UserRound, title: "Creator wallet", value: ownerAddress, meta: "Can update token profile and Fee Builder" }, { icon: KeyRound, title: "Metadata authority", value: mutableIdentity ? ownerAddress : "Locked by token contract", meta: mutableIdentity ? "Can update Solana token metadata" : "No mutable metadata authority" }, { icon: ShieldCheck, title: "Fee Builder authority", value: ownerAddress, meta: "Changes require an onchain signature" }].map((item, index) => { const Icon = item.icon; return <div key={item.title} className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:px-6 ${index ? "border-t border-white/[0.085]" : ""}`}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] border border-white/[0.10] bg-white/[0.03] text-white/48"><Icon className="h-[18px] w-[18px]" /></span><div className="min-w-0 flex-1"><strong className="text-[12.5px] font-semibold text-white/86">{item.title}</strong><p className="mt-1 text-[11px] font-light text-white/46">{item.meta}</p></div><span className="truncate font-mono text-[10.5px] text-white/58 sm:max-w-[280px]">{item.value}</span></div>; })}
                </Panel>
                <Panel className="border-[#d9bb65]/18 bg-[linear-gradient(110deg,rgba(217,187,101,0.055),rgba(18,22,20,0.98)_42%)] p-5 sm:p-6"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] border border-[#d9bb65]/22 bg-[#d9bb65]/[0.065] text-[#e0cc86]"><KeyRound className="h-[18px] w-[18px]" /></span><div><strong className="text-[13.5px] font-semibold text-white/88">Transfer management authority</strong><p className="mt-1.5 max-w-2xl text-[11px] font-light leading-5 text-white/48">Move token management to another wallet. The receiving wallet must accept before the transfer becomes active.</p><button type="button" className="mt-4 h-9 rounded-[9px] border border-[#d9bb65]/24 bg-[#d9bb65]/[0.055] px-3.5 text-[10.5px] font-semibold text-[#e2cf91] transition hover:border-[#d9bb65]/38 hover:bg-[#d9bb65]/[0.09]">Start authority transfer</button></div></div></Panel>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence>
        {feeReviewOpen ? (
          <motion.div className="fixed inset-0 z-[900] grid place-items-center px-4 py-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            <button type="button" aria-label="Close Fee Builder review" onClick={() => setFeeReviewOpen(false)} className="absolute inset-0 cursor-default bg-black/72 backdrop-blur-[3px]" />
            <motion.section role="dialog" aria-modal="true" aria-labelledby="fee-review-title" initial={{ opacity: 0, y: 14, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.99 }} transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }} className="relative w-full max-w-[780px] overflow-hidden rounded-[22px] border border-white/[0.11] bg-[#111513] shadow-[0_34px_100px_rgba(0,0,0,0.68),inset_0_1px_rgba(255,255,255,0.028)]">
              <header className="flex items-start gap-3.5 px-6 pb-5 pt-6">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] border border-[#d9bb65]/20 bg-[#d9bb65]/[0.05] text-[#e3cd83]"><SlidersHorizontal className="h-[18px] w-[18px]" /></span>
                <div className="min-w-0 flex-1">
                  <h2 id="fee-review-title" className="text-[19px] font-semibold tracking-[-0.025em] text-white/94">Review Fee Builder changes</h2>
                  <p className="mt-1 text-[11.5px] font-light text-white/44">Confirm the previous and new values before requesting wallet approval.</p>
                </div>
                <button type="button" onClick={() => setFeeReviewOpen(false)} aria-label="Close review" className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] text-white/30 transition hover:bg-white/[0.04] hover:text-white/72"><X className="h-4 w-4" /></button>
              </header>

              <div className="border-y border-white/[0.08]">
                <div className="grid grid-cols-[minmax(130px,0.72fr)_minmax(200px,1fr)_28px_minmax(200px,1fr)] items-center gap-3 bg-black/[0.08] px-6 py-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/34">
                  <span>Setting</span><span>Previous</span><span /><span>New</span>
                </div>
                <div className="max-h-[420px] divide-y divide-white/[0.065] overflow-y-auto [scrollbar-color:#303a36_transparent] [scrollbar-width:thin]">
                  {feeChanges.map((change, index) => (
                    <div key={`${change.label}-${index}`} className={`grid grid-cols-[minmax(130px,0.72fr)_minmax(200px,1fr)_28px_minmax(200px,1fr)] items-center gap-3 px-6 py-3.5 ${change.label === "Total fee" ? "bg-[#d9bb65]/[0.025]" : ""}`}>
                      <span className={`text-[11px] font-medium leading-4 ${change.label === "Total fee" ? "text-[#ead58b]" : "text-white/48"}`}>{change.label}</span>
                      <ReviewValue value={change.previous} assets={change.previousAssets} />
                      <ChevronRight className="mx-auto h-4 w-4 text-white/24" />
                      <ReviewValue value={change.next} assets={change.nextAssets} next />
                    </div>
                  ))}
                </div>
              </div>

              <footer className="flex items-center justify-between gap-4 px-6 py-5">
                <div className="flex min-w-0 items-center gap-2 text-[10px] text-white/40"><Image unoptimized src={NETWORK_ICONS[token.network]} alt="" width={18} height={18} className="h-[18px] w-[18px] rounded-full" /><span className="truncate">{token.networkLabel}</span><span className="text-white/16">·</span><span className="truncate font-mono">{shortWallet(wallet.address ?? ownerAddress)}</span></div>
                <div className="flex shrink-0 items-center gap-2">
                  <button type="button" onClick={() => setFeeReviewOpen(false)} className="h-10 rounded-[9px] px-3 text-[11px] font-semibold text-white/46 transition hover:bg-white/[0.035] hover:text-white/78">Cancel</button>
                  <button type="button" onClick={() => { setFeeReviewOpen(false); applySection("fees"); }} className="h-11 rounded-[11px] border border-[#dfca81]/36 bg-[linear-gradient(110deg,#d3b963,#f0dd93)] px-6 text-[11.5px] font-semibold text-[#261f0b] shadow-[0_10px_28px_rgba(211,185,99,0.16)] transition hover:border-[#f1df9c]/60 hover:brightness-105">Continue to wallet</button>
                </div>
              </footer>
            </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
