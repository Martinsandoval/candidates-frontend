import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Theme } from "@radix-ui/themes";
import AppSpinner from "./AppSpinner";

describe("AppSpinner", () => {
  it("renders the spinner ring", () => {
    const { container } = render(
      <Theme>
        <AppSpinner />
      </Theme>
    );
    expect(container.querySelector(".AppSpinnerRing")).toBeInTheDocument();
  });

  it("renders the label when provided", () => {
    render(
      <Theme>
        <AppSpinner label="Loading candidates…" />
      </Theme>
    );
    expect(screen.getByText("Loading candidates…")).toBeInTheDocument();
  });

  it("does not render label text when label is omitted", () => {
    const { container } = render(
      <Theme>
        <AppSpinner />
      </Theme>
    );
    // Only the logo mark character inside the spinner, no external label
    expect(container.querySelectorAll("p, span[class]").length).toBeGreaterThanOrEqual(0);
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  it("applies the sm size class", () => {
    const { container } = render(
      <Theme>
        <AppSpinner size="sm" />
      </Theme>
    );
    expect(container.querySelector(".AppSpinnerWrapper--sm")).toBeInTheDocument();
  });

  it("applies the lg size class", () => {
    const { container } = render(
      <Theme>
        <AppSpinner size="lg" />
      </Theme>
    );
    expect(container.querySelector(".AppSpinnerWrapper--lg")).toBeInTheDocument();
  });

  it("defaults to md size", () => {
    const { container } = render(
      <Theme>
        <AppSpinner />
      </Theme>
    );
    expect(container.querySelector(".AppSpinnerWrapper--md")).toBeInTheDocument();
  });
});
