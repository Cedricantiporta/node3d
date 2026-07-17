"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PromptTemplate } from "@/types";

const NONE_VALUE = "__none__";

export function TemplatePicker({
  templates,
  value,
  onChange,
}: {
  templates: PromptTemplate[];
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  return (
    <Select
      value={value ?? NONE_VALUE}
      onValueChange={(next) => onChange(next === NONE_VALUE ? null : next)}
    >
      <SelectTrigger id="template-picker" className="w-full">
        <SelectValue placeholder="No template (default scenario)" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE_VALUE}>No template (default scenario)</SelectItem>
        {templates.map((template) => (
          <SelectItem key={template.id} value={template.id}>
            {template.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
