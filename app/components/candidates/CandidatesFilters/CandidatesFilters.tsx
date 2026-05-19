"use client";

import React from "react";
import * as Slider from "@radix-ui/react-slider";
import { Badge, Flex, Popover, SegmentedControl, Separator, Text } from "@radix-ui/themes";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import Button from "@/app/components/common/Button/Button";
import type { CandidateFilters, TriState } from "@/app/components/candidates/types";
import "./CandidatesFilters.css";

export type { CandidateFilters, TriState };

export const DEFAULT_CANDIDATE_FILTERS: CandidateFilters = {
  hasReason: "all",
  hasUniversity: "all",
  salaryRange: null,
};

export function countActiveFilters(f: CandidateFilters): number {
  return (
    (f.hasReason !== "all" ? 1 : 0) +
    (f.hasUniversity !== "all" ? 1 : 0) +
    (f.salaryRange !== null ? 1 : 0)
  );
}

interface CandidatesFiltersProps {
  /**
   * Current filter state to render as controlled values.
   */
  filters: CandidateFilters;
  /**
   * Callback fired with the full updated `CandidateFilters` object on any change.
   */
  onChange: (filters: CandidateFilters) => void;
  /**
   * Maximum value for the salary range slider, derived from the dataset.
   */
  salaryCeiling: number;
}

/**
 * Popover-based filter panel for the candidates table.
 *
 * Exposes three filters: rejection reason presence (tri-state), university
 * degree (tri-state), and desired salary range (dual-thumb Radix Slider).
 * Active filter count is shown as a badge on the trigger button. All state
 * is fully controlled — pass `filters` and handle `onChange` in the parent.
 *
 * @author Martin Sandoval
 */
const CandidatesFilters: React.FC<CandidatesFiltersProps> = ({
  filters,
  onChange,
  salaryCeiling,
}) => {
  const activeCount = countActiveFilters(filters);
  const sliderValue = filters.salaryRange ?? [0, salaryCeiling];

  function set<K extends keyof CandidateFilters>(key: K, value: CandidateFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  function clearAll() {
    onChange(DEFAULT_CANDIDATE_FILTERS);
  }

  return (
    <Popover.Root>
      <Popover.Trigger>
        <Button variant="secondary" size="sm" aria-label="Open filters">
          <MixerHorizontalIcon />
          <span>Filters</span>
          {activeCount > 0 && (
            <Badge size="1" color="blue" variant="solid" className="FiltersBadge">
              {activeCount}
            </Badge>
          )}
        </Button>
      </Popover.Trigger>

      <Popover.Content align="end" sideOffset={6} className="FiltersPopover">
        {/* Header */}
        <Flex align="center" justify="between" mb="3">
          <Text size="2" weight="bold">
            Filters
          </Text>
          {activeCount > 0 && (
            <Button variant="unstyled" className="FiltersClearBtn" onClick={clearAll}>
              Clear all
            </Button>
          )}
        </Flex>

        <Separator size="4" mb="3" />

        <Flex direction="column" gap="2" mb="4">
          <Text size="1" weight="bold" className="FilterSectionLabel">
            REJECTION REASON
          </Text>
          <SegmentedControl.Root
            size="1"
            value={filters.hasReason}
            onValueChange={(v) => set("hasReason", v as TriState)}
          >
            <SegmentedControl.Item value="all">All</SegmentedControl.Item>
            <SegmentedControl.Item value="yes">Has reason</SegmentedControl.Item>
            <SegmentedControl.Item value="no">No reason</SegmentedControl.Item>
          </SegmentedControl.Root>
        </Flex>

        <Flex direction="column" gap="2" mb="4">
          <Text size="1" weight="bold" className="FilterSectionLabel">
            UNIVERSITY DEGREE
          </Text>
          <SegmentedControl.Root
            size="1"
            value={filters.hasUniversity}
            onValueChange={(v) => set("hasUniversity", v as TriState)}
          >
            <SegmentedControl.Item value="all">All</SegmentedControl.Item>
            <SegmentedControl.Item value="yes">Yes</SegmentedControl.Item>
            <SegmentedControl.Item value="no">No</SegmentedControl.Item>
          </SegmentedControl.Root>
        </Flex>

        <Flex direction="column" gap="3">
          <Flex justify="between" align="center">
            <Text size="1" weight="bold" className="FilterSectionLabel">
              SALARY RANGE
            </Text>
            {filters.salaryRange !== null && (
              <Button
                variant="unstyled"
                className="FiltersClearBtn"
                onClick={() => set("salaryRange", null)}
              >
                Reset
              </Button>
            )}
          </Flex>

          <Slider.Root
            className="SalarySlider"
            min={0}
            max={salaryCeiling}
            step={500}
            value={sliderValue}
            onValueChange={(value) => set("salaryRange", value as [number, number])}
          >
            <Slider.Track className="SalarySliderTrack">
              <Slider.Range className="SalarySliderRange" />
            </Slider.Track>
            <Slider.Thumb className="SalarySliderThumb" aria-label="Minimum salary" />
            <Slider.Thumb className="SalarySliderThumb" aria-label="Maximum salary" />
          </Slider.Root>

          <Flex justify="between">
            <Text size="1" color="gray">
              ${sliderValue[0].toLocaleString()}
            </Text>
            <Text size="1" color="gray">
              ${sliderValue[1].toLocaleString()}
            </Text>
          </Flex>
        </Flex>
      </Popover.Content>
    </Popover.Root>
  );
};

export default CandidatesFilters;
