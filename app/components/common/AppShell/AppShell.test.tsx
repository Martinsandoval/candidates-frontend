import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Theme } from "@radix-ui/themes";

vi.mock("next/link", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

import AppShell from "./AppShell";

describe("AppShell", () => {
  it("renders children inside the main content area", () => {
    render(
      <Theme>
        <AppShell>
          <p>Page content</p>
        </AppShell>
      </Theme>
    );
    expect(screen.getByText("Page content")).toBeInTheDocument();
  });

  it("renders the main landmark with the correct id", () => {
    render(
      <Theme>
        <AppShell>content</AppShell>
      </Theme>
    );
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
  });

  it("renders the skip-to-content link", () => {
    render(
      <Theme>
        <AppShell>content</AppShell>
      </Theme>
    );
    const skip = screen.getByText("Skip to main content");
    expect(skip).toBeInTheDocument();
    expect(skip).toHaveAttribute("href", "#main-content");
  });

  it("renders the sidebar", () => {
    render(
      <Theme>
        <AppShell>content</AppShell>
      </Theme>
    );
    expect(screen.getByRole("complementary")).toBeInTheDocument();
  });

  it("renders the header", () => {
    render(
      <Theme>
        <AppShell>content</AppShell>
      </Theme>
    );
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });
});
