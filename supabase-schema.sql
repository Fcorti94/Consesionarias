-- ============================================================
-- EcoAutoParts — Schema Supabase
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- Tabla de productos
create table public.products (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  category       text not null,
  price          numeric(12,2) not null,
  original_price numeric(12,2),
  image_url      text,
  description    text,
  stock          integer not null default 0,
  badge          text,
  variants       text[],
  rating         numeric(3,2) default 0,
  reviews        integer default 0,
  featured       boolean default false,
  active         boolean default true,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- Row Level Security
alter table public.products enable row level security;

-- Cualquiera puede leer productos activos
create policy "Lectura pública de productos activos"
  on public.products for select
  using (active = true);

-- Solo usuarios autenticados (admin) pueden crear/editar/borrar
create policy "Admin acceso completo"
  on public.products for all
  using (auth.role() = 'authenticated');

-- ============================================================
-- Storage
-- ============================================================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict do nothing;

create policy "Lectura pública de imágenes"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admin puede subir imágenes"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "Admin puede actualizar imágenes"
  on storage.objects for update
  using (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "Admin puede borrar imágenes"
  on storage.objects for delete
  using (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- ============================================================
-- Datos iniciales (los 16 productos originales)
-- ============================================================

insert into public.products (name, category, price, original_price, image_url, description, stock, badge, variants, rating, reviews, featured) values
(
  'Pastillas de Freno Brembo P06016', 'frenos', 45000, 56000,
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80&auto=format&fit=crop',
  'Pastillas de freno de alta performance Brembo. Excelente rendimiento en frenada y larga durabilidad. Aptas para uso urbano y deportivo. Incluye kit de montaje.',
  12, 'Oferta', ARRAY['Eje delantero', 'Eje trasero'], 4.8, 124, true
),
(
  'Filtro de Aceite Mann W 712/93', 'filtros', 8500, null,
  'https://images.unsplash.com/photo-1590765849552-c558e3bfd2a8?w=600&q=80&auto=format&fit=crop',
  'Filtro de aceite original Mann Filter. Alta capacidad de retención de partículas. Compatible con múltiples modelos de vehículos.',
  45, null, null, 4.9, 287, true
),
(
  'Amortiguador Monroe Reflex 376014SP', 'suspension', 38000, 47000,
  'https://images.unsplash.com/photo-1600706975631-8fec2ee1e40b?w=600&q=80&auto=format&fit=crop',
  'Amortiguador Monroe Reflex de alta calidad. Sistema de gas presurizado para máximo confort y control. Par delantero disponible.',
  8, 'Oferta', ARRAY['Delantero izq.', 'Delantero der.', 'Trasero izq.', 'Trasero der.'], 4.7, 89, true
),
(
  'Bujías NGK Iridium IX BKR6EIX', 'motor', 14500, null,
  'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80&auto=format&fit=crop',
  'Bujías de iridio NGK para máximo rendimiento. Mayor duración que las bujías convencionales. Kit de 4 unidades.',
  30, 'Nuevo', ARRAY['Kit x4', 'Kit x6', 'Kit x8'], 4.9, 412, true
),
(
  'Batería Moura M60FD 60Ah', 'electricidad', 88000, 105000,
  'https://images.unsplash.com/photo-1609175332497-a00a85b5b1ef?w=600&q=80&auto=format&fit=crop',
  'Batería sellada de alta capacidad 60Ah. Libre de mantenimiento, alta resistencia a vibraciones. Garantía 12 meses.',
  5, 'Oferta', null, 4.6, 63, true
),
(
  'Correa de Distribución Gates K015558XS', 'motor', 28000, null,
  'https://images.unsplash.com/photo-1632823471565-1ecdf5c6da3e?w=600&q=80&auto=format&fit=crop',
  'Correa de distribución Gates de alta resistencia. Incluye tensor y rodillo. Compatible con motores 1.6 y 2.0.',
  18, null, ARRAY['Solo correa', 'Kit completo con tensor'], 4.8, 156, false
),
(
  'Faro LED Delantero Universal H4', 'iluminacion', 62000, 75000,
  'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=80&auto=format&fit=crop',
  'Par de faros LED de alta intensidad. 8000 lumens por unidad. Temperatura de color 6000K. Diseño aerodinámico.',
  7, 'Oferta', ARRAY['Par completo', 'Unidad'], 4.5, 48, true
),
(
  'Aceite Motor Mobil 10W40 4 litros', 'aceites', 19500, null,
  'https://images.unsplash.com/photo-1632286338908-ab1b765e6b56?w=600&q=80&auto=format&fit=crop',
  'Aceite de motor semisintético Mobil 1 10W40. Protección superior para motores a nafta y diesel. Reduce el desgaste.',
  60, null, ARRAY['4 litros', '5 litros', '20 litros'], 4.8, 524, true
),
(
  'Bomba de Agua Gates WP0015', 'motor', 44000, 52000,
  'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80&auto=format&fit=crop',
  'Bomba de agua de aluminio con rodamiento sellado. Alta durabilidad y bajo nivel de ruido. Incluye junta original.',
  11, 'Oferta', null, 4.7, 74, false
),
(
  'Kit de Embrague Valeo 826401', 'motor', 128000, 155000,
  'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80&auto=format&fit=crop',
  'Kit completo de embrague Valeo. Incluye disco, plato y rodamiento. Para motores de 1.4 a 2.0. Instalación profesional recomendada.',
  4, 'Oferta', null, 4.9, 38, false
),
(
  'Sensor de Oxígeno Bosch 0258003477', 'electricidad', 24000, null,
  'https://images.unsplash.com/photo-1609175332497-a00a85b5b1ef?w=600&q=80&auto=format&fit=crop',
  'Sensor lambda Bosch de banda ancha. Medición precisa de la mezcla aire-combustible. Compatible con múltiples modelos.',
  22, 'Nuevo', ARRAY['Precatalizador', 'Postcatalizador'], 4.6, 91, false
),
(
  'Discos de Freno Brembo 09.4739.11', 'frenos', 52000, 64000,
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80&auto=format&fit=crop',
  'Discos de freno ventilados Brembo de alto rendimiento. Par delantero. Mayor resistencia al calor y a la deformación.',
  6, 'Oferta', ARRAY['Par delantero', 'Par trasero'], 4.8, 102, false
),
(
  'Filtro de Aire Mann C 3698', 'filtros', 7200, null,
  'https://images.unsplash.com/photo-1590765849552-c558e3bfd2a8?w=600&q=80&auto=format&fit=crop',
  'Filtro de aire de panel Mann Filter. Alta eficiencia de filtrado. Protege el motor de partículas y polvo.',
  35, null, null, 4.7, 198, false
),
(
  'Bujes de Suspensión Poliuretano Kit', 'suspension', 18500, 22000,
  'https://images.unsplash.com/photo-1600706975631-8fec2ee1e40b?w=600&q=80&auto=format&fit=crop',
  'Kit de bujes de poliuretano de alta durabilidad. Mayor precisión en la dirección. Resistente a aceites y grasa.',
  15, null, ARRAY['Kit delantero', 'Kit trasero', 'Kit completo'], 4.5, 67, false
),
(
  'Refrigerante Prestone 50% x 4L', 'aceites', 12000, null,
  'https://images.unsplash.com/photo-1632286338908-ab1b765e6b56?w=600&q=80&auto=format&fit=crop',
  'Refrigerante concentrado al 50% listo para usar. Protección hasta -37°C. Previene la corrosión en el sistema de enfriamiento.',
  50, null, ARRAY['4 litros', '20 litros'], 4.9, 311, false
),
(
  'Bomba de Nafta Bosch 0580463017', 'motor', 51000, 62000,
  'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80&auto=format&fit=crop',
  'Bomba de combustible eléctrica Bosch. Alta fiabilidad y presión constante. Incluye kit de montaje y filtro.',
  9, 'Oferta', null, 4.7, 55, false
);
