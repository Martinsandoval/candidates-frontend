import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useUserPreferences } from "./useUserPreferences";

const STORAGE_KEY = "candidates-prefs";

beforeEach(() => {
  localStorage.clear();
});

describe("useUserPreferences", () => {
  it("returns an empty preferences object when localStorage is empty", () => {
    const { result } = renderHook(() => useUserPreferences());
    expect(result.current.preferences).toEqual({});
  });

  it("loads preferences persisted in localStorage", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ pageSize: 50 }));
    const { result } = renderHook(() => useUserPreferences());
    expect(result.current.preferences.pageSize).toBe(50);
  });

  it("savePreference updates the preferences state", () => {
    const { result } = renderHook(() => useUserPreferences());
    act(() => {
      result.current.savePreference({ pageSize: 20 });
    });
    expect(result.current.preferences.pageSize).toBe(20);
  });

  it("savePreference persists to localStorage", () => {
    const { result } = renderHook(() => useUserPreferences());
    act(() => {
      result.current.savePreference({ pageSize: 100 });
    });
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    expect(stored.pageSize).toBe(100);
  });

  it("savePreference merges with existing preferences", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ pageSize: 10 }));
    const { result } = renderHook(() => useUserPreferences());
    act(() => {
      result.current.savePreference({ pageSize: 25 });
    });
    expect(result.current.preferences.pageSize).toBe(25);
  });

  it("returns empty object when localStorage contains invalid JSON", () => {
    localStorage.setItem(STORAGE_KEY, "not-valid-json");
    const { result } = renderHook(() => useUserPreferences());
    expect(result.current.preferences).toEqual({});
  });
});
