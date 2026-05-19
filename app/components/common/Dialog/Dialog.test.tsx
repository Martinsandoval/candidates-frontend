import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Theme } from "@radix-ui/themes";
import Dialog, { DialogVariant } from "./Dialog";

function openDialog(overrides?: Partial<React.ComponentProps<typeof Dialog>>) {
  return render(
    <Theme>
      <Dialog
        open={true}
        onOpenChange={vi.fn()}
        title="Test Dialog"
        {...overrides}
      />
    </Theme>
  );
}

describe("Dialog", () => {
  it("renders the title when open", () => {
    openDialog();
    expect(screen.getByText("Test Dialog")).toBeInTheDocument();
  });

  it("does not render content when closed", () => {
    render(
      <Theme>
        <Dialog open={false} onOpenChange={vi.fn()} title="Hidden" />
      </Theme>
    );
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });

  it("renders description when provided", () => {
    openDialog({ description: "Please confirm this action." });
    expect(screen.getByText("Please confirm this action.")).toBeInTheDocument();
  });

  it("does not render description area when omitted", () => {
    openDialog();
    expect(screen.queryByText("Please confirm this action.")).not.toBeInTheDocument();
  });

  it("renders content slot when provided", () => {
    openDialog({ content: <input placeholder="Enter text" /> });
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("renders actions slot when provided", () => {
    openDialog({ actions: <button>Confirm</button> });
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
  });

  it("calls onOpenChange(false) when close button is clicked", () => {
    const onOpenChange = vi.fn();
    openDialog({ onOpenChange });
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders with danger variant without crashing", () => {
    expect(() => openDialog({ variant: DialogVariant.DANGER })).not.toThrow();
  });

  it("renders with warning variant without crashing", () => {
    expect(() => openDialog({ variant: DialogVariant.WARNING })).not.toThrow();
  });
});
