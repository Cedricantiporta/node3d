import { describe, expect, it } from "vitest";

import type { Character, Product } from "@/types";
import { buildScenario } from "./scenario";

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

const minimalProduct: Product = {
  name: "GlowServe Skin Serum",
  url: "",
  description: "",
  sellingPoints: [],
  targetAudience: "",
  country: "",
  language: "English",
  platform: "TikTok",
};

describe("buildScenario", () => {
  it("never leaves a dangling 'about .' when selling points and description are blank", () => {
    const scenario = buildScenario(character, minimalProduct);
    expect(scenario).not.toContain("about .");
    expect(scenario).not.toContain("about  ");
  });

  it("includes the selling point when present", () => {
    const scenario = buildScenario(character, {
      ...minimalProduct,
      sellingPoints: ["fast-absorbing formula"],
    });
    expect(scenario).toContain("about fast-absorbing formula");
  });

  it("falls back to the description when there are no selling points", () => {
    const scenario = buildScenario(character, {
      ...minimalProduct,
      description: "a lightweight vitamin C serum",
    });
    expect(scenario).toContain("about a lightweight vitamin C serum");
  });
});
