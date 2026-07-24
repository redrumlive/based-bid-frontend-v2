import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "based bid Pitch Deck",
  description: "based bid programmable economies pitch deck.",
};

export default function DeckLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
