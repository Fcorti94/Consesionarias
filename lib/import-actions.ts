'use server'

import { createClient } from '@/lib/supabase/server'

export interface ProductImportRow {
  name: string
  category: string
  categories: string[]
  price: number
  original_price: number | null
  description: string | null
  stock: number
  badge: 'Oferta' | 'Nuevo' | null
  featured: boolean
  active: boolean
}

export async function importProducts(
  rows: ProductImportRow[],
): Promise<{ inserted: number; error: string | null }> {
  if (rows.length === 0) return { inserted: 0, error: 'No hay filas para importar.' }

  const supabase = await createClient()
  const { error } = await supabase.from('products').insert(rows)

  if (error) return { inserted: 0, error: error.message }
  return { inserted: rows.length, error: null }
}
