"use client";

import { DownloadIcon, FileJsonIcon, FileTextIcon, FileIcon, PrinterIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportPromptSet, type ExportFormat } from "@/lib/export";
import type { GeneratedPromptSet } from "@/types";

const FORMATS: { format: ExportFormat; label: string; icon: typeof FileIcon }[] = [
  { format: "markdown", label: "Markdown (.md)", icon: FileTextIcon },
  { format: "txt", label: "Plain text (.txt)", icon: FileIcon },
  { format: "json", label: "JSON (.json)", icon: FileJsonIcon },
  { format: "pdf", label: "PDF (print)", icon: PrinterIcon },
];

export function ExportMenu({ result }: { result: GeneratedPromptSet }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline">
          <DownloadIcon /> Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {FORMATS.map(({ format, label, icon: Icon }) => (
          <DropdownMenuItem key={format} onClick={() => exportPromptSet(result, format)}>
            <Icon /> {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
