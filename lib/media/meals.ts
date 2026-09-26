export interface MealMedia {
  id: string;
  name: string;
  image: string;
  alt: string;
  tagline: string;
  accentBadge: string;
  description: string;
  spiciness: number; // 1-3
}

export const JOLLOF_MEDIA: MealMedia = {
  id: "jollof-rice",
  name: "Jollof Rice",
  image: "/images/meals/jollof-rice.jpg",
  alt: "Authentic Ghanaian smoky fire Jollof Rice topped with red onion and fresh herbs",
  tagline: "Fire-simmered Ghanaian gold with deep spice aromatics",
  accentBadge: "Accra's Favorite",
  description: "Ghanaian-style fragrant jollof rice cooked in rich spiced tomato sauce with subtle smoky undertones.",
  spiciness: 2,
};

export const FRIED_RICE_MEDIA: MealMedia = {
  id: "fried-rice",
  name: "Fried Rice",
  image: "/images/meals/fried-rice.jpg",
  alt: "Ghanaian style wok fried rice with seasoned vegetables and rich artisanal shito",
  tagline: "Tossed with garden aromatics and our signature savory glaze",
  accentBadge: "Chef Specialty",
  description: "Seasoned Ghanaian fried rice loaded with sweet carrots, green peas, and local seasonings.",
  spiciness: 1,
};

export const PLAIN_RICE_MEDIA: MealMedia = {
  id: "plain-rice-and-stew",
  name: "Plain Rice & Stew",
  image: "/images/meals/plain-rice-and-stew.jpg",
  alt: "Steaming white jasmine rice paired with authentic slow-simmered Ghanaian beef and chicken stew",
  tagline: "Slow-braised rich tomato stew with meltingly tender meat cuts",
  accentBadge: "Comfort Classic",
  description: "Fluffy white jasmine rice served with rich, savory Ghanaian beef and chicken stew, seasoned to perfection.",
  spiciness: 2,
};

export const MEAL_MEDIA_MAP: Record<string, MealMedia> = {
  "jollof-rice": JOLLOF_MEDIA,
  "fried-rice": FRIED_RICE_MEDIA,
  "plain-rice-and-stew": PLAIN_RICE_MEDIA,
};

/**
 * Resolves a meal identifier (slug, name, or UUID) to its corresponding rich media data.
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
