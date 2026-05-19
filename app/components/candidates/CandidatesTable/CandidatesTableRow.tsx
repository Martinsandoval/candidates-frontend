"use client";

import React, { useMemo } from "react";
import { Badge, Box, Flex, Link, Text } from "@radix-ui/themes";
import { CopyIcon } from "@radix-ui/react-icons";
import TableListBodyRow from "@/app/components/common/TableListBodyRow/TableListBodyRow";
import CandidatesTableActionMenu from "../CandidatesTableActionMenu/CandidatesTableActionMenu";
import { useToast, ToastAlertVariant, ToastVariant } from "@/app/hooks/useToast";
import type { Candidate } from "@/app/components/candidates/types";

export type { Candidate };

const currencyFormatter = new Intl.NumberFormat("en-US");

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface CandidatesTableRowProps {
  candidate: Candidate;
  visibleColumns: (keyof Candidate)[];
}

/**
 * Renders a single candidate as a table row inside `CandidatesTable`.
 *
 * Builds a cell component map from the candidate data and delegates rendering
 * to `TableListBodyRow`. The visible set of columns is controlled externally
 * (driven by the column visibility toggle in `CandidatesTable`). An actions
 * column with `CandidatesTableActionMenu` is always rendered as the last cell.
 *
 * @author Martin Sandoval
 */
const CandidatesTableRow: React.FC<CandidatesTableRowProps> = ({ candidate, visibleColumns }) => {
  const { showToast } = useToast();

  const row = useMemo<Record<string, React.FC<React.PropsWithChildren>>>(
    () => ({
      id: () => (
        <Text size="1" color="gray" className="font-mono">
          {candidate.id.slice(-8)}
        </Text>
      ),
      name: () => (
        <Flex align="center" gap="2">
          <Box className="CandidateAvatar">{getInitials(candidate.name)}</Box>
          <Text size="2" weight="medium">
            {candidate.name}
          </Text>
        </Flex>
      ),
      document: () => <Text size="2">{candidate.document}</Text>,
      cv_zonajobs: () =>
        candidate.cv_zonajobs ? (
          <Link size="2" href={candidate.cv_zonajobs} target="_blank" rel="noopener noreferrer">
            View CV
          </Link>
        ) : (
          <Text size="2" color="gray">
            —
          </Text>
        ),
      cv_bumeran: () =>
        candidate.cv_bumeran ? (
          <Link size="2" href={candidate.cv_bumeran} target="_blank" rel="noopener noreferrer">
            View CV
          </Link>
        ) : (
          <Text size="2" color="gray">
            —
          </Text>
        ),
      phone: () => <Text size="2">{candidate.phone || "—"}</Text>,
      email: () =>
        candidate.email ? (
          <Flex align="center" gap="1">
            <Text size="2">{candidate.email}</Text>
            <button
              type="button"
              aria-label="Copy email"
              className="CopyEmailBtn"
              onClick={() =>
                navigator.clipboard.writeText(candidate.email).then(() => {
                  showToast({
                    title: "Email copied",
                    message: `${candidate.email} copied to clipboard.`,
                    alertVariant: ToastAlertVariant.INFO,
                    toastVariant: ToastVariant.FLYOUT,
                  });
                })
              }
            >
              <CopyIcon />
            </button>
          </Flex>
        ) : (
          <Text size="2" color="gray">
            —
          </Text>
        ),
      date: () => (
        <Text size="2">
          {candidate.date ? new Date(candidate.date.trim()).toLocaleDateString() : "—"}
        </Text>
      ),
      age: () => <Text size="2">{candidate.age}</Text>,
      has_university: () => (
        <Badge color={candidate.has_university === "Si" ? "green" : "gray"} variant="soft" size="1">
          {candidate.has_university === "Si" ? "Yes" : "No"}
        </Badge>
      ),
      career: () => <Text size="2">{candidate.career || "—"}</Text>,
      graduated: () => <Text size="2">{candidate.graduated || "—"}</Text>,
      courses_approved: () => <Text size="2">{candidate.courses_approved || "—"}</Text>,
      location: () => (
        <Text size="2" title={candidate.location} className="CandidateCellTruncate">
          {candidate.location || "—"}
        </Text>
      ),
      accepts_working_hours: () => (
        <Badge
          color={candidate.accepts_working_hours === "Si" ? "green" : "gray"}
          variant="soft"
          size="1"
        >
          {candidate.accepts_working_hours === "Si" ? "Yes" : "No"}
        </Badge>
      ),
      desired_salary: () => (
        <Text size="2">${currencyFormatter.format(Number(candidate.desired_salary))}</Text>
      ),
      had_interview: () => (
        <Badge color={candidate.had_interview === "Si" ? "blue" : "gray"} variant="soft" size="1">
          {candidate.had_interview === "Si" ? "Yes" : "No"}
        </Badge>
      ),
      reason: () => (
        <Text size="1" color="gray" title={candidate.reason} className="CandidateCellTruncate">
          {candidate.reason || "—"}
        </Text>
      ),
      actions: () => <CandidatesTableActionMenu candidateId={candidate.id} />,
    }),
    [candidate, showToast]
  );

  const tbodyCells = useMemo(
    () => [
      ...visibleColumns.map((col) => ({ type: col as string })),
      { type: "actions", tdColWidth: "48px" },
    ],
    [visibleColumns]
  );

  return <TableListBodyRow cellTypeComponentMap={row} tbodyCells={tbodyCells} />;
};

export default CandidatesTableRow;
