import { HistoryIcon } from "lucide-react";

import { PlaceholderPage } from "@/components/placeholder-page";

export default function HistoryPage() {
  return (
    <PlaceholderPage
      icon={HistoryIcon}
      title="Prompt History"
      description="Every generation is saved automatically so you can search, favorite, and reuse it."
      note="History search, favorites, and re-generation land once the Generate page is saving results."
    />
  );
}
