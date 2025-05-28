// src/components/EditableField.tsx
"use client"

import React from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from 'lucide-react';

interface EditableFieldProps {
  label: string;
  value: string;
  options: readonly string[];
  onValueChange: (newValue: string) => void;
  // An optional prop to pass a render function for the value (e.g., a badge)
  renderValue?: (value: string) => React.ReactNode;
}

export const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  options,
  onValueChange,
  renderValue
}) => {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500">{label}</label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between mt-1">
            {renderValue ? renderValue(value) : value}
            <ChevronDown className="ml-2 h-4 w-4 text-gray-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
          {options.map((option) => (
            <DropdownMenuItem key={option} onSelect={() => onValueChange(option)}>
              {renderValue ? renderValue(option) : option}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};