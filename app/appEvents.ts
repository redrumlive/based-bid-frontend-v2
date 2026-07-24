"use client";

export const OPEN_COLLECT_FEES_EVENT = "basedbid:open-collect-fees";

export function openCollectFees() {
  window.dispatchEvent(new CustomEvent(OPEN_COLLECT_FEES_EVENT));
}
