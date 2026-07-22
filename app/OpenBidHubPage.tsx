"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import {
  Blocks,
  Bot,
  Braces,
  Check,
  CheckCircle2,
  Clipboard,
  Code2,
  Gauge,
  Globe2,
  KeyRound,
  Layers3,
  LockKeyhole,
  MessageCircleMore,
  Rocket,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Workflow,
} from "lucide-react";
import { SiGithub } from "react-icons/si";
import CreateBackLink from "./create/CreateBackLink";

type OpenBidMode = "board" | "sdk" | "api" | "skill";
type IconComponent = React.ComponentType<{ className?: string; strokeWidth?: number }>;

const REPOSITORY_URL = "https://github.com/basedbid-public/openbid";
const DANTE_TELEGRAM = "https://t.me/BasedDante";

const MODES: Array<{ id: OpenBidMode; label: string; caption: string; icon: IconComponent }> = [
  { id: "board", label: "Board", caption: "Visual interface", icon: Layers3 },
  { id: "sdk", label: "SDK", caption: "Typed workflows", icon: Blocks },
  { id: "api", label: "API", caption: "Direct requests", icon: Braces },
  { id: "skill", label: "Skill", caption: "Agent ready", icon: Bot },
];

const SDK_SNIPPET = `git clone https://github.com/basedbid-public/openbid.git
cd openbid
npm install

# Generate a dedicated EVM wallet
npm run wallet:evm

# Launch an LBP from the included config
npm run evm:create-lbp`;

const API_SNIPPET = `const response = await fetch(
  \`${"${process.env.BASEDBID_API_URL}"}/create-lbp\`,
  {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.BASEDBID_API_KEY
    },
    body: JSON.stringify(config)
  }
);

const launch = await response.json();`;

const SKILL_SNIPPET = `$skill-installer install https://github.com/basedbid-public/openbid/tree/main/skills/openbid`;

const panelClass = "rounded-[22px] border border-white/[0.085] bg-[#101211] shadow-[inset_0_1px_rgba(255,255,255,0.025),0_22px_54px_rgba(0,0,0,0.22)]";

