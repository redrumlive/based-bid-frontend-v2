"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Clock3,
  Coins,
  Hash,
  Search,
  TrendingUp,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import React from "react";

export const OPEN_GLOBAL_SEARCH_EVENT = "basedbid:open-search";
const SEARCH_HISTORY_KEY = "basedbid:search-history:v1";

export function openGlobalSearch() {
  window.dispatchEvent(new CustomEvent(OPEN_GLOBAL_SEARCH_EVENT));
}

type SearchKind = "token" | "lbp" | "board" | "user";
type SearchDirectory = "all" | "history" | SearchKind;
type SearchSort = "relevance" | "recent" | "az";

type SearchEntry = {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle: string;
  meta: string;
  href: string;
  accent: string;
  initials: string;
  keywords: string;
  updated: number;
};

const SEARCH_ENTRIES: SearchEntry[] = [
  { id: "gradient", kind: "token", title: "Gradient", subtitle: "GRAD", meta: "Base", href: "/token/gradient", accent: "#18c98e", initials: "G", keywords: "experimental social token based", updated: 98 },
  { id: "cashcat", kind: "token", title: "Cashcat", subtitle: "CASHCAT", meta: "BNB", href: "/token/cashcat", accent: "#b8f33d", initials: "C", keywords: "community rewards flash", updated: 94 },
  { id: "mega-mode", kind: "token", title: "Mega Mode", subtitle: "MODE", meta: "MegaETH", href: "/token/mega-mode", accent: "#e5e7eb", initials: "M", keywords: "realtime coordination", updated: 91 },
  { id: "based-builders", kind: "token", title: "Based Builders", subtitle: "BUILD", meta: "Base", href: "/token/based-builders", accent: "#5d8cff", initials: "B", keywords: "builders ownership", updated: 86 },
  { id: "robin-index", kind: "lbp", title: "Robin Index", subtitle: "RDX", meta: "88% bonded", href: "/token/robin-index", accent: "#b8f33d", initials: "RI", keywords: "robinhood basket index", updated: 99 },
  { id: "solstice", kind: "lbp", title: "Solstice", subtitle: "SOLST", meta: "63% bonded", href: "/token/solstice", accent: "#2dd4bf", initials: "SO", keywords: "solana creator rails", updated: 90 },
  { id: "neon-relay", kind: "lbp", title: "Neon Relay", subtitle: "RELAY", meta: "Base", href: "/token/neon-relay", accent: "#38bdf8", initials: "NR", keywords: "routing infrastructure", updated: 85 },
  { id: "ether-atlas", kind: "lbp", title: "Ether Atlas", subtitle: "ATLAS", meta: "96% bonded", href: "/token/ether-atlas", accent: "#818cf8", initials: "EA", keywords: "research economy ethereum", updated: 80 },
  { id: "based", kind: "board", title: "Based", subtitle: "Default board", meta: "Smart", href: "/?board=based", accent: "#18c98e", initials: "#", keywords: "main default board", updated: 100 },
  { id: "digital", kind: "board", title: "Digital", subtitle: "Digital assets", meta: "Board", href: "/?board=digital", accent: "#60a5fa", initials: "#", keywords: "digital launches", updated: 88 },
  { id: "sigma", kind: "board", title: "Sigma Snipers", subtitle: "Market calls", meta: "Board", href: "/?board=sigma", accent: "#c084fc", initials: "#", keywords: "sigma robin index", updated: 82 },
  { id: "prempad", kind: "board", title: "PremPad", subtitle: "Early launches", meta: "Board", href: "/?board=prempad", accent: "#f0d77f", initials: "#", keywords: "launchpad early", updated: 77 },
  { id: "cass", kind: "user", title: "cass", subtitle: "Creator of Robin Index", meta: "Creator", href: "/u/cass", accent: "#b8f33d", initials: "CA", keywords: "robin index creator", updated: 96 },
  { id: "milo", kind: "user", title: "milo", subtitle: "Creator of Gradient", meta: "Builder", href: "/u/milo", accent: "#18c98e", initials: "MI", keywords: "gradient creator", updated: 92 },
  { id: "nova", kind: "user", title: "nova", subtitle: "Creator of Mega Mode", meta: "Builder", href: "/u/nova", accent: "#94a3b8", initials: "NO", keywords: "mega mode creator", updated: 89 },
  { id: "soren", kind: "user", title: "soren", subtitle: "Creator of Based Builders", meta: "Creator", href: "/u/soren", accent: "#60a5fa", initials: "SO", keywords: "based builders creator", updated: 84 },
];

