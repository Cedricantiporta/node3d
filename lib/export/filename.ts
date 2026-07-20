import type { GeneratedPromptSet } from "@/types";

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "prompt-set"
  );
}

export function buildExportFilename(set: GeneratedPromptSet, extension: string): string {
  const date = new Date(set.createdAt).toISOString().slice(0, 10);
  return `ugc-${slugify(set.product.name)}-${date}.${extension}`;
}
