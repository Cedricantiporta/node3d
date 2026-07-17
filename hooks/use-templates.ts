"use client";

import * as React from "react";
import { toast } from "sonner";

import { STORAGE_KEYS } from "@/lib/storage";
import { generateId } from "@/lib/id";
import type { PromptTemplate, PromptTemplateInput } from "@/types";
import { useLocalStore } from "./use-local-store";

function nowIso() {
  return new Date().toISOString();
}

export function useTemplates() {
  const [templates, setTemplates, { hydrated }] = useLocalStore<PromptTemplate[]>(
    STORAGE_KEYS.templates,
    []
  );

  const persist = React.useCallback(
    (next: PromptTemplate[]) => {
      const result = setTemplates(next);
      if (!result.ok) {
        toast.error("Couldn't save template — local storage is full.");
      }
      return result;
    },
    [setTemplates]
  );

  /** Inserts built-in templates only on first run (when no templates exist yet). */
  const seedBuiltIns = React.useCallback(
    (builtIns: PromptTemplateInput[]) => {
      if (templates.length > 0) return;

      const seeded: PromptTemplate[] = builtIns.map((input) => ({
        ...input,
        id: generateId(),
        isBuiltIn: true,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      }));
      persist(seeded);
    },
    [templates, persist]
  );

  const addTemplate = React.useCallback(
    (input: PromptTemplateInput) => {
      const template: PromptTemplate = {
        ...input,
        id: generateId(),
        isBuiltIn: false,
        editable: true,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      persist([template, ...templates]);
      return template;
    },
    [templates, persist]
  );

  const updateTemplate = React.useCallback(
    (id: string, patch: Partial<PromptTemplateInput>) => {
      persist(
        templates.map((template) =>
          template.id === id
            ? { ...template, ...patch, updatedAt: nowIso() }
            : template
        )
      );
    },
    [templates, persist]
  );

  const removeTemplate = React.useCallback(
    (id: string) => {
      persist(templates.filter((template) => template.id !== id));
    },
    [templates, persist]
  );

  const duplicateTemplate = React.useCallback(
    (id: string) => {
      const source = templates.find((template) => template.id === id);
      if (!source) return undefined;

      const copy: PromptTemplate = {
        ...source,
        id: generateId(),
        name: `${source.name} (Copy)`,
        isBuiltIn: false,
        editable: true,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      persist([copy, ...templates]);
      return copy;
    },
    [templates, persist]
  );

  const getTemplate = React.useCallback(
    (id: string) => templates.find((template) => template.id === id),
    [templates]
  );

  return {
    templates,
    hydrated,
    seedBuiltIns,
    addTemplate,
    updateTemplate,
    removeTemplate,
    duplicateTemplate,
    getTemplate,
  };
}
