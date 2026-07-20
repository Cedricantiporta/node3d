import type { PromptTemplateInput } from "@/types";

/**
 * The 10 built-in UGC scenario templates. Bodies use {{character.x}} /
 * {{product.x}} placeholder tokens substituted by lib/engine/template.ts.
 * Seeded into storage once, on first run, by useTemplates().seedBuiltIns.
 */
export const BUILT_IN_TEMPLATES: PromptTemplateInput[] = [
  {
    name: "Product Review",
    category: "Product Review",
    editable: true,
    body: "{{character.name}} sits facing the camera in a cozy, well-lit space and gives an honest, detailed review of {{product.name}}. They pick it up, point out {{product.sellingPoints}}, and explain why it stands out for {{product.targetAudience}}. Their tone stays candid and conversational throughout, like they're catching up a friend.",
  },
  {
    name: "Unboxing",
    category: "Unboxing",
    editable: true,
    body: "{{character.name}} receives a package containing {{product.name}} and unboxes it on camera with genuine excitement. They read the packaging, remove the product, and react in real time to its design and first impression, highlighting {{product.sellingPoints}} as they go.",
  },
  {
    name: "Testimonial",
    category: "Testimonial",
    editable: true,
    body: "{{character.name}} speaks directly to camera as if recording a heartfelt testimonial for {{product.name}}. They share how it changed their routine, calling out {{product.sellingPoints}}, and explain why they'd recommend it to {{product.targetAudience}}.",
  },
  {
    name: "Day in the Life",
    category: "Day in the Life",
    editable: true,
    body: "Follow {{character.name}} through a slice of their day, weaving {{product.name}} naturally into their routine. They use it in context, not as a pitch, while casually mentioning {{product.sellingPoints}} along the way.",
  },
  {
    name: "GRWM",
    category: "GRWM",
    editable: true,
    body: "{{character.name}} films a Get Ready With Me video, talking through their routine while incorporating {{product.name}} as a key step. They explain {{product.sellingPoints}} in a relaxed, mirror-side monologue aimed at {{product.targetAudience}}.",
  },
  {
    name: "Skincare",
    category: "Skincare",
    editable: true,
    body: "In soft, flattering light, {{character.name}} walks through their skincare routine, applying {{product.name}} to clean skin. They describe the texture, scent, and feel in real time, emphasizing {{product.sellingPoints}} for viewers with similar skin concerns.",
  },
  {
    name: "Food Review",
    category: "Food Review",
    editable: true,
    body: "{{character.name}} sits at a table with {{product.name}} in frame, taking their first bite or sip on camera. They react authentically, describe the taste and quality, and highlight {{product.sellingPoints}} as if reviewing it for {{product.targetAudience}}.",
  },
  {
    name: "Tech Review",
    category: "Tech Review",
    editable: true,
    body: "{{character.name}} unboxes and demos {{product.name}}, walking through its setup and key features on camera. They test it live, comment on {{product.sellingPoints}}, and give a straightforward verdict for {{product.targetAudience}}.",
  },
  {
    name: "Lifestyle",
    category: "Lifestyle",
    editable: true,
    body: "{{character.name}} is shown living their everyday life, relaxed, candid, unscripted, with {{product.name}} appearing naturally in the scene. Their personality ({{character.personality}}) comes through as they casually mention {{product.sellingPoints}}.",
  },
  {
    name: "Comedy",
    category: "Comedy",
    editable: true,
    body: "{{character.name}} opens with an exaggerated, comedic problem, then 'discovers' {{product.name}} as the over-the-top solution. They play up the reaction for laughs while still landing on real selling points: {{product.sellingPoints}}.",
  },
];
