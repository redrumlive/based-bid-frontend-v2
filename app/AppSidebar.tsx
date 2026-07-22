"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Code2,
  Coins,
  Hash,
  Plus,
  Search,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useRef, type CSSProperties, type MouseEventHandler, type ReactNode } from "react";
import { openGlobalSearch } from "./GlobalSearchModal";

const boards = [
  { id: "based", name: "Based" },
  { id: "digital", name: "Digital" },
  { id: "abt", name: "ABTCapital" },
  { id: "prempad", name: "PremPad" },
  { id: "uaecalls", name: "UAECALLS" },
  { id: "tomcruise", name: "Tomcruise" },
  { id: "defimentor", name: "DeFiMentor" },
  { id: "mlmx", name: "MLMX" },
  { id: "alpha", name: "Alpha Calls" },
  { id: "beta", name: "Beta Labs" },
  { id: "gamma", name: "Gamma Group" },
  { id: "delta", name: "Delta Syndicate" },
  { id: "omega", name: "Omega DAO" },
  { id: "sigma", name: "Sigma Snipers" },
  { id: "zen", name: "Zen Trades" },
];

function SidebarNavItem({ href, label, icon, active, feature, compact, onClick }: { href: string; label: string; icon: ReactNode; active: boolean; feature: "create" | "fees" | "openbid"; compact: boolean; onClick?: MouseEventHandler<HTMLAnchorElement> }) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const spotlight = feature === "fees"
    ? "radial-gradient(140px circle at var(--sx) var(--sy), rgba(234,179,8,0.22), transparent 55%)"
    : feature === "openbid"
      ? "radial-gradient(150px circle at var(--sx) var(--sy), rgba(139,92,246,0.25), transparent 58%)"
      : "radial-gradient(140px circle at var(--sx) var(--sy), rgba(24,201,142,0.18), transparent 55%)";
  const hoverTone = feature === "openbid"
    ? "hover:bg-violet-500/[0.055] hover:text-white"
    : feature === "fees"
      ? "hover:bg-amber-400/[0.045] hover:text-white"
      : "hover:bg-[#18c98e]/[0.045] hover:text-white";
  const iconTone = feature === "openbid"
    ? active
      ? "bg-white/[0.035] text-violet-300 ring-white/10"
      : "bg-white/[0.035] text-white/38 ring-white/10 group-hover:bg-violet-500/[0.14] group-hover:text-violet-200 group-hover:ring-violet-400/24"
    : feature === "fees"
      ? active
        ? "bg-white/[0.035] text-amber-300 ring-white/10"
        : "bg-white/[0.035] text-white/38 ring-white/10 group-hover:bg-amber-400/[0.12] group-hover:text-amber-100 group-hover:ring-amber-300/22"
      : active
        ? "bg-white/[0.035] text-[#18c98e] ring-white/10"
        : "bg-white/[0.035] text-white/38 ring-white/10 group-hover:bg-[#18c98e]/[0.12] group-hover:text-[#dcffe7] group-hover:ring-[#18c98e]/22";

  const updateSpot = useCallback((x: string, y: string) => {
    const element = ref.current;
    if (!element) return;
    element.style.setProperty("--sx", x);
    element.style.setProperty("--sy", y);
  }, []);

  return (
    <Link
      ref={ref}
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      onMouseMove={(event) => {
        const bounds = ref.current?.getBoundingClientRect();
        if (!bounds) return;
        updateSpot(`${event.clientX - bounds.left}px`, `${event.clientY - bounds.top}px`);
      }}
      onMouseLeave={() => updateSpot("-999px", "-999px")}
      aria-label={compact ? label : undefined}
      className={`group relative isolate flex w-full items-center rounded-lg py-1.5 text-left text-sm text-white/68 transition-[background-color,color,box-shadow] duration-300 ${compact ? "justify-center px-1" : "gap-2 px-2.5"} ${active ? "" : hoverTone}`}
      style={{ "--sx": "-999px", "--sy": "-999px" } as CSSProperties}
    >
      <span aria-hidden="true" className={`pointer-events-none absolute inset-0 -z-10 rounded-lg opacity-0 transition-opacity duration-300 ${active ? "" : "group-hover:opacity-100"}`} style={{ background: spotlight }} />
      <span className={`grid h-8 w-8 place-items-center rounded-lg ring-1 transition-colors duration-300 ${iconTone}`}>{icon}</span>
      <span className={compact ? "sr-only" : ""}>{label}</span>
      {compact ? <span className="pointer-events-none absolute left-[calc(100%+9px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/[0.09] bg-[#111513]/96 px-2.5 py-1.5 text-[10px] font-medium text-white/72 opacity-0 shadow-[0_12px_28px_rgba(0,0,0,0.42)] backdrop-blur-xl transition duration-150 group-hover:translate-x-0.5 group-hover:opacity-100">{label}</span> : null}
    </Link>
  );
}

