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

type ManageSection = "profile" | "identity" | "fees" | "permissions";

const NETWORK_ICONS: Record<LbpTokenDetail["network"], string> = {
  base: "/networks/base.svg",
  bsc: "/networks/bnb-chain.svg",
  eth: "/tokens/ethereum.png",
  robinhood: "/networks/robinhood.svg",
  sol: "/tokens/solana.png",
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

function StatusPill({ children, tone = "green" }: { children: React.ReactNode; tone?: "green" | "gold" | "neutral" }) {
  const styles = tone === "green"
    ? "border-[#18c98e]/20 bg-[#18c98e]/[0.06] text-[#8fe3bf]"
    : tone === "gold"
      ? "border-[#d9bb65]/22 bg-[#d9bb65]/[0.055] text-[#dccb91]"
      : "border-white/[0.085] bg-white/[0.025] text-white/46";
  return <span className={`inline-flex h-6 items-center rounded-full border px-2.5 text-[8.5px] font-semibold uppercase tracking-[0.1em] ${styles}`}>{children}</span>;
}

function FieldLabel({ title, detail, optional = false }: { title: string; detail?: string; optional?: boolean }) {
  return (
    <div className="mb-2 flex items-end justify-between gap-3">
      <div>
        <label className="text-[11px] font-semibold text-white/82">{title}</label>
        {detail ? <p className="mt-1 text-[9.5px] font-light text-white/35">{detail}</p> : null}
      </div>
      {optional ? <span className="text-[8px] uppercase tracking-[0.12em] text-white/22">Optional</span> : null}
    </div>
  );
}

function TextField({ value, onChange, disabled = false, maxLength, placeholder }: { value: string; onChange: (value: string) => void; disabled?: boolean; maxLength?: number; placeholder?: string }) {
  return (
    <div className={`flex min-h-11 items-center rounded-[10px] border px-3.5 transition ${disabled ? "border-white/[0.055] bg-black/20" : "border-white/[0.095] bg-[#0b0e0d] focus-within:border-[#18c98e]/34 focus-within:bg-[#0d1210]"}`}>
      <input value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} maxLength={maxLength} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent text-[11.5px] font-medium text-white/83 outline-none placeholder:text-white/23 disabled:text-white/35" />
      {maxLength ? <span className="ml-3 font-mono text-[8.5px] tabular-nums text-white/22">{value.length}/{maxLength}</span> : null}
      {disabled ? <LockKeyhole className="ml-3 h-3.5 w-3.5 text-white/22" /> : null}
    </div>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-[18px] border border-white/[0.075] bg-[#0c0f0e] shadow-[inset_0_1px_rgba(255,255,255,0.018)] ${className}`}>{children}</section>;
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
  const feeRoutes = React.useMemo(() => initialFeeRoutes(token), [token]);
  const activeDirty = dirtySections.has(section);
  const activeSaving = savingSection === section;
  const feeApplyBlocked = section === "fees" && feeIssues > 0;
  const canApply = activeDirty && !savingSection && !feeApplyBlocked;

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  React.useEffect(() => () => {
    if (logoUrl) URL.revokeObjectURL(logoUrl);
  }, [logoUrl]);

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
  const applySection = () => {
    if (!canApply) return;
    const targetSection = section;
    const targetLabel = SECTION_META.find((item) => item.id === targetSection)?.label ?? "Settings";
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
    <main className={isDrawer ? "min-h-full bg-[#090a0a] text-white" : "min-h-[calc(100vh-100px)] bg-[#090a0a] text-white"}>
      <header className="sticky top-0 z-40 border-b border-white/[0.065] bg-[#090b0a]/94 backdrop-blur-xl">
        <div className={`mx-auto flex min-h-[72px] items-center gap-4 px-5 lg:px-8 ${isDrawer ? "max-w-none" : "max-w-[1240px]"}`}>
          {isDrawer ? (
            <button type="button" onClick={onClose} aria-label="Close token management" className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] text-white/34 transition hover:bg-white/[0.04] hover:text-white/82"><X className="h-4 w-4" /></button>
          ) : (
            <SmartBackButton fallbackHref={`/token/${token.id}`} ariaLabel="Back to token terminal" className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-[10px] border border-white/[0.07] text-white/42 transition hover:border-white/[0.13] hover:bg-white/[0.035] hover:text-white/82"><ArrowLeft className="h-4 w-4" /></SmartBackButton>
          )}
          <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-[#111513] text-[11px] font-bold" style={{ color: token.accent }}>{token.ticker.slice(0, 2)}<Image unoptimized src={NETWORK_ICONS[token.network]} alt="" width={15} height={15} className="absolute -bottom-0.5 -right-0.5 h-[15px] w-[15px] rounded-full bg-[#090a0a] object-cover ring-2 ring-[#090a0a]" /></div>
          <div className="min-w-0">
            <div className="flex items-center gap-2"><h1 className="truncate text-[15px] font-semibold tracking-[-0.02em] text-white/92">Manage {token.title}</h1><StatusPill tone="green">Creator</StatusPill></div>
            <p className="mt-1 truncate text-[9.5px] font-light text-white/37">Update token presentation, Fee Builder routes and authorities</p>
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            <button
              type="button"
              onClick={applySection}
              disabled={!canApply}
              className={`group relative inline-flex h-9 min-w-[142px] items-center justify-center overflow-hidden rounded-full border px-4 transition-[border-color,box-shadow,transform] duration-500 ease-[cubic-bezier(.22,1,.36,1)] active:scale-[0.985] ${canApply ? "border-[#18c98e]/65 shadow-[0_12px_30px_rgba(24,201,142,0.18)] hover:shadow-[0_14px_34px_rgba(24,201,142,0.25)]" : "cursor-default border-white/[0.085] bg-white/[0.018]"}`}
            >
              {canApply ? <><motion.span aria-hidden className="absolute inset-0 bg-[linear-gradient(110deg,#0edb86_0%,#36eba6_42%,#f5d97a_82%,#18c98e_100%)] bg-[length:220%_100%]" animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }} transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }} /><motion.span aria-hidden className="absolute inset-y-[-35%] left-0 w-1/3 bg-white/30 blur-lg" animate={{ x: ["-160%", "330%"], opacity: [0, 0.32, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }} /></> : null}
              <span className={`relative inline-flex items-center justify-center gap-2 text-[10px] font-semibold ${canApply ? "text-[#07331f]" : activeSaving ? "text-[#d9c47b]" : "text-white/38"}`}>
                {activeSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                <span>{activeSaving ? "Confirming" : feeApplyBlocked && activeDirty ? "Resolve routes" : APPLY_LABELS[section]}</span>
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className={`mx-auto grid grid-cols-1 gap-6 px-5 py-7 lg:grid-cols-[230px_minmax(0,1fr)] lg:px-8 lg:py-9 ${isDrawer ? "max-w-none" : "max-w-[1240px]"}`}>
        <aside className="lg:sticky lg:top-[100px] lg:self-start">
          <nav className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1" aria-label="Token management sections">
            {SECTION_META.map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button key={item.id} type="button" onClick={() => setSection(item.id)} className={`group flex min-w-0 items-center gap-3 rounded-[12px] border px-3 py-3 text-left transition ${active ? "border-[#18c98e]/22 bg-[#18c98e]/[0.055] shadow-[inset_2px_0_#18c98e]" : "border-transparent text-white/46 hover:border-white/[0.07] hover:bg-white/[0.025] hover:text-white/72"}`}>
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-[9px] border ${active ? "border-[#18c98e]/20 bg-[#18c98e]/[0.07] text-[#65ddb0]" : "border-white/[0.065] bg-white/[0.018] text-white/30"}`}><Icon className="h-3.5 w-3.5" /></span>
                  <span className="min-w-0"><strong className={`block truncate text-[10.5px] font-semibold ${active ? "text-white/88" : ""}`}>{item.label}</strong><span className="mt-1 hidden truncate text-[8.5px] font-light text-white/28 lg:block">{item.detail}</span></span>
                  {dirtySections.has(item.id) ? <span aria-label={`${item.label} has unapplied changes`} className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#f5d97a] shadow-[0_0_8px_rgba(245,217,122,0.45)]" /> : null}
                  <ChevronRight className={`${dirtySections.has(item.id) ? "ml-0" : "ml-auto"} hidden h-3.5 w-3.5 lg:block ${active ? "text-[#18c98e]/62" : "text-white/13"}`} />
                </button>
              );
            })}
          </nav>
          <div className="mt-5 hidden border-t border-white/[0.06] pt-5 lg:block">
            <div className="flex items-center gap-2 text-[8.5px] uppercase tracking-[0.12em] text-white/26"><Wallet className="h-3.5 w-3.5" />Managing as</div>
            <p className="mt-2 truncate font-mono text-[9.5px] text-white/46">{ownerAddress ? `${ownerAddress.slice(0, 6)}...${ownerAddress.slice(-4)}` : "Unavailable"}</p>
          </div>
        </aside>

        <div className="min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            {section === "profile" ? (
              <motion.div key="profile" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }} className="space-y-5">
                <div><h2 className="text-[19px] font-semibold tracking-[-0.025em] text-white/93">Token profile</h2><p className="mt-2 max-w-2xl text-[11px] font-light leading-5 text-white/39">Control how the token appears across Based Bid, Boards and shared discovery surfaces.</p></div>
                <Panel className="p-5 sm:p-6">
                  <div className="grid items-stretch gap-6 md:grid-cols-[200px_minmax(0,1fr)]">
                    <div className="flex min-h-0 flex-col">
                      <FieldLabel title="Token logo" detail="Square PNG, JPG or WebP" />
                      <button type="button" onClick={() => inputRef.current?.click()} className="group relative grid min-h-[230px] w-full flex-1 place-items-center overflow-hidden rounded-[16px] border border-dashed border-white/[0.12] bg-[#090b0a] transition hover:border-[#18c98e]/32 hover:bg-[#18c98e]/[0.025]">
                        {logoUrl ? <Image unoptimized src={logoUrl} alt="Selected token logo" fill className="object-cover" /> : <><span className="grid h-14 w-14 place-items-center rounded-full border border-white/[0.09] bg-white/[0.025] text-[14px] font-bold" style={{ color: token.accent }}>{token.ticker.slice(0, 2)}</span><span className="mt-3 inline-flex items-center gap-1.5 text-[9.5px] font-medium text-white/42 group-hover:text-[#8fe3bf]"><Upload className="h-3.5 w-3.5" />Replace logo</span></>}
                      </button>
                      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => selectLogo(event.target.files?.[0])} />
                    </div>
                    <div className="space-y-5">
                      <div><FieldLabel title="Description" detail="Keep it concise and useful across token cards and the terminal." /><div className="flex h-[146px] flex-col rounded-[12px] border border-white/[0.095] bg-[#0a0d0c] p-3.5 transition focus-within:border-[#18c98e]/34"><textarea value={description} onChange={(event) => update("profile", setDescription)(event.target.value)} maxLength={240} className="min-h-0 w-full flex-1 resize-none bg-transparent text-[11.5px] font-light leading-5 text-white/76 outline-none placeholder:text-white/22" /><div className="mt-2 text-right font-mono text-[8.5px] text-white/22">{description.length}/240</div></div></div>
                      <div className="grid gap-4 sm:grid-cols-2"><div><FieldLabel title="Website" optional /><TextField value={website} onChange={update("profile", setWebsite)} placeholder="https://" /></div><div><FieldLabel title="X profile" optional /><TextField value={social} onChange={update("profile", setSocial)} placeholder="https://x.com/" /></div></div>
                    </div>
                  </div>
                </Panel>
              </motion.div>
            ) : null}

            {section === "identity" ? (
              <motion.div key="identity" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }} className="space-y-5">
                <div><div className="flex flex-wrap items-center gap-2"><h2 className="text-[19px] font-semibold tracking-[-0.025em] text-white/93">Token identity</h2><StatusPill tone={mutableIdentity ? "green" : "neutral"}>{mutableIdentity ? "Mutable metadata" : "Contract locked"}</StatusPill></div><p className="mt-2 max-w-2xl text-[11px] font-light leading-5 text-white/39">Identity edits follow the rules of the deployed network and token standard.</p></div>
                <Panel className="overflow-hidden">
                  <div className="flex items-start gap-3 border-b border-white/[0.065] px-5 py-4 sm:px-6"><span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[9px] border ${mutableIdentity ? "border-[#18c98e]/18 bg-[#18c98e]/[0.05] text-[#70dcb0]" : "border-white/[0.07] bg-white/[0.02] text-white/28"}`}>{mutableIdentity ? <KeyRound className="h-3.5 w-3.5" /> : <LockKeyhole className="h-3.5 w-3.5" />}</span><div><strong className="text-[11px] font-semibold text-white/78">{mutableIdentity ? "Solana update authority detected" : `${token.networkLabel} token identity is immutable`}</strong><p className="mt-1 text-[9.5px] font-light leading-4 text-white/34">{mutableIdentity ? "Name, symbol and logo updates require approval from the current metadata authority." : "The token contract permanently defines its name and symbol. Profile presentation remains editable."}</p></div></div>
                  <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6"><div><FieldLabel title="Token name" detail={mutableIdentity ? "Written to token metadata" : "Read from the deployed contract"} /><TextField value={title} onChange={update("identity", setTitle)} disabled={!mutableIdentity} maxLength={32} /></div><div><FieldLabel title="Symbol" detail={mutableIdentity ? "Displayed across wallets and markets" : "Read from the deployed contract"} /><TextField value={ticker} onChange={update("identity", setTicker)} disabled={!mutableIdentity} maxLength={10} /></div></div>
                </Panel>
                <Panel className="p-5 sm:p-6"><div className="flex items-center justify-between gap-4"><div className="flex min-w-0 items-center gap-3"><Image unoptimized src={NETWORK_ICONS[token.network]} alt="" width={34} height={34} className="h-9 w-9 rounded-full object-cover" /><div className="min-w-0"><strong className="block truncate text-[11.5px] font-semibold text-white/82">{token.networkLabel}</strong><span className="mt-1 block truncate font-mono text-[9px] text-white/31">{token.contract}</span></div></div><a href="#" className="inline-flex items-center gap-1.5 text-[9.5px] font-medium text-white/38 transition hover:text-white/72"><Link2 className="h-3.5 w-3.5" />Explorer</a></div></Panel>
              </motion.div>
            ) : null}

            {section === "fees" ? (
              <motion.div key="fees" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }} className="space-y-5">
                <div className="flex flex-wrap items-end justify-between gap-4"><div><div className="flex items-center gap-2"><h2 className="text-[19px] font-semibold tracking-[-0.025em] text-white/93">Fee Builder</h2><StatusPill tone="gold">{feeTotal}% configured</StatusPill></div><p className="mt-2 max-w-2xl text-[11px] font-light leading-5 text-white/39">Adjust fee routes, reward baskets, payout order and programmable trading mechanics.</p></div><div className="flex items-center gap-2 text-[9px] text-white/31"><Info className="h-3.5 w-3.5 text-[#d6bf76]/54" /><span>Changes activate after wallet approval</span></div></div>
                <Panel className="p-4 sm:p-6"><FeeBuilderPanel chain={token.network} walletAddress={ownerAddress} initialFees={feeRoutes} onTotalChange={setFeeTotal} onIssuesChange={setFeeIssues} onChange={() => markDirty("fees")} /></Panel>
                <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-[9px] text-white/28"><span>Fee engine activates automatically after bonding completes.</span><span className={feeIssues ? "text-[#e5c96f]" : "text-[#77d8ad]"}>{feeIssues ? `${feeIssues} configuration ${feeIssues === 1 ? "item" : "items"} need attention` : "All routes ready"}</span></div>
              </motion.div>
            ) : null}

            {section === "permissions" ? (
              <motion.div key="permissions" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }} className="space-y-5">
                <div><div className="flex items-center gap-2"><h2 className="text-[19px] font-semibold tracking-[-0.025em] text-white/93">Permissions</h2><StatusPill tone="green">Verified</StatusPill></div><p className="mt-2 max-w-2xl text-[11px] font-light leading-5 text-white/39">Review the wallets allowed to update this token and its programmable routes.</p></div>
                <Panel className="overflow-hidden">
                  {[{ icon: UserRound, title: "Creator wallet", value: ownerAddress, meta: "Can update token profile and Fee Builder" }, { icon: KeyRound, title: "Metadata authority", value: mutableIdentity ? ownerAddress : "Locked by token contract", meta: mutableIdentity ? "Can update Solana token metadata" : "No mutable metadata authority" }, { icon: ShieldCheck, title: "Fee Builder authority", value: ownerAddress, meta: "Changes require an onchain signature" }].map((item, index) => { const Icon = item.icon; return <div key={item.title} className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:px-6 ${index ? "border-t border-white/[0.06]" : ""}`}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-white/[0.07] bg-white/[0.02] text-white/34"><Icon className="h-4 w-4" /></span><div className="min-w-0 flex-1"><strong className="text-[11px] font-semibold text-white/76">{item.title}</strong><p className="mt-1 text-[9.5px] font-light text-white/31">{item.meta}</p></div><span className="truncate font-mono text-[9.5px] text-white/43 sm:max-w-[260px]">{item.value}</span></div>; })}
                </Panel>
                <Panel className="border-[#d9bb65]/12 bg-[linear-gradient(110deg,rgba(217,187,101,0.035),rgba(12,15,14,0.98)_42%)] p-5 sm:p-6"><div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-[#d9bb65]/15 bg-[#d9bb65]/[0.045] text-[#d8c57e]"><KeyRound className="h-4 w-4" /></span><div><strong className="text-[11.5px] font-semibold text-white/82">Transfer management authority</strong><p className="mt-1.5 max-w-2xl text-[9.5px] font-light leading-4 text-white/34">Move token management to another wallet. The receiving wallet must accept before the transfer becomes active.</p><button type="button" className="mt-4 h-8 rounded-[8px] border border-[#d9bb65]/18 bg-[#d9bb65]/[0.035] px-3 text-[9px] font-semibold text-[#d8c98f] transition hover:border-[#d9bb65]/32 hover:bg-[#d9bb65]/[0.07]">Start authority transfer</button></div></div></Panel>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
