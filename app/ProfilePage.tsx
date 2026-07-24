"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  AtSign,
  Check,
  Copy,
  Gift,
  Globe2,
  Grid2X2,
  Heart,
  LockKeyhole,
  MessageCircleMore,
  Pencil,
  Save,
  Send,
  Settings2,
  Shapes,
  Upload,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import CreateBackLink from "./create/CreateBackLink";
import { useAppToast } from "./AppToast";
import ProfileRewardsDashboard from "./ProfileRewardsDashboard";

type ProfileTab = "tokens" | "rewards" | "boards" | "favorites" | "followers" | "following";

type Board = {
  id: string;
  title: string;
  description: string;
  privacy: "Public" | "Private";
  members: number;
  initials: string;
};

type ProfileToken = {
  id: string;
  title: string;
  ticker: string;
  pair: string;
  network: string;
  marketCap: string;
  ownership: string;
};

const tabs: Array<{ key: ProfileTab; label: string; icon: typeof Shapes }> = [
  { key: "tokens", label: "Tokens", icon: Shapes },
  { key: "rewards", label: "Rewards", icon: Gift },
  { key: "boards", label: "Boards", icon: Grid2X2 },
  { key: "favorites", label: "Favorites", icon: Heart },
  { key: "followers", label: "Followers", icon: Users },
  { key: "following", label: "Following", icon: UserPlus },
];

const profileBoards: Board[] = [
  {
    id: "signal-desk",
    title: "b/signal-desk",
    description: "Early launches, fee-routing research, and high-signal market notes.",
    privacy: "Public",
    members: 248,
    initials: "SD",
  },
  {
    id: "base-builders",
    title: "b/base-builders",
    description: "A working room for products, experiments, and teams building on Base.",
    privacy: "Public",
    members: 116,
    initials: "BB",
  },
  {
    id: "quiet-vault",
    title: "b/quiet-vault",
    description: "Private watchlists and launch configurations shared with collaborators.",
    privacy: "Private",
    members: 12,
    initials: "QV",
  },
  {
    id: "fee-lab",
    title: "b/fee-lab",
    description: "Reward baskets, treasury routes, and programmable fee experiments.",
    privacy: "Public",
    members: 84,
    initials: "FL",
  },
];

const ownedTokens: ProfileToken[] = [
  {
    id: "robin-index",
    title: "Robin Index",
    ticker: "RDX",
    pair: "ETH",
    network: "Robinhood",
    marketCap: "$1.32M",
    ownership: "Creator",
  },
];

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

