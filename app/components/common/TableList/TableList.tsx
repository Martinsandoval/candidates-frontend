"use client";

import React, { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  type Updater,
} from "@tanstack/react-table";
import type { ListItem, TableListHeadCell, TableListBodyCell } from "./types";
export type { SortingState, ListItem, TableListHeadCell, TableListBodyCell };
import { Flex, Table as TableRadix, Text } from "@radix-ui/themes";
import * as Select from "@radix-ui/react-select";
import {
  CaretDownIcon,
  CaretSortIcon,
  CaretUpIcon,
  CheckIcon,
  ChevronDownIcon,
} from "@radix-ui/react-icons";
import clsx from "clsx";
import { useUserPreferences } from "@/app/hooks/useUserPreferences";
import Button from "@/app/components/common/Button/Button";
import "./TableList.css";

interface TableListProps<T extends ListItem> {
  /**
   * Unique string key used as the table's `id` and `data-testid` prefix.
   */
  tKey: string;
  /**
   * Full (pre-filtered) list of items to display. Sorting and pagination are applied internally.
   */
  items: T[];
  /**
   * Ordered column definitions including header content, optional sort accessor, and CSS classes.
   */
  tColumns: TableListHeadCell<T>[];
  /**
   * Additional CSS class merged onto the root `<Table>` element.
   */
  className?: string;
  /**
   * Render prop called once per paginated item; should return a `TableListBodyRow`.
   */
  children: (item: T) => ReactNode;
  /**
   * Optional component rendered when `items` is empty.
   */
  empty?: React.FC<React.PropsWithChildren>;
  /**
   * Controlled sort state. When provided alongside `onSortingChange`, the parent owns sort state.
   * Omit both `sorting` and `onSortingChange` to use uncontrolled internal sort state.
   */
  sorting?: SortingState;
  /**
   * Callback fired with the new `SortingState` when a sortable column header is clicked.
   */
  onSortingChange?: (sorting: SortingState) => void;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, "all"] as const;
const DEFAULT_PAGE_SIZE = 10;

/**
 * Generic sortable, paginated data table built on TanStack Table v8 and Radix UI.
 *
 * Accepts any list of items extending `{ id: string }` and a column definition
 * array. Sorting can be controlled externally (pass `sorting` + `onSortingChange`)
 * or left uncontrolled for internal state. Page size is persisted to
 * `localStorage` via `useUserPreferences` and defaults to 10. The render-prop
 * pattern (`children`) keeps row rendering decoupled — pair with
 * `TableListBodyRow` for each item.
 *
 * @author Martin Sandoval
 */
