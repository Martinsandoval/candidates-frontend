"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge, DropdownMenu, Flex, Heading, ScrollArea } from "@radix-ui/themes";
import { LayoutIcon } from "@radix-ui/react-icons";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import TableList, {
  type TableListHeadCell,
  type SortingState,
} from "@/app/components/common/TableList/TableList";
import TableSkeleton from "@/app/components/common/TableSkeleton/TableSkeleton";
import EmptyState from "@/app/components/common/EmptyState/EmptyState";
import Button from "@/app/components/common/Button/Button";
import CandidatesFilters, {
  type CandidateFilters,
  type TriState,
  countActiveFilters,
} from "@/app/components/candidates/CandidatesFilters/CandidatesFilters";
import CandidatesSearch from "@/app/components/candidates/CandidatesSearch/CandidatesSearch";
import CandidatesTableRow, { type Candidate } from "./CandidatesTableRow";
import { useToast, toastForError } from "@/app/hooks/useToast";
import axiosClient from "@/app/lib/axiosClient";
import "./CandidatesTable.css";

type ColumnVisibility = Record<string, boolean>;

const COLUMNS_STORAGE_KEY = "candidates-columns-visibility";

function loadStoredVisibility(): ColumnVisibility | null {
  try {
    const raw = localStorage.getItem(COLUMNS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ColumnVisibility) : null;
  } catch {
    return null;
  }
}

function persistVisibility(v: ColumnVisibility) {
  try {
    localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(v));
  } catch {
    // ignore quota / SSR errors
  }
}

const COLUMN_ORDER: (keyof Candidate)[] = [
  "name",
  "career",
  "email",
  "phone",
  "age",
  "location",
  "desired_salary",
  "courses_approved",
  "has_university",
  "graduated",
  "accepts_working_hours",
  "had_interview",
  "cv_zonajobs",
  "cv_bumeran",
  "document",
  "date",
  "reason",
  "id",
];

const COLUMN_LABELS: Record<keyof Candidate, string> = {
  id: "ID",
  name: "Name",
  document: "Document",
  cv_zonajobs: "CV ZonaJobs",
  cv_bumeran: "CV Búmeran",
  phone: "Phone",
  email: "Email",
  date: "Date",
  age: "Age",
  has_university: "University",
  career: "Career",
  graduated: "Graduation",
  courses_approved: "Courses Approved",
  location: "Location",
  accepts_working_hours: "Work Hours",
  desired_salary: "Salary",
  had_interview: "Interview",
  reason: "Reason",
};

const SORT_ACCESSORS: Partial<Record<keyof Candidate, (c: Candidate) => string | number>> = {
  name: (c) => c.name.toLowerCase(),
  date: (c) => c.date ?? "",
  desired_salary: (c) => Number(c.desired_salary),
  had_interview: (c) => (c.had_interview === "Si" ? 1 : 0),
};

async function fetchCandidates(): Promise<Candidate[]> {
  const { data } = await axiosClient.get<Candidate[]>("/candidates");
  return data;
}

async function fetchColumns(): Promise<ColumnVisibility> {
  const { data } = await axiosClient.get<ColumnVisibility>("/columns");
  return data;
}

const TRISTATE_VALUES = new Set<string>(["all", "yes", "no"]);

function toTriState(value: string | null): TriState {
  return (TRISTATE_VALUES.has(value ?? "") ? value : "all") as TriState;
}

/**
 * Main candidates listing page component.
 *
 * Fetches all candidates and the column visibility configuration from the API,
 * then renders a sortable, filterable, paginated `TableList`. Column visibility
 * is persisted to `localStorage` and merged with server defaults on load.
 * Active filters and sort state are synced to the URL so they survive page
 * refresh. The column toggle dropdown lets recruiters show/hide any field.
 * Loading, error, and empty states are all handled inline.
 *
 * @author Martin Sandoval
 */
