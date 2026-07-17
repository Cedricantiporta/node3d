"use client";

import * as React from "react";
import { SparklesIcon } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ProductForm } from "@/components/product/product-form";
import { VideoSettingsPanel } from "@/components/video-settings/video-settings-panel";
import { CharacterPicker } from "@/components/characters/character-picker";
import { TemplatePicker } from "@/components/generate/template-picker";
import { GenerationResults } from "@/components/generate/generation-results";
import { useAppSettings, useCharacters, useHistory, useTemplates } from "@/hooks";
import { generatePromptSet, optimizePromptSet } from "@/lib/engine";
import { EMPTY_PRODUCT, DEFAULT_VIDEO_SETTINGS, type GeneratedPromptSet } from "@/types";

export default function GeneratePage() {
  const { settings, updateSettings, hydrated } = useAppSettings();
  const { characters } = useCharacters();
  const { templates } = useTemplates();
  const { addEntry } = useHistory();

  const [result, setResult] = React.useState<GeneratedPromptSet | null>(null);
  const [generating, setGenerating] = React.useState(false);

  const product = settings.lastProduct ?? EMPTY_PRODUCT;
  const videoSettings = settings.lastVideoSettings ?? DEFAULT_VIDEO_SETTINGS;

  const selectedCharacter = characters.find((c) => c.id === settings.lastCharacterId);
  const selectedTemplate = templates.find((t) => t.id === settings.lastTemplateId);

  const handleGenerate = () => {
    if (!selectedCharacter) {
      toast.error("Select a character first.");
      return;
    }
    if (!product.name.trim()) {
      toast.error("Give the product a name first.");
      return;
    }

    setGenerating(true);

    const generated = generatePromptSet({
      character: selectedCharacter,
      product,
      settings: videoSettings,
      template: selectedTemplate,
    });
    const optimized = optimizePromptSet(generated, { enabled: settings.optimizerEnabled });
    const saved = addEntry(optimized);

    setResult(saved);
    toast.success("Prompts generated and saved to history.");

    window.setTimeout(() => setGenerating(false), 400);
  };

  if (!hydrated) return null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Generate</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Pick a character, describe the product, and generate every prompt you need in one
          click.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Character</CardTitle>
          <CardDescription>Every prompt automatically embeds this actor.</CardDescription>
        </CardHeader>
        <CardContent>
          <CharacterPicker
            characters={characters}
            value={settings.lastCharacterId ?? undefined}
            onChange={(id) => updateSettings({ lastCharacterId: id })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product</CardTitle>
          <CardDescription>
            Tell us about what you&apos;re promoting. Paste a URL to auto-fill what we can.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm
            product={product}
            onChange={(next) => updateSettings({ lastProduct: next })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Video settings</CardTitle>
          <CardDescription>Shape how each generated prompt reads.</CardDescription>
        </CardHeader>
        <CardContent>
          <VideoSettingsPanel
            settings={videoSettings}
            onChange={(next) => updateSettings({ lastVideoSettings: next })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Template</CardTitle>
          <CardDescription>Optional. Drives the on-screen scenario and action.</CardDescription>
        </CardHeader>
        <CardContent>
          <TemplatePicker
            templates={templates}
            value={settings.lastTemplateId}
            onChange={(id) => updateSettings({ lastTemplateId: id })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-5">
          <div className="flex items-center gap-3">
            <Switch
              id="optimizer-toggle"
              checked={settings.optimizerEnabled}
              onCheckedChange={(checked) => updateSettings({ optimizerEnabled: checked })}
            />
            <div>
              <Label htmlFor="optimizer-toggle">AI prompt optimization</Label>
              <p className="text-muted-foreground text-xs">
                Boosts realism, cinematic quality, and artifact prevention automatically.
              </p>
            </div>
          </div>
          <Button size="lg" onClick={handleGenerate} disabled={generating}>
            <SparklesIcon /> Generate All Prompts
          </Button>
        </CardContent>
      </Card>

      {result && <GenerationResults result={result} />}
    </div>
  );
}
