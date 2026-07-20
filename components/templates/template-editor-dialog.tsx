"use client";

import * as React from "react";
import { PlusIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TEMPLATE_CATEGORIES,
  TEMPLATE_PLACEHOLDER_TOKENS,
  type PromptTemplate,
  type PromptTemplateInput,
} from "@/types";

const EMPTY_INPUT: PromptTemplateInput = {
  name: "",
  category: "Custom",
  body: "",
  editable: true,
};

export function TemplateEditorDialog({
  open,
  onOpenChange,
  template,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: PromptTemplate;
  onSubmit: (input: PromptTemplateInput) => void;
}) {
  const [form, setForm] = React.useState<PromptTemplateInput>(template ?? EMPTY_INPUT);
  const [prevOpen, setPrevOpen] = React.useState(open);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setForm(template ?? EMPTY_INPUT);
    }
  }

  const insertToken = (token: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setForm((prev) => ({ ...prev, body: `${prev.body}${token}` }));
      return;
    }

    const start = textarea.selectionStart ?? form.body.length;
    const end = textarea.selectionEnd ?? form.body.length;
    const nextBody = `${form.body.slice(0, start)}${token}${form.body.slice(end)}`;
    setForm((prev) => ({ ...prev, body: nextBody }));

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + token.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.body.trim()) return;
    onSubmit(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{template ? "Edit template" : "New template"}</DialogTitle>
          <DialogDescription>
            Write the scenario once, using placeholder tokens for the character and product.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="template-name">Name</Label>
              <Input
                id="template-name"
                required
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Weekend Unboxing"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="template-category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, category: value as PromptTemplateInput["category"] }))
                }
              >
                <SelectTrigger id="template-category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="template-body">Scenario</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" size="sm">
                    <PlusIcon /> Insert token
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {TEMPLATE_PLACEHOLDER_TOKENS.map((token) => (
                    <DropdownMenuItem key={token} onClick={() => insertToken(token)}>
                      <code className="text-xs">{token}</code>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Textarea
              id="template-body"
              ref={textareaRef}
              required
              rows={6}
              value={form.body}
              onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
              placeholder="{{character.name}} shows off {{product.name}}..."
            />
            <p className="text-muted-foreground text-xs">
              Tokens like <code>{"{{product.name}}"}</code> are replaced with real values when a
              prompt is generated.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!form.name.trim() || !form.body.trim()}>
              {template ? "Save changes" : "Create template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
