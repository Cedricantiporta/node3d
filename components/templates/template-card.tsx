"use client";

import { CopyIcon, MoreVerticalIcon, PencilIcon, RotateCcwIcon, Trash2Icon } from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PromptTemplate } from "@/types";

export function TemplateCard({
  template,
  onEdit,
  onDuplicate,
  onReset,
  onDelete,
}: {
  template: PromptTemplate;
  onEdit: () => void;
  onDuplicate: () => void;
  onReset?: () => void;
  onDelete?: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
    >
      <Card className="h-full py-5">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{template.category}</Badge>
                {template.isBuiltIn && <Badge variant="secondary">Built-in</Badge>}
              </div>
              <h3 className="font-medium">{template.name}</h3>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="-mt-1 -mr-1 shrink-0"
                  aria-label={`${template.name} actions`}
                >
                  <MoreVerticalIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <PencilIcon /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate}>
                  <CopyIcon /> Duplicate
                </DropdownMenuItem>
                {template.isBuiltIn && onReset && (
                  <DropdownMenuItem onClick={onReset}>
                    <RotateCcwIcon /> Reset to default
                  </DropdownMenuItem>
                )}
                {!template.isBuiltIn && onDelete && (
                  <DropdownMenuItem variant="destructive" onClick={onDelete}>
                    <Trash2Icon /> Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground line-clamp-3 text-sm">{template.body}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
