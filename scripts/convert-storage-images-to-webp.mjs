import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import sharp from "sharp";

const WEBP_QUALITY = 82;
const MAX_EDGE = 2048;

function loadEnv() {
  const env = Object.fromEntries(
    readFileSync(".env.local", "utf8")
      .split("\n")
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const i = line.indexOf("=");
        return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
      }),
  );
  return env;
}

function storagePathFromPublicUrl(imageUrl, bucket) {
  const marker = `/object/public/${bucket}/`;
  const idx = imageUrl.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(imageUrl.slice(idx + marker.length).split("?")[0]);
}

function toWebpPath(storagePath) {
  return storagePath.replace(/\.[^.]+$/, ".webp");
}

async function convertBuffer(buffer) {
  return sharp(buffer)
    .rotate()
    .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toBuffer();
}

async function main() {
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = env.SUPABASE_STORAGE_BUCKET || "product-images";
  if (!url || !key) {
    throw new Error("缺少 NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY");
  }

  const supabase = createClient(url, key);
  const { data: products, error } = await supabase.from("products").select("id, image_url");
  if (error) throw error;

  const targets = (products || []).filter(
    (p) => p.image_url && !/\.webp(\?|$)/i.test(p.image_url),
  );

  console.log(`待转换产品图: ${targets.length} / ${(products || []).length}`);

  let ok = 0;
  let fail = 0;

  for (const product of targets) {
    const oldPath = storagePathFromPublicUrl(product.image_url, bucket);
    if (!oldPath) {
      console.warn("跳过（无法解析路径）", product.id, product.image_url);
      fail += 1;
      continue;
    }

    const newPath = toWebpPath(oldPath);
    try {
      const { data: blob, error: dlError } = await supabase.storage.from(bucket).download(oldPath);
      if (dlError) throw dlError;

      const input = Buffer.from(await blob.arrayBuffer());
      const webp = await convertBuffer(input);

      const { error: upError } = await supabase.storage.from(bucket).upload(newPath, webp, {
        contentType: "image/webp",
        upsert: true,
        cacheControl: "3600",
      });
      if (upError) throw upError;

      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(newPath);
      const { error: dbError } = await supabase
        .from("products")
        .update({ image_url: pub.publicUrl })
        .eq("id", product.id);
      if (dbError) throw dbError;

      if (newPath !== oldPath) {
        await supabase.storage.from(bucket).remove([oldPath]);
      }

      ok += 1;
      console.log(`OK ${ok}/${targets.length}`, product.id, "->", newPath);
    } catch (err) {
      fail += 1;
      console.error("FAIL", product.id, oldPath, err?.message || err);
    }
  }

  console.log(`完成: 成功 ${ok}, 失败 ${fail}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
