"use client";

import * as React from "react";
import { XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SellingPointsInput({
  id,
  value,
  onChange,
  placeholder = "Fast-absorbing formula, then press Enter...",
}: {
  id?: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = React.useState("");

  const addPoint = () => {
    const trimmed = draft.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setDraft("");
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div
      className={cn(
        "border-input focus-within:border-ring focus-within:ring-ring/50 flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border bg-transparent px-2.5 py-1.5 shadow-sm transition-[color,box-shadow] focus-within:ring-[3px]"
      )}
    >
      {value.map((point, index) => (
        <Badge key={point} variant="secondary" className="gap-1 py-1">
          {point}
          <button
            type="button"
            onClick={() => removeAt(index)}
            aria-label={`Remove ${point}`}
            className="hover:text-foreground"
          >
            <XIcon className="size-3" />
          </button>
        </Badge>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addPoint();
          } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
            removeAt(value.length - 1);
          }
        }}
        onBlur={addPoint}
        placeholder={value.length === 0 ? placeholder : "Add another..."}
        className="text-foreground placeholder:text-muted-foreground min-w-[140px] flex-1 bg-transparent py-1 text-sm outline-none"
      />
    </div>
  );
}
