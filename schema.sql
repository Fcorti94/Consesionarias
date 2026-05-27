-- ============================================================
-- Template de Tienda — Database Schema
-- Ejecutar en el SQL Editor de Supabase 
-- ============================================================

-- ============================================================
-- 1. PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id             UUID           DEFAULT gen_random_uuid() PRIMARY KEY,
  name           TEXT           NOT NULL,
  category       TEXT           NOT NULL,
  price          NUMERIC(12,2)  NOT NULL,
  original_price NUMERIC(12,2),
  image_url      TEXT,
  description    TEXT,
  stock          INTEGER        NOT NULL DEFAULT 0,
  badge          TEXT           CHECK (badge IN ('Oferta', 'Nuevo')),
  variants       TEXT[]         DEFAULT '{}',
  attributes     JSONB          DEFAULT '{}',
  rating         NUMERIC(3,1)   DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reviews        INTEGER        DEFAULT 0,
  featured       BOOLEAN        DEFAULT false,
  active         BOOLEAN        DEFAULT true,
  created_at     TIMESTAMPTZ    DEFAULT now(),
  updated_at     TIMESTAMPTZ    DEFAULT now()
);

-- Si la tabla ya existe, agregar la columna attributes si falta
ALTER TABLE products ADD COLUMN IF NOT EXISTS attributes  JSONB    DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_urls  TEXT[]   DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS categories  TEXT[]   DEFAULT '{}';

-- Migrate variants from TEXT[] to JSONB (each variant gets stock: 0)
ALTER TABLE products
  ALTER COLUMN variants TYPE JSONB
  USING (
    CASE
      WHEN variants IS NULL OR array_length(variants, 1) IS NULL THEN NULL
      ELSE (SELECT jsonb_agg(jsonb_build_object('name', v, 'stock', 0))
            FROM unnest(variants) AS v)
    END
  );

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_active_products" ON products
  FOR SELECT USING (active = true);

CREATE POLICY "admin_all_products" ON products
  FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ============================================================
-- 2. SITE CONFIG (una sola fila por deployment)
-- ============================================================
CREATE TABLE IF NOT EXISTS site_config (
  id                   SMALLINT    PRIMARY KEY DEFAULT 1,
  brand_name           TEXT        NOT NULL DEFAULT 'Mi Tienda',
  brand_tagline        TEXT        NOT NULL DEFAULT 'Tu tienda de confianza',
  primary_color        TEXT        NOT NULL DEFAULT '#f97316',
  primary_hover_color  TEXT        NOT NULL DEFAULT '#ea580c',
  phone                TEXT        NOT NULL DEFAULT '',
  whatsapp             TEXT        NOT NULL DEFAULT '',
  email                TEXT        NOT NULL DEFAULT '',
  address              TEXT        NOT NULL DEFAULT '',
  hero_title           TEXT        NOT NULL DEFAULT 'Todo lo que necesitás',
  hero_subtitle        TEXT        NOT NULL DEFAULT 'Los mejores productos al mejor precio.',
  hero_image_url       TEXT        NOT NULL DEFAULT '',
  shipping_free_from   INTEGER     NOT NULL DEFAULT 50000,
  installments         INTEGER     NOT NULL DEFAULT 12,
  footer_text          TEXT        NOT NULL DEFAULT '',
  updated_at           TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Columnas adicionales para contenido configurable del sitio
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS brand_logo_url   TEXT NOT NULL DEFAULT '';
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS instagram        TEXT NOT NULL DEFAULT '';
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS hero_badge_text  TEXT NOT NULL DEFAULT '⚡ Envíos en 24–48 hs a todo el país';
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS hero_cta_text    TEXT NOT NULL DEFAULT 'Ver todos los productos';
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS hero_stats       JSONB;
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS trust_items      JSONB;
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS promo_title      TEXT NOT NULL DEFAULT 'Hasta 30% OFF en frenos y suspensión';
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS promo_subtitle   TEXT NOT NULL DEFAULT 'Por tiempo limitado. Stock sujeto a disponibilidad.';
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS promo_image_url  TEXT NOT NULL DEFAULT '';
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS promo_cta_text   TEXT NOT NULL DEFAULT 'Aprovechar oferta';
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS promo_cta_link   TEXT NOT NULL DEFAULT '/productos?categoria=frenos';
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS brands           JSONB;
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS categories       JSONB;
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS faq_items        JSONB;
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS dark_mode        BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS show_hero        BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS show_trust_bar   BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS show_promo       BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS show_categories  BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS show_brands      BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS show_featured    BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS show_contact_cta BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS section_order    JSONB;

-- Insertar fila por defecto si no existe
INSERT INTO site_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_site_config" ON site_config
  FOR SELECT USING (true);

CREATE POLICY "admin_update_site_config" ON site_config
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);


-- ============================================================
-- 3. ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id               UUID           DEFAULT gen_random_uuid() PRIMARY KEY,
  mp_payment_id    TEXT           UNIQUE,
  mp_preference_id TEXT,
  status           TEXT           NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','approved','rejected','cancelled','refunded')),
  buyer_name       TEXT,
  buyer_surname    TEXT,
  buyer_email      TEXT,
  buyer_phone      TEXT,
  items            JSONB          NOT NULL DEFAULT '[]',
  total            NUMERIC(12,2)  NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ    DEFAULT now(),
  updated_at       TIMESTAMPTZ    DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_orders" ON orders
  FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ============================================================
-- 4. ATTRIBUTE DEFINITIONS
-- Admin define qué características tienen los productos
-- ============================================================
CREATE TABLE IF NOT EXISTS attribute_definitions (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT        NOT NULL,
  slug        TEXT        UNIQUE NOT NULL,
  field_type  TEXT        NOT NULL DEFAULT 'text'
                CHECK (field_type IN ('text', 'number', 'textarea', 'select', 'multiselect')),
  options     TEXT[]      DEFAULT '{}',
  category    TEXT,       -- NULL = aplica a todas las categorías
  is_required BOOLEAN     DEFAULT false,
  sort_order  INTEGER     DEFAULT 0,
  active      BOOLEAN     DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE attribute_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_active_attribute_definitions" ON attribute_definitions
  FOR SELECT USING (active = true);

CREATE POLICY "admin_all_attribute_definitions" ON attribute_definitions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ============================================================
-- 5. STORAGE
-- Ejecutar esto también (o crear los buckets desde el dashboard)
-- ============================================================

-- Bucket para imágenes de productos (ProductForm)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "public_read_product_images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "admin_upload_product_images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "admin_delete_product_images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'product-images');

-- Bucket para imágenes de configuración (hero, promo, logos, marcas)
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "public_read_uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads');

CREATE POLICY "admin_upload_uploads" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "admin_delete_uploads" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'uploads');
