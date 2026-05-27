'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function requireAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')
  return supabase
}

function parseProductForm(formData: FormData) {
  // Variants with per-variant stock
  const variants = (() => {
    try {
      const raw = formData.get('variants_json') as string
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed) || parsed.length === 0) return null
      return parsed.filter((v: { name?: string }) => v.name?.trim())
    } catch { return null }
  })()

  const stock = variants
    ? variants.reduce((s: number, v: { stock: number }) => s + (v.stock || 0), 0)
    : parseInt(formData.get('stock') as string) || 0

  // Campos marcados como multiselect via campo oculto attr_multi_fields
  const multiFields = ((formData.get('attr_multi_fields') as string) || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const attributes: Record<string, string | string[]> = {}
  for (const key of new Set(formData.keys())) {
    if (!key.startsWith('attr_') || key === 'attr_multi_fields') continue
    const slug = key.slice(5)
    attributes[slug] = multiFields.includes(slug)
      ? (formData.getAll(key) as string[])
      : (formData.get(key) as string)
  }

  const categories = (() => {
    try {
      const raw = formData.get('categories_json') as string
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.filter(Boolean) : []
    } catch { return [] }
  })()
  const category = categories[0] || (formData.get('category') as string) || ''

  return {
    name:           formData.get('name') as string,
    category,
    categories,
    price:          parseFloat(formData.get('price') as string),
    original_price: formData.get('original_price')
      ? parseFloat(formData.get('original_price') as string)
      : null,
    image_urls: (() => {
      try { const r = formData.get('image_urls') as string; const p = JSON.parse(r); return Array.isArray(p) ? p : [] } catch { return [] }
    })(),
    image_url:    (formData.get('image_url') as string) || null,
    description:  (formData.get('description') as string) || null,
    stock,
    badge:        (formData.get('badge') as string) || null,
    variants,
    attributes,
    rating:   parseFloat((formData.get('rating') as string) || '0'),
    reviews:  parseInt((formData.get('reviews') as string) || '0'),
    featured: formData.get('featured') === 'true',
    active:   formData.get('active') === 'true',
  }
}

function revalidateAll() {
  revalidatePath('/')
  revalidatePath('/productos')
  revalidatePath('/admin')
}

export async function createProduct(formData: FormData) {
  const supabase = await requireAuth()
  const { error } = await supabase.from('products').insert(parseProductForm(formData))
  if (error) throw new Error(error.message)
  revalidateAll()
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await requireAuth()
  const { error } = await supabase
    .from('products')
    .update({ ...parseProductForm(formData), updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidateAll()
}

export async function deleteProduct(id: string) {
  const supabase = await requireAuth()
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidateAll()
}

export async function toggleProductActive(id: string, active: boolean) {
  const supabase = await requireAuth()
  const { error } = await supabase
    .from('products')
    .update({ active, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}
