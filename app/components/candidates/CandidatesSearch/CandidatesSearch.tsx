"use client";

import React from "react";
import { TextField } from "@radix-ui/themes";
import { Cross2Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import "./CandidatesSearch.css";

interface CandidatesSearchProps {
  value: string;
  onChange: (value: string) => void;
}

const CandidatesSearch: React.FC<CandidatesSearchProps> = ({ value, onChange }) => (
  <TextField.Root
    placeholder="Search candidates…"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="CandidatesSearch"
    aria-label="Search candidates"
  >
    <TextField.Slot>
      <MagnifyingGlassIcon />
    </TextField.Slot>
    {value && (
      <TextField.Slot side="right">
        <button
          type="button"
          aria-label="Clear search"
          className="CandidatesSearchClear"
          onClick={() => onChange("")}
        >
          <Cross2Icon />
        </button>
      </TextField.Slot>
    )}
  </TextField.Root>
);

export default CandidatesSearch;
