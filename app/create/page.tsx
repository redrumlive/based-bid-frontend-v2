import type { Metadata } from "next";
import CreateSelectorPage from "./CreateSelectorPage";

export const metadata: Metadata = {
  title: "Create | based bid",
  description: "Choose how you want to launch on based bid.",
};

export default function CreatePage() {
  return <CreateSelectorPage />;
}
