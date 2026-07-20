"use client";

import * as React from "react";
import { ImagePlusIcon, Loader2Icon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { REFERENCE_IMAGE_SLOTS, type ReferenceImage, type ReferenceImageSlot } from "@/types";
import { compressImageToDataUrl } from "@/lib/storage/image";
import { cn } from "@/lib/utils";

const SLOT_LABELS: Record<ReferenceImageSlot, string> = {
  front: "Front",
  side: "Side",
  back: "Back",
  smiling: "Smiling",
  neutral: "Neutral",
};

export function ReferenceImageUploader({
  images,
  onChange,
}: {
  images: ReferenceImage[];
  onChange: (images: ReferenceImage[]) => void;
}) {
  const [loadingSlot, setLoadingSlot] = React.useState<ReferenceImageSlot | null>(null);
  const inputRefs = React.useRef<Partial<Record<ReferenceImageSlot, HTMLInputElement | null>>>({});

  const handleFile = async (slot: ReferenceImageSlot, file: File | undefined) => {
    if (!file) return;
    setLoadingSlot(slot);
    try {
      const dataUrl = await compressImageToDataUrl(file);
      const next = images.filter((image) => image.slot !== slot);
      next.push({ slot, dataUrl });
      onChange(next);
    } catch {
      toast.error(`Couldn't process the ${SLOT_LABELS[slot]} image.`);
    } finally {
      setLoadingSlot(null);
    }
  };

  const removeSlot = (slot: ReferenceImageSlot) => {
    onChange(images.filter((image) => image.slot !== slot));
  };

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
      {REFERENCE_IMAGE_SLOTS.map((slot) => {
        const image = images.find((item) => item.slot === slot);
        const isLoading = loadingSlot === slot;

        return (
          <div key={slot} className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={() => inputRefs.current[slot]?.click()}
              className={cn(
                "border-input bg-secondary/40 hover:bg-secondary relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-dashed transition-colors",
                image && "border-solid"
              )}
            >
              {isLoading ? (
                <Loader2Icon className="text-muted-foreground size-5 animate-spin" />
              ) : image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image.dataUrl}
                  alt={`${SLOT_LABELS[slot]} reference`}
                  className="size-full object-cover"
                />
              ) : (
                <ImagePlusIcon className="text-muted-foreground size-5" />
              )}

              {image && !isLoading && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(event) => {
                    event.stopPropagation();
                    removeSlot(slot);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.stopPropagation();
                      removeSlot(slot);
                    }
                  }}
                  className="bg-foreground/70 text-background absolute top-1 right-1 flex size-5 items-center justify-center rounded-full"
                  aria-label={`Remove ${SLOT_LABELS[slot]} image`}
                >
                  <XIcon className="size-3" />
                </span>
              )}
            </button>
            <span className="text-muted-foreground text-xs">{SLOT_LABELS[slot]}</span>
            <input
              ref={(el) => {
                inputRefs.current[slot] = el;
              }}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => handleFile(slot, event.target.files?.[0])}
            />
          </div>
        );
      })}
    </div>
  );
}
