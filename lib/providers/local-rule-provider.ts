import { optimizePromptSet } from "@/lib/engine/optimizer";
import type { PromptEnhancerProvider } from "./types";

/**
 * Default PromptEnhancerProvider: wraps the rule-based optimizer so the
 * engine/UI only ever talk to providers through the interface, never
 * lib/engine/optimizer.ts directly. Swapping in an LLM-backed provider
 * later means registering a new PromptEnhancerProvider — no caller changes.
 */
export const LocalRuleProvider: PromptEnhancerProvider = {
  id: "local-rule",
  name: "Built-in rule-based optimizer",
  description:
    "Deterministic, offline prompt enhancement — realism boosters, cinematic quality, and artifact prevention. No API key required.",
  available: true,
  requiresApiKey: false,
  async enhance(set, options) {
    return optimizePromptSet(set, options);
  },
};
