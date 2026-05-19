import React from "react";
import type Props from "./ToastAlertProps";
import * as Toast from "@radix-ui/react-toast";
import { type IconProps } from "@radix-ui/react-icons/dist/types";
import {
  CheckCircledIcon,
  Cross1Icon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import { ToastAlertVariant } from "./enums";
import { IconButton } from "@radix-ui/themes";
import "./ToastAlert.css";

const variantToIcon: Record<
  ToastAlertVariant,
  React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>
> = {
  [ToastAlertVariant.INFO]: InfoCircledIcon,
  [ToastAlertVariant.SUCCESS]: CheckCircledIcon,
  [ToastAlertVariant.WARNING]: ExclamationTriangleIcon,
  [ToastAlertVariant.DANGER]: CrossCircledIcon,
};

const variantToLabel: Record<ToastAlertVariant, string> = {
  [ToastAlertVariant.INFO]: "Info",
  [ToastAlertVariant.SUCCESS]: "Success",
  [ToastAlertVariant.WARNING]: "Warning",
  [ToastAlertVariant.DANGER]: "Error",
};

/**
 * Toast for displaying notifications and alerts displays in one of the two variants: flyouts or banners
 * @author Martin Sandoval
 */
const ToastAlert: React.FC<React.PropsWithChildren<Props>> = ({
  id,
  title: TitleComponent,
  message: MessageComponent,
  toastVariant,
  alertVariant,
  delay = 5000,
  onClose,
  show,
  className,
}) => {
  /**
   * Renders the title message that can be either of type string or a react functional component.
   */
  const renderToastTitle = (): React.ReactNode => {
    return typeof TitleComponent === "string" ? (
      <span className="ToastTitle">{TitleComponent}</span>
    ) : (
      <span className="ToastTitle">
        <TitleComponent />
      </span>
    );
  };

  /**
   * Renders the description message that can be either of type string or a react functional component.
   */
  const renderToastMessage = (): React.ReactNode => {
    return typeof MessageComponent === "string" ? (
      <span className="ToastDescription">{MessageComponent}</span>
    ) : (
      <span className="ToastDescription">
        <MessageComponent />
      </span>
    );
  };

  const Icon = variantToIcon[alertVariant];
  const toastClasses = `ToastRoot-${toastVariant} ToastRoot-${alertVariant} ${className}`;
  const toastViewportClasses = `ToastViewport ToastViewport-${toastVariant}`;

  return (
    <>
      <Toast.Root
        id={id}
        className={`ToastRoot ${toastClasses}`}
        open={show}
        duration={delay}
        onOpenChange={onClose}
      >
        <Toast.Action altText={variantToLabel[alertVariant]} className="ToastIcon">
          <Icon aria-hidden="true" />
        </Toast.Action>
        <Toast.Title className="ToastTitle">{renderToastTitle()}</Toast.Title>
        <Toast.Description asChild className="ToastDescription">
          {renderToastMessage()}
        </Toast.Description>
        <Toast.Action className="ToastAction" asChild altText="Close">
          <IconButton className="ToastIconButton">
            <Cross1Icon />
          </IconButton>
        </Toast.Action>
      </Toast.Root>
      <Toast.Viewport className={toastViewportClasses} />
    </>
  );
};

export default ToastAlert;
