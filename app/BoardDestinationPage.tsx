"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  Clock3,
  Flame,
  Globe2,
  Hash,
  Info,
  LayoutGrid,
  Network,
  Plus,
  Rocket,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaXTwitter } from "react-icons/fa6";

type NetworkId = "robinhood" | "base" | "bsc" | "sol" | "eth";
type FeedSort = "smart" | "hot" | "new" | "full";
type BoardProfile = {
  id: string;
  name: string;
  handle: string;
  tagline: string;
  description: string;
  accent: string;
  accentSoft: string;
  network: NetworkId;
  followers: number;
  launches: number;
  volume: number;
  created: string;
  moderator: string;
  initials: string;
  socials: { website?: string; x?: string; telegram?: string };
  rules: string[];
};

type Launch = {
  id: string;
  title: string;
  ticker: string;
  creator: string;
  board: string;
  description: string;
  network: NetworkId;
  kind: "lbp" | "token";
  change: number;
  marketCap: number;
  target?: number;
  volume: number;
  trades: number;
  comments: number;
  ageMinutes: number;
  accent: string;
  avatar?: string;
  chart: number[];
};

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

const BOARD_PROFILES: Record<string, BoardProfile> = {
  digital: {
    id: "digital", name: "Digital", handle: "digital", initials: "DI", accent: "#43a7ff", accentSoft: "#2367d6", network: "robinhood",
    tagline: "Digital economies, culture and creator-owned markets.",
    description: "A curated launch board for internet-native products, communities and programmable digital assets.",
    followers: 18420, launches: 42, volume: 6280000, created: "September 2025", moderator: "nora",
    socials: { website: "https://based.bid", x: "https://x.com/basedbidx", telegram: "https://t.me/TheBasedInc" },
    rules: ["Ship something real", "Use clear launch terms", "Keep discussion useful"],
  },
  abt: {
    id: "abt", name: "ABTCapital", handle: "abtcapital", initials: "AB", accent: "#f0d77f", accentSoft: "#9b7133", network: "bsc",
    tagline: "Tokenized capital markets and revenue-backed launches.",
    description: "A professional board focused on market infrastructure, real yield and programmable ownership.",
    followers: 9230, launches: 18, volume: 3910000, created: "November 2025", moderator: "abtcapital",
    socials: { website: "https://based.bid", x: "https://x.com/basedbidx" },
    rules: ["Disclose economic terms", "No guaranteed returns", "Source material claims"],
  },
  sigma: {
    id: "sigma", name: "Sigma Snipers", handle: "sigma", initials: "SS", accent: "#a78bfa", accentSoft: "#6647b8", network: "robinhood",
    tagline: "Curated signals for markets that move before the crowd.",
    description: "Research-led launches, tokenized strategies and market intelligence selected by the Sigma community.",
    followers: 31780, launches: 58, volume: 11840000, created: "August 2025", moderator: "cass",
    socials: { x: "https://x.com/basedbidx", telegram: "https://t.me/TheBasedInc" },
    rules: ["Thesis before ticker", "No copied calls", "Respect disclosed positions"],
  },
};

const SIDEBAR_PROFILES: Array<[string, string, string, string]> = [
  ["prempad", "PremPad", "PP", "#f0d77f"],
  ["uaecalls", "UAECALLS", "UA", "#f59e0b"],
  ["tomcruise", "Tomcruise", "TC", "#f97316"],
  ["defimentor", "DeFiMentor", "DF", "#18c98e"],
  ["mlmx", "MLMX", "MX", "#ec4899"],
  ["alpha", "Alpha Calls", "AC", "#60a5fa"],
  ["beta", "Beta Labs", "BL", "#38bdf8"],
  ["gamma", "Gamma Group", "GG", "#c084fc"],
  ["delta", "Delta Syndicate", "DS", "#f472b6"],
  ["omega", "Omega DAO", "OD", "#818cf8"],
  ["zen", "Zen Trades", "ZT", "#2dd4bf"],
];

for (const [id, name, initials, accent] of SIDEBAR_PROFILES) {
  if (BOARD_PROFILES[id]) continue;
  BOARD_PROFILES[id] = {
    id, name, handle: id, initials, accent, accentSoft: accent,
    network: id === "uaecalls" || id === "beta" ? "bsc" : id === "zen" || id === "gamma" ? "sol" : id === "defimentor" || id === "omega" ? "eth" : "base",
    tagline: `${name} launches, research and community-owned markets.`,
    description: `The official ${name} board for curated launches, active market discussion and programmable token economies.`,
    followers: 4200 + id.length * 860, launches: 12 + id.length * 3, volume: 740000 + id.length * 310000,
    created: "December 2025", moderator: id,
    socials: { x: "https://x.com/basedbidx", telegram: "https://t.me/TheBasedInc" },
    rules: ["Keep launches transparent", "Add context to every call", "No spam or impersonation"],
  };
}

