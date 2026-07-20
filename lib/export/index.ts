export * from "./format-text";
export * from "./filename";
export * from "./download";
export * from "./pdf";

import type { GeneratedPromptSet } from "@/types";
import { formatAsJson, formatAsMarkdown, formatAsText } from "./format-text";
import { buildExportFilename } from "./filename";
import { downloadFile } from "./download";
import { exportAsPdf } from "./pdf";

export type ExportFormat = "markdown" | "txt" | "json" | "pdf";

export function exportPromptSet(set: GeneratedPromptSet, format: ExportFormat): void {
  switch (format) {
    case "markdown":
      downloadFile(buildExportFilename(set, "md"), formatAsMarkdown(set), "text/markdown");
      return;
    case "txt":
      downloadFile(buildExportFilename(set, "txt"), formatAsText(set), "text/plain");
      return;
    case "json":
      downloadFile(buildExportFilename(set, "json"), formatAsJson(set), "application/json");
      return;
    case "pdf":
      exportAsPdf(set);
      return;
  }
}
