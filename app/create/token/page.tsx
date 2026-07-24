import type { Metadata } from "next";
import CreatePanelPage from "../../CreatePanelPage";

export const metadata: Metadata = {
  title: "Token Creation | based bid",
  description: "Configure and create a token on based bid.",
};

export default function TokenCreatePage() {
  return <CreatePanelPage launchType="token" />;
}
