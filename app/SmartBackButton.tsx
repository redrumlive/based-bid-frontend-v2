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
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  };

  return (
    <button type="button" onClick={goBack} aria-label={ariaLabel} className={className}>
      {children}
    </button>
  );
}
