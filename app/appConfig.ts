export const LIVE_CHAT_CONTACTS = [
  { name: "Michael", handle: "@BasedBidMichael", href: "https://t.me/BasedBidMichael", avatar: "/team/michael.jpg" },
  { name: "Lumi", handle: "@BasedLumi", href: "https://t.me/BasedLumi", avatar: "/team/lumi.jpg" },
  { name: "Dante", handle: "@BasedDante", href: "https://t.me/BasedDante", avatar: "/team/dante.jpg" },
] as const;

export const isStandaloneDeckRoute = (pathname: string) => pathname === "/deck";

export const isLbpCreationRoute = (pathname: string) =>
  pathname === "/create/lbp" || pathname.startsWith("/create/lbp/");

export const usesSharedAppShell = (pathname: string) =>
  pathname !== "/" &&
  (isLbpCreationRoute(pathname) || !pathname.startsWith("/create/")) &&
  !isStandaloneDeckRoute(pathname);
