"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Badge, Box, Card, Flex, Heading, Link, Separator, Text, TextArea } from "@radix-ui/themes";
import { ArrowLeftIcon, CheckIcon, ExternalLinkIcon, PlusIcon, TrashIcon, } from "@radix-ui/react-icons";
import Button from "@/app/components/common/Button/Button";
import EmptyState from "@/app/components/common/EmptyState/EmptyState";
import AppSpinner from "@/app/components/common/AppSpinner/AppSpinner";
import { SUCCESS_TOAST, toastForError, useToast } from "@/app/hooks/useToast";
import axiosClient from "@/app/lib/axiosClient";
import type { Candidate } from "@/app/components/candidates/types";
import "./CandidateProfile.css";

interface Note {
  id: string;
  text: string;
  createdAt: string;
}

interface CandidateProfileProps {
  /**
   * ID of the candidate to load and display.
   */
  candidateId: string;
}

async function fetchCandidate(id: string): Promise<Candidate> {
  const { data } = await axiosClient.get<Candidate>(`/candidates/${id}`);
  return data;
}

async function patchCandidate(id: string, patch: Partial<Candidate>): Promise<Candidate> {
  const { data } = await axiosClient.patch<Candidate>(`/candidates/${id}/interview`, patch);
  return data;
}

function loadNotes(candidateId: string): Note[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(`candidate-notes-${candidateId}`);
    return stored ? (JSON.parse(stored) as Note[]) : [];
  } catch {
    return [];
  }
}

function persistNotes(candidateId: string, notes: Note[]) {
  try {
    localStorage.setItem(`candidate-notes-${candidateId}`, JSON.stringify(notes));
  } catch {
    // ignore write failures
  }
}

interface ProfileFieldProps {
  label: string;
  value: string;
  multiline?: boolean;
}

const ProfileField: React.FC<ProfileFieldProps> = ({ label, value, multiline }) => (
  <Flex
    direction={multiline ? "column" : "row"}
    justify={multiline ? "start" : "between"}
    align={multiline ? "start" : "center"}
    gap="1"
    className="ProfileFieldRow"
  >
    <Text size="2" className="ProfileFieldLabel">
      {label}
    </Text>
    <Text
      size="2"
      weight="medium"
      className={multiline ? "ProfileFieldValueMultiline" : "ProfileFieldValue"}
    >
      {value || "—"}
    </Text>
  </Flex>
);

/**
 * Full-page detail view for a single candidate.
 *
 * Fetches and displays all candidate fields grouped into contact and
 * application detail cards, plus a hero section with status badges and
 * CV links. Allows toggling the interview status via a PATCH request.
 * Supports recruiter notes stored in `localStorage` (add / delete).
 * Shows a rejection reason card when one is present. Loading, error,
 * and not-found states are all handled with appropriate UI feedback.
 *
 * @author Martin Sandoval
 */
