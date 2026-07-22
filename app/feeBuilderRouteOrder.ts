export type FeeBuilderRouteOrderKey =
  | "rewards"
  | "treasury"
  | "creator"
  | "buybacks"
  | "liquidity"
  | "custom";

export const FEE_BUILDER_ROUTE_ORDER_STORAGE_KEY = "based-bid:fee-builder-route-order";
export const FEE_BUILDER_ROUTE_ORDER_EVENT = "based-bid:fee-builder-route-order-change";

export function feeBuilderRouteOrderKey(id: string, label: string): FeeBuilderRouteOrderKey {
  const route = `${id} ${label}`.toLowerCase();
  if (id === "rwa" || id === "rewards" || route.includes("reward")) return "rewards";
  if (id === "ops" || route.includes("treasury") || route.includes("operation")) return "treasury";
  if (id === "creator" || route.includes("creator")) return "creator";
  if (id === "buybacks" || route.includes("buyback") || route.includes("burn")) return "buybacks";
  if (id === "liq" || route.includes("liquid") || route.includes(" lp")) return "liquidity";
  return "custom";
}

export function normalizeFeeBuilderRouteOrder(
  routes: ReadonlyArray<{ id: string; label: string }>,
): FeeBuilderRouteOrderKey[] {
  return Array.from(new Set(routes.map((route) => feeBuilderRouteOrderKey(route.id, route.label))));
}

export function persistFeeBuilderRouteOrder(order: readonly FeeBuilderRouteOrderKey[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(FEE_BUILDER_ROUTE_ORDER_STORAGE_KEY, JSON.stringify(order));
    window.dispatchEvent(new Event(FEE_BUILDER_ROUTE_ORDER_EVENT));
  } catch {}
}

export function readFeeBuilderRouteOrder(): FeeBuilderRouteOrderKey[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(FEE_BUILDER_ROUTE_ORDER_STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    const valid = new Set<FeeBuilderRouteOrderKey>(["rewards", "treasury", "creator", "buybacks", "liquidity", "custom"]);
    return Array.from(new Set(parsed.filter((key): key is FeeBuilderRouteOrderKey => valid.has(key))));
  } catch {
    return [];
  }
}

export function orderFeeBuilderRoutes<T extends { id: string; label: string }>(
  routes: readonly T[],
  order: readonly FeeBuilderRouteOrderKey[],
): T[] {
  if (!order.length) return [...routes];
  const positions = new Map(order.map((key, index) => [key, index]));
  return routes
    .map((route, index) => ({ route, index, position: positions.get(feeBuilderRouteOrderKey(route.id, route.label)) }))
    .sort((a, b) => {
      const aPosition = a.position ?? order.length + a.index;
      const bPosition = b.position ?? order.length + b.index;
      return aPosition - bPosition || a.index - b.index;
    })
    .map(({ route }) => route);
}
