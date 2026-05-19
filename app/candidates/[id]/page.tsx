import type { Metadata } from "next";
import CandidateProfile from "../../components/candidates/CandidateProfile/CandidateProfile";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates/${id}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return { title: "Candidate Profile" };
    const candidate = (await res.json()) as { name?: string; career?: string };
    const name = candidate.name ?? "Candidate Profile";
    return {
      title: name,
      description: candidate.career
        ? `Profile for ${name} — ${candidate.career}`
        : `Profile for ${name}`,
      openGraph: { title: name },
    };
  } catch {
    return { title: "Candidate Profile" };
  }
}

export default async function CandidateProfilePage({ params }: PageProps) {
  const { id } = await params;
  return <CandidateProfile candidateId={id} />;
}