const AGGREGATOR_PROFILE: BoardProfile = {
  id: "based", name: "Based", handle: "based", initials: "#", accent: "#18c98e", accentSoft: "#11694d", network: "base",
  tagline: "Every board. Every launch. One programmable market.",
  description: "The network-wide discovery layer for launches published across Based Bid boards.",
  followers: 0, launches: 128, volume: 28400000, created: "", moderator: "Based Bid",
  socials: {}, rules: [],
};

const NETWORK_META: Record<NetworkId, { label: string; icon: string }> = {
  robinhood: { label: "Robinhood", icon: "/networks/robinhood.png" },
  base: { label: "Base", icon: "/networks/base.png" },
  bsc: { label: "BNB", icon: "/networks/bsc.png" },
  sol: { label: "Solana", icon: "/networks/sol.png" },
  eth: { label: "Ethereum", icon: "/networks/ethereum.png" },
};

const LAUNCH_BLUEPRINTS: Omit<Launch, "board">[] = [
  { id: "robin-index", title: "Robin Index", ticker: "RDX", creator: "cass", description: "A community-curated basket tracking the strongest tokenized market themes.", network: "robinhood", kind: "lbp", change: 6.5, marketCap: 1320000, target: 1500000, volume: 338000, trades: 958, comments: 91, ageMinutes: 42, accent: "#b8f33d", chart: [34, 36, 35, 41, 45, 43, 49, 54, 58, 61, 64, 68] },
  { id: "gradient", title: "Gradient", ticker: "GRAD", creator: "milo", description: "Experimental social token for builders shipping clean interfaces and fast loops.", network: "base", kind: "lbp", change: 12.4, marketCap: 780000, target: 1000000, volume: 284000, trades: 1320, comments: 84, ageMinutes: 18, accent: "#18c98e", chart: [28, 31, 35, 39, 38, 45, 47, 53, 56, 63, 66, 72] },
  { id: "cashcat", title: "Cashcat", ticker: "CASHCAT", creator: "robin", description: "A high-tempo community economy built for onchain culture and rewards.", network: "robinhood", kind: "token", change: 34.6, marketCap: 2300000, volume: 1180000, trades: 4820, comments: 319, ageMinutes: 8, accent: "#ccff00", avatar: "/tokens/cashcat.png", chart: [24, 27, 30, 37, 35, 44, 51, 55, 63, 67, 74, 82] },
  { id: "signal-room", title: "Signal Room", ticker: "ROOM", creator: "nora", description: "A live intelligence layer for launches, liquidity shifts and social rotation.", network: "base", kind: "token", change: 9.8, marketCap: 604000, volume: 126000, trades: 842, comments: 41, ageMinutes: 74, accent: "#a78bfa", chart: [32, 37, 34, 39, 44, 42, 48, 52, 51, 59, 62, 66] },
  { id: "ether-atlas", title: "Ether Atlas", ticker: "ATLAS", creator: "rune", description: "An open research economy mapping the next generation of Ethereum protocols.", network: "eth", kind: "lbp", change: 4.8, marketCap: 4800000, target: 5000000, volume: 215000, trades: 466, comments: 73, ageMinutes: 126, accent: "#8199ee", chart: [42, 41, 44, 46, 48, 47, 51, 53, 56, 59, 61, 64] },
  { id: "solstice", title: "Solstice", ticker: "SOLST", creator: "aria", description: "Fast-moving creator rails for launches, communities and tokenized media.", network: "sol", kind: "token", change: 19.4, marketCap: 1700000, volume: 672000, trades: 2780, comments: 156, ageMinutes: 96, accent: "#43e7c4", chart: [27, 33, 31, 40, 44, 49, 47, 56, 62, 66, 72, 76] },
  { id: "liquid-gold", title: "Liquid Gold", ticker: "GLD", creator: "mina", description: "A programmable treasury market designed around transparent liquidity.", network: "bsc", kind: "token", change: -3.2, marketCap: 980000, volume: 403000, trades: 1180, comments: 62, ageMinutes: 204, accent: "#f2c94c", chart: [68, 65, 67, 62, 59, 61, 56, 54, 51, 48, 50, 46] },
  { id: "neon-relay", title: "Neon Relay", ticker: "RELAY", creator: "kai", description: "Community-owned routing infrastructure for fast, social-first token launches.", network: "sol", kind: "lbp", change: 10.9, marketCap: 490000, target: 777000, volume: 184000, trades: 726, comments: 54, ageMinutes: 248, accent: "#35d8f2", chart: [31, 34, 38, 36, 41, 46, 50, 53, 55, 61, 64, 69] },
];

