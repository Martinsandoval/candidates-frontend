import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Theme } from "@radix-ui/themes";
import AppHeader from "./AppHeader";

describe("AppHeader", () => {
  it("renders a banner landmark", () => {
    render(
      <Theme>
        <AppHeader />
      </Theme>
    );
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("displays the application name", () => {
    render(
      <Theme>
        <AppHeader />
      </Theme>
    );
    expect(screen.getByText("EmiLabs")).toBeInTheDocument();
  });

  it("displays the logo mark", () => {
    render(
      <Theme>
        <AppHeader />
      </Theme>
    );
    expect(screen.getByText("EL")).toBeInTheDocument();
  });
});
