"use client";

import * as React from "react";
import { ChevronDownIcon, SettingsIcon } from "lucide-react";
import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  AI_VIDEO_PLATFORMS,
  ASPECT_RATIOS,
  CAMERA_STYLES,
  CTA_STYLES,
  HOOK_STYLES,
  VIDEO_DURATIONS,
  VIDEO_TONES,
  type AiVideoPlatform,
  type AspectRatio,
  type VideoSettings,
} from "@/types";

function SegmentGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="bg-secondary inline-flex w-fit flex-wrap gap-1 rounded-lg p-1">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={value === option}
          className={cn(
            "rounded-md px-3 py-1 text-sm font-medium transition-colors",
            value === option
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function PlatformMultiSelect({
  value,
  onChange,
}: {
  value: AiVideoPlatform[];
  onChange: (value: AiVideoPlatform[]) => void;
}) {
  const toggle = (platform: AiVideoPlatform) => {
    const isActive = value.includes(platform);
    if (isActive) {
      if (value.length === 1) {
        toast.error("Keep at least one platform selected.");
        return;
      }
      onChange(value.filter((p) => p !== platform));
    } else {
      onChange([...value, platform]);
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {AI_VIDEO_PLATFORMS.map((platform) => {
        const active = value.includes(platform);
        return (
          <button
            key={platform}
            type="button"
            onClick={() => toggle(platform)}
            aria-pressed={active}
            className={cn(
              "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
              active
                ? "border-accent bg-accent text-accent-foreground"
                : "border-input text-muted-foreground hover:text-foreground"
            )}
          >
            {platform}
          </button>
        );
      })}
    </div>
  );
}

export function VideoSettingsPanel({
  settings: videoSettings,
  onChange,
}: {
  settings: VideoSettings;
  onChange: (settings: VideoSettings) => void;
}) {
  const [open, setOpen] = React.useState(true);

  const setVideoSettings = React.useCallback(
    (patch: Partial<VideoSettings>) => {
      onChange({ ...videoSettings, ...patch });
    },
    [videoSettings, onChange]
  );

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 sm:pointer-events-none"
      >
        <div className="flex items-center gap-2">
          <SettingsIcon className="text-muted-foreground size-4" />
          <span className="text-sm font-medium">Video settings</span>
        </div>
        <ChevronDownIcon
          className={cn(
            "text-muted-foreground size-4 transition-transform sm:hidden",
            open && "rotate-180"
          )}
        />
      </button>

      <div className={cn("flex-col gap-4 sm:flex", open ? "flex" : "hidden")}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="settings-duration">Duration</Label>
            <div className="flex gap-2">
              <Select
                value={videoSettings.duration}
                onValueChange={(value) =>
                  setVideoSettings({ duration: value as VideoSettings["duration"] })
                }
              >
                <SelectTrigger id="settings-duration" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VIDEO_DURATIONS.map((duration) => (
                    <SelectItem key={duration} value={duration}>
                      {duration === "custom" ? "Custom" : duration}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {videoSettings.duration === "custom" && (
                <Input
                  type="number"
                  min={1}
                  className="w-20"
                  value={videoSettings.customDurationSeconds ?? 15}
                  onChange={(e) =>
                    setVideoSettings({ customDurationSeconds: Number(e.target.value) || 1 })
                  }
                  aria-label="Custom duration in seconds"
                />
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="settings-tone">Tone</Label>
            <Select
              value={videoSettings.tone}
              onValueChange={(value) => setVideoSettings({ tone: value as VideoSettings["tone"] })}
            >
              <SelectTrigger id="settings-tone" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VIDEO_TONES.map((tone) => (
                  <SelectItem key={tone} value={tone}>
                    {tone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="settings-camera">Camera style</Label>
            <Select
              value={videoSettings.cameraStyle}
              onValueChange={(value) => setVideoSettings({ cameraStyle: value })}
            >
              <SelectTrigger id="settings-camera" className="w-full">
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

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="settings-hook">Hook style</Label>
            <Select
              value={videoSettings.hookStyle}
              onValueChange={(value) =>
                setVideoSettings({ hookStyle: value as VideoSettings["hookStyle"] })
              }
            >
              <SelectTrigger id="settings-hook" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HOOK_STYLES.map((style) => (
                  <SelectItem key={style} value={style}>
                    {style}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="settings-cta">CTA style</Label>
            <Select
              value={videoSettings.ctaStyle}
              onValueChange={(value) =>
                setVideoSettings({ ctaStyle: value as VideoSettings["ctaStyle"] })
              }
            >
              <SelectTrigger id="settings-cta" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CTA_STYLES.map((style) => (
                  <SelectItem key={style} value={style}>
                    {style}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Aspect ratio</Label>
            <SegmentGroup
              options={ASPECT_RATIOS}
              value={videoSettings.aspectRatio}
              onChange={(value: AspectRatio) => setVideoSettings({ aspectRatio: value })}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>AI video platforms</Label>
          <p className="text-muted-foreground text-xs">
            Select every platform you want a prompt generated for.
          </p>
          <PlatformMultiSelect
            value={videoSettings.targetPlatforms}
            onChange={(targetPlatforms) => setVideoSettings({ targetPlatforms })}
          />
        </div>
      </div>
    </div>
  );
}
