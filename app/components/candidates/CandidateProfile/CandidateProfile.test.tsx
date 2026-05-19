import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "../../../utils/test-utils";
import MockAdapter from "axios-mock-adapter";
import axiosClient from "@/app/lib/axiosClient";
import type { Candidate } from "@/app/components/candidates/types";
import CandidateProfile from "./CandidateProfile";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: mockBack, replace: vi.fn() }),
  usePathname: () => "/candidates/cand-001",
  useSearchParams: () => new URLSearchParams(),
}));

const mockBack = vi.fn();
const api = new MockAdapter(axiosClient);

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

beforeEach(() => {
  api.reset();
  mockBack.mockReset();
  localStorage.clear();
});

afterAll(() => api.restore());

describe("CandidateProfile", () => {
  it("shows the loading spinner while data is fetching", () => {
    api.onGet("/candidates/cand-001").reply(() => new Promise(() => {}));
    render(<CandidateProfile candidateId="cand-001" />);
    expect(screen.getByText("Loading candidate...")).toBeInTheDocument();
  });

  it("renders the candidate name after loading", async () => {
    api.onGet("/candidates/cand-001").reply(200, CANDIDATE);
    render(<CandidateProfile candidateId="cand-001" />);
    await waitFor(() => expect(screen.getByText("Ana García")).toBeInTheDocument());
  });

  it("renders candidate email and phone", async () => {
    api.onGet("/candidates/cand-001").reply(200, CANDIDATE);
    render(<CandidateProfile candidateId="cand-001" />);
    await waitFor(() => expect(screen.getByText("ana@example.com")).toBeInTheDocument());
    expect(screen.getByText("+54 11 1234-5678")).toBeInTheDocument();
  });

  it("renders the back navigation button", async () => {
    api.onGet("/candidates/cand-001").reply(200, CANDIDATE);
    render(<CandidateProfile candidateId="cand-001" />);
    await waitFor(() => screen.getByText("Ana García"));
    expect(screen.getByRole("button", { name: /back to candidates/i })).toBeInTheDocument();
  });

  it("shows error state when the API request fails", async () => {
    api.onGet("/candidates/cand-001").reply(404, { message: "Not found" });
    render(<CandidateProfile candidateId="cand-001" />);
    await waitFor(() => expect(screen.getByText("Candidate not found")).toBeInTheDocument());
  });

  it("calls router.back() when back button is clicked in error state", async () => {
    api.onGet("/candidates/cand-001").reply(500);
    render(<CandidateProfile candidateId="cand-001" />);
    const backBtn = await screen.findByRole("button", { name: /candidates/i });
    fireEvent.click(backBtn);
    expect(mockBack).toHaveBeenCalledOnce();
  });

  it("adds a note when the Add button is clicked", async () => {
    api.onGet("/candidates/cand-001").reply(200, CANDIDATE);
    render(<CandidateProfile candidateId="cand-001" />);
    await waitFor(() => screen.getByText("Ana García"));

    const textarea = screen.getByRole("textbox", { name: /add a recruiter note/i });
    fireEvent.change(textarea, { target: { value: "Great candidate!" } });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));

    expect(screen.getByText("Great candidate!")).toBeInTheDocument();
  });

  it("Add button is disabled when note input is empty", async () => {
    api.onGet("/candidates/cand-001").reply(200, CANDIDATE);
    render(<CandidateProfile candidateId="cand-001" />);
    await waitFor(() => screen.getByText("Ana García"));
    expect(screen.getByRole("button", { name: /add/i })).toBeDisabled();
  });

  it("deletes a note when the delete button is clicked", async () => {
    api.onGet("/candidates/cand-001").reply(200, CANDIDATE);
    render(<CandidateProfile candidateId="cand-001" />);
    await waitFor(() => screen.getByText("Ana García"));

    // Add a note first
    const textarea = screen.getByRole("textbox", { name: /add a recruiter note/i });
    fireEvent.change(textarea, { target: { value: "Note to delete" } });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
    expect(screen.getByText("Note to delete")).toBeInTheDocument();

    // Delete it
    const deleteBtn = screen.getByRole("button", { name: /delete note/i });
    fireEvent.click(deleteBtn);
    await waitFor(() => expect(screen.queryByText("Note to delete")).not.toBeInTheDocument());
  });

  it("calls PATCH to toggle interview status", async () => {
    api.onGet("/candidates/cand-001").reply(200, CANDIDATE);
    api.onPatch("/candidates/cand-001").reply(200, { ...CANDIDATE, had_interview: "Si" });
    render(<CandidateProfile candidateId="cand-001" />);
    await waitFor(() => screen.getByText("Ana García"));

    fireEvent.click(screen.getByRole("button", { name: /mark interview done/i }));
    await waitFor(() => expect(api.history.patch).toHaveLength(1));
    expect(JSON.parse(api.history.patch[0].data)).toEqual({ had_interview: "Si" });
  });

  it("shows university degree badge when has_university=Si", async () => {
    api.onGet("/candidates/cand-001").reply(200, CANDIDATE);
    render(<CandidateProfile candidateId="cand-001" />);
    await waitFor(() => screen.getByText("University degree"));
  });

  it("shows rejection notes card when reason is present", async () => {
    const candidateWithReason = { ...CANDIDATE, reason: "Missing required experience." };
    api.onGet("/candidates/cand-001").reply(200, candidateWithReason);
    render(<CandidateProfile candidateId="cand-001" />);
    await waitFor(() =>
      expect(screen.getByText("Missing required experience.")).toBeInTheDocument()
    );
    expect(screen.getByText("REJECTION NOTES")).toBeInTheDocument();
  });
});
