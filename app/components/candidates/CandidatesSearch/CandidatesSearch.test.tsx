import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { Theme } from "@radix-ui/themes";
import CandidatesSearch from "./CandidatesSearch";

function renderSearch(value = "", onChange = vi.fn()) {
  return render(
    <Theme>
      <CandidatesSearch value={value} onChange={onChange} />
    </Theme>
  );
}

describe("CandidatesSearch", () => {
  it("renders the search input", () => {
    renderSearch();
    expect(screen.getByRole("textbox", { name: /search candidates/i })).toBeInTheDocument();
  });

  it("displays the current value", () => {
    renderSearch("ana");
    expect(screen.getByRole("textbox", { name: /search candidates/i })).toHaveValue("ana");
  });

  it("calls onChange when the user types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderSearch("", onChange);
    await user.type(screen.getByRole("textbox", { name: /search candidates/i }), "g");
    expect(onChange).toHaveBeenCalledWith("g");
  });

  it("does not show the clear button when value is empty", () => {
    renderSearch("");
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
  });

  it("shows the clear button when value is non-empty", () => {
    renderSearch("ana");
    expect(screen.getByRole("button", { name: "Clear search" })).toBeInTheDocument();
  });

  it("calls onChange with empty string when clear button is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderSearch("ana", onChange);
    await user.click(screen.getByRole("button", { name: "Clear search" }));
    expect(onChange).toHaveBeenCalledWith("");
  });
});
