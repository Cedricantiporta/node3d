"use client";

import * as React from "react";
import { AnimatePresence } from "framer-motion";
import { FileTextIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTemplates } from "@/hooks";
import { BUILT_IN_TEMPLATES } from "@/lib/templates/built-in-templates";
import type { PromptTemplate, PromptTemplateInput } from "@/types";
import { TemplateCard } from "@/components/templates/template-card";
import { TemplateEditorDialog } from "@/components/templates/template-editor-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";

export default function TemplatesPage() {
  const { templates, hydrated, seedBuiltIns, addTemplate, updateTemplate, removeTemplate, duplicateTemplate } =
    useTemplates();

  React.useEffect(() => {
    if (hydrated) {
      seedBuiltIns(BUILT_IN_TEMPLATES);
    }
  }, [hydrated, seedBuiltIns]);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<PromptTemplate | undefined>(undefined);
  const [pendingDeleteId, setPendingDeleteId] = React.useState<string | null>(null);

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const openEdit = (template: PromptTemplate) => {
    setEditing(template);
    setFormOpen(true);
  };

  const handleSubmit = (input: PromptTemplateInput) => {
    if (editing) {
      updateTemplate(editing.id, input);
      toast.success(`${input.name} updated.`);
    } else {
      addTemplate(input);
      toast.success(`${input.name} saved to your templates.`);
    }
  };

  const handleDuplicate = (template: PromptTemplate) => {
    const copy = duplicateTemplate(template.id);
    if (copy) toast.success(`Duplicated as "${copy.name}".`);
  };

  const handleReset = (template: PromptTemplate) => {
    const original = BUILT_IN_TEMPLATES.find((t) => t.name === template.name);
    if (!original) return;
    updateTemplate(template.id, original);
    toast.success(`${template.name} reset to default.`);
  };

  const pendingTemplate = templates.find((t) => t.id === pendingDeleteId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Prompt Templates</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Reusable UGC scenario templates. Selectable on the Generate page.
          </p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon /> New template
        </Button>
      </div>

      {hydrated && templates.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <div className="bg-secondary text-secondary-foreground mb-2 flex size-10 items-center justify-center rounded-xl">
              <FileTextIcon className="size-5" />
            </div>
            <CardTitle>No templates yet</CardTitle>
            <CardDescription>Create a custom scenario template to reuse.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={openCreate}>
              <PlusIcon /> New template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onEdit={() => openEdit(template)}
                onDuplicate={() => handleDuplicate(template)}
                onReset={template.isBuiltIn ? () => handleReset(template) : undefined}
                onDelete={!template.isBuiltIn ? () => setPendingDeleteId(template.id) : undefined}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <TemplateEditorDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        template={editing}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
        title="Delete template?"
        description={
          pendingTemplate
            ? `"${pendingTemplate.name}" will be permanently removed. This won't affect prompts you've already generated.`
            : ""
        }
        onConfirm={() => {
          if (pendingDeleteId) {
            removeTemplate(pendingDeleteId);
            toast.success("Template deleted.");
          }
        }}
      />
    </div>
  );
}
