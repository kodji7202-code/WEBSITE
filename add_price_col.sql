-- Add default_price column to kit_types
alter table public.kit_types 
add column default_price numeric default 29.99;

-- Update specific prices (Example defaults, can be changed)
-- You can run specific updates here if you know the prices, e.g.:
-- update public.kit_types set default_price = 19.99 where name = 'One Shot Kit';