const DIRECTORY_META: Record<SearchKind, { label: string; caption: string; icon: LucideIcon; color: string }> = {
  token: { label: "Tokens", caption: "Trading assets", icon: Coins, color: "#18c98e" },
  lbp: { label: "LBPs", caption: "Bonding pools", icon: TrendingUp, color: "#b8f33d" },
  board: { label: "Boards", caption: "Publishing spaces", icon: Hash, color: "#a78bfa" },
  user: { label: "Users", caption: "Creators and builders", icon: UserRound, color: "#60a5fa" },
};

const kindOrder: SearchKind[] = ["token", "lbp", "board", "user"];

function scoreEntry(entry: SearchEntry, query: string) {
  if (!query) return entry.updated;
  const value = query.toLowerCase();
  const title = entry.title.toLowerCase();
  const subtitle = entry.subtitle.toLowerCase();
  if (title === value || subtitle === value) return 1000;
  if (title.startsWith(value) || subtitle.startsWith(value)) return 700;
  if (title.includes(value) || subtitle.includes(value)) return 450;
  if (entry.keywords.includes(value)) return 240;
  return 0;
}

function SearchResult({ entry, onSelect }: { entry: SearchEntry; onSelect: (entry: SearchEntry) => void }) {
  const directory = DIRECTORY_META[entry.kind];
  const Icon = directory.icon;
  return (
    <Link
      href={entry.href}
      onClick={() => onSelect(entry)}
      className="group flex min-w-0 items-center gap-3 rounded-[13px] border border-white/[0.07] bg-white/[0.014] px-3 py-2.5 outline-none transition duration-200 hover:border-white/[0.13] hover:bg-white/[0.035] focus-visible:border-[#18c98e]/36"
    >
      <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/[0.10] bg-[#111412] text-[9px] font-semibold" style={{ color: entry.accent }}>
        {entry.initials}
        <span className="absolute -bottom-0.5 -right-0.5 grid h-3.5 w-3.5 place-items-center rounded-full border border-[#0d0f0e] bg-[#171a18]" style={{ color: directory.color }}><Icon className="h-2 w-2" strokeWidth={2} /></span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-baseline gap-2"><strong className="truncate text-[11.5px] font-semibold tracking-[-0.012em] text-white/84 group-hover:text-white/96">{entry.title}</strong><span className="shrink-0 font-mono text-[8px] text-white/28">{entry.subtitle}</span></span>
        <span className="mt-0.5 block truncate text-[9.5px] font-light text-white/34">{entry.meta}</span>
      </span>
    </Link>
  );
}

export default function GlobalSearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = React.useState("");
  const [directory, setDirectory] = React.useState<SearchDirectory>("all");
  const [sort, setSort] = React.useState<SearchSort>("relevance");
  const [historyIds, setHistoryIds] = React.useState<string[]>([]);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    try {
      const stored = JSON.parse(window.localStorage.getItem(SEARCH_HISTORY_KEY) ?? "[]");
      if (Array.isArray(stored)) setHistoryIds(stored.filter((id): id is string => typeof id === "string").slice(0, 8));
    } catch {
      setHistoryIds([]);
    }
    setQuery("");
    setDirectory("all");
    setSort("relevance");
    const timer = window.setTimeout(() => inputRef.current?.focus(), 70);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  const historyEntries = historyIds.map((id) => SEARCH_ENTRIES.find((entry) => entry.id === id)).filter((entry): entry is SearchEntry => Boolean(entry));
  const normalized = query.trim().toLowerCase();
  const baseEntries = directory === "history" ? historyEntries : SEARCH_ENTRIES.filter((entry) => directory === "all" || entry.kind === directory);
  const filtered = baseEntries
    .filter((entry) => !normalized || scoreEntry(entry, normalized) > 0)
    .sort((left, right) => sort === "az" ? left.title.localeCompare(right.title) : sort === "recent" ? right.updated - left.updated : scoreEntry(right, normalized) - scoreEntry(left, normalized));
  const showHistory = !normalized && historyEntries.length > 0 && (directory === "all" || directory === "history");
  const idleDirectory = directory !== "all" && directory !== "history" ? DIRECTORY_META[directory] : null;

  const selectEntry = (entry: SearchEntry) => {
    const next = [entry.id, ...historyIds.filter((id) => id !== entry.id)].slice(0, 8);
    setHistoryIds(next);
    window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next));
    onClose();
  };

  const clearHistory = () => {
    setHistoryIds([]);
    window.localStorage.removeItem(SEARCH_HISTORY_KEY);
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[430] flex items-start justify-center bg-black/72 px-3 pb-4 pt-[7vh] backdrop-blur-[7px] sm:px-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
          <motion.section role="dialog" aria-modal="true" aria-label="Search Based Bid" initial={{ opacity: 0, y: 13, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.99 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} className="flex h-[min(680px,86vh)] w-full max-w-[900px] flex-col overflow-hidden rounded-[22px] border border-white/[0.11] bg-[#0c0e0d] shadow-[0_34px_100px_rgba(0,0,0,0.68),inset_0_1px_rgba(255,255,255,0.025)]">
            <header className="border-b border-white/[0.075] px-4 pb-3.5 pt-4 sm:px-5">
              <div className="flex items-start justify-between gap-4">
                <div><h2 className="text-[16px] font-semibold tracking-[-0.025em] text-white/90">Search Based Bid</h2><p className="mt-0.5 text-[9.5px] font-light text-white/32">Tokens, LBPs, boards and users in one place.</p></div>
                <button type="button" onClick={onClose} aria-label="Close search" className="grid h-7 w-7 place-items-center rounded-full text-white/30 transition hover:bg-white/[0.05] hover:text-white/72"><X className="h-3.5 w-3.5" /></button>
              </div>
              <div className="mt-3.5 flex items-center gap-2 rounded-[14px] border border-white/[0.105] bg-white/[0.025] px-3.5 focus-within:border-[#18c98e]/30 focus-within:shadow-[0_0_0_3px_rgba(24,201,142,0.035)]">
                <Search className="h-4 w-4 shrink-0 text-white/38" />
                <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tokens, LBPs, boards or users" className="h-11 min-w-0 flex-1 bg-transparent text-[12px] text-white/86 outline-none placeholder:text-white/27" />
                <kbd className="rounded-md border border-white/[0.075] bg-white/[0.025] px-1.5 py-0.5 text-[8px] font-medium text-white/30">ESC</kbd>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[8.5px] font-semibold uppercase tracking-[0.14em] text-white/25">Sort results</span>
                <div className="inline-flex rounded-[10px] border border-white/[0.07] bg-white/[0.014] p-0.5">
                  {([['relevance', 'Best match'], ['recent', 'Recent'], ['az', 'A to Z']] as const).map(([id, label]) => <button key={id} type="button" onClick={() => setSort(id)} aria-pressed={sort === id} className={`h-7 rounded-[8px] px-2.5 text-[9px] font-medium transition ${sort === id ? 'bg-white/[0.075] text-white/78 shadow-[inset_0_1px_rgba(255,255,255,0.035)]' : 'text-white/31 hover:text-white/58'}`}>{label}</button>)}
                </div>
              </div>
            </header>

            <div className="grid min-h-0 flex-1 grid-cols-1 sm:grid-cols-[174px_minmax(0,1fr)]">
              <aside className="border-b border-white/[0.07] p-3 sm:border-b-0 sm:border-r">
                <p className="px-2 pb-2 pt-1 text-[8px] font-semibold uppercase tracking-[0.16em] text-white/23">Directories</p>
                <div className="flex gap-1 overflow-x-auto sm:block sm:space-y-1">
                  <button type="button" onClick={() => setDirectory("all")} className={`flex h-9 shrink-0 items-center gap-2 rounded-[10px] px-2.5 text-[10px] font-medium transition sm:w-full ${directory === 'all' ? 'bg-white/[0.07] text-white/80' : 'text-white/39 hover:bg-white/[0.035] hover:text-white/68'}`}><Search className="h-3.5 w-3.5" /><span>Everything</span><span className="ml-auto font-mono text-[8px] text-white/23">{SEARCH_ENTRIES.length}</span></button>
                  {kindOrder.map((kind) => {
                    const item = DIRECTORY_META[kind];
                    const Icon = item.icon;
                    const count = SEARCH_ENTRIES.filter((entry) => entry.kind === kind).length;
                    return <button key={kind} type="button" onClick={() => setDirectory(kind)} className={`flex h-9 shrink-0 items-center gap-2 rounded-[10px] px-2.5 text-[10px] font-medium transition sm:w-full ${directory === kind ? 'bg-white/[0.07] text-white/80' : 'text-white/39 hover:bg-white/[0.035] hover:text-white/68'}`}><Icon className="h-3.5 w-3.5" style={{ color: directory === kind ? item.color : undefined }} /><span>{item.label}</span><span className="ml-auto font-mono text-[8px] text-white/23">{count}</span></button>;
                  })}
                  <button type="button" onClick={() => setDirectory("history")} className={`flex h-9 shrink-0 items-center gap-2 rounded-[10px] px-2.5 text-[10px] font-medium transition sm:mt-3 sm:w-full ${directory === 'history' ? 'bg-white/[0.07] text-white/80' : 'text-white/39 hover:bg-white/[0.035] hover:text-white/68'}`}><Clock3 className="h-3.5 w-3.5 text-[#e1ca7b]" /><span>History</span>{historyEntries.length ? <span className="ml-auto font-mono text-[8px] text-white/23">{historyEntries.length}</span> : null}</button>
                </div>
                {historyEntries.length ? <button type="button" onClick={clearHistory} className="mt-2 hidden px-2 text-[8.5px] text-white/22 transition hover:text-white/50 sm:block">Clear history</button> : null}
              </aside>

              <div className="min-h-0 overflow-y-auto px-4 py-4 [scrollbar-color:#303936_transparent] [scrollbar-width:thin] sm:px-5">
                {showHistory ? (
                  <section aria-label="Recent search history">
                    <div className="mb-3 flex items-center gap-2"><Clock3 className="h-3.5 w-3.5 text-[#e1ca7b]" /><h3 className="text-[10px] font-semibold uppercase tracking-[0.11em] text-white/54">Recent</h3><span className="text-[8.5px] font-light text-white/24">Opened from search</span><span className="ml-auto font-mono text-[8px] text-white/22">{historyEntries.length}</span></div>
                    <div className="grid gap-2 md:grid-cols-2">{historyEntries.map((entry) => <SearchResult key={`history-${entry.kind}-${entry.id}`} entry={entry} onSelect={selectEntry} />)}</div>
                  </section>
                ) : !normalized && directory === "history" ? (
                  <div className="grid h-full min-h-48 place-items-center text-center"><div><Clock3 className="mx-auto h-5 w-5 text-white/17" /><p className="mt-3 text-[11px] font-medium text-white/52">No search history yet</p><p className="mt-1 text-[9.5px] font-light text-white/27">Items you open from search will appear here.</p></div></div>
                ) : !normalized ? (
                  <div className="flex h-full min-h-[320px] items-center justify-center py-4">
                    <div className="w-full max-w-[560px] text-center">
                      <span className="mx-auto grid h-11 w-11 place-items-center rounded-[14px] border border-white/[0.075] bg-white/[0.018] text-white/28"><Search className="h-[18px] w-[18px]" strokeWidth={1.7} /></span>
                      <h3 className="mt-4 text-[14px] font-semibold tracking-[-0.025em] text-white/68">{idleDirectory ? `Search ${idleDirectory.label}` : "Find anything on Based Bid"}</h3>
                      <p className="mx-auto mt-1.5 max-w-[420px] text-[10px] font-light leading-[1.55] text-white/30">{idleDirectory ? `${idleDirectory.caption}. Start typing a name, symbol, network or handle.` : "Start typing above, or choose a directory to narrow the search."}</p>
                      {!idleDirectory ? (
                        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {kindOrder.map((kind) => {
                            const item = DIRECTORY_META[kind];
                            const Icon = item.icon;
                            const count = SEARCH_ENTRIES.filter((entry) => entry.kind === kind).length;
                            return <button key={`idle-${kind}`} type="button" onClick={() => setDirectory(kind)} className="group rounded-[13px] border border-white/[0.065] bg-white/[0.012] px-2.5 py-3 text-left transition hover:border-white/[0.12] hover:bg-white/[0.03]"><span className="flex items-center justify-between"><Icon className="h-3.5 w-3.5" style={{ color: item.color }} strokeWidth={1.8} /><span className="font-mono text-[8px] text-white/20">{count}</span></span><strong className="mt-2 block text-[10px] font-medium text-white/53 group-hover:text-white/76">{item.label}</strong><span className="mt-0.5 block truncate text-[8px] font-light text-white/24">{item.caption}</span></button>;
                          })}
                        </div>
                      ) : null}
                      <div className="mt-5 inline-flex items-center gap-2 text-[8.5px] text-white/20"><kbd className="rounded border border-white/[0.065] px-1.5 py-0.5 font-mono">/</kbd><span>Open search from anywhere</span></div>
                    </div>
                  </div>
                ) : filtered.length ? (
                  <div className="space-y-5">
                    {(directory === "all" ? kindOrder : directory === "history" ? kindOrder.filter((kind) => filtered.some((entry) => entry.kind === kind)) : [directory]).map((kind) => {
                      const meta = DIRECTORY_META[kind];
                      const Icon = meta.icon;
                      const entries = filtered.filter((entry) => entry.kind === kind);
                      if (!entries.length) return null;
                      return <section key={kind} aria-label={meta.label}><div className="mb-2.5 flex items-center gap-2"><Icon className="h-3.5 w-3.5" style={{ color: meta.color }} strokeWidth={1.8} /><h3 className="text-[10px] font-semibold uppercase tracking-[0.11em] text-white/54">{meta.label}</h3><span className="text-[8.5px] font-light text-white/24">{meta.caption}</span><span className="ml-auto font-mono text-[8px] text-white/22">{entries.length}</span></div><div className="grid gap-2 md:grid-cols-2">{entries.map((entry) => <SearchResult key={`${kind}-${entry.id}`} entry={entry} onSelect={selectEntry} />)}</div></section>;
                    })}
                  </div>
                ) : (
                  <div className="grid h-full min-h-48 place-items-center text-center"><div><Search className="mx-auto h-5 w-5 text-white/17" /><p className="mt-3 text-[11px] font-medium text-white/52">No results for "{query}"</p><p className="mt-1 text-[9.5px] font-light text-white/27">Try a symbol, board name or creator handle.</p></div></div>
                )}
              </div>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
