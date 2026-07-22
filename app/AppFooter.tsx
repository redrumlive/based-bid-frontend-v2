"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTerminalSidebar } from "./TerminalSidebarContext";
import React from "react";
import { useAppPreferences, type AmbientPreference, type AnimationPreference } from "./AppPreferences";
import { LIVE_CHAT_CONTACTS, usesSharedAppShell } from "./appConfig";
import { FaXTwitter } from "react-icons/fa6";
import {
  ArrowUpRight,
  Calculator,
  ChevronDown,
  Cookie,
  Megaphone,
  MessageCircleMore,
  Presentation,
  Send,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { openReleaseUpdates } from "./releaseUpdates";

const cx = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(" ");

type FooterBarProps = {
  settings: React.ReactNode;
  cookiesEnabled: boolean;
  onToggleCookies: () => void;
  fixed?: boolean;
  compactTerminalSidebar?: boolean;
};

function FooterDropdown({ children, className, id }: { children: React.ReactNode; className: string; id?: string }) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 9, scale: 0.975 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 9, scale: 0.975 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function GitHubMark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12 .7A11.3 11.3 0 0 0 8.43 22.72c.57.1.78-.25.78-.55v-2.16c-3.18.69-3.85-1.35-3.85-1.35-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.24 3.33.95.1-.74.4-1.24.73-1.53-2.54-.29-5.21-1.27-5.21-5.65 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.45.11-3.03 0 0 .96-.31 3.11 1.17A10.8 10.8 0 0 1 12 5.91c.96 0 1.92.13 2.82.38 2.16-1.48 3.11-1.17 3.11-1.17.63 1.58.23 2.74.12 3.03.73.8 1.17 1.82 1.17 3.07 0 4.39-2.68 5.35-5.23 5.64.41.36.78 1.06.78 2.14v3.17c0 .3.2.66.79.55A11.3 11.3 0 0 0 12 .7Z" />
    </svg>
  );
}

