"use client";

import * as React from "react";

import { STORAGE_KEYS } from "@/lib/storage";
import type { Product, VideoSettings } from "@/types";
import { useLocalStore } from "./use-local-store";

export interface AppSettings {
  lastProduct: Product | null;
  lastVideoSettings: VideoSettings | null;
  lastTemplateId: string | null;
  optimizerEnabled: boolean;
  /** Keyed by provider id (e.g. "claude", "openai"); populated once real providers are wired up. */
  providerApiKeys: Record<string, string>;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  lastProduct: null,
  lastVideoSettings: null,
  lastTemplateId: null,
  optimizerEnabled: true,
  providerApiKeys: {},
};

export function useAppSettings() {
  const [settings, setSettings, { hydrated }] = useLocalStore<AppSettings>(
    STORAGE_KEYS.settings,
    DEFAULT_APP_SETTINGS
  );

  const updateSettings = React.useCallback(
    (patch: Partial<AppSettings>) => {
      setSettings((prev) => ({ ...prev, ...patch }));
    },
    [setSettings]
  );

  return { settings, hydrated, updateSettings };
}
