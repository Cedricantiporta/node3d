import { describe, expect, it } from "vitest";

import "./index";
import { enhancerProviders, videoGeneratorProviders, getActiveEnhancerProvider } from "./registry";
import { DEFAULT_VIDEO_SETTINGS } from "@/types";
import type { Character, Product } from "@/types";

const character: Character = {
  id: "char-1",
  name: "Mia Chen",
  referenceImages: [],
  appearanceDescription: "bright smile",
  age: "27",
  ethnicity: "Asian-American",
  clothing: "",
  hairstyle: "",
  skinTone: "",
  voice: "",
  personality: "",
  cameraStyle: "Handheld Selfie",
  roomBackground: "",
  lighting: "",
  negativePrompts: "",
  notes: "",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const product: Product = {
  name: "GlowServe Skin Serum",
  url: "",
  description: "",
  sellingPoints: [],
  targetAudience: "",
  country: "",
  language: "English",
  platform: "TikTok",
};

describe("provider registry", () => {
  it("registers the local-rule enhancer provider as available by default", () => {
    const active = getActiveEnhancerProvider();
    expect(active.id).toBe("local-rule");
    expect(active.available).toBe(true);
  });

  it("registers claude/openai/gemini as unavailable stubs", () => {
    for (const id of ["claude", "openai", "gemini"]) {
      const provider = enhancerProviders.get(id);
      expect(provider?.available).toBe(false);
      expect(provider?.requiresApiKey).toBe(true);
    }
  });

  it("registers all six video platforms as unavailable stubs", () => {
    const ids = videoGeneratorProviders.list().map((p) => p.id);
    expect(ids.sort()).toEqual(["flow", "hailuo", "kling", "pika", "runway", "veo"].sort());
    for (const provider of videoGeneratorProviders.list()) {
      expect(provider.available).toBe(false);
    }
  });

  it("stub enhancer providers reject rather than silently no-op", async () => {
    const claude = enhancerProviders.get("claude");
    await expect(
      claude?.enhance({
        characterId: character.id,
        characterName: character.name,
        templateId: null,
        templateName: null,
        product,
        settings: DEFAULT_VIDEO_SETTINGS,
        outputs: {
          videoPrompts: {},
          imagePrompt: "",
          thumbnailPrompt: "",
          voicePrompt: "",
          brollPrompt: "",
          cameraDirections: "",
          lightingDirections: "",
          negativePrompt: "",
          ugcScript: "",
          hook: "",
          cta: "",
          caption: "",
          hashtags: [],
        },
      })
    ).rejects.toThrow();
  });

  it("the active provider's enhance() runs the rule-based optimizer", async () => {
    const active = getActiveEnhancerProvider();
    const result = await active.enhance({
      characterId: character.id,
      characterName: character.name,
      templateId: null,
      templateName: null,
      product,
      settings: DEFAULT_VIDEO_SETTINGS,
      outputs: {
        videoPrompts: { Flow: character.appearanceDescription },
        imagePrompt: "",
        thumbnailPrompt: "",
        voicePrompt: "",
        brollPrompt: "",
        cameraDirections: "",
        lightingDirections: "",
        negativePrompt: "",
        ugcScript: "",
        hook: "",
        cta: "",
        caption: "",
        hashtags: [],
      },
    });

    expect(result.outputs.videoPrompts.Flow).toContain("natural skin texture");
  });
});
