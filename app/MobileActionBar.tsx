"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Coins,
  Code2,
  ArrowDownUp,
  Home,
  Link2,
  Menu,
  Megaphone,
  Plus,
  Search,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { openCollectFees } from "./appEvents";
import { openGlobalSearch } from "./GlobalSearchModal";
import { openReleaseUpdates } from "./releaseUpdates";

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

function DockLink({
  href,
  label,
  active,
  icon,
  onClick,
  native,
}: {
  href?: string;
  label: string;
  active?: boolean;
  icon: React.ReactNode;
  onClick?: () => void;
  native?: boolean;
}) {
  const className = cx(
    "group relative flex min-w-0 flex-col items-center justify-center px-1 font-medium tracking-[-0.01em] transition duration-200",
    native ? "h-[58px] gap-0.5 rounded-none text-[9px]" : "h-[54px] gap-1 rounded-[15px] text-[9px]",
    active
      ? native ? "text-white" : "bg-white/[0.065] text-white"
      : "text-white/44 active:bg-white/[0.05] active:text-white/82",
  );
  const content = (
    <>
      {native && active ? <span aria-hidden="true" className="absolute inset-x-[28%] top-0 h-px bg-[#18c98e] shadow-[0_0_10px_rgba(24,201,142,0.62)]" /> : null}
      <span className={cx("transition-colors", active ? "text-[#18c98e]" : "text-white/48 group-active:text-white/82")}>{icon}</span>
      <span className="truncate">{label}</span>
    </>
  );

  if (href) return <Link href={href} className={className}>{content}</Link>;
  return <button type="button" onClick={onClick} className={className}>{content}</button>;
}

function MoreAction({
  icon,
  title,
  subtitle,
  tone,
  href,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tone: "gold" | "orange" | "green" | "pink";
  href?: string;
  onClick?: () => void;
}) {
  const toneClass = tone === "gold"
    ? "bg-[#e5cf78]/[0.07] text-[#e5cf78] ring-[#e5cf78]/15"
    : tone === "pink"
      ? "bg-[#ff007a]/[0.07] text-[#ff73b4] ring-[#ff4aa0]/18"
    : tone === "orange"
      ? "bg-[#ff9c55]/[0.07] text-[#ffad73] ring-[#ff9c55]/15"
      : "bg-[#18c98e]/[0.07] text-[#4bddaa] ring-[#18c98e]/15";
  const className = "flex min-h-[62px] w-full items-center gap-3.5 rounded-[17px] px-3.5 text-left transition active:scale-[0.99] active:bg-white/[0.045]";
  const content = (
    <>
      <span className={cx("grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1", toneClass)}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold text-white/88">{title}</span>
        <span className="mt-0.5 block truncate text-[10px] text-white/40">{subtitle}</span>
      </span>
    </>
  );

  if (href) return <Link href={href} onClick={onClick} className={className}>{content}</Link>;
  return <button type="button" onClick={onClick} className={className}>{content}</button>;
}

