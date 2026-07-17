import type { Product } from "./product";
import type { VideoSettings, AiVideoPlatform } from "./video-settings";

export interface GeneratedPromptOutputs {
  /** One rendered video prompt per selected AI video platform. */
  videoPrompts: Partial<Record<AiVideoPlatform, string>>;
  imagePrompt: string;
  thumbnailPrompt: string;
  voicePrompt: string;
  brollPrompt: string;
  cameraDirections: string;
  lightingDirections: string;
  negativePrompt: string;
  ugcScript: string;
  hook: string;
  cta: string;
  caption: string;
  hashtags: string[];
}

export interface GeneratedPromptSet {
  id: string;
  characterId: string;
  /** Snapshot of the character name at generation time, for display even if the character is later renamed or deleted. */
  characterName: string;
  templateId: string | null;
  templateName: string | null;
  product: Product;
  settings: VideoSettings;
  outputs: GeneratedPromptOutputs;
  favorite: boolean;
  createdAt: string;
}

export type GeneratedPromptSetInput = Omit<
  GeneratedPromptSet,
  "id" | "favorite" | "createdAt"
>;
