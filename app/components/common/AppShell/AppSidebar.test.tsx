import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Theme } from "@radix-ui/themes";

vi.mock("next/link", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import AppSidebar from "./AppSidebar";

const defaults = {
  collapsed: false,
  onToggle: vi.fn(),
  pathname: "/",
};

describe("AppSidebar", () => {
  it("renders the navigation landmark", () => {
    render(
      <Theme>
        <AppSidebar {...defaults} />
      </Theme>
    );
    expect(screen.getByRole("complementary")).toBeInTheDocument();
  });

  it("renders the Candidates nav link", () => {
    render(
      <Theme>
        <AppSidebar {...defaults} />
      </Theme>
    );
    expect(screen.getByRole("link", { name: "Candidates" })).toBeInTheDocument();
  });

  it("marks Candidates as active on root pathname", () => {
    render(
      <Theme>
        <AppSidebar {...defaults} pathname="/" />
      </Theme>
    );
    expect(screen.getByRole("link", { name: "Candidates" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("marks Candidates as active on /candidates sub-route", () => {
    render(
      <Theme>
        <AppSidebar {...defaults} pathname="/candidates/abc-123" />
      </Theme>
    );
    expect(screen.getByRole("link", { name: "Candidates" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("does not mark link as active on unrelated route", () => {
    render(
      <Theme>
        <AppSidebar {...defaults} pathname="/settings" />
      </Theme>
    );
    expect(screen.getByRole("link", { name: "Candidates" })).not.toHaveAttribute("aria-current");
  });

  it("applies collapsed class when collapsed=true", () => {
    const { container } = render(
      <Theme>
        <AppSidebar {...defaults} collapsed={true} />
      </Theme>
    );
    expect(container.querySelector(".AppSidebar--collapsed")).toBeInTheDocument();
  });

  it("does not apply collapsed class when expanded", () => {
    const { container } = render(
      <Theme>
        <AppSidebar {...defaults} collapsed={false} />
      </Theme>
    );
    expect(container.querySelector(".AppSidebar--collapsed")).not.toBeInTheDocument();
  });

  it("shows Collapse sidebar label when expanded", () => {
    render(
      <Theme>
        <AppSidebar {...defaults} collapsed={false} />
      </Theme>
    );
    expect(screen.getByRole("button", { name: "Collapse sidebar" })).toBeInTheDocument();
  });

  it("shows Expand sidebar label when collapsed", () => {
    render(
      <Theme>
        <AppSidebar {...defaults} collapsed={true} />
      </Theme>
    );
    expect(screen.getByRole("button", { name: "Expand sidebar" })).toBeInTheDocument();
  });

  it("calls onToggle when the toggle button is clicked", () => {
    const onToggle = vi.fn();
    render(
      <Theme>
        <AppSidebar {...defaults} onToggle={onToggle} />
      </Theme>
    );
    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(onToggle).toHaveBeenCalledOnce();
  });
});
