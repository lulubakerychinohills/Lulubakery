import { existsSync } from "node:fs";
import sharp from "sharp";
import { mkdir } from "fs/promises";

/**
 * 维护用：由源图生成 WebP。请将新图放到对应路径后再运行 `npm run optimize-public-images`。
 * - 甜品价目：`public/menu/dessert-menu.jpg`（不缩放，仅编码，避免价目小字发糊）
 * - 首页横幅：`public/products/cupcake.jpg`
 * - 品牌头像：`public/brand/avatar.png`
 */
async function main() {
  await mkdir("public/menu", { recursive: true });
  await mkdir("public/products", { recursive: true });
  await mkdir("public/brand", { recursive: true });

  const menuIn = "public/menu/dessert-menu.jpg";
  if (existsSync(menuIn)) {
    await sharp(menuIn)
      .rotate()
      .webp({ quality: 82, effort: 4 })
      .toFile("public/menu/dessert-menu.webp");
    console.log("OK: public/menu/dessert-menu.webp");
  } else {
    console.warn("Skip menu: missing", menuIn);
  }

  const cupcakeIn = "public/products/cupcake.jpg";
  if (existsSync(cupcakeIn)) {
    await sharp(cupcakeIn)
      .rotate()
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toFile("public/products/cupcake.webp");
    console.log("OK: public/products/cupcake.webp");
  } else {
    console.warn("Skip cupcake: missing", cupcakeIn);
  }

  const avatarIn = "public/brand/avatar.png";
  if (existsSync(avatarIn)) {
    await sharp(avatarIn)
      .rotate()
      .resize(1024, 1024, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85, effort: 4 })
      .toFile("public/brand/avatar.webp");
    console.log("OK: public/brand/avatar.webp");
  } else {
    console.warn("Skip avatar: missing", avatarIn);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
