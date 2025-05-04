"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";

interface MultiSelectProps {
  options: { label: string; value: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options",
  className = "",
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const handleUnselect = (value: string) => {
    onChange(selected.filter((item) => item !== value));
  };

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
    setInputValue("");
  };

  const selectedOptions = options.filter((option) =>
    selected.includes(option.value)
  );

  return (
    <div className={`relative ${className}`}>
      <div
        className="flex min-h-10 w-full flex-wrap items-center gap-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
        onClick={() => {
          inputRef.current?.focus();
          setOpen(true);
        }}
      >
        {selectedOptions.map((option) => (
          <Badge
            key={option.value}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {option.label}
            <button
              type="button"
              className="rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleUnselect(option.value);
              }}
            >
              <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              <span className="sr-only">Remove {option.label}</span>
            </button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={() => setOpen(false)}
          onFocus={() => setOpen(true)}
          placeholder={selectedOptions.length === 0 ? placeholder : ""}
          className="ml-1 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        />
      </div>
      <div className="relative">
        <Command
          className={
            open
              ? "absolute top-0 z-10 w-full rounded-md border bg-popover shadow-md"
              : "hidden"
          }
        >
          <CommandGroup className="max-h-64 overflow-auto">
            {options?.map((option) => {
              const isSelected = selected.includes(option.value);
              return (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => handleSelect(option.value)}
                  className={`flex cursor-pointer items-center justify-between ${
                    isSelected ? "bg-muted" : ""
                  }`}
                >
                  {option.label}
                  {isSelected && <span className="ml-2 text-primary">✓</span>}
                </CommandItem>
              );
            })}
            {options.length === 0 && (
              <CommandItem disabled className="text-muted-foreground">
                No options available
              </CommandItem>
            )}
          </CommandGroup>
        </Command>
      </div>
    </div>
  );
}