const BOARD_LEAD_LAUNCH: Record<string, Partial<Launch>> = {
  digital: { id: "cashcat", title: "Cashcat", ticker: "CASHCAT", avatar: "/tokens/cashcat.png", network: "robinhood", creator: "robin", accent: "#ccff00" },
  abt: { id: "abt-capital", title: "ABT Capital", ticker: "ABT", network: "bsc", creator: "abtcapital", accent: "#f0d77f", description: "A revenue-backed ownership economy for modern capital markets." },
  sigma: { id: "robin-index", title: "Robin Index", ticker: "RDX", network: "robinhood", creator: "cass", accent: "#b8f33d" },
};

const TRENDING_BOARDS = [
  { id: "sigma", name: "Sigma Snipers", members: "31.8K", change: "+18%", accent: "#a78bfa" },
  { id: "digital", name: "Digital", members: "18.4K", change: "+12%", accent: "#43a7ff" },
  { id: "abt", name: "ABTCapital", members: "9.2K", change: "+9%", accent: "#f0d77f" },
  { id: "defimentor", name: "DeFiMentor", members: "8.5K", change: "+7%", accent: "#18c98e" },
];

function resolveProfile(boardName: string) {
  const normalized = decodeURIComponent(boardName).trim().toLowerCase();
  const aliases: Record<string, string> = { abtcapital: "abt", "sigma-snipers": "sigma", "alpha-calls": "alpha", "zen-trades": "zen" };
  const id = aliases[normalized] ?? normalized;
  if (id === "based") return AGGREGATOR_PROFILE;
  if (BOARD_PROFILES[id]) return BOARD_PROFILES[id];
  const words = normalized.split(/[\s-_]+/).filter(Boolean);
  const name = words.map((word) => word[0]?.toUpperCase() + word.slice(1)).join(" ") || "Board";
  return {
    ...BOARD_PROFILES.digital,
    id: normalized,
    handle: normalized,
    name,
    initials: words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join("") || "B",
    tagline: `${name} launches, research and community-owned markets.`,
    description: `The official ${name} destination for launches and market discussion on Based Bid.`,
  };
}

function buildLaunches(profile: BoardProfile, aggregator: boolean) {
  if (aggregator) {
    const boards = ["sigma", "based", "digital", "alpha", "defimentor", "zen", "beta", "gamma"];
    return LAUNCH_BLUEPRINTS.map((launch, index) => ({ ...launch, board: boards[index] }));
  }
  return LAUNCH_BLUEPRINTS.slice(0, 6).map((launch, index) => {
    const lead = index === 0 ? BOARD_LEAD_LAUNCH[profile.id] ?? {} : {};
    return { ...launch, ...lead, network: profile.network, id: index === 0 && lead.id ? lead.id : `${profile.id}-${launch.id}`, board: profile.handle };
  });
}

function formatMoney(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(value >= 10_000_000 ? 1 : 2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(value >= 100_000 ? 0 : 1)}K`;
  return `$${value.toFixed(0)}`;
}

function formatCount(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10_000 ? 1 : 2)}K`;
  return String(value);
}

function boardHref(board: string) {
  return board.toLowerCase() === "based" ? "/" : `/b/${board}`;
}

function NetworkIcon({ network, size = 17 }: { network: NetworkId; size?: number }) {
  return <Image src={NETWORK_META[network].icon} alt={NETWORK_META[network].label} width={size} height={size} className="rounded-full object-cover" />;
}

function BoardMark({ profile, size = "large" }: { profile: BoardProfile; size?: "small" | "large" }) {
  const large = size === "large";
  return (
    <span
      className={cx("relative grid shrink-0 place-items-center rounded-full", large ? "h-[78px] w-[78px]" : "h-9 w-9")}
    >
      <span
        className={cx("absolute inset-0 overflow-hidden rounded-full border bg-[#101312] shadow-[0_12px_32px_rgba(0,0,0,0.36)]", large ? "border-white/14" : "border-white/10")}
        style={{ boxShadow: large ? `0 14px 38px rgba(0,0,0,.42), 0 0 0 1px ${profile.accent}22` : undefined }}
      >
        <span className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at 32% 24%, ${profile.accent}, transparent 62%)` }} />
      </span>
      <span className={cx("relative font-semibold tracking-[-0.04em]", large ? "text-[19px]" : "text-[11px]")} style={{ color: profile.accent }}>{profile.initials}</span>
    </span>
  );
}

function BoardBanner({ profile }: { profile: BoardProfile }) {
  return (
    <div className="relative h-[176px] overflow-hidden rounded-[20px] border border-white/[0.065] bg-[#0d1010]">
      <div className="absolute inset-0 opacity-90" style={{ background: `radial-gradient(700px circle at 18% 5%, ${profile.accent}30, transparent 48%), radial-gradient(600px circle at 90% 110%, ${profile.accentSoft}24, transparent 50%), linear-gradient(125deg,#111515 0%,#0b0d0d 52%,#101312 100%)` }} />
      <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.16) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.16) 1px,transparent 1px)", backgroundSize: "34px 34px", maskImage: "linear-gradient(90deg,black,transparent 85%)" }} />
      <div className="absolute -right-14 -top-24 h-[310px] w-[310px] rounded-full border border-white/[0.055]" />
      <div className="absolute -right-1 top-8 h-[210px] w-[210px] rounded-full border border-white/[0.045]" />
    </div>
  );
}

