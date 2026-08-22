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
  createdAt?: string;
};

type Notice = {
  kind: "success" | "error";
  text: string;
};

const categoryLabels: Record<CakeCategory, string> = {
  men: "男士",
  women: "女士",
  kids: "儿童",
  sweet: "甜品",
  other: "其他",
};

function NoticeBanner({ notice }: { notice: Notice }) {
  const isSuccess = notice.kind === "success";
  return (
    <div
      role="status"
      className={`mt-4 rounded-xl px-4 py-3 text-base font-semibold ${
        isSuccess
          ? "border-2 border-emerald-500 bg-emerald-50 text-emerald-900"
          : "border-2 border-rose-400 bg-rose-50 text-rose-900"
      }`}
    >
      {isSuccess ? "✓ " : "! "}
      {notice.text}
    </div>
  );
}

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [products, setProducts] = useState<CakeItem[]>([]);
  const [form, setForm] = useState({
    category: "women" as CakeCategory,
    imageUrl: "",
  });

  const loadProducts = async () => {
    try {
      const response = await fetch("/api/products", { cache: "no-store" });
      const result = (await response.json()) as { products?: CakeItem[] };
      if (response.ok && Array.isArray(result.products)) {
        const sorted = [...result.products].sort((a, b) => {
          const ta = Date.parse(a.createdAt || "") || 0;
          const tb = Date.parse(b.createdAt || "") || 0;
          return tb - ta;
        });
        setProducts(sorted);
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
    setNotice(null);
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
      setNotice({ kind: "success", text: "登录成功，可以上传产品了。" });
    } catch (error) {
      setNotice({
        kind: "error",
        text: error instanceof Error ? error.message : "登录失败。",
      });
    }
  };

  const onLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setNotice({ kind: "success", text: "已退出登录。" });
  };

  const onUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.imageUrl.trim()) {
      setNotice({ kind: "error", text: "请先选择并上传一张产品图片。" });
      return;
    }
    setNotice(null);
    setSaving(true);
    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: form.category,
          imageUrl: form.imageUrl,
          description: "",
        }),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(result.message || "上传失败。");
      }
      setNotice({ kind: "success", text: "产品上传成功！前台刷新后即可看到。" });
      setForm({ category: form.category, imageUrl: "" });
      await loadProducts();
    } catch (error) {
      setNotice({
        kind: "error",
        text: error instanceof Error ? error.message : "上传失败。",
      });
    } finally {
      setSaving(false);
    }
  };

  const onPickImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setNotice(null);
    if (selectedFile.size > MAX_IMAGE_UPLOAD_BYTES) {
      setNotice({ kind: "error", text: "图片须小于或等于 10MB，请压缩后重试。" });
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

      setForm((prev) => ({ ...prev, imageUrl: result.url! }));
      setNotice({ kind: "success", text: "图片已选好，确认分类后点「上传产品」。" });
    } catch (error) {
      setNotice({
        kind: "error",
        text: error instanceof Error ? error.message : "图片上传失败。",
      });
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const inputClass =
    "mt-1 w-full rounded-lg border border-[#D8D2C9] px-3 py-2 outline-none focus:border-[#8B776A]";
  const previewUrl = form.imageUrl.trim();

  if (checking) {
    return <main className="min-h-screen bg-[#F6F5F2] p-8">正在检查登录状态...</main>;
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-[#F6F5F2] p-6 text-zinc-800 sm:p-10">
        <section className="mx-auto max-w-lg rounded-2xl border border-[#D8D2C9] bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">产品管理登录</h1>
          <p className="mt-2 text-sm text-zinc-600">输入密码后即可上传产品。</p>
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
          {notice ? <NoticeBanner notice={notice} /> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-[#F8F7F5] via-[#F6F5F2] to-[#F3F1ED] p-6 text-zinc-800 sm:p-10">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-2xl border border-[#D8D2C9] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold">上传产品</h1>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="rounded-lg border border-[#D8D2C9] px-4 py-2 text-sm font-semibold text-[#5C4B43] transition hover:bg-[#F4F1EC]"
              >
                主页
              </Link>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-lg border border-[#D8D2C9] px-4 py-2 text-sm font-semibold text-[#5C4B43] transition hover:bg-[#F4F1EC]"
              >
                退出
              </button>
            </div>
          </div>
          <p className="mt-2 text-sm text-zinc-600">选分类 → 选图片 → 上传。新产品会排在最前面。</p>

          {notice ? <NoticeBanner notice={notice} /> : null}

          <form className="mt-6 grid gap-4" onSubmit={onUpload}>
            <label>
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

            <div className="rounded-lg border border-[#DDD6CE] bg-[#F4F1EC] p-4">
              <p className="text-sm font-semibold text-zinc-700">产品图片</p>
              <p className="mt-1 text-xs text-zinc-500">支持拍照或相册，单张 ≤ 10MB。</p>
              <label className="mt-3 inline-flex cursor-pointer items-center rounded-lg bg-[#5C4B43] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4D3F38]">
                <input type="file" accept=".heic,.heif,image/*" className="hidden" onChange={onPickImage} />
                {uploadingImage ? "上传中..." : previewUrl ? "重新选图" : "选择 / 拍摄图片"}
              </label>

              {previewUrl ? (
                <div className="relative mt-4 h-48 w-full max-w-xs overflow-hidden rounded-lg border border-[#D8D2C9] bg-white">
                  <Image
                    src={previewUrl}
                    alt="产品预览图"
                    fill
                    unoptimized={form.category === "sweet"}
                    loading="lazy"
                    decoding="async"
                    className="object-cover"
                    sizes="20rem"
                  />
                </div>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={saving || uploadingImage || !previewUrl}
              className="rounded-lg bg-[#5C4B43] px-5 py-3 text-base font-semibold text-white transition hover:bg-[#4D3F38] disabled:cursor-not-allowed disabled:bg-[#B8ADA3]"
            >
              {saving ? "上传中..." : "上传产品"}
            </button>
          </form>
        </section>

        <section className="mt-6 rounded-2xl border border-[#D8D2C9] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">已上传（{products.length}）</h2>
          <p className="mt-1 text-sm text-zinc-500">按上传时间，最新在上。</p>
          <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {products.map((item) => (
              <li key={item.id} className="overflow-hidden rounded-lg border border-zinc-200 bg-[#F4F1EC]">
                <div className="relative aspect-square">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={categoryLabels[item.category]}
                      fill
                      unoptimized={item.category === "sweet"}
                      loading="lazy"
                      decoding="async"
                      className="object-cover"
                      sizes="120px"
                    />
                  ) : null}
                </div>
                <p className="px-2 py-1 text-center text-xs text-zinc-600">{categoryLabels[item.category]}</p>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-[#5C4B43] underline-offset-2 hover:underline">
            返回首页
          </Link>
        </p>
      </div>
    </main>
  );
}
