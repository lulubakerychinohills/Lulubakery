-- 将「甜品」分类下所有产品的展示序号统一设为 999（会排在大序号区；同号时仍按 created_at 降序）。
update public.products
set sort_order = 999
where category = 'sweet';
