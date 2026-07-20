export const STORAGE_VERSION = 1;

export const STORAGE_KEYS = {
  characters: "ugc.characters",
  templates: "ugc.templates",
  history: "ugc.history",
  settings: "ugc.settings",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
