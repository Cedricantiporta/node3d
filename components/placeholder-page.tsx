import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PlaceholderPage({
  icon: Icon,
  title,
  description,
  note,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  note: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      </div>
      <Card className="border-dashed">
        <CardHeader>
          <div className="bg-secondary text-secondary-foreground mb-2 flex size-10 items-center justify-center rounded-xl">
            <Icon className="size-5" />
          </div>
          <CardTitle>Coming up next</CardTitle>
          <CardDescription>{note}</CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  );
}
