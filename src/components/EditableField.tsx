// src/components/EditableField.tsx
import React, { useState, ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// Define a common Option interface for consistency
interface Option {
  label: string;
  value: string; // The unique identifier
}

interface EditableFieldProps {
  label: string;
  value: string | undefined | null; // Current selected value (could be label or actual ID)
  options: (string | Option)[]; // Can accept string[] or Option[] for now, but we'll normalize
  onValueChange: (newValue: string) => void;
  // Optional: Function to render the value in the UI (e.g., for badges)
  renderValue?: (value: string | undefined | null) => ReactNode;
}

export const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  options,
  onValueChange,
  renderValue,
}) => {
  // Normalize options to always be Option[] for consistent keying and display
  const normalizedOptions: Option[] = options.map((opt) => {
    if (typeof opt === "string") {
      return { label: opt, value: opt }; // For simple string options, label and value are the same
    }
    return opt; // Already an Option object
  });

  const selectedOptionLabel = normalizedOptions.find(
    (opt) => opt.value === value || opt.label === value // Find by value first, then label for flexibility
  )?.label || value; // Fallback to raw value if no match found (e.g., for initial load)

  return (
    <div>
      <label className="text-xs font-semibold text-gray-500">{label}</label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between mt-1 text-sm text-gray-700"
          >
            {renderValue ? renderValue(value) : selectedOptionLabel || "Select..."}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-chevron-down ml-2"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
          {normalizedOptions.map((option) => (
            // --- FIX IS HERE: Use option.value as the key ---
            <DropdownMenuItem key={option.value} onSelect={() => onValueChange(option.value)}>
              {renderValue ? renderValue(option.value) : option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};