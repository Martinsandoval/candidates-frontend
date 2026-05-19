"use client";

import { useState, useCallback } from "react";
import type { UserPreferences } from "@/app/hooks/types";

export type { UserPreferences };

const STORAGE_KEY = "candidates-prefs";

function load(): UserPreferences {
  /* v8 ignore next -- SSR guard, unreachable in jsdom test environment */
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as UserPreferences) : {};
  } catch {
    return {};
  }
}

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(load);

  const savePreference = useCallback((prefs: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...prefs };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore write failures
      }
      return updated;
    });
  }, []);

  return { preferences, savePreference };
}
