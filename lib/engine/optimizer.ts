import type { AiVideoPlatform, GeneratedPromptSetInput } from "@/types";
import { describeCameraMovement } from "./copy-tables";

export interface OptimizeOptions {
  /** When false, the prompt set is returned unchanged. Defaults to true. */
  enabled?: boolean;
}

const REALISM_BOOSTER =
  "natural skin texture with visible pores and subtle imperfections, authentic candid feel, not airbrushed";

const CINEMATIC_QUALITY =
  "shot on a cinema-grade lens, shallow depth of field, subtle natural film grain, balanced color grading";

const EXPRESSION_GUIDANCE =
  "natural unforced facial expressions, authentic micro-expressions, genuine eye contact, believable blinking";

const LIGHTING_REFINEMENT =
  "soft fill light to avoid harsh shadows, natural catchlights visible in the eyes";

const ARTIFACT_PREVENTION_TERMS = [
  "deformed hands",
  "extra fingers",
  "warped face",
  "flickering",
  "morphing",
  "unnatural blinking",
  "plastic skin",
  "uncanny valley",
  "jittery motion",
  "waxy texture",
];

/** Kling reads as comma-delimited tag segments; every other platform reads as line-delimited prose. */
const COMMA_STYLE_PLATFORMS = new Set<AiVideoPlatform>(["Kling"]);

function appendSegment(prompt: string, addition: string, style: "comma" | "newline"): string {
  if (!addition || prompt.includes(addition)) return prompt;
  const separator = style === "comma" ? ", " : "\n";
  return prompt ? `${prompt}${separator}${addition}` : addition;
}

function optimizeVideoPrompt(platform: AiVideoPlatform, prompt: string, cameraStyle: string): string {
  const style = COMMA_STYLE_PLATFORMS.has(platform) ? "comma" : "newline";
  const movement = describeCameraMovement(cameraStyle);

  let next = prompt;
  next = appendSegment(next, `${REALISM_BOOSTER}, ${CINEMATIC_QUALITY}`, style);
  next = appendSegment(next, `refined camera movement: ${movement}`, style);
  next = appendSegment(next, EXPRESSION_GUIDANCE, style);
  return next;
}

function mergeNegativePrompt(negativePrompt: string): string {
  const existing = new Set(
    negativePrompt
      .split(",")
      .map((term) => term.trim().toLowerCase())
      .filter(Boolean)
  );

  const additions = ARTIFACT_PREVENTION_TERMS.filter(
    (term) => !existing.has(term.toLowerCase())
  );

  if (additions.length === 0) return negativePrompt;
  return [negativePrompt, ...additions].filter(Boolean).join(", ");
}

/**
 * Rule-based post-processing pass applied to a freshly generated prompt set.
 * Only ever appends enhancement text — the character identity block embedded
 * by the engine is never rewritten, so it survives optimization unchanged.
 * Structured to be swapped for an LLM-backed PromptEnhancerProvider later.
 */
export function optimizePromptSet(
  set: GeneratedPromptSetInput,
  options: OptimizeOptions = {}
): GeneratedPromptSetInput {
  if (options.enabled === false) return set;

  const { outputs, settings } = set;

  const optimizedVideoPrompts: typeof outputs.videoPrompts = {};
  for (const [platform, prompt] of Object.entries(outputs.videoPrompts) as [
    AiVideoPlatform,
    string,
  ][]) {
    optimizedVideoPrompts[platform] = optimizeVideoPrompt(
      platform,
      prompt,
      settings.cameraStyle
    );
  }

  return {
    ...set,
    outputs: {
      ...outputs,
      videoPrompts: optimizedVideoPrompts,
      imagePrompt: appendSegment(
        appendSegment(outputs.imagePrompt, REALISM_BOOSTER, "newline"),
        `${CINEMATIC_QUALITY}. ${EXPRESSION_GUIDANCE}.`,
        "newline"
      ),
      thumbnailPrompt: appendSegment(
        outputs.thumbnailPrompt,
        `${REALISM_BOOSTER}. ${EXPRESSION_GUIDANCE}.`,
        "newline"
      ),
      cameraDirections: appendSegment(
        outputs.cameraDirections,
        `Refinement: ${describeCameraMovement(settings.cameraStyle)}, ${CINEMATIC_QUALITY}.`,
        "newline"
      ),
      lightingDirections: appendSegment(
        outputs.lightingDirections,
        `${LIGHTING_REFINEMENT}.`,
        "newline"
      ),
      negativePrompt: mergeNegativePrompt(outputs.negativePrompt),
    },
  };
}
