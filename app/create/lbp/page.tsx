import type { Metadata } from "next";
import CreatePanelPage from "../../CreatePanelPage";

export const metadata: Metadata = {
  title: "LBP Pool Creation | based bid",
  description: "Configure and launch an LBP pool on based bid.",
};

export default function LbpCreatePage() {
  return <CreatePanelPage />;
}
