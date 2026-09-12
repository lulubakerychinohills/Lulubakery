# Course submission checklist — Lulu Bakery

对照作业要求的差距清单。代码侧大部分已齐；**你本人仍需完成**带 ★ 的项。

## 已覆盖（可直接在演示/文档中讲）

| 要求 | 本项目证据 |
|---|---|
| Home + 4+ pages | `/` `/about` `/privacy` `/order` `/sweet` `/sweet/photos` 分类页等 |
| Semantic HTML | `header` `nav` `main` `section` `article` `footer`（`SiteFooter`） |
| Skip link | `SkipLink` → `#main-content` |
| Sticky nav | `SiteHeader` `sticky` |
| Breadcrumbs | `/order`、分类页、`/sweet/photos`、`/about`、`/privacy` |
| Focus styles | `:focus-visible` in `globals.css` |
| Print CSS | `@media print` in `globals.css` |
| Design tokens | CSS variables：色板 / 字号 / spacing |
| Debounced search | Showcase 搜索 300ms + `filterProducts` |
| Modal | Order success `role="dialog"` |
| Form validation | 客户端 + 服务端 `validateOrderPayload` |
| Progressive enhancement | 真实路由、native `required`、文档说明 |
| Image perf | WebP、`loading="lazy"`、`sizes`、Sharp 上传压缩 |
| Tests ≥5 + a11y | `npm test` / `npm run test:a11y`（vitest + axe） |
| README + tech notes | `README.md`、`docs/technical-notes.md` |
| Design dossier | `docs/design-dossier.md` → 导出 PDF |
| A11y report skeleton | `docs/accessibility-report.md` |
| Deployed demo | Vercel 线上站 |
| Extra credit | PayPal、Admin/CMS、Supabase、i18n、邮件、sitemap/robots |

## ★ 你还需要亲手完成（评分材料）

1. **导出 Design Dossier PDF（4–8 页）**  
   打开 `docs/design-dossier.md` → 浏览器打印 / Pandoc → `docs/design-dossier.pdf`。

2. **Lighthouse + WAVE 截图**  
   在线上 URL 跑 Accessibility，把截图贴进 `docs/accessibility-report.md`（至少两种工具）。

3. **录 8–12 分钟演示视频**  
   讲架构、布局（Grid/Flex/sticky）、响应式、无障碍、搜索防抖、下单/PayPal、经验教训。讲稿见 `docs/presentation-outline.md`。

4. **PPT**  
   已有 `docs/Lulu-Bakery-Final-Presentation.pptx`，按 outline 核对页是否齐全后微调。

5. **提交包**  
   GitHub repo 链接 + 部署 URL + PDF/报告/视频/PPT（按课程要求打包 zip）。

## 可选加分（已有可强调）

- Next.js SSR/App Router  
- 后端 API（订单、PayPal、Admin）  
- 真实客户业务（Chino Hills bakery）
