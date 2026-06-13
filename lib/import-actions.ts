'use server'

import { createClient } from '@/lib/supabase/server'

export interface ProductImportRow {
  sku:            string | null
  name:           string
  category:       string
  categories:     string[]
  price:          number
  original_price: number | null
  description:    string | null
  stock:          number
  badge:          'Oferta' | 'Nuevo' | null
  featured:       boolean
  active:         boolean
}

export interface ImportResult {
  inserted:  number
  upserted:  number
  error:     string | null
}

export async function exportProducts(): Promise<ProductImportRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('sku, name, category, categories, price, original_price, description, stock, badge, featured, active')
    .order('name')

  return (data ?? []).map(p => ({
    sku:            p.sku ?? null,
    name:           p.name,
    category:       p.category,
    categories:     p.categories ?? [p.category],
    price:          Number(p.price),
    original_price: p.original_price ? Number(p.original_price) : null,
    description:    p.description ?? null,
    stock:          p.stock,
    badge:          p.badge ?? null,
    featured:       p.featured,
    active:         p.active,
  }))
}

export async function importProducts(rows: ProductImportRow[]): Promise<ImportResult> {
  if (rows.length === 0) return { inserted: 0, upserted: 0, error: 'No hay filas para importar.' }

  const supabase = await createClient()

  const withSku    = rows.filter(r => r.sku)
  const withoutSku = rows.filter(r => !r.sku)

  // Rows with SKU → upsert (insert or update on conflict)
  if (withSku.length > 0) {
    const { error } = await supabase
      .from('products')
      .upsert(withSku, { onConflict: 'sku' })
    if (error) return { inserted: 0, upserted: 0, error: error.message }
  }

  // Rows without SKU → plain insert (always new)
  if (withoutSku.length > 0) {
    const { error } = await supabase.from('products').insert(withoutSku)
    if (error) return { inserted: 0, upserted: withSku.length, error: error.message }
  }

  return { inserted: withoutSku.length, upserted: withSku.length, error: null }
}
