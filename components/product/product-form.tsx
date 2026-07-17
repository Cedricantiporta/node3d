"use client";

import * as React from "react";
import { Loader2Icon, WandSparklesIcon } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAppSettings } from "@/hooks";
import { EMPTY_PRODUCT, SOCIAL_PLATFORMS, type Product, type SocialPlatform } from "@/types";
import { SellingPointsInput } from "./selling-points-input";

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Netherlands",
  "Sweden",
  "Mexico",
  "Brazil",
  "India",
  "Japan",
  "South Korea",
  "Philippines",
  "Indonesia",
  "United Arab Emirates",
  "Nigeria",
  "South Africa",
];

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Italian",
  "Dutch",
  "Japanese",
  "Korean",
  "Mandarin Chinese",
  "Hindi",
  "Arabic",
  "Tagalog",
  "Indonesian",
];

export function ProductForm({
  onChange,
}: {
  onChange?: (product: Product) => void;
}) {
  const { settings, updateSettings, hydrated } = useAppSettings();
  const product = settings.lastProduct ?? EMPTY_PRODUCT;
  const [extracting, setExtracting] = React.useState(false);

  const setProduct = React.useCallback(
    (patch: Partial<Product>) => {
      const next: Product = { ...product, ...patch };
      updateSettings({ lastProduct: next });
      onChange?.(next);
    },
    [product, updateSettings, onChange]
  );

  const handleExtract = async () => {
    if (!product.url.trim()) {
      toast.error("Add a product URL first.");
      return;
    }

    setExtracting(true);
    try {
      const response = await fetch("/api/extract-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: product.url.trim() }),
      });
      const data: { name?: string; description?: string; error?: string } =
        await response.json();

      if (!response.ok) {
        toast.error(data.error ?? "Couldn't extract product info — fill in the details manually.");
        return;
      }

      const patch: Partial<Product> = {};
      if (!product.name.trim() && data.name) patch.name = data.name;
      if (!product.description.trim() && data.description) patch.description = data.description;

      if (Object.keys(patch).length === 0) {
        toast.info("Nothing new to fill in — those fields are already set.");
      } else {
        setProduct(patch);
        toast.success("Pulled product details from the page.");
      }
    } catch {
      toast.error("Couldn't extract product info — fill in the details manually.");
    } finally {
      setExtracting(false);
    }
  };

  if (!hydrated) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="product-name">Product name</Label>
        <Input
          id="product-name"
          value={product.name}
          onChange={(e) => setProduct({ name: e.target.value })}
          placeholder="GlowServe Skin Serum"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="product-url">Product URL (optional)</Label>
        <div className="flex gap-2">
          <Input
            id="product-url"
            type="url"
            value={product.url}
            onChange={(e) => setProduct({ url: e.target.value })}
            placeholder="https://example.com/product"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleExtract}
            disabled={extracting}
          >
            {extracting ? <Loader2Icon className="animate-spin" /> : <WandSparklesIcon />}
            Extract
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="product-description">Description</Label>
        <Textarea
          id="product-description"
          value={product.description}
          onChange={(e) => setProduct({ description: e.target.value })}
          placeholder="A lightweight vitamin C serum for glowing skin"
          rows={3}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="product-selling-points">Key selling points</Label>
        <SellingPointsInput
          id="product-selling-points"
          value={product.sellingPoints}
          onChange={(sellingPoints) => setProduct({ sellingPoints })}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="product-audience">Target audience</Label>
          <Input
            id="product-audience"
            value={product.targetAudience}
            onChange={(e) => setProduct({ targetAudience: e.target.value })}
            placeholder="Skincare enthusiasts in their 20s"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="product-country">Country</Label>
          <Select value={product.country} onValueChange={(value) => setProduct({ country: value })}>
            <SelectTrigger id="product-country" className="w-full">
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="product-language">Language</Label>
          <Select value={product.language} onValueChange={(value) => setProduct({ language: value })}>
            <SelectTrigger id="product-language" className="w-full">
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((language) => (
                <SelectItem key={language} value={language}>
                  {language}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Platform</Label>
          <div className="bg-secondary inline-flex w-fit flex-wrap gap-1 rounded-lg p-1">
            {SOCIAL_PLATFORMS.map((platform) => (
              <PlatformSegment
                key={platform}
                platform={platform}
                active={product.platform === platform}
                onClick={() => setProduct({ platform })}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlatformSegment({
  platform,
  active,
  onClick,
}: {
  platform: SocialPlatform;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-md px-3 py-1 text-sm font-medium transition-colors",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {platform}
    </button>
  );
}