function Sparkline({ values, accent, positive }: { values: number[]; accent: string; positive: boolean }) {
  const width = 520;
  const height = 92;
  const points = values.map((value, index) => `${(index / (values.length - 1)) * width},${height - value}`).join(" ");
  const id = React.useId().replace(/:/g, "");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`board-chart-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={accent} stopOpacity="0.22" /><stop offset="1" stopColor={accent} stopOpacity="0" /></linearGradient>
      </defs>
      <polygon points={`0,${height} ${points} ${width},${height}`} fill={`url(#board-chart-${id})`} />
      <polyline points={points} fill="none" stroke={positive ? accent : "#ff3771"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function LaunchCard({ launch, index }: { launch: Launch; index: number }) {
  const positive = launch.change >= 0;
  const progress = launch.target ? Math.min(100, (launch.marketCap / launch.target) * 100) : 0;
  const terminalHref = launch.id.includes("robin-index") ? "/token/robin-index" : launch.id.includes("gradient") ? "/token/gradient" : `/token/${launch.id}`;
  return (
    <motion.article layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.035, duration: 0.28, ease: [0.22, 1, 0.36, 1] }} whileHover={{ y: -2 }} className="group relative min-w-0 overflow-hidden rounded-[19px] border border-white/[0.065] bg-[#0e1110] shadow-[0_12px_34px_rgba(0,0,0,0.22)] transition-[border-color,box-shadow] duration-300 hover:border-white/[0.12] hover:shadow-[0_18px_40px_rgba(0,0,0,0.32)]">
      <Link href={terminalHref} aria-label={`Open ${launch.title}`} className="absolute inset-0 z-10 rounded-[19px] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#18c98e]/35" />
      <div className="relative p-4 pb-3.5">
        <div className="flex min-w-0 items-start gap-2.5">
          <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-white/[0.09] bg-[#151817]">
            {launch.avatar ? <Image src={launch.avatar} alt="" width={40} height={40} className="h-full w-full object-cover" /> : <span className="text-[11px] font-semibold" style={{ color: launch.accent }}>{launch.ticker.slice(0, 2)}</span>}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-baseline gap-1.5 pr-14"><h3 className="truncate text-[13.5px] font-semibold tracking-[-0.025em] text-white/91">{launch.title}</h3><span className="shrink-0 text-[8.5px] font-medium text-white/34">{launch.ticker}</span></div>
            <div className="mt-1 flex min-w-0 items-center gap-1.5 text-[9.5px] text-white/31"><span className="uppercase tracking-[0.08em]">{launch.kind}</span><span className="text-white/16">by</span><Link href={`/u/${launch.creator}`} className="relative z-20 truncate text-white/54 transition hover:text-white/78">{launch.creator}</Link><span className="text-white/16">on</span><Link href={boardHref(launch.board)} className="relative z-20 truncate text-white/54 transition hover:text-white/78">b/{launch.board}</Link></div>
          </div>
          <span className={cx("absolute right-4 top-4 text-[9px] font-semibold tabular-nums", positive ? "text-[#18c98e]" : "text-[#ff3771]")}>{positive ? "+" : ""}{launch.change.toFixed(1)}%</span>
        </div>
        <p className="mt-3 line-clamp-2 min-h-[34px] text-[11px] font-light leading-[1.52] text-white/43">{launch.description}</p>
        {launch.kind === "lbp" && launch.target ? (
          <div className="mt-3.5">
            <div className="flex items-end justify-between gap-4"><div><div className="text-[8px] font-semibold uppercase tracking-[0.12em] text-white/25">Market cap</div><div className="mt-1 text-[12px] font-semibold text-white/78">{formatMoney(launch.marketCap)}</div></div><div className="text-right"><div className="text-[8px] font-semibold uppercase tracking-[0.12em] text-white/25">Target</div><div className="mt-1 text-[12px] font-semibold text-white/78">{formatMoney(launch.target)}</div></div></div>
            <div className="mt-2.5 flex items-center gap-2"><div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/[0.075]"><div className="h-full rounded-full bg-[#18c98e] shadow-[0_0_12px_rgba(24,201,142,.25)]" style={{ width: `${progress}%` }} /></div><span className="w-8 text-right text-[9px] font-semibold tabular-nums text-[#18c98e]/78">{Math.floor(progress)}%</span></div>
          </div>
        ) : (
          <div className="-mx-4 mt-2 h-[67px]"><Sparkline values={launch.chart} accent={launch.accent} positive={positive} /></div>
        )}
        <div className="mt-3 flex items-center gap-3 text-[9px] text-white/31"><span className="inline-flex items-center gap-1"><Activity className="h-3 w-3" />{formatCount(launch.trades)}</span><span className="inline-flex items-center gap-1"><TrendingUp className="h-3 w-3" />{formatMoney(launch.volume)}</span></div>
      </div>
    </motion.article>
  );
}

function SortControls({ value, onChange }: { value: FeedSort; onChange: (value: FeedSort) => void }) {
  const items: Array<{ id: FeedSort; label: string; icon: React.ReactNode }> = [
    { id: "smart", label: "Smart", icon: <Sparkles className="h-3.5 w-3.5" /> },
    { id: "hot", label: "Hot", icon: <Flame className="h-3.5 w-3.5" /> },
    { id: "new", label: "New", icon: <Clock3 className="h-3.5 w-3.5" /> },
    { id: "full", label: "Full", icon: <LayoutGrid className="h-3.5 w-3.5" /> },
  ];
  return <div className="flex items-center gap-1">{items.map((item) => <button key={item.id} type="button" onClick={() => onChange(item.id)} className={cx("inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[10px] font-medium outline-none transition", value === item.id ? "border-white/14 bg-white/[0.075] text-white/82" : "border-white/[0.075] text-white/35 hover:border-white/12 hover:text-white/62")}>{item.icon}{item.label}</button>)}</div>;
}

function NetworkFilter({ value, onChange }: { value: NetworkId | "all"; onChange: (value: NetworkId | "all") => void }) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  const active = value === "all" ? null : NETWORK_META[value];
  return (
    <div ref={rootRef} className="relative">
      <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} className="inline-flex h-8 min-w-[132px] items-center justify-between gap-2 rounded-full border border-white/[0.075] px-3 text-[10px] font-medium text-white/46 transition hover:border-white/12 hover:text-white/68">{active ? <span className="inline-flex items-center gap-1.5"><NetworkIcon network={value as NetworkId} size={14} />{active.label}</span> : <span className="inline-flex items-center gap-1.5"><Network className="h-3.5 w-3.5 text-[#18c98e]" />All networks</span>}<ChevronDown className={cx("h-3 w-3 transition-transform", open && "rotate-180")} /></button>
      <AnimatePresence>{open ? <motion.div initial={{ opacity: 0, y: -4, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -3, scale: .99 }} className="absolute right-0 top-10 z-40 w-[185px] rounded-[13px] border border-white/[0.09] bg-[#111413]/98 p-1.5 shadow-[0_18px_44px_rgba(0,0,0,.5)] backdrop-blur-xl"><button type="button" onClick={() => { onChange("all"); setOpen(false); }} className="flex h-8 w-full items-center gap-2 rounded-lg px-2.5 text-left text-[10px] text-white/56 hover:bg-white/[0.045]"><Network className="h-3.5 w-3.5 text-[#18c98e]" />All networks{value === "all" ? <Check className="ml-auto h-3 w-3 text-[#18c98e]" /> : null}</button>{(Object.keys(NETWORK_META) as NetworkId[]).map((network) => <button key={network} type="button" onClick={() => { onChange(network); setOpen(false); }} className="flex h-8 w-full items-center gap-2 rounded-lg px-2.5 text-left text-[10px] text-white/56 hover:bg-white/[0.045]"><NetworkIcon network={network} size={14} />{NETWORK_META[network].label}{value === network ? <Check className="ml-auto h-3 w-3 text-[#18c98e]" /> : null}</button>)}</motion.div> : null}</AnimatePresence>
    </div>
  );
}

function ShareBoardButton() {
  const [copied, setCopied] = React.useState(false);
  const share = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1300);
  };
  return <button type="button" onClick={share} aria-label={copied ? "Board link copied" : "Share board"} className={cx("grid h-8 w-8 place-items-center rounded-full transition", copied ? "text-[#18c98e]" : "text-white/35 hover:bg-white/[0.045] hover:text-white/72")}>{copied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}</button>;
}

