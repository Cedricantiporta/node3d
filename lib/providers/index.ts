export * from "./types";
export * from "./registry";
export * from "./local-rule-provider";
export * from "./claude";
export * from "./openai";
export * from "./gemini";
export * from "./video/flow";
export * from "./video/veo";
export * from "./video/kling";
export * from "./video/runway";
export * from "./video/hailuo";
export * from "./video/pika";

import { enhancerProviders, videoGeneratorProviders } from "./registry";
import { LocalRuleProvider } from "./local-rule-provider";
import { ClaudeProvider } from "./claude";
import { OpenAiProvider } from "./openai";
import { GeminiProvider } from "./gemini";
import { FlowProvider } from "./video/flow";
import { VeoProvider } from "./video/veo";
import { KlingProvider } from "./video/kling";
import { RunwayProvider } from "./video/runway";
import { HailuoProvider } from "./video/hailuo";
import { PikaProvider } from "./video/pika";

let bootstrapped = false;

/** Registers every known provider. Idempotent — safe to call on every render. */
export function bootstrapProviders(): void {
  if (bootstrapped) return;
  bootstrapped = true;

  enhancerProviders.register(LocalRuleProvider);
  enhancerProviders.register(ClaudeProvider);
  enhancerProviders.register(OpenAiProvider);
  enhancerProviders.register(GeminiProvider);

  videoGeneratorProviders.register(FlowProvider);
  videoGeneratorProviders.register(VeoProvider);
  videoGeneratorProviders.register(KlingProvider);
  videoGeneratorProviders.register(RunwayProvider);
  videoGeneratorProviders.register(HailuoProvider);
  videoGeneratorProviders.register(PikaProvider);
}

bootstrapProviders();
