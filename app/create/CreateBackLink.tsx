import { ArrowLeft } from "lucide-react";
import SmartBackButton from "../SmartBackButton";

export default function CreateBackLink({ href, iconOnly = false }: { href: string; iconOnly?: boolean }) {
  return (
    <SmartBackButton
      fallbackHref={href}
      ariaLabel="Go back"
      className={iconOnly
        ? "group inline-flex h-8 w-6 items-center justify-start text-white/38 transition-colors hover:text-white/82 focus:outline-none focus-visible:text-white/82"
        : "group -ml-2 inline-flex h-9 w-fit self-start items-center gap-2 rounded-lg px-2 text-[11px] font-medium text-white/42 transition-colors hover:bg-white/[0.035] hover:text-white/82 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/20"}
    >
      <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" strokeWidth={1.8} />
      {iconOnly ? null : <span className="hidden sm:inline">Back</span>}
    </SmartBackButton>
  );
}
