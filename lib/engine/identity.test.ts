import { describe, expect, it } from "vitest";

import type { Character } from "@/types";
import { buildCharacterIdentityBlock } from "./identity";

const baseCharacter: Character = {
  id: "char-1",
  name: "Mia Chen",
  referenceImages: [],
  appearanceDescription: "bright smile, athletic build",
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

describe("buildCharacterIdentityBlock", () => {
  it("never produces a dangling comma when ethnicity is blank", () => {
    const block = buildCharacterIdentityBlock({ ...baseCharacter, ethnicity: "" });
    expect(block).not.toContain(",.");
    expect(block.startsWith("Mia Chen, 27 years old.")).toBe(true);
  });

  it("never produces a dangling comma when age is blank", () => {
    const block = buildCharacterIdentityBlock({ ...baseCharacter, age: "" });
    expect(block).not.toContain(",.");
    expect(block.startsWith("Mia Chen, Asian-American.")).toBe(true);
  });

  it("still reads cleanly with every field populated", () => {
    const block = buildCharacterIdentityBlock(baseCharacter);
    expect(block).not.toContain(",.");
    expect(block.startsWith("Mia Chen, 27 years old, Asian-American.")).toBe(true);
  });
});
