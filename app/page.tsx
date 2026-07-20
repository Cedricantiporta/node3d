"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileTextIcon,
  HistoryIcon,
  PlusIcon,
  SparklesIcon,
  StarIcon,
  UsersIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CopyButton } from "@/components/copy-button";
import { useAppSettings, useCharacters, useHistory, useTemplates } from "@/hooks";
import { formatAsText } from "@/lib/export";
import { initials } from "@/lib/utils";

const STAT_ITEMS = [
  { key: "characters", label: "Characters saved", icon: UsersIcon },
  { key: "generated", label: "Prompts generated", icon: SparklesIcon },
  { key: "favorites", label: "Favorites", icon: StarIcon },
  { key: "templates", label: "Templates", icon: FileTextIcon },
] as const;

export default function Home() {
  const { characters, hydrated: charactersHydrated } = useCharacters();
  const { history, hydrated: historyHydrated } = useHistory();
  const { templates, hydrated: templatesHydrated } = useTemplates();
  const { updateSettings } = useAppSettings();

  const hydrated = charactersHydrated && historyHydrated && templatesHydrated;

  const stats: Record<(typeof STAT_ITEMS)[number]["key"], number> = {
    characters: characters.length,
    generated: history.length,
    favorites: history.filter((entry) => entry.favorite).length,
    templates: templates.length,
  };

  const recentHistory = history.slice(0, 5);
  const quickCharacters = characters.slice(0, 6);

  if (!hydrated) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Your AI UGC Prompt Factory at a glance.
          </p>
        </div>
        <Button size="lg" asChild>
          <Link href="/generate">
            <SparklesIcon /> Generate Prompts
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_ITEMS.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
            >
              <Card className="py-5">
                <CardContent className="flex items-center gap-3">
                  <div className="bg-secondary text-secondary-foreground flex size-9 items-center justify-center rounded-xl">
                    <Icon className="size-4" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold leading-none">{stats[item.key]}</p>
                    <p className="text-muted-foreground mt-1 text-xs">{item.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
            <div>
              <CardTitle>Recent history</CardTitle>
              <CardDescription>Your last 5 generations.</CardDescription>
            </div>
            {history.length > 0 && (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/history">View all</Link>
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {recentHistory.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <div className="bg-secondary text-secondary-foreground flex size-10 items-center justify-center rounded-xl">
                  <HistoryIcon className="size-5" />
                </div>
                <p className="text-muted-foreground text-sm">
                  Nothing generated yet — your history will show up here.
                </p>
              </div>
            ) : (
              recentHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="border-border flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
                >
                  <Link href="/history" className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">{entry.product.name}</p>
                      {entry.favorite && (
                        <StarIcon className="fill-accent text-accent size-3.5 shrink-0" />
                      )}
                    </div>
                    <p className="text-muted-foreground truncate text-xs">
                      {entry.characterName} ·{" "}
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                  <CopyButton value={formatAsText(entry)} size="sm" variant="ghost" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
            <div>
              <CardTitle>Characters</CardTitle>
              <CardDescription>Jump straight into Generate.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/characters">Manage</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {quickCharacters.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <div className="bg-secondary text-secondary-foreground flex size-10 items-center justify-center rounded-xl">
                  <UsersIcon className="size-5" />
                </div>
                <p className="text-muted-foreground text-sm">
                  Create your first AI actor to get started.
                </p>
                <Button size="sm" asChild>
                  <Link href="/characters">
                    <PlusIcon /> New character
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {quickCharacters.map((character) => {
                  const frontImage = character.referenceImages.find(
                    (image) => image.slot === "front"
                  );
                  return (
                    <Link
                      key={character.id}
                      href="/generate"
                      onClick={() => updateSettings({ lastCharacterId: character.id })}
                      className="border-border hover:bg-secondary flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-colors"
                    >
                      <Avatar className="size-10">
                        <AvatarImage src={frontImage?.dataUrl} alt={character.name} />
                        <AvatarFallback>{initials(character.name) || "?"}</AvatarFallback>
                      </Avatar>
                      <span className="truncate text-xs font-medium">{character.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
