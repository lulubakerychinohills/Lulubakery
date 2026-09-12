export type SearchableProduct = {
  id: string;
  category: string;
  descriptionI18n?: Partial<Record<"zh" | "en" | "es", string>>;
};

/**
 * Filters products by category and a case-insensitive free-text query.
 * Query matches id, category, and localized descriptions.
 */
export function filterProducts<T extends SearchableProduct>(
  products: T[],
  category: string,
  query: string,
): T[] {
  const normalizedQuery = query.trim().toLowerCase();
  const byCategory =
    category === "all" ? products : products.filter((item) => item.category === category);

  if (!normalizedQuery) {
    return byCategory;
  }

  return byCategory.filter((item) => {
    const descriptionBlob = Object.values(item.descriptionI18n ?? {})
      .join(" ")
      .toLowerCase();
    return (
      item.id.toLowerCase().includes(normalizedQuery) ||
      item.category.toLowerCase().includes(normalizedQuery) ||
      descriptionBlob.includes(normalizedQuery)
    );
  });
}

/** Simple debounce helper used by the showcase search input. */
export function debounce<T extends (...args: never[]) => void>(fn: T, waitMs: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const debounced = (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), waitMs);
  };
  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
  };
  return debounced;
}
