-- 非「甜品」分类统一序号为 1；甜品统一为 999。
-- 查询按 sort_order 升序时，甜品会出现在最后；同为 1 的商品之间按 created_at 降序（见 readProducts）。
update public.products
set sort_order = 1
where category <> 'sweet';

update public.products
set sort_order = 999
where category = 'sweet';
