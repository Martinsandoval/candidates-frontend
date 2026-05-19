import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { Table, Theme } from "@radix-ui/themes";
import type * as ReactQuery from "@tanstack/react-query";
import CandidatesTableRow from "./CandidatesTableRow";
import type { Candidate } from "@/app/components/candidates/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual<typeof ReactQuery>("@tanstack/react-query");
  return {
    ...actual,
    useMutation: () => ({ mutate: vi.fn(), isPending: false, reset: vi.fn() }),
    useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  };
});

const CANDIDATE: Candidate = {
  id: "cand-001",
  name: "Ana García",
  document: 12345678,
  cv_zonajobs: "https://zonajobs.com/cv/1",
  cv_bumeran: "",
  phone: "+54 11 1234-5678",
  email: "ana@example.com",
  date: "2024-01-15",
  age: 28,
  has_university: "Si",
  career: "Computer Science",
  graduated: "2019",
  courses_approved: "5",
  location: "Buenos Aires",
  accepts_working_hours: "Si",
  desired_salary: "50000",
  had_interview: "No",
  reason: "",
};

function renderRow(visibleColumns: (keyof Candidate)[]) {
  return render(
    <Theme>
      <Table.Root>
        <Table.Body>
          <CandidatesTableRow candidate={CANDIDATE} visibleColumns={visibleColumns} />
        </Table.Body>
      </Table.Root>
    </Theme>
  );
}

