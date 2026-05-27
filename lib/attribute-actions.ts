'use server'

import { createClient } from '@/lib/supabase/server'
import type { AttributeDefinition } from '@/lib/types'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function requireAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')
  return supabase
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function parseAttributeForm(formData: FormData) {
  const optionsRaw = (formData.get('options') as string) || ''
  return {
    name:        formData.get('name') as string,
    field_type:  formData.get('field_type') as AttributeDefinition['field_type'],
    options:     optionsRaw ? optionsRaw.split(',').map((o) => o.trim()).filter(Boolean) : [],
    category:    (formData.get('category') as string) || null,
    is_required: formData.get('is_required') === 'true',
    sort_order:  parseInt((formData.get('sort_order') as string) || '0'),
    active:      formData.get('active') === 'true',
  }
}

export async function getAttributeDefinitions(category?: string): Promise<AttributeDefinition[]> {
  const supabase = await createClient()
  let query = supabase
    .from('attribute_definitions')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true })
    .order('name',       { ascending: true })

  if (category) {
    query = query.or(`category.is.null,category.eq.${category}`)
  }

  const { data } = await query
  return data ?? []
}

export async function getAllAttributeDefinitions(): Promise<AttributeDefinition[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('attribute_definitions')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name',       { ascending: true })
  return data ?? []
}

export async function createAttribute(formData: FormData) {
  const supabase = await requireAuth()
  const parsed = parseAttributeForm(formData)
  const slug = slugify(parsed.name)

  const { error } = await supabase
    .from('attribute_definitions')
    .insert({ ...parsed, slug })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/atributos')
  redirect('/admin/atributos')
}

export async function updateAttribute(id: string, formData: FormData) {
  const supabase = await requireAuth()
  const { error } = await supabase
    .from('attribute_definitions')
    .update(parseAttributeForm(formData))
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/atributos')
  redirect('/admin/atributos')
}

export async function deleteAttribute(id: string) {
  const supabase = await requireAuth()
  const { error } = await supabase
    .from('attribute_definitions')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/atributos')
}

export async function toggleAttributeActive(id: string, active: boolean) {
  const supabase = await requireAuth()
  const { error } = await supabase
    .from('attribute_definitions')
    .update({ active })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/atributos')
}
