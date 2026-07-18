import type { Metadata } from "next";
import CreatePanelPage from "../../CreatePanelPage";

export const metadata: Metadata = {
  title: "LBP Pool Creation | Based Bid",
  description: "Configure and launch an LBP pool on Based Bid.",
};

export default function LbpCreatePage() {
  return <CreatePanelPage />;
}
