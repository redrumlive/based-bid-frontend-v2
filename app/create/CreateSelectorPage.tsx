"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Droplets,
  Route,
  ShieldCheck,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import CreateBackLink from "./CreateBackLink";

const reveal = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

function Tag({ children, tone }: { children: ReactNode; tone: "gold" | "blue" }) {
  const toneClasses = tone === "gold"
    ? "border-[#d9bd63]/28 group-hover:border-[#d9bd63]/46"
    : "border-[#3975f6]/30 group-hover:border-[#3975f6]/48";

  return (
    <span className={`inline-flex h-6 items-center rounded-full border bg-transparent px-2.5 text-[9.5px] font-medium text-white/44 transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-white/66 ${toneClasses}`}>
      {children}
    </span>
  );
}

const launchCardClass =
  "bb-ambient-surface group relative isolate flex min-h-[310px] cursor-pointer flex-col overflow-hidden rounded-[24px] border border-white/[0.075] bg-[#101111] p-6 shadow-[0_18px_48px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.025)] transform-gpu will-change-transform transition-[background-color,border-color,transform,box-shadow] duration-[680ms] ease-[cubic-bezier(0.16,1,0.3,1)] before:pointer-events-none before:absolute before:inset-0 before:z-0 before:scale-[0.97] before:bg-[radial-gradient(ellipse_at_46%_-12%,rgba(255,255,255,0.085),transparent_60%)] before:opacity-0 before:transition-[opacity,transform] before:duration-[720ms] before:ease-[cubic-bezier(0.16,1,0.3,1)] after:pointer-events-none after:absolute after:-inset-8 after:z-0 after:bg-[radial-gradient(circle_at_84%_88%,rgba(255,255,255,0.055),transparent_38%)] after:opacity-0 after:transition-opacity after:duration-[820ms] after:ease-out hover:-translate-y-[3px] hover:scale-[1.002] hover:border-white/[0.15] hover:bg-[#121313] hover:shadow-[0_26px_68px_rgba(0,0,0,0.42),0_0_0_1px_rgba(255,255,255,0.02),inset_0_1px_0_rgba(255,255,255,0.07)] hover:before:scale-100 hover:before:opacity-100 hover:after:opacity-100 active:translate-y-0 active:scale-[0.998] focus:outline-none focus-visible:ring-1 focus-visible:ring-white/25 sm:p-7";

