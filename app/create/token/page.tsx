import type { Metadata } from "next";
import CreatePanelPage from "../../CreatePanelPage";

export const metadata: Metadata = {
  title: "Token Creation | Based Bid",
  description: "Configure and create a token on Based Bid.",
};

export default function TokenCreatePage() {
  return <CreatePanelPage launchType="token" />;
}
