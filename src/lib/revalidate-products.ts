import { revalidatePath, revalidateTag } from "next/cache";

/**
 * 后台增改产品后立刻让前台读到新数据（非 stale-while-revalidate）。
 * Route Handler 里不能用 updateTag，故用 expire: 0。
 */
export function revalidateProductsCatalog() {
  revalidateTag("products", { expire: 0 });
  revalidatePath("/", "layout");
}
