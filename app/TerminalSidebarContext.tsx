"use client";

import React from "react";

type TerminalSidebarContextValue = {
  expanded: boolean;
  toggle: () => void;
};

const TerminalSidebarContext = React.createContext<TerminalSidebarContextValue | null>(null);

export function TerminalSidebarProvider({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = React.useState(false);
  const toggle = React.useCallback(() => setExpanded((current) => !current), []);

  return (
    <TerminalSidebarContext.Provider value={{ expanded, toggle }}>
      {children}
    </TerminalSidebarContext.Provider>
  );
}

export function useTerminalSidebar() {
  const context = React.useContext(TerminalSidebarContext);
  if (!context) throw new Error("useTerminalSidebar must be used within TerminalSidebarProvider");
  return context;
}
