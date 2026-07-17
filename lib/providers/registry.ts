import type { PromptEnhancerProvider, VideoGeneratorProvider } from "./types";

class ProviderRegistry<T extends { id: string }> {
  private providers = new Map<string, T>();

  register(provider: T): void {
    this.providers.set(provider.id, provider);
  }

  get(id: string): T | undefined {
    return this.providers.get(id);
  }

  list(): T[] {
    return Array.from(this.providers.values());
  }
}

export const enhancerProviders = new ProviderRegistry<PromptEnhancerProvider>();
export const videoGeneratorProviders = new ProviderRegistry<VideoGeneratorProvider>();

export const DEFAULT_ENHANCER_PROVIDER_ID = "local-rule";

export function getActiveEnhancerProvider(): PromptEnhancerProvider {
  const provider = enhancerProviders.get(DEFAULT_ENHANCER_PROVIDER_ID);
  if (!provider) {
    throw new Error("No default prompt enhancer provider is registered.");
  }
  return provider;
}
