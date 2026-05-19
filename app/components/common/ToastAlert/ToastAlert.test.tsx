import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import * as Toast from "@radix-ui/react-toast";
import { Theme } from "@radix-ui/themes";
import ToastAlert from "./ToastAlert";
import { ToastAlertVariant, ToastVariant } from "./enums";

function renderToast(overrides?: Partial<React.ComponentProps<typeof ToastAlert>>) {
  return render(
    <Theme>
      <Toast.Provider>
        <ToastAlert
          id="t1"
          title="Operation succeeded"
          message="Your changes were saved."
          toastVariant={ToastVariant.FLYOUT}
          alertVariant={ToastAlertVariant.SUCCESS}
          show={true}
          onClose={vi.fn()}
          {...overrides}
        />
      </Toast.Provider>
    </Theme>
  );
}

describe("ToastAlert", () => {
  it("renders the title string", () => {
    renderToast();
    expect(screen.getAllByText("Operation succeeded").length).toBeGreaterThan(0);
  });

  it("renders the message string", () => {
    renderToast();
    expect(screen.getAllByText("Your changes were saved.").length).toBeGreaterThan(0);
  });

  it("renders a title provided as a component", () => {
    const TitleFC = () => <span>Dynamic Title</span>;
    renderToast({ title: TitleFC });
    expect(screen.getAllByText("Dynamic Title").length).toBeGreaterThan(0);
  });

  it("renders a message provided as a component", () => {
    const MsgFC = () => <span>Dynamic message</span>;
    renderToast({ message: MsgFC });
    expect(screen.getAllByText("Dynamic message").length).toBeGreaterThan(0);
  });

  it("does not render title content when show=false", () => {
    renderToast({ show: false });
    // Radix Toast.Root with open=false does not render its children to the DOM
    expect(screen.queryByText("Operation succeeded")).not.toBeInTheDocument();
  });

  it("renders for danger variant", () => {
    expect(() => renderToast({ alertVariant: ToastAlertVariant.DANGER })).not.toThrow();
  });

  it("renders for banner toast variant", () => {
    expect(() => renderToast({ toastVariant: ToastVariant.BANNER })).not.toThrow();
  });
});
