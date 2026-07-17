import { describe, expect, it, beforeEach, vi } from "vitest";

import { readStorage, writeStorage } from "./safe-storage";
import { STORAGE_KEYS } from "./keys";

describe("safe-storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("round-trips data through write and read", () => {
    writeStorage(STORAGE_KEYS.characters, [{ id: "1" }]);
    expect(readStorage(STORAGE_KEYS.characters, [])).toEqual([{ id: "1" }]);
  });

  it("falls back to the default when nothing is stored", () => {
    expect(readStorage(STORAGE_KEYS.templates, "fallback")).toBe("fallback");
  });

  it("falls back to the default on corrupt JSON", () => {
    window.localStorage.setItem(STORAGE_KEYS.history, "{not json");
    expect(readStorage(STORAGE_KEYS.history, [])).toEqual([]);
  });

  it("runs the migration hook when the stored version differs", () => {
    window.localStorage.setItem(
      STORAGE_KEYS.settings,
      JSON.stringify({ version: 0, data: { old: true } })
    );
    const migrated = readStorage(
      STORAGE_KEYS.settings,
      {},
      (data) => ({ migratedFrom: data })
    );
    expect(migrated).toEqual({ migratedFrom: { old: true } });
  });

  it("reports a quota error without throwing", () => {
    const spy = vi
      .spyOn(window.localStorage, "setItem")
      .mockImplementation(() => {
        throw new DOMException("quota exceeded", "QuotaExceededError");
      });

    const result = writeStorage(STORAGE_KEYS.characters, [{ big: "data" }]);
    expect(result).toEqual({ ok: false, reason: "quota" });

    spy.mockRestore();
  });
});
