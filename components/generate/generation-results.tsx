"use client";

import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";
import { ExportMenu } from "@/components/export-menu";
import { formatAsText } from "@/lib/export";
import type { GeneratedPromptSet } from "@/types";

function ResultCard({ title, content }: { title: string; content: string }) {
  return (
    <Card className="py-4">
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-sm">{title}</CardTitle>
        <CopyButton value={content} size="sm" variant="ghost" />
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm whitespace-pre-wrap">{content}</p>
      </CardContent>
    </Card>
  );
}

export function GenerationResults({ result }: { result: GeneratedPromptSet }) {
  const platformEntries = Object.entries(result.outputs.videoPrompts);

  return (
    <motion.div
      key={result.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Results</h2>
          <Badge variant="secondary">{result.characterName}</Badge>
          {result.templateName && <Badge variant="outline">{result.templateName}</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <CopyButton
            value={formatAsText(result)}
            label="Copy all"
            copiedLabel="Copied all"
            variant="default"
          />
          <ExportMenu result={result} />
        </div>
      </div>

      <Tabs defaultValue="video">
        <TabsList>
          <TabsTrigger value="video">Video Prompts</TabsTrigger>
          <TabsTrigger value="visuals">Visuals</TabsTrigger>
          <TabsTrigger value="direction">Direction</TabsTrigger>
          <TabsTrigger value="script">Script &amp; Copy</TabsTrigger>
        </TabsList>

        <TabsContent value="video" className="flex flex-col gap-3 pt-3">
          {platformEntries.map(([platform, prompt]) => (
            <ResultCard key={platform} title={`${platform} prompt`} content={prompt ?? ""} />
          ))}
        </TabsContent>

        <TabsContent value="visuals" className="flex flex-col gap-3 pt-3">
          <ResultCard title="Image prompt" content={result.outputs.imagePrompt} />
          <ResultCard title="Thumbnail prompt" content={result.outputs.thumbnailPrompt} />
          <ResultCard title="B-roll prompt" content={result.outputs.brollPrompt} />
        </TabsContent>

        <TabsContent value="direction" className="flex flex-col gap-3 pt-3">
          <ResultCard title="Camera directions" content={result.outputs.cameraDirections} />
          <ResultCard title="Lighting directions" content={result.outputs.lightingDirections} />
          <ResultCard title="Negative prompt" content={result.outputs.negativePrompt} />
        </TabsContent>

        <TabsContent value="script" className="flex flex-col gap-3 pt-3">
          <ResultCard title="Full UGC script" content={result.outputs.ugcScript} />
          <ResultCard title="Hook" content={result.outputs.hook} />
          <ResultCard title="CTA" content={result.outputs.cta} />
          <ResultCard title="Caption" content={result.outputs.caption} />
          <ResultCard title="Hashtags" content={result.outputs.hashtags.join(" ")} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
