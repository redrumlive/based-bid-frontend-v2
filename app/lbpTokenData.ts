export type LbpNetwork = "base" | "bsc" | "eth" | "robinhood" | "sol";

export type LbpTokenDetail = {
  id: string;
  title: string;
  ticker: string;
  description: string;
  creator: string;
  board: string;
  network: LbpNetwork;
  networkLabel: string;
  accent: string;
  quoteSymbol: string;
  quoteName: string;
  contract: string;
  price: number;
  change24h: number;
  volume24h: number;
  raised: number;
  marketCap: number;
  target: number;
  poolFee: number;
  feesAllTime: number;
  transactions: number;
  holders: number;
  comments: number;
  maxBuyTokens?: number;
  feeBuilderEnabled?: boolean;
  ownerAddress?: string;
  socials?: Partial<Record<"website" | "x" | "telegram" | "discord", string>>;
  seed: number;
  upcoming?: boolean;
};

function generatedAddress(id: string) {
  let hash = 2166136261;
  let hex = "";
  for (let index = 0; index < 40; index += 1) {
    hash ^= id.charCodeAt(index % id.length) + index;
    hash = Math.imul(hash, 16777619);
    hex += ((hash >>> 0) & 15).toString(16);
  }
  return `0x${hex}`;
}

const TOKENS: Record<string, Omit<LbpTokenDetail, "contract">> = {
  gradient: {
    id: "gradient",
    title: "Gradient",
    ticker: "GRAD",
    description: "Experimental social token for builders shipping clean UI and fast loops.",
    creator: "milo",
    board: "based",
    network: "base",
    networkLabel: "Base",
    accent: "#18c98e",
    quoteSymbol: "ETH",
    quoteName: "Ethereum",
    price: 0.0078,
    change24h: 12.4,
    volume24h: 284000,
    raised: 184200,
    marketCap: 780000,
    target: 1000000,
    poolFee: 1,
    feesAllTime: 18420,
    transactions: 1320,
    holders: 684,
    comments: 6,
    maxBuyTokens: 50_000_000,
    feeBuilderEnabled: true,
    socials: {
      website: "https://based.bid",
      x: "https://x.com/basedbid",
    },
    seed: 17,
  },
  "chain-reaction": {
    id: "chain-reaction",
    title: "Chain Reaction",
    ticker: "REACT",
    description: "A liquidity-first launch for builders coordinating across emerging markets.",
    creator: "zain",
    board: "uaecalls",
    network: "bsc",
    networkLabel: "BNB Chain",
    accent: "#f3ba2f",
    quoteSymbol: "BNB",
    quoteName: "BNB",
    price: 0.00018,
    change24h: 0,
    volume24h: 0,
    raised: 0,
    marketCap: 0,
    target: 900000,
    poolFee: 1,
    feesAllTime: 0,
    transactions: 0,
    holders: 0,
    comments: 0,
    feeBuilderEnabled: false,
    seed: 29,
    upcoming: true,
  },
  "ether-atlas": {
    id: "ether-atlas",
    title: "Ether Atlas",
    ticker: "ATLAS",
    description: "An open research economy mapping the next generation of Ethereum protocols.",
    creator: "rune",
    board: "defimentor",
    network: "eth",
    networkLabel: "Ethereum",
    accent: "#8199ee",
    quoteSymbol: "ETH",
    quoteName: "Ethereum",
    price: 0.048,
    change24h: 4.8,
    volume24h: 215000,
    raised: 892000,
    marketCap: 4800000,
    target: 5000000,
    poolFee: 1,
    feesAllTime: 44600,
    transactions: 466,
    holders: 291,
    comments: 8,
    feeBuilderEnabled: true,
    seed: 41,
  },
  "robin-index": {
    id: "robin-index",
    title: "Robin Index",
    ticker: "RDX",
    description: "A community-curated basket tracking the strongest tokenized market themes.",
    creator: "cass",
    board: "sigma",
    network: "robinhood",
    networkLabel: "Robinhood",
    accent: "#b8f33d",
    quoteSymbol: "ETH",
    quoteName: "Ethereum",
    price: 0.0132,
    change24h: 6.5,
    volume24h: 338000,
    raised: 312600,
    marketCap: 1320000,
    target: 1500000,
    poolFee: 1,
    feesAllTime: 31260,
    transactions: 958,
    holders: 447,
    comments: 22,
    feeBuilderEnabled: true,
    ownerAddress: "0xA17C9e42B6D8f3057C24aE91B5d7630F8C2e4A69",
    socials: {
      website: "https://based.bid",
      x: "https://x.com/basedbid",
      telegram: "https://t.me/basedbid",
    },
    seed: 53,
  },
  "neon-relay": {
    id: "neon-relay",
    title: "Neon Relay",
    ticker: "RELAY",
    description: "Community-owned routing infrastructure for fast, social-first token launches.",
    creator: "kai",
    board: "gamma",
    network: "sol",
    networkLabel: "Solana",
    accent: "#35d8f2",
    quoteSymbol: "SOL",
    quoteName: "Solana",
    price: 0.0049,
    change24h: 10.9,
    volume24h: 184000,
    raised: 96300,
    marketCap: 490000,
    target: 777000,
    poolFee: 1,
    feesAllTime: 9630,
    transactions: 726,
    holders: 318,
    comments: 12,
    feeBuilderEnabled: true,
    seed: 67,
  },
};

export const LBP_TOKEN_IDS = Object.keys(TOKENS);

export function getLbpTokenDetail(id: string): LbpTokenDetail | undefined {
  const token = TOKENS[id];
  return token ? { ...token, contract: generatedAddress(id) } : undefined;
}
