import type { GeneratedPromptSet } from "@/types";
import { buildExportSections } from "./format-text";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Client-side "PDF" export via a print-styled window — the user saves it as
 * a PDF through the browser's print dialog. Avoids pulling in a PDF library.
 */
export function exportAsPdf(set: GeneratedPromptSet): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const date = new Date(set.createdAt).toLocaleString();
  const sectionsHtml = buildExportSections(set)
    .map(
      ([title, body]) => `
        <section>
          <h2>${escapeHtml(title)}</h2>
          <p>${escapeHtml(body).replace(/\n/g, "<br />")}</p>
        </section>
      `
    )
    .join("");

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(set.product.name)} — AI UGC Prompts</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #1a1a1a; padding: 2rem; max-width: 720px; margin: 0 auto; }
          h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
          .meta { color: #555; font-size: 0.875rem; margin-bottom: 2rem; }
          .meta div { margin-bottom: 0.125rem; }
          section { margin-bottom: 1.5rem; break-inside: avoid; }
          h2 { font-size: 1rem; margin-bottom: 0.25rem; }
          p { font-size: 0.875rem; line-height: 1.5; white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(set.product.name)} — AI UGC Prompts</h1>
        <div class="meta">
          <div>Character: ${escapeHtml(set.characterName)}</div>
          ${set.templateName ? `<div>Template: ${escapeHtml(set.templateName)}</div>` : ""}
          <div>Generated: ${escapeHtml(date)}</div>
        </div>
        ${sectionsHtml}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}
