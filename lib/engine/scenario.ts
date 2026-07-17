import type { Character, Product, PromptTemplate } from "@/types";
import { substituteTemplate } from "./template";

/** The scenario/action driving the video: either a substituted template body or a sensible default. */
export function buildScenario(
  character: Character,
  product: Product,
  template?: PromptTemplate
): string {
  if (template) {
    return substituteTemplate(template.body, character, product);
  }

  const sellingPoint = product.sellingPoints[0] || product.description;

  return (
    `${character.name} picks up ${product.name} and shows it directly to camera, ` +
    `speaking naturally to ${product.targetAudience || "the viewer"} about ${sellingPoint}. ` +
    `${character.name} demonstrates the product in use, reacting authentically, ` +
    `then turns back to camera to deliver a genuine recommendation.`
  );
}