const TableList = <T extends ListItem>({
  items = [],
  tColumns,
  className,
  children,
  tKey,
  sorting: controlledSorting,
  onSortingChange,
}: TableListProps<T>): React.ReactElement => {
  const { preferences, savePreference } = useUserPreferences();

  const isControlled = onSortingChange !== undefined;
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const activeSorting = useMemo(
    () => (isControlled ? (controlledSorting ?? []) : internalSorting),
    [isControlled, controlledSorting, internalSorting]
  );

  const [pageSize, setPageSize] = useState<number | "all">(
    () => preferences?.pageSize || DEFAULT_PAGE_SIZE
  );
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [items, activeSorting]);

  useEffect(() => {
    const stored = preferences?.pageSize || DEFAULT_PAGE_SIZE;
    setPageSize(stored);
    setCurrentPage(1);
  }, [preferences]);

  function handleSortingChange(updater: Updater<SortingState>) {
    const next = typeof updater === "function" ? updater(activeSorting) : updater;
    if (isControlled) {
      onSortingChange(next);
    } else {
      setInternalSorting(next);
    }
  }

  const columnDefs = useMemo<ColumnDef<T>[]>(
    () =>
      tColumns.map((col) => ({
        id: col.thKey,
        accessorFn: col.sortAccessor as ((row: T) => unknown) | undefined,
        enableSorting: !!col.sortable && !!col.sortAccessor,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(tColumns.map((c) => ({ id: c.thKey, sortable: c.sortable })))]
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- known limitation: useReactTable returns functions that the React Compiler cannot memoize
  const table = useReactTable<T>({
    data: items,
    columns: columnDefs,
    state: { sorting: activeSorting },
    onSortingChange: handleSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
  });

  const sortedItems = table.getSortedRowModel().rows.map((r) => r.original);

  const actualPageSize = pageSize === "all" ? sortedItems.length || 1 : pageSize;
  const totalPages = pageSize === "all" ? 1 : Math.ceil(sortedItems.length / pageSize);
  const startIndex = (currentPage - 1) * actualPageSize;
  const endIndex = Math.min(startIndex + actualPageSize, sortedItems.length);
  const paginatedItems = pageSize === "all" ? sortedItems : sortedItems.slice(startIndex, endIndex);

  const usePagination = items.length > PAGE_SIZE_OPTIONS[0];

  function handlePageSizeChange(newSize: string) {
    const size = newSize === "all" ? "all" : Number(newSize);
    setPageSize(size);
    setCurrentPage(1);
    savePreference({ pageSize: size });
  }

  function renderTableHead() {
    return (
      <TableRadix.Header className="TableListHeader">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRadix.Row key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const colDef = tColumns.find((c) => c.thKey === header.id);
              const canSort = header.column.getCanSort();
              const sortDir = header.column.getIsSorted();

              const ariaSort = canSort
                ? sortDir === "asc"
                  ? ("ascending" as const)
                  : sortDir === "desc"
                    ? ("descending" as const)
                    : ("none" as const)
                : undefined;

              return (
                <TableRadix.ColumnHeaderCell
                  key={header.id}
                  aria-sort={ariaSort}
                  className={clsx("TableListColumnHeader", colDef?.thClassName, {
                    "TableListColumnHeader--sortable": canSort,
                  })}
                  onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                >
                  <Flex align="center" gap="1">
                    <span>{colDef?.thContent}</span>
                    {canSort && (
                      <span className="SortIndicator">
                        {sortDir === "asc" ? (
                          <CaretUpIcon className="SortIcon SortIcon--active" />
                        ) : sortDir === "desc" ? (
                          <CaretDownIcon className="SortIcon SortIcon--active" />
                        ) : (
                          <CaretSortIcon className="SortIcon" />
                        )}
                      </span>
                    )}
                  </Flex>
                </TableRadix.ColumnHeaderCell>
              );
            })}
          </TableRadix.Row>
        ))}
      </TableRadix.Header>
    );
  }

  function renderPaginationControls() {
    if (!usePagination) return null;

    const displayValue = pageSize === "all" ? "All" : String(pageSize);

    return (
      <Flex className="PaginationContainer" justify="between" align="center" p="4">
        <Flex align="center" gap="2">
          <Text size="2" color="gray">
            Show
          </Text>
          <Select.Root value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <Select.Trigger className="PageSizeSelector">
              <span className="PageSizeValue">{displayValue}</span>
              <ChevronDownIcon className="PageSizeIcon" />
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="PageSizeContent" position="popper" sideOffset={5}>
                <Select.Viewport>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <Select.Item key={size} value={String(size)} className="PageSizeItem">
                      <Select.ItemText>{size === "all" ? "All" : size}</Select.ItemText>
                      <Select.ItemIndicator className="PageSizeItemIndicator">
                        <CheckIcon />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
          <Text size="2" color="gray">
            items per page
          </Text>
        </Flex>

        <Text size="2" color="gray">
          {pageSize === "all"
            ? `Showing all ${sortedItems.length} items`
            : `Showing ${startIndex + 1}–${endIndex} of ${sortedItems.length}`}
        </Text>

        {pageSize !== "all" && (
          <Flex align="center" gap="2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Flex align="center" gap="1">
              <Text size="2" weight="medium">
                {currentPage}
              </Text>
              <Text size="2" color="gray">
                of {totalPages}
              </Text>
            </Flex>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </Flex>
        )}
      </Flex>
    );
  }

  return (
    <>
      <TableRadix.Root
        key={tKey}
        id={tKey}
        data-testid={`table-list-${tKey.toLowerCase().replace(/[_\s]+/g, "-")}`}
        className={clsx("TableList", className)}
        variant="surface"
      >
        {renderTableHead()}
        <TableRadix.Body>
          {paginatedItems.map((item) => (
            <React.Fragment key={item.id}>{children(item)}</React.Fragment>
          ))}
        </TableRadix.Body>
      </TableRadix.Root>
      {renderPaginationControls()}
    </>
  );
};

export default TableList;
