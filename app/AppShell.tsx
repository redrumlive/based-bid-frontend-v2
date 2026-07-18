"use client";

import { usePathname } from "next/navigation";
import React from "react";
import AppSidebar from "./AppSidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const usesSharedFooter = pathname !== "/" && !pathname.startsWith("/create/");

  if (!usesSharedFooter) return children;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] w-full bg-[#090a0a]">
      <AppSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
