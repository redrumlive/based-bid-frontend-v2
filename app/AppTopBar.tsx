"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTerminalSidebar } from "./TerminalSidebarContext";
import {
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  Coins,
  Copy,
  Info,
  LogOut,
  Plus,
  Settings,
  User,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import WalletNetworkModal, { type WalletNetwork } from "./WalletNetworkModal";
import { isStandaloneDeckRoute } from "./appConfig";
import { publishWalletStatus } from "./useWalletFundingStatus";

type Network = "eth" | "bsc" | "base" | "sol" | "robinhood" | "megaeth";

const DEMO_WALLET_CONNECTION_KEY = "bb-demo-wallet-connected";

type NotificationItem = {
  id: string;
  type: "system" | "fees" | "rewards";
  title: string;
  body: string;
  timeLabel: string;
  unread?: boolean;
};

const BRAND_ICON = "/brand-icon.svg";
const CHAINS: Network[] = ["robinhood", "base", "bsc", "sol", "eth", "megaeth"];
const NETWORK_ICONS: Partial<Record<Network, string>> = {
  robinhood: "/networks/robinhood.png",
  base: "/networks/base.png",
  bsc: "/networks/bsc.png",
  sol: "/networks/sol.png",
  eth: "/networks/ethereum.png",
};
const EXPLORERS: Record<Network, string> = {
  robinhood: "https://robinhoodchain.blockscout.com/address/",
  base: "https://basescan.org/address/",
  bsc: "https://bscscan.com/address/",
  sol: "https://solscan.io/account/",
  eth: "https://etherscan.io/address/",
  megaeth: "https://mega.etherscan.io/address/",
};
const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: "announcement", type: "system", title: "Platform announcement", body: "Fee distribution update is now live.", timeLabel: "Just now", unread: true },
  { id: "fees", type: "fees", title: "Fees ready", body: "$763.04 is ready to collect.", timeLabel: "12m", unread: true },
  { id: "rewards", type: "rewards", title: "Rewards distributed", body: "Your latest reward cycle completed.", timeLabel: "1h" },
];

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");
const shortAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;
const networkName = (network: Network) => network === "eth" ? "Ethereum" : network === "bsc" ? "BNB" : network === "sol" ? "Solana" : network === "megaeth" ? "MegaETH" : network[0].toUpperCase() + network.slice(1);
const nativeSymbol = (network: Network) => network === "bsc" ? "BNB" : network === "sol" ? "SOL" : "ETH";

function NetworkIcon({ network, className = "h-5 w-5" }: { network: Network; className?: string }) {
  const src = NETWORK_ICONS[network];
  if (!src) {
    return <span className={cx("grid shrink-0 place-items-center rounded-full border border-white/20 bg-[#171818] text-[8px] font-semibold text-white/76", className)}>M</span>;
  }
  return <Image unoptimized src={src} alt="" width={24} height={24} className={cx("shrink-0 rounded-full object-cover", className)} />;
}

