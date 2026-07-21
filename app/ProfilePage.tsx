"use client";

import {
  Check,
  Copy,
  ExternalLink,
  Globe2,
  Grid2X2,
  Heart,
  LockKeyhole,
  Pencil,
  Settings2,
  Shapes,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CreateBackLink from "./create/CreateBackLink";

type ProfileTab = "tokens" | "boards" | "favorites" | "followers" | "following";

type Board = {
  id: string;
  title: string;
  description: string;
  privacy: "Public" | "Private";
  members: number;
  initials: string;
};

const tabs: Array<{ key: ProfileTab; label: string; icon: typeof Shapes }> = [
  { key: "tokens", label: "Tokens", icon: Shapes },
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
    <article className="group relative cursor-pointer overflow-hidden rounded-[18px] border border-white/[0.085] bg-[#0d0f0f] transition-[border-color,background-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-white/[0.15] hover:bg-[#101212] hover:shadow-[0_18px_44px_rgba(0,0,0,0.22)]">
      <Link href={`/?board=${board.id}`} aria-label={`Open ${board.title}`} className="absolute inset-0 z-10" />
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
            <p className="mt-1.5 line-clamp-2 text-[11px] leading-[1.55] text-white/42">{board.description}</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 text-[9px] tabular-nums text-white/32">
            <Users className="h-3 w-3" strokeWidth={1.8} />
            {board.members}
          </span>
        </div>

        {ownProfile ? (
          <div className="mt-4 flex justify-end border-t border-white/[0.06] pt-3">
            <button type="button" className="relative z-20 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-[10px] font-medium text-white/38 transition-colors hover:bg-white/[0.04] hover:text-white/76">
              <Settings2 className="h-3.5 w-3.5" strokeWidth={1.8} />
              Manage
            </button>
          </div>
        ) : null}
      </div>
    </article>
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
      <p className="mt-1 max-w-[330px] text-[10.5px] leading-relaxed text-white/34">Activity will appear here as this profile participates across Based Bid.</p>
    </div>
  );
}

export default function ProfilePage({ handle = "redrum", ownProfile = false }: { handle?: string; ownProfile?: boolean }) {
  const normalizedHandle = handle.replace(/^@/, "") || "redrum";
  const [activeTab, setActiveTab] = useState<ProfileTab>("tokens");
  const [copied, setCopied] = useState(false);
  const [following, setFollowing] = useState(false);
  const address = ownProfile ? "0xA17C9e42B6D8f3057C24aE91B5d7630F8C2e4A69" : makeAddress(normalizedHandle);
  const displayName = ownProfile ? "redrum" : titleCase(normalizedHandle);
  const initials = displayName.slice(0, 2).toUpperCase();

  const stats = useMemo(() => [
    { label: "Tokens", value: ownProfile ? 3 : 1 },
    { label: "Boards", value: profileBoards.length },
    { label: "Followers", value: ownProfile ? 184 : 72 },
    { label: "Following", value: ownProfile ? 46 : 31 },
  ], [ownProfile]);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 1300);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
  };

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-[#090a0a] px-3 py-4 text-white sm:px-5 sm:py-5 lg:px-7">
      <div className="mx-auto w-full max-w-[1120px]">
        <CreateBackLink href="/" />

        <section className="mt-3 rounded-[20px] border border-white/[0.085] bg-[#0d0f0f] px-4 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.18)] sm:px-5 sm:py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-3.5 sm:gap-4">
              <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-[17px] border border-white/[0.11] bg-[#151717] text-[17px] font-semibold tracking-[-0.04em] text-white/82 shadow-[0_10px_30px_rgba(0,0,0,0.26)] sm:h-[72px] sm:w-[72px] sm:rounded-[19px] sm:text-[19px]">
                {initials}
                <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-[3px] border-[#0d0f0f] bg-[#18c98e]" />
              </div>

              <div className="min-w-0 pt-0.5">
                <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                  <h1 className="truncate text-[24px] font-semibold leading-none tracking-[-0.045em] text-white/92 sm:text-[28px]">{displayName}</h1>
                  {ownProfile ? <span className="rounded-full border border-white/[0.09] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-white/34">You</span> : null}
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <a href={`https://basescan.org/address/${address}`} target="_blank" rel="noreferrer" className="group/address inline-flex h-6 items-center gap-1 text-[10px] font-medium text-white/42 transition-colors hover:text-white/76">
                    {shortAddress(address)}
                    <ExternalLink className="h-3 w-3 text-white/22 transition-colors group-hover/address:text-white/52" strokeWidth={1.8} />
                  </a>
                  <span className="h-3 w-px bg-white/[0.08]" aria-hidden="true" />
                  <button type="button" onClick={() => void copyAddress()} aria-label="Copy profile address" className="grid h-6 w-6 cursor-pointer place-items-center text-white/24 transition-colors hover:text-white/70">
                    {copied ? <Check className="h-3 w-3 text-[#18c98e]" strokeWidth={2} /> : <Copy className="h-3 w-3" strokeWidth={1.8} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              {stats.map((stat) => (
                <div key={stat.label} className="min-w-[66px] rounded-[11px] border border-white/[0.075] bg-white/[0.018] px-2.5 py-2 text-center">
                  <div className="text-[12px] font-semibold tabular-nums text-white/78">{stat.value}</div>
                  <div className="mt-0.5 text-[8px] font-medium text-white/30">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-white/[0.065] pt-4 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-[690px] text-[11px] leading-[1.65] text-white/42">
              {ownProfile
                ? "Building programmable launches, reward routes, and next-generation token economies on Based Bid."
                : `Following ${displayName}'s launches, boards, and market activity across Based Bid.`}
            </p>
            {ownProfile ? (
              <button type="button" className="inline-flex h-8 w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-white/[0.09] bg-white/[0.025] px-3 text-[10px] font-medium text-white/62 transition-colors hover:border-white/[0.15] hover:bg-white/[0.055] hover:text-white/86">
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

        <nav className="mt-5 overflow-x-auto border-b border-white/[0.075]" aria-label="Profile sections">
          <div className="flex min-w-max items-center gap-5 sm:gap-7">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = tab.key === activeTab;
              return (
                <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} aria-pressed={active} className={cx("relative inline-flex h-9 cursor-pointer items-center gap-1.5 text-[10.5px] font-medium transition-colors", active ? "text-white/82" : "text-white/34 hover:text-white/64")}>
                  <Icon className={cx("h-3.5 w-3.5", active && "text-[#18c98e]")} strokeWidth={1.8} />
                  {tab.label}
                  <span className={cx("absolute inset-x-0 bottom-0 h-px origin-center bg-[#18c98e] transition-transform duration-300", active ? "scale-x-100" : "scale-x-0")} />
                </button>
              );
            })}
          </div>
        </nav>

        <section className="py-5">
          {activeTab === "boards" ? (
            <div className="grid gap-3.5 lg:grid-cols-2">
              {profileBoards.map((board) => <BoardCard key={board.id} board={board} ownProfile={ownProfile} />)}
            </div>
          ) : (
            <EmptyTab tab={activeTab} />
          )}
        </section>
      </div>
    </main>
  );
}
