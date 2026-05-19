export type TriState = "all" | "yes" | "no";

export interface CandidateFilters {
  hasReason: TriState;
  hasUniversity: TriState;
  salaryRange: [number, number] | null;
}

export interface Candidate {
  id: string;
  name: string;
  document: number;
  cv_zonajobs: string;
  cv_bumeran: string;
  phone: string;
  email: string;
  date: string;
  age: number;
  has_university: string;
  career: string;
  graduated: string;
  courses_approved: string;
  location: string;
  accepts_working_hours: string;
  desired_salary: string;
  had_interview: string;
  reason: string;
}