function NotificationRow({ item, onRead }: { item: NotificationItem; onRead: (id: string) => void }) {
  return (
    <button type="button" onClick={() => onRead(item.id)} className="flex w-full cursor-pointer items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04]">
      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-[8px] bg-white/[0.035] text-white/54 ring-1 ring-white/[0.08]">
        {item.type === "system" ? <Info className="h-3.5 w-3.5" /> : item.type === "fees" ? <Coins className="h-3.5 w-3.5 text-[#18c98e]" /> : <Plus className="h-3.5 w-3.5 text-[#18c98e]" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-white/78">
          <span className="truncate">{item.title}</span>
          {item.unread ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#18c98e]" /> : null}
        </span>
        <span className="mt-0.5 block text-[10px] leading-relaxed text-white/40">{item.body}</span>
      </span>
      <span className="shrink-0 pt-0.5 text-[9px] text-white/28">{item.timeLabel}</span>
    </button>
  );
}

function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(INITIAL_NOTIFICATIONS);
  const unread = items.filter((item) => item.unread).length;

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!(event.target as HTMLElement | null)?.closest("[data-global-notifications]")) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className="relative" data-global-notifications>
      <button type="button" onClick={() => setOpen((value) => !value)} className="relative grid h-9 w-9 cursor-pointer place-items-center rounded-xl text-white/56 transition-colors hover:bg-white/[0.045] hover:text-white/84" aria-label="Notifications" aria-expanded={open}>
        <Bell className="h-4 w-4" />
        {unread ? <span className="absolute right-[8px] top-[8px] h-2 w-2 rounded-full bg-[#18c98e] shadow-[0_0_8px_rgba(24,201,142,0.58)]" /> : null}
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div initial={{ opacity: 0, y: -7, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.99 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }} className="absolute right-0 top-[46px] z-[260] w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-[15px] border border-white/[0.09] bg-[#0b0d0d]/98 shadow-[0_22px_58px_rgba(0,0,0,0.64)] backdrop-blur-xl">
            <div className="flex items-center justify-between px-3.5 py-2.5">
              <div className="text-[11px] font-medium text-white/62">Notifications</div>
              <button type="button" disabled={!unread} onClick={() => setItems((current) => current.map((item) => ({ ...item, unread: false })))} className={cx("text-[9.5px] transition-colors", unread ? "cursor-pointer text-white/36 hover:text-white/72" : "cursor-default text-white/18")}>Mark all read</button>
            </div>
            <div className="border-t border-white/[0.07]" />
            <div className="divide-y divide-white/[0.055]">
              {items.map((item) => <NotificationRow key={item.id} item={item} onRead={(id) => setItems((current) => current.map((entry) => entry.id === id ? { ...entry, unread: false } : entry))} />)}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function WalletMenu() {
  const pathname = usePathname();
  const [connected, setConnected] = useState(false);
  const [open, setOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [network, setNetwork] = useState<Network>("base");
  const address = "0xA17C9e42B6D8f3057C24aE91B5d7630F8C2e4A69";
  const balance = 0.176;

  const updateConnection = (nextConnected: boolean) => {
    setConnected(nextConnected);
    window.localStorage.setItem(DEMO_WALLET_CONNECTION_KEY, String(nextConnected));
  };

  useEffect(() => {
    const syncConnection = () => {
      setConnected(window.localStorage.getItem(DEMO_WALLET_CONNECTION_KEY) === "true");
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === DEMO_WALLET_CONNECTION_KEY) syncConnection();
    };

    syncConnection();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    publishWalletStatus({
      connected,
      address: connected ? address : null,
      balanceEth: connected ? balance : null,
    });
  }, [address, balance, connected, pathname]);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!(event.target as HTMLElement | null)?.closest("[data-global-wallet]")) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const connectToNetwork = (selectedNetwork: WalletNetwork) => {
    setNetwork(selectedNetwork === "solana" ? "sol" : "base");
    setConnectModalOpen(false);
    updateConnection(true);
  };

  return (
    <div className="relative" data-global-wallet>
      <button
        type="button"
        onClick={() => {
          if (connected) {
            setOpen((value) => !value);
            return;
          }
          if (pathname === "/") {
            setConnectModalOpen(true);
            return;
          }
          updateConnection(true);
        }}
        aria-label={connected ? "Wallet connected" : "Connect wallet"}
        aria-haspopup={!connected && pathname === "/" ? "dialog" : undefined}
        aria-expanded={connected ? open : pathname === "/" ? connectModalOpen : undefined}
        className={cx(
          "inline-flex h-9 w-[104px] cursor-pointer items-center overflow-hidden whitespace-nowrap rounded-lg border px-3 text-[12px] font-medium shadow-sm ring-1 transition-[width,background-color,border-color,color,box-shadow] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] focus-visible:outline-none sm:w-[144px]",
          connected
            ? "justify-start gap-1.5 border-white/14 bg-[#101312] text-white ring-white/8 shadow-[0_8px_24px_rgba(0,0,0,0.32)] hover:border-white/20 hover:bg-[#131716] sm:w-[228px]"
            : "justify-center gap-2 border-white/10 bg-transparent text-white/80 ring-white/15 hover:bg-white/[0.045] hover:text-white",
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {connected ? (
            <motion.span key="connected" initial={{ opacity: 0, x: 7 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -5 }} transition={{ duration: 0.22 }} className="flex min-w-0 flex-1 items-center gap-1.5">
              <NetworkIcon network={network} className="h-[21px] w-[21px]" />
              <span className="hidden min-w-0 flex-1 truncate text-left text-[11px] sm:block">{shortAddress(address)}</span>
              <span className="hidden h-3 w-px shrink-0 bg-white/12 sm:block" />
              <span className="hidden w-[68px] shrink-0 text-right text-[11px] tabular-nums text-white/76 sm:block">{balance.toFixed(3)} <span className="text-white/40">{nativeSymbol(network)}</span></span>
              <ChevronDown className={cx("ml-auto h-3.5 w-3.5 shrink-0 text-white/40 transition-transform duration-300", open && "rotate-180")} />
              <span className="sm:hidden">Wallet</span>
            </motion.span>
          ) : (
            <motion.span key="connect" initial={{ opacity: 0, x: -7 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 5 }} transition={{ duration: 0.22 }} className="inline-flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span>Connect</span>
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {connected && open ? (
          <motion.div initial={{ opacity: 0, y: -7, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.99 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} className="absolute right-0 top-[46px] z-[260] w-[min(330px,calc(100vw-24px))] overflow-hidden rounded-[15px] border border-white/[0.10] bg-[#0b0d0d]/98 shadow-[0_24px_64px_rgba(0,0,0,0.68)] backdrop-blur-xl">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="text-[8px] font-semibold uppercase tracking-[0.16em] text-white/28">Wallet</div>
                <div className="mt-0.5 text-[13px] font-semibold text-white/88">Account &amp; network</div>
              </div>
              <div className="inline-flex items-center gap-1.5 text-[9px] font-medium leading-none text-[#18c98e]"><span className="h-1.5 w-1.5 rounded-full bg-[#18c98e] shadow-[0_0_8px_rgba(24,201,142,0.7)]" />Connected</div>
            </div>
            <div className="border-t border-white/[0.075]" />
            <div className="group relative flex cursor-pointer items-center gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.04]">
              <Link href="/profile" className="absolute inset-0 z-0" aria-label="Open @redrum profile" />
              <span className="pointer-events-none relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.035] text-white/52 ring-1 ring-white/[0.11] transition-colors group-hover:text-[#18c98e]"><User className="h-4 w-4" /></span>
              <span className="pointer-events-none relative z-10 min-w-0 flex-1">
                <span className="block text-[10px] font-semibold text-white/74 group-hover:text-white/90">@redrum</span>
                <span className="pointer-events-auto mt-1 flex items-center gap-1">
                  <a href={`${EXPLORERS[network]}${address}`} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="relative z-20 text-[11px] font-medium text-white/58 transition-colors hover:text-[#18c98e]">{shortAddress(address)}</a>
                  <button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); void copyAddress(); }} className="relative z-20 grid h-5 w-5 cursor-pointer place-items-center text-white/28 transition-colors hover:text-[#18c98e]" aria-label="Copy wallet address">{copied ? <Check className="h-3 w-3 text-[#18c98e]" /> : <Copy className="h-3 w-3" />}</button>
                </span>
              </span>
              <span className="pointer-events-none relative z-10 shrink-0 text-right">
                <span className="block text-[8px] font-semibold uppercase tracking-[0.14em] text-white/26">Balance</span>
                <span className="mt-1 block text-[11px] font-medium tabular-nums text-white/70">{balance.toFixed(3)} <span className="text-white/38">{nativeSymbol(network)}</span></span>
              </span>
            </div>
            <div className="border-t border-white/[0.075] px-4 py-3.5">
              <div className="flex items-center justify-between text-[8px] font-semibold uppercase tracking-[0.15em] text-white/28"><span>Network</span><span className="normal-case tracking-normal text-white/50">{networkName(network)}</span></div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {CHAINS.map((item) => (
                  <button key={item} type="button" onClick={() => setNetwork(item)} className={cx("flex h-10 cursor-pointer items-center gap-2 rounded-md px-2.5 text-[10px] font-medium ring-1 transition-colors", item === network ? "bg-white/[0.065] text-white/88 ring-white/18" : "bg-white/[0.012] text-white/54 ring-white/12 hover:bg-white/[0.04] hover:text-white/82")}>
                    <NetworkIcon network={item} className="h-[18px] w-[18px]" />
                    <span className="min-w-0 flex-1 truncate text-left">{networkName(item)}</span>
                    {item === network ? <Check className="h-3.5 w-3.5 shrink-0" /> : null}
                  </button>
                ))}
              </div>
            </div>
            <div className="border-t border-white/[0.075]" />
            <Link href="/wallet" className="flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-[10px] font-medium text-white/48 transition-colors hover:bg-white/[0.04] hover:text-white/80"><Settings className="h-3.5 w-3.5" />Wallet options</Link>
            <div className="border-t border-white/[0.075]" />
            <button type="button" onClick={() => { updateConnection(false); setOpen(false); setConnectModalOpen(false); }} className="flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-[10px] font-medium text-white/48 transition-colors hover:bg-[#ff3771]/[0.075] hover:text-[#ff3771]"><LogOut className="h-3.5 w-3.5" />Disconnect</button>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <WalletNetworkModal
        open={!connected && pathname === "/" && connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        onSelect={connectToNetwork}
      />
    </div>
  );
}

function TradeButton() {
  return (
    <Link href="/trade" className="group hidden h-7 cursor-pointer items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.018] px-2.5 text-[10px] font-medium text-white/46 transition-colors hover:border-white/[0.14] hover:bg-white/[0.04] hover:text-white/82 sm:inline-flex">
      <Image unoptimized src={BRAND_ICON} alt="" width={16} height={16} className="h-4 w-4 rounded-[5px] opacity-70 transition-opacity group-hover:opacity-100" />
      <span>Based Trade</span>
      <ArrowUpRight className="h-3 w-3 text-white/24 transition-colors group-hover:text-white/56" />
    </Link>
  );
}

export default function AppTopBar() {
  const pathname = usePathname();
  const { expanded: sidebarExpanded, expand: expandSidebar } = useTerminalSidebar();

  if (isStandaloneDeckRoute(pathname)) return null;

  return (
    <header className="sticky top-0 z-[240] flex h-14 w-full shrink-0 items-center border-b border-white/[0.08] bg-[#0b0c0c]/96 shadow-[0_1px_0_rgba(255,255,255,0.015)] backdrop-blur-xl">
      <div className={cx("flex h-full shrink-0 items-center justify-start border-r border-white/[0.08] px-3 transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]", sidebarExpanded ? "w-[272px]" : "w-[66px]")}>
        <Link href="/" onClick={() => { if (!sidebarExpanded) expandSidebar(); }} className={cx("flex items-center px-1 py-1 transition-[gap,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:opacity-90", sidebarExpanded ? "gap-2.5" : "gap-0")} aria-label="Based Bid home">
          <Image unoptimized src={BRAND_ICON} alt="Based Bid" width={36} height={36} className="h-9 w-9 rounded-2xl object-cover" priority />
          <span className={cx("flex min-w-0 flex-col overflow-hidden whitespace-nowrap leading-tight transition-[max-width,opacity,transform] duration-200 ease-out", sidebarExpanded ? "max-w-[150px] translate-x-0 opacity-100 delay-100" : "max-w-0 -translate-x-1 opacity-0")}>
            <span className="text-[15px] font-medium tracking-tight text-white">based <span className="text-[#18c98e]">bid</span></span>
            <span className="mt-0.5 text-[7.5px] font-semibold uppercase tracking-[0.225em] text-white/38">
              Programmable <span className="text-[#d7c57f]">economies</span>
            </span>
          </span>
        </Link>
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 px-3 sm:gap-2 sm:px-4">
        <TradeButton />
        <NotificationsMenu />
        <WalletMenu />
      </div>
    </header>
  );
}
