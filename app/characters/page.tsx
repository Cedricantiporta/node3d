import { UsersIcon } from "lucide-react";

import { PlaceholderPage } from "@/components/placeholder-page";

export default function CharactersPage() {
  return (
    <PlaceholderPage
      icon={UsersIcon}
      title="Character Library"
      description="Save reusable AI actors so you never rewrite a character description again."
      note="Character creation, reference images, and the reusable picker are built in a follow-up task."
    />
  );
}
