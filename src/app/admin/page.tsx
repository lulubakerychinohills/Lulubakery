"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { MAX_IMAGE_UPLOAD_BYTES } from "@/lib/upload-image";

type CakeCategory = "men" | "women" | "kids" | "sweet" | "other";
type CakeItem = {
  id: string;
  category: CakeCategory;
  imageUrl?: string;
  sortOrder: number;
};

function ProductSortEditor({
  productId,
  sortOrder,
  onSaved,
  onMessage,
}: {
  productId: string;
  sortOrder: number;
  onSaved: () => void;
  onMessage: (text: string) => void;
}) {
  const [value, setValue] = useState(String(sortOrder));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setValue(String(sortOrder));
  }, [productId, sortOrder]);

  const onSave = async () => {
    const n = Number.parseInt(value, 10);
    if (!Number.isFinite(n)) {
      onMessage("请输入有效整数序号。");
      return;
    }
    setBusy(true);
    onMessage("");
    try {
      const response = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId, sortOrder: n }),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(result.message || "更新序号失败。");
      }
      onMessage("序号已更新。");
      await onSaved();
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "更新序号失败。");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="text-xs text-zinc-600">
        展示序号
        <input
          type="number"
          className="ml-1 mt-0.5 block w-24 rounded border border-zinc-300 px-2 py-1 text-sm text-zinc-900"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </label>
      <button
        type="button"
        disabled={busy}
        onClick={() => void onSave()}
        className="rounded-lg border border-[#D8D2C9] bg-white px-3 py-1 text-xs font-semibold text-[#5C4B43] transition hover:bg-[#F4F1EC] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "保存中…" : "保存序号"}
      </button>
    </div>
  );
}

