export interface MealMedia {
  id: string;
  name: string;
  image: string;
  isolatedImage: string;
  alt: string;
  description: string;
  tagline?: string;
  accentBadge?: string;
}

export const JOLLOF_MEDIA: MealMedia = {
  id: "jollof-rice",
  name: "Jollof Rice",
  image: "/images/meals/jollof-rice.jpg",
  isolatedImage: "/images/meals/jollof-isolated.png",
  alt: "Chef Apedo Jollof Rice",
  description: "Ghanaian-style jollof rice prepared fresh daily.",
};

export const FRIED_RICE_MEDIA: MealMedia = {
  id: "fried-rice",
  name: "Fried Rice",
  image: "/images/meals/fried-rice.jpg",
  isolatedImage: "/images/meals/fried-rice-isolated.png",
  alt: "Chef Apedo Fried Rice",
  description: "Ghanaian-style fried rice.",
};

export const PLAIN_RICE_MEDIA: MealMedia = {
  id: "plain-rice-and-stew",
  name: "Plain Rice & Stew",
  image: "/images/meals/plain-rice-and-stew.jpg",
  isolatedImage: "/images/meals/plain-rice-isolated.png",
  alt: "Chef Apedo Plain Rice & Stew",
  description: "Plain rice served with stew.",
};

export const MEAL_MEDIA_MAP: Record<string, MealMedia> = {
  "jollof-rice": JOLLOF_MEDIA,
  "fried-rice": FRIED_RICE_MEDIA,
  "plain-rice-and-stew": PLAIN_RICE_MEDIA,
};

/**
 * Resolves a meal identifier (slug, name, or UUID) to its corresponding real media data.
 */
export function getMealMedia(identifier: string | null | undefined): MealMedia {
  if (!identifier) {
    return JOLLOF_MEDIA;
  }

  const normalized = identifier.toLowerCase().trim();

  if (normalized.includes("jollof")) {
    return JOLLOF_MEDIA;
  }
  if (normalized.includes("fried")) {
    return FRIED_RICE_MEDIA;
  }
  if (normalized.includes("stew") || normalized.includes("plain")) {
    return PLAIN_RICE_MEDIA;
  }

  const match = MEAL_MEDIA_MAP[identifier];
  if (match) {
    return match;
  }

  return JOLLOF_MEDIA;
}
