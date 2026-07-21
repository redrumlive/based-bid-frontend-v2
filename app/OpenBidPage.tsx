"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import React from "react";
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  Crown,
  Eye,
  Globe,
  ImagePlus,
  Lock,
  MessageSquare,
  Pencil,
  Play,
  Send,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import CreateBackLink from "./create/CreateBackLink";

type VisibilityMode = "public" | "private" | "limited" | "request";
type ApiPlan = "10" | "25" | "50";
type PlanKey = "based" | "super" | "ultra";
type FeeKey = "buy" | "sell" | "graduation" | "lbp";
type SocialKey = "website" | "telegram" | "twitter" | "discord" | "tiktok" | "youtube";
type FeeState = Record<PlanKey, Record<FeeKey, number>>;
type SocialState = Record<SocialKey, string>;
type IconComponent = React.ComponentType<{ className?: string; strokeWidth?: number }>;

const GREEN = "#18c98e";
const VIOLET = "#a78bfa";
const GOLD = "#e7be67";

const PLAN_OPTIONS: Array<{ key: ApiPlan; title: string; rps: string; price: string }> = [
  { key: "10", title: "Starter", rps: "10", price: "$10" },
  { key: "25", title: "Growth", rps: "25", price: "$49" },
  { key: "50", title: "Scale", rps: "50", price: "$99" },
];

const PLAN_META: Record<PlanKey, { title: string; color: string; listing: string }> = {
  based: { title: "Based", color: GREEN, listing: "0" },
  super: { title: "Super Based", color: VIOLET, listing: "0.018" },
  ultra: { title: "Ultra Based", color: GOLD, listing: "0.036" },
};

const INITIAL_FEES: FeeState = {
  based: { buy: 3, sell: 3, graduation: 3, lbp: 50 },
  super: { buy: 2, sell: 2, graduation: 2, lbp: 50 },
  ultra: { buy: 1, sell: 1, graduation: 1, lbp: 50 },
};

const VISIBILITY_OPTIONS: Array<{
  key: VisibilityMode;
  title: string;
  description: string;
  icon: IconComponent;
}> = [
  { key: "public", title: "Public", description: "Visible and accessible to everyone after creation.", icon: Eye },
  { key: "private", title: "Private", description: "Only invited users can access and participate.", icon: Lock },
  { key: "limited", title: "Limited", description: "Visible to all, but only owners can publish projects.", icon: Crown },
  { key: "request", title: "Request to join", description: "Users request access before participating.", icon: MessageSquare },
];

const SOCIAL_FIELDS: Array<{ key: SocialKey; label: string; icon: IconComponent }> = [
  { key: "website", label: "Website URL", icon: Globe },
  { key: "telegram", label: "Telegram URL", icon: Send },
  { key: "twitter", label: "X URL", icon: X },
  { key: "discord", label: "Discord URL", icon: MessageSquare },
  { key: "tiktok", label: "TikTok URL", icon: Play },
  { key: "youtube", label: "YouTube URL", icon: Play },
];

const cx = (...items: Array<string | false | null | undefined>) => items.filter(Boolean).join(" ");
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const countFilled = (values: string[]) => values.filter((value) => value.trim().length > 0).length;

const UI = {
  panel: "rounded-2xl border border-white/10 bg-[#101111] shadow-[inset_0_1px_0_rgba(255,255,255,0.018)]",
  input: "rounded-xl border border-white/10 bg-[#141515] text-white/86 outline-none ring-1 ring-inset ring-white/[0.025] transition placeholder:text-white/28 focus:border-[#18c98e]/45 focus:ring-[#18c98e]/10",
} as const;

function SectionHeader({ icon: Icon, title, description, tag }: { icon: IconComponent; title: string; description: string; tag?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/[0.075] px-5 py-4 sm:px-6">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[10px] border border-white/10 bg-white/[0.025] text-white/58">
          <Icon className="h-4 w-4" strokeWidth={1.8} />
        </span>
        <div className="min-w-0">
          <h2 className="text-[14px] font-semibold tracking-[-0.015em] text-white/90">{title}</h2>
          <p className="mt-1 text-[11.5px] leading-5 text-white/42">{description}</p>
        </div>
      </div>
      {tag ? <span className="mt-0.5 shrink-0 rounded-full border border-white/10 bg-white/[0.025] px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.16em] text-white/38">{tag}</span> : null}
    </div>
  );
}

