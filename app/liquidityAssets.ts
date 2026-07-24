export type LiquidityAssetKind = "native" | "stable" | "stock" | "etf";

export type LiquidityAsset = {
  id: string;
  symbol: string;
  name: string;
  kind: LiquidityAssetKind;
  icon: string;
};

export const LIQUIDITY_ASSETS: Record<string, LiquidityAsset> = {
  ETH: { id: "ETH", symbol: "ETH", name: "Ethereum", kind: "native", icon: "/tokens/ethereum.png" },
  USDC: { id: "USDC", symbol: "USDC", name: "USD Coin", kind: "stable", icon: "/tokens/usdc.png" },
  USDT: { id: "USDT", symbol: "USDT", name: "Tether USD", kind: "stable", icon: "/tokens/usdt.png" },
  AAPL: { id: "AAPL", symbol: "AAPL", name: "Apple", kind: "stock", icon: "/rwa/aapl.png" },
  NVDA: { id: "NVDA", symbol: "NVDA", name: "NVIDIA", kind: "stock", icon: "/rwa/nvda.png" },
  GOOGL: { id: "GOOGL", symbol: "GOOGL", name: "Alphabet", kind: "stock", icon: "/rwa/googl.png" },
  MSFT: { id: "MSFT", symbol: "MSFT", name: "Microsoft", kind: "stock", icon: "/rwa/msft.png" },
  AMZN: { id: "AMZN", symbol: "AMZN", name: "Amazon", kind: "stock", icon: "/rwa/amzn.png" },
  META: { id: "META", symbol: "META", name: "Meta", kind: "stock", icon: "/rwa/meta.png" },
  TSLA: { id: "TSLA", symbol: "TSLA", name: "Tesla", kind: "stock", icon: "/rwa/tsla.png" },
  ORCL: { id: "ORCL", symbol: "ORCL", name: "Oracle", kind: "stock", icon: "/rwa/orcl.png" },
  AMD: { id: "AMD", symbol: "AMD", name: "Advanced Micro Devices", kind: "stock", icon: "/rwa/amd.png" },
  PLTR: { id: "PLTR", symbol: "PLTR", name: "Palantir", kind: "stock", icon: "/rwa/pltr.png" },
  CRCL: { id: "CRCL", symbol: "CRCL", name: "Circle", kind: "stock", icon: "/rwa/crcl.png" },
  COIN: { id: "COIN", symbol: "COIN", name: "Coinbase", kind: "stock", icon: "/rwa/coin.png" },
  SPY: { id: "SPY", symbol: "SPY", name: "S&P 500 ETF", kind: "etf", icon: "/rwa/spy.png" },
  QQQ: { id: "QQQ", symbol: "QQQ", name: "Nasdaq-100 ETF", kind: "etf", icon: "/rwa/qqq.png" },
  SGOV: { id: "SGOV", symbol: "SGOV", name: "Treasury Bond ETF", kind: "etf", icon: "/rwa/sgov.png" },
};

const STOCK_ORDER = ["AAPL", "NVDA", "GOOGL", "MSFT", "AMZN", "META", "TSLA", "ORCL", "AMD", "PLTR", "CRCL", "COIN"] as const;
const ETF_ORDER = ["SPY", "QQQ", "SGOV"] as const;

export const BASE_LIQUIDITY_GROUPS: Array<{ label: string; items: LiquidityAsset[] }> = [
  { label: "Native", items: [LIQUIDITY_ASSETS.ETH] },
  { label: "Stables", items: [LIQUIDITY_ASSETS.USDC, LIQUIDITY_ASSETS.USDT] },
  { label: "Stocks", items: STOCK_ORDER.map((id) => LIQUIDITY_ASSETS[id]) },
  { label: "ETFs", items: ETF_ORDER.map((id) => LIQUIDITY_ASSETS[id]) },
];

