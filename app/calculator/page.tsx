import type { Metadata } from "next";
import FeeCalculatorPage from "../FeeCalculatorPage";

export const metadata: Metadata = {
  title: "Fee Calculator | based bid",
  description: "Model Fee Builder routes and estimate projected trading fees.",
};

export default function CalculatorRoute() {
  return <FeeCalculatorPage />;
}
