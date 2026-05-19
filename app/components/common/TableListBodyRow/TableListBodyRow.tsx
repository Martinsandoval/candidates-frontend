import React from "react";
import { Table } from "@radix-ui/themes";
import "./TableListBodyRow.css";
import { type TableListBodyCell } from "@/app/components/common/TableList/TableList";
import clsx from "clsx";

interface TableListBodyRowProps<CellType extends string> {
  /**
   * The record tying a React component to a cell component type
   */
  cellTypeComponentMap: Record<CellType, React.FC<React.PropsWithChildren>>;
  /**
   * An array of the table list body cells, which specifies the order of cell elements and cell styles
   */
  tbodyCells: Array<TableListBodyCell<CellType>>;
  /**
   * Class name(s) applied to the <Table.Row> rendered in the <Table.Body>
   */
  trClassName?: string;
  /**
   * Optional click handler for the row
   */
  onClick?: () => void;
}

/**
 * Renders the cells for an Entity based on the provided tbodyCells specification and component map
 * This component is primarily made to have a central place where table-specific-markup is rendered alongside the TableList
 *
 * @author Martin Sandoval
 */
const TableListBodyRow = <CellType extends string>({
  cellTypeComponentMap,
  tbodyCells = [],
  trClassName,
  onClick,
}: TableListBodyRowProps<CellType>) => {
  /**
   * Renders a single component based off of its provided type
   * @param type the cell type
   */
  function renderComponent(type: CellType): React.ReactElement {
    const Component: React.FC<React.PropsWithChildren<unknown>> = cellTypeComponentMap[type];
    return Component && <Component />;
  }

  return (
    <Table.Row
      className={clsx(trClassName, { TableListBodyRowClickable: !!onClick })}
      data-testid="table-list-body-row"
      onClick={onClick}
      style={onClick ? { cursor: "pointer" } : undefined}
    >
      {tbodyCells.map(
        ({ type, tdClassName, tdColSpan = 1, tdSnap, tdColWidth }: TableListBodyCell<CellType>) => (
          <Table.Cell
            key={type}
            data-testid={`table-cell-${type.toLowerCase().replace(/[_\s]+/g, "-")}`}
            colSpan={tdColSpan}
            className={clsx(tdClassName, { TableListBodyRowSnap: tdSnap })}
            width={tdColWidth}
          >
            {renderComponent(type)}
          </Table.Cell>
        )
      )}
    </Table.Row>
  );
};

export default TableListBodyRow;
