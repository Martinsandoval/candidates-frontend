import React from "react";
import { Flex, Text } from "@radix-ui/themes";
import "./AppSpinner.css";

interface AppSpinnerProps {
  /**
   * Optional text rendered below the spinner ring.
   */
  label?: string;
  /**
   * Controls the spinner ring dimensions. Defaults to `"md"`.
   */
  size?: "sm" | "md" | "lg";
}

/**
 * Animated loading spinner for full-page or section-level loading states.
 *
 * Renders a branded ring animation with an optional descriptive label underneath.
 * Prefer `TableSkeleton` for table-specific loading states.
 *
 * @author Martin Sandoval
 */
const AppSpinner: React.FC<AppSpinnerProps> = ({ label, size = "md" }) => {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap="3"
      className="AppSpinnerContainer"
    >
      <div className={`AppSpinnerWrapper AppSpinnerWrapper--${size}`}>
        <div className="AppSpinnerRing" aria-hidden="true" />
        <div className="AppSpinnerMark" aria-hidden="true">
          R
        </div>
      </div>
      {label && (
        <Text size="2" color="gray">
          {label}
        </Text>
      )}
    </Flex>
  );
};

export default AppSpinner;