function RequiredPill({ complete }: { complete: boolean }) {
  return (
    <span
      className={cx(
        "inline-flex h-[17px] w-[58px] items-center justify-center rounded-full border text-[7px] font-semibold uppercase tracking-[0.12em] transition-[border-color,background-color,color] duration-300",
        complete
          ? "border-[#18c98e]/30 bg-[#18c98e]/[0.055] text-[#7bea9e]/88"
          : "border-[#F5C451]/30 bg-[#F5C451]/[0.035] text-[#F5D97A]/76",
      )}
    >
      <span>Required</span>
    </span>
  );
}

function Field({ label, value, onChange, placeholder, textarea, hint, required }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; textarea?: boolean; hint?: string; required?: boolean }) {
  const complete = value.trim().length > 0;
  return (
    <label className="block min-w-0">
      <span className="mb-2 flex items-center justify-between gap-3 text-[11px] font-medium text-white/64">
        <span className="inline-flex items-center gap-1.5">
          <span>{label}</span>
          {required ? <RequiredPill complete={complete} /> : null}
        </span>
        {hint ? <span className="font-normal tabular-nums text-white/28">{hint}</span> : null}
      </span>
      {textarea ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={8} className={cx("min-h-[224px] w-full resize-y px-4 py-3 text-[13px] leading-5", UI.input)} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={cx("h-10 w-full px-4 text-[13px]", UI.input)} />
      )}
    </label>
  );
}

function SocialInput({ field, value, onChange }: { field: (typeof SOCIAL_FIELDS)[number]; value: string; onChange: (value: string) => void }) {
  const Icon = field.icon;
  return (
    <label className="relative block min-w-0">
      <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/28" strokeWidth={1.8} />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={field.label} className={cx("h-10 w-full pl-10 pr-3 text-[12px]", UI.input)} />
    </label>
  );
}

function AssetUpload({ kind, source, onChange, onClear, required }: { kind: "banner" | "logo"; source?: string; onChange: (source: string) => void; onClear: () => void; required?: boolean }) {
  const isLogo = kind === "logo";
  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium capitalize text-white/64">
            <span>{kind}</span>
            {required ? <RequiredPill complete={Boolean(source)} /> : null}
          </div>
          <div className="mt-0.5 text-[9px] text-white/28">Recommended {isLogo ? "1:1" : "9:1"}</div>
        </div>
        {source ? (
          <button type="button" onClick={onClear} aria-label={`Remove ${kind}`} className="grid h-7 w-7 cursor-pointer place-items-center rounded-lg text-white/28 transition hover:bg-[#ff3771]/[0.07] hover:text-[#ff779e]">
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
      <label className="group relative flex h-[113px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/12 bg-[#0d0e0e] transition hover:border-[#18c98e]/36 hover:bg-[#101412]">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onChange(URL.createObjectURL(file));
          }}
        />
        {source ? (
          <Image unoptimized src={source} alt={`${kind} preview`} fill sizes="360px" className={cx("object-cover transition duration-500 group-hover:scale-[1.015]", isLogo && "object-contain p-4")} />
        ) : (
          <span className="flex flex-col items-center text-center">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.025] text-white/42 transition group-hover:border-[#18c98e]/25 group-hover:text-[#7bea9e]">
              <Upload className="h-4 w-4" strokeWidth={1.7} />
            </span>
            <span className="mt-2 text-[11px] font-medium text-white/56">Upload {kind}</span>
            <span className="mt-0.5 text-[9px] text-white/26">PNG, JPG, WEBP or SVG</span>
          </span>
        )}
        {source ? <span className="absolute inset-0 grid place-items-center bg-black/55 opacity-0 transition duration-300 group-hover:opacity-100"><span className="inline-flex items-center gap-2 text-[11px] font-medium text-white/82"><Upload className="h-3.5 w-3.5" /> Replace</span></span> : null}
      </label>
    </div>
  );
}

