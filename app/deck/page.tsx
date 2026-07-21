"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import FeeBuilderPage from "./FeeBuilderPage";
import EnergySparksCanvas from "./EnergySparksCanvas";
import {
  Blocks,
  Bot,
  Braces,
  ChevronLeft,
  ChevronRight,
  Code2,
  Coins,
  Droplets,
  ExternalLink,
  FilePenLine,
  Flame,
  Globe,
  HandCoins,
  LayoutDashboard,
  Lightbulb,
  Network,
  PanelTop,
  Rocket,
  ShieldCheck,
  Smartphone,
  SlidersHorizontal,
  TrendingUp,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";

const PAGES = [
  { id: 1, label: "Hello Web3" },
  { id: 2, label: "Problem vs Solution" },
  { id: 3, label: "Fee Builder" },
  { id: 4, label: "Launch Types" },
  { id: 5, label: "Overview" },
] as const;

type NetworkKey = "base" | "bsc" | "eth" | "sol";

const NETWORKS: Array<{ chain: NetworkKey; label: string }> = [
  { chain: "base", label: "BASE" },
  { chain: "bsc", label: "BSC" },
  { chain: "eth", label: "ETH" },
  { chain: "sol", label: "SOL" },
];

const NETWORK_ICON_PATHS: Record<NetworkKey, string> = {
  base: "/deck/network-icons/base.svg",
  bsc: "/deck/network-icons/bnb-chain.svg",
  eth: "/deck/network-icons/ethereum.svg",
  sol: "/deck/network-icons/solana.svg",
};

const FEATURES: Array<{ title: string; text: string; icon: LucideIcon }> = [
  {
    title: "Launch Instantly",
    text: "Launch a pool or token without upfront liquidity. Live from block zero.",
    icon: Rocket,
  },
  {
    title: "Configure Your Fee Builder",
    text: "Capture trading fees and route revenue to rewards, buybacks, treasury, liquidity or unlimited custom wallets.",
    icon: FilePenLine,
  },
  {
    title: "Power Your Own Launchpad",
    text: "Use the SDK/API to bring token launches, configurable fees and revenue routing into your own platform, protocol or AI agent.",
    icon: Code2,
  },
];

const STATS: Array<{ title: string; text: string; icon: LucideIcon }> = [
  { title: "Multichain", text: "EVM + SOL ready", icon: Globe },
  { title: "Whitelabel", text: "Launchpad infra", icon: PanelTop },
  { title: "Open stack", text: "SDK / API / ABI", icon: Code2 },
  { title: "Customizable", text: "At all times", icon: FilePenLine },
];

function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function NetworkMark({
  chain,
  label,
  compact = false,
}: {
  chain: NetworkKey;
  label: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex flex-col items-center", compact ? "gap-0" : "gap-1")} title={label}>
      <span
        className={cn(
          "grid place-items-center",
          compact ? "h-3.5 w-3.5 sm:h-4 sm:w-4" : "h-8 w-8"
        )}
      >
        <img
          src={NETWORK_ICON_PATHS[chain]}
          alt=""
          className={cn("object-contain", compact ? "h-[11px] w-[11px] sm:h-3 sm:w-3" : "h-7 w-7")}
        />
      </span>

      {!compact && (
        <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-white/46">
          {label}
        </span>
      )}
    </div>
  );
}

function DeckShell({
  page,
  setPage,
  children,
}: {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  children: React.ReactNode;
}) {
  const currentDeckIndex = Math.max(0, Math.min(page - 1, PAGES.length - 1));

  const goPrev = () => setPage((prev) => (prev === 1 ? PAGES.length : prev - 1));
  const goNext = () => setPage((prev) => (prev === PAGES.length ? 1 : prev + 1));

  const isOverviewPage = page === 5;

  return (
    <div
      className={cn(
        "min-h-screen w-full text-white",
        isOverviewPage ? "bg-[#090b0b]" : "bg-[#050505]"
      )}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={cn(
            "absolute inset-0",
            isOverviewPage
              ? "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.045),transparent_26%),linear-gradient(180deg,#090b0b_0%,#101414_48%,#090b0b_100%)]"
              : "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.035),transparent_24%),linear-gradient(180deg,#050505_0%,#070808_45%,#050505_100%)]"
          )}
        />
        <div
          className={cn(
            "absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.016)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.016)_1px,transparent_1px)] bg-[size:48px_48px]",
            isOverviewPage ? "opacity-[0.09]" : "opacity-[0.12]"
          )}
        />
        <div
          className={cn(
            "absolute left-1/2 top-0 h-56 w-[34rem] -translate-x-1/2 rounded-full blur-[140px]",
            isOverviewPage ? "bg-white/[0.035]" : "bg-white/5"
          )}
        />
        <div
          className={cn(
            "absolute left-[12%] top-[16%] h-52 w-52 rounded-full blur-[130px]",
            isOverviewPage ? "bg-[#52dfb2]/[0.025]" : "bg-[#52dfb2]/5"
          )}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1560px] flex-col px-2 pb-24 pt-3 sm:pb-28 sm:pt-4 md:px-3 md:pb-32 md:pt-4">
        <div className="flex-1">{children}</div>
        <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
          <div className="mx-auto flex w-screen max-w-none items-center justify-between gap-2 border-t border-white/10 bg-[#101111]/98 px-2 pb-[calc(0.45rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-16px_44px_rgba(0,0,0,0.42)] backdrop-blur-xl sm:w-full sm:max-w-[1560px] sm:items-end sm:justify-between sm:gap-4 sm:border-0 sm:bg-transparent sm:px-4 sm:pb-4 sm:pt-0 sm:shadow-none sm:backdrop-blur-none">
            <div className="hidden min-w-0 items-center gap-2.5 px-1 py-1.5 sm:flex sm:px-2">
              <Image
                src="/deck/logo-navbar.png"
                alt="based.bid logo"
                width={62}
                height={48}
                priority
                className="h-8 w-auto max-w-none object-contain drop-shadow-[0_6px_18px_rgba(0,0,0,0.28)] sm:h-9"
              />
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-white/52 [text-shadow:0_0_18px_rgba(255,255,255,0.10)]">
                  Based deck
                </p>
                <span className="mt-1 block h-px w-16 bg-[linear-gradient(90deg,rgba(255,255,255,0.12),rgba(82,223,178,0.34),transparent)]" />
              </div>
            </div>

            <nav className="pointer-events-auto flex min-w-0 flex-1 items-center justify-center gap-1 rounded-full border border-white/8 bg-black/18 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] sm:flex-none sm:gap-2 sm:bg-[#101111]/74 sm:shadow-[0_10px_34px_rgba(0,0,0,0.28)] sm:backdrop-blur-md">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous page"
                className="grid aspect-square h-8 w-8 shrink-0 place-items-center rounded-full p-0 text-white/46 transition hover:bg-white/[0.05] hover:text-white/78"
              >
                <ChevronLeft size={15} strokeWidth={2} />
              </button>

              <div className="flex min-w-0 items-center gap-0.5 sm:gap-1.5">
                {PAGES.map((item, index) => {
                  const isActive = currentDeckIndex === index;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPage(item.id)}
                      className={cn(
                         "grid aspect-square h-8 w-8 min-w-8 shrink-0 place-items-center rounded-full p-0 text-[10px] font-medium transition sm:w-auto sm:min-w-[2.1rem] sm:px-2 sm:text-[11px]",
                        isActive
                          ? "border border-[rgba(212,175,55,0.34)] bg-[rgba(212,175,55,0.12)] text-[rgba(212,175,55,0.96)]"
                          : "text-white/44 hover:text-white/78"
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => setPage(PAGES[currentDeckIndex].id)}
                aria-label={`Current page ${String(currentDeckIndex + 1).padStart(2, "0")}`}
                className="hidden aspect-square h-8 w-8 min-w-8 place-items-center rounded-full border border-[rgba(212,175,55,0.34)] bg-[rgba(212,175,55,0.12)] p-0 text-[10px] font-medium text-[rgba(212,175,55,0.96)] sm:w-auto sm:min-w-[2.25rem] sm:px-2"
              >
                {String(currentDeckIndex + 1).padStart(2, "0")}
              </button>

              <button
                type="button"
                onClick={goNext}
                aria-label="Next page"
                className="grid aspect-square h-8 w-8 shrink-0 place-items-center rounded-full p-0 bg-[rgba(212,175,55,0.08)] text-[#FFE082]/70 transition hover:bg-[rgba(212,175,55,0.13)] hover:text-[#FFE082]"
              >
                <ChevronRight size={15} strokeWidth={2} />
              </button>

              <div className="hidden border-l border-white/8 pl-3 xl:block">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/32">
                  Deck navigation
                </p>
                <p className="mt-0.5 min-w-[8.5rem] text-xs text-white/58">
                  {PAGES[currentDeckIndex].label}
                </p>
              </div>
            </nav>

            <div className="pointer-events-auto">
              <StartButton compact />
            </div>
          </div>
        </footer>
        <StartButtonStyles />
      </div>
    </div>
  );
}

function StartButton({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/create"
      className={cn(
        "group inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/22 bg-[rgba(212,175,55,0.085)] px-2.5 py-1.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.045),0_8px_24px_rgba(0,0,0,0.22)] transition duration-200 hover:border-[#D4AF37]/30 hover:bg-[rgba(212,175,55,0.115)] sm:gap-2.5 sm:border-white/10 sm:bg-white/[0.035] sm:px-3.5 sm:py-2 sm:hover:bg-white/[0.055]",
        compact && "px-3 py-2"
      )}
    >
      <span className="grid h-6 w-6 place-items-center rounded-full border border-[#D4AF37]/18 bg-[rgba(212,175,55,0.08)] text-[#FFE082]/82 transition group-hover:border-[#D4AF37]/32 sm:h-7 sm:w-7">
        <Rocket className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
      </span>
      <span>
        <span className="block text-[0.72rem] font-semibold tracking-[-0.01em] text-white/88 sm:text-[0.78rem]">
          Start
        </span>
        {!compact && (
          <span className="hidden text-[0.6rem] uppercase tracking-[0.14em] text-white/36 sm:block">
            Launch
          </span>
        )}
      </span>
    </Link>
  );
}

function StartButtonStyles() {
  return null;
}

function FeatureCard({
  title,
  text,
  icon: Icon,
}: {
  title: string;
  text: string;
  icon: LucideIcon;
}) {
  return (
    <div>
      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#18C98E]/20 bg-[#18C98E]/6 text-[#52DFB2] shadow-[0_0_22px_rgba(24,201,142,0.10)] sm:h-9 sm:w-9">
        <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
      </div>
      <div className="mt-2 text-[0.72rem] font-medium text-white/88 sm:mt-3 sm:text-[0.88rem]">{title}</div>
      <p className="mt-1 max-w-[13rem] text-[0.62rem] leading-4 text-white/52 sm:mt-1.5 sm:text-[0.76rem] sm:leading-5">
        {text}
      </p>
    </div>
  );
}

function RebuiltIntegrationCard({
  title,
  text,
  icon: Icon,
  className,
  cycleDelay,
  mobileBranchColor = "rgba(82, 223, 178, 0.96)",
  mobileBranchDelay = "0s",
}: {
  title: string;
  text: string;
  icon: LucideIcon;
  className: string;
  cycleDelay: number;
  mobileBranchColor?: string;
  mobileBranchDelay?: string;
}) {
  return (
    <div
      className={cn(
        "rebuilt-integration-card outline-cycle-card absolute z-10 w-[172px] rounded-[22px] border border-[#18C98E]/16 bg-[linear-gradient(180deg,rgba(7,16,12,0.98)_0%,rgba(5,11,9,0.99)_100%)] px-4 py-3.5 shadow-[0_14px_34px_rgba(0,0,0,0.24)]",
        className
      )}
      style={
        {
          "--outline-delay": `${cycleDelay}s`,
          "--mobile-branch-color": mobileBranchColor,
          "--mobile-branch-delay": mobileBranchDelay,
        } as React.CSSProperties
      }
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#18C98E]/22 bg-[#18C98E]/8 text-[#52DFB2] shadow-[0_0_20px_rgba(24,201,142,0.10)]">
          <Icon className="h-[18px] w-[18px]" />
        </div>
        <div className="min-w-0">
          <div className="text-[0.84rem] font-medium text-white/92">{title}</div>
          <div className="mt-1 max-w-[8.25rem] text-[0.68rem] leading-[1.05rem] text-white/56">{text}</div>
        </div>
      </div>
    </div>
  );
}

function RebuiltIntegrationMap() {
  const cards = [
    {
      title: "Web Apps",
      text: "Integrate natively",
      icon: Globe,
      className: "left-[1%] top-[8%]",
      cycleDelay: 4.8,
      mobileBranchColor: "rgba(82, 223, 178, 0.96)",
      mobileBranchDelay: "0.12s",
    },
    {
      title: "Platforms",
      text: "Add to existing",
      icon: PanelTop,
      className: "left-[1%] top-1/2 -translate-y-1/2",
      cycleDelay: 9.6,
      mobileBranchColor: "rgba(103, 232, 249, 0.96)",
      mobileBranchDelay: "0.28s",
    },
    {
      title: "Custom Products",
      text: "Bring your idea to life",
      icon: Lightbulb,
      className: "left-[1%] top-[76%]",
      cycleDelay: 14.4,
      mobileBranchColor: "rgba(82, 223, 178, 0.96)",
      mobileBranchDelay: "0.44s",
    },
    {
      title: "AI Agents",
      text: "Automate execution",
      icon: Bot,
      className: "right-[1%] top-[8%]",
      cycleDelay: 28.8,
      mobileBranchColor: "rgba(103, 232, 249, 0.96)",
      mobileBranchDelay: "0.6s",
    },
    {
      title: "Mobile Apps",
      text: "Add launch infra",
      icon: Smartphone,
      className: "right-[1%] top-1/2 -translate-y-1/2",
      cycleDelay: 24,
      mobileBranchColor: "rgba(82, 223, 178, 0.96)",
      mobileBranchDelay: "0.76s",
    },
    {
      title: "DEX Flows",
      text: "Extend trading features",
      icon: ExternalLink,
      className: "right-[1%] top-[76%]",
      cycleDelay: 19.2,
      mobileBranchColor: "rgba(103, 232, 249, 0.96)",
      mobileBranchDelay: "0.92s",
    },
  ];

  const branches = [
    { d: "M500 188 C500 158 500 126 500 84", stroke: "url(#rebuiltGoldFlow)", delay: "0.12s" },
    { d: "M390 250 C340 210 286 164 180 118", stroke: "url(#rebuiltGreenFlow)", delay: "0s" },
    { d: "M390 310 C334 310 272 310 180 310", stroke: "url(#rebuiltCyanFlow)", delay: "0.36s" },
    { d: "M390 370 C340 410 286 456 180 502", stroke: "url(#rebuiltGreenFlow)", delay: "0.5s" },
    { d: "M610 250 C660 210 714 164 820 118", stroke: "url(#rebuiltCyanFlow)", delay: "0.18s" },
    { d: "M610 310 C666 310 728 310 820 310", stroke: "url(#rebuiltGreenFlow)", delay: "0.68s" },
    { d: "M610 370 C660 410 714 456 820 502", stroke: "url(#rebuiltCyanFlow)", delay: "0.86s" },
  ];

  return (
    <div className="relative overflow-hidden rounded-[38px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,18,18,0.94)_0%,rgba(6,8,8,0.98)_100%)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.34)] md:p-7">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(24,201,142,0.09),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.045),transparent_22%),radial-gradient(circle_at_18%_82%,rgba(82,223,178,0.045),transparent_24%)]" />
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:34px_34px] [mask-image:linear-gradient(to_top,black,transparent_80%)] opacity-18" />

      <div className="rebuilt-map-canvas relative min-h-[520px] xl:min-h-[540px]">
        <svg
          className="rebuilt-map-branches pointer-events-none absolute inset-0 z-0 h-full w-full"
          viewBox="0 0 1000 620"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="rebuiltGoldFlow"
              gradientUnits="userSpaceOnUse"
              x1="500"
              y1="84"
              x2="500"
              y2="188"
            >
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.32" />
              <stop offset="55%" stopColor="#F3C969" stopOpacity="0.96" />
              <stop offset="100%" stopColor="#FFE082" />
            </linearGradient>
            <linearGradient
              id="rebuiltGreenFlow"
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="0"
              x2="1000"
              y2="0"
            >
              <stop offset="0%" stopColor="#18C98E" stopOpacity="0.24" />
              <stop offset="55%" stopColor="#52DFB2" stopOpacity="0.96" />
              <stop offset="100%" stopColor="#6EE7B7" />
            </linearGradient>
            <linearGradient
              id="rebuiltCyanFlow"
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="0"
              x2="1000"
              y2="0"
            >
              <stop offset="0%" stopColor="#67E8F9" />
              <stop offset="45%" stopColor="#2DD4BF" stopOpacity="0.96" />
              <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.24" />
            </linearGradient>
            <filter
              id="rebuiltGlow"
              filterUnits="userSpaceOnUse"
              x="-40"
              y="-40"
              width="1080"
              height="700"
            >
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {branches.map((branch) => (
            <path
              key={branch.d}
              d={branch.d}
              stroke={branch.stroke}
              strokeWidth="4"
              strokeLinecap="round"
              filter="url(#rebuiltGlow)"
              className="flow-line"
              style={{ animationDelay: branch.delay }}
            />
          ))}
        </svg>

        <div
          className="rebuilt-board-card outline-cycle-card outline-cycle-card-gold absolute left-1/2 top-[-3%] z-10 w-[252px] -translate-x-1/2 rounded-[1.7rem] border border-[rgba(212,175,55,0.16)] bg-[linear-gradient(135deg,rgba(212,175,55,0.09),rgba(255,255,255,0.03))] p-4 shadow-[0_0_38px_rgba(255,214,102,0.08)]"
          style={{ "--outline-delay": "0s" } as React.CSSProperties}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[rgba(255,228,138,0.24)] bg-[rgba(255,228,138,0.08)] text-[#FFE082]">
              <LayoutDashboard className="h-[18px] w-[18px]" />
            </div>
            <div className="min-w-0 flex-1">
                    <div className="text-[0.94rem] font-medium text-white/94">
                Boards
              </div>
              <div className="mt-1 text-[0.76rem] leading-5 text-white/58">
                Create whitelabel platforms via UI in a few clicks
              </div>
            </div>
          </div>
        </div>

        <div className="rebuilt-stack-card absolute left-1/2 top-1/2 z-10 w-[238px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-[#18C98E]/22 bg-[linear-gradient(180deg,rgba(7,19,14,0.98)_0%,rgba(5,11,9,0.99)_100%)] p-5 shadow-[0_0_44px_rgba(24,201,142,0.11)]">
          <div className="pointer-events-none absolute inset-0 rounded-[30px] bg-[radial-gradient(circle_at_50%_0%,rgba(82,223,178,0.20),transparent_44%)] opacity-24" />
        <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] border border-[#18C98E]/20 bg-[#18C98E]/7 text-[#52DFB2]">
              <Blocks className="h-[18px] w-[18px]" />
            </div>
            <div>
              <div className="text-[0.94rem] font-semibold text-white/95">
                OPENBID
              </div>
              <div className="text-[0.58rem] uppercase tracking-[0.16em] text-white/38">
                Composable infrastructure
              </div>
            </div>
          </div>

          <div className="relative mt-4 text-[1rem] font-semibold text-white/95">
            SDK / API / ABI
          </div>

          <p className="relative mt-2.5 text-[0.76rem] leading-5 text-white/58">
            Launch via Boards or integrate the stack anywhere.
          </p>
          <div className="relative mt-4 flex flex-wrap gap-2">
            {[
              { label: "SDK", icon: Code2 },
              { label: "API", icon: Blocks },
              { label: "ABI", icon: Braces },
              { label: "Skill", icon: Bot },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-[0.7rem] font-medium text-white/72"
                >
                  <Icon className="h-3.5 w-3.5 text-[#52DFB2]" />
                  {item.label}
                </div>
              );
            })}
          </div>
        </div>

        {cards.map((card) => (
          <RebuiltIntegrationCard key={card.title} {...card} />
        ))}
      </div>
    </div>
  );
}

