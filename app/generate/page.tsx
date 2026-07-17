import { SparklesIcon } from "lucide-react";

import { PlaceholderPage } from "@/components/placeholder-page";

export default function GeneratePage() {
  return (
    <PlaceholderPage
      icon={SparklesIcon}
      title="Generate"
      description="Pick a character, describe the product, and generate every prompt you need in one click."
      note="The one-click generation workflow is built once the prompt engine and input forms are in place."
    />
  );
}