function Accordion({ title, description, icon: Icon, meta, open, onToggle, children }: { title: string; description: string; icon: IconComponent; meta: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <section className={cx(UI.panel, "overflow-hidden transition-[border-color,background-color] duration-300", open && "border-white/14 bg-[#111111]")}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left sm:px-6">
        <span className="flex min-w-0 items-start gap-3">
          <span className={cx("mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[10px] border bg-white/[0.025] transition", open ? "border-white/14 bg-white/[0.045] text-white/72" : "border-white/10 text-white/46")}>
            <Icon className="h-4 w-4" strokeWidth={1.8} />
          </span>
          <span className="min-w-0">
            <span className="block text-[13px] font-semibold tracking-[-0.01em] text-white/88">{title}</span>
            <span className="mt-1 block text-[11px] leading-4 text-white/38">{description}</span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-3">
          <span className="hidden text-[10px] text-white/42 sm:inline">{meta}</span>
          <span className="grid h-8 w-8 place-items-center rounded-[10px] border border-white/10 bg-white/[0.025] text-white/38">
            <ChevronDown className={cx("h-3.5 w-3.5 transition-transform duration-300", open && "rotate-180")} />
          </span>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ height: { duration: 0.38, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.2 } }} className="overflow-hidden">
            <div className="border-t border-white/[0.075] px-5 py-5 sm:px-6">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function VisibilityCard({ item, active, onClick }: { item: (typeof VISIBILITY_OPTIONS)[number]; active: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <button type="button" onClick={onClick} className={cx("flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-left transition duration-200", active ? "border-[#18c98e]/38 bg-[#18c98e]/[0.075]" : "border-white/10 bg-[#0d0e0e] hover:border-white/18 hover:bg-white/[0.025]")}>
      <span className={cx("grid h-8 w-8 shrink-0 place-items-center rounded-[10px] border", active ? "border-[#18c98e]/26 text-[#7bea9e]" : "border-white/10 text-white/40")}><Icon className="h-3.5 w-3.5" strokeWidth={1.8} /></span>
      <span>
        <span className="block text-[12px] font-semibold text-white/82">{item.title}</span>
        <span className="mt-1 block text-[10.5px] leading-4 text-white/36">{item.description}</span>
      </span>
    </button>
  );
}

function FeeControl({ label, value, max, color, onChange }: { label: string; value: number; max: number; color: string; onChange: (value: number) => void }) {
  const progress = (value / max) * 100;
  return (
    <div className="grid items-center gap-3 sm:grid-cols-[118px_1fr_54px]">
      <span className="text-[10.5px] text-white/46">{label}</span>
      <label className="relative block h-7 cursor-pointer">
        <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/10" />
        <span className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full" style={{ width: `${progress}%`, backgroundColor: color }} />
        <span className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#0c0d0d] shadow-[0_0_0_2px_rgba(255,255,255,0.06)]" style={{ left: `${progress}%`, backgroundColor: color }} />
        <input type="range" min={0} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
      </label>
      <div className="rounded-lg border border-white/10 bg-white/[0.025] px-2 py-1.5 text-center text-[10.5px] font-semibold tabular-nums" style={{ color }}>{value}%</div>
    </div>
  );
}

function FeePlan({ plan, fees, setFees }: { plan: PlanKey; fees: FeeState; setFees: React.Dispatch<React.SetStateAction<FeeState>> }) {
  const meta = PLAN_META[plan];
  const values = fees[plan];
  const setValue = (key: FeeKey, value: number) => setFees((current) => ({ ...current, [plan]: { ...current[plan], [key]: clamp(value, 0, key === "lbp" ? 100 : 10) } }));
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d0e0e] p-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} /><span className="text-[12px] font-semibold text-white/82">{meta.title}</span></div>
        <span className="text-[9.5px] text-white/34">{meta.listing} ETH listing</span>
      </div>
      <div className="space-y-3.5">
        <FeeControl label="Buy fee" value={values.buy} max={10} color={meta.color} onChange={(value) => setValue("buy", value)} />
        <FeeControl label="Sell fee" value={values.sell} max={10} color={meta.color} onChange={(value) => setValue("sell", value)} />
        <FeeControl label="Graduation fee" value={values.graduation} max={10} color={meta.color} onChange={(value) => setValue("graduation", value)} />
        <FeeControl label="LBP volume" value={values.lbp} max={100} color={meta.color} onChange={(value) => setValue("lbp", value)} />
      </div>
    </div>
  );
}

