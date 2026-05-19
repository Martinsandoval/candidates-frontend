import { Flex, Text } from "@radix-ui/themes";
import React from "react";
import "./EmptyState.css";

interface EmptyStateProps {
  /**
   * Optional bold heading rendered above the description.
   */
  title?: string;
  /**
   * Required supporting text explaining the empty state.
   */
  description: string;
}

/**
 * Placeholder component displayed when a list or view has no data to show.
 *
 * Used for zero-result states (empty candidate list, failed loads, no search
 * matches). Renders an optional title and a required description.
 *
 * @author Martin Sandoval
 */
const EmptyState: React.FC<React.PropsWithChildren<EmptyStateProps>> = ({ title, description }) => {
  return (
    <Flex className="EmptyStateContainer">
      {title && <Text className="EmptyStateTitle">{title}</Text>}
      <Text className="EmptyStateDescription">{description}</Text>
    </Flex>
  );
};

export default EmptyState;
