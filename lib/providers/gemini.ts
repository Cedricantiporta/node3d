import type { PromptEnhancerProvider } from "./types";

/**
 * TODO: Wire up the real Gemini-backed prompt enhancer.
 *
 * Same contract as lib/providers/claude.ts — read the API key from
 * useAppSettings().settings.providerApiKeys["gemini"], call the Gemini API
 * through a server-side route handler, preserve the character identity
 * block verbatim, and fall back to LocalRuleProvider on any failure rather
 * than throwing.
 *
 * Worth noting: Gemini is also the model family behind Google Flow/Veo, so
 * this provider is a natural place to eventually share auth with
 * lib/providers/video/flow.ts and lib/providers/video/veo.ts.
 *
 * Until then this provider is registered but marked unavailable, so it
 * shows as "Coming soon" in Settings and is never selected by default.
 */
export const GeminiProvider: PromptEnhancerProvider = {
  id: "gemini",
  name: "Gemini",
  description: "LLM-rewritten prompts using Google's Gemini models. Requires a Gemini API key.",
  available: false,
  requiresApiKey: true,
  async enhance() {
    throw new Error("The Gemini provider isn't implemented yet.");
  },
};
