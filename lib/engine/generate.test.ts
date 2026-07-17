import { describe, expect, it } from "vitest";

import type { AiVideoPlatform, Character, PromptTemplate } from "@/types";
import { DEFAULT_VIDEO_SETTINGS } from "@/types";
import { generatePromptSet } from "./generate";
import { substituteTemplate } from "./template";

const character: Character = {
  id: "char-1",
  name: "Mia Chen",
  referenceImages: [],
  appearanceDescription: "bright smile, athletic build, warm expressive eyes",
  age: "27",
  ethnicity: "Asian-American",
  clothing: "casual streetwear, oversized hoodie",
  hairstyle: "shoulder-length wavy black hair",
  skinTone: "warm olive",
  voice: "upbeat, friendly, slightly raspy",
  personality: "bubbly, energetic, relatable",
  cameraStyle: "Handheld Selfie",
  roomBackground: "cozy bedroom with fairy lights",
  lighting: "warm ring light",
  negativePrompts: "no sunglasses, no hats",
  notes: "",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const product = {
  name: "GlowServe Skin Serum",
  url: "",
  description: "a lightweight vitamin C serum for glowing skin",
  sellingPoints: ["fast-absorbing formula", "brightens dull skin"],
  targetAudience: "skincare enthusiasts in their 20s",
  country: "United States",
  language: "English",
  platform: "TikTok" as const,
};

const ALL_PLATFORMS: AiVideoPlatform[] = ["Flow", "Veo", "Kling", "Runway", "Hailuo", "Pika"];

const baseSettings = {
  ...DEFAULT_VIDEO_SETTINGS,
  targetPlatforms: ALL_PLATFORMS,
};

describe("generatePromptSet", () => {
  it("embeds the full character identity into every video and image prompt", () => {
    const result = generatePromptSet({
      character,
      product,
      settings: { ...baseSettings, targetPlatforms: [...baseSettings.targetPlatforms] },
    });

    for (const prompt of Object.values(result.outputs.videoPrompts)) {
      expect(prompt).toContain(character.name);
      expect(prompt).toContain(character.appearanceDescription);
    }

    expect(result.outputs.imagePrompt).toContain(character.name);
    expect(result.outputs.imagePrompt).toContain(character.appearanceDescription);
  });

  it("carries the character's negative prompts into the merged negative prompt", () => {
    const result = generatePromptSet({ character, product, settings: baseSettings });
    expect(result.outputs.negativePrompt).toContain("no sunglasses, no hats");
    expect(result.outputs.negativePrompt).toContain("blurry");
  });

  it("produces structurally distinct output per platform", () => {
    const result = generatePromptSet({ character, product, settings: baseSettings });
    const prompts = Object.values(result.outputs.videoPrompts);
    const unique = new Set(prompts);

    expect(unique.size).toBe(prompts.length);
    expect(result.outputs.videoPrompts.Kling).toContain(", ");
    expect(result.outputs.videoPrompts.Pika).toContain("-camera");
    expect(result.outputs.videoPrompts.Veo?.startsWith("Shot:")).toBe(true);
  });

  it("only generates prompts for selected platforms", () => {
    const result = generatePromptSet({
      character,
      product,
      settings: { ...baseSettings, targetPlatforms: ["Flow"] },
    });

    expect(Object.keys(result.outputs.videoPrompts)).toEqual(["Flow"]);
  });

  it("is deterministic for identical inputs", () => {
    const a = generatePromptSet({ character, product, settings: baseSettings });
    const b = generatePromptSet({ character, product, settings: baseSettings });
    expect(a.outputs).toEqual(b.outputs);
  });

  it("substitutes template placeholders with character and product data", () => {
    const template: PromptTemplate = {
      id: "tmpl-1",
      name: "Unboxing",
      category: "Unboxing",
      body: "{{character.name}} unboxes {{product.name}} for {{product.targetAudience}}.",
      isBuiltIn: true,
      editable: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };

    const rendered = substituteTemplate(template.body, character, product);
    expect(rendered).toBe(
      "Mia Chen unboxes GlowServe Skin Serum for skincare enthusiasts in their 20s."
    );
  });

  it("leaves unknown placeholder tokens untouched", () => {
    const rendered = substituteTemplate("{{character.name}} loves {{unknown.token}}", character, product);
    expect(rendered).toBe("Mia Chen loves {{unknown.token}}");
  });

  it("uses the template scenario when generating the UGC script", () => {
    const template: PromptTemplate = {
      id: "tmpl-2",
      name: "GRWM",
      category: "GRWM",
      body: "{{character.name}} gets ready with {{product.name}} in the morning light.",
      isBuiltIn: true,
      editable: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };

    const result = generatePromptSet({ character, product, settings: baseSettings, template });
    expect(result.outputs.videoPrompts.Flow).toContain("gets ready with GlowServe Skin Serum");
    expect(result.templateId).toBe("tmpl-2");
    expect(result.templateName).toBe("GRWM");
  });
});