export default function AppSidebar({ onOpenCollectFees, onCloseCollectFees, collectFeesOpen = false, compact = false, collapsible = false, onToggleCompact }: { onOpenCollectFees: () => void; onCloseCollectFees?: () => void; collectFeesOpen?: boolean; compact?: boolean; collapsible?: boolean; onToggleCompact?: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      onPointerDownCapture={(event) => {
        if (!collectFeesOpen || (event.target as Element).closest('a[href="#collect-fees"]')) return;
        onCloseCollectFees?.();
      }}
      className={`sticky top-14 z-[245] hidden h-[calc(100vh-6.25rem)] shrink-0 flex-col border-r border-white/[0.08] bg-[linear-gradient(180deg,#0b0c0c_0%,#090a0a_100%)] shadow-[8px_0_32px_rgba(0,0,0,0.12)] transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:flex ${compact ? "w-[66px]" : "w-[272px]"}`}
    >
      {collapsible ? (
        <button
          type="button"
          onClick={onToggleCompact}
          aria-label={compact ? "Open sidebar" : "Collapse sidebar"}
          className="absolute right-0 top-0 z-50 grid h-8 w-6 -translate-y-1/2 translate-x-1/2 place-items-center bg-transparent text-white/34 outline-none transition-colors duration-180 hover:text-[#52dfb2] focus-visible:text-[#52dfb2]"
        >
          {compact ? <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.65} /> : <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.65} />}
        </button>
      ) : null}
      <div className={`app-sidebar-scroll min-h-0 flex-1 overflow-y-auto pb-6 pt-3 ${compact ? "px-2" : "px-3 pr-[6px]"}`}>
        {compact ? (
          <>
            <button type="button" onClick={openGlobalSearch} aria-label="Search" className="group relative grid h-10 w-full place-items-center rounded-xl border border-white/[0.085] bg-white/[0.025] text-white/42 outline-none transition hover:border-[#18c98e]/24 hover:bg-[#18c98e]/[0.055] hover:text-[#18c98e] focus-visible:border-[#18c98e]/38"><Search className="h-4 w-4" /><span className="pointer-events-none absolute left-[calc(100%+9px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/[0.09] bg-[#111513]/96 px-2.5 py-1.5 text-[10px] font-medium text-white/72 opacity-0 shadow-[0_12px_28px_rgba(0,0,0,0.42)] backdrop-blur-xl transition duration-150 group-hover:translate-x-0.5 group-hover:opacity-100">Search</span></button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <button type="button" onClick={openGlobalSearch} className="relative min-w-0 flex-1 text-left">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
              <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-white/50 ring-1 ring-white/10">/</kbd>
              <span className="block w-full rounded-2xl bg-white/5 py-2.5 pl-10 pr-10 text-sm text-white/36 ring-1 ring-white/10 transition hover:bg-white/[0.065] hover:text-white/52 hover:ring-white/15">Search tokens, boards...</span>
            </button>
          </div>
        )}

        <nav className={`mt-3 ${compact ? "space-y-1" : "space-y-2"}`} aria-label="Primary navigation">
          <SidebarNavItem compact={compact} href="/create" label="Create" feature="create" active={pathname === "/create" || pathname.startsWith("/create/")} icon={<Plus className="h-4 w-4" />} />
          <SidebarNavItem compact={compact} href="#collect-fees" label="Collect Fees" feature="fees" active={collectFeesOpen} onClick={(event) => { event.preventDefault(); onOpenCollectFees(); }} icon={<Coins className="h-4 w-4" />} />
          <SidebarNavItem compact={compact} href="/openbid" label="OpenBid" feature="openbid" active={pathname === "/openbid" || pathname.startsWith("/openbid/")} icon={<Code2 className="h-4 w-4" />} />
        </nav>

        <div className={`mt-5 items-center justify-between px-1 ${compact ? "hidden" : "flex"}`}>
          <div className="text-xs font-semibold uppercase text-white/45">Boards</div>
          <button type="button" className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1 text-xs text-white/60 transition hover:bg-white/5 hover:text-white/82">
            <span>Smart</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className={compact ? "mt-4 space-y-1" : "mt-2 space-y-0.5"}>
          {boards.map((board, index) => (
            <Link
              key={board.id}
              href={`/?board=${board.id}`}
              aria-label={compact ? board.name : undefined}
              className={`group relative flex h-10 items-center rounded-xl text-sm transition-[background-color,color] duration-200 ${compact ? "justify-center px-1" : "gap-2 px-2.5"} ${index === 0 ? "bg-gradient-to-r from-white/[0.075] to-white/[0.035] text-white before:absolute before:bottom-2 before:left-0 before:top-2 before:w-[2px] before:rounded-full before:bg-[#18c98e]/85" : "text-white/70 hover:bg-white/[0.045] hover:text-white/92"}`}
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.045] text-white/62 ring-1 ring-white/10">
                <Hash className="h-3.5 w-3.5" />
              </span>
              <span className={compact ? "sr-only" : "truncate"}>{board.name}</span>
              {compact ? <span className="pointer-events-none absolute left-[calc(100%+9px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/[0.09] bg-[#111513]/96 px-2.5 py-1.5 text-[10px] font-medium text-white/72 opacity-0 shadow-[0_12px_28px_rgba(0,0,0,0.42)] backdrop-blur-xl transition duration-150 group-hover:translate-x-0.5 group-hover:opacity-100">{board.name}</span> : null}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
