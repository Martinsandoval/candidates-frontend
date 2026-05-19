import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { fireEvent, render, screen, waitFor } from "../../../utils/test-utils";
import MockAdapter from "axios-mock-adapter";
import axiosClient from "@/app/lib/axiosClient";
import type { Candidate } from "@/app/components/candidates/types";
import CandidatesTable from "./CandidatesTable";

const mockReplace = vi.fn();
let searchParamsStr = "";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), replace: mockReplace }),
  usePathname: () => "/candidates",
  useSearchParams: () => new URLSearchParams(searchParamsStr),
}));

vi.mock("next/link", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const api = new MockAdapter(axiosClient);

const COLUMNS = {
  name: true,
  career: true,
  email: true,
  phone: false,
  age: false,
  location: false,
  desired_salary: false,
  courses_approved: false,
  has_university: false,
  graduated: false,
  accepts_working_hours: false,
  had_interview: false,
  cv_zonajobs: false,
  cv_bumeran: false,
  document: false,
  date: false,
  reason: false,
  id: false,
};

const CANDIDATES: Candidate[] = [
  {
    id: "cand-001",
    name: "Ana García",
    document: 12345678,
    cv_zonajobs: "",
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
  },
  {
    id: "cand-002",
    name: "Carlos López",
    document: 87654321,
    cv_zonajobs: "",
    cv_bumeran: "",
    phone: "+54 11 9876-5432",
    email: "carlos@example.com",
    date: "2024-02-01",
    age: 32,
    has_university: "No",
    career: "Marketing",
    graduated: "",
    courses_approved: "2",
    location: "Córdoba",
    accepts_working_hours: "No",
    desired_salary: "40000",
    had_interview: "Si",
    reason: "",
  },
];

// Candidates with reasons for filter testing
const CANDIDATES_WITH_REASONS: Candidate[] = [
  { ...CANDIDATES[0], reason: "Not a fit for the role" },
  { ...CANDIDATES[1], reason: "" },
];

beforeEach(() => {
  api.reset();
  localStorage.clear();
  mockReplace.mockReset();
  searchParamsStr = "";
});

afterAll(() => api.restore());

describe("CandidatesTable", () => {
  it("shows the loading skeleton while data is fetching", () => {
    api.onGet("/columns").reply(() => new Promise(() => {}));
    api.onGet("/candidates").reply(() => new Promise(() => {}));
    render(<CandidatesTable />);
    expect(screen.getByText("Candidates")).toBeInTheDocument();
  });

  it("renders candidate rows after data loads", async () => {
    api.onGet("/columns").reply(200, COLUMNS);
    api.onGet("/candidates").reply(200, CANDIDATES);
    render(<CandidatesTable />);
    await waitFor(() => expect(screen.getByText("Ana García")).toBeInTheDocument());
    expect(screen.getByText("Carlos López")).toBeInTheDocument();
  });

  it("shows candidate count badge", async () => {
    api.onGet("/columns").reply(200, COLUMNS);
    api.onGet("/candidates").reply(200, CANDIDATES);
    render(<CandidatesTable />);
    await waitFor(() => expect(screen.getByText("2")).toBeInTheDocument());
  });

  it("shows empty state when candidates list is empty", async () => {
    api.onGet("/columns").reply(200, COLUMNS);
    api.onGet("/candidates").reply(200, []);
    render(<CandidatesTable />);
    await waitFor(() => expect(screen.getByText("No candidates yet")).toBeInTheDocument());
  });

  it("shows error empty state when candidates request fails", async () => {
    api.onGet("/columns").reply(200, COLUMNS);
    api.onGet("/candidates").reply(500);
    render(<CandidatesTable />);
    await waitFor(() => expect(screen.getByText("Failed to load candidates")).toBeInTheDocument());
  });

  it("renders the Columns toggle button", async () => {
    api.onGet("/columns").reply(200, COLUMNS);
    api.onGet("/candidates").reply(200, CANDIDATES);
    render(<CandidatesTable />);
    await waitFor(() => expect(screen.getByText("Ana García")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /columns/i })).toBeInTheDocument();
  });

  it("filters candidates by hasReason=yes via searchParams", async () => {
    searchParamsStr = "reason=yes";
    api.onGet("/columns").reply(200, COLUMNS);
    api.onGet("/candidates").reply(200, CANDIDATES_WITH_REASONS);
    render(<CandidatesTable />);
    await waitFor(() => expect(screen.getByText("Ana García")).toBeInTheDocument());
    expect(screen.queryByText("Carlos López")).not.toBeInTheDocument();
  });

  it("filters candidates by hasReason=no via searchParams", async () => {
    searchParamsStr = "reason=no";
    api.onGet("/columns").reply(200, COLUMNS);
    api.onGet("/candidates").reply(200, CANDIDATES_WITH_REASONS);
    render(<CandidatesTable />);
    await waitFor(() => expect(screen.getByText("Carlos López")).toBeInTheDocument());
    expect(screen.queryByText("Ana García")).not.toBeInTheDocument();
  });

  it("filters candidates by hasUniversity=yes via searchParams", async () => {
    searchParamsStr = "university=yes";
    api.onGet("/columns").reply(200, COLUMNS);
    api.onGet("/candidates").reply(200, CANDIDATES);
    render(<CandidatesTable />);
    await waitFor(() => expect(screen.getByText("Ana García")).toBeInTheDocument());
    expect(screen.queryByText("Carlos López")).not.toBeInTheDocument();
  });

  it("filters candidates by hasUniversity=no via searchParams", async () => {
    searchParamsStr = "university=no";
    api.onGet("/columns").reply(200, COLUMNS);
    api.onGet("/candidates").reply(200, CANDIDATES);
    render(<CandidatesTable />);
    await waitFor(() => expect(screen.getByText("Carlos López")).toBeInTheDocument());
    expect(screen.queryByText("Ana García")).not.toBeInTheDocument();
  });

  it("filters candidates by salary range via searchParams", async () => {
    searchParamsStr = "salaryMin=45000&salaryMax=60000";
    api.onGet("/columns").reply(200, COLUMNS);
    api.onGet("/candidates").reply(200, CANDIDATES);
    render(<CandidatesTable />);
    await waitFor(() => expect(screen.getByText("Ana García")).toBeInTheDocument());
    expect(screen.queryByText("Carlos López")).not.toBeInTheDocument();
  });

  it("shows 'no candidates match' empty state when all are filtered out", async () => {
    searchParamsStr = "reason=yes";
    api.onGet("/columns").reply(200, COLUMNS);
    api.onGet("/candidates").reply(200, CANDIDATES); // both have reason: ""
    render(<CandidatesTable />);
    await waitFor(() =>
      expect(screen.getByText("No candidates match your filters")).toBeInTheDocument()
    );
  });

  it("shows filter ratio badge when filters are active", async () => {
    searchParamsStr = "reason=yes";
    api.onGet("/columns").reply(200, COLUMNS);
    api.onGet("/candidates").reply(200, CANDIDATES_WITH_REASONS);
    render(<CandidatesTable />);
    // Badge shows "X / total" when filters are active
    await waitFor(() => expect(screen.getByText("1 / 2")).toBeInTheDocument());
  });

  it("calls router.replace when a sortable column header is clicked", async () => {
    api.onGet("/columns").reply(200, { ...COLUMNS, name: true });
    api.onGet("/candidates").reply(200, CANDIDATES);
    render(<CandidatesTable />);
    await waitFor(() => screen.getByText("Ana García"));
    fireEvent.click(screen.getByRole("columnheader", { name: /name/i }));
    expect(mockReplace).toHaveBeenCalled();
  });

  it("includes active filter params in URL when sorting changes", async () => {
    // reason=yes keeps Ana (has reason) and hides Carlos (no reason)
    searchParamsStr = "reason=yes";
    api.onGet("/columns").reply(200, { ...COLUMNS, name: true });
    api.onGet("/candidates").reply(200, CANDIDATES_WITH_REASONS);
    render(<CandidatesTable />);
    await waitFor(() => screen.getByText("Ana García"));
    fireEvent.click(screen.getByRole("columnheader", { name: /name/i }));
    const replaceArg = mockReplace.mock.calls[0][0] as string;
    expect(replaceArg).toContain("reason=yes");
    expect(replaceArg).toContain("sortBy=name");
  });

  it("restores sort state from searchParams on initial render", async () => {
    searchParamsStr = "sortBy=name&sortDir=asc";
    api.onGet("/columns").reply(200, { ...COLUMNS, name: true });
    api.onGet("/candidates").reply(200, CANDIDATES);
    render(<CandidatesTable />);
    await waitFor(() => screen.getByText("Ana García"));
    const nameHeader = screen.getByRole("columnheader", { name: /name/i });
    expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
  });

  it("toggles column visibility via the Columns dropdown", async () => {
    const user = userEvent.setup();
    // phone: false → Phone column NOT in table, so "Phone" only appears in dropdown
    api.onGet("/columns").reply(200, COLUMNS);
    api.onGet("/candidates").reply(200, CANDIDATES);
    render(<CandidatesTable />);
    await waitFor(() => screen.getByText("Ana García"));
    await user.click(screen.getByRole("button", { name: /columns/i }));
    // findByText is unambiguous: Phone header is not rendered because phone: false
    const phoneItem = await screen.findByText("Phone");
    await user.click(phoneItem);
    const stored = JSON.parse(localStorage.getItem("candidates-columns-visibility") ?? "{}");
    // phone should now be toggled from false → true
    expect(stored.phone).toBe(true);
  });

  it("loads column visibility from localStorage on initial render", async () => {
    localStorage.setItem(
      "candidates-columns-visibility",
      JSON.stringify({ ...COLUMNS, phone: true, name: true })
    );
    api.onGet("/columns").reply(200, COLUMNS);
    api.onGet("/candidates").reply(200, CANDIDATES);
    render(<CandidatesTable />);
    await waitFor(() => screen.getByText("Ana García"));
    // "Phone" header should be visible if loaded from storage
    expect(screen.getByRole("columnheader", { name: /phone/i })).toBeInTheDocument();
  });

  it("updates URL when hasReason filter changes via CandidatesFilters", async () => {
    const user = userEvent.setup();
    api.onGet("/columns").reply(200, COLUMNS);
    api.onGet("/candidates").reply(200, CANDIDATES);
    render(<CandidatesTable />);
    await waitFor(() => screen.getByText("Ana García"));
    await user.click(screen.getByRole("button", { name: /filters/i }));
    await screen.findByText("REJECTION REASON");
    // Radix SegmentedControl items have role="radio"
    await user.click(screen.getByRole("radio", { name: "Has reason" }));
    expect(mockReplace).toHaveBeenCalled();
    const replaceArg = mockReplace.mock.calls[0][0] as string;
    expect(replaceArg).toContain("reason=yes");
  });

  it("renders the search input", async () => {
    api.onGet("/columns").reply(200, COLUMNS);
    api.onGet("/candidates").reply(200, CANDIDATES);
    render(<CandidatesTable />);
    await waitFor(() => screen.getByText("Ana García"));
    expect(screen.getByRole("textbox", { name: /search candidates/i })).toBeInTheDocument();
  });

  it("filters candidates by search term (name match)", async () => {
    const user = userEvent.setup();
    api.onGet("/columns").reply(200, COLUMNS);
    api.onGet("/candidates").reply(200, CANDIDATES);
    render(<CandidatesTable />);
    await waitFor(() => screen.getByText("Ana García"));
    await user.type(screen.getByRole("textbox", { name: /search candidates/i }), "Ana");
    expect(screen.getByText("Ana García")).toBeInTheDocument();
    expect(screen.queryByText("Carlos López")).not.toBeInTheDocument();
  });

  it("filters candidates by search term (career match)", async () => {
    const user = userEvent.setup();
    api.onGet("/columns").reply(200, COLUMNS);
    api.onGet("/candidates").reply(200, CANDIDATES);
    render(<CandidatesTable />);
    await waitFor(() => screen.getByText("Ana García"));
    await user.type(screen.getByRole("textbox", { name: /search candidates/i }), "marketing");
    expect(screen.getByText("Carlos López")).toBeInTheDocument();
    expect(screen.queryByText("Ana García")).not.toBeInTheDocument();
  });

  it("shows 'no candidates match' empty state when search has no results", async () => {
    const user = userEvent.setup();
    api.onGet("/columns").reply(200, COLUMNS);
    api.onGet("/candidates").reply(200, CANDIDATES);
    render(<CandidatesTable />);
    await waitFor(() => screen.getByText("Ana García"));
    await user.type(
      screen.getByRole("textbox", { name: /search candidates/i }),
      "zzznomatch999"
    );
    expect(screen.getByText("No candidates match your filters")).toBeInTheDocument();
  });

  it("restores search term from searchParams on initial render", async () => {
    searchParamsStr = "search=Ana";
    api.onGet("/columns").reply(200, COLUMNS);
    api.onGet("/candidates").reply(200, CANDIDATES);
    render(<CandidatesTable />);
    await waitFor(() => screen.getByText("Ana García"));
    expect(screen.getByRole("textbox", { name: /search candidates/i })).toHaveValue("Ana");
    expect(screen.queryByText("Carlos López")).not.toBeInTheDocument();
  });

  it("shows clear button and resets search on click", async () => {
    const user = userEvent.setup();
    api.onGet("/columns").reply(200, COLUMNS);
    api.onGet("/candidates").reply(200, CANDIDATES);
    render(<CandidatesTable />);
    await waitFor(() => screen.getByText("Ana García"));
    const input = screen.getByRole("textbox", { name: /search candidates/i });
    await user.type(input, "Ana");
    const clearBtn = screen.getByRole("button", { name: "Clear search" });
    await user.click(clearBtn);
    expect(input).toHaveValue("");
    expect(screen.getByText("Carlos López")).toBeInTheDocument();
  });
});
