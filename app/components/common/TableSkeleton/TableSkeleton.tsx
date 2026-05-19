import React from "react";
import { Box, Flex, Skeleton, Spinner, Text } from "@radix-ui/themes";

type Props = {
  /**
   * Number of skeleton rows to render. Defaults to `4`.
   */
  rows?: number;
  /**
   * Number of skeleton columns per row. Defaults to `4`.
   */
  columns?: number;
  /**
   * Optional section heading rendered above the skeleton table.
   */
  title?: string;
};

/**
 * Skeleton placeholder displayed while a table's data is loading.
 *
 * Renders animated Radix UI `Skeleton` cells in a grid matching the expected
 * table dimensions, along with a spinner at the bottom. Pass the same `columns`
 * count as the real table to avoid layout shift on load.
 *
 * @author Martin Sandoval
 */
const TableSkeleton: React.FC<Props> = ({ rows = 4, columns = 4, title }) => {
  return (
    <Flex direction="column" gap="4" p="6" width="100%">
      {title && (
        <Text as="p" size="3" weight="medium">
          {title}
        </Text>
      )}
      <Box
        style={{
          border: "1px solid var(--gray-a4)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <Flex direction="column" p="3" gap="3">
          {/* Header */}
          <Flex gap="4" mb="2">
            {Array.from({ length: columns }).map((_, colIdx) => (
              <Skeleton key={`head-${colIdx}`} width="100%" height="16px" />
            ))}
          </Flex>

          {/* Skeleton Rows */}
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <Flex key={`row-${rowIdx}`} gap="4" align="center">
              {Array.from({ length: columns }).map((_, colIdx) => (
                <Skeleton key={`cell-${rowIdx}-${colIdx}`} width="100%" height="12px" />
              ))}
            </Flex>
          ))}

          {/* Spinner row (inside the table container) */}
          <Flex justify="center" align="center" py="2">
            <Spinner size="3" />
          </Flex>
        </Flex>
      </Box>
    </Flex>
  );
};

export default TableSkeleton;
