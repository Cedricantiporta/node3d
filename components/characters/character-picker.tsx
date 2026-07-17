"use client";

import Link from "next/link";
import { UsersIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/utils";
import type { Character } from "@/types";

export function CharacterPicker({
  characters,
  value,
  onChange,
}: {
  characters: Character[];
  value: string | undefined;
  onChange: (id: string) => void;
}) {
  if (characters.length === 0) {
    return (
      <div className="border-input flex items-center justify-between gap-3 rounded-lg border border-dashed px-3 py-2.5">
        <div className="flex items-center gap-2 text-sm">
          <UsersIcon className="text-muted-foreground size-4" />
          <span className="text-muted-foreground">No characters saved yet</span>
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link href="/characters">Create one</Link>
        </Button>
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a character" />
      </SelectTrigger>
      <SelectContent>
        {characters.map((character) => {
          const frontImage = character.referenceImages.find((image) => image.slot === "front");
          return (
            <SelectItem key={character.id} value={character.id}>
              <Avatar className="size-5">
                <AvatarImage src={frontImage?.dataUrl} alt={character.name} />
                <AvatarFallback className="text-[10px]">
                  {initials(character.name) || "?"}
                </AvatarFallback>
              </Avatar>
              {character.name}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
