"use client";

import * as React from "react";
import { PencilIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/copy-button";
import { ExportMenu } from "@/components/export-menu";
import { formatAsText } from "@/lib/export";
import type { AiVideoPlatform, GeneratedPromptOutputs, GeneratedPromptSet } from "@/types";

function EditableField({
  title,
  value,
  editing,
  onChange,
}: {
  title: string;
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <Card className="py-4">
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-sm">{title}</CardTitle>
        {!editing && <CopyButton value={value} size="sm" variant="ghost" />}
      </CardHeader>
      <CardContent>
        {editing ? (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            className="text-sm"
          />
        ) : (
          <p className="text-muted-foreground text-sm whitespace-pre-wrap">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function HistoryDetailDialog({
  entry,
  open,
  onOpenChange,
  onSave,
}: {
  entry: GeneratedPromptSet | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, outputs: GeneratedPromptOutputs) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState<GeneratedPromptOutputs | undefined>(entry?.outputs);
  const [prevEntryId, setPrevEntryId] = React.useState(entry?.id);

  if (entry?.id !== prevEntryId) {
    setPrevEntryId(entry?.id);
    setDraft(entry?.outputs);
    setEditing(false);
  }

  if (!entry || !draft) return null;

  const patchOutputs = (patch: Partial<GeneratedPromptOutputs>) => {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const patchVideoPrompt = (platform: AiVideoPlatform, value: string) => {
    setDraft((prev) =>
      prev ? { ...prev, videoPrompts: { ...prev.videoPrompts, [platform]: value } } : prev
    );
  };

  const handleSave = () => {
    onSave(entry.id, draft);
    setEditing(false);
    toast.success("Changes saved.");
  };

  const handleCancel = () => {
    setDraft(entry.outputs);
    setEditing(false);
  };

  const previewSet: GeneratedPromptSet = { ...entry, outputs: draft };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex flex-col gap-3 pr-6 sm:flex-row sm:items-start sm:justify-between sm:gap-2 sm:pr-0">
            <div>
              <DialogTitle>{entry.product.name}</DialogTitle>
              <DialogDescription>
                {entry.characterName}
                {entry.templateName ? ` · ${entry.templateName}` : ""}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {editing ? (
                <>
                  <Button type="button" size="sm" variant="outline" onClick={handleCancel}>
                    <XIcon /> Cancel
                  </Button>
                  <Button type="button" size="sm" onClick={handleSave}>
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <ExportMenu result={previewSet} />
                  <Button type="button" size="sm" variant="outline" onClick={() => setEditing(true)}>
                    <PencilIcon /> Edit
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <CopyButton value={formatAsText(previewSet)} label="Copy all" copiedLabel="Copied all" />
        </div>

        <Tabs defaultValue="video">
          <div className="-mx-6 overflow-x-auto px-6">
            <TabsList>
              <TabsTrigger value="video">Video Prompts</TabsTrigger>
              <TabsTrigger value="visuals">Visuals</TabsTrigger>
              <TabsTrigger value="direction">Direction</TabsTrigger>
              <TabsTrigger value="script">Script &amp; Copy</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="video" className="flex flex-col gap-3 pt-3">
            {Object.entries(draft.videoPrompts).map(([platform, prompt]) => (
              <EditableField
                key={platform}
                title={`${platform} prompt`}
                value={prompt ?? ""}
                editing={editing}
                onChange={(value) => patchVideoPrompt(platform as AiVideoPlatform, value)}
              />
            ))}
          </TabsContent>

          <TabsContent value="visuals" className="flex flex-col gap-3 pt-3">
            <EditableField
              title="Image prompt"
              value={draft.imagePrompt}
              editing={editing}
              onChange={(value) => patchOutputs({ imagePrompt: value })}
            />
            <EditableField
              title="Thumbnail prompt"
              value={draft.thumbnailPrompt}
              editing={editing}
              onChange={(value) => patchOutputs({ thumbnailPrompt: value })}
            />
            <EditableField
              title="B-roll prompt"
              value={draft.brollPrompt}
              editing={editing}
              onChange={(value) => patchOutputs({ brollPrompt: value })}
            />
          </TabsContent>

          <TabsContent value="direction" className="flex flex-col gap-3 pt-3">
            <EditableField
              title="Camera directions"
              value={draft.cameraDirections}
              editing={editing}
              onChange={(value) => patchOutputs({ cameraDirections: value })}
            />
            <EditableField
              title="Lighting directions"
              value={draft.lightingDirections}
              editing={editing}
              onChange={(value) => patchOutputs({ lightingDirections: value })}
            />
            <EditableField
              title="Negative prompt"
              value={draft.negativePrompt}
              editing={editing}
              onChange={(value) => patchOutputs({ negativePrompt: value })}
            />
          </TabsContent>

          <TabsContent value="script" className="flex flex-col gap-3 pt-3">
            <EditableField
              title="Full UGC script"
              value={draft.ugcScript}
              editing={editing}
              onChange={(value) => patchOutputs({ ugcScript: value })}
            />
            <EditableField
              title="Hook"
              value={draft.hook}
              editing={editing}
              onChange={(value) => patchOutputs({ hook: value })}
            />
            <EditableField
              title="CTA"
              value={draft.cta}
              editing={editing}
              onChange={(value) => patchOutputs({ cta: value })}
            />
            <EditableField
              title="Caption"
              value={draft.caption}
              editing={editing}
              onChange={(value) => patchOutputs({ caption: value })}
            />
            {editing ? (
              <EditableField
                title="Hashtags"
                value={draft.hashtags.join(" ")}
                editing={editing}
                onChange={(value) =>
                  patchOutputs({ hashtags: value.split(/\s+/).filter(Boolean) })
                }
              />
            ) : (
              <Card className="py-4">
                <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
                  <CardTitle className="text-sm">Hashtags</CardTitle>
                  <CopyButton value={draft.hashtags.join(" ")} size="sm" variant="ghost" />
                </CardHeader>
                <CardContent className="flex flex-wrap gap-1.5">
                  {draft.hashtags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