describe("CandidatesTableRow", () => {
  it("renders the candidate name", () => {
    renderRow(["name"]);
    expect(screen.getByText("Ana García")).toBeInTheDocument();
  });

  it("renders university badge as Yes when has_university=Si", () => {
    renderRow(["has_university"]);
    expect(screen.getByText("Yes")).toBeInTheDocument();
  });

  it("renders university badge as No when has_university is not Si", () => {
    const candidate = { ...CANDIDATE, has_university: "No" };
    render(
      <Theme>
        <Table.Root>
          <Table.Body>
            <CandidatesTableRow candidate={candidate} visibleColumns={["has_university"]} />
          </Table.Body>
        </Table.Root>
      </Theme>
    );
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  it("renders a CV link when cv_zonajobs is provided", () => {
    renderRow(["cv_zonajobs"]);
    expect(screen.getByRole("link", { name: "View CV" })).toBeInTheDocument();
  });

  it("renders em-dash when cv_bumeran is empty", () => {
    renderRow(["cv_bumeran"]);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders em-dash when phone is empty", () => {
    const candidate = { ...CANDIDATE, phone: "" };
    render(
      <Theme>
        <Table.Root>
          <Table.Body>
            <CandidatesTableRow candidate={candidate} visibleColumns={["phone"]} />
          </Table.Body>
        </Table.Root>
      </Theme>
    );
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders formatted salary", () => {
    renderRow(["desired_salary"]);
    expect(screen.getByText("$50,000")).toBeInTheDocument();
  });

  it("renders had_interview badge as No", () => {
    renderRow(["had_interview"]);
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  it("renders the actions cell", () => {
    renderRow([]);
    // Actions column is always appended
    expect(screen.getByRole("button", { name: "Row actions" })).toBeInTheDocument();
  });

  it("renders had_interview badge as Yes when had_interview=Si", () => {
    const candidate = { ...CANDIDATE, had_interview: "Si" };
    render(
      <Theme>
        <Table.Root>
          <Table.Body>
            <CandidatesTableRow candidate={candidate} visibleColumns={["had_interview"]} />
          </Table.Body>
        </Table.Root>
      </Theme>
    );
    expect(screen.getByText("Yes")).toBeInTheDocument();
  });

  it("renders accepts_working_hours badge as No when not Si", () => {
    const candidate = { ...CANDIDATE, accepts_working_hours: "No" };
    render(
      <Theme>
        <Table.Root>
          <Table.Body>
            <CandidatesTableRow candidate={candidate} visibleColumns={["accepts_working_hours"]} />
          </Table.Body>
        </Table.Root>
      </Theme>
    );
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  it("renders accepts_working_hours badge as Yes when Si", () => {
    renderRow(["accepts_working_hours"]);
    expect(screen.getByText("Yes")).toBeInTheDocument();
  });

  it("renders formatted date when date is provided", () => {
    renderRow(["date"]);
    // "2024-01-15" localeDateString varies by locale; just check it's not em-dash
    expect(screen.queryByText("—")).not.toBeInTheDocument();
  });

  it("renders em-dash when date is empty", () => {
    const candidate = { ...CANDIDATE, date: "" };
    render(
      <Theme>
        <Table.Root>
          <Table.Body>
            <CandidatesTableRow candidate={candidate} visibleColumns={["date"]} />
          </Table.Body>
        </Table.Root>
      </Theme>
    );
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders email text", () => {
    renderRow(["email"]);
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
  });

  it("renders the copy email button when email is present", () => {
    renderRow(["email"]);
    expect(screen.getByRole("button", { name: "Copy email" })).toBeInTheDocument();
  });

  it("does not render the copy email button when email is empty", () => {
    const candidate = { ...CANDIDATE, email: "" };
    render(
      <Theme>
        <Table.Root>
          <Table.Body>
            <CandidatesTableRow candidate={candidate} visibleColumns={["email"]} />
          </Table.Body>
        </Table.Root>
      </Theme>
    );
    expect(screen.queryByRole("button", { name: "Copy email" })).not.toBeInTheDocument();
  });

  it("copies email to clipboard when copy button is clicked", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    renderRow(["email"]);
    await user.click(screen.getByRole("button", { name: "Copy email" }));
    expect(writeText).toHaveBeenCalledWith("ana@example.com");
  });

  it("renders em-dash when email is empty", () => {
    const candidate = { ...CANDIDATE, email: "" };
    render(
      <Theme>
        <Table.Root>
          <Table.Body>
            <CandidatesTableRow candidate={candidate} visibleColumns={["email"]} />
          </Table.Body>
        </Table.Root>
      </Theme>
    );
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders career text", () => {
    renderRow(["career"]);
    expect(screen.getByText("Computer Science")).toBeInTheDocument();
  });

  it("renders em-dash when career is empty", () => {
    const candidate = { ...CANDIDATE, career: "" };
    render(
      <Theme>
        <Table.Root>
          <Table.Body>
            <CandidatesTableRow candidate={candidate} visibleColumns={["career"]} />
          </Table.Body>
        </Table.Root>
      </Theme>
    );
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders location text", () => {
    renderRow(["location"]);
    expect(screen.getByText("Buenos Aires")).toBeInTheDocument();
  });

  it("renders em-dash when location is empty", () => {
    const candidate = { ...CANDIDATE, location: "" };
    render(
      <Theme>
        <Table.Root>
          <Table.Body>
            <CandidatesTableRow candidate={candidate} visibleColumns={["location"]} />
          </Table.Body>
        </Table.Root>
      </Theme>
    );
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders reason text when present", () => {
    const candidate = { ...CANDIDATE, reason: "Not a fit for the role" };
    render(
      <Theme>
        <Table.Root>
          <Table.Body>
            <CandidatesTableRow candidate={candidate} visibleColumns={["reason"]} />
          </Table.Body>
        </Table.Root>
      </Theme>
    );
    expect(screen.getByText("Not a fit for the role")).toBeInTheDocument();
  });

  it("renders em-dash when reason is empty", () => {
    renderRow(["reason"]);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders a CV link when cv_bumeran is provided", () => {
    const candidate = { ...CANDIDATE, cv_bumeran: "https://bumeran.com/cv/1" };
    render(
      <Theme>
        <Table.Root>
          <Table.Body>
            <CandidatesTableRow candidate={candidate} visibleColumns={["cv_bumeran"]} />
          </Table.Body>
        </Table.Root>
      </Theme>
    );
    expect(screen.getByRole("link", { name: "View CV" })).toBeInTheDocument();
  });

  it("renders the last 8 chars of id in the id cell", () => {
    renderRow(["id"]);
    expect(screen.getByText(CANDIDATE.id.slice(-8))).toBeInTheDocument();
  });

  it("renders age value", () => {
    renderRow(["age"]);
    expect(screen.getByText("28")).toBeInTheDocument();
  });

  it("renders graduated text", () => {
    renderRow(["graduated"]);
    expect(screen.getByText("2019")).toBeInTheDocument();
  });

  it("renders courses_approved text", () => {
    renderRow(["courses_approved"]);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders document text", () => {
    renderRow(["document"]);
    expect(screen.getByText("12345678")).toBeInTheDocument();
  });
});
