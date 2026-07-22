"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, Info, Loader2, X } from "lucide-react";

export type AppToastTone = "success" | "pending" | "error" | "info";

export type AppToastInput = {
  title: string;
  message: string;
  tone?: AppToastTone;
  duration?: number;
};

type AppToastRecord = Required<AppToastInput> & { id: string };

type AppToastContextValue = {
  pushToast: (toast: AppToastInput) => string;
  updateToast: (id: string, toast: Partial<AppToastInput>) => void;
  dismissToast: (id: string) => void;
};

const AppToastContext = React.createContext<AppToastContextValue | null>(null);

const TONE_STYLES: Record<AppToastTone, { icon: string; line: string; border: string }> = {
  success: { icon: "bg-[#18c98e]/[0.085] text-[#18c98e] ring-[#18c98e]/18", line: "bg-[#18c98e]/65", border: "border-white/[0.105]" },
  pending: { icon: "bg-[#a78bfa]/[0.085] text-[#b8a4ff] ring-[#a78bfa]/20", line: "bg-[#a78bfa]/70", border: "border-[#a78bfa]/18" },
  error: { icon: "bg-[#ff3771]/[0.085] text-[#ff5d89] ring-[#ff3771]/18", line: "bg-[#ff3771]/68", border: "border-[#ff3771]/18" },
  info: { icon: "bg-[#58a6ff]/[0.075] text-[#72b5ff] ring-[#58a6ff]/18", line: "bg-[#58a6ff]/62", border: "border-white/[0.105]" },
};

function ToastIcon({ tone }: { tone: AppToastTone }) {
  if (tone === "success") return <Check className="h-3.5 w-3.5" strokeWidth={2.2} />;
  if (tone === "pending") return <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />;
  if (tone === "error") return <AlertCircle className="h-3.5 w-3.5" strokeWidth={2} />;
  return <Info className="h-3.5 w-3.5" strokeWidth={2} />;
}

function ToastItem({ toast, onDismiss }: { toast: AppToastRecord; onDismiss: (id: string) => void }) {
  React.useEffect(() => {
    if (toast.duration <= 0) return;
    const timer = window.setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => window.clearTimeout(timer);
  }, [onDismiss, toast.duration, toast.id, toast.tone, toast.title]);

  const styles = TONE_STYLES[toast.tone];
  return (
    <motion.div
      layout
      role={toast.tone === "error" ? "alert" : "status"}
      initial={{ opacity: 0, x: 18, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 12, scale: 0.985 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className={`pointer-events-auto relative w-full overflow-hidden rounded-[14px] border ${styles.border} bg-[#0c0f0d]/97 px-3.5 py-3 shadow-[0_20px_54px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.035)] backdrop-blur-xl`}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-px grid h-7 w-7 shrink-0 place-items-center rounded-[9px] ring-1 ${styles.icon}`}><ToastIcon tone={toast.tone} /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11.5px] font-semibold tracking-[-0.012em] text-white/88">{toast.title}</span>
          <span className="mt-0.5 block text-[10px] leading-[1.45] text-white/44">{toast.message}</span>
        </span>
        <button type="button" onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification" className="grid h-6 w-6 shrink-0 cursor-pointer place-items-center rounded-md text-white/28 transition hover:bg-white/[0.045] hover:text-white/68"><X className="h-3 w-3" /></button>
      </div>
      {toast.duration > 0 ? <motion.span key={`${toast.id}-${toast.tone}-${toast.duration}`} aria-hidden className={`absolute bottom-0 left-0 h-px w-full origin-left ${styles.line}`} initial={{ scaleX: 1 }} animate={{ scaleX: 0 }} transition={{ duration: toast.duration / 1000, ease: "linear" }} /> : <span aria-hidden className={`absolute bottom-0 left-0 h-px w-full ${styles.line}`} />}
    </motion.div>
  );
}

export function AppToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<AppToastRecord[]>([]);

  const dismissToast = React.useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = React.useCallback((input: AppToastInput) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const toast: AppToastRecord = {
      id,
      title: input.title,
      message: input.message,
      tone: input.tone ?? "info",
      duration: input.duration ?? 4200,
    };
    setToasts((current) => [...current.slice(-2), toast]);
    return id;
  }, []);

  const updateToast = React.useCallback((id: string, patch: Partial<AppToastInput>) => {
    setToasts((current) => current.map((toast) => toast.id === id ? {
      ...toast,
      ...patch,
      tone: patch.tone ?? toast.tone,
      duration: patch.duration ?? toast.duration,
    } : toast));
  }, []);

  const value = React.useMemo(() => ({ pushToast, updateToast, dismissToast }), [dismissToast, pushToast, updateToast]);

  return (
    <AppToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-[62px] right-4 z-[1000] flex w-[min(360px,calc(100vw-24px))] flex-col gap-2 max-sm:left-1/2 max-sm:right-auto max-sm:-translate-x-1/2">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />)}
        </AnimatePresence>
      </div>
    </AppToastContext.Provider>
  );
}

export function useAppToast() {
  const context = React.useContext(AppToastContext);
  if (!context) throw new Error("useAppToast must be used within AppToastProvider");
  return context;
}