export default function OpenBidPage() {
  const [name, setName] = React.useState("Based Shibas");
  const [description, setDescription] = React.useState("A focused launch board for discovering and bidding on token launches, creator pools and fee opportunities.");
  const [banner, setBanner] = React.useState<string>();
  const [logo, setLogo] = React.useState<string | undefined>("/brand-icon.svg");
  const [socials, setSocials] = React.useState<SocialState>({ website: "based.bid", telegram: "t.me/basedbid", twitter: "x.com/basedbid", discord: "", tiktok: "", youtube: "" });
  const [socialsOpen, setSocialsOpen] = React.useState(false);
  const [visibilityOpen, setVisibilityOpen] = React.useState(false);
  const [feesOpen, setFeesOpen] = React.useState(false);
  const [visibility, setVisibility] = React.useState<VisibilityMode>("public");
  const [apiPlan, setApiPlan] = React.useState<ApiPlan>("10");
  const [fees, setFees] = React.useState<FeeState>(INITIAL_FEES);
  const [dexVolumeFee, setDexVolumeFee] = React.useState(50);

  const requiredFields = [name.trim().length > 0, description.trim().length > 0, Boolean(logo)];
  const complete = Math.round((requiredFields.filter(Boolean).length / requiredFields.length) * 100);
  const socialsCount = countFilled(Object.values(socials));
  const visibilityMeta = VISIBILITY_OPTIONS.find((option) => option.key === visibility) ?? VISIBILITY_OPTIONS[0];
  const planMeta = PLAN_OPTIONS.find((plan) => plan.key === apiPlan) ?? PLAN_OPTIONS[0];
  const VisibilityIcon = visibilityMeta.icon;

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-[#090a0a] pb-28 text-white">
      <div className="mx-auto max-w-[1320px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <CreateBackLink href="/" />

        <header className="mt-3 flex flex-col gap-5 border-b border-white/[0.075] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#18c98e]/82">
              <Code2 className="h-3.5 w-3.5" strokeWidth={1.8} />
              OpenBid infrastructure
            </div>
            <h1 className="text-[28px] font-semibold tracking-[-0.045em] text-white/94 sm:text-[34px]">Create a programmable launch board</h1>
            <p className="mt-2 max-w-2xl text-[12.5px] leading-5 text-white/42 sm:text-[13px]">Configure a white-label launch environment with permissions, revenue settings, participation rules and API access.</p>
          </div>
          <a href="https://basedinc.gitbook.io/basedbid/projects-how-to-guides" target="_blank" rel="noreferrer" className="inline-flex h-9 w-fit cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 text-[10px] font-medium text-white/46 transition hover:border-[#18c98e]/24 hover:bg-[#18c98e]/[0.045] hover:text-white/78">
            <BookOpen className="h-3.5 w-3.5" strokeWidth={1.8} />
            Open documentation
          </a>
        </header>

        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_356px]">
          <div className="min-w-0 space-y-5">
            <section className={UI.panel}>
              <SectionHeader icon={Pencil} title="Board details" description="Define the public identity of this OpenBid board." tag="Core" />
              <div className="grid gap-5 px-5 py-5 sm:px-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <Field label="Board name" value={name} onChange={setName} placeholder="Enter board name" required />
                  <Field label="Description" value={description} onChange={setDescription} placeholder="Describe this board" textarea hint={`${description.length}/220`} required />
                </div>
                <div className="grid gap-4">
                  <AssetUpload kind="logo" source={logo} onChange={setLogo} onClear={() => setLogo(undefined)} required />
                  <AssetUpload kind="banner" source={banner} onChange={setBanner} onClear={() => setBanner(undefined)} />
                </div>
              </div>
            </section>

            <div className="px-1 pt-1">
              <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/28">Optional settings</div>
              <p className="mt-1.5 text-[11.5px] text-white/40">Configure access, links, fees and launch mechanics now or update them later.</p>
            </div>

            <Accordion title="Social links" description="Connect public channels to the board profile." icon={Globe} meta={`${socialsCount}/6 added`} open={socialsOpen} onToggle={() => setSocialsOpen((value) => !value)}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {SOCIAL_FIELDS.map((field) => <SocialInput key={field.key} field={field} value={socials[field.key]} onChange={(value) => setSocials((current) => ({ ...current, [field.key]: value }))} />)}
              </div>
            </Accordion>

            <Accordion title="Board visibility" description="Choose who can discover and participate in the board." icon={VisibilityIcon} meta={visibilityMeta.title} open={visibilityOpen} onToggle={() => setVisibilityOpen((value) => !value)}>
              <div className="grid gap-3 sm:grid-cols-2">
                {VISIBILITY_OPTIONS.map((item) => <VisibilityCard key={item.key} item={item} active={item.key === visibility} onClick={() => setVisibility(item.key)} />)}
              </div>
            </Accordion>

            <Accordion title="Board fee settings" description="Set plan fees and the board share of launch volume." icon={Crown} meta="Advanced" open={feesOpen} onToggle={() => setFeesOpen((value) => !value)}>
              <div className="space-y-3">
                <FeePlan plan="based" fees={fees} setFees={setFees} />
                <FeePlan plan="super" fees={fees} setFees={setFees} />
                <FeePlan plan="ultra" fees={fees} setFees={setFees} />
                <div className="rounded-2xl border border-white/10 bg-[#0d0e0e] p-4">
                  <div className="mb-4">
                    <div className="text-[12px] font-semibold text-white/82">DEX volume fee</div>
                    <p className="mt-1 text-[10.5px] leading-4 text-white/36">Share of DEX volume fees generated by projects launched through this board.</p>
                  </div>
                  <FeeControl label="Board share" value={dexVolumeFee} max={100} color={GREEN} onChange={setDexVolumeFee} />
                </div>
              </div>
            </Accordion>

            <section className={UI.panel}>
              <SectionHeader icon={Code2} title="Board API plan" description="Choose the request capacity available to this board." />
              <div className="grid gap-3 px-5 py-5 sm:grid-cols-3 sm:px-6">
                {PLAN_OPTIONS.map((plan) => {
                  const selected = apiPlan === plan.key;
                  return (
                    <button key={plan.key} type="button" onClick={() => setApiPlan(plan.key)} className={cx("cursor-pointer rounded-2xl border p-4 text-left transition duration-200", selected ? "border-[#18c98e]/40 bg-[#18c98e]/[0.075] shadow-[inset_0_1px_rgba(255,255,255,0.035)]" : "border-white/10 bg-[#0d0e0e] hover:border-white/18 hover:bg-white/[0.025]")}>
                      <div className="flex items-start justify-between gap-3"><span className="text-[13px] font-semibold text-white/84">{plan.title}</span>{selected ? <Check className="h-3.5 w-3.5 text-[#18c98e]" /> : null}</div>
                      <div className="mt-2 text-[10.5px] text-white/36">{plan.rps} requests / second</div>
                      <div className="mt-5 text-[13px] font-semibold tabular-nums text-white/72">{plan.price}<span className="ml-1 text-[9px] font-normal text-white/28">/ month</span></div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="min-w-0 xl:sticky xl:top-[76px]">
            <section className={cx(UI.panel, "overflow-hidden")}>
              <SectionHeader icon={Eye} title="Board preview" description="Review the public profile before publishing." />
              <div className="p-4">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c0d0d]">
                  <div className="relative h-[106px] overflow-hidden border-b border-white/[0.07] bg-[linear-gradient(135deg,#181a20_0%,#10131a_48%,#0d0e10_100%)]">
                    {banner ? <Image unoptimized src={banner} alt="Board banner" fill sizes="350px" className="object-cover" /> : <><span className="absolute -left-16 top-7 h-px w-[150%] rotate-[-8deg] bg-white/[0.055]" /><span className="absolute -left-16 top-14 h-px w-[150%] rotate-[-8deg] bg-[#18c98e]/12" /></>}
                    <span className="absolute inset-0 bg-gradient-to-t from-[#0c0d0d] via-transparent to-transparent" />
                  </div>
                  <div className="relative px-4 pb-4">
                    <div className="-mt-8 flex items-end justify-between gap-3">
                      <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/12 bg-[#111313] shadow-[0_8px_24px_rgba(0,0,0,0.35)] ring-4 ring-[#0c0d0d]">
                        {logo ? <Image unoptimized src={logo} alt="Board logo" fill sizes="64px" className="object-contain p-1.5" /> : <ImagePlus className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-white/20" />}
                      </div>
                      <span className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-[#18c98e]/22 bg-[#18c98e]/[0.065] px-2.5 py-1 text-[9px] font-medium text-[#7bea9e]"><VisibilityIcon className="h-3 w-3" />{visibilityMeta.title}</span>
                    </div>
                    <h3 className="mt-4 truncate text-[19px] font-semibold tracking-[-0.035em] text-white/90">{name || "Untitled board"}</h3>
                    <p className="mt-2 line-clamp-3 min-h-[48px] text-[10.5px] leading-4 text-white/42">{description || "Your board description will appear here."}</p>
                    <div className="mt-4 flex items-center gap-2 text-white/28">
                      {SOCIAL_FIELDS.filter((field) => socials[field.key].trim()).slice(0, 4).map((field) => { const Icon = field.icon; return <Icon key={field.key} className="h-3.5 w-3.5" strokeWidth={1.7} />; })}
                    </div>
                    <div className="mt-4 grid grid-cols-3 border-t border-white/[0.07] pt-4">
                      {[{ label: "Tokens", value: "128" }, { label: "Traders", value: "2.4k" }, { label: "Volume", value: "$42.8k" }].map((stat, index) => <div key={stat.label} className={cx("px-2", index > 0 && "border-l border-white/[0.07]")}><div className="text-[8px] uppercase tracking-[0.14em] text-white/24">{stat.label}</div><div className="mt-1 text-[12px] font-semibold tabular-nums text-white/70">{stat.value}</div></div>)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/[0.07] pt-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={cx("grid h-8 w-8 shrink-0 place-items-center rounded-[10px] border", complete === 100 ? "border-[#18c98e]/28 bg-[#18c98e]/[0.065] text-[#18c98e]" : "border-white/10 text-white/28")}><ShieldCheck className="h-4 w-4" strokeWidth={1.8} /></span>
                    <div className="min-w-0"><div className="text-[11.5px] font-semibold text-white/78">{complete === 100 ? "Ready to publish" : "Complete core setup"}</div><div className="mt-0.5 text-[9.5px] text-white/30">{planMeta.title} API · {visibilityMeta.title}</div></div>
                  </div>
                  <span className="text-[10px] font-semibold tabular-nums text-white/44">{complete}%</span>
                </div>
              </div>

              <div className="border-t border-white/[0.075] p-4">
                <button type="button" disabled={complete !== 100} className={cx("group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-full border px-4 text-sm font-semibold transition-[border-color,box-shadow,color,transform] duration-500 ease-[cubic-bezier(.22,1,.36,1)]", complete === 100 ? "bb-publish-button-ready cursor-pointer border-[#18C98E]/70 text-[#07331F] shadow-[0_18px_38px_rgba(24,201,142,0.24)] hover:shadow-[0_20px_44px_rgba(24,201,142,0.30)] active:scale-[0.99]" : "cursor-not-allowed border-white/12 text-white/58")}>
                  <span aria-hidden className={cx("absolute inset-0 bg-[linear-gradient(180deg,rgba(24,27,26,0.98),rgba(14,16,15,0.96))] transition-opacity duration-500", complete === 100 ? "opacity-0" : "opacity-100")} />
                  <span aria-hidden className={cx("bb-publish-button-gradient absolute inset-0 bg-[linear-gradient(110deg,#0EDB86_0%,#36EBA6_38%,#F5D97A_78%,#18C98E_100%)] bg-[length:220%_100%] transition-opacity duration-700", complete === 100 ? "opacity-100" : "opacity-0")} />
                  <span aria-hidden className={cx("bb-publish-button-sheen absolute inset-y-[-30%] left-0 w-1/3 bg-white/30 blur-lg", complete === 100 ? "" : "opacity-0")} />
                  <span className="relative inline-flex items-center justify-center gap-2">
                    <span className={cx("transition-colors duration-500", complete === 100 ? "text-[13px] font-semibold tracking-[-0.006em] text-[#07331F]" : "text-[12.5px] font-medium text-white/62")}>Publish Board</span>
                    <ChevronRight className={cx("h-3.5 w-3.5 transition duration-500", complete === 100 ? "translate-x-0 text-[#07331F] opacity-70" : "-translate-x-1 opacity-0")} strokeWidth={2.35} />
                  </span>
                </button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
