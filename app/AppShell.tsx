"use client";

import { usePathname } from "next/navigation";
import React from "react";
import AppSidebar from "./AppSidebar";
import CollectFeesModal from "./CollectFeesModal";
import GlobalSearchModal, { OPEN_GLOBAL_SEARCH_EVENT } from "./GlobalSearchModal";
import { useTerminalSidebar } from "./TerminalSidebarContext";
import { usesSharedAppShell } from "./appConfig";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const sharedShell = usesSharedAppShell(pathname);
  const [collectFeesOpen, setCollectFeesOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [collectedMessage, setCollectedMessage] = React.useState<string | null>(null);
  const { expanded: terminalSidebarExpanded, toggle: toggleTerminalSidebar } = useTerminalSidebar();

  React.useEffect(() => {
    if (!sharedShell) return;
    const params = new URLSearchParams(window.location.search);
    if (!params.has("collect")) return;
    params.delete("collect");
    const query = params.toString();
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
  }, [pathname, sharedShell]);

  React.useEffect(() => {
    if (!collectedMessage) return;
    const timer = window.setTimeout(() => setCollectedMessage(null), 3600);
    return () => window.clearTimeout(timer);
  }, [collectedMessage]);

  React.useEffect(() => {
    setCollectFeesOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    const openSearch = () => {
      setCollectFeesOpen(false);
      setSearchOpen(true);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.matches("input, textarea, select, [contenteditable='true']");
      if ((event.key === "/" && !typing && !(event.metaKey || event.ctrlKey)) || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k")) {
        event.preventDefault();
        openSearch();
      }
    };
    window.addEventListener(OPEN_GLOBAL_SEARCH_EVENT, openSearch);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener(OPEN_GLOBAL_SEARCH_EVENT, openSearch);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  if (!sharedShell) return <>{children}<GlobalSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} /></>;

  return (
    <>
      <div className="flex min-h-[calc(100vh-6.25rem)] w-full bg-[#090a0a]">
        <AppSidebar
          onOpenCollectFees={() => setCollectFeesOpen(true)}
          onCloseCollectFees={() => setCollectFeesOpen(false)}
          collectFeesOpen={collectFeesOpen}
          compact={!terminalSidebarExpanded}
          collapsible
          onToggleCompact={toggleTerminalSidebar}
        />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      <CollectFeesModal
        open={collectFeesOpen}
        walletAddress="0xA17C9e42B6D8f3057C24aE91B5d7630F8C2e4A69"
        onClose={() => setCollectFeesOpen(false)}
        onCollected={(target) => setCollectedMessage(`${target.project} fees collected`)}
      />
      <GlobalSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      {collectedMessage ? (
        <div className="pointer-events-none fixed bottom-[62px] left-1/2 z-[240] -translate-x-1/2 rounded-[13px] border border-[#18c98e]/18 bg-[#101412]/96 px-4 py-2.5 text-[11px] font-semibold text-[#b7f7ca] shadow-[0_18px_48px_rgba(0,0,0,0.48)] backdrop-blur-xl">
          {collectedMessage}
        </div>
      ) : null}
    </>
  );
}
