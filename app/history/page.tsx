"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { HistoryIcon, SearchIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppSettings, useCharacters, useHistory } from "@/hooks";
import { AI_VIDEO_PLATFORMS, type GeneratedPromptOutputs, type GeneratedPromptSet } from "@/types";
import { HistoryListItem } from "@/components/history/history-list-item";
import { HistoryDetailDialog } from "@/components/history/history-detail-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";

const PAGE_SIZE = 9;
const ALL_VALUE = "__all__";

function matchesSearch(entry: GeneratedPromptSet, query: string): boolean {
  if (!query) return true;
  const haystack = [
    entry.characterName,
    entry.product.name,
    entry.product.description,
    entry.outputs.hook,
    entry.outputs.cta,
    entry.outputs.caption,
    entry.outputs.ugcScript,
    ...Object.values(entry.outputs.videoPrompts),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

export default function HistoryPage() {
  const { history, hydrated, updateEntry, removeEntry, toggleFavorite, clearHistory } =
    useHistory();
  const { characters } = useCharacters();
  const { updateSettings } = useAppSettings();
  const router = useRouter();

  const [search, setSearch] = React.useState("");
  const [favoritesOnly, setFavoritesOnly] = React.useState(false);
  const [characterFilter, setCharacterFilter] = React.useState(ALL_VALUE);
  const [platformFilter, setPlatformFilter] = React.useState(ALL_VALUE);
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);

  const [openEntryId, setOpenEntryId] = React.useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = React.useState<string | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    return history.filter((entry) => {
      if (favoritesOnly && !entry.favorite) return false;
      if (characterFilter !== ALL_VALUE && entry.characterId !== characterFilter) return false;
      if (
        platformFilter !== ALL_VALUE &&
        !Object.keys(entry.outputs.videoPrompts).includes(platformFilter)
      ) {
        return false;
      }
      return matchesSearch(entry, search);
    });
  }, [history, favoritesOnly, characterFilter, platformFilter, search]);

  const filterKey = `${search}|${favoritesOnly}|${characterFilter}|${platformFilter}`;
  const [prevFilterKey, setPrevFilterKey] = React.useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(PAGE_SIZE);
  }

  const visible = filtered.slice(0, visibleCount);
  const openEntry = history.find((entry) => entry.id === openEntryId);
  const pendingEntry = history.find((entry) => entry.id === pendingDeleteId);

  const handleDuplicate = (entry: GeneratedPromptSet) => {
    updateSettings({
      lastCharacterId: entry.characterId,
      lastProduct: entry.product,
      lastVideoSettings: entry.settings,
      lastTemplateId: entry.templateId,
    });
    toast.success("Loaded into Generate.");
    router.push("/generate");
  };

  const handleSaveEdit = (id: string, outputs: GeneratedPromptOutputs) => {
    updateEntry(id, { outputs });
  };

  if (!hydrated) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Prompt History</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Every generation is saved automatically. Search, favorite, and reuse it.
          </p>
        </div>
        {history.length > 0 && (
          <Button variant="outline" onClick={() => setClearConfirmOpen(true)}>
            <Trash2Icon /> Clear history
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <div className="bg-secondary text-secondary-foreground mb-2 flex size-10 items-center justify-center rounded-xl">
              <HistoryIcon className="size-5" />
            </div>
            <CardTitle>Nothing generated yet</CardTitle>
            <CardDescription>
              Head to Generate to create your first set of prompts — it&apos;ll show up here
              automatically.
            </CardDescription>
          </CardHeader>
          <CardContent />
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative flex-1 sm:min-w-[220px]">
                <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products, characters, prompts..."
                  className="pl-9"
                />
              </div>

              <Select value={characterFilter} onValueChange={setCharacterFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All characters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>All characters</SelectItem>
                  {characters.map((character) => (
                    <SelectItem key={character.id} value={character.id}>
                      {character.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="All platforms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>All platforms</SelectItem>
                  {AI_VIDEO_PLATFORMS.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Switch
                  id="favorites-only"
                  checked={favoritesOnly}
                  onCheckedChange={setFavoritesOnly}
                />
                <Label htmlFor="favorites-only" className="text-sm font-normal">
                  Favorites only
                </Label>
              </div>
            </CardContent>
          </Card>

          {filtered.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No history entries match your filters.
            </p>
          ) : (
            <>
              <div className="flex flex-col gap-3">
                <AnimatePresence mode="popLayout">
                  {visible.map((entry) => (
                    <HistoryListItem
                      key={entry.id}
                      entry={entry}
                      onOpen={() => setOpenEntryId(entry.id)}
                      onToggleFavorite={() => toggleFavorite(entry.id)}
                      onDuplicate={() => handleDuplicate(entry)}
                      onDelete={() => setPendingDeleteId(entry.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {visibleCount < filtered.length && (
                <Button
                  variant="outline"
                  className="mx-auto"
                  onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                >
                  Load more
                </Button>
              )}
            </>
          )}
        </>
      )}

      <HistoryDetailDialog
        entry={openEntry}
        open={openEntryId !== null}
        onOpenChange={(open) => !open && setOpenEntryId(null)}
        onSave={handleSaveEdit}
      />

      <ConfirmDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
        title="Delete this entry?"
        description={
          pendingEntry
            ? `The generation for "${pendingEntry.product.name}" will be permanently removed.`
            : ""
        }
        onConfirm={() => {
          if (pendingDeleteId) {
            removeEntry(pendingDeleteId);
            toast.success("Entry deleted.");
          }
        }}
      />

      <ConfirmDialog
        open={clearConfirmOpen}
        onOpenChange={setClearConfirmOpen}
        title="Clear all history?"
        description="Every saved generation will be permanently removed. This can't be undone."
        confirmLabel="Clear history"
        onConfirm={() => {
          clearHistory();
          toast.success("History cleared.");
        }}
      />
    </div>
  );
}
