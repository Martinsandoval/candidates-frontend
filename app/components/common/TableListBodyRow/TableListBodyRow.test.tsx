import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Theme, Table } from "@radix-ui/themes";
import TableListBodyRow from "./TableListBodyRow";

type TestCellType = "name" | "email" | "status";

const cellMap: Record<TestCellType, React.FC<React.PropsWithChildren>> = {
  name: () => <span>Ana García</span>,
  email: () => <span>ana@example.com</span>,
  status: () => <span>Active</span>,
};

function wrap(ui: React.ReactElement) {
  return render(
    <Theme>
      <Table.Root>
        <Table.Body>{ui}</Table.Body>
      </Table.Root>
    </Theme>
  );
}

describe("TableListBodyRow", () => {
  it("renders cells in the specified order", () => {
    wrap(
      <TableListBodyRow
        cellTypeComponentMap={cellMap}
        tbodyCells={[{ type: "name" }, { type: "email" }]}
      />
    );
    expect(screen.getByText("Ana García")).toBeInTheDocument();
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
    expect(screen.queryByText("Active")).not.toBeInTheDocument();
  });

  it("applies data-testid to each cell", () => {
    wrap(
      <TableListBodyRow
        cellTypeComponentMap={cellMap}
        tbodyCells={[{ type: "name" }, { type: "status" }]}
      />
    );
    expect(screen.getByTestId("table-cell-name")).toBeInTheDocument();
    expect(screen.getByTestId("table-cell-status")).toBeInTheDocument();
  });

  it("renders the row with data-testid", () => {
    wrap(
      <TableListBodyRow cellTypeComponentMap={cellMap} tbodyCells={[{ type: "name" }]} />
    );
    expect(screen.getByTestId("table-list-body-row")).toBeInTheDocument();
  });

  it("fires onClick when the row is clicked", () => {
    const onClick = vi.fn();
    wrap(
      <TableListBodyRow
        cellTypeComponentMap={cellMap}
        tbodyCells={[{ type: "name" }]}
        onClick={onClick}
      />
    );
    fireEvent.click(screen.getByTestId("table-list-body-row"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("applies trClassName to the row", () => {
    wrap(
      <TableListBodyRow
        cellTypeComponentMap={cellMap}
        tbodyCells={[{ type: "name" }]}
        trClassName="highlight-row"
      />
    );
    expect(screen.getByTestId("table-list-body-row")).toHaveClass("highlight-row");
  });

  it("renders empty when tbodyCells is empty", () => {
    wrap(<TableListBodyRow cellTypeComponentMap={cellMap} tbodyCells={[]} />);
    expect(screen.getByTestId("table-list-body-row").children).toHaveLength(0);
  });
});
