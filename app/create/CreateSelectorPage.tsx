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
    <span className={`inline-flex h-7 items-center rounded-full border bg-transparent px-3 text-[10.5px] font-medium text-white/46 transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-white/68 ${toneClasses}`}>
      {children}
    </span>
  );
}

function CookingBasey() {
  return (
    <span aria-hidden="true" className="bb-cook-stage relative block h-[72px] w-[78px] shrink-0 sm:h-[78px] sm:w-[84px]">
      <span className="bb-pizza-basey-shell pointer-events-none absolute left-1/2 top-1/2 h-[54px] w-[54px] sm:h-[60px] sm:w-[60px]">
        <span className="bb-cook-pizza absolute inset-0 block rounded-full">
          <span className="bb-cook-pizza-shine absolute inset-0 rounded-full" />
        </span>
        <Image
          unoptimized
          src="/mascot/basey-pizza-face.svg"
          alt=""
          width={100}
          height={100}
          className="absolute inset-0 z-10 h-full w-full select-none object-contain"
        />
      </span>
    </span>
  );
}

const launchCardClass =
  "bb-ambient-surface group relative isolate flex min-h-[350px] cursor-pointer flex-col overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#101111] p-7 shadow-[0_18px_48px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.025)] transform-gpu will-change-transform transition-[background-color,border-color,transform,box-shadow] duration-[680ms] ease-[cubic-bezier(0.16,1,0.3,1)] before:pointer-events-none before:absolute before:inset-0 before:z-0 before:scale-[0.97] before:bg-[radial-gradient(ellipse_at_46%_-12%,rgba(255,255,255,0.085),transparent_60%)] before:opacity-0 before:transition-[opacity,transform] before:duration-[720ms] before:ease-[cubic-bezier(0.16,1,0.3,1)] after:pointer-events-none after:absolute after:-inset-8 after:z-0 after:bg-[radial-gradient(circle_at_84%_88%,rgba(255,255,255,0.055),transparent_38%)] after:opacity-0 after:transition-opacity after:duration-[820ms] after:ease-out hover:-translate-y-[3px] hover:scale-[1.002] hover:border-white/[0.15] hover:bg-[#121313] hover:shadow-[0_26px_68px_rgba(0,0,0,0.42),0_0_0_1px_rgba(255,255,255,0.02),inset_0_1px_0_rgba(255,255,255,0.07)] hover:before:scale-100 hover:before:opacity-100 hover:after:opacity-100 active:translate-y-0 active:scale-[0.998] focus:outline-none focus-visible:ring-1 focus-visible:ring-white/25 sm:p-8";

