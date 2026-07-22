"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { isCreationBuilderRoute } from "./appConfig";

type TerminalSidebarContextValue = {
  expanded: boolean;
  expand: () => void;
  toggle: () => void;
};

const TerminalSidebarContext = React.createContext<TerminalSidebarContextValue | null>(null);
const SIDEBAR_STORAGE_KEY = "based-bid:sidebar-expanded";
const CREATION_SIDEBAR_EXPANDED_MIN_WIDTH = 1720;

export function TerminalSidebarProvider({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    if (isCreationBuilderRoute(pathname)) {
      const syncCreationSidebar = () =>
        setExpanded(window.innerWidth >= CREATION_SIDEBAR_EXPANDED_MIN_WIDTH);
      syncCreationSidebar();
      window.addEventListener("resize", syncCreationSidebar);
      return () => window.removeEventListener("resize", syncCreationSidebar);
    }
    try {
      const saved = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (saved === "true" || saved === "false") {
        setExpanded(saved === "true");
        return;
      }
    } catch {}
    setExpanded(window.innerWidth >= 1900);
  }, [pathname]);

  const toggle = React.useCallback(() => {
    setExpanded((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  }, []);

  const expand = React.useCallback(() => {
    setExpanded(true);
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, "true");
    } catch {}
  }, []);

  return (
    <TerminalSidebarContext.Provider value={{ expanded, expand, toggle }}>
      {children}
    </TerminalSidebarContext.Provider>
  );
}

export function useTerminalSidebar() {
  const context = React.useContext(TerminalSidebarContext);
  if (!context) throw new Error("useTerminalSidebar must be used within TerminalSidebarProvider");
  return context;
}