function CreateBoardMenu({ handle }: { handle: string }) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  return (
    <div ref={rootRef} className="relative mr-2 shrink-0">
      <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} className="bb-board-create group relative isolate inline-flex h-10 min-w-[126px] shrink-0 items-center justify-center gap-2 rounded-[15px] px-5 text-[12px] font-semibold text-white/88"><span aria-hidden="true" className="bb-board-create__glow" /><span aria-hidden="true" className="bb-board-create__wash" /><span aria-hidden="true" className="bb-board-create__edge" /><Plus className="bb-board-create__plus relative z-10 h-4 w-4 text-white/64" /><span className="relative z-10">Create</span><ChevronDown className={cx("relative z-10 h-3 w-3 text-white/34 transition-transform", open && "rotate-180")} /></button>
      <AnimatePresence>{open ? <motion.div initial={{ opacity: 0, y: -4, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -3, scale: .99 }} className="absolute right-0 top-11 z-50 w-[210px] rounded-[14px] border border-white/[0.09] bg-[#111413]/98 p-1.5 shadow-[0_18px_46px_rgba(0,0,0,.54)] backdrop-blur-xl"><Link href={`/create/lbp?board=${handle}`} className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2.5 transition hover:bg-white/[0.045]"><span className="grid h-7 w-7 place-items-center rounded-[8px] border border-[#18c98e]/14 bg-[#18c98e]/[0.045] text-[#18c98e]"><Rocket className="h-3.5 w-3.5" /></span><span><span className="block text-[10.5px] font-medium text-white/68">Launch an LBP</span><span className="mt-0.5 block text-[8.5px] text-white/27">Price discovery pool</span></span></Link><Link href={`/create/token?board=${handle}`} className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2.5 transition hover:bg-white/[0.045]"><span className="grid h-7 w-7 place-items-center rounded-[8px] border border-[#f0d77f]/14 bg-[#f0d77f]/[0.04] text-[#f0d77f]"><Sparkles className="h-3.5 w-3.5" /></span><span><span className="block text-[10.5px] font-medium text-white/68">Create a token</span><span className="mt-0.5 block text-[8.5px] text-white/27">Instant DEX launch</span></span></Link></motion.div> : null}</AnimatePresence>
    </div>
  );
}

