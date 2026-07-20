"use client";

import * as React from "react";
import { toast } from "sonner";

import { STORAGE_KEYS } from "@/lib/storage";
import { generateId } from "@/lib/id";
import type { Character, CharacterInput } from "@/types";
import { useLocalStore } from "./use-local-store";

function nowIso() {
  return new Date().toISOString();
}

export function useCharacters() {
  const [characters, setCharacters, { hydrated }] = useLocalStore<Character[]>(
    STORAGE_KEYS.characters,
    []
  );

  const persist = React.useCallback(
    (next: Character[]) => {
      let result = setCharacters(next);

      if (!result.ok && result.reason === "quota") {
        const stripped = next.map((character) => ({
          ...character,
          referenceImages: [],
        }));
        result = setCharacters(stripped);

        if (result.ok) {
          toast.warning("Storage is full", {
            description:
              "Reference images were removed to save your changes. Try smaller images or fewer characters.",
          });
        } else {
          toast.error("Couldn't save — local storage is full.");
        }
      }

      return result;
    },
    [setCharacters]
  );

  const addCharacter = React.useCallback(
    (input: CharacterInput) => {
      const character: Character = {
        ...input,
        id: generateId(),
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      persist([character, ...characters]);
      return character;
    },
    [characters, persist]
  );

  const updateCharacter = React.useCallback(
    (id: string, patch: Partial<CharacterInput>) => {
      persist(
        characters.map((character) =>
          character.id === id
            ? { ...character, ...patch, updatedAt: nowIso() }
            : character
        )
      );
    },
    [characters, persist]
  );

  const removeCharacter = React.useCallback(
    (id: string) => {
      persist(characters.filter((character) => character.id !== id));
    },
    [characters, persist]
  );

  const duplicateCharacter = React.useCallback(
    (id: string) => {
      const source = characters.find((character) => character.id === id);
      if (!source) return undefined;

      const copy: Character = {
        ...source,
        id: generateId(),
        name: `${source.name} (Copy)`,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      persist([copy, ...characters]);
      return copy;
    },
    [characters, persist]
  );

  const getCharacter = React.useCallback(
    (id: string) => characters.find((character) => character.id === id),
    [characters]
  );

  return {
    characters,
    hydrated,
    addCharacter,
    updateCharacter,
    removeCharacter,
    duplicateCharacter,
    getCharacter,
  };
}
