import type { AiVideoPlatform, Character, Product, VideoSettings } from "@/types";
import {
  buildCharacterIdentityBlock,
  buildCharacterNegativePrompt,
  buildCharacterSceneDefaults,
} from "./identity";
import { buildCtaLine, buildHookLine, describeCameraMovement, TONE_MOOD } from "./copy-tables";
import { formatForPlatform, type PromptSections } from "./platform-format";

export interface GenerationContext {
  character: Character;
  product: Product;
  settings: VideoSettings;
  scenario: string;
}

const BASELINE_NEGATIVE_PROMPT =
  "blurry, low quality, distorted face, deformed hands, extra limbs, warped anatomy, flickering, morphing, unnatural motion, watermark, text artifacts";

export function durationLabel(settings: VideoSettings): string {
  if (settings.duration === "custom") {
    return `${settings.customDurationSeconds ?? 15}s`;
  }
  return settings.duration;
}

function buildSections(ctx: GenerationContext): PromptSections {
  const { character, settings } = ctx;
  const sceneDefaults = buildCharacterSceneDefaults(character);

  return {
    identity: buildCharacterIdentityBlock(character),
    scenario: ctx.scenario,
    setting: sceneDefaults.setting,
    lighting: sceneDefaults.lighting,
    cameraMovement: describeCameraMovement(settings.cameraStyle || sceneDefaults.cameraStyle),
    mood: TONE_MOOD[settings.tone],
    duration: durationLabel(settings),
    aspectRatio: settings.aspectRatio,
    negativePrompt: buildNegativePrompt(ctx),
  };
}

export function buildVideoPrompt(platform: AiVideoPlatform, ctx: GenerationContext): string {
  return formatForPlatform(platform, buildSections(ctx));
}

export function buildImagePrompt(ctx: GenerationContext): string {
  const { character } = ctx;
  const sceneDefaults = buildCharacterSceneDefaults(character);

  return [
    `Photorealistic portrait of ${buildCharacterIdentityBlock(character)}`,
    `Holding and presenting ${ctx.product.name} directly to camera, natural genuine expression.`,
    `Setting: ${sceneDefaults.setting}. Lighting: ${sceneDefaults.lighting}.`,
    `Shot on a modern smartphone camera, sharp focus on subject and product, shallow depth of field.`,
  ].join("\n");
}

export function buildThumbnailPrompt(ctx: GenerationContext): string {
  const { character, product } = ctx;

  return [
    `Eye-catching vertical thumbnail: ${buildCharacterIdentityBlock(character)}`,
    `Excited, expressive reaction while holding ${product.name}, high contrast, vibrant colors.`,
    `Bold, thick sans-serif text overlay space at the top third of the frame for a short hook headline.`,
    `Composition: rule-of-thirds, product clearly visible, ${ctx.settings.aspectRatio} aspect ratio.`,
  ].join("\n");
}

export function buildVoicePrompt(ctx: GenerationContext): string {
  const { character, settings } = ctx;

  return [
    `Voice: ${character.voice || "natural, conversational voice matching the character"}.`,
    `Tone: ${TONE_MOOD[settings.tone]}.`,
    `Pace: natural conversational pace with genuine pauses, no robotic cadence.`,
    `Delivery: speaks directly to the viewer as if talking to a friend, not reading a script.`,
  ].join("\n");
}

export function buildBrollPrompt(ctx: GenerationContext): string {
  const { product, character } = ctx;
  const sceneDefaults = buildCharacterSceneDefaults(character);

  return [
    `Close-up b-roll of ${product.name} on a clean surface in ${sceneDefaults.setting}.`,
    `Slow macro details: texture, packaging, key features. ${sceneDefaults.lighting}.`,
    `Insert shots of hands interacting with the product, no face visible.`,
    `Smooth, subtle camera drift, ${durationLabel(ctx.settings)} total coverage for editing flexibility.`,
  ].join("\n");
}

export function buildCameraDirections(ctx: GenerationContext): string {
  const { settings, character } = ctx;
  const movement = describeCameraMovement(settings.cameraStyle || character.cameraStyle);

  return [
    `Primary shot: ${movement}.`,
    `Frame the subject from the chest up, product visible in-hand at all times.`,
    `Aspect ratio ${settings.aspectRatio}, optimized for mobile viewing.`,
    `Cut to a close insert shot of the product at the midpoint for emphasis.`,
  ].join("\n");
}

export function buildLightingDirections(ctx: GenerationContext): string {
  const { character, settings } = ctx;
  const lighting = character.lighting || "soft natural daylight with gentle fill light";

  return [
    `${lighting}.`,
    `Color temperature matched to a ${TONE_MOOD[settings.tone]}.`,
    `Avoid harsh shadows on the face; keep catchlights visible in the eyes.`,
  ].join("\n");
}

export function buildNegativePrompt(ctx: GenerationContext): string {
  const characterNegative = buildCharacterNegativePrompt(ctx.character);
  return [BASELINE_NEGATIVE_PROMPT, characterNegative].filter(Boolean).join(", ");
}

export function buildHook(ctx: GenerationContext): string {
  const { settings, product } = ctx;
  return buildHookLine(settings.hookStyle, product.name, product.sellingPoints[0] ?? "");
}

export function buildCta(ctx: GenerationContext): string {
  const { settings, product } = ctx;
  return buildCtaLine(settings.ctaStyle, product.name);
}

export function buildUgcScript(ctx: GenerationContext): string {
  const { product, character } = ctx;
  const hook = buildHook(ctx);
  const cta = buildCta(ctx);
  const sellingPoints = product.sellingPoints.length
    ? product.sellingPoints
    : [product.description || "why it's worth trying"];

  const beats = [`[HOOK] ${hook}`];

  sellingPoints.slice(0, 2).forEach((point, index) => {
    beats.push(`[BEAT ${index + 1}] ${character.name} shows ${point} in action, reacting genuinely.`);
  });

  beats.push(`[CTA] ${cta}`);

  return beats.join("\n\n");
}

export function buildCaption(ctx: GenerationContext): string {
  const { product, settings } = ctx;
  const hook = buildHook(ctx);

  return `${hook} ${product.description ? `${product.description} ` : ""}#${product.platform.replace(/\s+/g, "")} ${settings.tone === "Funny" ? "😂" : ""}`.trim();
}

export function buildHashtags(ctx: GenerationContext): string[] {
  const { product } = ctx;
  const slug = (value: string) =>
    value
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join("");

  const tags = new Set<string>();
  if (product.name) tags.add(`#${slug(product.name)}`);
  tags.add(`#${product.platform.replace(/\s+/g, "")}Made`);
  tags.add("#UGC");
  tags.add("#ProductReview");
  product.sellingPoints.slice(0, 3).forEach((point) => {
    const tag = slug(point);
    if (tag) tags.add(`#${tag}`);
  });
  if (product.targetAudience) tags.add(`#${slug(product.targetAudience)}`);

  return Array.from(tags).filter((tag) => tag.length > 1);
}