function AboutRail({ profile, aggregator }: { profile: BoardProfile; aggregator: boolean }) {
  if (aggregator) {
    return (
      <aside className="space-y-4">
        <section className="rounded-[18px] border border-white/[0.065] bg-[#0d100f] p-4.5">
          <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[#18c98e]" /><h2 className="text-[12px] font-semibold text-white/78">Trending boards</h2></div>
          <div className="mt-3 divide-y divide-white/[0.055]">{TRENDING_BOARDS.map((board, index) => <Link key={board.id} href={`/b/${board.id}`} className="group flex items-center gap-2.5 py-3"><span className="w-4 text-[9px] font-medium tabular-nums text-white/23">{index + 1}</span><span className="grid h-8 w-8 place-items-center rounded-full border border-white/[0.08] bg-white/[0.025] text-[9px] font-semibold" style={{ color: board.accent }}>{board.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><span className="min-w-0 flex-1"><span className="block truncate text-[10.5px] font-medium text-white/65 transition group-hover:text-white/84">{board.name}</span><span className="mt-0.5 block text-[8.5px] text-white/27">{board.members} members</span></span><span className="text-[9px] font-semibold text-[#18c98e]/72">{board.change}</span></Link>)}</div>
          <Link href="/openbid" className="mt-1 inline-flex items-center gap-1.5 text-[9.5px] font-medium text-white/38 transition hover:text-[#18c98e]">Create your board <ArrowUpRight className="h-3 w-3" /></Link>
        </section>
        <section className="rounded-[18px] border border-white/[0.065] bg-[#0d100f] p-4.5"><div className="flex items-center gap-2"><Info className="h-4 w-4 text-white/35" /><h2 className="text-[12px] font-semibold text-white/72">About Based</h2></div><p className="mt-3 text-[10.5px] font-light leading-[1.65] text-white/37">Based aggregates public launches from every board into one network-wide market. Board identity and moderation stay with each community.</p></section>
      </aside>
    );
  }
  return (
    <aside className="space-y-4">
      <section className="rounded-[18px] border border-white/[0.065] bg-[#0d100f] p-4.5">
        <div className="flex items-center gap-2"><Info className="h-4 w-4" style={{ color: profile.accent }} /><h2 className="text-[12px] font-semibold text-white/78">About this board</h2></div>
        <p className="mt-3 text-[10.5px] font-light leading-[1.65] text-white/40">{profile.description}</p>
        <div className="mt-4 grid grid-cols-2 gap-y-3 border-y border-white/[0.055] py-3.5"><div><div className="text-[13px] font-semibold text-white/78">{formatCount(profile.followers)}</div><div className="mt-0.5 text-[8px] uppercase tracking-[0.1em] text-white/24">Followers</div></div><div><div className="text-[13px] font-semibold text-white/78">{profile.launches}</div><div className="mt-0.5 text-[8px] uppercase tracking-[0.1em] text-white/24">Launches</div></div><div><div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-white/74"><NetworkIcon network={profile.network} size={15} />{NETWORK_META[profile.network].label}</div><div className="mt-0.5 text-[8px] uppercase tracking-[0.1em] text-white/24">Network</div></div><div><div className="text-[12px] font-semibold text-white/72">{profile.created}</div><div className="mt-0.5 text-[8px] uppercase tracking-[0.1em] text-white/24">Created</div></div></div>
        <div className="mt-3.5 flex items-center justify-between"><span className="text-[9px] text-white/27">Moderated by</span><Link href={`/u/${profile.moderator}`} className="text-[9.5px] font-medium text-white/55 transition hover:text-white/82">u/{profile.moderator}</Link></div>
      </section>
      <section className="rounded-[18px] border border-white/[0.065] bg-[#0d100f] p-4.5"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-white/35" /><h2 className="text-[12px] font-semibold text-white/72">Board rules</h2></div><ol className="mt-3 divide-y divide-white/[0.05]">{profile.rules.map((rule, index) => <li key={rule} className="flex gap-2.5 py-2.5 text-[10px] text-white/42"><span className="font-mono text-[9px] text-white/21">{String(index + 1).padStart(2, "0")}</span><span>{rule}</span></li>)}</ol></section>
    </aside>
  );
}

export default function BoardDestinationPage({ boardName }: { boardName: string }) {
  const profile = React.useMemo(() => resolveProfile(boardName), [boardName]);
  const aggregator = profile.id === "based";
  const [following, setFollowing] = React.useState(false);
  const [sort, setSort] = React.useState<FeedSort>("smart");
  const [network, setNetwork] = React.useState<NetworkId | "all">("all");
  const [query, setQuery] = React.useState("");
  const launches = React.useMemo(() => {
    let result = buildLaunches(profile, aggregator).filter((launch) => network === "all" || launch.network === network);
    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery) result = result.filter((launch) => `${launch.title} ${launch.ticker} ${launch.creator}`.toLowerCase().includes(normalizedQuery));
    if (sort === "hot") result.sort((a, b) => b.change - a.change);
    else if (sort === "new") result.sort((a, b) => a.ageMinutes - b.ageMinutes);
    else if (sort === "full") result.sort((a, b) => b.marketCap - a.marketCap);
    else result.sort((a, b) => b.volume + b.comments * 800 - (a.volume + a.comments * 800));
    return result;
  }, [aggregator, network, profile, query, sort]);

  return (
    <main className="min-h-[calc(100vh-6.25rem)] bg-[#090a0a] pb-14 text-white">
      <div className="mx-auto w-full max-w-[1680px] px-5 pb-10 pt-5 sm:px-7 lg:px-9">
        {aggregator ? (
          <header className="relative overflow-hidden border-b border-white/[0.065] px-1 pb-7 pt-3">
            <div className="pointer-events-none absolute -left-24 -top-36 h-[340px] w-[540px] rounded-full bg-[#18c98e]/[0.055] blur-[90px]" />
            <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div><div className="inline-flex items-center gap-2 text-[8.5px] font-semibold uppercase tracking-[0.18em] text-[#18c98e]/68"><Network className="h-3.5 w-3.5" /> Network index</div><h1 className="mt-3 text-[34px] font-semibold tracking-[-0.045em] text-white/92">Based</h1><p className="mt-1.5 max-w-[650px] text-[12px] font-light leading-[1.6] text-white/40">{profile.tagline}</p></div>
              <div className="grid grid-cols-3 gap-8"><div><div className="text-[18px] font-semibold tracking-[-0.03em] text-white/82">15</div><div className="mt-1 text-[8px] uppercase tracking-[0.13em] text-white/24">Active boards</div></div><div><div className="text-[18px] font-semibold tracking-[-0.03em] text-white/82">128</div><div className="mt-1 text-[8px] uppercase tracking-[0.13em] text-white/24">Launches</div></div><div><div className="text-[18px] font-semibold tracking-[-0.03em] text-[#18c98e]">5</div><div className="mt-1 text-[8px] uppercase tracking-[0.13em] text-white/24">Networks</div></div></div>
            </div>
          </header>
        ) : (
          <header>
            <BoardBanner profile={profile} />
            <div className="relative -mt-[38px] px-4 sm:px-6">
              <div className="flex min-w-0 flex-col gap-4 min-[1400px]:flex-row min-[1400px]:items-start min-[1400px]:justify-between">
                <div className="flex min-w-0 items-end gap-3.5"><BoardMark profile={profile} /><div className="min-w-0 pb-1"><div className="flex min-w-0 items-center gap-2"><h1 className="truncate text-[25px] font-semibold tracking-[-0.04em] text-white/92">b/{profile.name}</h1><span className="grid h-4 w-4 shrink-0 place-items-center rounded-full border border-white/[0.09] bg-white/[0.035]"><Check className="h-2.5 w-2.5" style={{ color: profile.accent }} /></span></div><p className="mt-1 max-w-[650px] truncate text-[11px] font-light text-white/42">{profile.tagline}</p></div></div>
                <div className="flex w-full min-w-0 flex-wrap items-center gap-2 pb-1 min-[1400px]:mt-[42px] min-[1400px]:w-auto min-[1400px]:shrink-0 min-[1400px]:justify-end">
                  <div className="mr-1 flex items-center gap-0.5">{profile.socials.website ? <a href={profile.socials.website} target="_blank" rel="noreferrer" aria-label="Board website" className="grid h-8 w-8 place-items-center rounded-full text-white/35 transition hover:bg-white/[0.045] hover:text-white/72"><Globe2 className="h-3.5 w-3.5" /></a> : null}{profile.socials.x ? <a href={profile.socials.x} target="_blank" rel="noreferrer" aria-label="Board on X" className="grid h-8 w-8 place-items-center rounded-full text-white/35 transition hover:bg-white/[0.045] hover:text-white/72"><FaXTwitter className="h-3 w-3" /></a> : null}{profile.socials.telegram ? <a href={profile.socials.telegram} target="_blank" rel="noreferrer" aria-label="Board Telegram" className="grid h-8 w-8 place-items-center rounded-full text-white/35 transition hover:bg-white/[0.045] hover:text-white/72"><Send className="h-3.5 w-3.5" /></a> : null}<ShareBoardButton /></div>
                  <button type="button" onClick={() => setFollowing((current) => !current)} className={cx("inline-flex h-10 min-w-[98px] shrink-0 items-center justify-center gap-2 rounded-[14px] border px-4 text-[10.5px] font-semibold transition", following ? "border-white/12 bg-white/[0.065] text-white/75" : "border-white/[0.09] bg-[#101312] text-white/58 hover:border-white/16 hover:text-white/84")}>{following ? <><Check className="h-3.5 w-3.5 text-[#18c98e]" />Following</> : <><Bell className="h-3.5 w-3.5" />Follow</>}</button>
                  <CreateBoardMenu handle={profile.handle} />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-white/[0.06] pb-4 text-[9px] text-white/29"><span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /><strong className="font-semibold text-white/61">{formatCount(profile.followers)}</strong> followers</span><span className="inline-flex items-center gap-1.5"><Rocket className="h-3.5 w-3.5" /><strong className="font-semibold text-white/61">{profile.launches}</strong> launches</span></div>
            </div>
          </header>
        )}

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_286px]">
          <div className="min-w-0">
            {!aggregator ? <section className="mb-4 flex items-center gap-3 rounded-[16px] border border-white/[0.055] bg-[#0d100f] px-4 py-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] border border-white/[0.07] bg-white/[0.025]"><Hash className="h-3.5 w-3.5" style={{ color: profile.accent }} /></span><div className="min-w-0"><div className="text-[8px] font-semibold uppercase tracking-[0.15em]" style={{ color: profile.accent }}>Pinned by the board</div><p className="mt-1 truncate text-[10.5px] font-light text-white/42">{profile.tagline} Review the board rules before publishing.</p></div><Link href="#about-board" className="ml-auto shrink-0 text-[9px] font-medium text-white/31 transition hover:text-white/66">Read context</Link></section> : null}
            <div className="flex flex-col gap-3 border-b border-white/[0.06] pb-4 lg:flex-row lg:items-center lg:justify-between">
              <SortControls value={sort} onChange={setSort} />
              <div className="flex items-center gap-2"><label className="relative hidden sm:block"><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/24" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this board" className="h-8 w-[190px] rounded-full border border-white/[0.075] bg-transparent pl-8 pr-3 text-[10px] text-white/68 outline-none transition placeholder:text-white/23 focus:border-white/15" /></label>{aggregator ? <NetworkFilter value={network} onChange={setNetwork} /> : null}</div>
            </div>
            {launches.length ? <motion.div layout className="mt-5 grid min-w-0 gap-4 md:grid-cols-2">{launches.map((launch, index) => <LaunchCard key={launch.id} launch={launch} index={index} />)}</motion.div> : <div className="mt-5 grid min-h-[260px] place-items-center rounded-[18px] border border-dashed border-white/[0.07] bg-white/[0.01] text-center"><div><Search className="mx-auto h-5 w-5 text-white/18" /><div className="mt-3 text-[12px] font-medium text-white/54">Nothing matches this view</div><div className="mt-1 text-[10px] text-white/26">Clear the board search or change networks.</div></div></div>}
          </div>
          <div id="about-board"><AboutRail profile={profile} aggregator={aggregator} /></div>
        </div>
      </div>
    </main>
  );
}
