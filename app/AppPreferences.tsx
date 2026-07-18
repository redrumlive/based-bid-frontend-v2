"use client";

import { MotionConfig } from "framer-motion";
import React from "react";

export type AnimationPreference = "on" | "reduced" | "off";
export type AmbientPreference = "on" | "off";

type AppPreferencesValue = {
  animation: AnimationPreference;
  ambient: AmbientPreference;
  setAnimation: (value: AnimationPreference) => void;
  setAmbient: (value: AmbientPreference) => void;
};

const ANIMATION_STORAGE_KEY = "based-bid:animation";
const AMBIENT_STORAGE_KEY = "based-bid:ambient";

const AppPreferencesContext = React.createContext<AppPreferencesValue | null>(null);

const isAnimationPreference = (value: string | null): value is AnimationPreference =>
  value === "on" || value === "reduced" || value === "off";

const isAmbientPreference = (value: string | null): value is AmbientPreference =>
  value === "on" || value === "off";

export function AppPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [animation, setAnimation] = React.useState<AnimationPreference>(() => {
    if (typeof window === "undefined") return "on";
    const stored = window.localStorage.getItem(ANIMATION_STORAGE_KEY);
    if (isAnimationPreference(stored)) return stored;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "reduced" : "on";
  });
  const [ambient, setAmbient] = React.useState<AmbientPreference>(() => {
    if (typeof window === "undefined") return "on";
    const stored = window.localStorage.getItem(AMBIENT_STORAGE_KEY);
    return isAmbientPreference(stored) ? stored : "on";
  });

  React.useEffect(() => {
    document.documentElement.dataset.animation = animation;
    document.documentElement.dataset.ambient = ambient;
    window.localStorage.setItem(ANIMATION_STORAGE_KEY, animation);
    window.localStorage.setItem(AMBIENT_STORAGE_KEY, ambient);
  }, [ambient, animation]);

  React.useEffect(() => {
    const syncPreferences = (event: StorageEvent) => {
      if (event.key === ANIMATION_STORAGE_KEY && isAnimationPreference(event.newValue)) {
        setAnimation(event.newValue);
      }
      if (event.key === AMBIENT_STORAGE_KEY && isAmbientPreference(event.newValue)) {
        setAmbient(event.newValue);
      }
    };
    window.addEventListener("storage", syncPreferences);
    return () => window.removeEventListener("storage", syncPreferences);
  }, []);

  const value = React.useMemo(
    () => ({ animation, ambient, setAnimation, setAmbient }),
    [ambient, animation],
  );

  return (
    <AppPreferencesContext.Provider value={value}>
      <MotionConfig reducedMotion={animation === "on" ? "user" : "always"}>
        {children}
      </MotionConfig>
    </AppPreferencesContext.Provider>
  );
}

export function useAppPreferences() {
  const context = React.useContext(AppPreferencesContext);
  if (!context) throw new Error("useAppPreferences must be used within AppPreferencesProvider");
  return context;
}