function titleCase(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function makeAddress(seed: string) {
  const source = Array.from(seed || "based").reduce((total, char) => total + char.charCodeAt(0), 0).toString(16);
  return `0x${(source.repeat(12) + "a17c9e42b6d8f3057c24").slice(0, 40)}`;
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function BoardCard({ board, ownProfile }: { board: Board; ownProfile: boolean }) {
  const PrivacyIcon = board.privacy === "Public" ? Globe2 : LockKeyhole;

  return (
    <article className="group relative cursor-pointer overflow-hidden rounded-[18px] border border-white/[0.12] bg-[#101312] transition-[border-color,background-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-white/[0.19] hover:bg-[#131716] hover:shadow-[0_18px_44px_rgba(0,0,0,0.28)]">
      <Link href={`/b/${board.id}`} aria-label={`Open ${board.title}`} className="absolute inset-0 z-10" />
      <div className="relative h-[82px] overflow-hidden border-b border-white/[0.065] bg-[#101212]">
        <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/32 to-transparent" />
        <div className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-[12px] border border-white/[0.11] bg-[#151717] text-[11px] font-semibold tracking-[-0.01em] text-white/78 shadow-[0_8px_22px_rgba(0,0,0,0.26)]">
          {board.initials}
        </div>
        <span className="absolute right-4 top-4 inline-flex h-6 items-center gap-1.5 rounded-full border border-white/[0.09] bg-black/24 px-2 text-[9px] font-medium text-white/48 backdrop-blur-sm">
          <PrivacyIcon className="h-3 w-3" strokeWidth={1.8} />
          {board.privacy}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-semibold tracking-[-0.025em] text-white/88">{board.title}</h3>
            <p className="mt-1.5 line-clamp-2 text-[12px] leading-[1.55] text-white/58">{board.description}</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 text-[10px] tabular-nums text-white/48">
            <Users className="h-3 w-3" strokeWidth={1.8} />
            {board.members}
          </span>
        </div>

        {ownProfile ? (
          <div className="mt-4 flex justify-end border-t border-white/[0.06] pt-3">
            <button type="button" className="relative z-20 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-medium text-white/55 transition-colors hover:bg-white/[0.05] hover:text-white/86">
              <Settings2 className="h-3.5 w-3.5" strokeWidth={1.8} />
              Manage
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function OwnedTokenCard({ token }: { token: ProfileToken }) {
  return (
    <article className="group relative cursor-pointer overflow-hidden rounded-[18px] border border-white/[0.12] bg-[#101312] shadow-[inset_0_1px_rgba(255,255,255,0.025)] transition-[border-color,background-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-white/[0.19] hover:bg-[#131716] hover:shadow-[0_18px_44px_rgba(0,0,0,0.28)]">
      <Link href={`/token/${token.id}`} aria-label={`Open ${token.title}`} className="absolute inset-0 z-10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[#b6ff35]/55" />
      <div className="flex items-center gap-3 px-4 py-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#b6ff35]/18 bg-[#111513] text-[11px] font-bold text-[#b6ff35]">RD</span>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="truncate text-[14px] font-semibold tracking-[-0.025em] text-white/88">{token.title}</h3>
            <span className="shrink-0 text-[10px] font-medium text-white/48">{token.ticker} / {token.pair}</span>
          </div>
          <p className="mt-1 text-[11px] text-white/52">Created and managed by this wallet</p>
        </div>
        <span className="rounded-full border border-[#f5d97a]/24 bg-[#f5d97a]/[0.065] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.11em] text-[#ead68d]">{token.ownership}</span>
      </div>
      <div className="grid grid-cols-2 border-y border-white/[0.06] bg-black/10">
        <div className="px-4 py-3"><span className="block text-[9px] uppercase tracking-[0.12em] text-white/42">Network</span><strong className="mt-1 block text-[11px] font-medium text-white/76">{token.network}</strong></div>
        <div className="border-l border-white/[0.08] px-4 py-3"><span className="block text-[9px] uppercase tracking-[0.12em] text-white/42">Market cap</span><strong className="mt-1 block text-[11px] font-medium tabular-nums text-white/82">{token.marketCap}</strong></div>
      </div>
      <div className="flex items-center justify-end gap-2 px-3 py-3">
        <Link href={`/token/${token.id}?manage=1`} className="relative z-20 inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#d7c57f]/24 bg-[#d7c57f]/[0.055] px-3 text-[10.5px] font-semibold text-[#e5d086] transition hover:border-[#f0db8a]/38 hover:bg-[#f0db8a]/[0.09] hover:text-[#f5e3a1]"><Settings2 className="h-3.5 w-3.5" />Manage</Link>
      </div>
    </article>
  );
}

function EditField({ label, value, onChange, icon: Icon, placeholder }: { label: string; value: string; onChange: (value: string) => void; icon: typeof AtSign; placeholder: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[9.5px] font-semibold text-white/62">{label}</span>
      <span className="flex h-11 items-center gap-2.5 rounded-[10px] border border-white/[0.09] bg-[#0a0d0c] px-3.5 transition focus-within:border-[#f5d97a]/28">
        <Icon className="h-3.5 w-3.5 shrink-0 text-white/25" strokeWidth={1.8} />
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent text-[11px] font-medium text-white/76 outline-none placeholder:text-white/20" />
      </span>
    </label>
  );
}

function ProfileEditModal({ open, onClose, initials, avatarPreview, onAvatar, bio, onBio, xProfile, onX, telegram, onTelegram, discord, onDiscord, dirty, onSave }: { open: boolean; onClose: () => void; initials: string; avatarPreview: string | null; onAvatar: (file?: File) => void; bio: string; onBio: (value: string) => void; xProfile: string; onX: (value: string) => void; telegram: string; onTelegram: (value: string) => void; discord: string; onDiscord: (value: string) => void; dirty: boolean; onSave: () => void }) {
  const avatarInput = useRef<HTMLInputElement | null>(null);
  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[700] grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          <button type="button" aria-hidden="true" tabIndex={-1} onClick={onClose} className="absolute inset-0 bg-black/68 backdrop-blur-[3px]" />
          <motion.section role="dialog" aria-modal="true" aria-label="Edit profile" initial={{ opacity: 0, y: 14, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 9, scale: 0.99 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }} className="relative w-full max-w-[700px] overflow-hidden rounded-[20px] border border-white/[0.10] bg-[#0b0e0d] shadow-[0_30px_100px_rgba(0,0,0,0.68)]">
            <header className="flex items-center gap-3 border-b border-white/[0.065] px-5 py-4 sm:px-6">
              <div className="min-w-0 flex-1"><h2 className="text-[16px] font-semibold tracking-[-0.025em] text-white/90">Edit profile</h2><p className="mt-1 text-[9.5px] text-white/34">Update how your creator profile appears across based bid.</p></div>
              <button type="button" onClick={onClose} aria-label="Close profile editor" className="grid h-8 w-8 place-items-center rounded-lg text-white/30 transition hover:bg-white/[0.04] hover:text-white/76"><X className="h-4 w-4" /></button>
            </header>
            <div className="grid gap-6 px-5 py-5 sm:grid-cols-[150px_minmax(0,1fr)] sm:px-6 sm:py-6">
              <div>
                <span className="mb-2 block text-[9.5px] font-semibold text-white/62">Profile image</span>
                <button type="button" onClick={() => avatarInput.current?.click()} className="group relative grid h-[150px] w-full place-items-center overflow-hidden rounded-[16px] border border-dashed border-white/[0.12] bg-[#090b0a] transition hover:border-[#f5d97a]/28 hover:bg-[#f5d97a]/[0.02]">
                  {avatarPreview ? <Image unoptimized src={avatarPreview} alt="Selected profile image" fill className="object-cover" /> : <><span className="grid h-14 w-14 place-items-center rounded-[16px] border border-white/[0.09] bg-white/[0.025] text-[15px] font-semibold text-white/72">{initials}</span><span className="mt-2 inline-flex items-center gap-1.5 text-[9px] font-medium text-white/36 group-hover:text-[#d8c47b]"><Upload className="h-3.5 w-3.5" />Replace</span></>}
                </button>
                <input ref={avatarInput} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => onAvatar(event.target.files?.[0])} />
              </div>
              <div className="space-y-4">
                <label className="block"><span className="mb-2 flex items-center justify-between text-[9.5px] font-semibold text-white/62"><span>Short description</span><span className="font-mono text-[8px] font-normal text-white/23">{bio.length}/120</span></span><span className="flex h-11 items-center rounded-[10px] border border-white/[0.09] bg-[#0a0d0c] px-3.5 transition focus-within:border-[#f5d97a]/28"><input value={bio} maxLength={120} onChange={(event) => onBio(event.target.value.replace(/[\r\n]+/g, " "))} className="min-w-0 flex-1 bg-transparent text-[11px] font-medium text-white/76 outline-none" /></span></label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <EditField label="X" value={xProfile} onChange={onX} icon={AtSign} placeholder="@username" />
                  <EditField label="Telegram" value={telegram} onChange={onTelegram} icon={Send} placeholder="@username" />
                  <div className="sm:col-span-2">
                    <EditField label="Discord" value={discord} onChange={onDiscord} icon={MessageCircleMore} placeholder="username" />
                  </div>
                </div>
              </div>
            </div>
            <footer className="flex items-center justify-end gap-2 border-t border-white/[0.065] px-5 py-4 sm:px-6">
              <button type="button" onClick={onClose} className="h-9 rounded-full px-4 text-[10px] font-medium text-white/40 transition hover:bg-white/[0.035] hover:text-white/72">Cancel</button>
              <button type="button" onClick={onSave} disabled={!dirty} className={cx("relative inline-flex h-9 min-w-[128px] items-center justify-center gap-2 overflow-hidden rounded-full border px-4 text-[10px] font-semibold transition", dirty ? "border-[#f5d97a]/45 bg-[linear-gradient(110deg,#18c98e,#4ae0ad_45%,#f5d97a)] text-[#092518] shadow-[0_12px_30px_rgba(24,201,142,0.16)]" : "cursor-default border-white/[0.08] bg-white/[0.018] text-white/30")}><Save className="h-3.5 w-3.5" />Apply profile</button>
            </footer>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function EmptyTab({ tab }: { tab: Exclude<ProfileTab, "boards"> }) {
  const selected = tabs.find((item) => item.key === tab) ?? tabs[0];
  const Icon = selected.icon;

  return (
    <div className="flex min-h-[250px] flex-col items-center justify-center rounded-[18px] border border-dashed border-white/[0.09] bg-[#0c0e0e] px-6 text-center">
      <span className="grid h-10 w-10 place-items-center rounded-[12px] border border-white/[0.085] bg-white/[0.025] text-white/32">
        <Icon className="h-[17px] w-[17px]" strokeWidth={1.7} />
      </span>
      <h2 className="mt-3 text-[13px] font-semibold text-white/72">No {selected.label.toLowerCase()} yet</h2>
      <p className="mt-1 max-w-[330px] text-[10.5px] leading-relaxed text-white/34">Activity will appear here as this profile participates across based bid.</p>
    </div>
  );
}

export default function ProfilePage({ handle = "redrum", ownProfile = false }: { handle?: string; ownProfile?: boolean }) {
  const { pushToast } = useAppToast();
  const normalizedHandle = handle.replace(/^@/, "") || "redrum";
  const [activeTab, setActiveTab] = useState<ProfileTab>("tokens");
  const [copied, setCopied] = useState(false);
  const [following, setFollowing] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [bio, setBio] = useState("Building programmable launches, reward routes, and token economies on based bid.");
  const [xProfile, setXProfile] = useState("@redrum");
  const [telegram, setTelegram] = useState("@redrum");
  const [discord, setDiscord] = useState("redrum");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [profileDirty, setProfileDirty] = useState(false);
  const address = ownProfile ? "0xA17C9e42B6D8f3057C24aE91B5d7630F8C2e4A69" : makeAddress(normalizedHandle);
  const displayName = ownProfile ? "redrum" : titleCase(normalizedHandle);
  const initials = displayName.slice(0, 2).toUpperCase();
  const visibleTabs = useMemo(() => ownProfile ? tabs : tabs.filter((tab) => tab.key !== "rewards"), [ownProfile]);

  const stats = useMemo(() => [
    { label: "Tokens", value: 1 },
    { label: "Boards", value: profileBoards.length },
    { label: "Followers", value: ownProfile ? 184 : 72 },
    { label: "Following", value: ownProfile ? 46 : 31 },
  ], [ownProfile]);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 1300);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  useEffect(() => {
    if (!editOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setEditOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [editOpen]);

  useEffect(() => {
    if (ownProfile && window.location.hash === "#rewards") setActiveTab("rewards");
  }, [ownProfile]);

  useEffect(() => () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
  }, [avatarPreview]);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
  };

  const updateProfileValue = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setProfileDirty(true);
  };

  const selectAvatar = (file?: File) => {
    if (!file) return;
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
    setProfileDirty(true);
  };

  const applyProfile = () => {
    if (!profileDirty) return;
    setProfileDirty(false);
    setEditOpen(false);
    pushToast({ tone: "success", title: "Profile updated", message: "Your creator profile changes are now live." });
  };

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-[#090a0a] px-3 py-4 text-white sm:px-5 sm:py-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1480px]">
        <CreateBackLink href="/" />

        <section className="mt-4 rounded-[22px] border border-white/[0.12] bg-[#101312] px-5 py-5 shadow-[0_22px_68px_rgba(0,0,0,0.28),inset_0_1px_rgba(255,255,255,0.025)] sm:px-7 sm:py-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-3.5 sm:gap-4">
              <div className="relative grid h-[76px] w-[76px] shrink-0 place-items-center rounded-[20px] border border-white/[0.15] bg-[#171b19] text-[20px] font-semibold tracking-[-0.04em] text-white/90 shadow-[0_12px_34px_rgba(0,0,0,0.34)] sm:h-[88px] sm:w-[88px] sm:rounded-[23px] sm:text-[23px]">
                {avatarPreview ? <Image unoptimized src={avatarPreview} alt="Profile" fill className="rounded-[inherit] object-cover" /> : initials}
                <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-[3px] border-[#0d0f0f] bg-[#18c98e]" />
              </div>

              <div className="min-w-0 pt-0.5">
                <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                  <h1 className="truncate text-[30px] font-semibold leading-none tracking-[-0.045em] text-white/96 sm:text-[36px]">{displayName}</h1>
                  {ownProfile ? <span className="rounded-full border border-white/[0.13] bg-white/[0.025] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/55">You</span> : null}
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <a href={`https://basescan.org/address/${address}`} target="_blank" rel="noreferrer" className="inline-flex h-7 items-center text-[13px] font-medium text-white/58 transition-colors hover:text-white/86">{shortAddress(address)}</a>
                  <span className="h-3 w-px bg-white/[0.08]" aria-hidden="true" />
                  <button type="button" onClick={() => void copyAddress()} aria-label="Copy profile address" className="grid h-6 w-6 cursor-pointer place-items-center text-white/24 transition-colors hover:text-white/70">
                    {copied ? <Check className="h-3 w-3 text-[#18c98e]" strokeWidth={2} /> : <Copy className="h-3 w-3" strokeWidth={1.8} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center lg:justify-end">
              {stats.map((stat) => (
                <div key={stat.label} className="min-w-0 rounded-[13px] border border-white/[0.11] bg-white/[0.025] px-3.5 py-3 text-center sm:min-w-[90px]">
                  <div className="text-[17px] font-semibold tabular-nums text-white/88">{stat.value}</div>
                  <div className="mt-1 text-[11px] font-medium text-white/50">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-white/[0.065] pt-4 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-[960px] text-[14px] leading-[1.55] text-white/62 sm:truncate sm:whitespace-nowrap sm:leading-[1.65]">
              {ownProfile
                ? bio
                : `Following ${displayName}'s launches, boards, and market activity across based bid.`}
            </p>
            {ownProfile ? (
              <button type="button" onClick={() => setEditOpen(true)} className="inline-flex h-9 w-fit cursor-pointer items-center gap-1.5 rounded-[9px] border border-white/[0.13] bg-white/[0.035] px-3.5 text-[11.5px] font-medium text-white/74 transition-colors hover:border-white/[0.2] hover:bg-white/[0.07] hover:text-white/94">
                <Pencil className="h-3.5 w-3.5" strokeWidth={1.8} />
                Edit profile
              </button>
            ) : (
              <button type="button" onClick={() => setFollowing((value) => !value)} className={cx("inline-flex h-8 w-fit cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-[10px] font-semibold transition-colors", following ? "border-white/[0.11] bg-white/[0.035] text-white/62 hover:bg-white/[0.06]" : "border-[#18c98e]/35 bg-[#18c98e] text-[#07110c] hover:bg-[#65e491]") }>
                {following ? <Check className="h-3.5 w-3.5" strokeWidth={2} /> : <UserPlus className="h-3.5 w-3.5" strokeWidth={2} />}
                {following ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </section>

        <nav className="mt-7 overflow-x-auto border-b border-white/[0.11]" aria-label="Profile sections">
          <div className="flex min-w-max items-center gap-5 sm:gap-7">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const active = tab.key === activeTab;
              return (
                <button key={tab.key} type="button" onClick={() => { setActiveTab(tab.key); window.history.replaceState(null, "", tab.key === "tokens" ? window.location.pathname : `${window.location.pathname}#${tab.key}`); }} aria-pressed={active} className={cx("relative inline-flex h-12 cursor-pointer items-center gap-2.5 text-[13px] font-medium transition-colors", active ? tab.key === "rewards" ? "text-[#ead68d]" : "text-white/90" : "text-white/48 hover:text-white/76")}>
                  <Icon className={cx("h-[17px] w-[17px]", active && (tab.key === "rewards" ? "text-[#ead68d]" : "text-[#18c98e]"))} strokeWidth={1.8} />
                  {tab.label}
                  <span className={cx("absolute inset-x-0 bottom-0 h-[2px] origin-center transition-transform duration-300", tab.key === "rewards" ? "bg-[#d7c57f]" : "bg-[#18c98e]", active ? "scale-x-100" : "scale-x-0")} />
                </button>
              );
            })}
          </div>
        </nav>

        <section className="py-6">
          {activeTab === "boards" ? (
            <div className="grid gap-3.5 lg:grid-cols-2">
              {profileBoards.map((board) => <BoardCard key={board.id} board={board} ownProfile={ownProfile} />)}
            </div>
          ) : activeTab === "rewards" && ownProfile ? (
            <ProfileRewardsDashboard />
          ) : activeTab === "tokens" && ownProfile ? (
            <div>
              <div className="mb-4 flex items-end justify-between gap-3"><div><h2 className="text-[18px] font-semibold text-white/90">Owned tokens</h2><p className="mt-1 text-[11.5px] text-white/48">Tokens where this wallet controls creator and management permissions.</p></div><span className="text-[10px] tabular-nums text-white/45">{ownedTokens.length} token</span></div>
              <div className="grid gap-3.5 lg:grid-cols-2">{ownedTokens.map((token) => <OwnedTokenCard key={token.id} token={token} />)}</div>
            </div>
          ) : (
            <EmptyTab tab={activeTab} />
          )}
        </section>
      </div>
      {ownProfile ? <ProfileEditModal open={editOpen} onClose={() => setEditOpen(false)} initials={initials} avatarPreview={avatarPreview} onAvatar={selectAvatar} bio={bio} onBio={updateProfileValue(setBio)} xProfile={xProfile} onX={updateProfileValue(setXProfile)} telegram={telegram} onTelegram={updateProfileValue(setTelegram)} discord={discord} onDiscord={updateProfileValue(setDiscord)} dirty={profileDirty} onSave={applyProfile} /> : null}
    </main>
  );
}
