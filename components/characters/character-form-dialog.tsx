"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ReferenceImageUploader } from "./reference-image-uploader";
import { CAMERA_STYLES, type Character, type CharacterInput } from "@/types";

const EMPTY_INPUT: CharacterInput = {
  name: "",
  referenceImages: [],
  appearanceDescription: "",
  age: "",
  ethnicity: "",
  clothing: "",
  hairstyle: "",
  skinTone: "",
  voice: "",
  personality: "",
  cameraStyle: CAMERA_STYLES[0],
  roomBackground: "",
  lighting: "",
  negativePrompts: "",
  notes: "",
};

function Field({
  id,
  label,
  children,
  hint,
}: {
  id: string;
  label: string;
  children: React.ReactElement<{ id?: string }>;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {React.cloneElement(children, { id })}
      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold">{children}</h3>;
}

export function CharacterFormDialog({
  open,
  onOpenChange,
  character,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character?: Character;
  onSubmit: (input: CharacterInput) => void;
}) {
  const [form, setForm] = React.useState<CharacterInput>(character ?? EMPTY_INPUT);
  const [prevOpen, setPrevOpen] = React.useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setForm(character ?? EMPTY_INPUT);
    }
  }

  const set = <K extends keyof CharacterInput>(key: K, value: CharacterInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    onSubmit(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{character ? "Edit character" : "New character"}</DialogTitle>
          <DialogDescription>
            Save this actor once — every prompt you generate will reuse it automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <SectionTitle>Reference images</SectionTitle>
            <ReferenceImageUploader
              images={form.referenceImages}
              onChange={(images) => set("referenceImages", images)}
            />
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <SectionTitle>Identity</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field id="character-name" label="Name">
                <Input
                  required
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Mia Chen"
                />
              </Field>
              <Field id="character-age" label="Age">
                <Input
                  value={form.age}
                  onChange={(e) => set("age", e.target.value)}
                  placeholder="27"
                />
              </Field>
              <Field id="character-ethnicity" label="Ethnicity">
                <Input
                  value={form.ethnicity}
                  onChange={(e) => set("ethnicity", e.target.value)}
                  placeholder="Asian-American"
                />
              </Field>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <SectionTitle>Appearance</SectionTitle>
            <Field id="character-appearance" label="Full appearance description">
              <Textarea
                value={form.appearanceDescription}
                onChange={(e) => set("appearanceDescription", e.target.value)}
                placeholder="Bright smile, athletic build, warm expressive eyes..."
                rows={3}
              />
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field id="character-skin-tone" label="Skin tone">
                <Input
                  value={form.skinTone}
                  onChange={(e) => set("skinTone", e.target.value)}
                  placeholder="Warm olive"
                />
              </Field>
              <Field id="character-hairstyle" label="Hairstyle">
                <Input
                  value={form.hairstyle}
                  onChange={(e) => set("hairstyle", e.target.value)}
                  placeholder="Shoulder-length wavy black hair"
                />
              </Field>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <SectionTitle>Wardrobe</SectionTitle>
            <Field id="character-clothing" label="Clothing">
              <Textarea
                value={form.clothing}
                onChange={(e) => set("clothing", e.target.value)}
                placeholder="Casual streetwear, oversized hoodie"
                rows={2}
              />
            </Field>
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <SectionTitle>Voice &amp; personality</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field id="character-voice" label="Voice">
                <Textarea
                  value={form.voice}
                  onChange={(e) => set("voice", e.target.value)}
                  placeholder="Upbeat, friendly, slightly raspy"
                  rows={2}
                />
              </Field>
              <Field id="character-personality" label="Personality">
                <Textarea
                  value={form.personality}
                  onChange={(e) => set("personality", e.target.value)}
                  placeholder="Bubbly, energetic, relatable"
                  rows={2}
                />
              </Field>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <SectionTitle>Scene defaults</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="character-camera-style">Camera style</Label>
                <Select
                  value={form.cameraStyle}
                  onValueChange={(value) => set("cameraStyle", value)}
                >
                  <SelectTrigger id="character-camera-style" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CAMERA_STYLES.map((style) => (
                      <SelectItem key={style} value={style}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Field id="character-room-background" label="Room / background">
                <Input
                  value={form.roomBackground}
                  onChange={(e) => set("roomBackground", e.target.value)}
                  placeholder="Cozy bedroom with fairy lights"
                />
              </Field>
            </div>
            <Field id="character-lighting" label="Lighting">
              <Input
                value={form.lighting}
                onChange={(e) => set("lighting", e.target.value)}
                placeholder="Warm ring light"
              />
            </Field>
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <SectionTitle>Negative prompts</SectionTitle>
            <Field
              id="character-negative-prompts"
              label="Always avoid"
              hint="Merged into every generated negative prompt."
            >
              <Textarea
                value={form.negativePrompts}
                onChange={(e) => set("negativePrompts", e.target.value)}
                placeholder="No sunglasses, no hats"
                rows={2}
              />
            </Field>
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <SectionTitle>Additional notes</SectionTitle>
            <Label htmlFor="character-notes" className="sr-only">
              Additional notes
            </Label>
            <Textarea
              id="character-notes"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Anything else worth remembering about this character..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!form.name.trim()}>
              {character ? "Save changes" : "Create character"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
