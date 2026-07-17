export const VIDEO_DURATIONS = ["8s", "10s", "15s", "30s", "custom"] as const;
export type VideoDuration = (typeof VIDEO_DURATIONS)[number];

export const VIDEO_TONES = [
  "Luxury",
  "Funny",
  "Casual",
  "Emotional",
  "Professional",
] as const;
export type VideoTone = (typeof VIDEO_TONES)[number];

export const HOOK_STYLES = [
  "Question",
  "Bold Claim",
  "POV",
  "Before / After",
  "Curiosity Gap",
  "Shock / Surprise",
  "Relatable Problem",
] as const;
export type HookStyle = (typeof HOOK_STYLES)[number];

export const CTA_STYLES = [
  "Soft Suggestion",
  "Urgent / Limited Time",
  "Discount Code",
  "Follow for More",
  "Link in Bio",
  "Comment to Learn More",
] as const;
export type CtaStyle = (typeof CTA_STYLES)[number];

export const ASPECT_RATIOS = ["9:16", "1:1", "16:9"] as const;
export type AspectRatio = (typeof ASPECT_RATIOS)[number];

export const AI_VIDEO_PLATFORMS = [
  "Flow",
  "Veo",
  "Kling",
  "Runway",
  "Hailuo",
  "Pika",
] as const;
export type AiVideoPlatform = (typeof AI_VIDEO_PLATFORMS)[number];

export const CAMERA_STYLES = [
  "Handheld Selfie",
  "Static Tripod",
  "Slow Push-In",
  "Orbit / Arc",
  "Over-the-Shoulder",
  "Tracking Shot",
] as const;
export type CameraStyleOption = (typeof CAMERA_STYLES)[number];

export interface VideoSettings {
  duration: VideoDuration;
  customDurationSeconds?: number;
  tone: VideoTone;
  cameraStyle: string;
  hookStyle: HookStyle;
  ctaStyle: CtaStyle;
  aspectRatio: AspectRatio;
  targetPlatforms: AiVideoPlatform[];
}

export const DEFAULT_VIDEO_SETTINGS: VideoSettings = {
  duration: "8s",
  tone: "Casual",
  cameraStyle: "Handheld Selfie",
  hookStyle: "Question",
  ctaStyle: "Soft Suggestion",
  aspectRatio: "9:16",
  targetPlatforms: ["Flow", "Veo"],
};