function CopyCode({ value }: { value: string }) {
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1300);
  };

  return (
    <button type="button" onClick={() => void copy()} className="inline-flex h-7 items-center gap-1.5 rounded-lg px-2 text-[9.5px] font-medium text-white/38 transition hover:bg-white/[0.045] hover:text-white/76" aria-label="Copy code">
      {copied ? <Check className="h-3 w-3 text-[#18c98e]" /> : <Clipboard className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function CodePanel({ label, code }: { label: string; code: string }) {
  return (
    <div className="overflow-hidden rounded-[17px] border border-white/[0.085] bg-[#090b0a]">
      <div className="flex h-10 items-center justify-between border-b border-white/[0.07] px-3.5">
        <span className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-white/34"><TerminalSquare className="h-3 w-3 text-[#18c98e]/72" />{label}</span>
        <CopyCode value={code} />
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[10.5px] leading-[1.75] text-[#c7d3ce]/72"><code>{code}</code></pre>
    </div>
  );
}

function FeatureLine({ icon: Icon, title, description }: { icon: IconComponent; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-[9px] border border-white/[0.08] bg-white/[0.02] text-[#18c98e]/72"><Icon className="h-3.5 w-3.5" strokeWidth={1.75} /></span>
      <span className="min-w-0"><strong className="block text-[11.5px] font-medium tracking-[-0.01em] text-white/78">{title}</strong><span className="mt-0.5 block text-[10.5px] font-light leading-[1.55] text-white/38">{description}</span></span>
    </div>
  );
}

function BoardMode() {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.04fr)_minmax(320px,.96fr)]">
      <section className={`${panelClass} flex min-h-[350px] flex-col p-6 sm:p-7`}>
        <span className="grid h-10 w-10 place-items-center rounded-[12px] border border-[#18c98e]/18 bg-[#18c98e]/[0.045] text-[#67e7a5]"><Layers3 className="h-[18px] w-[18px]" strokeWidth={1.75} /></span>
        <div className="mt-7 max-w-[620px]">
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#18c98e]/64">Visual interface</p>
          <h2 className="mt-2 text-[27px] font-semibold leading-[1.12] tracking-[-0.04em] text-white/92 sm:text-[31px]">Create your board without code</h2>
          <p className="mt-3 max-w-[570px] text-[12px] font-light leading-[1.68] text-white/43">Set the identity, publishing access, launch rules and revenue through the interface. The result works with the same OpenBid infrastructure as every other integration path.</p>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {["Identity", "Launch access", "Revenue"].map((item, index) => <div key={item} className="border-t border-white/[0.075] pt-3"><span className="font-mono text-[9px] text-[#18c98e]/54">0{index + 1}</span><span className="ml-2 text-[10.5px] font-medium text-white/56">{item}</span></div>)}
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-3 pt-8">
          <Link href="/openbid/board" className="inline-flex h-10 items-center rounded-xl bg-[#18c98e] px-4 text-[11px] font-semibold text-[#07110c] shadow-[0_10px_28px_rgba(24,201,142,0.14)] transition hover:bg-[#3bd99d]">Open board builder</Link>
          <span className="text-[9.5px] text-white/28">Easiest when you prefer an interface</span>
        </div>
      </section>

      <section className={`${panelClass} p-5 sm:p-6`}>
        <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
          <div><p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/27">Board setup</p><p className="mt-1 text-[14px] font-medium tracking-[-0.02em] text-white/78">Everything in one interface</p></div>
          <Workflow className="h-4 w-4 text-white/25" />
        </div>
        <div className="mt-5 space-y-5">
          <FeatureLine icon={Globe2} title="Shape the public page" description="Set branding, visibility, social links and publishing access." />
          <FeatureLine icon={Gauge} title="Set launch rules" description="Choose available launch types, listing terms and board revenue." />
          <FeatureLine icon={KeyRound} title="Connect integrations later" description="A published custom board provides the identity used by the SDK, API and Skill." />
        </div>
        <div className="mt-6 rounded-[14px] border border-white/[0.07] bg-white/[0.014] px-4 py-3.5">
          <div className="flex items-center gap-2 text-[10.5px] font-medium text-white/62"><ShieldCheck className="h-3.5 w-3.5 text-[#18c98e]/72" />One board across every path</div>
          <p className="mt-1.5 text-[10px] font-light leading-[1.55] text-white/34">Start visually, then connect the SDK, API or Skill without rebuilding your board.</p>
        </div>
      </section>
    </div>
  );
}

function SdkMode() {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.12fr)_minmax(310px,.88fr)]">
      <section className={`${panelClass} p-5 sm:p-6`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#18c98e]/70">TypeScript SDK</p><h2 className="mt-2 text-[25px] font-semibold leading-[1.15] tracking-[-0.04em] text-white/90">Build typed launch workflows</h2><p className="mt-2 max-w-[610px] text-[11.5px] font-light leading-[1.65] text-white/40">Use the public repository, included configurations and command workflows for EVM or Solana.</p></div>
          <a href={REPOSITORY_URL} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.02] px-3 text-[10px] font-medium text-white/52 transition hover:border-white/[0.17] hover:text-white/82"><SiGithub className="h-3.5 w-3.5" />View repository</a>
        </div>
        <div className="mt-6"><CodePanel label="EVM quick start" code={SDK_SNIPPET} /></div>
      </section>
      <section className={`${panelClass} p-5 sm:p-6`}>
        <p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-white/27">Included workflows</p>
        <div className="mt-5 space-y-4">
          <FeatureLine icon={Rocket} title="Create launches" description="Prepare and run LBP, Flash token and board configurations." />
          <FeatureLine icon={Workflow} title="Operate after launch" description="Included commands cover supported LBP buys, sells and fee claims." />
          <FeatureLine icon={LockKeyhole} title="Keep signing local" description="EVM and Solana keys remain in your local environment." />
        </div>
        <div className="mt-6 border-t border-white/[0.07] pt-4">
          <p className="text-[10.5px] font-medium text-white/62">Documented networks</p>
          <div className="mt-3 flex flex-wrap gap-1.5">{["Ethereum", "Base", "BNB", "Solana"].map((chain) => <span key={chain} className="rounded-full border border-white/[0.08] px-2 py-1 text-[8.5px] text-white/38">{chain}</span>)}</div>
        </div>
      </section>
    </div>
  );
}