const categoryLabels: Record<CakeCategory, string> = {
  men: "男士",
  women: "女士",
  kids: "儿童",
  sweet: "甜品",
  other: "其他",
};

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [products, setProducts] = useState<CakeItem[]>([]);
  const [form, setForm] = useState({
    category: "women" as CakeCategory,
    imageUrl: "",
    description: "",
    sortOrder: "",
  });

  const loadProducts = async () => {
    try {
      const response = await fetch("/api/products", { cache: "no-store" });
      const result = (await response.json()) as { products?: CakeItem[] };
      if (response.ok && Array.isArray(result.products)) {
        setProducts(result.products);
      }
    } catch {
      // ignore load failures in UI
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/admin/session", { cache: "no-store" });
        const result = (await response.json()) as { authenticated?: boolean };
        setAuthenticated(Boolean(result.authenticated));
      } finally {
        setChecking(false);
      }
    };
    void checkSession();
    void loadProducts();
  }, []);

  const onLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(result.message || "登录失败。");
      }
      setAuthenticated(true);
      setPassword("");
      setMessage("登录成功。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "登录失败。");
    }
  };

  const onLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setMessage("已退出登录。");
  };

  const onUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        category: form.category,
        imageUrl: form.imageUrl,
        description: form.description,
      };
      if (form.sortOrder.trim() !== "") {
        const n = Number.parseInt(form.sortOrder.trim(), 10);
        if (Number.isFinite(n)) {
          payload.sortOrder = n;
        }
      }

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(result.message || "上传失败。");
      }
      setMessage("产品上传成功。");
      setForm({
        category: form.category,
        imageUrl: "",
        description: "",
        sortOrder: "",
      });
      await loadProducts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "上传失败。");
    } finally {
      setSaving(false);
    }
  };

  const onPickImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setMessage("");
    if (selectedFile.size > MAX_IMAGE_UPLOAD_BYTES) {
      setMessage("图片须小于或等于 10MB，请压缩后重试。");
      event.target.value = "";
      return;
    }
    setUploadingImage(true);
    try {
      const payload = new FormData();
      payload.append("image", selectedFile);

      const response = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: payload,
      });
      const result = (await response.json()) as { message?: string; url?: string };
      if (!response.ok || !result.url) {
        throw new Error(result.message || "图片上传失败。");
      }

      const nextImageUrl = result.url;
      setForm((prev) => ({ ...prev, imageUrl: nextImageUrl }));
      setMessage("图片上传成功，已自动填入 URL。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "图片上传失败。");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const inputClass = "mt-1 w-full rounded-lg border border-[#D8D2C9] px-3 py-2 outline-none focus:border-[#8B776A]";
  const previewUrl = form.imageUrl.trim();
  const canPreview = previewUrl.startsWith("/") || previewUrl.startsWith("http://") || previewUrl.startsWith("https://");

  if (checking) {
    return <main className="min-h-screen bg-[#F6F5F2] p-8">正在检查登录状态...</main>;
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-[#F6F5F2] p-6 text-zinc-800 sm:p-10">
        <section className="mx-auto max-w-lg rounded-2xl border border-[#D8D2C9] bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">产品管理登录</h1>
          <p className="mt-2 text-sm text-zinc-600">请输入管理密码后上传新产品。</p>
          <form className="mt-5" onSubmit={onLogin}>
            <label>
              管理密码
              <input
                className={inputClass}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <button
              type="submit"
              className="mt-4 rounded-lg bg-[#5C4B43] px-5 py-2 font-semibold text-white transition hover:bg-[#4D3F38]"
            >
              登录
            </button>
          </form>
          {message && <p className="mt-3 text-sm text-zinc-700">{message}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-[#F8F7F5] via-[#F6F5F2] to-[#F3F1ED] p-6 text-zinc-800 sm:p-10">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-2xl border border-[#D8D2C9] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold">产品上传后台</h1>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg border border-[#D8D2C9] px-4 py-2 text-sm font-semibold text-[#5C4B43] transition hover:bg-[#F4F1EC]"
            >
              退出登录
            </button>
          </div>
          <p className="mt-2 text-sm text-zinc-600">
            选择分类并上传图片即可。英文描述暂时可选。图片可直接本地选择并上传到 Supabase Storage。展示序号越小越靠前；留空则新商品自动排在末尾。
          </p>

          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={onUpload}>
            <label className="sm:col-span-2">
              分类
              <select
                className={inputClass}
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value as CakeCategory }))}
              >
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="sm:col-span-2">
              图片 URL（可选）
              <input
                className={inputClass}
                value={form.imageUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="/products/cupcake.webp"
              />
            </label>

            <div className="sm:col-span-2 rounded-lg border border-[#DDD6CE] bg-white p-4">
              <p className="text-sm font-semibold text-zinc-700">或从本地选择图片</p>
              <p className="mt-1 text-xs text-zinc-500">支持 jpg / png / webp / gif / heic / heif，单张须小于或等于 10MB。</p>
              <label className="mt-3 inline-flex cursor-pointer items-center rounded-lg border border-[#D8D2C9] px-4 py-2 text-sm font-semibold text-[#5C4B43] transition hover:bg-[#F4F1EC]">
                <input type="file" accept=".heic,.heif,image/*" className="hidden" onChange={onPickImage} />
                {uploadingImage ? "上传图片中..." : "选择本地图片"}
              </label>
            </div>

            {previewUrl ? (
              <div className="sm:col-span-2 rounded-lg border border-[#DDD6CE] bg-[#F4F1EC] p-4">
                <p className="text-sm font-semibold text-zinc-700">图片预览</p>
                <p className="mt-1 text-xs text-zinc-500">{previewUrl}</p>
                {canPreview ? (
                  <div className="relative mt-3 h-40 w-full max-w-xs overflow-hidden rounded-lg border border-[#D8D2C9] bg-white">
                    <Image src={previewUrl} alt="产品预览图" fill loading="lazy" decoding="async" className="object-cover" sizes="20rem" />
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-amber-700">
                    请填写可访问的图片 URL（本地路径或 https 链接）。
                  </p>
                )}
              </div>
            ) : null}

            <label className="sm:col-span-2">
              英文描述（English Description，可选）
              <textarea
                className={inputClass}
                rows={3}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </label>

            <label className="sm:col-span-2">
              展示序号（可选）
              <input
                className={inputClass}
                type="number"
                inputMode="numeric"
                placeholder="留空 = 自动排在最后"
                value={form.sortOrder}
                onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
              />
            </label>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#5C4B43] px-5 py-2 font-semibold text-white transition hover:bg-[#4D3F38] disabled:cursor-not-allowed disabled:bg-[#B8ADA3]"
              >
                {saving ? "上传中..." : "上传产品"}
              </button>
            </div>
          </form>

          {message && <p className="mt-3 text-sm text-zinc-700">{message}</p>}
        </section>

        <section className="mt-6 rounded-2xl border border-[#D8D2C9] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">当前产品列表</h2>
          <ul className="mt-4 space-y-2 text-sm text-zinc-700">
            {products.map((item) => (
              <li key={item.id} className="flex flex-col gap-2 rounded-lg border border-zinc-200 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  {item.imageUrl ? (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-[#DDD6CE] bg-[#F4F1EC]">
                      <Image src={item.imageUrl} alt="产品图片" fill loading="lazy" decoding="async" className="object-cover" sizes="3rem" />
                    </div>
                  ) : (
                    <div className="h-12 w-12 shrink-0 rounded-md border border-zinc-200 bg-zinc-50" />
                  )}
                  <div>
                    <p>
                      [{categoryLabels[item.category]}] 序号 {item.sortOrder} · ID: {item.id.slice(0, 8)}
                    </p>
                    {item.imageUrl ? <p className="text-xs text-zinc-500">{item.imageUrl}</p> : null}
                  </div>
                </div>
                <ProductSortEditor
                  productId={item.id}
                  sortOrder={item.sortOrder}
                  onSaved={loadProducts}
                  onMessage={setMessage}
                />
              </li>
            ))}
          </ul>
        </section>
      </div>
      <Link href="/">Back to Home</Link>
    </main>
  );
}
