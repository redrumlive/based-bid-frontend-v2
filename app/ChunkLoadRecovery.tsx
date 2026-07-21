"use client";

import { useEffect } from "react";

const RECOVERY_KEY = "bb-chunk-recovery";
const RECOVERY_WINDOW_MS = 15_000;

const isChunkLoadFailure = (reason: unknown) => {
  const message = reason instanceof Error
    ? `${reason.name}: ${reason.message}`
    : String(reason ?? "");

  return /ChunkLoadError|Failed to load chunk|Loading chunk .* failed|Importing a module script failed|Failed to fetch dynamically imported module/i.test(message);
};

export default function ChunkLoadRecovery() {
  useEffect(() => {
    const recover = (reason: unknown) => {
      if (!isChunkLoadFailure(reason)) return;

      const lastRecovery = Number(window.sessionStorage.getItem(RECOVERY_KEY) ?? 0);
      const now = Date.now();
      if (now - lastRecovery < RECOVERY_WINDOW_MS) return;

      window.sessionStorage.setItem(RECOVERY_KEY, String(now));
      window.location.reload();
    };

    const handleError = (event: ErrorEvent) => recover(event.error ?? event.message);
    const handleRejection = (event: PromiseRejectionEvent) => recover(event.reason);
    const clearRecovery = window.setTimeout(
      () => window.sessionStorage.removeItem(RECOVERY_KEY),
      RECOVERY_WINDOW_MS,
    );

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.clearTimeout(clearRecovery);
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
}
