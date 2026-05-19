import { describe, it, expect, vi, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { Theme } from "@radix-ui/themes";
import { ToastProvider, useToast, ToastAlertVariant, ToastVariant } from "./useToast";

function TestConsumer({ onShow }: { onShow?: () => void }) {
  const { showToast } = useToast();
  return (
    <button
      onClick={() => {
        showToast({
          title: "Test notification",
          message: "Something happened.",
          alertVariant: ToastAlertVariant.SUCCESS,
          toastVariant: ToastVariant.FLYOUT,
        });
        onShow?.();
      }}
    >
      Show Toast
    </button>
  );
}

function renderProvider(onShow?: () => void) {
  return render(
    <Theme>
      <ToastProvider>
        <TestConsumer onShow={onShow} />
      </ToastProvider>
    </Theme>
  );
}

afterEach(() => {
  vi.useRealTimers();
});

describe("ToastProvider", () => {
  it("renders children without crashing", () => {
    renderProvider();
    expect(screen.getByRole("button", { name: "Show Toast" })).toBeInTheDocument();
  });

  it("shows a toast when showToast is called", async () => {
    const user = userEvent.setup();
    renderProvider();
    await user.click(screen.getByRole("button", { name: "Show Toast" }));
    expect(screen.getAllByText("Test notification").length).toBeGreaterThan(0);
  });

  it("can show multiple toasts sequentially", async () => {
    const user = userEvent.setup();
    renderProvider();
    await user.click(screen.getByRole("button", { name: "Show Toast" }));
    await user.click(screen.getByRole("button", { name: "Show Toast" }));
    const toasts = screen.getAllByText("Test notification");
    expect(toasts.length).toBeGreaterThanOrEqual(2);
  });

  it("shows the toast message text", async () => {
    const user = userEvent.setup();
    renderProvider();
    await user.click(screen.getByRole("button", { name: "Show Toast" }));
    expect(screen.getAllByText("Something happened.").length).toBeGreaterThan(0);
  });
});
