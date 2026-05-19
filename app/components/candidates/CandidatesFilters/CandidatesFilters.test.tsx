import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { Theme } from "@radix-ui/themes";
import CandidatesFilters, {
  type CandidateFilters,
  countActiveFilters,
  DEFAULT_CANDIDATE_FILTERS,
} from "./CandidatesFilters";

describe("countActiveFilters", () => {
  it("returns 0 for default filters", () => {
    expect(countActiveFilters(DEFAULT_CANDIDATE_FILTERS)).toBe(0);
  });

  it("counts hasReason filter when set", () => {
    expect(countActiveFilters({ ...DEFAULT_CANDIDATE_FILTERS, hasReason: "yes" })).toBe(1);
  });

  it("counts hasUniversity filter when set", () => {
    expect(countActiveFilters({ ...DEFAULT_CANDIDATE_FILTERS, hasUniversity: "no" })).toBe(1);
  });

  it("counts salaryRange filter when set", () => {
    expect(countActiveFilters({ ...DEFAULT_CANDIDATE_FILTERS, salaryRange: [0, 30000] })).toBe(1);
  });

  it("counts all three active filters", () => {
    const filters: CandidateFilters = {
      hasReason: "yes",
      hasUniversity: "no",
      salaryRange: [10000, 50000],
    };
    expect(countActiveFilters(filters)).toBe(3);
  });
});

function renderFilters(filters: CandidateFilters = DEFAULT_CANDIDATE_FILTERS, onChange = vi.fn()) {
  return render(
    <Theme>
      <CandidatesFilters filters={filters} onChange={onChange} salaryCeiling={100000} />
    </Theme>
  );
}

describe("CandidatesFilters", () => {
  it("renders the Filters trigger button", () => {
    renderFilters();
    expect(screen.getByRole("button", { name: /filters/i })).toBeInTheDocument();
  });

  it("does not show active-filter badge when no filters are active", () => {
    renderFilters();
    // Badge with count is only rendered when activeCount > 0
    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });

  it("shows badge with active filter count", () => {
    renderFilters({ ...DEFAULT_CANDIDATE_FILTERS, hasReason: "yes" });
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("shows badge count of 2 when two filters are active", () => {
    renderFilters({ hasReason: "yes", hasUniversity: "no", salaryRange: null });
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("opens the filter popover and shows section labels", async () => {
    const user = userEvent.setup();
    renderFilters();
    await user.click(screen.getByRole("button", { name: /filters/i }));
    expect(await screen.findByText("REJECTION REASON")).toBeInTheDocument();
    expect(screen.getByText("UNIVERSITY DEGREE")).toBeInTheDocument();
    expect(screen.getByText("SALARY RANGE")).toBeInTheDocument();
  });

  it("calls onChange with updated hasReason when segmented control changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderFilters(DEFAULT_CANDIDATE_FILTERS, onChange);
    await user.click(screen.getByRole("button", { name: /filters/i }));
    await screen.findByText("REJECTION REASON");
    // Radix SegmentedControl items have role="radio"
    await user.click(screen.getByRole("radio", { name: "Has reason" }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ hasReason: "yes" }));
  });

  it("calls onChange with updated hasUniversity when segmented control changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderFilters(DEFAULT_CANDIDATE_FILTERS, onChange);
    await user.click(screen.getByRole("button", { name: /filters/i }));
    await screen.findByText("UNIVERSITY DEGREE");
    // University "No" item has accessible name "No" (distinct from rejection "No reason")
    await user.click(screen.getByRole("radio", { name: "No" }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ hasUniversity: "no" }));
  });

  it("shows Clear all button when filters are active and calls onChange with defaults on click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderFilters({ hasReason: "yes", hasUniversity: "all", salaryRange: null }, onChange);
    await user.click(screen.getByRole("button", { name: /filters/i }));
    const clearBtn = await screen.findByText("Clear all");
    await user.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith(DEFAULT_CANDIDATE_FILTERS);
  });

  it("shows Reset button when salary range is set and calls onChange to clear it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderFilters(
      { hasReason: "all", hasUniversity: "all", salaryRange: [10000, 80000] },
      onChange
    );
    await user.click(screen.getByRole("button", { name: /filters/i }));
    const resetBtn = await screen.findByText("Reset");
    await user.click(resetBtn);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ salaryRange: null }));
  });
});