function BranchStyles() {
  return (
    <style>{`
      .flow-line {
        stroke-dasharray: 10 14;
        animation: flowMove 2s linear infinite;
        will-change: stroke-dashoffset;
      }

      .outline-cycle-card {
        --outline-delay: 0s;
        --outline-color: rgba(82, 223, 178, 0.98);
        --outline-soft: rgba(20, 184, 166, 0.42);
        --outline-angle: 0deg;
        --trace-start: 282deg;
        --trace-soft: 304deg;
        --trace-core: 326deg;
        --trace-end: 342deg;
        overflow: hidden;
        isolation: isolate;
      }

      .outline-cycle-card-gold {
        --outline-color: rgba(255, 224, 130, 0.96);
        --outline-soft: rgba(212, 175, 55, 0.42);
      }

      .outline-cycle-card::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        z-index: 1;
        border-radius: inherit;
        padding: 2px;
        background:
          conic-gradient(
            from var(--outline-angle),
            transparent 0deg,
            transparent var(--trace-start),
            var(--outline-soft) var(--trace-soft),
            var(--outline-color) var(--trace-core),
            rgba(110, 231, 183, 0.9) var(--trace-end),
            transparent 360deg
          );
        opacity: 0;
        visibility: hidden;
        filter: drop-shadow(0 0 6px var(--outline-soft));
        will-change: opacity, --outline-angle;
        mask:
          linear-gradient(#000 0 0) content-box,
          linear-gradient(#000 0 0);
        mask-composite: exclude;
        -webkit-mask:
          linear-gradient(#000 0 0) content-box,
          linear-gradient(#000 0 0);
        -webkit-mask-composite: xor;
        animation: outlineCardSequence 33.6s linear infinite;
        animation-delay: var(--outline-delay);
      }

      .outline-cycle-card > * {
        position: relative;
        z-index: 2;
      }

      @keyframes flowMove {
        from {
          stroke-dashoffset: 72;
        }
        to {
          stroke-dashoffset: 0;
        }
      }

      @property --outline-angle {
        syntax: "<angle>";
        inherits: false;
        initial-value: 0deg;
      }

      @property --trace-start {
        syntax: "<angle>";
        inherits: false;
        initial-value: 282deg;
      }

      @property --trace-soft {
        syntax: "<angle>";
        inherits: false;
        initial-value: 304deg;
      }

      @property --trace-core {
        syntax: "<angle>";
        inherits: false;
        initial-value: 326deg;
      }

      @property --trace-end {
        syntax: "<angle>";
        inherits: false;
        initial-value: 342deg;
      }

      @keyframes outlineCardSequence {
        0% {
          opacity: 0;
          visibility: visible;
          --outline-angle: 0deg;
          --trace-start: 282deg;
          --trace-soft: 304deg;
          --trace-core: 326deg;
          --trace-end: 342deg;
        }
        0.45% {
          opacity: 1;
        }
        11.55% {
          opacity: 1;
          --outline-angle: 360deg;
          --trace-start: 282deg;
          --trace-soft: 304deg;
          --trace-core: 326deg;
          --trace-end: 342deg;
        }
        12.6% {
          opacity: 1;
          --outline-angle: 360deg;
          --trace-start: 328deg;
          --trace-soft: 340deg;
          --trace-core: 350deg;
          --trace-end: 356deg;
        }
        13.65% {
          opacity: 1;
          --outline-angle: 360deg;
          --trace-start: 360deg;
          --trace-soft: 360deg;
          --trace-core: 360deg;
          --trace-end: 360deg;
        }
        14.05% {
          opacity: 0;
          --outline-angle: 360deg;
          --trace-start: 360deg;
          --trace-soft: 360deg;
          --trace-core: 360deg;
          --trace-end: 360deg;
        }
        14.06%,
        100% {
          opacity: 0;
          visibility: hidden;
          --outline-angle: 360deg;
          --trace-start: 360deg;
          --trace-soft: 360deg;
          --trace-core: 360deg;
          --trace-end: 360deg;
        }
      }

      @media (max-width: 767px) {
        .rebuilt-map-canvas {
          display: grid;
          min-height: 0;
          gap: 0.82rem;
        }

        .rebuilt-map-branches {
          display: none;
        }

        .rebuilt-board-card,
        .rebuilt-stack-card,
        .rebuilt-integration-card {
          position: relative;
          left: auto;
          right: auto;
          top: auto;
          width: 100%;
          transform: none !important;
        }

        .rebuilt-board-card {
          order: 1;
          padding: 0.82rem;
          border-radius: 1.25rem;
          --mobile-branch-color: rgba(255, 224, 130, 0.96);
          --mobile-branch-delay: 0s;
        }

        .rebuilt-stack-card {
          order: 0;
          padding: 0.95rem;
          border-radius: 1.35rem;
        }

        .rebuilt-integration-card {
          order: 2;
          padding: 0.72rem 0.82rem;
          border-radius: 1.15rem;
        }

        .rebuilt-board-card,
        .rebuilt-integration-card {
          overflow: visible;
        }

        .rebuilt-board-card::after,
        .rebuilt-integration-card::after {
          content: "";
          pointer-events: none;
          position: absolute;
          left: 50%;
          top: -0.82rem;
          z-index: 0;
          width: 2px;
          height: 0.82rem;
          transform: translateX(-50%);
          border-radius: 999px;
          background: linear-gradient(
            180deg,
            transparent,
            var(--mobile-branch-color, rgba(82, 223, 178, 0.96)) 52%,
            transparent
          );
          box-shadow: 0 0 14px var(--mobile-branch-color, rgba(82, 223, 178, 0.7));
          opacity: 0.72;
          animation: mobileBranchHop 2.4s ease-in-out infinite;
          animation-delay: var(--mobile-branch-delay, 0s);
        }

        .rebuilt-integration-card .flex.h-10,
        .rebuilt-board-card .flex.h-10 {
          height: 2.15rem;
          width: 2.15rem;
          border-radius: 0.9rem;
        }
      }

      @keyframes mobileBranchHop {
        0%, 100% {
          opacity: 0.18;
          transform: translateX(-50%) scaleY(0.38);
          filter: blur(0.2px);
        }
        45% {
          opacity: 0.92;
          transform: translateX(-50%) scaleY(1);
          filter: blur(0);
        }
        70% {
          opacity: 0.46;
          transform: translateX(-50%) scaleY(0.72);
        }
      }

    `}</style>
  );
}

