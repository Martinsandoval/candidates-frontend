import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "../../../utils/test-utils";
import MockAdapter from "axios-mock-adapter";
import axiosClient from "@/app/lib/axiosClient";
import CandidatesTableActionMenu from "./CandidatesTableActionMenu";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, back: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

const mockPush = vi.fn();
const api = new MockAdapter(axiosClient);

beforeEach(() => {
  api.reset();
  mockPush.mockReset();
});

afterAll(() => api.restore());

describe("CandidatesTableActionMenu", () => {
  it("renders the action trigger button", () => {
    render(<CandidatesTableActionMenu candidateId="cand-001" />);
    expect(screen.getByRole("button", { name: "Row actions" })).toBeInTheDocument();
  });

  it("opens the dropdown menu on trigger click", async () => {
    const user = userEvent.setup();
    render(<CandidatesTableActionMenu candidateId="cand-001" />);
    await user.click(screen.getByRole("button", { name: "Row actions" }));
    expect(await screen.findByText("View Profile")).toBeInTheDocument();
  });

  it("navigates to candidate profile on View Profile click", async () => {
    const user = userEvent.setup();
    render(<CandidatesTableActionMenu candidateId="cand-001" />);
    await user.click(screen.getByRole("button", { name: "Row actions" }));
    await user.click(await screen.findByText("View Profile"));
    expect(mockPush).toHaveBeenCalledWith("/candidates/cand-001");
  });

  it("calls PATCH approve endpoint on Approve click", async () => {
    const user = userEvent.setup();
    api.onPatch("/candidates/cand-001/approve").reply(200);
    render(<CandidatesTableActionMenu candidateId="cand-001" />);
    await user.click(screen.getByRole("button", { name: "Row actions" }));
    await user.click(await screen.findByText("Approve"));
    await waitFor(() => expect(api.history.patch).toHaveLength(1));
    expect(api.history.patch[0].url).toBe("/candidates/cand-001/approve");
  });

  it("opens reject dialog on Reject click", async () => {
    const user = userEvent.setup();
    render(<CandidatesTableActionMenu candidateId="cand-001" />);
    await user.click(screen.getByRole("button", { name: "Row actions" }));
    await user.click(await screen.findByText("Reject"));
    expect(await screen.findByRole("heading", { name: "Reject Candidate" })).toBeInTheDocument();
  });

  it("disables Reject Candidate button when reason is empty", async () => {
    const user = userEvent.setup();
    render(<CandidatesTableActionMenu candidateId="cand-001" />);
    await user.click(screen.getByRole("button", { name: "Row actions" }));
    await user.click(await screen.findByText("Reject"));
    const rejectBtn = await screen.findByRole("button", { name: "Reject Candidate" });
    expect(rejectBtn).toBeDisabled();
  });

  it("calls PATCH reject endpoint with reason on confirm", async () => {
    const user = userEvent.setup();
    api.onPatch("/candidates/cand-001/reject").reply(200);
    render(<CandidatesTableActionMenu candidateId="cand-001" />);
    await user.click(screen.getByRole("button", { name: "Row actions" }));
    await user.click(await screen.findByText("Reject"));

    const textarea = await screen.findByRole("textbox", { name: /rejection reason/i });
    await user.type(textarea, "Not a good fit.");

    const rejectBtn = screen.getByRole("button", { name: "Reject Candidate" });
    expect(rejectBtn).not.toBeDisabled();
    await user.click(rejectBtn);

    await waitFor(() => expect(api.history.patch).toHaveLength(1));
    expect(JSON.parse(api.history.patch[0].data)).toEqual({ reason: "Not a good fit." });
  });

  it("closes reject dialog on Cancel click", async () => {
    const user = userEvent.setup();
    render(<CandidatesTableActionMenu candidateId="cand-001" />);
    await user.click(screen.getByRole("button", { name: "Row actions" }));
    await user.click(await screen.findByText("Reject"));
    await user.click(await screen.findByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Reject Candidate" })).not.toBeInTheDocument()
    );
  });

  it("shows error toast when approve API call fails", async () => {
    const user = userEvent.setup();
    api.onPatch("/candidates/cand-001/approve").reply(500);
    render(<CandidatesTableActionMenu candidateId="cand-001" />);
    await user.click(screen.getByRole("button", { name: "Row actions" }));
    await user.click(await screen.findByText("Approve"));
    await waitFor(() =>
      expect(screen.getByText("Failed to approve candidate")).toBeInTheDocument()
    );
  });

  it("shows error toast when reject API call fails", async () => {
    const user = userEvent.setup();
    api.onPatch("/candidates/cand-001/reject").reply(500);
    render(<CandidatesTableActionMenu candidateId="cand-001" />);
    await user.click(screen.getByRole("button", { name: "Row actions" }));
    await user.click(await screen.findByText("Reject"));

    const textarea = await screen.findByRole("textbox", { name: /rejection reason/i });
    await user.type(textarea, "Not suitable.");
    await user.click(screen.getByRole("button", { name: "Reject Candidate" }));

    await waitFor(() => expect(screen.getByText("Failed to reject candidate")).toBeInTheDocument());
  });
});
