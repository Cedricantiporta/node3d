import type { PromptEnhancerProvider } from "./types";

/**
 * TODO: Wire up the real Claude-backed prompt enhancer.
 *
 * Intended shape once implemented:
 * 1. Read the API key from useAppSettings().settings.providerApiKeys["claude"]
 *    (surfaced in the Settings page) rather than hardcoding it.
 * 2. POST the prompt set's text fields to the Anthropic Messages API with a
 *    system prompt instructing it to rewrite for realism/cinematic quality
 *    while preserving the character identity block verbatim (see
 *    lib/engine/optimizer.ts's "never rewrite identity" contract — the LLM
 *    prompt must enforce the same guarantee).
 * 3. Parse the response back into a GeneratedPromptOutputs shape and return
 *    a new GeneratedPromptSetInput, same signature as LocalRuleProvider.
 * 4. Requests should go through a Next.js route handler (like
 *    app/api/extract-product/route.ts) so the API key never reaches the
 *    client bundle.
 * 5. On failure (missing key, network error, rate limit), fall back to
 *    LocalRuleProvider rather than throwing, so generation never hard-fails.
 *
 * Until then this provider is registered but marked unavailable, so it
 * shows as "Coming soon" in Settings and is never selected by default.
 */
export const ClaudeProvider: PromptEnhancerProvider = {
  id: "claude",
  name: "Claude",
  description: "LLM-rewritten prompts for richer scene direction. Requires an Anthropic API key.",
  available: false,
  requiresApiKey: true,
  async enhance() {
    throw new Error("The Claude provider isn't implemented yet.");
  },
};
