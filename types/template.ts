export const TEMPLATE_CATEGORIES = [
  "Product Review",
  "Unboxing",
  "Testimonial",
  "Day in the Life",
  "GRWM",
  "Skincare",
  "Food Review",
  "Tech Review",
  "Lifestyle",
  "Comedy",
  "Custom",
] as const;

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

export interface PromptTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  /** Scenario body with {{character.x}} / {{product.x}} placeholder tokens. */
  body: string;
  isBuiltIn: boolean;
  editable: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PromptTemplateInput = Omit<
  PromptTemplate,
  "id" | "isBuiltIn" | "createdAt" | "updatedAt"
>;

/** Tokens available for substitution inside a template body. */
export const TEMPLATE_PLACEHOLDER_TOKENS = [
  "{{character.name}}",
  "{{character.appearanceDescription}}",
  "{{character.personality}}",
  "{{character.voice}}",
  "{{product.name}}",
  "{{product.description}}",
  "{{product.sellingPoints}}",
  "{{product.targetAudience}}",
  "{{product.platform}}",
] as const;
