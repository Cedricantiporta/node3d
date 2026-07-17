import { FileTextIcon } from "lucide-react";

import { PlaceholderPage } from "@/components/placeholder-page";

export default function TemplatesPage() {
  return (
    <PlaceholderPage
      icon={FileTextIcon}
      title="Prompt Templates"
      description="Reusable UGC scenario templates like Product Review, Unboxing, GRWM, and more."
      note="Built-in editable templates are seeded once the prompt engine's placeholder system is ready."
    />
  );
}
