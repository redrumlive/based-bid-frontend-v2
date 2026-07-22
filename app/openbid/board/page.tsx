import type { Metadata } from "next";
import OpenBidPage from "../../OpenBidPage";

export const metadata: Metadata = {
  title: "Create an OpenBid board | Based Bid",
  description: "Create and configure a programmable OpenBid launch board.",
};

export default function OpenBidBoardRoute() {
  return <OpenBidPage />;
}
