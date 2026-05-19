import { Suspense } from "react";
import CandidatesTable from "./components/candidates/CandidatesTable/CandidatesTable";
import TableSkeleton from "@/app/components/common/TableSkeleton/TableSkeleton";

export default function Home() {
  return (
    <Suspense fallback={<TableSkeleton rows={8} columns={7} title="Candidates" />}>
      <CandidatesTable />
    </Suspense>
  );
}
