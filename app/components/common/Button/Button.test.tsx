import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Theme } from "@radix-ui/themes";
import Button from "./Button";

function wrap(ui: React.ReactElement) {
  return render(<Theme>{ui}</Theme>);
}

describe("Button", () => {
  it("renders children", () => {
    wrap(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("renders native button with ButtonLink class for link variant", () => {
    wrap(<Button variant="link">Go back</Button>);
    const btn = screen.getByRole("button", { name: "Go back" });
    expect(btn.tagName).toBe("BUTTON");
    expect(btn).toHaveClass("ButtonLink");
  });

  it("renders native button with no variant class for unstyled", () => {
    wrap(<Button variant="unstyled" className="custom">Unstyled</Button>);
    const btn = screen.getByRole("button", { name: "Unstyled" });
    expect(btn.tagName).toBe("BUTTON");
    expect(btn).toHaveClass("custom");
    expect(btn).not.toHaveClass("ButtonLink");
  });

  it("applies ButtonPrimary class for primary variant", () => {
    wrap(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole("button", { name: "Primary" })).toHaveClass("ButtonPrimary");
  });

  it("applies ButtonSecondary class for secondary variant", () => {
    wrap(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole("button", { name: "Secondary" })).toHaveClass("ButtonSecondary");
  });

  it("applies ButtonDanger class for danger variant", () => {
    wrap(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole("button", { name: "Delete" })).toHaveClass("ButtonDanger");
  });

  it("appends Full class for full size", () => {
    wrap(<Button size="full">Full</Button>);
    expect(screen.getByRole("button", { name: "Full" })).toHaveClass("Full");
  });

  it("fires onClick when clicked", () => {
    const onClick = vi.fn();
    wrap(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is disabled when disabled prop is set", () => {
    wrap(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled for link variant when disabled prop is set", () => {
    wrap(<Button variant="link" disabled>Link</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("merges custom className", () => {
    wrap(<Button className="extra-class">Styled</Button>);
    expect(screen.getByRole("button")).toHaveClass("extra-class");
  });

  it("appends Lg class for lg size", () => {
    wrap(<Button size="lg">Large</Button>);
    expect(screen.getByRole("button", { name: "Large" })).toHaveClass("Lg");
  });

  it("appends Md class for md size", () => {
    wrap(<Button size="md">Medium</Button>);
    expect(screen.getByRole("button", { name: "Medium" })).toHaveClass("Md");
  });

  it("applies ButtonGray class for gray variant", () => {
    wrap(<Button variant="gray">Gray</Button>);
    expect(screen.getByRole("button", { name: "Gray" })).toHaveClass("ButtonGray");
  });

  it("applies ButtonWarning class for warning variant", () => {
    wrap(<Button variant="warning">Warning</Button>);
    expect(screen.getByRole("button", { name: "Warning" })).toHaveClass("ButtonWarning");
  });
});
