export const REFERENCE_IMAGE_SLOTS = [
  "front",
  "side",
  "back",
  "smiling",
  "neutral",
] as const;

export type ReferenceImageSlot = (typeof REFERENCE_IMAGE_SLOTS)[number];

export interface ReferenceImage {
  slot: ReferenceImageSlot;
  /** Compressed data URL (or object URL) for the reference image. */
  dataUrl: string;
}

export interface Character {
  id: string;
  name: string;
  referenceImages: ReferenceImage[];
  appearanceDescription: string;
  age: string;
  ethnicity: string;
  clothing: string;
  hairstyle: string;
  skinTone: string;
  voice: string;
  personality: string;
  cameraStyle: string;
  roomBackground: string;
  lighting: string;
  negativePrompts: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type CharacterInput = Omit<Character, "id" | "createdAt" | "updatedAt">;
