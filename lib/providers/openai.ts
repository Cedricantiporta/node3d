import type { PromptEnhancerProvider } from "./types";

/**
 * TODO: Wire up the real OpenAI-backed prompt enhancer.
 *
 * Same contract as lib/providers/claude.ts — read the API key from
 * useAppSettings().settings.providerApiKeys["openai"], call the Chat
 * Completions (or Responses) API through a server-side route handler,
 * preserve the character identity block verbatim, and fall back to
 * LocalRuleProvider on any failure rather than throwing.
 *
 * Until then this provider is registered but marked unavailable, so it
 * shows as "Coming soon" in Settings and is never selected by default.
 */
export const OpenAiProvider: PromptEnhancerProvider = {
  id: "openai",
  name: "OpenAI",
  description: "LLM-rewritten prompts using GPT models. Requires an OpenAI API key.",
  available: false,
  requiresApiKey: true,
  async enhance() {
    throw new Error("The OpenAI provider isn't implemented yet.");
  },
};
