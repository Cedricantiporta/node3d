"use client";

import * as React from "react";
import { AnimatePresence } from "framer-motion";
import { PlusIcon, UsersIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCharacters } from "@/hooks";
import type { Character, CharacterInput } from "@/types";
import { CharacterCard } from "@/components/characters/character-card";
import { CharacterFormDialog } from "@/components/characters/character-form-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";

export default function CharactersPage() {
  const { characters, hydrated, addCharacter, updateCharacter, removeCharacter, duplicateCharacter } =
    useCharacters();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Character | undefined>(undefined);
  const [pendingDeleteId, setPendingDeleteId] = React.useState<string | null>(null);

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const openEdit = (character: Character) => {
    setEditing(character);
    setFormOpen(true);
  };

  const handleSubmit = (input: CharacterInput) => {
    if (editing) {
      updateCharacter(editing.id, input);
      toast.success(`${input.name} updated.`);
    } else {
      addCharacter(input);
      toast.success(`${input.name} saved to your character library.`);
    }
  };

  const handleDuplicate = (character: Character) => {
    const copy = duplicateCharacter(character.id);
    if (copy) toast.success(`Duplicated as "${copy.name}".`);
  };

  const pendingCharacter = characters.find((c) => c.id === pendingDeleteId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Character Library</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Save reusable AI actors so you never rewrite a character description again.
          </p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon /> New character
        </Button>
      </div>

      {hydrated && characters.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <div className="bg-secondary text-secondary-foreground mb-2 flex size-10 items-center justify-center rounded-xl">
              <UsersIcon className="size-5" />
            </div>
            <CardTitle>Create your first AI actor</CardTitle>
            <CardDescription>
              Give them a name, appearance, voice, and vibe once — every generated prompt will
              reuse them automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={openCreate}>
              <PlusIcon /> New character
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {characters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onEdit={() => openEdit(character)}
                onDuplicate={() => handleDuplicate(character)}
                onDelete={() => setPendingDeleteId(character.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <CharacterFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        character={editing}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
        title="Delete character?"
        description={
          pendingCharacter
            ? `"${pendingCharacter.name}" will be permanently removed from your library. This won't affect prompts you've already generated.`
            : ""
        }
        onConfirm={() => {
          if (pendingDeleteId) {
            removeCharacter(pendingDeleteId);
            toast.success("Character deleted.");
          }
        }}
      />
    </div>
  );
}
