"use client";

import {
  ChevronDown,
  Code2,
  Coins,
  Hash,
  Plus,
  Search,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useRef, type CSSProperties, type ReactNode } from "react";

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

function SidebarNavItem({ href, label, icon, active, feature }: { href: string; label: string; icon: ReactNode; active: boolean; feature: "create" | "fees" | "openbid" }) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const spotlight = feature === "fees"
    ? "radial-gradient(140px circle at var(--sx) var(--sy), rgba(234,179,8,0.22), transparent 55%)"
    : feature === "openbid"
      ? "radial-gradient(150px circle at var(--sx) var(--sy), rgba(139,92,246,0.25), transparent 58%)"
      : "radial-gradient(140px circle at var(--sx) var(--sy), rgba(74,222,128,0.18), transparent 55%)";
  const hoverTone = feature === "openbid"
    ? "hover:bg-violet-500/[0.055] hover:text-white"
    : feature === "fees"
      ? "hover:bg-amber-400/[0.045] hover:text-white"
      : "hover:bg-[#4ade80]/[0.045] hover:text-white";
  const activeTone = feature === "openbid"
    ? "bg-violet-500/[0.11] text-violet-100 ring-1 ring-violet-400/24 shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_8px_20px_rgba(76,29,149,0.12)]"
    : feature === "fees"
      ? "bg-amber-400/[0.09] text-amber-50 ring-1 ring-amber-300/22 shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_8px_20px_rgba(120,80,0,0.10)]"
      : "bg-[#4ade80]/[0.09] text-[#dcffe7] ring-1 ring-[#4ade80]/22 shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_8px_20px_rgba(0,100,70,0.10)]";
  const iconTone = feature === "openbid"
    ? active
      ? "bg-violet-500/[0.18] text-violet-200 ring-violet-400/30"
      : "bg-white/[0.035] text-white/38 ring-white/10 group-hover:bg-violet-500/[0.14] group-hover:text-violet-200 group-hover:ring-violet-400/24"
    : feature === "fees"
      ? active
        ? "bg-amber-400/[0.16] text-amber-100 ring-amber-300/28"
        : "bg-white/[0.035] text-white/38 ring-white/10 group-hover:bg-amber-400/[0.12] group-hover:text-amber-100 group-hover:ring-amber-300/22"
      : active
        ? "bg-[#4ade80]/[0.15] text-[#dcffe7] ring-[#4ade80]/28"
        : "bg-white/[0.035] text-white/38 ring-white/10 group-hover:bg-[#4ade80]/[0.12] group-hover:text-[#dcffe7] group-hover:ring-[#4ade80]/22";

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
      onMouseMove={(event) => {
        const bounds = ref.current?.getBoundingClientRect();
        if (!bounds) return;
        updateSpot(`${event.clientX - bounds.left}px`, `${event.clientY - bounds.top}px`);
      }}
      onMouseLeave={() => updateSpot("-999px", "-999px")}
      className={`group relative isolate flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm text-white/68 transition-[background-color,color,box-shadow] duration-300 ${active ? activeTone : hoverTone}`}
      style={{ "--sx": "-999px", "--sy": "-999px" } as CSSProperties}
    >
      <span aria-hidden="true" className={`pointer-events-none absolute inset-0 -z-10 rounded-lg transition-opacity duration-300 ${active ? "opacity-55" : "opacity-0 group-hover:opacity-100"}`} style={{ background: spotlight }} />
      <span className={`grid h-8 w-8 place-items-center rounded-lg ring-1 transition-colors duration-300 ${iconTone}`}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-6.25rem)] w-[272px] shrink-0 flex-col border-r border-white/[0.08] bg-[linear-gradient(180deg,#0b0c0c_0%,#090a0a_100%)] shadow-[8px_0_32px_rgba(0,0,0,0.12)] md:flex">
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-6 pr-[6px] pt-3">
        <form action="/" className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-white/50 ring-1 ring-white/10">/</kbd>
          <input name="q" placeholder="Search tokens, boards..." className="w-full rounded-2xl bg-white/5 py-2.5 pl-10 pr-10 text-sm text-white outline-none ring-1 ring-white/10 transition focus:ring-2 focus:ring-white/15" />
        </form>

        <nav className="mt-3 space-y-2" aria-label="Primary navigation">
          <SidebarNavItem href="/create" label="Create" feature="create" active={pathname === "/create" || pathname.startsWith("/create/")} icon={<Plus className="h-4 w-4" />} />
          <SidebarNavItem href="/?collect=1" label="Collect Fees" feature="fees" active={false} icon={<Coins className="h-4 w-4" />} />
          <SidebarNavItem href="/openbid" label="OpenBid" feature="openbid" active={pathname === "/openbid" || pathname.startsWith("/openbid/")} icon={<Code2 className="h-4 w-4" />} />
        </nav>

        <div className="mt-5 flex items-center justify-between px-1">
          <div className="text-xs font-semibold uppercase text-white/45">Boards</div>
          <button type="button" className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1 text-xs text-white/60 transition hover:bg-white/5 hover:text-white/82">
            <span>Smart</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-2 space-y-0.5">
          {boards.map((board, index) => (
            <Link
              key={board.id}
              href={`/?board=${board.id}`}
              className={`group relative flex h-10 items-center gap-2 rounded-xl px-2.5 text-sm transition-[background-color,color] duration-200 ${index === 0 ? "bg-gradient-to-r from-white/[0.075] to-white/[0.035] text-white before:absolute before:bottom-2 before:left-0 before:top-2 before:w-[2px] before:rounded-full before:bg-[#4ade80]/85" : "text-white/70 hover:bg-white/[0.045] hover:text-white/92"}`}
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.045] text-white/62 ring-1 ring-white/10">
                <Hash className="h-3.5 w-3.5" />
              </span>
              <span className="truncate">{board.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
