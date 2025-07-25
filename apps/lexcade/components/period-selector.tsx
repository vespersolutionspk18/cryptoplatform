"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RiTimeLine } from "@remixicon/react";

export interface PeriodOption {
  value: string;
  label: string;
  limit: number;
}

export const PERIOD_OPTIONS: PeriodOption[] = [
  { value: "1m", label: "1 min", limit: 60 },
  { value: "3m", label: "3 min", limit: 60 },
  { value: "5m", label: "5 min", limit: 60 },
  { value: "15m", label: "15 min", limit: 96 },
  { value: "30m", label: "30 min", limit: 96 },
  { value: "1h", label: "1 hour", limit: 72 },
  { value: "2h", label: "2 hour", limit: 72 },
  { value: "4h", label: "4 hour", limit: 72 },
  { value: "1d", label: "1 day", limit: 90 },
];

interface PeriodSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const currentPeriod = PERIOD_OPTIONS.find(opt => opt.value === value) ?? PERIOD_OPTIONS[0]!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2 rounded-full border-border/80 bg-background hover:bg-background text-muted-foreground/80 hover:text-foreground aria-expanded:text-foreground"
          aria-label="Select time period"
        >
          <RiTimeLine className="size-3.5" aria-hidden="true" />
          <span className="text-sm font-medium">{currentPeriod.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-fit min-w-32">
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {PERIOD_OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}