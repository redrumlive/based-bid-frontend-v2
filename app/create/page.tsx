import type { Metadata } from "next";
import CreateSelectorPage from "./CreateSelectorPage";

export const metadata: Metadata = {
  title: "Create | Based Bid",
  description: "Choose how you want to launch on Based Bid.",
};

export default function CreatePage() {
  return <CreateSelectorPage />;
}
