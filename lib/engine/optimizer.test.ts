import { describe, expect, it } from "vitest";

import type { AiVideoPlatform, Character } from "@/types";
import { DEFAULT_VIDEO_SETTINGS } from "@/types";
import { generatePromptSet } from "./generate";
import { optimizePromptSet } from "./optimizer";
import { buildCharacterIdentityBlock } from "./identity";

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
const settings = { ...DEFAULT_VIDEO_SETTINGS, targetPlatforms: ALL_PLATFORMS };

describe("optimizePromptSet", () => {
  it("never rewrites the character identity block", () => {
    const base = generatePromptSet({ character, product, settings });
    const optimized = optimizePromptSet(base);
    const identity = buildCharacterIdentityBlock(character);

    for (const platform of ALL_PLATFORMS) {
      expect(optimized.outputs.videoPrompts[platform]).toContain(identity);
    }
    expect(optimized.outputs.imagePrompt).toContain(identity);
  });

  it("appends realism, cinematic, and expression guidance to video prompts", () => {
    const base = generatePromptSet({ character, product, settings });
    const optimized = optimizePromptSet(base);

    for (const platform of ALL_PLATFORMS) {
      const prompt = optimized.outputs.videoPrompts[platform] ?? "";
      expect(prompt).toContain("natural skin texture");
      expect(prompt).toContain("shallow depth of field");
      expect(prompt).toContain("natural unforced facial expressions");
    }
  });

  it("merges AI-artifact prevention terms into the negative prompt without duplicating", () => {
    const base = generatePromptSet({ character, product, settings });
    const optimized = optimizePromptSet(base);

    expect(optimized.outputs.negativePrompt).toContain("deformed hands");
    expect(optimized.outputs.negativePrompt).toContain("no sunglasses, no hats");

    const optimizedAgain = optimizePromptSet(optimized);
    const occurrences = optimizedAgain.outputs.negativePrompt.split("deformed hands").length - 1;
    expect(occurrences).toBe(1);
  });

  it("returns the set unchanged when disabled", () => {
    const base = generatePromptSet({ character, product, settings });
    const optimized = optimizePromptSet(base, { enabled: false });
    expect(optimized).toEqual(base);
  });

  it("is idempotent — running it twice does not double-append enhancements", () => {
    const base = generatePromptSet({ character, product, settings });
    const once = optimizePromptSet(base);
    const twice = optimizePromptSet(once);
    expect(twice).toEqual(once);
  });
});
