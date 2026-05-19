import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Theme, Table } from "@radix-ui/themes";
import TableList, { type SortingState } from "./TableList";

interface Item {
  id: string;
  name: string;
  score: number;
}

const items: Item[] = Array.from({ length: 12 }, (_, i) => ({
  id: String(i),
  name: `Candidate ${i + 1}`,
  score: i * 10,
}));

const columns = [
  { thKey: "name", thContent: "Name", sortable: true, sortAccessor: (c: Item) => c.name },
  { thKey: "score", thContent: "Score", sortable: true, sortAccessor: (c: Item) => c.score },
];

function RowComponent({ item }: { item: Item }) {
  return (
    <Table.Row data-testid={`row-${item.id}`}>
      <Table.Cell>{item.name}</Table.Cell>
      <Table.Cell>{item.score}</Table.Cell>
    </Table.Row>
  );
}

function renderTable(overrides?: {
  itemList?: Item[];
  sorting?: SortingState;
  onSortingChange?: (s: SortingState) => void;
}) {
  const { itemList = items, sorting, onSortingChange } = overrides ?? {};
  return render(
    <Theme>
      <TableList
        tKey="test"
        items={itemList}
        tColumns={columns}
        sorting={sorting}
        onSortingChange={onSortingChange}
      >
        {(item) => <RowComponent key={item.id} item={item} />}
      </TableList>
    </Theme>
  );
}

describe("TableList", () => {
  it("renders the first page of items (default 10)", () => {
    renderTable();
    expect(screen.getByText("Candidate 1")).toBeInTheDocument();
    expect(screen.getByText("Candidate 10")).toBeInTheDocument();
    expect(screen.queryByText("Candidate 11")).not.toBeInTheDocument();
  });

  it("renders all items when count is below the page size threshold", () => {
    const few = items.slice(0, 3);
    renderTable({ itemList: few });
    expect(screen.getByText("Candidate 1")).toBeInTheDocument();
    expect(screen.getByText("Candidate 3")).toBeInTheDocument();
    // Pagination controls should not appear for <= 10 items
    expect(screen.queryByText("Previous")).not.toBeInTheDocument();
  });

  it("shows pagination controls when item count exceeds page size", () => {
    renderTable();
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous" })).toBeInTheDocument();
  });

  it("Previous button is disabled on the first page", () => {
    renderTable();
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  });

  it("navigates to next page when Next is clicked", () => {
    renderTable();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Candidate 11")).toBeInTheDocument();
    expect(screen.queryByText("Candidate 1")).not.toBeInTheDocument();
  });

  it("renders column headers", () => {
    renderTable();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Score")).toBeInTheDocument();
  });

  it("calls onSortingChange when a sortable header is clicked", () => {
    const onSortingChange = vi.fn();
    renderTable({ sorting: [], onSortingChange });
    fireEvent.click(screen.getByText("Name"));
    expect(onSortingChange).toHaveBeenCalledOnce();
  });

  it("does not render pagination for an empty item list", () => {
    renderTable({ itemList: [] });
    expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
  });

  it("shows 'Showing all X items' text when pageSize is all", async () => {
    // localStorage preset triggers the 'all' pageSize path via useUserPreferences
    localStorage.setItem("candidates-prefs", JSON.stringify({ pageSize: "all" }));
    renderTable();
    expect(await screen.findByText(`Showing all ${items.length} items`)).toBeInTheDocument();
  });

  it("shows ascending sort icon after first header click", () => {
    renderTable({ sorting: [{ id: "name", desc: false }], onSortingChange: vi.fn() });
    // aria-sort="ascending" is applied to the sorted column header
    const sortedHeader = screen.getByRole("columnheader", { name: /name/i });
    expect(sortedHeader).toHaveAttribute("aria-sort", "ascending");
  });

  it("shows descending sort icon after descending sort", () => {
    renderTable({ sorting: [{ id: "score", desc: true }], onSortingChange: vi.fn() });
    const sortedHeader = screen.getByRole("columnheader", { name: /score/i });
    expect(sortedHeader).toHaveAttribute("aria-sort", "descending");
  });

  it("navigates back to previous page when Previous is clicked", () => {
    renderTable();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Candidate 11")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(screen.getByText("Candidate 1")).toBeInTheDocument();
  });

  it("Next button is disabled on the last page", () => {
    renderTable();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("shows Showing X-Y of Z range text while paginating", () => {
    renderTable();
    expect(screen.getByText(`Showing 1–10 of ${items.length}`)).toBeInTheDocument();
  });
});
