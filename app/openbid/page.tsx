import type { Metadata } from "next";
import OpenBidHubPage from "../OpenBidHubPage";

export const metadata: Metadata = {
  title: "OpenBid | Based Bid",
  description: "Launch with OpenBid through the board builder, TypeScript SDK or API.",
};

export default function OpenBidRoute() {
  return <OpenBidHubPage />;
}