function LiveChatMenu() {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="app-footer-live-chat"
        className={cx(
          "group inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-[10px] font-medium transition-[background-color,border-color,color]",
          open
            ? "border-white/[0.14] bg-white/[0.045] text-white/82"
            : "border-white/[0.08] bg-white/[0.018] text-white/46 hover:border-white/[0.14] hover:bg-white/[0.04] hover:text-white/78",
        )}
      >
        <MessageCircleMore className="h-3 w-3 text-[#18c98e]/62 transition-colors group-hover:text-[#18c98e]" />
        <span>Live chat</span>
        <ChevronDown className={cx("h-3 w-3 text-white/28 transition-transform duration-200", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open ? (
          <FooterDropdown id="app-footer-live-chat" className="absolute bottom-[36px] right-0 z-50 w-[224px] overflow-hidden rounded-xl border border-white/[0.10] bg-[#0b0c0c]/98 shadow-[0_18px_48px_rgba(0,0,0,0.64)] backdrop-blur-xl">
            <div className="px-3 py-2.5">
              <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/34">Live chat</div>
              <p className="mt-1 text-[10px] leading-snug text-white/46">Message a Based Bid team member on Telegram.</p>
            </div>
            <div className="border-t border-white/[0.08] p-1.5">
              {LIVE_CHAT_CONTACTS.map((contact) => (
                <a key={contact.handle} href={contact.href} target="_blank" rel="noreferrer" onClick={() => setOpen(false)} className="group/contact flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.045]">
                  <Image unoptimized src={contact.avatar} alt="" width={28} height={28} className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-white/[0.12] transition-[filter,box-shadow] group-hover/contact:brightness-110 group-hover/contact:shadow-[0_0_12px_rgba(24,201,142,0.12)]" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-white/76 group-hover/contact:text-white/92">{contact.name}</span>
                      <span className={cx("text-[7.5px] font-semibold uppercase tracking-[0.12em]", contact.role === "OpenBid" ? "text-[#18c98e]/62" : contact.role === "Support" ? "text-[#69aef8]/62" : "text-white/27")}>{contact.role}</span>
                    </span>
                    <span className="block truncate text-[9px] text-white/34">{contact.handle}</span>
                  </span>
                  <ArrowUpRight className="h-3 w-3 text-white/22 transition-colors group-hover/contact:text-white/52" />
                </a>
              ))}
            </div>
          </FooterDropdown>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function SocialLinks() {
  const baseClass = "grid h-8 w-8 place-items-center text-white/38 outline-none transition-[color,transform] duration-200 hover:-translate-y-px hover:text-white/82 focus-visible:text-white focus-visible:ring-1 focus-visible:ring-white/18";
  return (
    <>
      <a href="https://t.me/basedbid" target="_blank" rel="noreferrer" className={baseClass} aria-label="Telegram"><Send className="h-[15px] w-[15px]" /></a>
      <a href="https://x.com/basedbid" target="_blank" rel="noreferrer" className={baseClass} aria-label="X"><FaXTwitter className="h-[14px] w-[14px]" /></a>
      <a href="https://github.com/basedbid" target="_blank" rel="noreferrer" className={baseClass} aria-label="GitHub"><GitHubMark className="h-[15px] w-[15px]" /></a>
    </>
  );
}

function CookieControl({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <div className="group/cookies relative">
      <div id="app-footer-cookie-help" role="tooltip" className="pointer-events-none invisible absolute bottom-[36px] left-0 z-50 w-[min(286px,calc(100vw-24px))] translate-y-1 rounded-xl border border-white/[0.10] bg-[#0c0d0d]/98 px-3.5 py-3 opacity-0 shadow-[0_18px_46px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.035)] backdrop-blur-xl transition-[opacity,transform,visibility] duration-200 group-hover/cookies:visible group-hover/cookies:translate-y-0 group-hover/cookies:opacity-100 group-focus-within/cookies:visible group-focus-within/cookies:translate-y-0 group-focus-within/cookies:opacity-100">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-white/86">
          <ShieldCheck className="h-3.5 w-3.5 text-white/42" />
          <span>Your preferences stay private</span>
        </div>
        <p className="mt-1.5 text-[10px] leading-[1.55] text-white/48">
          Cookies remember preferred networks, filters, and sorting. Anonymous usage data helps improve Based Bid. Nothing else is stored or shared.
        </p>
        <span aria-hidden="true" className="absolute -bottom-[5px] left-5 h-2.5 w-2.5 rotate-45 border-b border-r border-white/[0.10] bg-[#0c0d0d]" />
      </div>
      <button type="button" onClick={onToggle} aria-pressed={enabled} aria-describedby="app-footer-cookie-help" className="inline-flex h-7 cursor-pointer items-center gap-2 rounded-lg bg-white/[0.018] px-2 text-[10px] font-medium text-white/44 ring-1 ring-white/[0.075] transition-[background-color,color,box-shadow] hover:bg-white/[0.045] hover:text-white/72 hover:ring-white/[0.14] focus-visible:bg-white/[0.045] focus-visible:text-white/72 focus-visible:outline-none focus-visible:ring-white/[0.18]">
        <Cookie className={cx("h-3 w-3 transition-colors", enabled ? "text-[#18c98e]/68 group-hover/cookies:text-[#18c98e]" : "text-white/30 group-hover/cookies:text-white/62")} />
        <span>Cookies</span>
        <span className={cx("relative h-[16px] w-[29px] rounded-full border transition-colors duration-300", enabled ? "border-[#18c98e]/25 bg-[#18c98e]/20" : "border-white/10 bg-white/[0.035]")}>
          <span className={cx("absolute top-[2px] h-[10px] w-[10px] rounded-full transition-[left,background-color,box-shadow] duration-300", enabled ? "left-[15px] bg-[#18c98e] shadow-[0_0_8px_rgba(24,201,142,0.52)]" : "left-[2px] bg-white/38")} />
        </span>
      </button>
    </div>
  );
}

function PlatformLinks() {
  const linkClass = "group inline-flex h-6 items-center justify-center gap-1.5 rounded-md px-2.5 text-[10px] font-medium text-white/48 transition hover:bg-white/[0.055] hover:text-white/82";
  const iconClass = "h-3 w-3 text-white/34 transition-colors group-hover:text-white/70";
  return (
    <div className="inline-flex h-7 items-center rounded-lg bg-black/15 p-0.5 ring-1 ring-white/[0.09] shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
      <button type="button" onClick={openReleaseUpdates} className={linkClass}><Megaphone className={iconClass} />Updates</button>
      <span className="h-3.5 w-px bg-white/[0.08]" aria-hidden="true" />
      <a href="/calculator" className={linkClass}><Calculator className={iconClass} />Fee calculator</a>
      <span className="h-3.5 w-px bg-white/[0.08]" aria-hidden="true" />
      <a href="/deck" target="_blank" rel="noreferrer" className={linkClass}><Presentation className={iconClass} />Pitch deck</a>
    </div>
  );
}

function FooterBar({ settings, cookiesEnabled, onToggleCookies, fixed = false, compactTerminalSidebar = false }: FooterBarProps) {
  return (
    <footer
      data-app-footer="true"
      className={cx(
        "z-[260] flex h-[44px] w-full items-center border-t border-white/[0.08] bg-[#090a0a]/96 backdrop-blur-xl",
        fixed ? "fixed inset-x-0 bottom-0" : "relative",
      )}
    >
      <div className={cx("hidden h-full shrink-0 border-r border-white/[0.08] transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:block", compactTerminalSidebar ? "w-[66px]" : "w-[272px]")}>
        <div className={cx("relative flex h-full items-center", compactTerminalSidebar ? "justify-center px-0" : "px-3 pr-[6px]")}>
          {settings}
          <div className={cx("absolute left-[55%] top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-2", compactTerminalSidebar ? "hidden" : "flex")}><SocialLinks /></div>
        </div>
      </div>
      <div className="relative flex h-full min-w-0 flex-1 items-center px-3 sm:px-4">
        <div className="flex items-center gap-3">
          <CookieControl enabled={cookiesEnabled} onToggle={onToggleCookies} />
          <div className="hidden items-center gap-3 text-[9px] text-white/30 sm:flex">
            <a href="/privacy" className="transition hover:text-white/62">Privacy</a>
            <a href="/terms" className="transition hover:text-white/62">ToS</a>
          </div>
        </div>
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block"><PlatformLinks /></div>
        <div className="ml-auto flex items-center">
          <LiveChatMenu />
        </div>
      </div>
    </footer>
  );
}

function PreferenceChoice({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cx("h-6 rounded-md px-2 text-[9px] font-medium transition", active ? "bg-white/[0.09] text-white/82 ring-1 ring-white/[0.13]" : "text-white/36 hover:bg-white/[0.04] hover:text-white/66")}>
      {children}
    </button>
  );
}

function GlobalFooterSettings() {
  const [open, setOpen] = React.useState(false);
  const { animation, ambient, setAnimation, setAmbient } = useAppPreferences();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const animationLabel = animation === "on" ? "On" : animation === "reduced" ? "Reduced" : "Off";
  const ambientLabel = ambient === "on" ? "On" : "Off";

  React.useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} className="grid h-8 w-8 cursor-pointer place-items-center rounded-xl text-white/60 transition hover:bg-white/5 hover:text-white/82" aria-label="Preferences">
        <Settings className="h-3.5 w-3.5" />
      </button>
      <AnimatePresence>
        {open ? (
          <FooterDropdown className="absolute bottom-[46px] left-0 z-20 w-64 overflow-hidden rounded-2xl bg-[#0a0a0a] shadow-[0_16px_40px_rgba(0,0,0,0.55)] ring-1 ring-white/12">
            <div className="px-3 py-2 text-[11px] font-medium text-white/60">Preferences</div>
            <div className="border-t border-white/10 px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] text-white/48">Animations</span>
                <div className="flex items-center gap-1">
                  {["On", "Reduced", "Off"].map((value) => <PreferenceChoice key={value} active={animationLabel === value} onClick={() => setAnimation(value.toLowerCase() as AnimationPreference)}>{value}</PreferenceChoice>)}
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-[10px] text-white/48">Ambient effects</span>
                <div className="flex items-center gap-1">
                  {["On", "Off"].map((value) => <PreferenceChoice key={value} active={ambientLabel === value} onClick={() => setAmbient(value.toLowerCase() as AmbientPreference)}>{value}</PreferenceChoice>)}
                </div>
              </div>
            </div>
          </FooterDropdown>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default function AppFooter() {
  const pathname = usePathname();
  const [cookiesEnabled, setCookiesEnabled] = React.useState(true);
  const { expanded: sidebarExpanded } = useTerminalSidebar();

  if (!usesSharedAppShell(pathname)) return null;

  return (
    <>
      <div aria-hidden="true" className="h-[44px] shrink-0" />
      <FooterBar
        fixed
        compactTerminalSidebar={!sidebarExpanded}
        settings={<GlobalFooterSettings />}
        cookiesEnabled={cookiesEnabled}
        onToggleCookies={() => setCookiesEnabled((value) => !value)}
      />
    </>
  );
}