export default function MobileActionBar() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = React.useState(false);
  const tokenRoute = pathname.startsWith("/token/");
  const homepage = pathname === "/";

  React.useEffect(() => setMoreOpen(false), [pathname]);

  if (pathname.startsWith("/create/")) return null;

  return (
    <>
      <div aria-hidden="true" className={cx("shrink-0 xl:hidden", homepage ? "h-[72px]" : "h-[86px]")} />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[360] xl:hidden">
        <AnimatePresence>
          {moreOpen ? (
            <>
              <motion.button
                type="button"
                aria-label="Close navigation menu"
                className="pointer-events-auto fixed inset-0 -z-10 bg-black/42 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                onClick={() => setMoreOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.99 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto mx-auto mb-2 w-[calc(100%-24px)] max-w-[448px] overflow-hidden rounded-[24px] border border-white/[0.095] bg-[#0d100f]/98 p-2 shadow-[0_30px_90px_rgba(0,0,0,0.72)] backdrop-blur-2xl"
              >
                <div className="flex items-center justify-between px-3 pb-1.5 pt-1">
                  <div>
                    <div className="text-[9px] font-semibold uppercase tracking-[0.17em] text-[#18c98e]">based bid</div>
                    <div className="mt-0.5 text-[14px] font-semibold tracking-[-0.02em] text-white/90">More to explore</div>
                  </div>
                  <button type="button" onClick={() => setMoreOpen(false)} className="grid h-8 w-8 place-items-center rounded-full text-white/42 transition active:bg-white/[0.06] active:text-white" aria-label="Close menu">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1">
                  <MoreAction
                    icon={<Coins className="h-4 w-4" />}
                    title="Collect fees"
                    subtitle="Claim pending creator fees across your pools"
                    tone="gold"
                    onClick={() => {
                      setMoreOpen(false);
                      openCollectFees();
                    }}
                  />
                  <MoreAction icon={<Link2 className="h-4 w-4" />} title="Based Hook" subtitle="Bring Fee Builder to a new Uniswap v4 pool" tone="pink" href="/add-liquidity" onClick={() => setMoreOpen(false)} />
                  <MoreAction icon={<Code2 className="h-4 w-4" />} title="OpenBid" subtitle="Boards, SDK, API and agent-ready tools" tone="orange" href="/openbid" onClick={() => setMoreOpen(false)} />
                  <MoreAction
                    icon={<Megaphone className="h-4 w-4" />}
                    title="Updates"
                    subtitle="See the newest based bid releases"
                    tone="green"
                    onClick={() => {
                      setMoreOpen(false);
                      openReleaseUpdates();
                    }}
                  />
                </div>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>

        <nav
          aria-label="Mobile navigation"
          className={cx(
            "pointer-events-auto grid grid-cols-[1fr_1fr_82px_1fr_1fr] items-center backdrop-blur-2xl",
            homepage
              ? "h-[calc(66px+env(safe-area-inset-bottom))] w-full border-t border-white/[0.085] bg-[#0a0c0b]/97 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-16px_42px_rgba(0,0,0,0.48),inset_0_1px_0_rgba(255,255,255,0.025)]"
              : "mx-auto mb-[max(10px,env(safe-area-inset-bottom))] h-[68px] w-[calc(100%-20px)] max-w-[460px] rounded-[23px] border border-white/[0.105] bg-[#0d100f]/94 px-1.5 shadow-[0_18px_54px_rgba(0,0,0,0.66),inset_0_1px_0_rgba(255,255,255,0.045)]",
          )}
        >
          <DockLink
            href={tokenRoute ? "#trade-ticket" : "/"}
            label={tokenRoute ? "Trade" : "Home"}
            active={!tokenRoute && pathname === "/"}
            native={homepage}
            icon={tokenRoute ? <ArrowDownUp className="h-[19px] w-[19px]" strokeWidth={1.8} /> : <Home className="h-[19px] w-[19px]" strokeWidth={1.8} />}
          />
          <DockLink native={homepage} label="Search" icon={<Search className="h-[19px] w-[19px]" strokeWidth={1.8} />} onClick={openGlobalSearch} />

          <div className="relative h-full">
            <Link
              href="/create"
              aria-label="Create"
              className={cx(
                "group absolute left-1/2 flex -translate-x-1/2 flex-col items-center justify-center text-[#090a0a] transition active:scale-[0.96]",
                homepage
                  ? "top-[6px] h-[52px] w-[72px] rounded-[16px] shadow-[0_8px_24px_rgba(0,0,0,0.48),0_0_24px_rgba(215,197,127,0.09)]"
                  : "top-[-13px] h-[72px] w-[72px] rounded-[23px] shadow-[0_16px_38px_rgba(0,0,0,0.6),0_0_28px_rgba(215,197,127,0.13)]",
              )}
            >
              <span className={cx("absolute inset-0 bg-[conic-gradient(from_205deg,#18c98e,#b8f33d_34%,#e2cb78_61%,#ff9c55_82%,#18c98e)]", homepage ? "rounded-[16px]" : "rounded-[23px]")} />
              <span className={cx("absolute inset-[1.5px] bg-[linear-gradient(155deg,#eadb91_0%,#b5e84a_48%,#20bd89_100%)]", homepage ? "rounded-[14.5px]" : "rounded-[21.5px]")} />
              <span className="absolute inset-x-3 top-1 h-px bg-white/55 blur-[0.2px]" />
              <Plus className={cx("relative", homepage ? "h-[21px] w-[21px]" : "h-[25px] w-[25px]")} strokeWidth={2.2} />
              <span className={cx("relative font-bold tracking-[-0.02em]", homepage ? "text-[9px]" : "mt-0.5 text-[10px]")}>Create</span>
            </Link>
          </div>

          <DockLink native={homepage} href="/profile#rewards" label="Rewards" active={pathname === "/profile"} icon={<UserRound className="h-[19px] w-[19px]" strokeWidth={1.8} />} />
          <DockLink native={homepage} label="More" active={moreOpen} icon={<Menu className="h-[20px] w-[20px]" strokeWidth={1.8} />} onClick={() => setMoreOpen((value) => !value)} />
        </nav>
      </div>
    </>
  );
}