const CandidateProfile: React.FC<CandidateProfileProps> = ({ candidateId }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [noteInput, setNoteInput] = useState("");
  const [notes, setNotes] = useState<Note[]>(() => loadNotes(candidateId));

  const {
    data: candidate,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["candidate", candidateId],
    queryFn: () => fetchCandidate(candidateId),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (isError && error) {
      showToast(toastForError(error, "Failed to load candidate"));
    }
  }, [isError, error, showToast]);

  const interviewMutation = useMutation({
    mutationFn: (value: string) => patchCandidate(candidateId, { had_interview: value }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["candidate", candidateId], updated);
      showToast({
        ...SUCCESS_TOAST,
        title:
          updated.had_interview === "Si" ? "Candidate Interviewed" : "Candidate Not Interviewed",
        message:
          updated.had_interview === "Si"
            ? "The interview with this candidate is done."
            : "This candidate has not been interviewed yet.",
      });
    },
    onError: (err) => showToast(toastForError(err, "Failed to update interview status")),
  });

  const addNote = useCallback(() => {
    const trimmed = noteInput.trim();
    if (!trimmed) return;
    const newNote: Note = {
      id: Date.now().toString(),
      text: trimmed,
      createdAt: new Date().toISOString(),
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    persistNotes(candidateId, updated);
    setNoteInput("");
  }, [noteInput, notes, candidateId]);

  const deleteNote = useCallback(
    (noteId: string) => {
      const updated = notes.filter((n) => n.id !== noteId);
      setNotes(updated);
      persistNotes(candidateId, updated);
    },
    [notes, candidateId]
  );

  if (isPending) {
    return (
      <Flex align="center" justify="center" className="ProfilePage ProfilePageSpinner">
        <AppSpinner label="Loading candidate..." />
      </Flex>
    );
  }

  if (isError || !candidate) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        gap="6"
        className="ProfilePage ProfilePageError"
      >
        <Button variant="link" onClick={() => router.back()}>
          <ArrowLeftIcon /> Candidates
        </Button>
        <EmptyState
          title="Candidate not found"
          description={
            error instanceof Error
              ? error.message
              : "This candidate could not be loaded. It may have been removed."
          }
        />
      </Flex>
    );
  }

  const initials = candidate.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const hadInterview = candidate.had_interview === "Si";
  const hasUniversity = candidate.has_university === "Si";
  const acceptsWorkingHours = candidate.accepts_working_hours === "Si";

  const appliedDate = candidate.date
    ? new Date(candidate.date.trim()).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <Flex direction="column" className="ProfilePage">
      {/* Back nav */}
      <Flex px="6" pt="5" pb="4">
        <Button variant="link" onClick={() => router.back()}>
          <ArrowLeftIcon /> Back to Candidates
        </Button>
      </Flex>
      <Flex direction="column" className="ProfileContainer">
        {/* Hero */}
        <Flex gap="5" align="start" px="6" pb="6" wrap="wrap" className="ProfileHero">
          <Box className="ProfileAvatar">{initials}</Box>

          <Flex direction="column" gap="2" style={{ flex: 1, minWidth: 200 }}>
            <Heading as="h1">{candidate.name}</Heading>
            <Text size="3" color="gray">
              {candidate.career || "No career listed"}
            </Text>
            <Flex gap="2" wrap="wrap" mt="1">
              {hasUniversity && (
                <Badge color="green" variant="soft" size="1">
                  University degree
                </Badge>
              )}
              <Badge color={hadInterview ? "blue" : "gray"} variant="soft" size="1">
                {hadInterview ? "Interview conducted" : "Not interviewed"}
              </Badge>
              {acceptsWorkingHours && (
                <Badge color="orange" variant="soft" size="1">
                  Flexible hours
                </Badge>
              )}
              {appliedDate && (
                <Badge color="gray" variant="outline" size="1">
                  Applied {appliedDate}
                </Badge>
              )}
            </Flex>
          </Flex>

          <Flex gap="2" wrap="wrap" className="ProfileActionGroup">
            {candidate.cv_zonajobs && (
              <Link href={candidate.cv_zonajobs} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="sm">
                  <ExternalLinkIcon /> CV ZonaJobs
                </Button>
              </Link>
            )}
            {candidate.cv_bumeran && (
              <Link href={candidate.cv_bumeran} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="sm">
                  <ExternalLinkIcon /> CV Búmeran
                </Button>
              </Link>
            )}
            <Button
              variant={hadInterview ? "gray" : "primary"}
              size="sm"
              onClick={() => interviewMutation.mutate(hadInterview ? "No" : "Si")}
              disabled={interviewMutation.isPending}
            >
              <CheckIcon />
              {hadInterview ? "Unmark Interview" : "Mark Interview Done"}
            </Button>
          </Flex>
        </Flex>

        <Separator size="4" />

        {/* Detail cards */}
        <Flex gap="4" p="6" wrap="wrap" className="ProfileCards">
          {/* Contact */}
          <Card className="ProfileCard">
            <Flex direction="column" gap="3">
              <Text size="1" weight="bold" className="ProfileCardLabel">
                CONTACT INFORMATION
              </Text>
              <ProfileField label="Email" value={candidate.email} />
              <ProfileField label="Phone" value={candidate.phone} />
              <ProfileField label="Location" value={candidate.location} multiline />
              <ProfileField label="Document" value={String(candidate.document)} />
            </Flex>
          </Card>

          {/* Application */}
          <Card className="ProfileCard">
            <Flex direction="column" gap="3">
              <Text size="1" weight="bold" className="ProfileCardLabel">
                APPLICATION DETAILS
              </Text>
              <ProfileField label="Age" value={String(candidate.age)} />
              <ProfileField
                label="Desired Salary"
                value={`$${Number(candidate.desired_salary).toLocaleString()}`}
              />
              <ProfileField label="Courses Approved" value={candidate.courses_approved} />
              <ProfileField label="Graduation" value={candidate.graduated} />
              <ProfileField label="Accepts Work Hours" value={acceptsWorkingHours ? "Yes" : "No"} />
            </Flex>
          </Card>
        </Flex>

        {/* Rejection reason */}
        {candidate.reason && (
          <Flex px="6" pb="4">
            <Card className="ProfileCard ProfileCard--full ProfileCard--reason">
              <Flex direction="column" gap="2">
                <Text size="1" weight="bold" className="ProfileCardLabel">
                  REJECTION NOTES
                </Text>
                <Text size="2" color="gray">
                  {candidate.reason}
                </Text>
              </Flex>
            </Card>
          </Flex>
        )}

        {/* Notes */}
        <Flex px="6" pb="8">
          <Card className="ProfileCard ProfileCard--full">
            <Flex direction="column" gap="4">
              <Text size="1" weight="bold" className="ProfileCardLabel">
                RECRUITER NOTES
              </Text>

              <Flex gap="2" align="end">
                <TextArea
                  aria-label="Add a recruiter note"
                  placeholder="Add a note about this candidate… (Ctrl+Enter to submit)"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) addNote();
                  }}
                  className="ProfileNoteInput"
                  rows={3}
                />
                <Button variant="primary" size="sm" onClick={addNote} disabled={!noteInput.trim()}>
                  <PlusIcon /> Add
                </Button>
              </Flex>

              {notes.length === 0 ? (
                <Text size="2" color="gray">
                  No notes yet. Use the field above to add observations about this candidate.
                </Text>
              ) : (
                <Flex direction="column" gap="2">
                  {notes.map((note) => (
                    <Box key={note.id} className="ProfileNote">
                      <Flex justify="between" align="start" gap="3">
                        <Text size="2" style={{ flex: 1 }}>
                          {note.text}
                        </Text>
                        <Flex direction="column" align="end" gap="1" className="ProfileNoteActions">
                          <Text size="1" color="gray">
                            {new Date(note.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </Text>
                          <button
                            className="ProfileNoteDelete"
                            onClick={() => deleteNote(note.id)}
                            aria-label={`Delete note from ${new Date(note.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                          >
                            <TrashIcon />
                          </button>
                        </Flex>
                      </Flex>
                    </Box>
                  ))}
                </Flex>
              )}
            </Flex>
          </Card>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default CandidateProfile;
