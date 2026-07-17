import type { VideoGeneratorProvider } from "../types";

/**
 * TODO: Replace with a real implementation per platform.
 *
 * Intended shape once implemented:
 * 1. `submit(prompt, options)` POSTs the rendered video prompt (from
 *    GeneratedPromptOutputs.videoPrompts[platform]) to the platform's
 *    generation endpoint through a server-side route handler — never call
 *    a video API directly from the client, both for CORS and to keep API
 *    keys server-only (see app/api/extract-product/route.ts for the
 *    pattern). Returns a `{ jobId }` the platform gives back immediately.
 * 2. `pollStatus(jobId)` checks the platform's job-status endpoint and maps
 *    its response onto VideoJobStatus ("pending" | "processing" |
 *    "completed" | "failed"), returning a `videoUrl` once completed.
 * 3. The API key lives in useAppSettings().settings.providerApiKeys[id],
 *    configured from the Settings page.
 *
 * Until a platform's real provider is registered, calling submit/pollStatus
 * rejects and the UI shows it as "Coming soon".
 */
export function createStubVideoProvider(
  id: string,
  name: string,
  description: string
): VideoGeneratorProvider {
  return {
    id,
    name,
    description,
    available: false,
    requiresApiKey: true,
    async submit() {
      throw new Error(`The ${name} video provider isn't implemented yet.`);
    },
    async pollStatus() {
      throw new Error(`The ${name} video provider isn't implemented yet.`);
    },
  };
}
