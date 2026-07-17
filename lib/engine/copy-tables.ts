import type { CtaStyle, HookStyle, VideoTone } from "@/types";

export const TONE_MOOD: Record<VideoTone, string> = {
  Luxury: "polished, aspirational mood with rich color grading and elegant pacing",
  Funny: "playful, high-energy mood with quick comedic timing",
  Casual: "relaxed, authentic mood that feels unscripted and friendly",
  Emotional: "warm, intimate mood with soft pacing that lets feeling land",
  Professional: "clean, confident mood with crisp, deliberate pacing",
};

export const CAMERA_MOVEMENT: Record<string, string> = {
  "Handheld Selfie": "handheld selfie-style framing, arm's-length distance, natural micro-shake",
  "Static Tripod": "locked-off static tripod shot, no camera movement",
  "Slow Push-In": "slow, steady push-in toward the subject",
  "Orbit / Arc": "smooth orbiting arc around the subject",
  "Over-the-Shoulder": "over-the-shoulder framing looking toward the product",
  "Tracking Shot": "smooth lateral tracking shot following the subject",
};

export function describeCameraMovement(style: string): string {
  return CAMERA_MOVEMENT[style] ?? style;
}

export function buildHookLine(style: HookStyle, productName: string, sellingPoint: string): string {
  switch (style) {
    case "Question":
      return `Have you tried ${productName} yet? Here's why everyone's talking about it.`;
    case "Bold Claim":
      return `${productName} just changed the way I do this — completely.`;
    case "POV":
      return `POV: you just discovered ${productName} and your routine will never be the same.`;
    case "Before / After":
      return `This is what changed after I started using ${productName}.`;
    case "Curiosity Gap":
      return `Nobody told me ${productName} could do this...`;
    case "Shock / Surprise":
      return `Wait — ${productName} actually does THIS?`;
    case "Relatable Problem":
      return `If you're dealing with ${sellingPoint || "this problem"}, you need to see this.`;
    default:
      return `Let me show you ${productName}.`;
  }
}

export function buildCtaLine(style: CtaStyle, productName: string): string {
  switch (style) {
    case "Soft Suggestion":
      return `If this sounds like something you'd love, ${productName} is worth checking out.`;
    case "Urgent / Limited Time":
      return `Don't wait — grab ${productName} before it sells out.`;
    case "Discount Code":
      return `Use the code in my bio to save on ${productName} right now.`;
    case "Follow for More":
      return `Follow for more honest reviews like this one.`;
    case "Link in Bio":
      return `Link in bio to get your own ${productName}.`;
    case "Comment to Learn More":
      return `Drop a comment if you want the link to ${productName}.`;
    default:
      return `Check out ${productName} — link in bio.`;
  }
}
