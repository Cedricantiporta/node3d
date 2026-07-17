import type { Character } from "@/types";

/**
 * Renders the character's full identity as a single descriptive block so
 * every video/image prompt embeds the same actor without the user ever
 * retyping an appearance description.
 */
export function buildCharacterIdentityBlock(character: Character): string {
  const parts = [
    `${character.name}, ${character.age} years old, ${character.ethnicity}`.trim(),
    character.appearanceDescription,
    character.skinTone && `skin tone: ${character.skinTone}`,
    character.hairstyle && `hair: ${character.hairstyle}`,
    character.clothing && `wardrobe: ${character.clothing}`,
    character.personality && `demeanor: ${character.personality}`,
    character.voice && `voice: ${character.voice}`,
  ].filter(Boolean);

  return `${parts.join(". ")}.`;
}

/** Short reference used inline in scripts/hooks/captions instead of the full block. */
export function buildCharacterShortRef(character: Character): string {
  return character.name || "the creator";
}

export function buildCharacterSceneDefaults(character: Character) {
  return {
    setting: character.roomBackground || "a clean, softly lit modern interior",
    lighting: character.lighting || "soft natural daylight with gentle fill",
    cameraStyle: character.cameraStyle,
  };
}

export function buildCharacterNegativePrompt(character: Character): string {
  return character.negativePrompts?.trim() ?? "";
}
