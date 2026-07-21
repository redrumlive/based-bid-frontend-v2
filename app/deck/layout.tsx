import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Based Bid Pitch Deck",
  description: "Based Bid programmable economies pitch deck.",
};

export default function DeckLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
