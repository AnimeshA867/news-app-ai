export const AD_POSITIONS = [
  "header",
  "footer",
  "in-article",
  "before-content",
  "after-content",
  "homepage-featured",
  "category-top",
] as const;

export type AdPosition = (typeof AD_POSITIONS)[number];