function ApiMode() {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.12fr)_minmax(310px,.88fr)]">
      <section className={`${panelClass} p-5 sm:p-6`}>
        <div><p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#18c98e]/70">OpenBid API</p><h2 className="mt-2 text-[25px] font-semibold leading-[1.15] tracking-[-0.04em] text-white/90">Connect directly from your backend</h2><p className="mt-2 max-w-[620px] text-[11.5px] font-light leading-[1.65] text-white/40">Send the same launch configuration through direct requests. Custom boards authenticate with the `x-api-key` header.</p></div>
        <div className="mt-6"><CodePanel label="Request pattern" code={API_SNIPPET} /></div>
      </section>
      <section className={`${panelClass} p-5 sm:p-6`}>
        <p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-white/27">Common operations</p>
        <div className="mt-4 grid gap-2">
          {["Create LBP", "Create Flash token", "Confirm launch", "Upload metadata", "Claim fees"].map((operation) => <div key={operation} className="flex h-9 items-center justify-between rounded-[11px] border border-white/[0.065] bg-white/[0.012] px-3"><span className="text-[10.5px] text-white/52">{operation}</span><Code2 className="h-3 w-3 text-white/22" /></div>)}
        </div>
        <a href={`${REPOSITORY_URL}#api-key-requirements`} target="_blank" rel="noreferrer" className="mt-5 inline-flex text-[10px] font-medium text-white/38 transition hover:text-white/72">Read the API key documentation</a>
      </section>
    </div>
  );
}

function SkillMode() {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.12fr)_minmax(310px,.88fr)]">
      <section className={`${panelClass} p-5 sm:p-6`}>
        <div className="flex items-start gap-3.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] border border-[#18c98e]/18 bg-[#18c98e]/[0.045] text-[#67e7a5]"><Bot className="h-[18px] w-[18px]" strokeWidth={1.7} /></span>
          <div><p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#18c98e]/70">Agent Skill</p><h2 className="mt-2 text-[25px] font-semibold leading-[1.15] tracking-[-0.04em] text-white/90">Give your agent the OpenBid workflow</h2><p className="mt-2 max-w-[650px] text-[11.5px] font-light leading-[1.65] text-white/40">The Skill adds current commands, configuration checks, board access rules and signing safeguards to compatible coding agents.</p></div>
        </div>
        <div className="mt-6"><CodePanel label="Install with Codex" code={SKILL_SNIPPET} /></div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <a href={`${REPOSITORY_URL}/tree/main/skills/openbid`} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.02] px-3 text-[10px] font-medium text-white/52 transition hover:border-white/[0.17] hover:text-white/82"><SiGithub className="h-3.5 w-3.5" />Open skill source</a>
          <span className="text-[9.5px] text-white/28">Use it with Board, SDK or API workflows</span>
        </div>
      </section>
      <section className={`${panelClass} p-5 sm:p-6`}>
        <p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-white/27">What the Skill handles</p>
        <div className="mt-5 space-y-4">
          <FeatureLine icon={Sparkles} title="Prepares the configuration" description="Maps the request to the correct launch type, network and config file." />
          <FeatureLine icon={ShieldCheck} title="Checks before execution" description="Validates keys, addresses, board access, balances and numeric values." />
          <FeatureLine icon={LockKeyhole} title="Protects wallet secrets" description="Keeps signing local and never prints or commits private keys." />
          <FeatureLine icon={TerminalSquare} title="Runs verified commands" description="Uses the repository command map and reports the resulting transaction clearly." />
        </div>
      </section>
    </div>
  );
}

