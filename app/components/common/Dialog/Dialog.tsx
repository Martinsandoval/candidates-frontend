"use client";

import * as RadixDialog from "@radix-ui/react-dialog";
import React, { type ReactNode } from "react";
import clsx from "clsx";
import { Flex, IconButton, Theme } from "@radix-ui/themes";
import { Cross2Icon } from "@radix-ui/react-icons";
import "./Dialog.css";
import { DialogVariant } from "./enums";
export { DialogVariant };

interface GenericDialogProps {
  /**
   * Controls whether the dialog is visible.
   */
  open: boolean;
  /**
   * Callback fired when the dialog requests a visibility change (close button, Escape key).
   */
  onOpenChange: (open: boolean) => void;
  /**
   * Required heading rendered in the dialog header.
   */
  title: string | React.ReactElement;
  /**
   * Optional supporting text rendered below the title.
   */
  description?: ReactNode;
  /**
   * Optional body slot for form fields or additional content.
   */
  content?: ReactNode;
  /**
   * Optional footer slot for action buttons (confirm, cancel, etc.).
   */
  actions?: ReactNode;
  /**
   * Visual accent applied to the dialog border and header. Defaults to `DialogVariant.INFO`.
   */
  variant?: DialogVariant;
}

/**
 * A flexible modal dialog component built on Radix UI.
 *
 * This component provides a customizable modal dialog with support for different visual variants,
 * controlled open/close state, and flexible content areas. It includes an overlay backdrop,
 * close button, and optional sections for title, description, content, and actions.
 *
 * @variant
 * - **info** (default): Blue accent, for general information or confirmations
 * - **danger**: Red accent, for destructive actions like delete or irreversible operations
 * - **warning**: Yellow/orange accent, for caution messages or important notices
 *
 * @author Martin Sandoval
 */
const Dialog: React.FC<React.PropsWithChildren<GenericDialogProps>> = ({
  open,
  onOpenChange,
  title,
  description,
  content,
  actions,
  variant = DialogVariant.INFO,
}) => {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <Theme>
          <RadixDialog.Overlay className="DialogOverlay" />
          <RadixDialog.Content
            className={clsx("DialogBody", {
              "DialogBody--info": variant === "info",
              "DialogBody--danger": variant === "danger",
              "DialogBody--warning": variant === "warning",
            })}
            onInteractOutside={(e) => {
              e.preventDefault();
            }}
          >
            <Flex className="DialogHeading">
              <RadixDialog.Title className="DialogTitle">{title}</RadixDialog.Title>
              {description && (
                <RadixDialog.Description asChild>
                  <Flex className="DialogDescription">{description}</Flex>
                </RadixDialog.Description>
              )}
            </Flex>

            {content && <Flex className="DialogContent"> {content} </Flex>}

            {actions && <Flex className="DialogActions">{actions}</Flex>}

            <RadixDialog.Close asChild>
              <IconButton className="DialogClose" aria-label="Close">
                <Cross2Icon />
              </IconButton>
            </RadixDialog.Close>
          </RadixDialog.Content>
        </Theme>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};

export default Dialog;