export default function CreateSelectorPage() {
  return (
    <div className="relative min-h-[calc(100vh-100px)] overflow-hidden bg-[#090a0a] text-white">
      <div aria-hidden="true" className="bb-ambient-effect pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.035),transparent_66%)]" />
      <div aria-hidden="true" className="bb-ambient-effect pointer-events-none absolute inset-0 opacity-[0.022] [background-image:linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:100%_72px]" />

      <main className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col px-4 pb-16 pt-4 sm:px-8 sm:pb-20 sm:pt-8">
        <CreateBackLink href="/" />
        <motion.section
          initial={false}
          animate="visible"
          variants={reveal}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7 flex flex-col gap-6 sm:mt-9 md:flex-row md:items-end md:justify-between"
        >
          <div className="flex max-w-[720px] items-center gap-2 sm:gap-5">
            <div className="min-w-0">
              <h1 className="text-[38px] font-semibold leading-[1.04] tracking-[-0.048em] text-white/94 sm:text-[47px] xl:whitespace-nowrap">Time to cook.</h1>
              <p className="mt-3.5 text-[14px] leading-[1.65] text-white/46 sm:text-[15.5px]">Pick a recipe. Serve it your way.</p>
            </div>
            <CookingBasey />
          </div>

          <a
            href="https://wallet.coinbase.com/smart-wallet"
            target="_blank"
            rel="noreferrer"
            className="group relative isolate inline-flex w-full max-w-[410px] items-center gap-3 overflow-hidden rounded-r-[15px] border-l border-[#3975f6]/24 py-2.5 pl-4 pr-3.5 outline-none transition-[border-color,transform] duration-300 hover:border-[#3975f6]/58 focus-visible:border-[#60a5fa]/65 md:w-[390px]"
          >
            <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(105deg,rgba(57,117,246,0.12),rgba(37,99,235,0.025)_58%,transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span aria-hidden className="pointer-events-none absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-[#3975f6]/78 via-[#60a5fa]/38 to-transparent transition-[width] duration-500 ease-out group-hover:w-full" />
            <Image unoptimized src="/networks/base.png" alt="Base" width={36} height={36} className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-white/[0.12] transition duration-300 group-hover:scale-[1.04] group-hover:ring-[#3975f6]/58 group-hover:shadow-[0_0_18px_rgba(57,117,246,0.18)]" />
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#6090fa]/82 transition-colors group-hover:text-[#8bb2ff]">Base smart wallet</span>
              <span className="mt-1 block text-[12px] font-light leading-[1.45] text-white/48 transition-colors group-hover:text-white/62"><strong className="font-medium text-white/78 transition-colors group-hover:text-white/92">Create for gasless launches.</strong> No Base gas required.</span>
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#3975f6]/58 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#8bb2ff]" strokeWidth={1.8} />
          </a>
        </motion.section>

        <motion.div
          initial={false}
          animate="visible"
          variants={reveal}
          transition={{ duration: 0.45, delay: 0.07, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 grid gap-4 sm:mt-11 sm:gap-5 md:grid-cols-[1.04fr_0.96fr]"
        >
          <Link href="/create/token" className={launchCardClass}>
            <span className="absolute -top-px left-1/2 z-20 -translate-x-1/2 rounded-b-[9px] bg-[#18c98e] px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.13em] text-[#071009] shadow-[0_5px_18px_rgba(24,201,142,0.16)]">Recommended</span>
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-8 bottom-0 z-[1] h-px bg-gradient-to-r from-transparent via-white/18 to-transparent opacity-0 blur-[0.4px] transition-opacity duration-700 ease-out group-hover:opacity-100" />
            <Image
              unoptimized
              src="/based-crown.png"
              alt=""
              width={800}
              height={800}
              className="pointer-events-none absolute bottom-0 right-2 z-[2] h-auto w-[176px] select-none object-contain opacity-32 grayscale-[0.1] transition-[opacity,transform,filter] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-x-0.5 group-hover:-translate-y-1 group-hover:-rotate-[0.35deg] group-hover:scale-[1.018] group-hover:opacity-54 group-hover:grayscale-0 sm:right-3 sm:w-[208px]"
            />

            <span className="relative z-10 flex items-start justify-between gap-4">
              <span className="grid h-11 w-11 place-items-center rounded-[13px] border border-white/[0.09] bg-white/[0.025] text-[#d9bd63]/82 transition-[background-color,border-color,color,transform,box-shadow] duration-[620ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-hover:border-[#d9bd63]/24 group-hover:bg-white/[0.04] group-hover:text-[#f0d77d] group-hover:shadow-[0_8px_22px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.06)]">
                <Zap className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <span className="inline-flex h-6 items-center rounded-full border border-[#18c98e]/18 bg-[#18c98e]/[0.045] px-2.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#18c98e]/82">Instant launch</span>
            </span>

            <span className="relative z-10 mt-9 block max-w-[66%]">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/31">Token creation</span>
              <span className="mt-2.5 block text-[27px] font-semibold tracking-[-0.04em] text-white/93">Create a token</span>
              <span className="mt-2.5 block text-[13.5px] leading-[1.6] text-white/48">Go live directly on your selected DEX without upfront liquidity or a graduation step.</span>
            </span>

            <span className="relative z-10 mt-auto flex max-w-[72%] flex-wrap gap-1.5 pt-7">
              <Tag tone="gold">No upfront liquidity</Tag>
              <Tag tone="gold">Direct to DEX</Tag>
            </span>
          </Link>

          <Link href="/create/lbp" className={launchCardClass}>
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-8 bottom-0 z-[1] h-px bg-gradient-to-r from-transparent via-white/18 to-transparent opacity-0 blur-[0.4px] transition-opacity duration-700 ease-out group-hover:opacity-100" />
            <Image
              unoptimized
              src="/based-degen.png"
              alt=""
              width={800}
              height={800}
              className="pointer-events-none absolute bottom-0 right-2 z-[2] h-auto w-[178px] select-none object-contain opacity-30 grayscale-[0.12] transition-[opacity,transform,filter] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-x-0.5 group-hover:-translate-y-1 group-hover:rotate-[0.4deg] group-hover:scale-[1.016] group-hover:opacity-52 group-hover:grayscale-0 sm:right-3 sm:w-[210px]"
            />

            <span className="relative z-10 flex items-start justify-between gap-4">
              <span className="grid h-11 w-11 place-items-center rounded-[13px] border border-white/[0.09] bg-white/[0.025] text-[#7da4ff]/88 transition-[background-color,border-color,color,transform,box-shadow] duration-[620ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-hover:border-[#3975f6]/28 group-hover:bg-white/[0.04] group-hover:text-[#94b5ff] group-hover:shadow-[0_8px_22px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.06)]">
                <Droplets className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <span className="inline-flex h-6 items-center rounded-full border border-[#3975f6]/22 bg-[#3975f6]/[0.055] px-2.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#7da4ff]">Bonding curve</span>
            </span>

            <span className="relative z-10 mt-9 block max-w-[66%]">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/31">LBP pool creation</span>
              <span className="mt-2.5 block text-[27px] font-semibold tracking-[-0.04em] text-white/93">Launch an LBP pool</span>
              <span className="mt-2.5 block text-[13.5px] leading-[1.6] text-white/48">Let buyers discover price, set a graduation target, and commit liquidity before launch.</span>
            </span>

            <span className="relative z-10 mt-auto flex max-w-[72%] flex-wrap gap-1.5 pt-7">
              <Tag tone="blue">Price discovery</Tag>
              <Tag tone="blue">Graduates to DEX</Tag>
            </span>
          </Link>
        </motion.div>

        <motion.section
          initial={false}
          animate="visible"
          variants={reveal}
          transition={{ duration: 0.45, delay: 0.13, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 flex flex-col gap-4 rounded-[19px] border border-[#d9bd63]/18 bg-[#0e0f0e] px-6 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] sm:flex-row sm:items-center sm:px-7"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] border border-[#d9bd63]/16 bg-[#d9bd63]/[0.035] text-[#d9bd63]/74">
            <Route className="h-4 w-4" strokeWidth={1.7} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-[14px] font-semibold text-white/88">Fee Builder</span>
              <span className="rounded-full border border-[#d9bd63]/24 bg-[#d9bd63]/[0.055] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-[#d9bd63]/84">Signature</span>
            </span>
            <span className="mt-1.5 block text-[12px] leading-relaxed text-white/44">Route creator revenue, rewards, buybacks, liquidity, and custom fees from either launch path.</span>
          </span>
          <span className="hidden items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.12em] text-white/30 sm:inline-flex">
            <ShieldCheck className="h-3.5 w-3.5 text-[#18c98e]/64" /> Included
          </span>
        </motion.section>

        <motion.a
          href="https://basedinc.gitbook.io/basedbid/projects-how-to-guides"
          target="_blank"
          rel="noreferrer"
          initial={false}
          animate="visible"
          variants={reveal}
          transition={{ duration: 0.4, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="group mx-auto mt-7 inline-flex items-center gap-3 text-[12px] text-white/46 transition-colors hover:text-white/72"
        >
          <Image unoptimized src="/team/seth.png" alt="Seth" width={30} height={30} className="h-[30px] w-[30px] shrink-0 object-contain transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-[1.04]" />
          <span><span className="text-white/58">Excuse me, ser...</span> looking for more? <span className="font-semibold text-white/68 transition-colors group-hover:text-[#e8d18a]">Check docs</span></span>
          <BookOpen className="h-3.5 w-3.5 text-white/36 transition-colors group-hover:text-[#d9bd63]/88" strokeWidth={1.7} />
        </motion.a>
      </main>
      <style jsx global>{`
        @keyframes bbBaseyHover {
          0%, 100% {
            transform: translate(-50%, -50%) translateY(0) rotate(-0.35deg);
          }
          50% {
            transform: translate(-50%, -50%) translateY(-1.5px) rotate(0.35deg);
          }
        }

        @keyframes bbPizzaSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .bb-cook-stage {
          contain: layout paint;
        }

        .bb-pizza-basey-shell {
          animation: bbBaseyHover 5.8s ease-in-out infinite;
          filter: drop-shadow(0 7px 10px rgba(0, 0, 0, 0.28));
          transform-origin: center;
        }

        .bb-cook-pizza {
          position: absolute;
          inset: 0;
          box-sizing: border-box;
          overflow: hidden;
          border: 4px solid #d98922;
          background:
            radial-gradient(circle at 26% 31%, #9e2318 0 6.5%, #e44427 7% 11%, transparent 11.8%),
            radial-gradient(circle at 69% 25%, #a52318 0 6.5%, #e84a28 7% 11%, transparent 11.8%),
            radial-gradient(circle at 75% 68%, #9e2318 0 6.5%, #e44427 7% 11%, transparent 11.8%),
            radial-gradient(circle at 34% 73%, #a52318 0 6.5%, #e84a28 7% 11%, transparent 11.8%),
            radial-gradient(ellipse at 48% 43%, #59a83d 0 4%, #236f32 4.5% 7%, transparent 7.5%),
            radial-gradient(ellipse at 55% 78%, #4f9e39 0 3.5%, #21652d 4% 6.5%, transparent 7%),
            radial-gradient(circle at 45% 46%, #ffe591 0 48%, #f5bd4c 70%, #e89b28 100%);
          box-shadow:
            inset 0 0 0 2px rgba(255, 194, 65, 0.78),
            inset 0 -4px 5px rgba(132, 55, 13, 0.28);
          animation: bbPizzaSpin 3.15s linear infinite;
          transform-origin: center;
          will-change: transform;
        }

        .bb-cook-pizza-shine {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.22), transparent 38%);
          box-shadow: inset 0 0 0 1px rgba(255, 238, 164, 0.16);
        }

        @media (prefers-reduced-motion: reduce) {
          .bb-pizza-basey-shell,
          .bb-cook-pizza {
            animation: none;
          }

          .bb-pizza-basey-shell {
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </div>
  );
}
