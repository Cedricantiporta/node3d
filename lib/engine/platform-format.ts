import type { AiVideoPlatform } from "@/types";

export interface PromptSections {
  identity: string;
  scenario: string;
  setting: string;
  lighting: string;
  cameraMovement: string;
  mood: string;
  duration: string;
  aspectRatio: string;
  negativePrompt: string;
}

type Formatter = (sections: PromptSections) => string;

/**
 * Each AI video platform reads prompts differently, so the same scene
 * description is re-assembled into that platform's expected structure
 * rather than just swapping a label.
 */
const FORMATTERS: Record<AiVideoPlatform, Formatter> = {
  // Flow (Google): flowing cinematic prose, scene-by-scene narrative.
  Flow: (s) =>
    [
      `${s.identity} ${s.scenario}`,
      `Setting: ${s.setting}. Lighting: ${s.lighting}.`,
      `Camera: ${s.cameraMovement}. Overall mood: ${s.mood}.`,
      `Duration: ${s.duration}. Aspect ratio: ${s.aspectRatio}.`,
      s.negativePrompt && `Avoid: ${s.negativePrompt}.`,
    ]
      .filter(Boolean)
      .join("\n"),

  // Veo (Google): shot-first technical framing, then the narrative beat.
  Veo: (s) =>
    [
      `Shot: ${s.cameraMovement}, ${s.aspectRatio}, ${s.duration}.`,
      `Subject: ${s.identity}`,
      `Action: ${s.scenario}`,
      `Environment: ${s.setting}. Lighting: ${s.lighting}. Mood: ${s.mood}.`,
      s.negativePrompt && `Negative prompt: ${s.negativePrompt}.`,
    ]
      .filter(Boolean)
      .join("\n"),

  // Kling: comma-delimited descriptive tag segments, Kling's preferred structure.
  Kling: (s) =>
    [
      s.identity,
      s.scenario,
      `environment: ${s.setting}`,
      `lighting: ${s.lighting}`,
      `camera movement: ${s.cameraMovement}`,
      `mood: ${s.mood}`,
      `duration: ${s.duration}`,
      `aspect ratio: ${s.aspectRatio}`,
      s.negativePrompt && `negative: ${s.negativePrompt}`,
    ]
      .filter(Boolean)
      .join(", "),

  // Runway: short, motion-first — a subject/action line plus a dedicated camera line.
  Runway: (s) =>
    [
      `${s.identity} ${s.scenario} Set in ${s.setting}, ${s.lighting}.`,
      `Camera: ${s.cameraMovement}.`,
      `Style: ${s.mood}. [${s.aspectRatio}, ${s.duration}]`,
      s.negativePrompt && `Negative: ${s.negativePrompt}`,
    ]
      .filter(Boolean)
      .join("\n"),

  // Hailuo (MiniMax): scene paragraph with the camera cue inline in parentheses.
  Hailuo: (s) =>
    [
      `${s.identity} ${s.scenario} (camera: ${s.cameraMovement})`,
      `${s.setting}, ${s.lighting}, ${s.mood}.`,
      `[${s.duration}, ${s.aspectRatio}]`,
      s.negativePrompt && `Avoid: ${s.negativePrompt}`,
    ]
      .filter(Boolean)
      .join("\n"),

  // Pika: punchy short-form with trailing style/camera tags.
  Pika: (s) =>
    [
      `${s.scenario}`,
      `${s.identity}`,
      `-camera ${s.cameraMovement}`,
      `-style ${s.mood}`,
      `-scene ${s.setting}, ${s.lighting}`,
      `-ar ${s.aspectRatio} -duration ${s.duration}`,
      s.negativePrompt && `-negative ${s.negativePrompt}`,
    ]
      .filter(Boolean)
      .join("\n"),
};

export function formatForPlatform(
  platform: AiVideoPlatform,
  sections: PromptSections
): string {
  return FORMATTERS[platform](sections);
}
