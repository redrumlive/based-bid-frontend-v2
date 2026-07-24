import type { Metadata } from "next";
import BasedHookPage from "../BasedHookPage";

export const metadata: Metadata = {
  title: "Based Hook | based bid",
  description: "Create a Uniswap v4 pool with Based Hook Fee Builder routes, rewards and protection mechanics.",
};

export default function AddLiquidityRoute() {
  return <BasedHookPage />;
}

