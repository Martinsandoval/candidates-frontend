import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Theme } from "@radix-ui/themes";
import TableSkeleton from "./TableSkeleton";

describe("TableSkeleton", () => {
  it("renders without crashing", () => {
    const { container } = render(
      <Theme>
        <TableSkeleton />
      </Theme>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders the title when provided", () => {
    render(
      <Theme>
        <TableSkeleton title="Loading Candidates" />
      </Theme>
    );
    expect(screen.getByText("Loading Candidates")).toBeInTheDocument();
  });

  it("does not render a title when omitted", () => {
    render(
      <Theme>
        <TableSkeleton />
      </Theme>
    );
    expect(screen.queryByText("Loading Candidates")).not.toBeInTheDocument();
  });

  it("renders without errors for custom rows and columns", () => {
    expect(() =>
      render(
        <Theme>
          <TableSkeleton rows={3} columns={5} />
        </Theme>
      )
    ).not.toThrow();
  });
});
