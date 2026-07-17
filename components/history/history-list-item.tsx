"use client";

import { CopyIcon, MoreVerticalIcon, StarIcon, Trash2Icon } from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { GeneratedPromptSet } from "@/types";

export function HistoryListItem({
  entry,
  onOpen,
  onToggleFavorite,
  onDuplicate,
  onDelete,
}: {
  entry: GeneratedPromptSet;
  onOpen: () => void;
  onToggleFavorite: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const platforms = Object.keys(entry.outputs.videoPrompts);
  const date = new Date(entry.createdAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
    >
      <Card className="py-4">
        <CardContent className="flex items-start gap-3">
          <button
            type="button"
            onClick={onOpen}
            className="min-w-0 flex-1 text-left"
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">{entry.product.name || "Untitled product"}</p>
              <Badge variant="secondary">{entry.characterName}</Badge>
              {entry.templateName && <Badge variant="outline">{entry.templateName}</Badge>}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {platforms.map((platform) => (
                <Badge key={platform} variant="outline" className="text-[11px]">
                  {platform}
                </Badge>
              ))}
            </div>
            <p className="text-muted-foreground mt-1.5 text-xs">{date}</p>
          </button>

          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFavorite}
              aria-label={entry.favorite ? "Unfavorite" : "Favorite"}
            >
              <StarIcon
                className={cn(
                  "size-4",
                  entry.favorite && "fill-accent text-accent"
                )}
              />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`${entry.product.name || "entry"} actions`}
                >
                  <MoreVerticalIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onDuplicate}>
                  <CopyIcon /> Load into Generate
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={onDelete}>
                  <Trash2Icon /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
