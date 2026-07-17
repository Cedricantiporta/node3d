"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppSettings } from "@/hooks";
import {
  DEFAULT_ENHANCER_PROVIDER_ID,
  enhancerProviders,
  videoGeneratorProviders,
  type ProviderInfo,
} from "@/lib/providers";

function ProviderRow({
  provider,
  isActive,
  apiKey,
  onApiKeyChange,
}: {
  provider: ProviderInfo;
  isActive?: boolean;
  apiKey: string;
  onApiKeyChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-b py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{provider.name}</span>
          {isActive && <Badge>Active</Badge>}
          {!provider.available && <Badge variant="secondary">Coming soon</Badge>}
        </div>
        <p className="text-muted-foreground text-sm">{provider.description}</p>
      </div>
      {provider.requiresApiKey && (
        <div className="flex flex-col gap-1.5 sm:w-64">
          <Label htmlFor={`api-key-${provider.id}`} className="text-xs">
            API key
          </Label>
          <Input
            id={`api-key-${provider.id}`}
            type="password"
            value={apiKey}
            disabled={!provider.available}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder={provider.available ? "sk-..." : "Coming soon"}
          />
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { settings, updateSettings, hydrated } = useAppSettings();

  if (!hydrated) return null;

  const setApiKey = (providerId: string, value: string) => {
    updateSettings({
      providerApiKeys: { ...settings.providerApiKeys, [providerId]: value },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Configure the providers that power prompt enhancement and future video generation.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prompt enhancement</CardTitle>
          <CardDescription>
            The active provider rewrites every generated prompt for realism and cinematic
            quality before it&apos;s shown to you.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col">
          {enhancerProviders.list().map((provider) => (
            <ProviderRow
              key={provider.id}
              provider={provider}
              isActive={provider.id === DEFAULT_ENHANCER_PROVIDER_ID}
              apiKey={settings.providerApiKeys[provider.id] ?? ""}
              onApiKeyChange={(value) => setApiKey(provider.id, value)}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI video platforms</CardTitle>
          <CardDescription>
            Direct submission to these platforms is on the roadmap. For now, copy or export the
            generated prompt into each platform manually.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col">
          {videoGeneratorProviders.list().map((provider) => (
            <ProviderRow
              key={provider.id}
              provider={provider}
              apiKey={settings.providerApiKeys[provider.id] ?? ""}
              onApiKeyChange={(value) => setApiKey(provider.id, value)}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
