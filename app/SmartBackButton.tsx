"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export default function SmartBackButton({
  fallbackHref,
  ariaLabel,
  className,
  children,
}: {
  fallbackHref: string;
  ariaLabel: string;
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();

  const goBack = () => {
    const stateDepth = window.history.state?.basedBidAppDepth;
    const storedDepth = Number(sessionStorage.getItem("basedbid:app-history-depth")) || 0;
    const appDepth = typeof stateDepth === "number" ? stateDepth : storedDepth;

    if (appDepth > 0) {
      router.back();
      return;
    }

    router.replace(fallbackHref);
  };

  return (
    <button type="button" onClick={goBack} aria-label={ariaLabel} className={className}>
      {children}
    </button>
  );
}
