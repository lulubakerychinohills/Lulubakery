# 蛋糕与甜点展示下单网站（Next.js）

这个项目实现了一个基础的展示 + 下单网站：

- 展示蛋糕与甜点作品
- 客人可选择尺寸、夹馅、糖分
- 客人可填写邮箱或手机号（至少一项）
- 提交后通过 SMTP 自动发邮件到你的收件箱

## 1) 安装与启动

```bash
npm install
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)

## 2) 配置环境变量（必须）

1. 复制环境变量模板：

```bash
cp .env.example .env.local
```

2. 编辑 `.env.local`，填入 SMTP + Supabase 信息：

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user@example.com
SMTP_PASS=your_smtp_password
SMTP_FROM=Lulu Cake Studio <your_smtp_user@example.com>
ORDER_NOTIFICATION_EMAIL=your_receive_email@example.com
ADMIN_PAGE_PASSWORD=change_this_admin_password
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_STORAGE_BUCKET=product-images
```

说明：

- `ORDER_NOTIFICATION_EMAIL`：你接收订单通知的邮箱
- `SMTP_FROM`：邮件发件人展示名
- `ADMIN_PAGE_PASSWORD`：后台上传产品页的登录密码
- `NEXT_PUBLIC_SUPABASE_URL` 与 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`：产品数据读写使用
- `SUPABASE_SERVICE_ROLE_KEY`：服务端上传 Supabase Storage 使用（不要暴露到前端）
- `SUPABASE_STORAGE_BUCKET`：图片桶名称（默认 `product-images`）
- 如果你用 QQ/163/Gmail，一般需要开启 SMTP 并使用“授权码”而不是登录密码

### PayPal 订金（订购页）

在 `.env.local` / Vercel 增加：

```env
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
PAYPAL_MODE=sandbox
NEXT_PUBLIC_PAYPAL_CURRENCY=USD
NEXT_PUBLIC_ORDER_DEPOSIT_USD=50.00
```

说明：

- 沙盒测试用 `PAYPAL_MODE=sandbox`，上线改为 `live`
- Client ID / Secret 在 [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications) 创建应用后获取
- `NEXT_PUBLIC_ORDER_DEPOSIT_USD` 为订金金额（美元），定制蛋糕无固定全款标价时先收订金

3. 在 Supabase SQL Editor 执行建表语句（最基础）：

```sql
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('men', 'women', 'kids')),
  image_url text,
  title text not null,
  description text not null,
  created_at timestamptz not null default now()
);

alter table public.products disable row level security;
```

4. 在 Supabase SQL Editor 创建公开图片桶（用于展示图片）：

```sql
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;
```

如果你想彻底重建为全新库（不保留旧数据），可以直接执行：

```sql
drop table if exists public.products;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('men', 'women', 'kids')),
  image_url text,
  title text not null,
  description text not null,
  created_at timestamptz not null default now()
);

alter table public.products disable row level security;
```

## 3) 后台产品上传页

- 地址：`/admin`
- 功能：密码登录后上传产品（分类 + 本地选图自动上传到 Supabase Storage + 英文标题 + 英文描述）
- 上传成功后，前台展示页会从接口拉取并显示新产品

## 4) 主要代码位置

- 页面与下单表单：`src/app/page.tsx` + `src/components/home-client.tsx`
- 共享导航 / 面包屑 / Skip link：`src/components/site-header.tsx`、`breadcrumbs.tsx`、`skip-link.tsx`
- 后台管理页：`src/app/admin/page.tsx`
- 下单 API：`src/app/api/orders/route.ts`
- 产品 API：`src/app/api/products/route.ts`
- 后台登录与上传 API：`src/app/api/admin/*`
- 后台图片上传 API：`src/app/api/admin/upload-image/route.ts`
- 邮件发送逻辑：`src/lib/email.ts`
- 产品存储逻辑：`src/lib/products.ts`
- 搜索过滤：`src/lib/product-search.ts`

## 5) 测试与课设文档

```bash
npm test          # unit + a11y smoke（多套件合计 ≥5 条）
npm run test:a11y # axe-core smoke
npm run build     # 生产构建
npm start         # 本地预览生产构建（需先 build）
```

### 功能概览（Features）

- 多页展示：首页、分类目录、甜品菜单/作品图、关于、隐私、订购
- 无障碍：Skip link、语义导航、sticky header、面包屑、`:focus-visible`、print CSS
- 交互：防抖搜索/分类过滤、订单表单校验、成功弹层、PayPal 订金
- 后台：`/admin` 上传产品到 Supabase
- SEO：`/sitemap.xml`、`/robots.txt`

### 部署（Deploy）

1. 推送到 GitHub；Vercel 连接仓库自动部署。  
2. 在 Vercel Production 配置与 `.env.local` 对应的环境变量（含 `NEXT_PUBLIC_SITE_URL`、PayPal Live 等）。  
3. 改 `NEXT_PUBLIC_*` 后必须 Redeploy。  
4. 细节见 `DEPLOY_CHECKLIST.md`（若存在）。

### 课设文档

- Design dossier（导出 PDF）：`docs/design-dossier.md`
- Accessibility / POUR 报告：`docs/accessibility-report.md`
- 技术说明：`docs/technical-notes.md`
- **提交差距清单**：`docs/course-submission-checklist.md`
- 演示讲稿：`docs/presentation-outline.md`
- PPT：`docs/Lulu-Bakery-Final-Presentation.pptx`

无障碍要点：Skip link、语义 `<nav>` / `<footer>`、sticky header、面包屑、防抖搜索、表单校验、成功弹层 ARIA、`:focus-visible`、print CSS。

提交前请在线上 URL 跑一遍 Lighthouse + WAVE，把截图贴进 `docs/accessibility-report.md` 或设计 PDF。

## 6) 已知限制（Limitations）

- `html[lang]` 未随语言选择器实时切换（页面文案会切换）。
- 成功弹层有 Esc 关闭与初始焦点；完整 Tab 焦点陷阱可再加强。
- Next.js Image runtime optimizer 在部分托管环境关闭（`unoptimized`）；产品图靠 Sharp 上传压缩 + WebP 静态资源。
- Admin 页面不纳入公开无障碍审计范围。

## 7) 可继续扩展

- 订单数据后台列表与状态流转
- 自动回复客人确认邮件
- 将 `html[lang]` 与语言选择器同步
- 产品详情 lightbox
