"use client";

import { MoreVerticalIcon, PencilIcon, CopyIcon, Trash2Icon } from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Character } from "@/types";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function CharacterCard({
  character,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  character: Character;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const frontImage = character.referenceImages.find((image) => image.slot === "front");
  const descriptor = [character.age && `${character.age}`, character.ethnicity]
    .filter(Boolean)
    .join(" · ");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
    >
      <Card className="h-full py-5">
        <CardContent className="flex items-start gap-3">
          <Avatar className="size-12">
            <AvatarImage src={frontImage?.dataUrl} alt={character.name} />
            <AvatarFallback>{initials(character.name) || "?"}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{character.name}</p>
            {descriptor && (
              <p className="text-muted-foreground truncate text-xs">{descriptor}</p>
            )}
            {character.personality && (
              <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                {character.personality}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="-mt-1 -mr-1 shrink-0"
                aria-label={`${character.name} actions`}
              >
                <MoreVerticalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <PencilIcon /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <CopyIcon /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={onDelete}>
                <Trash2Icon /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>
    </motion.div>
  );
}
