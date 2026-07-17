import type {
  Character,
  GeneratedPromptOutputs,
  GeneratedPromptSetInput,
  Product,
  PromptTemplate,
  VideoSettings,
} from "@/types";
import { buildScenario } from "./scenario";
import type { GenerationContext } from "./builders";
import {
  buildBrollPrompt,
  buildCameraDirections,
  buildCaption,
  buildCta,
  buildHashtags,
  buildHook,
  buildImagePrompt,
  buildLightingDirections,
  buildNegativePrompt,
  buildThumbnailPrompt,
  buildUgcScript,
  buildVideoPrompt,
  buildVoicePrompt,
} from "./builders";

export interface GeneratePromptSetParams {
  character: Character;
  product: Product;
  settings: VideoSettings;
  template?: PromptTemplate;
}

export function generatePromptSet({
  character,
  product,
  settings,
  template,
}: GeneratePromptSetParams): GeneratedPromptSetInput {
  const scenario = buildScenario(character, product, template);
  const ctx: GenerationContext = { character, product, settings, scenario };

  const videoPrompts: GeneratedPromptOutputs["videoPrompts"] = {};
  for (const platform of settings.targetPlatforms) {
    videoPrompts[platform] = buildVideoPrompt(platform, ctx);
  }

  const outputs: GeneratedPromptOutputs = {
    videoPrompts,
    imagePrompt: buildImagePrompt(ctx),
    thumbnailPrompt: buildThumbnailPrompt(ctx),
    voicePrompt: buildVoicePrompt(ctx),
    brollPrompt: buildBrollPrompt(ctx),
    cameraDirections: buildCameraDirections(ctx),
    lightingDirections: buildLightingDirections(ctx),
    negativePrompt: buildNegativePrompt(ctx),
    ugcScript: buildUgcScript(ctx),
    hook: buildHook(ctx),
    cta: buildCta(ctx),
    caption: buildCaption(ctx),
    hashtags: buildHashtags(ctx),
  };

  return {
    characterId: character.id,
    characterName: character.name,
    templateId: template?.id ?? null,
    templateName: template?.name ?? null,
    product,
    settings,
    outputs,
  };
}
