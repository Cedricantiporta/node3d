import type { GeneratedPromptSetInput } from "@/types";

export interface ProviderInfo {
  id: string;
  name: string;
  description: string;
  /** False for stubbed providers that aren't wired to a real API yet. */
  available: boolean;
  /** Whether this provider needs an API key configured in Settings. */
  requiresApiKey: boolean;
}

/**
 * Rewrites/enhances a generated prompt set. The rule-based optimizer
 * (lib/engine/optimizer.ts) is the default implementation; future
 * LLM-backed providers (Claude, OpenAI, Gemini) implement the same shape.
 */
export interface PromptEnhancerProvider extends ProviderInfo {
  enhance(
    set: GeneratedPromptSetInput,
    options?: { enabled?: boolean }
  ): Promise<GeneratedPromptSetInput>;
}

export type VideoJobStatus = "pending" | "processing" | "completed" | "failed";

export interface VideoJobResult {
  status: VideoJobStatus;
  videoUrl?: string;
  error?: string;
}

/**
 * Submits a rendered video prompt to an AI video platform and polls for
 * the result. No real implementation exists yet — this is the shape future
 * Flow/Veo/Kling/Runway/Hailuo/Pika integrations will implement.
 */
export interface VideoGeneratorProvider extends ProviderInfo {
  submit(prompt: string, options?: Record<string, unknown>): Promise<{ jobId: string }>;
  pollStatus(jobId: string): Promise<VideoJobResult>;
}
