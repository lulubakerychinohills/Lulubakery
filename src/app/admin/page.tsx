"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

type CakeCategory = "men" | "women" | "kids" | "other";
type CakeItem = {
  id: string;
  titleI18n: { zh: string; en: string; es: string };
  category: CakeCategory;
  imageUrl?: string;
};

const categoryLabels: Record<CakeCategory, string> = {
  men: "男士",
  women: "女士",
  kids: "儿童",
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
    title: "",
    imageUrl: "",
    description: "",
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
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(result.message || "上传失败。");
      }
      setMessage("产品上传成功。");
      setForm({
        category: form.category,
        title: "",
        imageUrl: "",
        description: "",
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

  const inputClass = "mt-1 w-full rounded-lg border border-rose-200 px-3 py-2 outline-none focus:border-rose-400";
  const previewUrl = form.imageUrl.trim();
  const canPreview = previewUrl.startsWith("/") || previewUrl.startsWith("http://") || previewUrl.startsWith("https://");

  if (checking) {
    return <main className="min-h-screen bg-rose-50 p-8">正在检查登录状态...</main>;
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-rose-50 p-6 text-zinc-800 sm:p-10">
        <section className="mx-auto max-w-lg rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
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
              className="mt-4 rounded-lg bg-rose-500 px-5 py-2 font-semibold text-white transition hover:bg-rose-600"
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
    <main className="min-h-screen bg-linear-to-b from-pink-50 via-rose-50 to-amber-50 p-6 text-zinc-800 sm:p-10">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold">产品上传后台</h1>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
            >
              退出登录
            </button>
          </div>
          <p className="mt-2 text-sm text-zinc-600">
            只需填写英文标题。英文描述暂时可选。图片可直接本地选择并上传到 Supabase Storage。
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
              英文标题（English Title）
              <input
                className={inputClass}
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
            </label>

            <label className="sm:col-span-2">
              图片 URL（可选）
              <input
                className={inputClass}
                value={form.imageUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="/products/cake-1.jpg"
              />
            </label>

            <div className="sm:col-span-2 rounded-lg border border-rose-100 bg-white p-4">
              <p className="text-sm font-semibold text-zinc-700">或从本地选择图片</p>
              <p className="mt-1 text-xs text-zinc-500">支持 jpg / png / webp / gif，大小不超过 5MB。</p>
              <label className="mt-3 inline-flex cursor-pointer items-center rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50">
                <input type="file" accept="image/*" className="hidden" onChange={onPickImage} />
                {uploadingImage ? "上传图片中..." : "选择本地图片"}
              </label>
            </div>

            {previewUrl ? (
              <div className="sm:col-span-2 rounded-lg border border-rose-100 bg-rose-50 p-4">
                <p className="text-sm font-semibold text-zinc-700">图片预览</p>
                <p className="mt-1 text-xs text-zinc-500">{previewUrl}</p>
                {canPreview ? (
                  <div className="mt-3 h-40 w-full max-w-xs overflow-hidden rounded-lg border border-rose-200 bg-white">
                    <img src={previewUrl} alt="产品预览图" className="h-full w-full object-cover" />
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

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-rose-500 px-5 py-2 font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-rose-300"
              >
                {saving ? "上传中..." : "上传产品"}
              </button>
            </div>
          </form>

          {message && <p className="mt-3 text-sm text-zinc-700">{message}</p>}
        </section>

        <section className="mt-6 rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">当前产品列表</h2>
          <ul className="mt-4 space-y-2 text-sm text-zinc-700">
            {products.map((item) => (
              <li key={item.id} className="flex items-center gap-3 rounded-lg border border-zinc-200 px-3 py-2">
                {item.imageUrl ? (
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-rose-100 bg-rose-50">
                    <img src={item.imageUrl} alt={item.titleI18n.zh} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="h-12 w-12 shrink-0 rounded-md border border-zinc-200 bg-zinc-50" />
                )}
                <div>
                  <p>
                    [{categoryLabels[item.category]}] {item.titleI18n.zh}
                  </p>
                  {item.imageUrl ? <p className="text-xs text-zinc-500">{item.imageUrl}</p> : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <Link href="/">Back to Home</Link>
    </main>
  );
}
