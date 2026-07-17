import type { GeneratedPromptSet } from "@/types";

/** Ordered (title, body) sections shared by the plain-text, Markdown, and PDF exporters. */
export function buildExportSections(set: GeneratedPromptSet): [string, string][] {
  return [
    ...Object.entries(set.outputs.videoPrompts).map(
      ([platform, prompt]) => [`${platform} Prompt`, prompt ?? ""] as [string, string]
    ),
    ["Image Prompt", set.outputs.imagePrompt],
    ["Thumbnail Prompt", set.outputs.thumbnailPrompt],
    ["B-roll Prompt", set.outputs.brollPrompt],
    ["Camera Directions", set.outputs.cameraDirections],
    ["Lighting Directions", set.outputs.lightingDirections],
    ["Negative Prompt", set.outputs.negativePrompt],
    ["Full UGC Script", set.outputs.ugcScript],
    ["Hook", set.outputs.hook],
    ["CTA", set.outputs.cta],
    ["Caption", set.outputs.caption],
    ["Hashtags", set.outputs.hashtags.join(" ")],
  ];
}

function buildHeader(set: GeneratedPromptSet): string {
  const date = new Date(set.createdAt).toLocaleString();
  return [
    `Character: ${set.characterName}`,
    `Product: ${set.product.name}`,
    set.templateName && `Template: ${set.templateName}`,
    `Generated: ${date}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function formatAsText(set: GeneratedPromptSet): string {
  const sections = buildExportSections(set)
    .map(([title, body]) => `${title.toUpperCase()}\n${"-".repeat(title.length)}\n${body}`)
    .join("\n\n");

  return `${set.product.name} — AI UGC Prompts\n${buildHeader(set)}\n\n${sections}`;
}

export function formatAsMarkdown(set: GeneratedPromptSet): string {
  const date = new Date(set.createdAt).toLocaleString();
  const meta = [
    `- **Character:** ${set.characterName}`,
    `- **Product:** ${set.product.name}`,
    set.templateName && `- **Template:** ${set.templateName}`,
    `- **Generated:** ${date}`,
  ]
    .filter(Boolean)
    .join("\n");

  const sections = buildExportSections(set)
    .map(([title, body]) => `## ${title}\n\n${body}`)
    .join("\n\n");

  return `# ${set.product.name} — AI UGC Prompts\n\n${meta}\n\n${sections}\n`;
}

export function formatAsJson(set: GeneratedPromptSet): string {
  return JSON.stringify(set, null, 2);
}
