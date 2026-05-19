import { describe, it, expect } from "vitest";
import { isNetworkError, toastForError } from "./useToast";
import { ToastAlertVariant, ToastVariant } from "@/app/components/common/ToastAlert/enums";

describe("isNetworkError", () => {
  it("returns true for a TypeError", () => {
    expect(isNetworkError(new TypeError("Failed to fetch"))).toBe(true);
  });

  it("returns false for a generic Error", () => {
    expect(isNetworkError(new Error("Server error"))).toBe(false);
  });

  it("returns false for a string", () => {
    expect(isNetworkError("some error string")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isNetworkError(null)).toBe(false);
  });
});

describe("toastForError", () => {
  it("returns a network toast for TypeError", () => {
    const result = toastForError(new TypeError("fetch failed"), "Failed to load");
    expect(result.title).toBe("Network error");
    expect(result.toastVariant).toBe(ToastVariant.BANNER);
    expect(result.alertVariant).toBe(ToastAlertVariant.DANGER);
  });

  it("uses the fallback title for a generic Error", () => {
    const result = toastForError(new Error("500 Internal Server Error"), "Failed to approve");
    expect(result.title).toBe("Failed to approve");
    expect(result.message).toBe("500 Internal Server Error");
    expect(result.toastVariant).toBe(ToastVariant.FLYOUT);
    expect(result.alertVariant).toBe(ToastAlertVariant.DANGER);
  });

  it("uses a generic message for non-Error values", () => {
    const result = toastForError("unknown", "Fallback title");
    expect(result.title).toBe("Fallback title");
    expect(result.message).toBe("An unexpected error occurred.");
  });
});
