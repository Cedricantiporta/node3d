export const SOCIAL_PLATFORMS = [
  "TikTok",
  "Instagram",
  "Facebook",
  "YouTube Shorts",
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export interface Product {
  name: string;
  url: string;
  description: string;
  sellingPoints: string[];
  targetAudience: string;
  country: string;
  language: string;
  platform: SocialPlatform;
}

export const EMPTY_PRODUCT: Product = {
  name: "",
  url: "",
  description: "",
  sellingPoints: [],
  targetAudience: "",
  country: "",
  language: "English",
  platform: "TikTok",
};
