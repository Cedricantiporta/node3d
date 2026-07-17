import { LayoutDashboardIcon } from "lucide-react";

import { PlaceholderPage } from "@/components/placeholder-page";

export default function Home() {
  return (
    <PlaceholderPage
      icon={LayoutDashboardIcon}
      title="Dashboard"
      description="Your AI UGC Prompt Factory at a glance."
      note="Stats, quick-generate, and recent history land here once the Character Library, Generate flow, and History are wired up."
    />
  );
}
