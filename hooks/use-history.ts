"use client";

import * as React from "react";
import { toast } from "sonner";

import { STORAGE_KEYS } from "@/lib/storage";
import { generateId } from "@/lib/id";
import type { GeneratedPromptSet, GeneratedPromptSetInput } from "@/types";
import { useLocalStore } from "./use-local-store";

const MAX_HISTORY_ENTRIES = 300;

function nowIso() {
  return new Date().toISOString();
}

export function useHistory() {
  const [history, setHistory, { hydrated }] = useLocalStore<GeneratedPromptSet[]>(
    STORAGE_KEYS.history,
    []
  );

  const persist = React.useCallback(
    (next: GeneratedPromptSet[]) => {
      let result = setHistory(next);

      if (!result.ok && result.reason === "quota") {
        const trimmed = next.slice(0, Math.max(1, Math.floor(next.length / 2)));
        result = setHistory(trimmed);

        if (result.ok) {
          toast.warning("Storage is full", {
            description: "Older history entries were removed to save this generation.",
          });
        } else {
          toast.error("Couldn't save to history — local storage is full.");
        }
      }

      return result;
    },
    [setHistory]
  );

  const addEntry = React.useCallback(
    (input: GeneratedPromptSetInput) => {
      const entry: GeneratedPromptSet = {
        ...input,
        id: generateId(),
        favorite: false,
        createdAt: nowIso(),
      };
      persist([entry, ...history].slice(0, MAX_HISTORY_ENTRIES));
      return entry;
    },
    [history, persist]
  );

  const updateEntry = React.useCallback(
    (id: string, patch: Partial<GeneratedPromptSet>) => {
      persist(
        history.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry))
      );
    },
    [history, persist]
  );

  const removeEntry = React.useCallback(
    (id: string) => {
      persist(history.filter((entry) => entry.id !== id));
    },
    [history, persist]
  );

  const toggleFavorite = React.useCallback(
    (id: string) => {
      persist(
        history.map((entry) =>
          entry.id === id ? { ...entry, favorite: !entry.favorite } : entry
        )
      );
    },
    [history, persist]
  );

  const clearHistory = React.useCallback(() => {
    persist([]);
  }, [persist]);

  const getEntry = React.useCallback(
    (id: string) => history.find((entry) => entry.id === id),
    [history]
  );

  return {
    history,
    hydrated,
    addEntry,
    updateEntry,
    removeEntry,
    toggleFavorite,
    clearHistory,
    getEntry,
  };
}
