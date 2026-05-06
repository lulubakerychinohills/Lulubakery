-- 产品展示顺序：数值越小越靠前；相同序号时按创建时间新的在前。
alter table public.products
  add column if not exists sort_order integer not null default 0;

create index if not exists products_sort_order_created_at_idx
  on public.products (sort_order asc, created_at desc);
