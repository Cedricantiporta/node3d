import type { Character, Product } from "@/types";

const PLACEHOLDER_PATTERN = /{{\s*([\w.]+)\s*}}/g;

function buildTokenMap(character: Character, product: Product): Record<string, string> {
  return {
    "character.name": character.name,
    "character.appearanceDescription": character.appearanceDescription,
    "character.personality": character.personality,
    "character.voice": character.voice,
    "character.age": character.age,
    "character.ethnicity": character.ethnicity,
    "product.name": product.name,
    "product.description": product.description,
    "product.sellingPoints": product.sellingPoints.join(", "),
    "product.targetAudience": product.targetAudience,
    "product.platform": product.platform,
    "product.country": product.country,
    "product.language": product.language,
  };
}

/** Replaces {{character.x}} / {{product.x}} tokens in a template body. Unknown tokens are left as-is. */
export function substituteTemplate(
  body: string,
  character: Character,
  product: Product
): string {
  const tokens = buildTokenMap(character, product);

  return body.replace(PLACEHOLDER_PATTERN, (match, key: string) =>
    key in tokens ? tokens[key] : match
  );
}
