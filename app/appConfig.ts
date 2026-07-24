export const LIVE_CHAT_CONTACTS = [
  { name: "Michael", role: "Business Development", handle: "@BasedBidMichael", href: "https://t.me/BasedBidMichael", avatar: "/team/michael.jpg" },
  { name: "Lumi", role: "Socials Architect", handle: "@BasedLumi", href: "https://t.me/BasedLumi", avatar: "/team/lumi.jpg" },
  { name: "Dante", role: "OpenBid dev", handle: "@BasedDante", href: "https://t.me/BasedDante", avatar: "/team/dante.jpg" },
  { name: "Seth", role: "Partnerships", handle: "@BasedBotOwner", href: "https://t.me/BasedBotOwner", avatar: "/team/seth.png" },
] as const;

export const isStandaloneDeckRoute = (pathname: string) => pathname === "/deck";

export const isLbpCreationRoute = (pathname: string) =>
  pathname === "/create/lbp" || pathname.startsWith("/create/lbp/");

export const isTokenCreationRoute = (pathname: string) =>
  pathname === "/create/token" || pathname.startsWith("/create/token/");

export const isCreationBuilderRoute = (pathname: string) =>
  isLbpCreationRoute(pathname) || isTokenCreationRoute(pathname);

export const usesSharedAppShell = (pathname: string) =>
  pathname !== "/" &&
  (isCreationBuilderRoute(pathname) || !pathname.startsWith("/create/")) &&
  !isStandaloneDeckRoute(pathname);
