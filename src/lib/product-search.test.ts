import { describe, expect, it, vi } from "vitest";
import { debounce, filterProducts } from "@/lib/product-search";

const products = [
  {
    id: "abc-1",
    category: "men",
    descriptionI18n: { en: "Navy blue birthday cake", zh: "深蓝生日蛋糕" },
  },
  {
    id: "abc-2",
    category: "women",
    descriptionI18n: { en: "Floral wedding cake", zh: "花卉婚礼蛋糕" },
  },
  {
    id: "abc-3",
    category: "kids",
    descriptionI18n: { en: "Dinosaur theme cake", zh: "恐龙主题蛋糕" },
  },
];

describe("filterProducts", () => {
  it("returns all products when category is all and query is empty", () => {
    expect(filterProducts(products, "all", "")).toHaveLength(3);
  });

  it("filters by category", () => {
    expect(filterProducts(products, "kids", "").map((p) => p.id)).toEqual(["abc-3"]);
  });

  it("filters by case-insensitive description query", () => {
    expect(filterProducts(products, "all", "WEDDING").map((p) => p.id)).toEqual(["abc-2"]);
  });

  it("combines category and query", () => {
    expect(filterProducts(products, "men", "blue")).toHaveLength(1);
    expect(filterProducts(products, "women", "blue")).toHaveLength(0);
  });
});

describe("debounce", () => {
  it("delays invocation until wait time elapses", () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    const debounced = debounce(spy, 300);
    debounced();
    debounced();
    expect(spy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(300);
    expect(spy).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