const CandidatesTable: React.FC = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();

  const [visibilityOverrides, setVisibilityOverrides] = useState<ColumnVisibility | null>(null);
  const [filters, setFilters] = useState<CandidateFilters>(() => {
    const salaryMinParam = searchParams.get("salaryMin");
    const salaryMaxParam = searchParams.get("salaryMax");
    return {
      hasReason: toTriState(searchParams.get("reason")),
      hasUniversity: toTriState(searchParams.get("university")),
      salaryRange:
        salaryMinParam !== null && salaryMaxParam !== null
          ? [Number(salaryMinParam), Number(salaryMaxParam)]
          : null,
    };
  });
  const [sorting, setSorting] = useState<SortingState>(() => {
    const sortBy = searchParams.get("sortBy");
    const sortDir = searchParams.get("sortDir");
    return sortBy ? [{ id: sortBy, desc: sortDir === "desc" }] : [];
  });
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    data: columnsConfig,
    isSuccess: columnsReady,
    isError: columnsIsError,
    error: columnsError,
  } = useQuery({
    queryKey: ["columns"],
    queryFn: fetchColumns,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (columnsIsError && columnsError) {
      showToast(toastForError(columnsError, "Failed to load column configuration"));
    }
  }, [columnsIsError, columnsError, showToast]);

  const columnsConfiguration = useMemo<ColumnVisibility | null>(() => {
    if (!columnsConfig) return null;
    if (visibilityOverrides !== null) return visibilityOverrides;
    const stored = loadStoredVisibility();
    return Object.keys(columnsConfig).reduce<ColumnVisibility>((acc, key) => {
      acc[key] = stored !== null && key in stored ? stored[key] : columnsConfig[key];
      return acc;
    }, {});
  }, [columnsConfig, visibilityOverrides]);

  const {
    data: candidates,
    isPending: candidatesLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["candidates"],
    queryFn: fetchCandidates,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (isError && error) {
      showToast(toastForError(error, "Failed to load candidates"));
    }
  }, [isError, error, showToast]);

  const visibleColumns = useMemo<(keyof Candidate)[]>(() => {
    if (!columnsConfiguration) return [];
    return COLUMN_ORDER.filter((col) => columnsConfiguration[col]);
  }, [columnsConfiguration]);

  const salaryCeiling = useMemo(() => {
    if (!candidates?.length) return 50_000;
    const max = candidates.reduce((max, c) => Math.max(max, Number(c.desired_salary)), 0);
    // const max = Math.max(...candidates.map((c) => Number(c.desired_salary)));
    return Math.ceil(max / 1000) * 1000;
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    if (!candidates) return [];
    const term = search.trim().toLowerCase();
    return candidates.filter((c) => {
      if (filters.hasReason === "yes" && !c.reason?.trim()) return false;
      if (filters.hasReason === "no" && c.reason?.trim()) return false;
      if (filters.hasUniversity === "yes" && c.has_university !== "Si") return false;
      if (filters.hasUniversity === "no" && c.has_university === "Si") return false;
      if (filters.salaryRange !== null) {
        const salary = Number(c.desired_salary);
        if (salary < filters.salaryRange[0] || salary > filters.salaryRange[1]) return false;
      }
      if (term) {
        const hit =
          c.name.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          c.career.toLowerCase().includes(term) ||
          c.location.toLowerCase().includes(term) ||
          String(c.document).includes(term);
        if (!hit) return false;
      }
      return true;
    });
  }, [candidates, filters, search]);

  const tColumns = useMemo<TableListHeadCell<Candidate>[]>(
    () => [
      ...visibleColumns.map((col) => ({
        thKey: col as string,
        thContent: COLUMN_LABELS[col],
        sortable: col in SORT_ACCESSORS,
        sortAccessor: SORT_ACCESSORS[col],
      })),
      { thKey: "actions", thContent: "" },
    ],
    [visibleColumns]
  );

  /**
   * Function that updates the url with the current selected filters and sorts.
   * @param filters
   * @param sorts
   */
  function buildParams(
    filters: CandidateFilters,
    sorts: SortingState,
    searchTerm: string
  ): URLSearchParams {
    const p = new URLSearchParams();
    if (filters.hasReason !== "all") p.set("reason", filters.hasReason);
    if (filters.hasUniversity !== "all") p.set("university", filters.hasUniversity);
    if (filters.salaryRange !== null) {
      p.set("salaryMin", String(filters.salaryRange[0]));
      p.set("salaryMax", String(filters.salaryRange[1]));
    }
    if (sorts.length > 0) {
      p.set("sortBy", sorts[0].id);
      p.set("sortDir", sorts[0].desc ? "desc" : "asc");
    }
    if (searchTerm.trim()) p.set("search", searchTerm.trim());
    return p;
  }

  function handleFiltersChange(newFilters: CandidateFilters) {
    setFilters(newFilters);
    const qs = buildParams(newFilters, sorting, search).toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function handleSortingChange(newSorting: SortingState) {
    setSorting(newSorting);
    const qs = buildParams(filters, newSorting, search).toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function handleSearchChange(newSearch: string) {
    setSearch(newSearch);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      const qs = buildParams(filters, sorting, newSearch).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, 300);
  }

  /**
   * Function that handles the show/hide functionality of a column.
   * @param col
   */
  function toggleColumn(col: keyof Candidate) {
    if (!columnsConfiguration) return;
    const next = { ...columnsConfiguration, [col]: !columnsConfiguration[col] };
    persistVisibility(next);
    setVisibilityOverrides(next);
  }

  const isLoading = candidatesLoading || !columnsReady || columnsConfiguration === null;

  if (isLoading) {
    return <TableSkeleton rows={8} columns={visibleColumns.length || 7} title="Candidates" />;
  }

  if (isError) {
    return (
      <Flex direction="column" align="center" justify="center" p="8" style={{ minHeight: 320 }}>
        <EmptyState
          title="Failed to load candidates"
          description={error instanceof Error ? error.message : "Could not reach the API."}
        />
      </Flex>
    );
  }

  return (
    <Flex direction="column" className="CandidatesTableContainer">
      <Flex align="center" justify="between" px="4" py="3" className="CandidatesTableHeader">
        <Flex align="center" gap="2">
          <Heading as="h1">Candidates</Heading>
          <Badge
            variant="soft"
            color="gray"
            size="1"
            aria-label={
              countActiveFilters(filters) > 0
                ? `${filteredCandidates.length} of ${candidates?.length ?? 0} candidates match filters`
                : `${candidates?.length ?? 0} candidates`
            }
            aria-live="polite"
          >
            {countActiveFilters(filters) > 0
              ? `${filteredCandidates.length} / ${candidates?.length ?? 0}`
              : (candidates?.length ?? 0)}
          </Badge>
        </Flex>

        <Flex gap="2" align="center">
          <CandidatesSearch value={search} onChange={handleSearchChange} />
          <CandidatesFilters
            filters={filters}
            onChange={handleFiltersChange}
            salaryCeiling={salaryCeiling}
          />

          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="secondary" size="sm">
                <LayoutIcon />
                Columns
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end" sideOffset={4} className="CandidatesColumnsDropdown">
              <DropdownMenu.Label>Show / hide columns</DropdownMenu.Label>
              <DropdownMenu.Separator />
              <ScrollArea type="always" style={{ maxHeight: 300 }}>
                {COLUMN_ORDER.map((col) => (
                  <DropdownMenu.CheckboxItem
                    key={col}
                    checked={columnsConfiguration?.[col] ?? false}
                    onCheckedChange={() => toggleColumn(col)}
                  >
                    {COLUMN_LABELS[col]}
                  </DropdownMenu.CheckboxItem>
                ))}
              </ScrollArea>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>
      </Flex>

      {!candidates?.length ? (
        <Flex p="8">
          <EmptyState
            title="No candidates yet"
            description="Once candidates are added to the system, they'll appear here."
          />
        </Flex>
      ) : filteredCandidates.length === 0 ? (
        <Flex p="8">
          <EmptyState
            title="No candidates match your filters"
            description="Try adjusting or clearing your filters to see more results."
          />
        </Flex>
      ) : (
        <TableList
          tKey="candidates"
          items={filteredCandidates}
          tColumns={tColumns}
          sorting={sorting}
          onSortingChange={handleSortingChange}
        >
          {(candidate: Candidate) => (
            <CandidatesTableRow
              key={candidate.id}
              candidate={candidate}
              visibleColumns={visibleColumns}
            />
          )}
        </TableList>
      )}
    </Flex>
  );
};

export default CandidatesTable;