export default function CreateSelectorPage() {
  return (
    <div className="relative min-h-[calc(100vh-100px)] overflow-hidden bg-[#090a0a] text-white">
      <div aria-hidden="true" className="bb-ambient-effect pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.035),transparent_66%)]" />
      <div aria-hidden="true" className="bb-ambient-effect pointer-events-none absolute inset-0 opacity-[0.022] [background-image:linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:100%_72px]" />

      <main className="relative z-10 mx-auto flex w-full max-w-[1060px] flex-col px-5 pb-16 pt-5 sm:px-7 sm:pb-20 sm:pt-7">
        <CreateBackLink href="/" />
        <motion.section
          initial="hidden"
          animate="visible"
          variants={reveal}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
        >
          <div className="max-w-[630px]">
            <h1 className="text-[34px] font-semibold leading-[1.05] tracking-[-0.045em] text-white/94 sm:text-[42px]">What are you launching?</h1>
            <p className="mt-3 max-w-[590px] text-[13px] leading-relaxed text-white/43 sm:text-[14px]">
              Choose a direct token launch or let the market establish price through an LBP bonding curve.
            </p>
          </div>

          <a
            href="https://wallet.coinbase.com/smart-wallet"
            target="_blank"
            rel="noreferrer"
            className="group flex w-full max-w-[340px] items-center gap-3 border-y border-white/[0.075] py-3.5 transition-colors hover:border-white/[0.14] md:w-[320px]"
          >
            <Image unoptimized src="/networks/base.png" alt="Base" width={30} height={30} className="h-[30px] w-[30px] shrink-0 rounded-full object-cover" />
            <span className="min-w-0 flex-1">
              <span className="block text-[11.5px] font-semibold text-white/78 transition-colors group-hover:text-white/92">Create a Base Smart Wallet</span>
              <span className="mt-0.5 block text-[9.5px] leading-relaxed text-white/34">Allows gasless token creation on Base.</span>
            </span>
            <span className="shrink-0 rounded-full border border-white/[0.09] px-2.5 py-1 text-[9px] font-semibold text-white/44 transition group-hover:border-white/[0.16] group-hover:text-white/76">Create</span>
          </a>
        </motion.section>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={reveal}
          transition={{ duration: 0.45, delay: 0.07, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 grid gap-4 md:grid-cols-[1.06fr_0.94fr]"
        >
          <a href="https://www.based.bid/launch-flash" className={launchCardClass}>
            <span className="absolute -top-px left-6 z-20 rounded-b-[9px] bg-[#18c98e] px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.13em] text-[#071009] shadow-[0_5px_18px_rgba(24,201,142,0.16)]">Recommended</span>
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-8 bottom-0 z-[1] h-px bg-gradient-to-r from-transparent via-white/18 to-transparent opacity-0 blur-[0.4px] transition-opacity duration-700 ease-out group-hover:opacity-100" />
            <Image
              unoptimized
              src="/based-crown.png"
              alt=""
              width={800}
              height={800}
              className="pointer-events-none absolute bottom-0 right-1 z-[2] h-auto w-[148px] select-none object-contain opacity-32 grayscale-[0.1] transition-[opacity,transform,filter] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-x-0.5 group-hover:-translate-y-1 group-hover:-rotate-[0.35deg] group-hover:scale-[1.018] group-hover:opacity-54 group-hover:grayscale-0 sm:right-2 sm:w-[172px]"
            />

            <span className="relative z-10 mt-3 flex items-start justify-between gap-4">
              <span className="grid h-10 w-10 place-items-center rounded-[12px] border border-white/[0.09] bg-white/[0.025] text-[#d9bd63]/82 transition-[background-color,border-color,color,transform,box-shadow] duration-[620ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-hover:border-[#d9bd63]/24 group-hover:bg-white/[0.04] group-hover:text-[#f0d77d] group-hover:shadow-[0_8px_22px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.06)]">
                <Zap className="h-[18px] w-[18px]" strokeWidth={1.8} />
              </span>
              <span className="inline-flex h-6 items-center rounded-full border border-[#18c98e]/18 bg-[#18c98e]/[0.045] px-2.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#18c98e]/82">Instant launch</span>
            </span>

            <span className="relative z-10 mt-8 block max-w-[68%]">
              <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-white/28">Token creation</span>
              <span className="mt-2 block text-[23px] font-semibold tracking-[-0.038em] text-white/92">Create a token</span>
              <span className="mt-2 block text-[12px] leading-[1.55] text-white/44">Go live directly on your selected DEX without upfront liquidity or a graduation step.</span>
            </span>

            <span className="relative z-10 mt-auto flex max-w-[72%] flex-wrap gap-1.5 pt-7">
              <Tag tone="gold">No upfront liquidity</Tag>
              <Tag tone="gold">Direct to DEX</Tag>
            </span>
          </a>

          <Link href="/create/lbp" className={launchCardClass}>
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-8 bottom-0 z-[1] h-px bg-gradient-to-r from-transparent via-white/18 to-transparent opacity-0 blur-[0.4px] transition-opacity duration-700 ease-out group-hover:opacity-100" />
            <Image
              unoptimized
              src="/based-degen.png"
              alt=""
              width={800}
              height={800}
              className="pointer-events-none absolute bottom-0 right-1 z-[2] h-auto w-[150px] select-none object-contain opacity-30 grayscale-[0.12] transition-[opacity,transform,filter] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-x-0.5 group-hover:-translate-y-1 group-hover:rotate-[0.4deg] group-hover:scale-[1.016] group-hover:opacity-52 group-hover:grayscale-0 sm:right-2 sm:w-[174px]"
            />

            <span className="relative z-10 flex items-start justify-between gap-4">
              <span className="grid h-10 w-10 place-items-center rounded-[12px] border border-white/[0.09] bg-white/[0.025] text-[#7da4ff]/88 transition-[background-color,border-color,color,transform,box-shadow] duration-[620ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-hover:border-[#3975f6]/28 group-hover:bg-white/[0.04] group-hover:text-[#94b5ff] group-hover:shadow-[0_8px_22px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.06)]">
                <Droplets className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </span>
              <span className="inline-flex h-6 items-center rounded-full border border-[#3975f6]/22 bg-[#3975f6]/[0.055] px-2.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#7da4ff]">Bonding curve</span>
            </span>

            <span className="relative z-10 mt-8 block max-w-[68%]">
              <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-white/28">LBP pool creation</span>
              <span className="mt-2 block text-[23px] font-semibold tracking-[-0.038em] text-white/92">Launch an LBP pool</span>
              <span className="mt-2 block text-[12px] leading-[1.55] text-white/44">Let buyers discover price, set a graduation target, and commit liquidity before launch.</span>
            </span>

            <span className="relative z-10 mt-auto flex max-w-[72%] flex-wrap gap-1.5 pt-7">
              <Tag tone="blue">Price discovery</Tag>
              <Tag tone="blue">Graduates to DEX</Tag>
            </span>
          </Link>
        </motion.div>

        <motion.section
          initial="hidden"
          animate="visible"
          variants={reveal}
          transition={{ duration: 0.45, delay: 0.13, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 flex flex-col gap-4 rounded-[18px] border border-[#d9bd63]/18 bg-[#0e0f0e] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] sm:flex-row sm:items-center sm:px-6"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] border border-[#d9bd63]/16 bg-[#d9bd63]/[0.035] text-[#d9bd63]/74">
            <Route className="h-4 w-4" strokeWidth={1.7} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-[12px] font-semibold text-white/86">Fee Builder</span>
              <span className="rounded-full border border-[#d9bd63]/24 bg-[#d9bd63]/[0.055] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-[#d9bd63]/84">Signature</span>
            </span>
            <span className="mt-1 block text-[10.5px] leading-relaxed text-white/40">Route creator revenue, rewards, buybacks, liquidity, and custom fees from either launch path.</span>
          </span>
          <span className="hidden items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.12em] text-white/30 sm:inline-flex">
            <ShieldCheck className="h-3.5 w-3.5 text-[#18c98e]/64" /> Included
          </span>
        </motion.section>

        <motion.a
          href="https://basedinc.gitbook.io/basedbid/projects-how-to-guides"
          target="_blank"
          rel="noreferrer"
          initial="hidden"
          animate="visible"
          variants={reveal}
          transition={{ duration: 0.4, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="group mx-auto mt-7 inline-flex items-center gap-2 text-[10.5px] text-white/36 transition-colors hover:text-white/72"
        >
          <BookOpen className="h-3.5 w-3.5" strokeWidth={1.7} />
          <span>Need help? <span className="font-semibold text-white/58 transition-colors group-hover:text-white/86">Check our Docs</span></span>
          <ArrowUpRight className="h-3 w-3 text-white/24 transition-colors group-hover:text-white/56" />
        </motion.a>
      </main>
    </div>
  );
}
