import { ArrowLeft } from "lucide-react";
import SmartBackButton from "../SmartBackButton";

export default function CreateBackLink({ href }: { href: string }) {
  return (
    <SmartBackButton
      fallbackHref={href}
      ariaLabel="Go back"
      className="group -ml-2 inline-flex h-9 items-center gap-2 rounded-lg px-2 text-[11px] font-medium text-white/42 transition-colors hover:bg-white/[0.035] hover:text-white/82 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
    >
      <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" strokeWidth={1.8} />
      <span>Back</span>
    </SmartBackButton>
  );
}
