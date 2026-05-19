import type React from "react";
export type { SortingState } from "@tanstack/react-table";

export type ListItem = {
  id: string;
  index?: number;
};

export interface TableListHeadCell<T = unknown> {
  thContent: React.ReactElement | string;
  thClassName?: string;
  thKey: string;
  thColSpan?: number;
  sortable?: boolean;
  sortAccessor?: (item: T) => string | number;
}

export interface TableListBodyCell<CellType extends string> {
  type: CellType;
  tdClassName?: string;
  tdSnap?: boolean;
  tdColSpan?: number;
  tdColWidth?: string;
}