function PageOne() {
  return (
    <div className="grid gap-4 sm:gap-6">
      <section className="overflow-hidden rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,20,20,0.9)_0%,rgba(7,8,8,0.96)_100%)] shadow-[0_18px_60px_rgba(0,0,0,0.24)] sm:rounded-[24px]">
        <div className="grid grid-cols-2 xl:grid-cols-4">
          {STATS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={cn(
                  "flex min-h-[3.55rem] items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4 sm:py-2.5 xl:min-h-[4rem]",
                  index !== STATS.length - 1 && "xl:border-r xl:border-white/8",
                  index > 1 && "border-t border-white/8 md:border-t-0"
                )}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-[#18C98E]/18 bg-[#18C98E]/7 text-[#52DFB2] shadow-[0_0_18px_rgba(24,201,142,0.12)] sm:h-9 sm:w-9 sm:rounded-[0.9rem]">
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[0.76rem] font-semibold leading-none tracking-[-0.035em] text-[#52DFB2] sm:text-[0.9rem]">
                    {item.title}
                  </span>
                  {index === 0 ? (
                    <div className="mt-0.5 flex items-center gap-1.5 sm:gap-1.5">
                      {NETWORKS.map((network) => (
                        <NetworkMark key={network.chain} {...network} compact />
                      ))}
                    </div>
                  ) : (
                    <div className="mt-0.5 text-[0.62rem] leading-3.5 text-white/56 sm:text-[0.74rem] sm:leading-4">
                      {item.text}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.91fr_1.09fr] xl:items-stretch">
        <div className="relative flex min-h-[430px] overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.015)_100%)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:min-h-[480px] sm:rounded-[38px] sm:p-6 md:p-7 xl:min-h-[540px]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(82,223,178,0.10),transparent_24%),radial-gradient(circle_at_70%_70%,rgba(24,201,142,0.05),transparent_30%)]" />

          <div className="relative flex h-full w-full flex-col justify-center">
            <div className="mb-6 flex w-fit items-center gap-3.5">
              <span className="relative grid h-12 w-12 place-items-center sm:h-14 sm:w-14">
                <span className="absolute inset-1 rounded-full bg-[#9AE66E]/12 blur-md" />
                <span className="absolute inset-0 rounded-full border border-[#9AE66E]/12 bg-[#07110d]/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_24px_rgba(154,230,110,0.1)]" />
                <Image
                  src="/deck/logo-navbar.png"
                  alt="based.bid"
                  width={56}
                  height={44}
                  className="relative h-9 w-auto object-contain drop-shadow-[0_0_16px_rgba(154,230,110,0.28)] sm:h-10"
                />
              </span>
              <div className="min-w-0">
                <div className="text-[0.78rem] font-semibold uppercase tracking-[0.2em] text-white/62 sm:text-[0.86rem]">
                  based bid is
                </div>
                <div className="mt-2 h-px w-28 bg-[linear-gradient(90deg,rgba(154,230,110,0.7),rgba(82,223,178,0.32),transparent)] shadow-[0_0_12px_rgba(82,223,178,0.22)] sm:w-36" />
              </div>
            </div>
            <div className="mb-3 text-[0.66rem] font-medium uppercase tracking-[0.3em] text-white/34 md:text-[0.72rem]">
              INTRODUCING
            </div>

            <h1 className="mt-0 text-[1.95rem] font-semibold leading-[0.94] tracking-[-0.05em] text-white sm:text-[2.35rem] md:text-[3.05rem] xl:text-[3.55rem]">
              <span className="block">Programmable</span>
              <span className="block bg-[linear-gradient(180deg,#52DFB2_0%,#18C98E_100%)] bg-clip-text text-transparent">
                Economies
              </span>
            </h1>

            <p className="mt-4 max-w-[27rem] text-[0.86rem] leading-5 text-white/58 sm:text-[0.9rem] sm:leading-6 md:text-[0.96rem] md:leading-6">
              Launch tokens, pools and branded Boards or integrate programmable launch
              and fee infrastructure directly into your own app or protocol.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-2.5 md:mt-7 md:gap-0">
              {FEATURES.map((item, index) => (
                <div
                  key={item.title}
                  className={cn(
                    "pr-5",
                    index !== FEATURES.length - 1 &&
                      "md:border-r md:border-white/8 md:pr-6",
                    index !== 0 && "md:pl-6"
                  )}
                >
                  <FeatureCard
                    title={item.title}
                    text={item.text}
                    icon={item.icon}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <RebuiltIntegrationMap />
      </section>

      <BranchStyles />
    </div>
  );
}

const PROBLEM_POINTS = [
  {
    title: "Platform-First Fees",
    text: "Most fee revenue flows to the platform.",
  },
  {
    title: "Creator Sell Pressure",
    text: "Token sells fund the project.",
  },
  {
    title: "One-off Funding",
    text: "Growth depends on one launch.",
  },
  {
    title: "Rigid Economics",
    text: "Fees and allocations cannot evolve after launch.",
  },
] as const;

const EXTRACTION_SOURCES = [
  { label: "Traders", detail: "Every swap", value: "Extracted", top: "22%", rotate: "12deg", delay: "-2.5s" },
  { label: "Creators", detail: "Growth", value: "Restricted", top: "50%", rotate: "0deg", delay: "-1.75s" },
  { label: "Community", detail: "Network value", value: "One-sided", top: "78%", rotate: "-12deg", delay: "-0.95s" },
] as const;

const SOLUTION_STEPS: Array<{
  title: string;
  text: string;
  icon: LucideIcon;
  visual: React.ReactNode;
}> = [
  {
    title: "Launch Instantly",
    text: "Launch pools or tokens without upfront liquidity across multiple chains.",
    icon: Rocket,
    visual: (
      <div className="flex items-center gap-2">
        {NETWORKS.map((network) => (
          <NetworkMark key={network.chain} {...network} compact />
        ))}
      </div>
    ),
  },
  {
    title: "Fee Builder",
    text: "Configure trading fees and route revenue anywhere.",
    icon: SlidersHorizontal,
    visual: (
      <div className="grid min-w-[14rem] gap-1.5">
        {[
          ["Buybacks", "40%"],
          ["Rewards", "30%"],
          ["Treasury", "20%"],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between rounded-full border border-[#18C98E]/14 bg-[#18C98E]/7 px-3 py-1.5">
            <span className="text-[0.66rem] text-white/55">{label}</span>
            <span className="text-[0.66rem] font-semibold text-[#6EE7B7]">{value}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Power Your Own Launchpad",
    text: "Embed launches, fee logic and routing into your app or protocol.",
    icon: Code2,
    visual: (
      <div className="flex gap-2">
        {[
          { label: "Apps", icon: Smartphone },
          { label: "Boards", icon: LayoutDashboard },
          { label: "Agents", icon: Bot },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="grid h-14 w-16 place-items-center rounded-2xl border border-[#0B3B2B] bg-[#18C98E]/[0.035] text-center">
              <Icon className="h-4 w-4 text-[#6EE7B7]" />
              <span className="text-[0.58rem] text-white/42">{item.label}</span>
            </div>
          );
        })}
      </div>
    ),
  },
  {
    title: "Boards",
    text: "Deploy a branded launchpad and earn from every launch.",
    icon: Users,
    visual: (
      <div className="flex items-center gap-2">
        {["Board A", "Board B", "Your Board"].map((label, index) => (
          <div key={label} className="rounded-2xl border border-[rgba(212,175,55,0.16)] bg-[rgba(212,175,55,0.06)] px-3 py-2">
            <p className="text-[0.62rem] font-medium text-white/72">{label}</p>
            <p className="mt-0.5 text-[0.58rem] text-[#6EE7B7]">{index === 2 ? "Join" : "Earns"}</p>
          </div>
        ))}
      </div>
    ),
  },
];

const WATERFALL_RECIPIENTS: Array<{
  label: string;
  text: string;
  icon: LucideIcon;
  fill: string;
  delay: string;
}> = [
  { label: "Traders", text: "Rewards and transparency", icon: Users, fill: "68%", delay: "0s" },
  { label: "Creators", text: "Every action supported", icon: Blocks, fill: "76%", delay: "0.28s" },
  { label: "Communities", text: "Value flows back", icon: HandCoins, fill: "58%", delay: "0.56s" },
];

const ALIGNMENT_STATS: Array<{ title: string; text: string; icon: LucideIcon }> = [
  { title: "Aligned Incentives", text: "Projects, communities and contributors share in revenue", icon: ShieldCheck },
  { title: "Sustainable Growth", text: "Trading volume can fund the economy over time", icon: TrendingUp },
  { title: "Full Flexibility", text: "Reconfigure fee routes and wallets after launch", icon: SlidersHorizontal },
  { title: "Open Infrastructure", text: "Build programmable launch flows into your own product", icon: Network },
];

function PageTwo() {
  return (
    <div className="grid gap-4 sm:gap-6">
      <div className="relative hidden gap-4 xl:grid xl:grid-cols-2">
        <div className="relative px-1 py-2 text-center sm:py-4 xl:text-left">
          <div className="pointer-events-none absolute inset-x-0 top-[-2.65rem] h-48 bg-[radial-gradient(ellipse_at_28%_58%,rgba(248,113,113,0.34),rgba(127,29,29,0.16)_34%,rgba(127,29,29,0.055)_56%,transparent_74%)] blur-[30px]" />
          <h1 className="relative bg-[linear-gradient(180deg,#FCA5A5_0%,#EF4444_100%)] bg-clip-text text-[1.7rem] font-semibold leading-[1.02] tracking-[-0.05em] text-transparent drop-shadow-[0_0_22px_rgba(248,113,113,0.18)] sm:text-[2rem] md:text-[2.62rem]">
            The old model extracts
          </h1>
          <p className="relative mx-auto mt-2 max-w-[48rem] text-xs leading-5 text-white/50 sm:mt-3 sm:text-sm sm:leading-6 md:text-[0.98rem] xl:mx-0">
            Most launch platforms take the financial upside.
          </p>
        </div>

        <div className="relative px-1 py-2 text-center sm:py-4 xl:text-right">
          <div className="pointer-events-none absolute inset-x-0 top-[-2.65rem] h-48 bg-[radial-gradient(ellipse_at_72%_58%,rgba(82,223,178,0.34),rgba(6,95,70,0.16)_34%,rgba(6,95,70,0.055)_56%,transparent_74%)] blur-[30px]" />
          <h1 className="relative bg-[linear-gradient(180deg,#6EE7B7_0%,#18C98E_100%)] bg-clip-text text-[1.7rem] font-semibold leading-[1.02] tracking-[-0.05em] text-transparent sm:text-[2rem] md:text-[2.62rem]">
            The new model aligns
          </h1>
          <p className="relative mx-auto mt-2 max-w-[48rem] text-xs leading-5 text-white/50 sm:mt-3 sm:text-sm sm:leading-6 md:text-[0.98rem] xl:ml-auto">
            Take control of launch revenue. Communities and contributors share in the upside.
          </p>
        </div>
      </div>

      <div className="grid items-stretch gap-4 xl:grid-cols-2">
        <div className="relative px-1 pb-1 text-center xl:hidden">
          <div className="pointer-events-none absolute inset-x-0 top-[-2.2rem] h-36 bg-[radial-gradient(ellipse_at_42%_58%,rgba(248,113,113,0.3),rgba(127,29,29,0.13)_38%,transparent_74%)] blur-[26px]" />
          <h1 className="relative bg-[linear-gradient(180deg,#FCA5A5_0%,#EF4444_100%)] bg-clip-text text-[1.7rem] font-semibold leading-[1.02] tracking-[-0.05em] text-transparent drop-shadow-[0_0_22px_rgba(248,113,113,0.18)]">
            The old model extracts
          </h1>
          <p className="relative mx-auto mt-2 max-w-[22rem] text-xs leading-5 text-white/50">
            Most launch platforms take the financial upside.
          </p>
        </div>

        <div className="relative flex h-full flex-col overflow-hidden rounded-[24px] border border-[#3A1717] bg-[linear-gradient(180deg,rgba(22,12,12,0.92),rgba(7,7,7,0.96))] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.28)] sm:rounded-[30px] sm:p-5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_38%,rgba(248,113,113,0.12),transparent_32%)]" />
          <div className="relative text-center">
            <p className="mb-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-red-100/38">
              Current Launchpads
            </p>
            <h2 className="text-[1.24rem] font-semibold leading-tight text-red-200/90 drop-shadow-[0_0_18px_rgba(248,113,113,0.14)]">
              The extractive flow problem
            </h2>
            <p className="mt-1 text-[0.9rem] leading-5 text-white/45">
              Value enters, platforms extract.
            </p>
          </div>

          <div className="relative mt-4 grid flex-1 content-start gap-3 sm:mt-6 sm:gap-4">
            <div className="fee-extraction-visual relative min-h-[390px] overflow-visible">
              {EXTRACTION_SOURCES.map((source) => (
                <div key={source.label}>
                  <div
                    className="absolute left-4 z-10 w-[8.7rem] rounded-[18px] border border-[#3A1717] bg-[#0E0909]/88 px-3 py-2 shadow-[0_12px_30px_rgba(0,0,0,0.24)]"
                    style={{ top: source.top, transform: "translateY(-50%)" }}
                  >
                    <p className="text-[0.78rem] font-semibold text-white/82">{source.label}</p>
                    <p className="mt-0.5 text-[0.64rem] text-white/38">{source.detail}</p>
                    <p className="mt-1 text-[0.64rem] font-medium text-red-200/72">{source.value}</p>
                  </div>

                  <div
                    className="fee-extraction-lane absolute left-[31%] z-0 h-[3px] w-[42%] origin-left rounded-full"
                    style={{
                      top: source.top,
                      transform: `rotate(${source.rotate})`,
                      ["--fee-delay" as string]: source.delay,
                    }}
                  >
                    <span className="fee-extraction-particle" />
                    <span className="fee-extraction-particle fee-extraction-particle-second" />
                  </div>
                </div>
              ))}

              <div className="fee-magnet-field absolute right-[-0.25rem] top-1/2 z-10 h-[15.8rem] w-[15.8rem] -translate-y-1/2">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_50%,rgba(248,113,113,0.24),rgba(127,29,29,0.11)_34%,transparent_68%)] blur-[2px]" />
                <div className="fee-magnet-pull absolute left-[-4.7rem] top-[18%] h-[3px] w-[9.5rem] rotate-[12deg] rounded-full" />
                <div className="fee-magnet-pull fee-magnet-pull-bottom absolute left-[-4.7rem] bottom-[18%] h-[3px] w-[9.5rem] -rotate-[12deg] rounded-full" />

                <svg
                  className="fee-custom-magnet absolute inset-[0.9rem] h-[14rem] w-[14rem]"
                  viewBox="0 0 260 220"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="extractiveMagnet" x1="32" x2="226" y1="34" y2="174" gradientUnits="userSpaceOnUse">
                      <stop offset="0" stopColor="#FECACA" />
                      <stop offset="0.42" stopColor="#EF4444" />
                      <stop offset="1" stopColor="#7F1D1D" />
                    </linearGradient>
                    <filter id="magnetGlow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feColorMatrix
                        in="blur"
                        type="matrix"
                        values="1 0 0 0 0.95 0 0.22 0 0 0.18 0 0 0.18 0 0.18 0 0 0 0.65 0"
                      />
                      <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <path
                    className="fee-magnet-shadow"
                    d="M66 46H146C197 46 228 75 228 110C228 145 197 174 146 174H66"
                  />
                  <path
                    className="fee-magnet-main"
                    d="M66 46H146C197 46 228 75 228 110C228 145 197 174 146 174H66"
                  />
                  <rect className="fee-magnet-pole" x="34" y="22" width="66" height="48" rx="14" />
                  <rect className="fee-magnet-pole" x="34" y="150" width="66" height="48" rx="14" />
                  <path className="fee-magnet-highlight" d="M70 45H142C190 45 217 73 217 106" />
                  <path className="fee-magnet-highlight fee-magnet-highlight-bottom" d="M70 175H142C190 175 217 147 217 114" />
                </svg>

                <div className="fee-magnet-core absolute left-[49%] top-1/2 grid w-[8.4rem] -translate-x-1/2 -translate-y-1/2 place-items-center text-center">
                  <p className="text-[0.76rem] font-semibold uppercase leading-[1.25] tracking-[0.16em] text-red-100/72 drop-shadow-[0_0_18px_rgba(248,113,113,0.28)]">
                    Most fees captured
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {PROBLEM_POINTS.map((point, index) => (
                <div key={point.title} className="h-[6rem] overflow-hidden rounded-[16px] border border-[#351717] bg-black/18 p-2.5 sm:h-[4.9rem] sm:rounded-[18px] sm:p-3">
                  <div className="flex gap-2 sm:gap-3">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400/78" />
                    <div>
                      <p className="text-[0.67rem] font-semibold text-white/88 sm:text-[0.76rem]">
                        {index + 1}. {point.title}
                      </p>
                      <p className="mt-1 text-[0.56rem] leading-[0.78rem] text-white/58 sm:text-[0.7rem] sm:leading-4">{point.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative rounded-[18px] border border-[#3A1717] bg-red-500/[0.045] p-3 sm:rounded-[22px] sm:p-4">
              <p className="text-sm font-semibold text-[#F87171] drop-shadow-[0_0_16px_rgba(248,113,113,0.16)]">Extractive by design</p>
              <p className="mt-1 text-xs leading-5 text-white/45">
                The platform captures the recurring fee revenue, while projects and communities are left to fund growth with static tokenomics and token sales.
              </p>
            </div>
          </div>
        </div>

        <div className="relative px-1 pb-1 pt-2 text-center xl:hidden">
          <div className="pointer-events-none absolute inset-x-0 top-[-2.2rem] h-36 bg-[radial-gradient(ellipse_at_58%_58%,rgba(82,223,178,0.3),rgba(6,95,70,0.13)_38%,transparent_74%)] blur-[26px]" />
          <h1 className="relative bg-[linear-gradient(180deg,#6EE7B7_0%,#18C98E_100%)] bg-clip-text text-[1.7rem] font-semibold leading-[1.02] tracking-[-0.05em] text-transparent">
            The new model aligns
          </h1>
          <p className="relative mx-auto mt-2 max-w-[22rem] text-xs leading-5 text-white/50">
            Take control of launch revenue. Communities and contributors share in the upside.
          </p>
        </div>

        <div className="flex h-full flex-col rounded-[24px] border border-[#0B3B2B] bg-[linear-gradient(180deg,rgba(4,19,12,0.88),rgba(4,10,8,0.96))] p-4 shadow-[0_18px_70px_rgba(24,201,142,0.05)] sm:rounded-[30px] sm:p-5">
          <div className="text-center">
            <p className="mb-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#52dfb2]/42">
              basedbid
            </p>
            <h2 className="text-[1.24rem] font-semibold leading-tight text-[#6EE7B7]">
              The programmable revenue flow
            </h2>
            <p className="mt-1 text-[0.9rem] leading-5 text-white/45">
              Configurable revenue supports the whole ecosystem.
            </p>
          </div>

          <div className="relative mt-4 grid flex-1 content-start gap-3 sm:mt-6 sm:gap-4">
          <div className="fee-waterfall-visual relative min-h-[340px] overflow-visible xl:min-h-[390px]">
            <div className="fee-waterfall-lip absolute left-1/2 top-[-0.78rem] z-10 h-[1.7rem] w-[25rem] -translate-x-1/2" aria-hidden="true" />
            <div className="fee-waterfall-veil absolute left-1/2 top-[-0.02rem] z-0 h-[16.2rem] w-[27rem] -translate-x-1/2 xl:h-[19rem]">
              <span className="fee-waterfall-stream fee-waterfall-stream-left" />
              <span className="fee-waterfall-stream fee-waterfall-stream-center" />
              <span className="fee-waterfall-stream fee-waterfall-stream-right" />
            </div>
            <div className="fee-waterfall-splash absolute left-1/2 top-[14.9rem] z-0 h-12 w-[30rem] -translate-x-1/2 rounded-full xl:top-[17.7rem]" />
            <div className="fee-waterfall-basin absolute left-1/2 top-[15.2rem] z-0 h-[3.7rem] w-[31rem] -translate-x-1/2 xl:top-[18rem]" aria-hidden="true" />

            <div className="absolute left-1/2 bottom-3 z-10 grid w-[90%] max-w-[36rem] -translate-x-1/2 grid-cols-3 gap-2 sm:bottom-4 sm:gap-2.5">
              {WATERFALL_RECIPIENTS.map((recipient) => {
                const Icon = recipient.icon;
                return (
                  <div
                    key={recipient.label}
                    className="fee-reservoir relative min-h-[4.45rem] overflow-hidden rounded-[15px] border border-[#0B3B2B] bg-[#06150F]/88 p-2 sm:min-h-[5.2rem] sm:rounded-[17px] sm:p-2.5"
                    style={{
                      ["--reservoir-fill" as string]: recipient.fill,
                      ["--reservoir-delay" as string]: recipient.delay,
                    }}
                  >
                    <div className="fee-reservoir-fill" />
                    <div className="relative z-10 flex h-full flex-col justify-between">
                      <div className="grid h-6 w-6 place-items-center rounded-lg border border-[#0B3B2B] bg-[#18C98E]/9 text-[#6EE7B7] sm:h-[1.625rem] sm:w-[1.625rem] sm:rounded-xl">
                        <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </div>
                      <div>
                        <p className="text-[0.62rem] font-semibold text-white/86 sm:text-[0.7rem]">{recipient.label}</p>
                        <p className="mt-0.5 text-[0.5rem] leading-[0.65rem] text-white/48 sm:text-[0.56rem] sm:leading-3">{recipient.text}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {SOLUTION_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="h-[6rem] overflow-hidden rounded-[16px] border border-[#0B3B2B] bg-[#18C98E]/[0.04] p-2.5 sm:h-[4.9rem] sm:rounded-[18px] sm:p-3">
                  <div className="flex gap-2 sm:gap-3">
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-xl border border-[#0B3B2B] bg-[#18C98E]/9 text-[#52DFB2] sm:h-8 sm:w-8 sm:rounded-2xl">
                      <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </div>
                    <div>
                      <p className="text-[0.67rem] font-semibold text-white/86 sm:text-[0.76rem]">
                        {index + 1}. {step.title}
                      </p>
                      <p className="mt-1 text-[0.55rem] leading-[0.78rem] text-white/46 sm:text-[0.62rem] sm:leading-4">
                        {step.text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative rounded-[18px] border border-[#0B3B2B] bg-[#18C98E]/[0.045] p-3 sm:rounded-[22px] sm:p-4">
            <p className="text-sm font-semibold text-[#6EE7B7] drop-shadow-[0_0_18px_rgba(82,223,178,0.16)]">Aligned by design</p>
            <p className="mt-1 text-xs leading-5 text-white/45">
              based.bid captures trading fees at the swap level and lets projects decide where revenue goes: rewards, buybacks, treasury, liquidity, contributors or any custom wallet.
            </p>
          </div>
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,20,20,0.9)_0%,rgba(7,8,8,0.96)_100%)] shadow-[0_18px_60px_rgba(0,0,0,0.24)] sm:rounded-[24px]">
            <div className="grid grid-cols-2 xl:grid-cols-4">
          {ALIGNMENT_STATS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={cn(
                  "flex min-h-[3.55rem] items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4 sm:py-2.5 xl:min-h-[4rem]",
                  index !== ALIGNMENT_STATS.length - 1 && "xl:border-r xl:border-white/8",
                  index > 1 && "border-t border-white/8 md:border-t-0"
                )}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-[#18C98E]/18 bg-[#18C98E]/7 text-[#52DFB2] shadow-[0_0_18px_rgba(24,201,142,0.12)] sm:h-9 sm:w-9 sm:rounded-[0.9rem]">
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[0.76rem] font-semibold leading-none tracking-[-0.035em] text-[#52DFB2] sm:text-[0.9rem]">{item.title}</p>
                  <p className="mt-0.5 text-[0.62rem] leading-3.5 text-white/56 sm:text-[0.74rem] sm:leading-4">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <PageTwoStyles />
    </div>
  );
}

function PageTwoStyles() {
  return (
    <style>{`
      .fee-extraction-lane {
        background: linear-gradient(90deg, rgba(248,113,113,0), rgba(248,113,113,0.34), rgba(248,113,113,0.06));
        box-shadow: 0 0 16px rgba(248,113,113,0.16);
      }

      .fee-extraction-lane::before {
        content: "";
        position: absolute;
        inset: -7px 0;
        background-image: linear-gradient(90deg, transparent, rgba(248,113,113,0.18), transparent);
        filter: blur(7px);
      }

      .fee-extraction-particle {
        position: absolute;
        top: 50%;
        left: 0;
        height: 8px;
        width: 8px;
        transform: translate(-50%, -50%);
        border-radius: 999px;
        background: #FCA5A5;
        box-shadow: 0 0 18px rgba(248,113,113,0.82), 0 0 32px rgba(248,113,113,0.26);
        animation: feeExtract 2.8s cubic-bezier(0.65, 0, 0.35, 1) infinite;
        animation-delay: var(--fee-delay);
      }

      .fee-extraction-particle-second {
        animation-delay: calc(var(--fee-delay) + 1.35s);
        opacity: 0.72;
      }

      .fee-extraction-meter {
        animation: extractionMeter 2.4s ease-in-out infinite;
      }

      .fee-magnet-pull {
        z-index: 1;
        overflow: hidden;
        background: linear-gradient(90deg, rgba(248,113,113,0), rgba(248,113,113,0.22), rgba(248,113,113,0.04));
        box-shadow: 0 0 18px rgba(248,113,113,0.12);
      }

      .fee-magnet-pull::after {
        content: "";
        position: absolute;
        left: 0;
        top: 50%;
        height: 3px;
        width: 3.6rem;
        border-radius: 999px;
        background: linear-gradient(90deg, transparent, rgba(254,202,202,0.86), rgba(248,113,113,0.45), transparent);
        box-shadow: 0 0 12px rgba(248,113,113,0.58), 0 0 24px rgba(248,113,113,0.22);
        transform: translate(-115%, -50%);
        animation: magnetPullGlint 2.7s cubic-bezier(0.62, 0, 0.34, 1) infinite;
      }

      .fee-magnet-pull-bottom::after {
        animation-delay: 0.42s;
      }

      .fee-magnet-pull-middle::after {
        animation-delay: 0.18s;
      }

      .fee-custom-magnet {
        z-index: 2;
        overflow: visible;
        filter: drop-shadow(0 0 26px rgba(248,113,113,0.18));
        animation: magnetBreath 3.4s ease-in-out infinite;
        transform-origin: 52% 50%;
      }

      .fee-magnet-shadow {
        fill: none;
        stroke: rgba(45, 10, 10, 0.78);
        stroke-width: 54;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .fee-magnet-main {
        fill: none;
        stroke: url(#extractiveMagnet);
        stroke-width: 42;
        stroke-linecap: round;
        stroke-linejoin: round;
        filter: url(#magnetGlow);
      }

      .fee-magnet-pole {
        fill: #2A1010;
        stroke: rgba(248,113,113,0.50);
        stroke-width: 1.4;
      }

      .fee-magnet-highlight {
        fill: none;
        stroke: rgba(254,202,202,0.72);
        stroke-width: 6;
        stroke-linecap: round;
        opacity: 0.48;
        animation: magnetHighlight 2.8s ease-in-out infinite;
      }

      .fee-magnet-highlight-bottom {
        opacity: 0.48;
      }

      @keyframes feeExtract {
        0% {
          left: 0;
          opacity: 0.58;
          transform: translate(-50%, -50%) scale(0.72);
        }
        8% {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
        84% {
          opacity: 0.92;
        }
        100% {
          left: 100%;
          opacity: 0.1;
          transform: translate(-50%, -50%) scale(0.5);
        }
      }

      @keyframes magnetBreath {
        0%, 100% {
          transform: scale(0.992);
          opacity: 0.94;
        }
        50% {
          transform: scale(1);
          opacity: 1;
        }
      }

      @keyframes magnetPull {
        0% {
          transform: translateY(-50%) translateX(-120%) scaleX(0.7);
          opacity: 0;
        }
        18% {
          opacity: 0.85;
        }
        100% {
          transform: translateY(-50%) translateX(260%) scaleX(0.32);
          opacity: 0;
        }
      }

      @keyframes magnetPullGlint {
        0% {
          opacity: 0;
          transform: translate(-115%, -50%) scaleX(0.52);
        }
        16% {
          opacity: 0.95;
        }
        72% {
          opacity: 0.8;
        }
        100% {
          opacity: 0;
          transform: translate(235%, -50%) scaleX(0.72);
        }
      }

      @keyframes magnetHighlight {
        0%, 100% {
          opacity: 0.34;
          stroke-dasharray: 42 220;
          stroke-dashoffset: 0;
        }
        50% {
          opacity: 0.72;
          stroke-dasharray: 74 188;
          stroke-dashoffset: -28;
        }
      }

      @keyframes extractionMeter {
        0%, 100% {
          opacity: 0.62;
          transform: translateX(-4%);
        }
        50% {
          opacity: 1;
          transform: translateX(0);
        }
      }

      .fee-waterfall-lip {
        isolation: isolate;
        perspective: 120px;
        filter: drop-shadow(0 7px 14px rgba(24,201,142,0.15));
      }

      .fee-waterfall-lip::before {
        content: "";
        position: absolute;
        left: 1%;
        right: 1%;
        top: -0.34rem;
        height: 1.2rem;
        border-radius: 50%;
        clip-path: polygon(0 45%, 8% 37%, 17% 42%, 27% 31%, 38% 38%, 49% 27%, 60% 35%, 72% 29%, 83% 40%, 93% 34%, 100% 44%, 100% 72%, 91% 79%, 80% 73%, 69% 84%, 57% 77%, 46% 88%, 34% 76%, 23% 84%, 12% 74%, 3% 80%, 0 70%);
        background:
          radial-gradient(ellipse at 50% 28%, rgba(209,250,229,0.42), rgba(110,231,183,0.19) 38%, rgba(24,201,142,0.08) 67%, transparent 82%),
          linear-gradient(100deg, transparent 6%, rgba(167,243,208,0.08) 24%, rgba(236,253,245,0.42) 47%, rgba(110,231,183,0.14) 64%, transparent 92%);
        background-size: 100% 100%, 190% 100%;
        box-shadow: inset 0 -1px 0 rgba(167,243,208,0.24), 0 0 17px rgba(24,201,142,0.11);
        transform: rotateX(58deg);
        transform-origin: center bottom;
        animation: waterfallCrestShimmer 7.2s ease-in-out infinite;
      }

      .fee-waterfall-lip::after {
        content: "";
        position: absolute;
        left: 1.4%;
        right: 1.4%;
        top: 0.5rem;
        height: 1.12rem;
        border-radius: 0 0 44% 48% / 0 0 76% 78%;
        clip-path: polygon(0 0, 100% 0, 98% 34%, 91% 47%, 83% 39%, 73% 65%, 63% 51%, 52% 79%, 42% 53%, 31% 70%, 21% 46%, 11% 58%, 3% 36%);
        background:
          linear-gradient(180deg, rgba(209,250,229,0.50) 0 8%, rgba(82,223,178,0.24) 18%, rgba(4,19,12,0.46) 44%, rgba(45,212,191,0.10) 72%, transparent 100%),
          linear-gradient(90deg, transparent, rgba(167,243,208,0.23) 48%, transparent);
        box-shadow: inset 0 1px 0 rgba(236,253,245,0.34), 0 4px 13px rgba(24,201,142,0.10);
        filter: blur(0.7px);
        opacity: 0.94;
      }

      .fee-waterfall-veil {
        overflow: hidden;
        border-radius: 22px 22px 30px 30px;
        background:
          radial-gradient(ellipse at 20% 8%, rgba(167,243,208,0.14), transparent 44%),
          radial-gradient(ellipse at 50% 8%, rgba(167,243,208,0.16), transparent 46%),
          radial-gradient(ellipse at 80% 8%, rgba(167,243,208,0.14), transparent 44%),
          radial-gradient(ellipse at 50% 78%, rgba(45,212,191,0.08), transparent 68%),
          linear-gradient(90deg, transparent 0%, rgba(45,212,191,0.035) 12%, rgba(110,231,183,0.09) 50%, rgba(45,212,191,0.035) 88%, transparent 100%),
          linear-gradient(180deg, rgba(110,231,183,0), rgba(82,223,178,0.095) 20%, rgba(45,212,191,0.075) 74%, rgba(110,231,183,0));
        filter: drop-shadow(0 0 24px rgba(24,201,142,0.18)) blur(0.1px);
        mask-image: linear-gradient(180deg, black 0%, black 82%, transparent 98%);
      }

      .fee-waterfall-veil::before,
      .fee-waterfall-veil::after {
        content: "";
        position: absolute;
        inset: -34% 15% -16%;
        border-radius: 32px;
        background:
          repeating-linear-gradient(90deg, rgba(167,243,208,0.0) 0 14px, rgba(167,243,208,0.10) 15px 17px, rgba(45,212,191,0.026) 18px 31px),
          linear-gradient(180deg, transparent, rgba(167,243,208,0.18), rgba(45,212,191,0.10), transparent);
        filter: blur(7px);
        opacity: 0.68;
        animation: waterfallCurtain 4.4s ease-in-out infinite;
      }

      .fee-waterfall-veil::after {
        inset-inline: 28%;
        opacity: 0.38;
        animation-delay: 1.4s;
      }

      .fee-waterfall-stream {
        position: absolute;
        top: -30%;
        bottom: -24%;
        width: 8px;
        border-radius: 999px;
        background: linear-gradient(180deg, transparent, rgba(167,243,208,0.76), rgba(45,212,191,0.26), transparent);
        box-shadow: 0 0 14px rgba(110,231,183,0.30), 0 0 28px rgba(45,212,191,0.14);
        animation: waterfallRibbon 2.55s cubic-bezier(0.42, 0, 0.28, 1) infinite;
        animation-fill-mode: both;
      }

      .fee-waterfall-stream-left {
        left: calc(20% - 3.5px);
        width: 7px;
        opacity: 0.62;
        animation-delay: 1.03s;
      }

      .fee-waterfall-stream-center {
        left: calc(50% - 7px);
        width: 14px;
        opacity: 0.82;
        animation-delay: 0.75s;
      }

      .fee-waterfall-stream-right {
        right: calc(20% - 3.5px);
        width: 7px;
        opacity: 0.62;
        animation-delay: 1.31s;
      }

      .fee-waterfall-splash {
        background:
          radial-gradient(ellipse at 20% 50%, rgba(167,243,208,0.15), rgba(82,223,178,0.06) 42%, transparent 72%),
          radial-gradient(ellipse at 50% 50%, rgba(167,243,208,0.20), rgba(82,223,178,0.08) 42%, transparent 74%),
          radial-gradient(ellipse at 80% 50%, rgba(167,243,208,0.15), rgba(82,223,178,0.06) 42%, transparent 72%);
        filter: blur(9px);
        opacity: 0.38;
        animation: waterfallSplash 6.4s ease-in-out infinite;
      }

      .fee-waterfall-basin {
        pointer-events: none;
        filter: drop-shadow(0 0 18px rgba(24,201,142,0.14));
      }

      .fee-waterfall-basin::before {
        content: "";
        position: absolute;
        left: 50%;
        top: -0.35rem;
        height: 2.7rem;
        width: min(35rem, 96%);
        transform: translateX(-50%);
        border-radius: 999px;
        background:
          radial-gradient(ellipse at 20% 50%, rgba(209,250,229,0.11), rgba(110,231,183,0.045) 38%, transparent 68%),
          radial-gradient(ellipse at 50% 50%, rgba(209,250,229,0.16), rgba(110,231,183,0.065) 40%, transparent 70%),
          radial-gradient(ellipse at 80% 50%, rgba(209,250,229,0.11), rgba(110,231,183,0.045) 38%, transparent 68%);
        filter: blur(10px);
        animation: basinBreath 7.2s ease-in-out infinite;
      }

      .fee-waterfall-basin::after {
        content: "";
        position: absolute;
        inset-inline: 1rem;
        bottom: 0.25rem;
        height: 2.5rem;
        border-radius: 999px 999px 30px 30px;
        background:
          linear-gradient(90deg, rgba(24,201,142,0.015), rgba(110,231,183,0.085) 16%, rgba(167,243,208,0.10) 33%, rgba(110,231,183,0.085) 50%, rgba(167,243,208,0.10) 67%, rgba(110,231,183,0.085) 84%, rgba(24,201,142,0.015)),
          radial-gradient(ellipse at center, rgba(24,201,142,0.12), transparent 72%);
        filter: blur(12px);
        opacity: 0.38;
      }

      .fee-reservoir {
        box-shadow: inset 0 1px 0 rgba(110,231,183,0.05), 0 16px 40px rgba(0,0,0,0.18);
      }

      .fee-reservoir::before {
        content: "";
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 50% 0%, rgba(110,231,183,0.11), transparent 46%);
        opacity: 0.82;
      }

      .fee-reservoir-fill {
        position: absolute;
        inset-inline: 0;
        bottom: 0;
        height: var(--reservoir-fill);
        background: linear-gradient(180deg, rgba(45,212,191,0.04), rgba(24,201,142,0.20) 42%, rgba(6,95,70,0.32));
        opacity: 0.72;
        transform-origin: bottom;
        animation: reservoirPulse 3.8s ease-in-out infinite;
        animation-delay: var(--reservoir-delay);
      }

      .fee-reservoir-fill::before {
        content: "";
        position: absolute;
        inset-x: -12%;
        top: -8px;
        height: 16px;
        border-radius: 999px;
        background: linear-gradient(90deg, transparent, rgba(110,231,183,0.48), rgba(45,212,191,0.36), transparent);
        filter: blur(2px);
        animation: reservoirWave 2.9s ease-in-out infinite;
      }

      @keyframes waterfallRibbon {
        0% {
          transform: translateY(-26%) scaleY(0.72);
          opacity: 0;
        }
        18% {
          opacity: 0.96;
        }
        100% {
          transform: translateY(34%) scaleY(0.92);
          opacity: 0;
        }
      }

      @keyframes waterfallCrestShimmer {
        0%, 100% {
          background-position: 0 0, 10% 0;
          opacity: 0.78;
        }
        50% {
          background-position: 0 0, 88% 0;
          opacity: 1;
        }
      }

      @keyframes waterfallCurtain {
        0%, 100% {
          transform: translateY(-4%) scaleX(0.88);
          opacity: 0.28;
        }
        50% {
          transform: translateY(7%) scaleX(1);
          opacity: 0.72;
        }
      }

      @keyframes waterfallSplash {
        0%, 100% {
          transform: translateX(-50%) scale(0.94);
          opacity: 0.42;
        }
        50% {
          transform: translateX(-50%) scale(1.02);
          opacity: 0.7;
        }
      }

      @keyframes basinBreath {
        0%, 100% {
          transform: translateX(-50%) scaleX(0.94);
          opacity: 0.62;
        }
        50% {
          transform: translateX(-50%) scaleX(1.04);
          opacity: 0.88;
        }
      }

      @keyframes reservoirPulse {
        0%, 100% {
          transform: scaleY(0.91);
          opacity: 0.58;
        }
        50% {
          transform: scaleY(1);
          opacity: 0.82;
        }
      }

      @keyframes reservoirWave {
        0%, 100% {
          transform: translateX(-8%);
          opacity: 0.45;
        }
        50% {
          transform: translateX(8%);
          opacity: 0.86;
        }
      }

      @media (max-width: 1023px) {
        .fee-extraction-visual {
          min-height: 340px;
        }

        .fee-waterfall-visual {
          min-height: 340px;
        }
      }

      @media (max-width: 767px) {
        .fee-extraction-visual {
          min-height: 258px;
          overflow: hidden;
        }

        .fee-extraction-visual .absolute.left-4 {
          left: 0.12rem;
          width: 4.9rem;
          padding: 0.36rem 0.42rem;
          border-radius: 0.72rem;
        }

        .fee-extraction-visual .absolute.left-4 p:first-child {
          font-size: 0.58rem;
          line-height: 0.78rem;
        }

        .fee-extraction-visual .absolute.left-4 p:not(:first-child) {
          font-size: 0.46rem;
          line-height: 0.61rem;
        }

        .fee-extraction-lane {
          display: block;
          left: 30.5% !important;
          width: 42% !important;
        }

        .fee-extraction-visual > div:nth-child(1) .absolute.left-4,
        .fee-extraction-visual > div:nth-child(1) .fee-extraction-lane {
          top: 25% !important;
        }

        .fee-extraction-visual > div:nth-child(1) .fee-extraction-lane {
          transform: rotate(9deg) !important;
        }

        .fee-extraction-visual > div:nth-child(2) .absolute.left-4,
        .fee-extraction-visual > div:nth-child(2) .fee-extraction-lane {
          top: 50% !important;
        }

        .fee-extraction-visual > div:nth-child(3) .absolute.left-4,
        .fee-extraction-visual > div:nth-child(3) .fee-extraction-lane {
          top: 75% !important;
        }

        .fee-magnet-pull,
        .fee-magnet-pull-bottom {
          display: none;
        }

        .fee-magnet-field {
          right: -0.18rem;
          height: 10rem;
          width: 10rem;
        }

        .fee-custom-magnet {
          inset: 0.46rem !important;
          height: 8.85rem !important;
          width: 8.85rem !important;
        }

        .fee-magnet-core {
          width: 4.9rem;
        }

        .fee-magnet-core p {
          font-size: 0.52rem;
          letter-spacing: 0.13em;
        }

        .fee-waterfall-visual {
          min-height: 340px;
        }

        .fee-waterfall-lip {
          width: 20.5rem;
        }

        .fee-waterfall-veil {
          top: -0.02rem;
          height: 13.85rem;
          width: 22rem;
        }

        .fee-waterfall-splash {
          top: 12.85rem;
          width: 25rem;
        }

        .fee-waterfall-basin {
          top: 13.2rem;
          width: 25rem;
        }
      }
    `}</style>
  );
}

const LAUNCH_TYPE_ROWS: Array<{
  title: string;
  text: string;
  icon: LucideIcon;
  tags: string[];
  badge?: string;
}> = [
  {
    title: "Launch a Pool",
    text: "Bonding curve launch with programmable fees.",
    icon: TrendingUp,
    tags: ["Bonding curve", "Custom market cap", "Customization"],
  },
  {
    title: "Launch a Token",
    text: "Launch directly to DEX with no upfront liquidity.",
    icon: Rocket,
    tags: ["No upfront liquidity", "DEX options", "Initial Buy Allocator", "Buy Airdropper"],
  },
  {
    title: "Create a Board",
    text: "Deploy a branded launchpad and earn from every launch.",
    icon: LayoutDashboard,
    tags: ["Whitelabel", "Revenue", "Distribution"],
  },
  {
    title: "Create a Fairlaunch",
    text: "Create a fair launch presale with your target market cap.",
    icon: ShieldCheck,
    tags: ["Presale", "Target cap", "Fundraising", "Fair launch"],
    badge: "Upcoming",
  },
];

const FLYWHEEL_STEPS = [
  { number: "01", title: "Board promotes", className: "left-1/2 top-[7%] -translate-x-1/2 -translate-y-1/2 xl:left-[47%] xl:top-[10.8%]", delay: "0s" },
  { number: "02", title: "Community grows", className: "left-[77%] top-[33.5%] -translate-x-1/2 -translate-y-1/2 xl:left-[69.5%] xl:top-[34.5%]", delay: "3.2s" },
  { number: "03", title: "Projects launch", className: "left-[67%] top-[80%] -translate-x-1/2 -translate-y-1/2 xl:left-[64%] xl:top-[77.5%]", delay: "6.4s" },
  { number: "04", title: "Fees generate", className: "left-[33%] top-[80%] -translate-x-1/2 -translate-y-1/2 xl:left-[30%] xl:top-[77.5%]", delay: "9.6s" },
  { number: "05", title: "Everyone wins", className: "left-[23%] top-[33.5%] -translate-x-1/2 -translate-y-1/2 xl:left-[26.25%] xl:top-[34.5%]", delay: "12.8s" },
];

const BOARD_MATTERS = [
  { title: "Infinite reach", text: "Every Board becomes a launch channel.", icon: Network },
  { title: "Distribution Compounds", text: "Board owners grow their audience through launches.", icon: TrendingUp },
  { title: "Communities own upside", text: "Revenue flows back to the network.", icon: Users },
];

function PageFour() {
  return (
    <div className="grid gap-4">
      <section className="grid gap-4 xl:min-h-[720px] xl:grid-cols-[0.82fr_1.18fr]">
        <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#101414]/95 p-4 shadow-2xl shadow-black/35 backdrop-blur-xl sm:rounded-[2rem] xl:p-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(24,201,142,0.1),transparent_28%),radial-gradient(circle_at_80%_70%,rgba(212,175,55,0.05),transparent_30%)]" />
          <div className="relative">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[#52dfb2]/42">
              Launch types
            </p>
            <h1 className="mt-2 text-[1.42rem] font-semibold leading-[1.02] text-white/94 sm:mt-2.5 sm:text-[1.8rem] md:text-[2.25rem] xl:text-[2.5rem]">
              Four ways to launch.
            </h1>
            <p className="mt-2 max-w-[34rem] text-[0.78rem] leading-5 text-white/50 sm:text-[0.86rem] sm:leading-5 xl:text-[0.92rem] xl:leading-6">
              Launch directly on based.bid or power branded launch experiences through Boards, SDK and API.
            </p>
          </div>

          <div className="relative mt-4 grid gap-2.5 sm:mt-5 xl:mt-8 xl:gap-3.5">
            {LAUNCH_TYPE_ROWS.map((item, index) => {
              const Icon = item.icon;
              const isBoard = item.title === "Create a Board";
              const isUpcoming = Boolean(item.badge);
              const isFairlaunch = item.title === "Create a Fairlaunch";
              return (
                <div
                  key={item.title}
                  className={cn(
                    "group rounded-[18px] border bg-black/16 p-3 transition sm:rounded-[20px] xl:p-4",
                    isFairlaunch
                      ? "border-violet-400/28 bg-violet-500/[0.045] shadow-[0_0_30px_rgba(167,139,250,0.07)]"
                      : isBoard || isUpcoming
                      ? "border-[#D4AF37]/24 bg-[rgba(212,175,55,0.045)] shadow-[0_0_30px_rgba(212,175,55,0.05)]"
                      : "border-[#0B3B2B] hover:border-[#18C98E]/26"
                  )}
                >
                  <div className="flex gap-3 sm:gap-4">
                    <div
                      className={cn(
                        "grid h-9 w-9 shrink-0 place-items-center rounded-xl border sm:h-10 sm:w-10 sm:rounded-2xl",
                        isFairlaunch
                          ? "border-violet-400/28 bg-violet-500/10 text-violet-200"
                          : isBoard || isUpcoming
                          ? "border-[#D4AF37]/24 bg-[rgba(212,175,55,0.08)] text-[#FFE082]"
                          : "border-[#0B3B2B] bg-[#18C98E]/8 text-[#6EE7B7]"
                      )}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <h2 className="truncate text-[0.84rem] font-semibold text-white/88 sm:text-[0.96rem]">{item.title}</h2>
                          {item.badge ? (
                            <span className="rounded-full border border-violet-300/30 bg-violet-500/12 px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-violet-100/82">
                              {item.badge}
                            </span>
                          ) : null}
                        </div>
                        <span className="shrink-0 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white/28">
                          0{index + 1}
                        </span>
                      </div>
                      <p className="mt-1 text-[0.64rem] leading-4 text-white/48 sm:text-[0.72rem] sm:leading-5">{item.text}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/8 bg-white/[0.035] px-2 py-0.5 text-[0.55rem] font-medium text-white/52 sm:px-2.5 sm:py-0.5 sm:text-[0.6rem]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="relative overflow-hidden rounded-[16px] border-t border-[#0B3B2B]/80 bg-[linear-gradient(90deg,rgba(24,201,142,0.075),rgba(212,175,55,0.045)_48%,rgba(24,201,142,0.025))] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] sm:rounded-[20px] sm:px-3.5 sm:py-2.5 sm:pr-36 xl:px-4 xl:py-3.5 xl:pr-40">
              <div className="pointer-events-none absolute inset-y-3 left-0 w-px bg-[linear-gradient(180deg,transparent,#6EE7B7,transparent)] opacity-70" />
              <span className="absolute right-4 top-3 hidden rounded-full border border-[#18C98E]/26 bg-[#18C98E]/10 px-3 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-[#b7f3df]/82 shadow-[0_0_18px_rgba(24,201,142,0.08)] sm:inline-flex">
                Infra upgrades
              </span>
              <div className="relative">
                <p className="max-w-[33rem] text-[0.62rem] leading-4 text-white/43 sm:text-[0.7rem] sm:leading-5">
                  <span className="font-semibold text-[#6EE7B7]/90">Openbid SDK/API</span>{" "}
                  powers token launches, Boards and Fee Builder access inside your own app or protocol, with free upgrades for new and existing users.
                </p>
              </div>
              <div className="relative mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#0B3B2B]/55 pt-2 sm:mt-3 sm:gap-3 sm:pt-3">
                <div className="flex items-center gap-2">
                <p className="text-[0.7rem] font-semibold text-white/82 sm:text-[0.76rem]">Fee Builder</p>
                  <span className="rounded-full border border-[#D4AF37]/30 bg-[rgba(212,175,55,0.12)] px-2 py-0.5 text-[0.5rem] font-semibold uppercase tracking-[0.08em] text-[#FFE9A8]/88 shadow-[0_0_18px_rgba(212,175,55,0.08)] sm:px-2.5 sm:py-1 sm:text-[0.58rem]">
                    Signature
                  </span>
                </div>
                <p className="text-[0.58rem] leading-4 text-white/36 sm:text-[0.64rem]">
                  Configurable fees, rewards, buybacks, liquidity and custom routes.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#090b0b]/95 p-4 shadow-2xl shadow-black/35 backdrop-blur-xl sm:rounded-[2rem] xl:p-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_36%,rgba(24,201,142,0.14),transparent_30%),radial-gradient(circle_at_78%_52%,rgba(103,232,249,0.08),transparent_28%)]" />
          <div className="relative grid gap-4 xl:grid-cols-[1fr_12.5rem]">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[#52dfb2]/42">
                Based bid boards
              </p>
              <h2 className="mt-2 max-w-[40rem] text-[1.24rem] font-semibold leading-[1.08] text-white/92 sm:mt-2.5 sm:text-[1.58rem] md:text-[1.95rem] xl:text-[2.35rem]">
                Boards turn launches into owned distribution.
              </h2>
              <p className="mt-2 max-w-[39rem] text-[0.76rem] leading-5 text-white/50 sm:text-[0.85rem] sm:leading-5">
                Boards are branded launchpads for KOLs, communities, agencies and networks. Board owners curate launches, grow their audience and earn from every project launched through their Board.
              </p>
            </div>

            <div className="relative z-10 self-start rounded-[22px] border border-[#0B3B2B] bg-[#06150F]/72 p-3.5">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#52dfb2]/42">
                Why boards matter
              </p>
              <div className="mt-3 grid gap-3">
                {BOARD_MATTERS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex gap-3">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-2xl border border-[#0B3B2B] bg-[#18C98E]/8 text-[#6EE7B7]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[0.74rem] font-semibold text-white/78">{item.title}</p>
                        <p className="mt-0.5 text-[0.61rem] leading-4 text-white/42">{item.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="relative mx-auto mt-3 h-[350px] max-w-[760px] sm:mt-4 sm:h-[390px] xl:mt-8 xl:h-[520px]">
            <div className="page-four-flywheel-glow absolute inset-0 rounded-full" />
            <svg
              className="page-four-flywheel-orbit absolute left-1/2 top-[46%] h-[17.4rem] w-[17.4rem] -translate-x-1/2 -translate-y-1/2 overflow-visible sm:h-[19.6rem] sm:w-[19.6rem] xl:left-[47%] xl:top-[47.5%] xl:h-[25rem] xl:w-[25rem]"
              viewBox="0 0 400 400"
              aria-hidden="true"
            >
              <circle className="page-four-flywheel-orbit-base" cx="200" cy="200" r="190" pathLength="100" />
            </svg>
            <div className="page-four-flywheel-traveller absolute left-1/2 top-[46%] z-20 h-[17.4rem] w-[17.4rem] sm:h-[19.6rem] sm:w-[19.6rem] xl:left-[47%] xl:top-[47.5%] xl:h-[25rem] xl:w-[25rem]">
              <div className="page-four-flywheel-traveller-mark absolute left-1/2 top-[-1.25rem] h-12 w-12 -translate-x-1/2">
                <span className="page-four-logo-dust page-four-logo-dust-a" />
                <span className="page-four-logo-dust page-four-logo-dust-b" />
                <span className="page-four-logo-dust page-four-logo-dust-c" />
                <span className="page-four-logo-dust page-four-logo-dust-d" />
                <span className="page-four-logo-dust page-four-logo-dust-e" />
                <span className="page-four-logo-dust page-four-logo-dust-f" />
                <span className="page-four-logo-dust page-four-logo-dust-g" />
                <span className="page-four-logo-dust page-four-logo-dust-h" />
                <span className="page-four-logo-dust page-four-logo-dust-i" />
                <span className="page-four-logo-dust page-four-logo-dust-j" />
                <span className="page-four-logo-dust page-four-logo-dust-k" />
                <span className="page-four-logo-dust page-four-logo-dust-l" />
                <span className="page-four-logo-dust page-four-logo-dust-m" />
                <span className="page-four-logo-dust page-four-logo-dust-n" />
                <span className="page-four-logo-dust page-four-logo-dust-o" />
                <span className="page-four-logo-dust page-four-logo-dust-p" />
                <span className="page-four-logo-dust page-four-logo-dust-q" />
                <span className="page-four-logo-dust page-four-logo-dust-r" />
                <span className="page-four-logo-dust page-four-logo-dust-s" />
                <span className="page-four-logo-dust page-four-logo-dust-t" />
                <span className="page-four-logo-dust page-four-logo-dust-u" />
                <span className="page-four-logo-dust page-four-logo-dust-v" />
                <span className="page-four-logo-fire page-four-logo-fire-core" />
                <span className="page-four-logo-fire page-four-logo-fire-wisp" />
                <span className="page-four-logo-fire page-four-logo-fire-lick page-four-logo-fire-lick-a" />
                <span className="page-four-logo-fire page-four-logo-fire-lick page-four-logo-fire-lick-b" />
                <span className="page-four-logo-fire page-four-logo-fire-lick page-four-logo-fire-lick-c" />
                <Image
                  src="/deck/logo-navbar.png"
                  alt="based.bid"
                  width={52}
                  height={40}
                  className="absolute left-1/2 top-1/2 z-10 h-9 w-auto -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-[0_0_14px_rgba(154,230,110,0.55)]"
                />
              </div>
            </div>

            <div className="page-four-flywheel-core absolute left-1/2 top-[46%] z-20 grid h-[6.8rem] w-[6.8rem] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[#0B3B2B] bg-[#05120D]/94 shadow-[0_0_42px_rgba(24,201,142,0.16)] sm:h-[7.35rem] sm:w-[7.35rem] xl:left-[47%] xl:top-[47.5%] xl:h-[8.2rem] xl:w-[8.2rem]">
              <span className="page-four-core-plasma" />
              <span className="page-four-core-spark page-four-core-spark-a" />
              <span className="page-four-core-spark page-four-core-spark-b" />
              <span className="page-four-core-spark page-four-core-spark-c" />
              <span className="page-four-core-spark page-four-core-spark-d" />
              <span className="page-four-core-spark page-four-core-spark-e" />
              <span className="page-four-core-spark page-four-core-spark-f" />
              <Image
                src="/deck/logo-navbar.png"
                alt="based.bid"
                width={72}
                height={56}
                className="relative z-10 h-11 w-auto object-contain sm:h-12 xl:h-14"
              />
              <div className="absolute -bottom-7 z-10 w-[12rem] text-center xl:-bottom-8 xl:w-[13rem]">
                <p className="text-[1.03rem] font-semibold tracking-[-0.03em] text-white/92 drop-shadow-[0_0_18px_rgba(154,230,110,0.18)]">
                  Distribution flywheel
                </p>
              </div>
            </div>

            {FLYWHEEL_STEPS.map((step) => (
              <div
                key={step.number}
                data-step={step.number}
                className={cn(
                  "page-four-flywheel-node absolute z-30 w-[8.35rem] rounded-[17px] border border-[#0B3B2B] bg-[linear-gradient(180deg,rgba(6,21,15,0.98),rgba(2,10,7,0.96))] p-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.045),0_14px_34px_rgba(0,0,0,0.26)] backdrop-blur-md xl:w-[8.7rem]",
                  step.className
                )}
                style={{ "--node-delay": step.delay } as React.CSSProperties}
              >
                <div className="mx-auto -mt-6 grid h-7 w-7 place-items-center rounded-full border border-[#9AE66E]/30 bg-[#9AE66E] text-[0.76rem] font-bold text-[#06200F] shadow-[0_0_24px_rgba(154,230,110,0.34)]">
                  {step.number}
                </div>
                <p className="mt-2 text-[0.72rem] font-semibold leading-4 text-white/82 xl:text-[0.76rem]">{step.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PageFourStyles />
    </div>
  );
}

function PageFourStyles() {
  return (
    <style>{`
      .page-four-flywheel-glow {
        background:
          radial-gradient(circle at 50% 50%, rgba(154,230,110,0.18), transparent 37%),
          radial-gradient(circle at 50% 50%, rgba(24,201,142,0.12), transparent 62%);
        filter: blur(20px);
      }

      .page-four-flywheel-orbit {
        pointer-events: none;
        filter: drop-shadow(0 0 14px rgba(154,230,110,0.28)) drop-shadow(0 0 32px rgba(24,201,142,0.12));
      }

      .page-four-flywheel-orbit-base {
        fill: none;
        stroke: rgba(154,230,110,0.115);
        stroke-width: 1.45;
      }

      .page-four-flywheel-traveller {
        pointer-events: none;
        transform: translate3d(-50%, -50%, 0) rotate(0deg);
        transform-origin: center;
        animation: flywheelLogoOrbit 16s linear infinite;
        will-change: transform;
        backface-visibility: hidden;
      }

      .page-four-flywheel-traveller-mark {
        transform: translateZ(0);
        will-change: transform;
        overflow: visible;
      }

      .page-four-logo-dust {
        position: absolute;
        z-index: 0;
        height: var(--dust-size, 4px);
        width: var(--dust-size, 4px);
        border-radius: 999px;
        background: rgba(190,242,100,var(--dust-alpha,0.82));
        box-shadow: 0 0 6px rgba(190,242,100,0.48);
        opacity: 0;
        animation: flywheelLogoDust 0.64s linear infinite;
        will-change: transform, opacity;
      }

      .page-four-logo-fire {
        position: absolute;
        left: 50%;
        top: 50%;
        z-index: 1;
        pointer-events: none;
        border-radius: 999px;
        transform: translate(-50%, -50%);
      }

      .page-four-logo-fire-core {
        height: 4rem;
        width: 5.35rem;
        background:
          radial-gradient(ellipse at 62% 50%, rgba(240,255,193,0.62), transparent 13%),
          radial-gradient(ellipse at 48% 50%, rgba(190,242,100,0.46), transparent 25%),
          radial-gradient(ellipse at 31% 52%, rgba(82,223,178,0.34), transparent 41%),
          radial-gradient(ellipse at 16% 55%, rgba(24,201,142,0.22), transparent 58%);
        -webkit-mask-image: radial-gradient(ellipse at 50% 50%, #000 0 54%, transparent 74%);
        mask-image: radial-gradient(ellipse at 50% 50%, #000 0 54%, transparent 74%);
        filter: blur(7.5px);
        opacity: 0.82;
        transform: translate3d(-52%, -50%, 0) rotate(-2deg);
        animation: flywheelLogoFire 1.25s ease-in-out infinite alternate;
        will-change: opacity, scale;
      }

      .page-four-logo-fire-wisp {
        height: 2.35rem;
        width: 6.8rem;
        background:
          radial-gradient(ellipse at 84% 50%, rgba(240,255,193,0.30), transparent 15%),
          radial-gradient(ellipse at 55% 48%, rgba(154,230,110,0.28), transparent 32%),
          radial-gradient(ellipse at 20% 54%, rgba(24,201,142,0.20), transparent 68%);
        -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 20%, #000 72%, transparent 100%);
        mask-image: linear-gradient(90deg, transparent 0%, #000 20%, #000 72%, transparent 100%);
        filter: blur(8px);
        opacity: 0.62;
        transform: translate3d(-78%, -49%, 0) rotate(-7deg);
        animation: flywheelLogoWisp 1.65s ease-in-out infinite alternate;
        will-change: opacity, scale;
      }

      .page-four-logo-fire-lick {
        height: 0.42rem;
        width: 2.8rem;
        border-radius: 999px;
        background: linear-gradient(90deg, rgba(24,201,142,0), rgba(190,242,100,0.72), rgba(240,255,193,0.28));
        filter: blur(2.5px);
        transform-origin: 100% 50%;
        animation: flywheelLogoFlameLick 0.95s ease-in-out infinite alternate;
        will-change: opacity, scale;
      }

      .page-four-logo-dust-q,
      .page-four-logo-dust-r,
      .page-four-logo-dust-s,
      .page-four-logo-dust-t,
      .page-four-logo-dust-u,
      .page-four-logo-dust-v {
        display: none;
      }

      .page-four-logo-fire-lick-a {
        transform: translate(-108%, -74%) rotate(-22deg);
      }

      .page-four-logo-fire-lick-b {
        width: 3.4rem;
        transform: translate(-116%, -42%) rotate(2deg);
        animation-delay: 0.11s;
      }

      .page-four-logo-fire-lick-c {
        width: 2.4rem;
        transform: translate(-104%, -14%) rotate(21deg);
        animation-delay: 0.22s;
      }

      .page-four-logo-dust-a {
        --dust-size: 4.4px;
        left: -0.55rem;
        top: 0.74rem;
      }

      .page-four-logo-dust-b {
        --dust-size: 3.7px;
        left: -1.35rem;
        top: 1.38rem;
        animation-delay: 0.04s;
      }

      .page-four-logo-dust-c {
        --dust-size: 3px;
        left: -2.2rem;
        top: 2.03rem;
        animation-delay: 0.08s;
      }

      .page-four-logo-dust-d {
        --dust-size: 2.5px;
        left: -3.25rem;
        top: 1.04rem;
        animation-delay: 0.12s;
      }

      .page-four-logo-dust-e {
        --dust-size: 2px;
        left: -4.15rem;
        top: 1.72rem;
        animation-delay: 0.16s;
      }

      .page-four-logo-dust-f {
        --dust-size: 1.6px;
        left: -5rem;
        top: 1.2rem;
        animation-delay: 0.2s;
      }

      .page-four-logo-dust-g {
        --dust-size: 1.25px;
        left: -5.75rem;
        top: 1.82rem;
        animation-delay: 0.24s;
      }

      .page-four-logo-dust-h {
        --dust-size: 3.2px;
        left: -1.05rem;
        top: 2.22rem;
        animation-delay: 0.28s;
      }

      .page-four-logo-dust-i {
        --dust-size: 2.7px;
        left: -2.9rem;
        top: 2.42rem;
        animation-delay: 0.32s;
      }

      .page-four-logo-dust-j {
        --dust-size: 2.2px;
        left: -3.75rem;
        top: 0.54rem;
        animation-delay: 0.36s;
      }

      .page-four-logo-dust-k {
        --dust-size: 1.8px;
        left: -4.85rem;
        top: 2.48rem;
        animation-delay: 0.4s;
      }

      .page-four-logo-dust-l {
        --dust-size: 1.45px;
        left: -6.35rem;
        top: 0.92rem;
        animation-delay: 0.44s;
      }

      .page-four-logo-dust-m {
        --dust-size: 1.15px;
        --dust-alpha: 0.62;
        left: -6.95rem;
        top: 1.54rem;
        animation-delay: 0.48s;
      }

      .page-four-logo-dust-n {
        --dust-size: 0.95px;
        --dust-alpha: 0.5;
        left: -7.55rem;
        top: 2.08rem;
        animation-delay: 0.52s;
      }

      .page-four-logo-dust-o {
        --dust-size: 3.6px;
        left: -0.9rem;
        top: 1.78rem;
        animation-delay: 0.56s;
      }

      .page-four-logo-dust-p {
        --dust-size: 2.9px;
        left: -1.85rem;
        top: 0.5rem;
        animation-delay: 0.6s;
      }

      .page-four-logo-dust-q {
        --dust-size: 2.4px;
        left: -2.65rem;
        top: 1.55rem;
        animation-delay: 0.64s;
      }

      .page-four-logo-dust-r {
        --dust-size: 2px;
        left: -3.55rem;
        top: 2.12rem;
        animation-delay: 0.68s;
      }

      .page-four-logo-dust-s {
        --dust-size: 1.55px;
        --dust-alpha: 0.7;
        left: -4.55rem;
        top: 0.78rem;
        animation-delay: 0.72s;
      }

      .page-four-logo-dust-t {
        --dust-size: 1.25px;
        --dust-alpha: 0.58;
        left: -5.55rem;
        top: 2.28rem;
        animation-delay: 0.76s;
      }

      .page-four-logo-dust-u {
        --dust-size: 1px;
        --dust-alpha: 0.48;
        left: -6.55rem;
        top: 0.48rem;
        animation-delay: 0.8s;
      }

      .page-four-logo-dust-v {
        --dust-size: 0.8px;
        --dust-alpha: 0.42;
        left: -8.15rem;
        top: 1.32rem;
        animation-delay: 0.84s;
      }

      .page-four-flywheel-core {
        overflow: visible;
        isolation: isolate;
      }

      .page-four-flywheel-core::before {
        content: "";
        position: absolute;
        inset: 0.7rem;
        border-radius: 999px;
        background:
          radial-gradient(circle at 42% 38%, rgba(190,242,100,0.40), transparent 10%),
          radial-gradient(circle at 58% 62%, rgba(45,212,191,0.30), transparent 16%),
          radial-gradient(circle at 50% 50%, rgba(154,230,110,0.20), rgba(24,201,142,0.08) 42%, transparent 68%);
        filter: blur(7px);
        z-index: 0;
        animation: flywheelCoreMatter 3.4s ease-in-out infinite;
      }

      .page-four-flywheel-core::after {
        content: "";
        position: absolute;
        inset: -26%;
        border-radius: 999px;
        background: conic-gradient(from 0deg, transparent, rgba(154,230,110,0.18), transparent 28%, rgba(45,212,191,0.12), transparent 58%, rgba(154,230,110,0.14), transparent);
        filter: blur(8px);
        z-index: 0;
        animation: flywheelCoreOrbit 9s linear infinite;
      }

      .page-four-core-plasma {
        position: absolute;
        inset: 1.05rem;
        z-index: 1;
        border-radius: 999px;
        background:
          radial-gradient(circle at 50% 50%, rgba(154,230,110,0.34), transparent 19%),
          radial-gradient(circle at 38% 58%, rgba(24,201,142,0.24), transparent 22%),
          radial-gradient(circle at 63% 39%, rgba(190,242,100,0.18), transparent 18%),
          #02110A;
        box-shadow: inset 0 0 36px rgba(154,230,110,0.18), 0 0 38px rgba(154,230,110,0.12);
        animation: flywheelCorePulse 2.7s ease-in-out infinite;
      }

      .page-four-core-plasma::before {
        content: "";
        position: absolute;
        left: 50%;
        top: 50%;
        height: 3px;
        width: 3px;
        border-radius: 999px;
        background: #BEF264;
        box-shadow:
          -26px -12px 0 rgba(190,242,100,0.9),
          22px -18px 0 rgba(45,212,191,0.78),
          28px 15px 0 rgba(190,242,100,0.82),
          -18px 24px 0 rgba(82,223,178,0.74),
          5px -30px 0 rgba(190,242,100,0.72),
          -30px 8px 0 rgba(45,212,191,0.62),
          13px 28px 0 rgba(190,242,100,0.76);
        filter: drop-shadow(0 0 8px rgba(190,242,100,0.72));
        transform: translate(-50%, -50%);
        animation: flywheelCoreFlicker 0.86s steps(2, end) infinite;
      }

      .page-four-core-plasma::after {
        content: "";
        position: absolute;
        inset: 13%;
        border-radius: 999px;
        background: conic-gradient(from 0deg, transparent, rgba(190,242,100,0.28), transparent 14%, rgba(45,212,191,0.22), transparent 38%, rgba(190,242,100,0.18), transparent 68%, rgba(45,212,191,0.16), transparent);
        filter: blur(3px);
        opacity: 0.72;
        animation: flywheelCoreOrbit 2.9s linear infinite reverse;
      }

      .page-four-core-spark {
        position: absolute;
        z-index: 3;
        left: 50%;
        top: 50%;
        height: 2px;
        width: var(--bolt-width, 2.8rem);
        border-radius: 999px;
        background: linear-gradient(90deg, rgba(190,242,100,0), rgba(190,242,100,0.98), rgba(45,212,191,0.70), rgba(190,242,100,0));
        box-shadow: 0 0 10px rgba(190,242,100,0.86), 0 0 24px rgba(24,201,142,0.38);
        opacity: 0;
        transform-origin: 0 50%;
        animation: flywheelCoreSpark 1.18s ease-out infinite;
      }

      .page-four-core-spark-a {
        --bolt-rotate: 18deg;
        --bolt-width: 3.15rem;
      }

      .page-four-core-spark-b {
        --bolt-rotate: 104deg;
        --bolt-width: 2.35rem;
        animation-delay: 0.18s;
      }

      .page-four-core-spark-c {
        --bolt-rotate: -42deg;
        --bolt-width: 2.85rem;
        animation-delay: 0.36s;
      }

      .page-four-core-spark-d {
        --bolt-rotate: 151deg;
        --bolt-width: 2.45rem;
        animation-delay: 0.54s;
      }

      .page-four-core-spark-e {
        --bolt-rotate: -118deg;
        --bolt-width: 3.05rem;
        animation-delay: 0.72s;
      }

      .page-four-core-spark-f {
        --bolt-rotate: 224deg;
        --bolt-width: 2.55rem;
        animation-delay: 0.9s;
      }

      .page-four-flywheel-node {
        --node-delay: 0s;
        --node-lead: 0.88s;
        position: absolute;
        overflow: visible;
        animation: flywheelNodeTrace 16s linear infinite;
        animation-delay: calc(var(--node-delay) - var(--node-lead));
      }

      .page-four-flywheel-node::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: -1px;
        border-radius: inherit;
        border: 1px solid rgba(154,230,110,0.0);
        background: radial-gradient(circle at 50% 50%, rgba(154,230,110,0.16), transparent 62%);
        opacity: 0;
        filter: blur(10px);
        animation: flywheelNodeTraceGlow 16s linear infinite;
        animation-delay: calc(var(--node-delay) - var(--node-lead));
      }

      .page-four-flywheel-node::after {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: linear-gradient(135deg, rgba(154,230,110,0.16), transparent 62%);
        opacity: 0;
        animation: flywheelNodeTraceFill 16s linear infinite;
        animation-delay: calc(var(--node-delay) - var(--node-lead));
      }

      .page-four-flywheel-node > * {
        position: relative;
        z-index: 2;
      }

      @keyframes flywheelLogoOrbit {
        to {
          transform: translate3d(-50%, -50%, 0) rotate(360deg);
        }
      }

      @keyframes flywheelLogoDust {
        0% {
          opacity: 0;
          transform: translate3d(5px, -1px, 0) scale(0.45);
        }
        22% {
          opacity: 0.9;
        }
        58% {
          opacity: 0.68;
          transform: translate3d(-16px, 5px, 0) scale(1);
        }
        100% {
          opacity: 0;
          transform: translate3d(-36px, 12px, 0) scale(0.24);
        }
      }

      @keyframes flywheelLogoFire {
        0% {
          opacity: 0.78;
          scale: 0.99 0.98;
        }
        48% {
          opacity: 0.9;
          scale: 1.03 1.01;
        }
        100% {
          opacity: 0.84;
          scale: 1.01 1.02;
        }
      }

      @keyframes flywheelLogoWisp {
        0% {
          opacity: 0.56;
          scale: 0.98 0.96;
        }
        52% {
          opacity: 0.76;
          scale: 1.04 1;
        }
        100% {
          opacity: 0.64;
          scale: 1.01 1.02;
        }
      }

      @keyframes flywheelLogoFlameLick {
        0% {
          opacity: 0.28;
          scale: 0.94 0.9;
        }
        50% {
          opacity: 0.72;
          scale: 1.08 1;
        }
        100% {
          opacity: 0.42;
          scale: 1.01 0.94;
        }
      }

      @keyframes flywheelCoreMatter {
        0%, 100% {
          transform: scale(0.92) rotate(0deg);
          opacity: 0.54;
        }
        50% {
          transform: scale(1.08) rotate(28deg);
          opacity: 0.92;
        }
      }

      @keyframes flywheelCoreOrbit {
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes flywheelCorePulse {
        0%, 100% {
          transform: scale(0.94);
          opacity: 0.86;
        }
        50% {
          transform: scale(1.035);
          opacity: 1;
        }
      }

      @keyframes flywheelCoreFlicker {
        0%, 100% {
          opacity: 0.42;
          transform: translate(-50%, -50%) rotate(0deg) scale(0.82);
        }
        25% {
          opacity: 1;
          transform: translate(-50%, -50%) rotate(12deg) scale(1.08);
        }
        50% {
          opacity: 0.58;
          transform: translate(-50%, -50%) rotate(-8deg) scale(0.94);
        }
        75% {
          opacity: 0.92;
          transform: translate(-50%, -50%) rotate(18deg) scale(1.14);
        }
      }

      @keyframes flywheelCoreSpark {
        0% {
          opacity: 0;
          transform: translate(0, -50%) rotate(var(--bolt-rotate, 0deg)) scaleX(0.04);
        }
        18% {
          opacity: 1;
        }
        54% {
          opacity: 0.9;
          transform: translate(0, -50%) rotate(var(--bolt-rotate, 0deg)) scaleX(1);
        }
        100% {
          opacity: 0;
          transform: translate(0, -50%) rotate(var(--bolt-rotate, 0deg)) scaleX(0.08);
        }
      }

      @keyframes flywheelNodeTrace {
        0% {
          border-color: rgba(154,230,110,0.84);
          box-shadow: 0 16px 42px rgba(154,230,110,0.20), 0 0 26px rgba(154,230,110,0.27);
        }
        2.2% {
          border-color: rgba(190,242,100,0.92);
          box-shadow: 0 16px 42px rgba(154,230,110,0.25), 0 0 30px rgba(190,242,100,0.32);
        }
        8.5% {
          border-color: rgba(154,230,110,0.72);
          box-shadow: 0 16px 42px rgba(154,230,110,0.16), 0 0 20px rgba(154,230,110,0.20);
        }
        12%, 100% {
          border-color: rgba(11,59,43,1);
          box-shadow: 0 14px 34px rgba(0,0,0,0.22);
        }
      }

      @keyframes flywheelNodeTraceGlow {
        0% {
          opacity: 0.68;
        }
        2.2% {
          opacity: 1;
        }
        8.5% {
          opacity: 0.58;
        }
        12%, 100% {
          opacity: 0;
        }
      }

      @keyframes flywheelNodeTraceFill {
        0% {
          opacity: 0.36;
        }
        2.2% {
          opacity: 0.64;
        }
        8.5% {
          opacity: 0.46;
        }
        12%, 100% {
          opacity: 0;
        }
      }

      @media (max-width: 639px) {
        .page-four-flywheel-node {
          width: 5.7rem;
          padding: 0.48rem 0.55rem 0.52rem;
          border-radius: 0.82rem;
        }

        .page-four-flywheel-node[data-step="01"] {
          left: 50%;
          top: 8%;
        }

        .page-four-flywheel-node[data-step="02"] {
          left: 84%;
          top: 39%;
        }

        .page-four-flywheel-node[data-step="03"] {
          left: 72%;
          top: 84%;
        }

        .page-four-flywheel-node[data-step="04"] {
          left: 28%;
          top: 84%;
        }

        .page-four-flywheel-node[data-step="05"] {
          left: 16%;
          top: 39%;
        }

        .page-four-flywheel-node > div:first-child {
          height: 1.26rem;
          width: 1.26rem;
          margin-top: -1rem;
          font-size: 0.54rem;
        }

        .page-four-flywheel-node p {
          margin-top: 0.32rem;
          font-size: 0.54rem;
          line-height: 0.72rem;
        }

        .page-four-flywheel-core p {
          font-size: 0.82rem;
        }
      }
    `}</style>
  );
}

type OverviewTone = "emerald" | "cyan" | "gold" | "orange" | "violet";

type OverviewNode = {
  label: string;
  icon: LucideIcon;
  badge?: string;
  tone: OverviewTone;
};

const OVERVIEW_TONES: Record<
  OverviewTone,
  {
    accent: string;
    border: string;
    soft: string;
    glow: string;
    strong: string;
    iconBg: string;
  }
> = {
  emerald: {
    accent: "#52DFB2",
    border: "rgba(82,223,178,0.2)",
    soft: "rgba(24,201,142,0.07)",
    glow: "rgba(82,223,178,0.17)",
    strong: "rgba(24,201,142,0.12)",
    iconBg: "rgba(24,201,142,0.07)",
  },
  cyan: {
    accent: "#22D3EE",
    border: "rgba(34,211,238,0.2)",
    soft: "rgba(34,211,238,0.06)",
    glow: "rgba(34,211,238,0.14)",
    strong: "rgba(14,165,233,0.1)",
    iconBg: "rgba(34,211,238,0.06)",
  },
  gold: {
    accent: "#FDE68A",
    border: "rgba(253,224,71,0.24)",
    soft: "rgba(245,158,11,0.07)",
    glow: "rgba(253,224,71,0.16)",
    strong: "rgba(245,158,11,0.11)",
    iconBg: "rgba(245,158,11,0.07)",
  },
  orange: {
    accent: "#FDBA74",
    border: "rgba(251,146,60,0.24)",
    soft: "rgba(249,115,22,0.07)",
    glow: "rgba(251,146,60,0.16)",
    strong: "rgba(234,88,12,0.12)",
    iconBg: "rgba(249,115,22,0.07)",
  },
  violet: {
    accent: "#A78BFA",
    border: "rgba(167,139,250,0.24)",
    soft: "rgba(124,58,237,0.07)",
    glow: "rgba(167,139,250,0.16)",
    strong: "rgba(124,58,237,0.12)",
    iconBg: "rgba(124,58,237,0.07)",
  },
};

function overviewToneStyle(tone: OverviewTone): React.CSSProperties {
  const palette = OVERVIEW_TONES[tone];

  return {
    "--overview-card-accent": palette.accent,
    "--overview-card-border": palette.border,
    "--overview-card-soft": palette.soft,
    "--overview-card-glow-tone": palette.glow,
    "--overview-card-strong": palette.strong,
    "--overview-card-icon-bg": palette.iconBg,
    "--overview-final-card-border": palette.border,
    "--overview-final-card-glow": palette.glow,
    "--overview-final-card-strong": palette.strong,
  } as React.CSSProperties;
}

const OVERVIEW_INPUTS: OverviewNode[] = [
  { label: "Platforms", icon: PanelTop, tone: "cyan" },
  { label: "Protocols", icon: Blocks, tone: "emerald" },
  { label: "DEXs", icon: ExternalLink, tone: "cyan" },
  { label: "Apps", icon: Smartphone, tone: "emerald" },
  { label: "Boards", icon: LayoutDashboard, tone: "gold" },
  { label: "AI Agents", icon: Bot, badge: "NEW", tone: "violet" },
];

const OVERVIEW_OUTPUTS: OverviewNode[] = [
  { label: "Programmable Tokens", icon: SlidersHorizontal, tone: "gold" },
  { label: "Revenue Routing", icon: TrendingUp, tone: "cyan" },
  { label: "Rewards", icon: Coins, tone: "gold" },
  { label: "Buybacks & Burns", icon: Flame, tone: "orange" },
  { label: "Liquidity", icon: Droplets, tone: "cyan" },
  { label: "Custom Programmable Routes", icon: FilePenLine, tone: "violet" },
];

const OVERVIEW_RESOURCES = [
  {
    label: "Boards",
    href: "https://basedinc.gitbook.io/basedbid/explainers/launch-explainers/what-is-a-board",
    icon: LayoutDashboard,
    tone: "gold",
  },
  {
    label: "Fee Builder",
    href: "https://basedinc.gitbook.io/basedbid/explainers/launch-explainers/fee-builder",
    icon: SlidersHorizontal,
    tone: "emerald",
  },
  {
    label: "Flash Tokens",
    href: "https://basedinc.gitbook.io/basedbid/explainers/launch-explainers/what-is-a-flash-token",
    icon: Rocket,
    tone: "cyan",
  },
  {
    label: "SDK/API",
    href: "https://basedinc.gitbook.io/basedbid/sdk",
    icon: Code2,
    tone: "violet",
  },
] as const;

const OVERVIEW_BRANCHES: Array<{
  d: string;
  gradient: "overviewElectricLeft" | "overviewElectricRight";
  endX: number;
  endY: number;
  nodeX: number;
  nodeY: number;
  step: number;
}> = [
  { d: "M524 102 C440 92 330 38 220 31", gradient: "overviewElectricLeft", endX: 220, endY: 31, nodeX: 524, nodeY: 102, step: 0 },
  { d: "M492 154 C404 148 305 110 220 105", gradient: "overviewElectricLeft", endX: 220, endY: 105, nodeX: 492, nodeY: 154, step: 2 },
  { d: "M468 214 C382 206 300 184 220 179", gradient: "overviewElectricLeft", endX: 220, endY: 179, nodeX: 468, nodeY: 214, step: 4 },
  { d: "M468 260 C382 260 300 254 220 253", gradient: "overviewElectricLeft", endX: 220, endY: 253, nodeX: 468, nodeY: 260, step: 6 },
  { d: "M492 320 C404 326 305 330 220 327", gradient: "overviewElectricLeft", endX: 220, endY: 327, nodeX: 492, nodeY: 320, step: 8 },
  { d: "M524 372 C440 386 330 400 220 401", gradient: "overviewElectricLeft", endX: 220, endY: 401, nodeX: 524, nodeY: 372, step: 10 },
  { d: "M676 102 C760 92 870 38 980 31", gradient: "overviewElectricRight", endX: 980, endY: 31, nodeX: 676, nodeY: 102, step: 1 },
  { d: "M708 154 C796 148 895 110 980 105", gradient: "overviewElectricRight", endX: 980, endY: 105, nodeX: 708, nodeY: 154, step: 3 },
  { d: "M732 214 C818 206 900 184 980 179", gradient: "overviewElectricRight", endX: 980, endY: 179, nodeX: 732, nodeY: 214, step: 5 },
  { d: "M732 260 C818 260 900 254 980 253", gradient: "overviewElectricRight", endX: 980, endY: 253, nodeX: 732, nodeY: 260, step: 7 },
  { d: "M708 320 C796 326 895 330 980 327", gradient: "overviewElectricRight", endX: 980, endY: 327, nodeX: 708, nodeY: 320, step: 9 },
  { d: "M676 372 C760 386 870 400 980 401", gradient: "overviewElectricRight", endX: 980, endY: 401, nodeX: 676, nodeY: 372, step: 11 },
];

const OVERVIEW_ROUNDS = 1;
const OVERVIEW_TOTAL_CHARGE_STEPS = OVERVIEW_BRANCHES.length * OVERVIEW_ROUNDS;
const OVERVIEW_STEP_MS = 620;
const OVERVIEW_SEQUENCE_MS = OVERVIEW_TOTAL_CHARGE_STEPS * OVERVIEW_STEP_MS;
const OVERVIEW_RANDOM_STEP_MS = 540;
const OVERVIEW_FINAL_RAMP_MS = OVERVIEW_BRANCHES.length * OVERVIEW_RANDOM_STEP_MS + 1200;
const OVERVIEW_CHARGE_MS = OVERVIEW_SEQUENCE_MS + OVERVIEW_FINAL_RAMP_MS;
const OVERVIEW_START_ENERGY = 0.26;

function scaleEnergy(progress: number, max: number) {
  return OVERVIEW_START_ENERGY + (max - OVERVIEW_START_ENERGY) * progress;
}

function createOverviewActivationOrder() {
  const order = OVERVIEW_BRANCHES.map((branch) => branch.step);

  for (let i = order.length - 1; i > 0; i -= 1) {
    let randomValue = Math.random();

    if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
      const buffer = new Uint32Array(1);
      crypto.getRandomValues(buffer);
      randomValue = buffer[0] / 4294967296;
    }

    const swapIndex = Math.floor(randomValue * (i + 1));
    [order[i], order[swapIndex]] = [order[swapIndex], order[i]];
  }

  return order;
}

type OverviewPoint = { x: number; y: number };
type OverviewRgb = { r: number; g: number; b: number };
type OverviewBranchBolt = {
  points: OverviewPoint[];
  alpha: number;
  born: number;
  ttl: number;
  width: number;
};
type OverviewBranchSpark = {
  x: number;
  y: number;
  alpha: number;
  born: number;
  ttl: number;
  size: number;
};
type OverviewCardParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  ttl: number;
  size: number;
  phase: number;
};
const OVERVIEW_TONE_RGB: Record<OverviewTone, OverviewRgb> = {
  emerald: { r: 52, g: 211, b: 153 },
  cyan: { r: 34, g: 211, b: 238 },
  gold: { r: 253, g: 224, b: 138 },
  orange: { r: 251, g: 146, b: 60 },
  violet: { r: 167, g: 139, b: 250 },
};

function overviewRgba(rgb: OverviewRgb, alpha: number) {
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function overviewStringSeed(value: string) {
  let hash = 2166136261;

  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

class OverviewRng {
  private seed: number;

  constructor(seed = 1) {
    this.seed = seed >>> 0;
  }

  next() {
    this.seed = (1664525 * this.seed + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }

  range(min: number, max: number) {
    return min + (max - min) * this.next();
  }
}

function overviewBranchNumbers(branch: (typeof OVERVIEW_BRANCHES)[number]) {
  return branch.d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
}

function overviewBezierPoint(values: number[], t: number): OverviewPoint {
  const [x0, y0, x1, y1, x2, y2, x3, y3] = values;
  const nt = 1 - t;

  return {
    x: nt ** 3 * x0 + 3 * nt ** 2 * t * x1 + 3 * nt * t ** 2 * x2 + t ** 3 * x3,
    y: nt ** 3 * y0 + 3 * nt ** 2 * t * y1 + 3 * nt * t ** 2 * y2 + t ** 3 * y3,
  };
}

function overviewBezierNormal(values: number[], t: number): OverviewPoint {
  const [x0, y0, x1, y1, x2, y2, x3, y3] = values;
  const nt = 1 - t;
  const dx =
    3 * nt ** 2 * (x1 - x0) +
    6 * nt * t * (x2 - x1) +
    3 * t ** 2 * (x3 - x2);
  const dy =
    3 * nt ** 2 * (y1 - y0) +
    6 * nt * t * (y2 - y1) +
    3 * t ** 2 * (y3 - y2);
  const length = Math.max(1, Math.hypot(dx, dy));

  return { x: -dy / length, y: dx / length };
}

function overviewStrokeCanvasPath(ctx: CanvasRenderingContext2D, points: OverviewPoint[]) {
  if (points.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
}

function overviewLightningPoints(
  branch: (typeof OVERVIEW_BRANCHES)[number],
  time: number,
  variant: number,
  start = 0,
  end = 1,
) {
  const values = overviewBranchNumbers(branch);
  const rng = new OverviewRng(Math.floor(time / 54) * 97 + branch.step * 311 + variant * 701);
  const span = Math.max(0.08, end - start);
  const segments = Math.max(9, Math.round(span * rng.range(18, variant === 0 ? 26 : 22)));
  const points: OverviewPoint[] = [];
  let offset = rng.range(-3, 3);
  let drift = rng.range(-1, 1);

  for (let i = 0; i <= segments; i += 1) {
    const localT = i / segments;
    const t = start + (end - start) * localT;
    const p = overviewBezierPoint(values, t);
    const n = overviewBezierNormal(values, t);
    const envelope = Math.sin(localT * Math.PI);
    const snap = rng.next() > 0.74 ? rng.range(-1, 1) * (variant === 0 ? 17 : 11) : rng.range(-1, 1) * 4.2;
    const tension = rng.next() > 0.58 ? rng.range(-1, 1) * 3.4 : 0;
    drift = drift * 0.7 + rng.range(-1, 1) * 0.3;
    offset = Math.max(-23, Math.min(23, offset * 0.62 + snap + drift * 5.4 + tension));
    const pointOffset = i === 0 || i === segments ? 0 : offset * envelope;

    points.push({
      x: p.x + n.x * pointOffset,
      y: p.y + n.y * pointOffset,
    });
  }

  return points;
}

function overviewLightningSpan(
  branch: (typeof OVERVIEW_BRANCHES)[number],
  time: number,
  index: number,
) {
  const rng = new OverviewRng(Math.floor(time / 72) * 193 + branch.step * 977 + index * 1709);
  const mode = rng.next();

  if (mode < 0.18) {
    const end = rng.range(0.42, 0.76);
    return { start: rng.range(0, 0.04), end, variant: index, alpha: rng.range(0.5, 0.76) };
  }

  if (mode > 0.78) {
    const start = rng.range(0.24, 0.42);
    return { start, end: rng.range(0.96, 1), variant: index, alpha: rng.range(0.48, 0.72) };
  }

  return {
    start: rng.range(0, 0.08),
    end: rng.range(0.82, 1),
    variant: index,
    alpha: rng.range(0.58, 0.9),
  };
}

function OverviewBranchElectricCanvas({
  progress,
  activeSteps,
}: {
  progress: number;
  activeSteps: number[];
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const progressRef = useRef(progress);
  const activeStepsRef = useRef(new Set(activeSteps));

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    activeStepsRef.current = new Set(activeSteps);
  }, [activeSteps]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return undefined;

    let raf = 0;
    let width = 1;
    let height = 1;
    let bolts: OverviewBranchBolt[] = [];
    let sparks: OverviewBranchSpark[] = [];
    let lastBoltSpawn = -999;
    let nextBoltSpawnAt = 0;
    let lastSparkSpawn = -999;
    const dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time: number) => {
      const alpha = Math.max(0, Math.min(1, progressRef.current));
      ctx.clearRect(0, 0, width, height);

      if (alpha > 0.01) {
        const sx = width / 1200;
        const sy = height / 520;
        const scaled = (points: OverviewPoint[]) => points.map((p) => ({ x: p.x * sx, y: p.y * sy }));
        const branchAlpha = alpha * 0.88;

        if (time >= nextBoltSpawnAt) {
          const spawnRng = new OverviewRng(Math.floor(time / 64) * 4099 + Math.floor(time - lastBoltSpawn));

          OVERVIEW_BRANCHES.forEach((branch) => {
            if (!activeStepsRef.current.has(branch.step)) return;
            if (spawnRng.next() < 0.38) return;

            const boltCount = spawnRng.next() > 0.96 ? 2 : 1;
            for (let i = 0; i < boltCount; i += 1) {
              const span = overviewLightningSpan(branch, time + i * 71, i);
              bolts.push({
                points: overviewLightningPoints(branch, time + i * 83, span.variant, span.start, span.end),
                alpha: span.alpha * spawnRng.range(0.78, 1),
                born: time,
                ttl: spawnRng.range(118, 238),
                width: spawnRng.range(0.86, 1.22),
              });
            }
          });

          bolts = bolts.slice(-16);
          lastBoltSpawn = time;
          nextBoltSpawnAt = time + spawnRng.range(92, 146);
        }

        if (time - lastSparkSpawn > 132) {
          const sparkRng = new OverviewRng(Math.floor(time / 82) * 5227);
          const liveBolts = bolts.filter((bolt) => time - bolt.born < bolt.ttl);

          for (let i = 0; i < Math.min(4, liveBolts.length); i += 1) {
            const bolt = liveBolts[Math.floor(sparkRng.range(0, liveBolts.length))];
            const point = bolt.points[Math.floor(sparkRng.range(1, Math.max(2, bolt.points.length - 1)))];
            if (!point) continue;

            sparks.push({
              x: point.x,
              y: point.y,
              alpha: sparkRng.range(0.32, 0.72),
              born: time,
              ttl: sparkRng.range(120, 250),
              size: sparkRng.range(1, 2.2),
            });
          }

          sparks = sparks.slice(-16);
          lastSparkSpawn = time;
        }

        bolts = bolts.filter((bolt) => time - bolt.born < bolt.ttl);
        sparks = sparks.filter((spark) => time - spark.born < spark.ttl);

        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalCompositeOperation = "screen";

        bolts.forEach((bolt) => {
          const life = 1 - (time - bolt.born) / bolt.ttl;
          const birth = Math.min(1, (time - bolt.born) / 18);
          const spanAlpha = branchAlpha * bolt.alpha * birth * Math.sin(Math.max(0, life) * Math.PI);
          const points = scaled(bolt.points);

          ctx.shadowColor = "rgba(82, 223, 178, 0.88)";
          ctx.shadowBlur = 15;
          ctx.strokeStyle = `rgba(82, 223, 178, ${0.12 * spanAlpha})`;
          ctx.lineWidth = 5.8 * bolt.width;
          overviewStrokeCanvasPath(ctx, points);

          ctx.shadowBlur = 10;
          ctx.strokeStyle = `rgba(82, 223, 178, ${0.56 * spanAlpha})`;
          ctx.lineWidth = 1.9 * bolt.width;
          overviewStrokeCanvasPath(ctx, points);

          ctx.shadowBlur = 3;
          ctx.strokeStyle = `rgba(234, 255, 246, ${0.68 * spanAlpha})`;
          ctx.lineWidth = 0.58 * bolt.width;
          overviewStrokeCanvasPath(ctx, points);
        });

        sparks.forEach((spark) => {
          const life = 1 - (time - spark.born) / spark.ttl;
          const x = spark.x * sx;
          const y = spark.y * sy;

          ctx.shadowColor = "rgba(82, 223, 178, 0.92)";
          ctx.shadowBlur = 10;
          ctx.fillStyle = `rgba(167, 243, 208, ${spark.alpha * life * branchAlpha})`;
          ctx.beginPath();
          ctx.arc(x, y, spark.size * life, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.restore();
      }

      raf = window.requestAnimationFrame(draw);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    raf = window.requestAnimationFrame(draw);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="overview-branch-electric-canvas" aria-hidden="true" />;
}

function OverviewCardCoreParticles({ seedKey, tone = "emerald" }: { seedKey: string; tone?: OverviewTone }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const instanceSeed = useMemo(() => overviewStringSeed(seedKey), [seedKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return undefined;

    let raf = 0;
    let width = 1;
    let height = 1;
    let particles: OverviewCardParticle[] = [];
    const accentRgb = OVERVIEW_TONE_RGB[tone];
    const dpr = Math.min(window.devicePixelRatio || 1, 1.2);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frameInterval = reducedMotion ? 100 : 1000 / 30;
    let lastDrawTime = 0;
    let spawnAccumulator = 0;
    const liveRng = new OverviewRng(
      (instanceSeed ^
        Math.floor(performance.now() * 997) ^
        Math.floor(Math.random() * 1_000_000_000)) >>>
        0,
    );

    const makeParticle = (rng: OverviewRng, initial = false): OverviewCardParticle => {
      const angle = rng.range(0, Math.PI * 2);
      const speed = rng.range(0.3, 1.05);
      const ttl = rng.range(52, 104);

      return {
        x: rng.range(width * 0.08, width * 0.96),
        y: rng.range(height * 0.16, height * 0.84),
        vx: Math.cos(angle) * speed + rng.range(-0.08, 0.08),
        vy: Math.sin(angle) * speed + rng.range(-0.08, 0.08),
        age: initial ? rng.range(0, ttl * 0.72) : 0,
        ttl,
        size: rng.range(0.75, 1.9),
        phase: rng.range(0, Math.PI * 2),
      };
    };

    const seedParticles = () => {
      particles = Array.from({ length: reducedMotion ? 5 : 18 }, () => makeParticle(liveRng, true));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedParticles();
    };

    const draw = (time: number) => {
      if (lastDrawTime > 0 && time - lastDrawTime < frameInterval) {
        raf = window.requestAnimationFrame(draw);
        return;
      }

      const frameScale = lastDrawTime > 0 ? Math.min(2.5, (time - lastDrawTime) / (1000 / 60)) : 1;
      lastDrawTime = time;
      spawnAccumulator += frameScale;
      ctx.clearRect(0, 0, width, height);

      const spawnEvery = reducedMotion ? 16 : 7;

      if (spawnAccumulator >= spawnEvery) {
        const spawnCount = reducedMotion ? 1 : 2;
        for (let i = 0; i < spawnCount; i += 1) {
          particles.push(makeParticle(liveRng, false));
        }
        spawnAccumulator %= spawnEvery;
      }

      particles = particles
        .filter((particle) => {
          particle.age += frameScale;
          const centerX = width * 0.58;
          const centerY = height * 0.54;
          particle.vx += Math.sin((time + particle.age * 17) * 0.009 + particle.phase) * 0.012 * frameScale;
          particle.vy += Math.cos((time + particle.age * 13) * 0.008 + particle.phase) * 0.01 * frameScale;
          particle.vx += (centerX - particle.x) * 0.000012 * frameScale;
          particle.vy += (centerY - particle.y) * 0.00001 * frameScale;
          particle.x += particle.vx * frameScale;
          particle.y += particle.vy * frameScale;
          particle.vx *= Math.pow(0.972, frameScale);
          particle.vy *= Math.pow(0.974, frameScale);

          return particle.age < particle.ttl;
        })
        .slice(-34);

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      particles.forEach((particle) => {
        const progress = particle.age / particle.ttl;
        const fadeIn = overviewSmoothstep(0, 0.12, progress);
        const fadeOut = 1 - overviewSmoothstep(0.72, 1, progress);
        const life = fadeIn * fadeOut;
        const radius = particle.size * Math.max(0.18, life);

        ctx.fillStyle = overviewRgba(accentRgb, life * 0.78);
        ctx.shadowColor = overviewRgba(accentRgb, life * 0.42);
        ctx.shadowBlur = 2.5;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      raf = window.requestAnimationFrame(draw);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    raf = window.requestAnimationFrame(draw);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(raf);
    };
  }, [instanceSeed, tone]);

  return <canvas className="overview-card-particles" ref={canvasRef} aria-hidden="true" />;
}

const OVERVIEW_BURN_EMBERS = [
  { x: 0.2, y: 0.92, s: 3.4, dx: 5.2, dy: -27, delay: 0, seed: 13 },
  { x: 0.31, y: 0.86, s: 3.8, dx: -3.4, dy: -32, delay: 330, seed: 41 },
  { x: 0.43, y: 0.94, s: 4.1, dx: 4.6, dy: -29, delay: 720, seed: 73 },
  { x: 0.55, y: 0.84, s: 3.6, dx: -4.8, dy: -30, delay: 1080, seed: 107 },
  { x: 0.66, y: 0.9, s: 3.9, dx: 3.2, dy: -34, delay: 1480, seed: 149 },
  { x: 0.77, y: 0.82, s: 3.3, dx: -2.8, dy: -28, delay: 1860, seed: 181 },
  { x: 0.88, y: 0.93, s: 3.7, dx: 2.4, dy: -31, delay: 2240, seed: 223 },
  { x: 0.95, y: 0.87, s: 3.1, dx: -6.2, dy: -26, delay: 2620, seed: 257 },
] as const;

function overviewSmoothstep(edge0: number, edge1: number, value: number) {
  const x = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return x * x * (3 - 2 * x);
}

function OverviewBurnCardEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const burnCanvas = canvas;
    const ctx = burnCanvas.getContext("2d");

    if (!ctx) {
      return;
    }

    const renderCtx = ctx;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const burnDuration = reducedMotion ? 8200 : 6200;
    const frameInterval = reducedMotion ? 100 : 1000 / 30;
    let lastDrawTime = 0;

    function resize() {
      const rect = burnCanvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.35);
      burnCanvas.width = Math.round(width * dpr);
      burnCanvas.height = Math.round(height * dpr);
      renderCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function burnNoise(seed: number, index: number, salt = 0) {
      const raw = Math.sin(seed * 12.9898 + index * 78.233 + salt * 37.719) * 43758.5453;
      return raw - Math.floor(raw);
    }

    function drawBurnAshPiece(
      x: number,
      y: number,
      size: number,
      angle: number,
      seed: number,
      fill: string,
      edge: string,
      alpha: number,
      edgeAlpha: number,
      erode: number,
      time: number,
    ) {
      const points = 9;
      const localPoints: OverviewPoint[] = [];

      renderCtx.save();
      renderCtx.globalAlpha = alpha;
      renderCtx.translate(x, y);
      renderCtx.rotate(angle);
      renderCtx.scale(1.12, 0.86);
      renderCtx.beginPath();

      for (let i = 0; i < points; i += 1) {
        const pointAngle = (i / points) * Math.PI * 2;
        const wobble =
          0.76 +
          Math.sin(seed * 0.43 + i * 1.87) * 0.13 +
          Math.cos(seed * 0.31 + i * 2.19) * 0.1;
        const pointRadius = size * wobble * (1 - erode * 0.18);
        localPoints.push({
          x: Math.cos(pointAngle) * pointRadius,
          y: Math.sin(pointAngle) * pointRadius,
        });
      }

      localPoints.forEach((point, index) => {
        if (index === 0) {
          renderCtx.moveTo(point.x, point.y);
        } else {
          renderCtx.lineTo(point.x, point.y);
        }
      });

      renderCtx.closePath();
      renderCtx.fillStyle = fill;
      renderCtx.fill();

      renderCtx.globalCompositeOperation = "screen";
      renderCtx.lineWidth = Math.max(1, size * 0.26);
      renderCtx.strokeStyle = edge;
      renderCtx.shadowColor = "rgba(251, 146, 60, 0.62)";
      renderCtx.shadowBlur = 7;

      for (let i = 0; i < points; i += 1) {
        const current = localPoints[i];
        const next = localPoints[(i + 1) % points];
        const flicker = burnNoise(seed, i, Math.floor(time / 92));
        const segmentLife = Math.max(0, 1 - erode * 0.86);
        const alive = flicker > erode * 0.7;

        if (!alive && erode > 0.24) {
          continue;
        }

        const startT = burnNoise(seed, i, 3) * 0.22;
        const endT = Math.min(1, 0.76 + burnNoise(seed, i, 7) * 0.24);
        const sx = current.x + (next.x - current.x) * startT;
        const sy = current.y + (next.y - current.y) * startT;
        const ex = current.x + (next.x - current.x) * endT;
        const ey = current.y + (next.y - current.y) * endT;

        renderCtx.globalAlpha = edgeAlpha * (0.35 + flicker * 0.65) * segmentLife;
        renderCtx.beginPath();
        renderCtx.moveTo(sx, sy);
        renderCtx.lineTo(ex, ey);
        renderCtx.stroke();
      }

      if (erode > 0.18) {
        renderCtx.globalCompositeOperation = "source-over";
        renderCtx.globalAlpha = alpha * erode * 0.32;
        renderCtx.fillStyle = "rgba(10, 10, 9, 0.82)";
        for (let i = 0; i < 3; i += 1) {
          const holeAngle = seed * 0.09 + i * 2.1;
          renderCtx.beginPath();
          renderCtx.ellipse(
            Math.cos(holeAngle) * size * 0.32 * erode,
            Math.sin(holeAngle) * size * 0.22 * erode,
            size * (0.16 + i * 0.035) * erode,
            size * (0.08 + i * 0.025) * erode,
            holeAngle,
            0,
            Math.PI * 2,
          );
          renderCtx.fill();
        }
      }

      renderCtx.shadowBlur = 0;
      renderCtx.restore();
    }

    function drawAshMicroCloud(
      x: number,
      y: number,
      size: number,
      angle: number,
      seed: number,
      phase: number,
      dissolve: number,
      emberDx: number,
      emberDy: number,
      windAngle: number,
      windStrength: number,
      lift: number,
      time: number,
    ) {
      if (dissolve <= 0.02) {
        return;
      }

      const count = reducedMotion ? 30 : 108;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const tailLength = 0.68 + dissolve * 0.82;

      for (let i = 0; i < count; i += 1) {
        const birth = 0.18 + burnNoise(seed, i, 11) * 0.42;
        const death = 0.68 + burnNoise(seed, i, 17) * 0.22;
        const life = overviewSmoothstep(birth, birth + 0.2, phase) * (1 - overviewSmoothstep(death, 1, phase));

        if (life <= 0.01) {
          continue;
        }

        const theta = burnNoise(seed, i, 23) * Math.PI * 2;
        const radius = Math.sqrt(burnNoise(seed, i, 29)) * size * 1.05;
        const localX = Math.cos(theta) * radius * 1.18;
        const localY = Math.sin(theta) * radius * 0.82;
        const worldX = localX * cos - localY * sin;
        const worldY = localX * sin + localY * cos;
        const particleLife = overviewSmoothstep(birth, death, phase);
        const outward = particleLife * particleLife;
        const drift = (0.55 + burnNoise(seed, i, 31) * 2.6) * outward;
        const localWindAngle = windAngle + (burnNoise(seed, i, 37) - 0.5) * 1.35 + Math.sin(time * 0.0007 + i) * 0.18;
        const fragmentAngle = theta + angle + (burnNoise(seed, i, 41) - 0.5) * 1.1;
        const windX =
          emberDx * outward * 0.16 +
          Math.cos(localWindAngle) * windStrength * outward * 0.58 +
          Math.cos(fragmentAngle) * drift +
          Math.sin(time * 0.001 + i) * 0.22;
        const windY =
          emberDy * outward * 0.08 +
          Math.sin(localWindAngle) * windStrength * outward * 0.5 +
          Math.sin(fragmentAngle) * drift * 0.46 -
          outward * (0.18 + burnNoise(seed, i, 43) * 0.7);
        const trailProgress = burnNoise(seed, i, 71) * tailLength * Math.max(0.12, lift);
        const trailX = -emberDx * trailProgress * 0.82 - Math.cos(windAngle) * windStrength * trailProgress * 0.18;
        const trailY = -emberDy * trailProgress * 0.72 - Math.sin(windAngle) * windStrength * trailProgress * 0.12;
        const particleX = x + worldX * (1 - particleLife * 0.5) + windX + trailX;
        const particleY = y + worldY * (1 - particleLife * 0.5) + windY + trailY;
        const hotChance = burnNoise(seed, i, 47);
        const isHot = hotChance > 0.9 && particleLife < 0.42;
        const traceBoost = 0.3 + dissolve * 0.7;
        const alpha = life * (isHot ? 0.32 : 0.24) * (0.18 + traceBoost * 0.34);
        const particleSize = (isHot ? 0.54 : 0.44) + burnNoise(seed, i, 53) * (isHot ? 0.46 : 0.36);
        const particleSpin = (burnNoise(seed, i, 59) - 0.5) * 4.6;

        renderCtx.save();
        renderCtx.globalCompositeOperation = "screen";
        renderCtx.globalAlpha = alpha;
        renderCtx.translate(particleX, particleY);
        renderCtx.rotate(theta + particleLife * particleSpin);
        renderCtx.fillStyle = isHot ? "rgba(251, 146, 60, 0.58)" : "rgba(245, 158, 11, 0.28)";
        renderCtx.shadowColor = isHot ? "rgba(251, 146, 60, 0.34)" : "rgba(249, 115, 22, 0.2)";
        renderCtx.shadowBlur = isHot ? 2.5 : 1.4;
        renderCtx.beginPath();
        renderCtx.ellipse(0, 0, particleSize, particleSize * (0.38 + burnNoise(seed, i, 67) * 0.34), 0, 0, Math.PI * 2);
        renderCtx.fill();
        renderCtx.restore();
      }
    }

    function draw(time: number) {
      if (lastDrawTime > 0 && time - lastDrawTime < frameInterval) {
        raf = window.requestAnimationFrame(draw);
        return;
      }

      lastDrawTime = time;
      renderCtx.clearRect(0, 0, width, height);
      renderCtx.save();

      const warmth = renderCtx.createRadialGradient(width * 0.74, height * 0.5, 0, width * 0.74, height * 0.5, width * 0.42);
      warmth.addColorStop(0, "rgba(251, 146, 60, 0.055)");
      warmth.addColorStop(0.38, "rgba(249, 115, 22, 0.022)");
      warmth.addColorStop(1, "rgba(249, 115, 22, 0)");
      renderCtx.fillStyle = warmth;
      renderCtx.fillRect(0, 0, width, height);

      OVERVIEW_BURN_EMBERS.forEach((ember, emberIndex) => {
        const cycle = Math.floor((time + ember.delay) / burnDuration);
        const cycleSeed = ember.seed + cycle * 4099;
        const phase = ((time + ember.delay) % burnDuration) / burnDuration;
        const ignite = overviewSmoothstep(0.03, 0.16, phase);
        const lift = overviewSmoothstep(0.1, 0.78, phase);
        const burn = overviewSmoothstep(0.16, 0.68, phase);
        const dissolve = overviewSmoothstep(0.22, 0.98, phase);
        const bodyFade = overviewSmoothstep(0.64, 0.99, phase);
        const edgeFade = overviewSmoothstep(0.8, 0.99, phase);
        const emberAlpha = Math.max(0, ignite * (1 - bodyFade) * 0.88);
        const edgeAlpha = Math.max(0, ignite * (0.28 + burn * 0.64) * (1 - edgeFade));
        const slotCount = OVERVIEW_BURN_EMBERS.length;
        const slotIndex = (emberIndex * 5 + cycle * 3) % slotCount;
        const slotWidth = 0.86 / slotCount;
        const slotJitter = (burnNoise(cycleSeed, 9) - 0.5) * slotWidth * 0.58;
        const baseX = width * (0.07 + slotWidth * (slotIndex + 0.5) + slotJitter);
        const baseY = height * (0.8 + burnNoise(cycleSeed, 2) * 0.16);
        const pathDx = (burnNoise(cycleSeed, 3) - 0.5) * 16;
        const pathDy = -(24 + burnNoise(cycleSeed, 4) * 18);
        const windAngle = -Math.PI / 2 + (burnNoise(cycleSeed, 6) - 0.5) * 1.35;
        const windStrength = 2.4 + burnNoise(cycleSeed, 7) * 7.2;
        const driftX =
          pathDx * lift +
          Math.cos(windAngle) * windStrength * lift * 0.42 +
          Math.sin(time * 0.001 + cycleSeed) * 0.45;
        const driftY =
          pathDy * lift +
          Math.sin(windAngle) * windStrength * lift * 0.28 +
          Math.cos(time * 0.0009 + cycleSeed) * 0.36;
        const x = baseX + driftX;
        const y = baseY + driftY;
        const size = ember.s * (0.68 + burnNoise(cycleSeed, 5) * 0.28 + ignite * 0.1) * (1 - dissolve * 0.18);
        const spin = (burnNoise(cycleSeed, 8) - 0.5) * 1.65;
        const angle = cycleSeed * 0.08 + Math.sin(time * 0.0007 + cycleSeed) * 0.08 + lift * spin + dissolve * 0.18;

        if (emberAlpha > 0.01) {
          const warmth = 1 - burn * 0.72;
          const fill = `rgba(${Math.round(34 + warmth * 24)}, ${Math.round(34 + warmth * 20)}, ${Math.round(32 + warmth * 16)}, ${0.74 + emberAlpha * 0.18})`;
          const edge = `rgba(251, ${Math.round(112 + warmth * 70)}, ${Math.round(35 + warmth * 54)}, ${0.34 + edgeAlpha * 0.56})`;
          drawBurnAshPiece(x, y, size, angle, cycleSeed, fill, edge, emberAlpha, edgeAlpha, dissolve, time);
        }

        drawAshMicroCloud(x, y, size, angle, cycleSeed, phase, dissolve, pathDx, pathDy, windAngle, windStrength, lift, time);
      });

      renderCtx.restore();
      raf = window.requestAnimationFrame(draw);
    }

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(burnCanvas);
    raf = window.requestAnimationFrame(draw);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas className="overview-burn-canvas" ref={canvasRef} aria-hidden="true" />;
}

function PageFive() {
  const overviewRevealRef = useRef<HTMLDivElement | null>(null);
  const overviewScrollFrameRef = useRef<number | null>(null);
  const [overviewStep, setOverviewStep] = useState(0);
  const [overviewCharge, setOverviewCharge] = useState(0);
  const [overviewActivationOrder] = useState<number[]>(createOverviewActivationOrder);
  const [overviewRevealReady, setOverviewRevealReady] = useState(false);
  const [overviewTextReady, setOverviewTextReady] = useState(false);
  const overviewLocked = overviewCharge >= 1;
  const overviewProgress = overviewCharge;
  const overviewCoreScale = scaleEnergy(overviewProgress, 2);
  const overviewElectricity = scaleEnergy(overviewProgress, 2.5);
  const overviewReach = scaleEnergy(overviewProgress, 2.6);
  const overviewPulseMs = Math.round(1050 - 470 * overviewProgress);
  const overviewElapsed = overviewProgress * OVERVIEW_CHARGE_MS;
  const overviewFinalProgress = Math.max(0, Math.min(1, (overviewElapsed - OVERVIEW_SEQUENCE_MS) / OVERVIEW_FINAL_RAMP_MS));
  const overviewFinalizing = overviewFinalProgress > 0;
  const overviewFinalElapsed = overviewFinalProgress * OVERVIEW_FINAL_RAMP_MS;
  const overviewRandomDone = overviewFinalizing && overviewFinalElapsed >= overviewActivationOrder.length * OVERVIEW_RANDOM_STEP_MS;
  const overviewRandomLitCount = overviewFinalizing
    ? Math.min(overviewActivationOrder.length, Math.floor(overviewFinalElapsed / OVERVIEW_RANDOM_STEP_MS) + 1)
    : 0;
  const overviewRandomActiveStep =
    overviewFinalizing && overviewFinalElapsed < overviewActivationOrder.length * OVERVIEW_RANDOM_STEP_MS
      ? overviewActivationOrder[Math.max(0, overviewRandomLitCount - 1)]
      : -1;
  const overviewSequenceDone = overviewStep >= OVERVIEW_TOTAL_CHARGE_STEPS;
  const overviewActiveStep =
    overviewFinalizing
      ? overviewRandomActiveStep
      : overviewLocked || overviewSequenceDone
      ? -1
      : Math.min(overviewStep, OVERVIEW_BRANCHES.length - 1);
  const overviewLitCount = overviewRandomLitCount;
  const overviewLitSteps = useMemo(
    () => overviewActivationOrder.slice(0, overviewLitCount),
    [overviewActivationOrder, overviewLitCount],
  );
  const overviewElectricLayerProgress =
    overviewFinalizing && overviewLitCount > 0
      ? Math.min(1, 0.26 + (overviewLitCount / overviewActivationOrder.length) * 0.5 + overviewFinalProgress * 0.24)
      : 0;
  const overviewMotionStyle = {
    "--overview-pulse-ms": `${overviewPulseMs}ms`,
    "--overview-final-card-border": `rgba(82, 223, 178, ${0.2 + 0.26 * overviewFinalProgress})`,
    "--overview-final-card-glow": `rgba(82, 223, 178, ${0.05 + 0.12 * overviewFinalProgress})`,
    "--overview-final-card-strong": `rgba(24, 201, 142, ${0.01 + 0.03 * overviewFinalProgress})`,
    "--overview-final-card-overlay": `${0.02 + 0.04 * overviewFinalProgress}`,
    "--overview-final-aura": `${0.04 + 0.07 * overviewFinalProgress}`,
    "--overview-final-base": `${0.2 + 0.16 * overviewFinalProgress}`,
    "--overview-final-carrier": `${0.04 + 0.14 * overviewFinalProgress}`,
    "--overview-final-current": `${0.1 + 0.34 * overviewFinalProgress}`,
    "--overview-final-spark": `${0.12 + 0.52 * overviewFinalProgress}`,
    "--overview-final-node": `${0.76 + 0.24 * overviewFinalProgress}`,
  } as React.CSSProperties;

  useEffect(() => {
    const startTime = performance.now();
    let lastPaint = 0;
    let frame = 0;

    const tick = (time: number) => {
      const progress = Math.min((time - startTime) / OVERVIEW_CHARGE_MS, 1);

      if (time - lastPaint > 32 || progress === 1) {
        setOverviewCharge(progress);
        lastPaint = time;
      }

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (overviewLocked || overviewSequenceDone) return undefined;

    const timer = window.setTimeout(() => {
      setOverviewStep((step) => Math.min(step + 1, OVERVIEW_TOTAL_CHARGE_STEPS));
    }, OVERVIEW_STEP_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [overviewLocked, overviewSequenceDone, overviewStep]);

  useEffect(() => {
    if (!overviewRandomDone) return undefined;

    const revealTimer = window.setTimeout(() => {
      setOverviewTextReady(false);
      setOverviewRevealReady(true);
    }, 360);

    return () => {
      window.clearTimeout(revealTimer);
    };
  }, [overviewRandomDone]);

  useEffect(() => {
    if (!overviewRevealReady) return undefined;

    const timer = window.setTimeout(() => {
      const reveal = overviewRevealRef.current;
      if (!reveal) return;

      const startY = window.scrollY;
      const rect = reveal.getBoundingClientRect();
      const rawTargetY = Math.max(0, startY + rect.top - window.innerHeight * 0.86);
      const rawDistance = rawTargetY - startY;
      const maxDistance = window.innerHeight * 0.15;
      const distance = Math.max(-window.innerHeight * 0.06, Math.min(rawDistance, maxDistance));
      const targetY = Math.max(0, startY + distance);
      const duration = Math.min(1850, Math.max(1050, Math.abs(distance) * 5.4));
      const startTime = performance.now();
      const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);

      if (overviewScrollFrameRef.current !== null) {
        window.cancelAnimationFrame(overviewScrollFrameRef.current);
        overviewScrollFrameRef.current = null;
      }

      if (Math.abs(distance) < 2) {
        overviewScrollFrameRef.current = window.requestAnimationFrame(() => {
          setOverviewTextReady(true);
          overviewScrollFrameRef.current = null;
        });
        return;
      }

      const step = (time: number) => {
        const progress = Math.min(1, (time - startTime) / duration);
        const eased = easeOutCubic(progress);

        window.scrollTo(0, startY + (targetY - startY) * eased);

        if (progress < 1) {
          overviewScrollFrameRef.current = window.requestAnimationFrame(step);
        } else {
          setOverviewTextReady(true);
          overviewScrollFrameRef.current = null;
        }
      };

      overviewScrollFrameRef.current = window.requestAnimationFrame(step);
    }, 140);

    return () => {
      window.clearTimeout(timer);
      if (overviewScrollFrameRef.current !== null) {
        window.cancelAnimationFrame(overviewScrollFrameRef.current);
        overviewScrollFrameRef.current = null;
      }
    };
  }, [overviewRevealReady]);

  useEffect(() => {
    return () => {
      if (overviewScrollFrameRef.current !== null) {
        window.cancelAnimationFrame(overviewScrollFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="grid gap-5">
      <section className="relative min-h-0 overflow-hidden px-2 pb-4 pt-1 sm:px-5 sm:pb-5 md:px-6 md:pb-6 md:pt-3 xl:min-h-[610px]">
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-[0.74rem] font-semibold uppercase tracking-[0.26em] text-white/38">
            Overview
          </p>
          <h1 className="mt-2 text-[1.42rem] font-semibold leading-[1.05] text-white/94 sm:mt-3 sm:text-[1.72rem] md:text-[2.05rem]">
            <span className="text-[#52DFB2] drop-shadow-[0_0_18px_rgba(82,223,178,0.16)]">Openbid</span>{" "}
            powers programmable launch infrastructure.
          </h1>
          <p className="mx-auto mt-2 max-w-[38rem] text-[0.72rem] leading-4 text-white/42 sm:mt-3 sm:text-[0.78rem] sm:leading-5">
            One SDK/API powers launch creation, while the Fee Builder adds configurable swap fees and revenue routing across supported DEX flows.
          </p>

        </div>

        <div className="relative mt-3 min-h-0 max-xl:grid max-xl:gap-3 sm:mt-4 sm:max-xl:gap-4 xl:mt-4 xl:min-h-[520px]">
          <svg
            className="overview-branch-svg pointer-events-none absolute inset-0 hidden h-full w-full xl:block"
            viewBox="0 0 1200 520"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="overviewElectricLeft" x1="1" y1="0" x2="0" y2="0">
                <stop offset="0%" stopColor="#52DFB2" stopOpacity="1" />
                <stop offset="48%" stopColor="#18C98E" stopOpacity="0.82" />
                <stop offset="100%" stopColor="#065F46" stopOpacity="0.18" />
              </linearGradient>
              <linearGradient id="overviewElectricRight" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#52DFB2" stopOpacity="1" />
                <stop offset="48%" stopColor="#18C98E" stopOpacity="0.82" />
                <stop offset="100%" stopColor="#065F46" stopOpacity="0.18" />
              </linearGradient>
              <filter id="overviewBranchGlow" filterUnits="userSpaceOnUse" x="-120" y="-120" width="1440" height="760">
                <feGaussianBlur stdDeviation="2.8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g>
              {OVERVIEW_BRANCHES.map((branch) => {
                const { d, gradient, nodeX, nodeY, step } = branch;
                const branchLit = overviewLitSteps.includes(step);
                const branchActive = overviewActiveStep === step;
                const randomBranchActive = overviewFinalizing && branchActive;

                return (
                  <g
                    key={d}
                    className={cn(
                      "overview-electric-branch",
                      branchActive && "overview-electric-branch-active",
                      branchLit && "overview-electric-branch-connected",
                      randomBranchActive && "overview-electric-branch-final-active",
                      overviewFinalizing && branchLit && "overview-electric-branch-surge",
                    )}
                    style={overviewMotionStyle}
                  >
                    <path
                      d={d}
                      stroke={`url(#${gradient})`}
                      strokeWidth="10"
                      strokeLinecap="round"
                      filter="url(#overviewBranchGlow)"
                      className="overview-electric-aura"
                    />
                    <path
                      d={d}
                      stroke={`url(#${gradient})`}
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      className="overview-electric-base"
                    />
                    <path
                      d={d}
                      pathLength="100"
                      stroke="#52DFB2"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      filter="url(#overviewBranchGlow)"
                      className="overview-electric-current"
                    />
                    <path
                      d={d}
                      pathLength="100"
                      stroke="#A7F3D0"
                      strokeWidth="4.6"
                      strokeLinecap="round"
                      filter="url(#overviewBranchGlow)"
                      className="overview-electric-spark"
                    />
                    <circle
                      cx={nodeX}
                      cy={nodeY}
                      r="3.4"
                      fill="#52DFB2"
                      className="overview-dock-node"
                    />
                  </g>
                );
              })}
            </g>
          </svg>

          <OverviewBranchElectricCanvas progress={overviewElectricLayerProgress} activeSteps={overviewLitSteps} />

          <div className="relative grid gap-3 sm:gap-4 xl:block xl:min-h-[474px]">
            <div className="relative z-20 grid grid-cols-2 gap-2 sm:gap-3 xl:absolute xl:left-0 xl:top-0 xl:w-[19.25rem] xl:grid-cols-1">
              {OVERVIEW_INPUTS.map((item, index) => {
                const Icon = item.icon;
                const step = index * 2;
                const cardLit = overviewLitSteps.includes(step);
                const cardActive = overviewActiveStep === step;
                const randomCardActive = overviewFinalizing && cardActive;
                return (
                  <div
                    key={item.label}
                    className={cn(
                      "overview-node-card flex min-h-[2.45rem] items-center gap-2 rounded-[14px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,20,20,0.92),rgba(7,10,10,0.98))] px-2.5 py-1.5 shadow-[0_14px_38px_rgba(0,0,0,0.24)] backdrop-blur-md sm:min-h-[3.35rem] sm:gap-3.5 sm:rounded-[20px] sm:px-4 sm:py-3",
                      cardActive && !overviewFinalizing && "overview-node-card-active",
                      cardLit && !randomCardActive && !overviewRandomDone && "overview-node-card-outline",
                      randomCardActive && "overview-node-card-final-active",
                      overviewRandomDone && cardLit && "overview-node-card-surge",
                    )}
                    style={{ ...overviewMotionStyle, ...overviewToneStyle(item.tone) }}
                  >
                    <span className="overview-node-icon grid h-6 w-6 shrink-0 place-items-center rounded-[10px] border sm:h-9 sm:w-9 sm:rounded-[14px]">
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    </span>
                    <span className="text-[0.6rem] font-semibold leading-[0.82rem] text-white/76 sm:text-[0.8rem] sm:leading-normal">{item.label}</span>
                    {item.badge ? (
                      <span className="overview-node-badge ml-auto rounded-md border px-1 py-0.5 text-[0.44rem] font-bold tracking-[0.08em] sm:px-1.5 sm:text-[0.55rem]">
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className="overview-globe-stage relative z-10 mx-auto w-full max-w-[19.5rem] sm:max-w-[23rem] xl:absolute xl:left-1/2 xl:top-1/2 xl:w-[26rem] xl:max-w-[26rem] xl:-translate-x-1/2 xl:-translate-y-1/2">
              <EnergySparksCanvas
                accent="#52DFB2"
                intensity={overviewElectricity}
                boltCount={12}
                coreScale={overviewCoreScale}
                reach={overviewReach}
                logoSrc="/deck/logo-navbar.png"
              />
            </div>

            <div className="relative z-20 grid grid-cols-2 gap-2 sm:gap-3 xl:absolute xl:right-0 xl:top-0 xl:w-[19.25rem] xl:grid-cols-1">
              {OVERVIEW_OUTPUTS.map((item, index) => {
                const Icon = item.icon;
                const step = index * 2 + 1;
                const cardLit = overviewLitSteps.includes(step);
                const cardActive = overviewActiveStep === step;
                const randomCardActive = overviewFinalizing && cardActive;
                return (
                  <div
                    key={item.label}
                    className={cn(
                      "overview-node-card flex min-h-[2.45rem] items-center gap-2 rounded-[14px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,20,20,0.92),rgba(7,10,10,0.98))] px-2.5 py-1.5 shadow-[0_14px_38px_rgba(0,0,0,0.24)] backdrop-blur-md sm:min-h-[3.35rem] sm:gap-3.5 sm:rounded-[20px] sm:px-4 sm:py-3",
                      cardActive && !overviewFinalizing && "overview-node-card-active",
                      cardLit && !randomCardActive && !overviewRandomDone && "overview-node-card-outline",
                      randomCardActive && "overview-node-card-final-active",
                      overviewRandomDone && cardLit && "overview-node-card-surge",
                    )}
                    style={{ ...overviewMotionStyle, ...overviewToneStyle(item.tone) }}
                  >
                    <span className="overview-node-icon grid h-6 w-6 shrink-0 place-items-center rounded-[10px] border sm:h-9 sm:w-9 sm:rounded-[14px]">
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    </span>
                    <span className="text-[0.6rem] font-semibold leading-[0.82rem] text-white/76 sm:text-[0.8rem] sm:leading-normal">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {overviewRevealReady ? (
            <motion.div
              ref={overviewRevealRef}
              className={cn("overview-afterglow mx-auto mt-8 max-w-[58rem] sm:mt-10", overviewTextReady && "overview-afterglow-ready")}
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="overview-equation" aria-label="Openbid SDK API plus Fee Builder equals based.bid Infrastructure">
                <span>OPENBID SDK/API</span>
                <span className="overview-equation-mark">+</span>
                <span>FEE BUILDER</span>
                <span className="overview-equation-mark">=</span>
                <span className="overview-equation-gold">based.bid Infrastructure</span>
              </div>

              <div className="overview-resource-panel" aria-label="Based Bid GitBook resources">
                <p className="overview-resource-label">Learn more on our GitBook</p>
                <div className="overview-resource-grid">
                  {OVERVIEW_RESOURCES.map((resource) => {
                    const ResourceIcon = resource.icon;

                    return (
                      <a
                        key={resource.label}
                        href={resource.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn("overview-resource-link", `overview-resource-link-${resource.tone}`)}
                        aria-label={`${resource.label}, opens in a new tab`}
                      >
                        <span className="overview-resource-icon">
                          <ResourceIcon aria-hidden="true" />
                        </span>
                        <span>{resource.label}</span>
                        <ExternalLink className="overview-resource-external" aria-hidden="true" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>

      <PageFiveStyles />
    </div>
  );
}

const PageFiveStyles = React.memo(function PageFiveStyles() {
  return (
    <style>{`
      .overview-branch-svg {
        z-index: 15;
      }

      .overview-branch-electric-canvas {
        pointer-events: none;
        position: absolute;
        inset: 0;
        z-index: 16;
        display: none;
        height: 100%;
        width: 100%;
        mix-blend-mode: screen;
      }

      @media (min-width: 1280px) {
        .overview-branch-electric-canvas {
          display: block;
        }
      }

      .overview-afterglow {
        position: relative;
        isolation: isolate;
        text-align: center;
      }

      .overview-afterglow::before {
        content: none;
      }

      .overview-equation {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 0.34rem 0.52rem;
        font-size: clamp(1.04rem, 1.7vw, 1.48rem);
        font-weight: 850;
        letter-spacing: 0.09em;
        color: rgba(241, 255, 249, 0.9);
        text-transform: uppercase;
        contain: layout paint style;
        transform: translate3d(0, 0.42rem, 0);
        backface-visibility: hidden;
        opacity: 0;
        will-change: opacity, transform;
      }

      .overview-afterglow-ready .overview-equation {
        animation: overviewEquationLineIn 1.08s cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      .overview-equation > span {
        display: inline-block;
        white-space: nowrap;
        transform: translate3d(0, 0, 0);
      }

      .overview-equation-mark {
        color: rgba(255,255,255,0.28);
        font-weight: 700;
      }

      .overview-equation-gold {
        color: rgba(255,226,145,0.94);
        text-shadow:
          0 0 14px rgba(212,175,55,0.22),
          0 0 28px rgba(212,175,55,0.1);
      }

      .overview-resource-panel {
        margin-top: 1.05rem;
        padding: 0.7rem;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 1.1rem;
        background:
          linear-gradient(135deg, rgba(255,255,255,0.035), rgba(255,255,255,0.012)),
          rgba(8,11,11,0.82);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.035),
          0 18px 46px rgba(0,0,0,0.22);
        opacity: 0;
        transform: translate3d(0, 0.46rem, 0);
        will-change: opacity, transform;
      }

      .overview-afterglow-ready .overview-resource-panel {
        animation: overviewEquationLineIn 0.92s 0.38s cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      .overview-resource-label {
        margin: 0 0 0.58rem;
        color: rgba(255,255,255,0.42);
        font-size: 0.62rem;
        font-weight: 700;
        letter-spacing: 0.15em;
        text-transform: uppercase;
      }

      .overview-resource-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.5rem;
      }

      .overview-resource-link {
        --resource-accent: 52, 211, 153;
        position: relative;
        display: flex;
        min-width: 0;
        min-height: 3.25rem;
        align-items: center;
        gap: 0.58rem;
        overflow: hidden;
        border: 1px solid rgba(var(--resource-accent), 0.2);
        border-radius: 0.82rem;
        padding: 0.55rem 0.65rem;
        color: rgba(245,250,248,0.82);
        background:
          radial-gradient(circle at 0% 50%, rgba(var(--resource-accent), 0.1), transparent 42%),
          rgba(9,13,12,0.9);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.025);
        font-size: 0.72rem;
        font-weight: 700;
        line-height: 1.05;
        text-align: left;
        transition:
          border-color 220ms ease,
          background-color 220ms ease,
          color 220ms ease,
          transform 220ms cubic-bezier(0.16, 1, 0.3, 1),
          box-shadow 220ms ease;
      }

      .overview-resource-link::after {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: linear-gradient(105deg, transparent 20%, rgba(var(--resource-accent), 0.11) 48%, transparent 72%);
        opacity: 0;
        transform: translateX(-50%);
        transition: opacity 220ms ease, transform 440ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      .overview-resource-link:hover,
      .overview-resource-link:focus-visible {
        border-color: rgba(var(--resource-accent), 0.55);
        color: rgba(255,255,255,0.96);
        box-shadow:
          inset 0 0 0 1px rgba(var(--resource-accent), 0.1),
          0 0 24px rgba(var(--resource-accent), 0.1);
        transform: translateY(-1px);
        outline: none;
      }

      .overview-resource-link:hover::after,
      .overview-resource-link:focus-visible::after {
        opacity: 1;
        transform: translateX(50%);
      }

      .overview-resource-icon {
        position: relative;
        z-index: 1;
        display: grid;
        width: 2rem;
        height: 2rem;
        flex: 0 0 auto;
        place-items: center;
        border: 1px solid rgba(var(--resource-accent), 0.24);
        border-radius: 0.65rem;
        color: rgb(var(--resource-accent));
        background: rgba(var(--resource-accent), 0.07);
      }

      .overview-resource-icon svg {
        width: 0.92rem;
        height: 0.92rem;
      }

      .overview-resource-link > span:nth-child(2) {
        position: relative;
        z-index: 1;
        min-width: 0;
      }

      .overview-resource-external {
        position: relative;
        z-index: 1;
        width: 0.78rem;
        height: 0.78rem;
        margin-left: auto;
        flex: 0 0 auto;
        color: rgba(var(--resource-accent), 0.56);
        transition: color 220ms ease, transform 220ms ease;
      }

      .overview-resource-link:hover .overview-resource-external,
      .overview-resource-link:focus-visible .overview-resource-external {
        color: rgb(var(--resource-accent));
        transform: translate(1px, -1px);
      }

      .overview-resource-link-gold { --resource-accent: 253, 224, 138; }
      .overview-resource-link-emerald { --resource-accent: 52, 211, 153; }
      .overview-resource-link-cyan { --resource-accent: 34, 211, 238; }
      .overview-resource-link-violet { --resource-accent: 167, 139, 250; }

      @keyframes overviewEquationLineIn {
        0% {
          opacity: 0;
          transform: translate3d(0, 0.46rem, 0);
        }
        100% {
          opacity: 1;
          transform: translate3d(0, 0, 0);
        }
      }

      .overview-electric-aura {
        opacity: 0.13;
        mix-blend-mode: screen;
        shape-rendering: geometricPrecision;
        transition: opacity 260ms ease, stroke-width 260ms ease;
      }

      .overview-electric-base {
        opacity: 0.42;
        mix-blend-mode: screen;
        shape-rendering: geometricPrecision;
        transition: opacity 260ms ease, stroke-width 260ms ease;
      }

      .overview-electric-current {
        opacity: 0;
        stroke-dasharray: 14 118;
        stroke-dashoffset: 16;
        mix-blend-mode: screen;
        animation: none;
        transition: opacity 680ms ease, stroke-width 680ms ease, filter 680ms ease;
        shape-rendering: geometricPrecision;
        will-change: stroke-dashoffset, opacity;
      }

      .overview-electric-spark {
        opacity: 0;
        stroke-dasharray: 4 18;
        stroke-dashoffset: 0;
        mix-blend-mode: screen;
        transition: opacity 680ms ease, stroke-width 680ms ease, filter 680ms ease;
        shape-rendering: geometricPrecision;
        will-change: stroke-dashoffset, opacity;
      }

      .overview-electric-branch-active .overview-electric-aura {
        opacity: 0.17;
        stroke-width: 10;
      }

      .overview-electric-branch-active .overview-electric-base {
        opacity: 0.5;
        stroke-width: 2.6;
      }

      .overview-electric-branch-active .overview-electric-current {
        animation: overviewElectricCurrent var(--overview-pulse-ms, 1050ms) cubic-bezier(0.18, 0.72, 0.14, 1) both;
      }

      .overview-electric-branch-connected .overview-electric-aura {
        opacity: 0.14;
        stroke-width: 10.8;
      }

      .overview-electric-branch-connected .overview-electric-base {
        opacity: 0.54;
        stroke-width: 3;
        filter: url(#overviewBranchGlow);
      }

      .overview-electric-branch-final-active .overview-electric-current {
        animation: none;
        opacity: 0.72;
        stroke-width: 3.2;
        stroke-dasharray: none;
        stroke-dashoffset: 0;
        filter: url(#overviewBranchGlow);
      }

      .overview-electric-branch-final-active .overview-electric-spark {
        animation: none;
        opacity: 0;
      }

      .overview-electric-branch-surge .overview-electric-aura {
        opacity: var(--overview-final-aura, 0.12);
        stroke-width: 8.2;
      }

      .overview-electric-branch-surge .overview-electric-base {
        opacity: var(--overview-final-base, 0.38);
        stroke-width: 2.4;
        filter: url(#overviewBranchGlow);
      }

      .overview-electric-branch-surge .overview-electric-current {
        animation: none;
        opacity: var(--overview-final-carrier, 0.18);
        stroke: #52DFB2;
        stroke-width: 1.5;
        stroke-dasharray: none;
        stroke-dashoffset: 0;
        filter: url(#overviewBranchGlow);
      }

      .overview-electric-branch-surge .overview-electric-spark {
        opacity: 0;
        stroke-dasharray: none;
        stroke-dashoffset: 0;
        animation: none;
      }

      .overview-dock-node {
        opacity: 0.96;
        mix-blend-mode: screen;
        filter: drop-shadow(0 0 8px rgba(82,223,178,0.78));
        transition: opacity 260ms ease, r 260ms ease, filter 260ms ease;
      }

      .overview-electric-branch-surge .overview-dock-node {
        opacity: var(--overview-final-node, 1);
        r: 4.2px;
        filter: drop-shadow(0 0 12px rgba(82,223,178,0.95));
      }

      .overview-node-card {
        position: relative;
        isolation: isolate;
        overflow: hidden;
        border-color: var(--overview-card-border, rgba(255,255,255,0.1));
        background:
          linear-gradient(180deg, rgba(16,20,20,0.92), rgba(7,10,10,0.98)),
          radial-gradient(circle at 14% 50%, var(--overview-card-soft, rgba(24,201,142,0.06)), transparent 58%);
        transition:
          border-color 780ms ease,
          box-shadow 780ms ease,
          transform 520ms ease,
          background 780ms ease;
      }

      .overview-node-card > * {
        position: relative;
        z-index: 2;
      }

      .overview-node-icon {
        border-color: var(--overview-card-border, rgba(24,201,142,0.18));
        background: var(--overview-card-icon-bg, rgba(24,201,142,0.06));
        color: var(--overview-card-accent, #52DFB2);
        box-shadow: inset 0 0 18px var(--overview-card-soft, rgba(24,201,142,0.06));
        transition:
          border-color 620ms ease,
          background 620ms ease,
          color 620ms ease,
          box-shadow 620ms ease;
      }

      .overview-node-badge {
        border-color: var(--overview-card-border, rgba(82,223,178,0.25));
        background: var(--overview-card-soft, rgba(24,201,142,0.1));
        color: var(--overview-card-accent, #52DFB2);
        box-shadow: 0 0 14px var(--overview-card-glow-tone, rgba(82,223,178,0.14));
      }

      .overview-node-card::before {
        content: "";
        position: absolute;
        inset: -1px;
        z-index: 0;
        border-radius: inherit;
        background:
          linear-gradient(110deg, transparent 0%, var(--overview-card-soft, rgba(82,223,178,0.15)) 44%, var(--overview-card-glow-tone, rgba(110,231,183,0.38)) 50%, var(--overview-card-soft, rgba(82,223,178,0.14)) 56%, transparent 100%),
          radial-gradient(circle at 50% 50%, var(--overview-card-glow-tone, rgba(82,223,178,0.16)), transparent 62%);
        opacity: 0;
        transform: translateX(-18%) scaleX(0.84);
        transition: opacity 240ms ease;
      }

      .overview-node-card::after {
        content: "";
        position: absolute;
        inset: -1px;
        z-index: 1;
        border-radius: inherit;
        border: 1px solid transparent;
        box-shadow: inset 0 0 0 1px transparent;
        pointer-events: none;
        transition: border-color 260ms ease, box-shadow 260ms ease, opacity 260ms ease;
      }

      .overview-node-card-active {
        transform: translateY(1px) scale(0.992);
        border-color: var(--overview-card-border, rgba(82,223,178,0.46));
        background:
          linear-gradient(180deg, rgba(13,30,23,0.96), rgba(6,13,10,0.99)),
          radial-gradient(circle at 18% 50%, var(--overview-card-soft, rgba(24,201,142,0.08)), transparent 62%);
        box-shadow:
          0 0 0 1px var(--overview-card-border, rgba(82,223,178,0.16)),
          0 0 28px var(--overview-card-glow-tone, rgba(82,223,178,0.18)),
          0 14px 38px rgba(0,0,0,0.26);
      }

      .overview-node-card-active::before {
        opacity: 1;
        animation: overviewCardPress var(--overview-pulse-ms, 1050ms) cubic-bezier(0.18, 0.72, 0.14, 1) both;
      }

      .overview-node-card-active::after {
        border-color: var(--overview-card-border, rgba(82,223,178,0.52));
        box-shadow:
          inset 0 0 0 1px var(--overview-card-border, rgba(82,223,178,0.2)),
          0 0 18px var(--overview-card-glow-tone, rgba(82,223,178,0.26));
      }

      .overview-node-card-outline {
        border-color: var(--overview-card-border, rgba(82,223,178,0.34));
        background:
          linear-gradient(180deg, rgba(15,21,20,0.94), rgba(7,10,10,0.98)),
          radial-gradient(circle at 18% 50%, var(--overview-card-soft, rgba(24,201,142,0.06)), transparent 62%);
        box-shadow:
          0 0 0 1px var(--overview-card-border, rgba(82,223,178,0.08)),
          0 0 14px var(--overview-card-glow-tone, rgba(82,223,178,0.08)),
          0 14px 38px rgba(0,0,0,0.24);
      }

      .overview-node-card-outline::before {
        opacity: 0;
        animation: none;
      }

      .overview-node-card-outline::after {
        border-color: var(--overview-card-border, rgba(82,223,178,0.36));
        box-shadow:
          inset 0 0 0 1px var(--overview-card-border, rgba(82,223,178,0.12)),
          0 0 12px var(--overview-card-glow-tone, rgba(82,223,178,0.18));
      }

      .overview-node-card-final-active {
        transform: none;
        border-color: color-mix(in srgb, var(--overview-card-accent, #52DFB2) 72%, transparent);
        box-shadow:
          0 0 0 1px color-mix(in srgb, var(--overview-card-accent, #52DFB2) 34%, transparent),
          0 0 22px color-mix(in srgb, var(--overview-card-accent, #52DFB2) 28%, transparent),
          0 14px 38px rgba(0,0,0,0.26);
      }

      .overview-node-card-final-active::before {
        opacity: 0;
        animation: none;
      }

      .overview-node-card-final-active::after {
        animation: overviewCardOutlineKey 520ms cubic-bezier(0.18, 0.72, 0.14, 1) both;
      }

      .overview-node-card-surge {
        transform: none;
        border-color: color-mix(in srgb, var(--overview-card-accent, #52DFB2) 86%, transparent);
        box-shadow:
          0 0 0 1px color-mix(in srgb, var(--overview-card-accent, #52DFB2) 48%, transparent),
          0 0 18px color-mix(in srgb, var(--overview-card-accent, #52DFB2) 34%, transparent),
          0 0 38px color-mix(in srgb, var(--overview-card-accent, #52DFB2) 18%, transparent),
          inset 0 0 12px color-mix(in srgb, var(--overview-card-accent, #52DFB2) 7%, transparent),
          0 14px 38px rgba(0,0,0,0.24);
        transition:
          border-color 760ms cubic-bezier(0.16, 1, 0.3, 1),
          box-shadow 760ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      .overview-node-card-surge::before {
        opacity: 0;
        transform: translateX(0) scaleX(1);
        animation: none;
      }

      .overview-node-card-surge::after {
        opacity: 1;
        border-color: color-mix(in srgb, var(--overview-card-accent, #52DFB2) 92%, transparent);
        box-shadow:
          inset 0 0 0 1px color-mix(in srgb, var(--overview-card-accent, #52DFB2) 28%, transparent),
          0 0 16px color-mix(in srgb, var(--overview-card-accent, #52DFB2) 38%, transparent),
          0 0 32px color-mix(in srgb, var(--overview-card-accent, #52DFB2) 18%, transparent);
        animation: overviewCardLampOn 900ms cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      .overview-globe-stage {
        display: grid;
        min-height: 23rem;
        place-items: center;
      }

      .energy-sparks-frame {
        position: relative;
        width: min(100%, 23rem);
        aspect-ratio: 1;
        margin: 0 auto;
        border-radius: 9999px;
        isolation: isolate;
        overflow: hidden;
        background:
          radial-gradient(circle at 50% 50%, rgba(14,20,18,0.94) 0 42%, rgba(7,12,11,0.76) 62%, transparent 80%);
        filter:
          drop-shadow(0 0 22px rgba(82,223,178,0.26))
          drop-shadow(0 0 54px rgba(24,201,142,0.14));
      }

      .energy-sparks-frame::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 0;
        border-radius: inherit;
        background:
          radial-gradient(circle at 50% 50%, rgba(18,26,23,0.24) 0 48%, rgba(7,12,11,0.2) 66%, transparent 80%);
      }

      .energy-sparks-canvas {
        position: absolute;
        inset: 0;
        z-index: 1;
        width: 100%;
        height: 100%;
        display: block;
      }

      .energy-sparks-vignette {
        pointer-events: none;
        position: absolute;
        inset: 0;
        z-index: 2;
        border-radius: 9999px;
        box-shadow:
          inset 0 0 28px rgba(0,0,0,0.28),
          inset 0 0 76px rgba(0,0,0,0.1);
      }

      @keyframes overviewElectricCurrent {
        0% {
          opacity: 0;
          stroke-dashoffset: 16;
        }
        6% {
          opacity: 0.9;
        }
        92% {
          opacity: 0.88;
          stroke-dashoffset: -106;
        }
        100% {
          opacity: 0;
          stroke-dashoffset: -114;
        }
      }

      @keyframes overviewCardPress {
        0% {
          opacity: 0;
          transform: translateX(-28%) scaleX(0.78);
        }
        28% {
          opacity: 1;
        }
        100% {
          opacity: 0.66;
          transform: translateX(0) scaleX(1);
        }
      }

      @keyframes overviewCardOutlineKey {
        0% {
          border-color: color-mix(in srgb, var(--overview-card-accent, #52DFB2) 28%, transparent);
          box-shadow:
            inset 0 0 0 1px color-mix(in srgb, var(--overview-card-accent, #52DFB2) 8%, transparent),
            0 0 10px color-mix(in srgb, var(--overview-card-accent, #52DFB2) 12%, transparent);
        }
        44% {
          border-color: color-mix(in srgb, var(--overview-card-accent, #52DFB2) 88%, white 12%);
          box-shadow:
            inset 0 0 0 1px color-mix(in srgb, var(--overview-card-accent, #52DFB2) 34%, transparent),
            0 0 28px color-mix(in srgb, var(--overview-card-accent, #52DFB2) 38%, transparent),
            0 0 46px color-mix(in srgb, var(--overview-card-accent, #52DFB2) 18%, transparent);
        }
        100% {
          border-color: color-mix(in srgb, var(--overview-card-accent, #52DFB2) 44%, transparent);
          box-shadow:
            inset 0 0 0 1px color-mix(in srgb, var(--overview-card-accent, #52DFB2) 14%, transparent),
            0 0 14px color-mix(in srgb, var(--overview-card-accent, #52DFB2) 20%, transparent);
        }
      }

      @keyframes overviewCardLampOn {
        0% {
          opacity: 0.48;
          border-color: color-mix(in srgb, var(--overview-card-accent, #52DFB2) 34%, transparent);
          box-shadow:
            inset 0 0 0 1px color-mix(in srgb, var(--overview-card-accent, #52DFB2) 8%, transparent),
            0 0 8px color-mix(in srgb, var(--overview-card-accent, #52DFB2) 12%, transparent);
        }
        46% {
          opacity: 1;
          border-color: color-mix(in srgb, var(--overview-card-accent, #52DFB2) 100%, white 8%);
          box-shadow:
            inset 0 0 0 1px color-mix(in srgb, var(--overview-card-accent, #52DFB2) 42%, transparent),
            0 0 24px color-mix(in srgb, var(--overview-card-accent, #52DFB2) 48%, transparent),
            0 0 48px color-mix(in srgb, var(--overview-card-accent, #52DFB2) 24%, transparent);
        }
        100% {
          opacity: 1;
          border-color: color-mix(in srgb, var(--overview-card-accent, #52DFB2) 92%, transparent);
          box-shadow:
            inset 0 0 0 1px color-mix(in srgb, var(--overview-card-accent, #52DFB2) 28%, transparent),
            0 0 16px color-mix(in srgb, var(--overview-card-accent, #52DFB2) 38%, transparent),
            0 0 32px color-mix(in srgb, var(--overview-card-accent, #52DFB2) 18%, transparent);
        }
      }

      @keyframes overviewCardSurge {
        0%, 100% {
          opacity: 0.68;
          filter: brightness(1);
        }
        48% {
          opacity: 1;
          filter: brightness(1.18);
        }
      }

      @media (max-width: 1279px) {
        .overview-globe-stage {
          min-height: 20rem;
        }

        .energy-sparks-frame {
          width: min(100%, 21rem);
        }
      }

      @media (max-width: 767px) {
        .overview-globe-stage {
          min-height: 16.5rem;
        }

        .energy-sparks-frame {
          width: min(100%, 18.5rem);
        }

        .overview-equation {
          font-size: 0.95rem;
          gap: 0.24rem 0.38rem;
          letter-spacing: 0.075em;
        }

        .overview-resource-panel {
          margin-top: 0.85rem;
          padding: 0.58rem;
          border-radius: 0.95rem;
        }

        .overview-resource-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.42rem;
        }

        .overview-resource-link {
          min-height: 2.9rem;
          gap: 0.46rem;
          padding: 0.44rem 0.5rem;
          font-size: 0.66rem;
        }

        .overview-resource-icon {
          width: 1.75rem;
          height: 1.75rem;
          border-radius: 0.56rem;
        }
      }
    `}</style>
  );
});

function PlaceholderPage({ number }: { number: number }) {
  return (
    <div className="grid min-h-[480px] place-items-center rounded-[30px] border border-white/10 bg-white/[0.03] p-8 text-center">
      <div>
        <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.28em] text-white/48">
          Page {String(number).padStart(2, "0")}
        </div>
        <p className="mt-6 text-base text-white/48">
          Reserved for a separate page build.
        </p>
      </div>
    </div>
  );
}

export default function BasedDeckPreview() {
  const [page, setPage] = useState(1);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  const currentPage = useMemo(() => {
    if (page === 1) return <PageOne />;
    if (page === 2) return <PageTwo />;
    if (page === 3) return <FeeBuilderPage />;
    if (page === 4) return <PageFour />;
    if (page === 5) return <PageFive />;
    return <PlaceholderPage number={page} />;
  }, [page]);

  return (
    <DeckShell page={page} setPage={setPage}>
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          {currentPage}
        </motion.div>
      </AnimatePresence>
    </DeckShell>
  );
}
