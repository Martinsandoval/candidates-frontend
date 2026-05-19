"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DropdownMenu, Flex, IconButton, TextArea } from "@radix-ui/themes";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { SUCCESS_TOAST, toastForError, useToast } from "@/app/hooks/useToast";
import axiosClient from "@/app/lib/axiosClient";
import Button from "@/app/components/common/Button/Button";
import Dialog, { DialogVariant } from "@/app/components/common/Dialog/Dialog";
import "./CandidatesTableActionMenu.css";

interface CandidatesTableActionMenuProps {
  /**
   * ID of the candidate this menu acts upon.
   */
  candidateId: string;
}

/**
 * Row-level action dropdown for a candidate in the candidates table.
 *
 * Provides three actions: navigate to the candidate profile, approve the
 * candidate (PATCH `/candidates/:id/approve`), and reject with a required
 * reason (PATCH `/candidates/:id/reject`). Rejection opens a `Dialog` with
 * a textarea. Success and error outcomes are surfaced via toast notifications.
 * The candidates query is invalidated on success to keep the table in sync.
 *
 * @author Martin Sandoval
 */
const CandidatesTableActionMenu: React.FC<CandidatesTableActionMenuProps> = ({ candidateId }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  const approveMutation = useMutation({
    mutationFn: () => axiosClient.patch(`/candidates/${candidateId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      showToast({
        ...SUCCESS_TOAST,
        title: "Candidate approved",
        message: "The candidate has been approved successfully.",
      });
    },
    onError: (err) => showToast(toastForError(err, "Failed to approve candidate")),
  });

  const rejectMutation = useMutation({
    mutationFn: (rejectionReason: string) =>
      axiosClient.patch(`/candidates/${candidateId}/reject`, { reason: rejectionReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      setRejectOpen(false);
      setReason("");
      showToast({
        ...SUCCESS_TOAST,
        title: "Candidate rejected",
        message: "The candidate has been rejected and the reason saved.",
      });
    },
    onError: (err) => showToast(toastForError(err, "Failed to reject candidate")),
  });

  function openRejectDialog() {
    setReason("");
    rejectMutation.reset();
    setRejectOpen(true);
  }

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton
            variant="surface"
            size="1"
            color="gray"
            aria-label="Row actions"
            className="ActionMenuTrigger"
          >
            <DotsHorizontalIcon />
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" size="2">
          <DropdownMenu.Item
            className="ActionMenuItem"
            onClick={() => router.push(`/candidates/${candidateId}`)}
          >
            View Profile
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item
            className="ActionMenuItem"
            onClick={() => approveMutation.mutate()}
            disabled={approveMutation.isPending}
          >
            {approveMutation.isPending ? "Approving…" : "Approve"}
          </DropdownMenu.Item>
          <DropdownMenu.Item className="ActionMenuItem" color="red" onClick={openRejectDialog}>
            Reject
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      <Dialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title="Reject Candidate"
        description="Provide a reason. It will be saved to the candidate's profile."
        variant={DialogVariant.DANGER}
        content={
          <Flex direction="column" gap="2" style={{ width: "100%" }}>
            <TextArea
              aria-label="Rejection reason"
              placeholder="Enter rejection reason…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              style={{ width: "100%" }}
            />
          </Flex>
        }
        actions={
          <Flex gap="2">
            <Button variant="secondary" size="sm" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => rejectMutation.mutate(reason)}
              disabled={!reason.trim() || rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "Rejecting…" : "Reject Candidate"}
            </Button>
          </Flex>
        }
      />
    </>
  );
};

export default CandidatesTableActionMenu;
