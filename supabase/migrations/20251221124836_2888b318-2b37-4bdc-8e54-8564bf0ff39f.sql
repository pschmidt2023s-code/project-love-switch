-- Delete existing demo data
DELETE FROM product_variants;
DELETE FROM products;
DELETE FROM categories;

-- Add missing columns to products table to match ALDENAIR structure
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS brand text,
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS size text,
ADD COLUMN IF NOT EXISTS scent_notes text[],
ADD COLUMN IF NOT EXISTS top_notes text[],
ADD COLUMN IF NOT EXISTS middle_notes text[],
ADD COLUMN IF NOT EXISTS base_notes text[],
ADD COLUMN IF NOT EXISTS ingredients text[],
ADD COLUMN IF NOT EXISTS inspired_by text,
ADD COLUMN IF NOT EXISTS ai_description text,
ADD COLUMN IF NOT EXISTS seasons text[],
ADD COLUMN IF NOT EXISTS occasions text[];

-- Add missing columns to product_variants table
ALTER TABLE product_variants 
ADD COLUMN IF NOT EXISTS name text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS in_stock boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS inspired_by_fragrance text,
ADD COLUMN IF NOT EXISTS image text,
ADD COLUMN IF NOT EXISTS ai_description text,
ADD COLUMN IF NOT EXISTS top_notes text[],
ADD COLUMN IF NOT EXISTS middle_notes text[],
ADD COLUMN IF NOT EXISTS base_notes text[],
ADD COLUMN IF NOT EXISTS ingredients text[];

-- Create categories based on ALDENAIR product structure
INSERT INTO categories (id, name, slug, description) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Herren', 'herren', 'Herrendüfte'),
  ('c1000000-0000-0000-0000-000000000002', '50ML Bottles', '50ml-bottles', '50ml Flakons Kollektion'),
  ('c1000000-0000-0000-0000-000000000003', 'Testerkits', 'testerkits', 'Probiersets und Tester'),
  ('c1000000-0000-0000-0000-000000000004', 'Sparkits', 'sparkits', 'Bundle-Sparpakete');