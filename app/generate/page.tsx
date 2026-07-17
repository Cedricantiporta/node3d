"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "@/components/product/product-form";
import { VideoSettingsPanel } from "@/components/video-settings/video-settings-panel";

export default function GeneratePage() {
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
          <CardTitle>Product</CardTitle>
          <CardDescription>
            Tell us about what you&apos;re promoting. Paste a URL to auto-fill what we can.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Video settings</CardTitle>
          <CardDescription>Shape how each generated prompt reads.</CardDescription>
        </CardHeader>
        <CardContent>
          <VideoSettingsPanel />
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Character and results</CardTitle>
          <CardDescription>
            The character picker and one-click generation results land here in a follow-up task.
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  );
}
