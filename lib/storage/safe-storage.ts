import { STORAGE_VERSION, type StorageKey } from "./keys";

interface StorageEnvelope<T> {
  version: number;
  data: T;
}

export type WriteResult = { ok: true } | { ok: false; reason: "quota" | "unavailable" | "unknown" };

/** Migrates an old envelope's data to the current STORAGE_VERSION shape. Identity by default. */
export type Migration<T> = (data: unknown, fromVersion: number) => T;

const isBrowser = () => typeof window !== "undefined";

function isQuotaExceededError(error: unknown): boolean {
  if (typeof DOMException !== "undefined" && error instanceof DOMException) {
    return (
      error.name === "QuotaExceededError" ||
      error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
      error.code === 22
    );
  }
  return false;
}

export function readStorage<T>(
  key: StorageKey,
  fallback: T,
  migrate?: Migration<T>
): T {
  if (!isBrowser()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as StorageEnvelope<unknown>;
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("data" in parsed) ||
      !("version" in parsed)
    ) {
      return fallback;
    }

    if (parsed.version !== STORAGE_VERSION && migrate) {
      return migrate(parsed.data, parsed.version);
    }

    return parsed.data as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: StorageKey, data: T): WriteResult {
  if (!isBrowser()) return { ok: false, reason: "unavailable" };

  const envelope: StorageEnvelope<T> = { version: STORAGE_VERSION, data };

  try {
    window.localStorage.setItem(key, JSON.stringify(envelope));
    return { ok: true };
  } catch (error) {
    if (isQuotaExceededError(error)) {
      return { ok: false, reason: "quota" };
    }
    return { ok: false, reason: "unknown" };
  }
}

export function removeStorage(key: StorageKey): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