function AccessFlow() {
  return (
    <section className={`${panelClass} mt-5 overflow-hidden`}>
      <div className="grid md:grid-cols-[260px_1fr_1fr]">
        <div className="border-b border-white/[0.07] p-5 md:border-b-0 md:border-r sm:p-6">
          <span className="grid h-8 w-8 place-items-center rounded-[10px] border border-white/[0.09] bg-white/[0.025] text-[#e1ca7b]"><KeyRound className="h-4 w-4" strokeWidth={1.7} /></span>
          <h3 className="mt-4 text-[15px] font-semibold tracking-[-0.02em] text-white/82">Board access</h3>
          <p className="mt-1.5 text-[10.5px] font-light leading-[1.6] text-white/36">The same access rules apply to the interface, SDK, API and Skill.</p>
        </div>
        <div className="border-b border-white/[0.07] p-5 md:border-b-0 md:border-r sm:p-6">
          <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[#18c98e]" /><span className="text-[11.5px] font-medium text-white/72">Default based board</span></div>
          <p className="mt-2 text-[10.5px] font-light leading-[1.6] text-white/36">Leave the board field empty. No API key is required and the launch publishes on based.</p>
          <Link href="/create" className="mt-4 inline-flex text-[10px] font-medium text-[#18c98e]/78 transition hover:text-[#5ee3aa]">Open launch builder</Link>
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-[#e1ca7b]" /><span className="text-[11.5px] font-medium text-white/72">Your custom board</span></div>
          <p className="mt-2 text-[10.5px] font-light leading-[1.6] text-white/36">Publish a board, then use its identity and `BASEDBID_API_KEY` for custom launches and uploads.</p>
          <Link href="/openbid/board" className="mt-4 inline-flex text-[10px] font-medium text-[#e1ca7b]/78 transition hover:text-[#f0da91]">Create a custom board</Link>
        </div>
      </div>
    </section>
  );
}

export default function OpenBidHubPage() {
  const [mode, setMode] = React.useState<OpenBidMode>("board");

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-[#090a0a] pb-24 text-white">
      <div className="mx-auto w-full max-w-[1220px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <CreateBackLink href="/" />
        <header className="mt-6 max-w-[1080px]">
          <div className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#a78bfa]/78"><Code2 className="h-3.5 w-3.5" strokeWidth={1.7} />OpenBid</div>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-4">
            <h1 className="text-[35px] font-semibold leading-[1.04] tracking-[-0.052em] text-white/94 sm:text-[44px]">Choose how you build</h1>
            <a href={DANTE_TELEGRAM} target="_blank" rel="noreferrer" aria-label="Message Dante for OpenBid integration support" className="group relative isolate inline-flex min-w-0 max-w-[375px] items-center gap-2.5 overflow-hidden rounded-r-[14px] border-l border-[#a78bfa]/22 py-2 pl-4 pr-3 outline-none transition-[border-color,transform] duration-300 hover:border-[#a78bfa]/52 focus-visible:border-[#a78bfa]/60">
              <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(105deg,rgba(139,92,246,0.105),rgba(139,92,246,0.025)_58%,transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span aria-hidden className="pointer-events-none absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-[#a78bfa]/70 via-[#c4b5fd]/38 to-transparent transition-[width] duration-500 ease-out group-hover:w-full" />
              <Image unoptimized src="/team/dante.jpg" alt="Dante" width={32} height={32} className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-white/[0.12] transition duration-300 group-hover:scale-[1.04] group-hover:ring-[#a78bfa]/52 group-hover:shadow-[0_0_18px_rgba(139,92,246,0.14)]" />
              <span className="min-w-0">
                <span className="block text-[8px] font-semibold uppercase tracking-[0.15em] text-[#a78bfa]/68 transition-colors group-hover:text-[#c4b5fd]/88">OpenBid dev</span>
                <span className="mt-0.5 block text-[9.5px] font-light leading-[1.42] text-white/38 transition-colors group-hover:text-white/52"><strong className="font-medium text-white/68 transition-colors group-hover:text-white/86">Need help choosing a path?</strong> Dante can assist.</span>
              </span>
              <MessageCircleMore className="h-3.5 w-3.5 shrink-0 text-[#a78bfa]/52 transition duration-300 group-hover:translate-x-0.5 group-hover:text-[#c4b5fd]" strokeWidth={1.8} />
            </a>
          </div>
          <p className="mt-3 max-w-[760px] text-[12.5px] font-light leading-[1.7] text-white/41 sm:text-[13px]">Use the visual interface, TypeScript SDK, direct API or agent Skill. Every path connects to the same OpenBid launch infrastructure.</p>
        </header>

        <nav aria-label="OpenBid integration method" className="mt-7 grid max-w-[920px] grid-cols-2 gap-1.5 rounded-[16px] border border-white/[0.075] bg-[#0d0f0e] p-1.5 sm:grid-cols-4">
          {MODES.map((item) => {
            const Icon = item.icon;
            const active = mode === item.id;
            return <button key={item.id} type="button" onClick={() => setMode(item.id)} aria-pressed={active} className={`flex min-w-0 items-center gap-2.5 rounded-[11px] px-3 py-2.5 text-left transition ${active ? "bg-white/[0.075] text-white shadow-[inset_0_1px_rgba(255,255,255,0.04)]" : "text-white/38 hover:bg-white/[0.035] hover:text-white/68"}`}><Icon className={`h-3.5 w-3.5 shrink-0 ${active ? "text-[#a78bfa]" : "text-white/30"}`} strokeWidth={1.8} /><span className="min-w-0"><span className="block text-[11px] font-semibold">{item.label}</span><span className="mt-0.5 block truncate text-[8.5px] font-light text-white/28">{item.caption}</span></span></button>;
          })}
        </nav>

        <div className="mt-5" key={mode}>{mode === "board" ? <BoardMode /> : mode === "sdk" ? <SdkMode /> : mode === "api" ? <ApiMode /> : <SkillMode />}</div>
        <AccessFlow />
      </div>
    </main>
  );
}
