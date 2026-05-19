import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Theme } from "@radix-ui/themes";
import EmptyState from "./EmptyState";

describe("EmptyState", () => {
  it("renders the description", () => {
    render(
      <Theme>
        <EmptyState description="No candidates found." />
      </Theme>
    );
    expect(screen.getByText("No candidates found.")).toBeInTheDocument();
  });

  it("renders the title when provided", () => {
    render(
      <Theme>
        <EmptyState title="Nothing here" description="Try adjusting your filters." />
      </Theme>
    );
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("does not render a title element when title is omitted", () => {
    render(
      <Theme>
        <EmptyState description="No data." />
      </Theme>
    );
    expect(screen.queryByText("Nothing here")).not.toBeInTheDocument();
  });
});
